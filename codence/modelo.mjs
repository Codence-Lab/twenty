/**
 * modelo.mjs — qué es un prospecto de Codence, declarado una vez.
 *
 * Heredero directo de scripts/campos-prospecto.mjs del repo codence-auditorias,
 * que se borró el 07/08/2026. La doctrina no cambió: los campos se declaran en
 * UN solo lugar y de ahí sale todo. Cambió el motor — antes derivábamos la
 * ficha, el formulario y las validaciones a mano; ahora eso lo da Twenty y este
 * archivo solo tiene que empujar el esquema por la Metadata API.
 *
 * MODELO NATIVO, decidido el 07/08. La empresa es Company, el decisor es Person
 * y el outbound es una Opportunity cuyo `stage` es el Estado. Se eligió sobre un
 * objeto plano propio porque Twenty ya resuelve 11 de los 21 campos, y porque el
 * pipeline en Kanban sale gratis de `stage`.
 *
 * Las taxonomías salen de datos/taxonomias.json del repo viejo, sin inventar
 * ninguna opción: las de `gradoConexion` se recuperaron del historial de git.
 *
 *   node codence/modelo.mjs --ensayo   muestra qué haría, no escribe
 *   node codence/modelo.mjs            lo aplica
 *
 * Es idempotente: un campo que ya existe se saltea. Correrlo dos veces no
 * duplica nada ni pisa datos.
 */

const URL_BASE = process.env.TWENTY_URL ?? 'http://localhost:3000';
const CLAVE = process.env.TWENTY_KEY;

if (!CLAVE) {
  console.error('Falta TWENTY_KEY. Se genera en Ajustes → API y Webhooks.');
  process.exit(1);
}

const ensayo = process.argv.includes('--ensayo');

/* ── Las taxonomías ──────────────────────────────────────────────────────── */

const ESTADO = [
  'Por investigar',
  'Calificado',
  'Contactado',
  'Seguimiento 1',
  'Seguimiento 2',
  'Respondió',
  'Convertido',
  'Sin interés',
  'Descalificado',
];

const CANAL = ['LinkedIn', 'Email', 'WhatsApp'];
const INDUSTRIA = ['Fintech', 'Logística', 'B2B / SaaS', 'Otro'];
/* El valor interno va explícito porque Twenty exige UPPER_SNAKE_CASE empezando
 * por letra, y "1º" derivaría a "1", que rechaza. El rótulo visible es el que
 * usabas: se lee "1º" en la ficha igual que antes. */
const GRADO = [
  { label: '1º', value: 'GRADO_1' },
  { label: '2º', value: 'GRADO_2' },
  { label: '3º', value: 'GRADO_3' },
  { label: 'Sin conexión', value: 'SIN_CONEXION' },
];
const ANGULO = [
  'Proceso manual',
  'Dependencia de persona clave',
  'Volumen sin sistema',
  'Crecimiento reciente',
  'Demanda declarada',
  'Otro',
];
const SERVICIO = ['Rebranding', 'Diseño web', 'Software a medida', 'Automatización AI-native'];

/* Los estados terminales van en gris y los de avance en la escala fría → cálida,
 * para que el Kanban se lea de un vistazo. No es decoración: `Convertido`,
 * `Sin interés` y `Descalificado` son terminales y tienen que distinguirse de
 * un vistazo de los que todavía se trabajan. */
const COLOR_ESTADO = {
  'Por investigar': 'gray',
  Calificado: 'blue',
  Contactado: 'purple',
  'Seguimiento 1': 'sky',
  'Seguimiento 2': 'turquoise',
  Respondió: 'yellow',
  Convertido: 'green',
  'Sin interés': 'gray',
  Descalificado: 'gray',
};

const PALETA = ['blue', 'purple', 'sky', 'turquoise', 'green', 'yellow', 'orange', 'red', 'gray'];

/**
 * Twenty guarda el valor interno en MAYÚSCULA_CON_GUIONES y muestra el rótulo.
 * El rótulo es el que ya usabas; el valor es derivado, así que renombrar la
 * etiqueta visible nunca rompe los datos.
 */
const aValor = (etiqueta) =>
  etiqueta
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();

/** Acepta strings —el valor se deriva del rótulo— o {label, value} cuando el
 *  derivado no sería válido. Ver GRADO. */
const opciones = (lista, colores) =>
  lista.map((item, i) => {
    const label = typeof item === 'string' ? item : item.label;
    const value = typeof item === 'string' ? aValor(item) : item.value;
    return {
      label,
      value,
      position: i,
      color: colores?.[label] ?? PALETA[i % PALETA.length],
    };
  });

/* ── La declaración ──────────────────────────────────────────────────────── */

const CAMPOS = [
  {
    objeto: 'company',
    name: 'industria',
    label: 'Industria',
    type: 'SELECT',
    icon: 'IconBuildingFactory',
    description: 'Las tres declaradas en contexto-outbound más Otro. Una empresa fuera de las tres entra por la señal, no por el rubro.',
    options: opciones(INDUSTRIA),
  },
  {
    objeto: 'person',
    name: 'gradoConexion',
    label: 'Grado de conexión',
    type: 'SELECT',
    icon: 'IconUsersGroup',
    description: '1º es DM libre. 2º y 3º son nota de conexión: 300 caracteres, límite de la plataforma. Se lee en el propio perfil, no se deduce.',
    options: opciones(GRADO),
  },

  /* El outbound entero cuelga de Opportunity. `stage` ya existe y se reescribe
   * aparte, más abajo: es un campo nativo, no uno nuevo. */
  {
    objeto: 'opportunity',
    name: 'canal',
    label: 'Canal',
    type: 'SELECT',
    icon: 'IconSend',
    description: 'Por dónde sale el mensaje. Una puerta es un canal solamente si el mensaje aterriza en alguien que podría decir que sí.',
    options: opciones(CANAL),
  },
  {
    objeto: 'opportunity',
    name: 'senal',
    label: 'Señal',
    type: 'TEXT',
    icon: 'IconRadar',
    description: 'La observación específica y verificable que justifica el contacto. Ningún mensaje sale sin una, con su fuente.',
  },
  {
    objeto: 'opportunity',
    name: 'fuente',
    label: 'Fuente',
    type: 'LINKS',
    icon: 'IconLink',
    description: 'Dónde se vio la señal. Tiene que haberse abierto: un listado de resultados no es una fuente.',
  },
  {
    objeto: 'opportunity',
    name: 'angulo',
    label: 'Ángulo',
    type: 'SELECT',
    icon: 'IconTargetArrow',
    description: 'Qué observación se usó para abrir. Es lo que permite comparar qué mensaje funciona.',
    options: opciones(ANGULO),
  },
  {
    objeto: 'opportunity',
    name: 'servicio',
    label: 'Servicio',
    type: 'MULTI_SELECT',
    icon: 'IconBriefcase',
    description: 'Qué le vendería Codence. Admite varios.',
    options: opciones(SERVICIO),
  },
  {
    objeto: 'opportunity',
    name: 'toques',
    label: 'Toques',
    type: 'NUMBER',
    icon: 'IconHandClick',
    description: 'Cuántos mensajes salieron. Después del tercero sin respuesta no se agenda otro.',
  },
  {
    objeto: 'opportunity',
    name: 'ultimoToque',
    label: 'Último toque',
    type: 'DATE',
    icon: 'IconCalendarUp',
  },
  {
    objeto: 'opportunity',
    name: 'proximoToque',
    label: 'Próximo toque',
    type: 'DATE',
    icon: 'IconCalendarDue',
    description: 'La cola del día son las tarjetas con esta fecha en hoy o antes. Cuatro días entre toques.',
  },
  {
    objeto: 'opportunity',
    name: 'calificadoEn',
    label: 'Calificado el',
    type: 'DATE',
    icon: 'IconCalendarCheck',
  },
  {
    objeto: 'opportunity',
    name: 'auditoria',
    label: 'Auditoría',
    type: 'LINKS',
    icon: 'IconFileText',
    description: 'La URL de la versión web, cuando el prospecto se convirtió.',
  },
];

/* ── El cliente ──────────────────────────────────────────────────────────── */

async function api(ruta, opts = {}) {
  const r = await fetch(`${URL_BASE}/rest/metadata${ruta}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${CLAVE}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  const texto = await r.text();
  let cuerpo;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    cuerpo = texto;
  }
  if (!r.ok) {
    const detalle = typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo);
    throw new Error(`HTTP ${r.status} en ${ruta} — ${detalle.slice(0, 400)}`);
  }
  return cuerpo;
}

const desenvolver = (j) => j?.data?.objects ?? j?.objects ?? j?.data ?? j;

async function main() {
  const objetos = desenvolver(await api('/objects?limit=60'));

  const porNombre = Object.fromEntries(objetos.map((o) => [o.nameSingular, o]));
  for (const n of ['company', 'person', 'opportunity']) {
    if (!porNombre[n]) throw new Error(`No existe el objeto ${n}`);
  }

  console.log(ensayo ? '── ENSAYO, no se escribe nada ──\n' : '── Aplicando ──\n');

  let creados = 0;
  let salteados = 0;

  for (const campo of CAMPOS) {
    const obj = porNombre[campo.objeto];
    const yaEsta = (obj.fields ?? []).some((f) => f.name === campo.name);

    if (yaEsta) {
      console.log(`  =  ${campo.objeto}.${campo.name} ya existe, se saltea`);
      salteados++;
      continue;
    }

    const { objeto, ...resto } = campo;
    const cuerpo = { ...resto, objectMetadataId: obj.id };

    if (ensayo) {
      const detalle = campo.options ? ` (${campo.options.length} opciones)` : '';
      console.log(`  +  ${objeto}.${campo.name}  ${campo.type}${detalle}`);
      creados++;
      continue;
    }

    await api('/fields', { method: 'POST', body: JSON.stringify(cuerpo) });
    console.log(`  +  ${objeto}.${campo.name}  ${campo.type}`);
    creados++;
  }

  /* El Estado no es un campo nuevo: es `stage`, que ya existe con las cinco
   * etapas de ejemplo de Twenty. Se reescriben sus opciones por las nuestras.
   * Ojo — esto pisa las etapas de fábrica, y es a propósito: el pipeline de
   * Codence es el Estado del outbound, no "New / Screening / Meeting". */
  const stage = (porNombre.opportunity.fields ?? []).find((f) => f.name === 'stage');
  const nuestras = opciones(ESTADO, COLOR_ESTADO);
  const yaMigrado =
    stage.options?.length === nuestras.length &&
    stage.options.every((o, i) => o.label === nuestras[i].label);

  if (yaMigrado) {
    console.log('\n  =  opportunity.stage ya tiene los estados de Codence');
  } else if (ensayo) {
    console.log(`\n  ~  opportunity.stage: ${stage.options.length} etapas de fábrica → ${nuestras.length} estados de Codence`);
    console.log('     ' + ESTADO.join(' → '));
  } else {
    /* El defaultValue va sí o sí en el mismo PATCH: el de fábrica es 'NEW' y
     * deja de existir al reemplazar las opciones, así que sin esto la API
     * rechaza el cambio entero. El inicial es el rol `inicial` de la taxonomía
     * vieja — la tarjeta nace en Por investigar, no en un estado avanzado. */
    await api(`/fields/${stage.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        label: 'Estado',
        options: nuestras,
        defaultValue: `'${nuestras[0].value}'`,
      }),
    });
    console.log(`\n  ~  opportunity.stage → Estado, ${nuestras.length} opciones`);
  }

  console.log(`\n${creados} campo(s) ${ensayo ? 'a crear' : 'creados'}, ${salteados} ya existían.`);
}

main().catch((e) => {
  console.error('\n✗ ' + e.message);
  process.exit(1);
});
