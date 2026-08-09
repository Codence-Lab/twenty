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
/* TWENTY_API_KEY es la que ya está en el entorno de usuario de Windows porque
 * la consume el servidor MCP declarado en .mcp.json. Es la misma credencial, así
 * que se acepta como alternativa y no hay que declararla dos veces. */
const CLAVE = process.env.TWENTY_KEY ?? process.env.TWENTY_API_KEY;

if (!CLAVE) {
  console.error('Falta TWENTY_KEY (o TWENTY_API_KEY). Se genera en Ajustes → API y Webhooks.');
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
/* El circuito de aprobación del canal Email. Es un estado y no prosa en una
 * Note a propósito: se filtra, se ordena y se ve en el Kanban, que es lo que
 * convierte a Twenty en la bandeja de aprobación en vez de en un archivo. */
const APROBACION = [
  'Sin borrador',
  'Redactado',
  'Aprobado',
  'En Gmail',
  'Enviado',
  'Descartado',
];
/* El valor interno va explícito porque Twenty exige UPPER_SNAKE_CASE empezando
 * por letra, y "1º" derivaría a "1", que rechaza. El rótulo visible es el que
 * usabas: se lee "1º" en la ficha igual que antes. */
const GRADO = [
  { label: '1º', value: 'GRADO_1' },
  { label: '2º', value: 'GRADO_2' },
  { label: '3º', value: 'GRADO_3' },
  { label: 'Sin conexión', value: 'SIN_CONEXION' },
];
/* Un ángulo por dolor de `senales.md`, más los tres de fricción que venían del
 * sistema viejo. `Marca que no acompaña` es el dolor de marca: existía en el
 * catálogo desde el 31/07 y no tenía ángulo, así que Datcisions —cuya única
 * señal es de marca— quedaba en `Otro`, que no compara contra nada.
 *
 * `Presencia que no vende` se agregó el 08/08 por la misma razón y es el que
 * mapea a Diseño web: sin sitio propio, un sitio donde no se puede comprar ni
 * agendar, una puerta que muere sin nada del otro lado. Antes caía en `Proceso
 * manual`, que describe otra cosa — le pasó a Amarras 11, que no tiene sitio. */
const ANGULO = [
  'Proceso manual',
  'Dependencia de persona clave',
  'Volumen sin sistema',
  'Crecimiento reciente',
  'Demanda declarada',
  'Marca que no acompaña',
  'Presencia que no vende',
  'Otro',
];
const SERVICIO = ['Rebranding', 'Diseño web', 'Software a medida', 'Automatización AI-native'];

/* La bandeja de entrada, agregada el 08/08. Una pista es material crudo que
 * todavía no es un prospecto: un enlace, un padrón, una captura, una idea.
 * Existe porque hasta ahora eso no tenía dónde caer y se perdía en la
 * conversación. Es también la puerta por donde entra lo que el agente no puede
 * leer solo: LinkedIn e Instagram no se tocan con navegador automatizado, pero
 * Alan sí los ve, y una captura suya entra por acá. */
const TIPO_PISTA = ['Prospecto posible', 'Fuente o padrón', 'Idea', 'Referencia'];
const ESTADO_PISTA = ['Sin mirar', 'En cola', 'Usada', 'Descartada'];

/* Amarillo es lo que espera a que alguien la mire, azul lo que ya está en la
 * cola de una corrida, y gris lo cerrado — la misma lógica de color que el
 * Estado y la Aprobación. */
const COLOR_ESTADO_PISTA = {
  'Sin mirar': 'yellow',
  'En cola': 'blue',
  Usada: 'green',
  Descartada: 'gray',
};

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

/* Amarillo es lo que espera a Alan, azul lo que espera a la máquina, violeta lo
 * que está en vuelo y verde lo cerrado. Es la misma lógica que el Estado: mirar
 * la columna tiene que alcanzar para saber de quién es el próximo movimiento. */
const COLOR_APROBACION = {
  'Sin borrador': 'gray',
  Redactado: 'yellow',
  Aprobado: 'blue',
  'En Gmail': 'purple',
  Enviado: 'green',
  Descartado: 'gray',
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

/* Los objetos propios. Company, Person y Opportunity son nativos de Twenty y no
 * se declaran acá: sólo se les agregan campos. Un objeto propio, en cambio, hay
 * que crearlo, y al crearlo aparece como entrada en la barra lateral izquierda.
 *
 * Crear el objeto le agrega solo las relaciones por defecto —adjuntos, notas,
 * tareas y línea de tiempo—, así que una Pista acepta capturas arrastradas sin
 * que haya que declarar ningún campo de archivo. */
const OBJETOS = [
  {
    nameSingular: 'pista',
    namePlural: 'pistas',
    labelSingular: 'Pista',
    labelPlural: 'Pistas',
    icon: 'IconBulb',
    description:
      'Material crudo que todavía no es un prospecto: un enlace, un padrón, una captura, una idea. /buscar las lee antes de salir a buscar nada.',
  },
];

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
  /* Qué documento de argumento se le mandó. Es LINKS y no SELECT a propósito:
   * cada página se escribe para ese prospecto, así que no hay taxonomía que
   * declarar. La comparación de "qué abre conversaciones" ya la da `angulo`
   * cruzado con el estado; esto responde la otra pregunta, que es cuál fue. */
  {
    objeto: 'opportunity',
    name: 'argumento',
    label: 'Argumento',
    type: 'LINKS',
    icon: 'IconFileDescription',
    description: 'La página de argumento que se le mandó. En el rótulo del enlace va la tesis en pocas palabras; en la URL, la página publicada.',
  },

  /* El circuito de aprobación del canal Email. El borrador vive acá y no en una
   * Note porque un borrador es un estado: se filtra, se edita en la ficha y se
   * aprueba. La Note se escribe recién cuando el mensaje salió, con el texto que
   * efectivamente se mandó. Así se sostiene que la Note se lee y no se cierra
   * nunca, sin usar prosa libre como máquina de estados. */
  {
    objeto: 'opportunity',
    name: 'aprobacion',
    label: 'Aprobación',
    type: 'SELECT',
    icon: 'IconChecks',
    description: 'Dónde está el mensaje en el circuito. Sólo sale de Aprobado lo que Alan movió a mano en el CRM.',
    options: opciones(APROBACION, COLOR_APROBACION),
    defaultValue: `'${aValor(APROBACION[0])}'`,
  },
  {
    objeto: 'opportunity',
    name: 'borradorAsunto',
    label: 'Asunto del borrador',
    type: 'TEXT',
    icon: 'IconMailForward',
    description: 'El asunto exacto que va a salir. Se lee y se corrige en la ficha antes de aprobar.',
  },
  {
    objeto: 'opportunity',
    name: 'borradorCuerpo',
    label: 'Cuerpo del borrador',
    type: 'TEXT',
    icon: 'IconMessage',
    description: 'El cuerpo exacto que va a salir. Editable acá: corregir el texto es parte de aprobarlo.',
  },
  {
    objeto: 'opportunity',
    name: 'borradorFecha',
    label: 'Borrador del',
    type: 'DATE',
    icon: 'IconCalendarPlus',
    description: 'Cuándo se redactó. Un borrador añejo se ve de un vistazo, y la señal que lo justificaba puede haber vencido.',
  },
  /* El id que devuelve create_draft. Es lo único que ata la tarjeta al correo:
   * sin esto no hay forma de verificar después si ese mensaje salió. */
  {
    objeto: 'opportunity',
    name: 'gmailDraftId',
    label: 'Borrador Gmail',
    type: 'TEXT',
    icon: 'IconMailbox',
    description: 'El id del borrador en el Gmail de Codence. Lo escribe /enviar y lo consume /enviar --confirmar.',
  },

  /* La bandeja. El `name` del objeto ya lo crea Twenty solo, así que acá van
   * los cuatro que agregan algo. Las imágenes no figuran: son adjuntos, y la
   * relación viene con el objeto. */
  {
    objeto: 'pista',
    name: 'tipo',
    label: 'Tipo',
    type: 'SELECT',
    icon: 'IconCategory',
    description: 'Qué clase de material es. Decide qué hace /buscar con ella: una fuente se convierte en ruta, un prospecto posible entra directo a verificación.',
    options: opciones(TIPO_PISTA),
  },
  {
    objeto: 'pista',
    name: 'enlace',
    label: 'Enlace',
    type: 'LINKS',
    icon: 'IconLink',
    description: 'A dónde apunta. Admite secundarios si son varios.',
  },
  {
    objeto: 'pista',
    name: 'estado',
    label: 'Estado',
    type: 'SELECT',
    icon: 'IconProgressCheck',
    description: 'Una pista que lleva semanas en Sin mirar es la misma falla que un borrador parado en En Gmail: /outbound-hoy las cuenta.',
    options: opciones(ESTADO_PISTA, COLOR_ESTADO_PISTA),
    defaultValue: `'${aValor(ESTADO_PISTA[0])}'`,
  },
  {
    objeto: 'pista',
    name: 'detalle',
    label: 'Detalle',
    type: 'RICH_TEXT',
    icon: 'IconNotes',
    description: 'Contexto, texto pegado, o por qué llamó la atención. Lo que no entra en el título.',
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

/**
 * Un campo que ya existe se saltea — salvo que sea una taxonomía y su lista haya
 * cambiado acá. Sin esto, agregar una opción serían DOS cambios (este archivo y
 * la interfaz de Twenty), y la regla es que las taxonomías vivan en un solo
 * lugar. Se descubrió al agregarle a `angulo` la familia C: el bucle la salteaba
 * en silencio y el archivo quedaba mintiendo sobre el esquema real.
 *
 * Empareja por `value` y conserva el `id` de cada opción que sobrevive. Es la
 * lectura conservadora: no está comprobado si Twenty reconcilia por id o por
 * valor, y perder el emparejamiento reescribiría datos ya cargados.
 *
 * Devuelve true si tocó algo.
 */
async function sincronizarOpciones(campo, existente) {
  const actuales = existente.options ?? [];
  const porValor = Object.fromEntries(actuales.map((o) => [o.value, o]));

  const deseadas = campo.options.map((o) =>
    porValor[o.value] ? { ...o, id: porValor[o.value].id } : o,
  );

  const igual =
    actuales.length === deseadas.length &&
    deseadas.every((o, i) => actuales[i].label === o.label && actuales[i].value === o.value);
  if (igual) return false;

  const valores = new Set(deseadas.map((o) => o.value));
  const suma = deseadas.filter((o) => !porValor[o.value]).map((o) => o.label);
  const resta = actuales.filter((o) => !valores.has(o.value)).map((o) => o.label);

  /* Avisar y aplicar igual. Una opción que desaparece deja a los registros que
   * la usaban con un valor fuera de la taxonomía, y eso los hace desaparecer de
   * la cola en silencio. Pero la declaración es la fuente de verdad: se aplica,
   * y el aviso queda escrito diciendo cuál fue. */
  if (resta.length) {
    console.log(`  !  ${campo.objeto}.${campo.name} pierde: ${resta.join(', ')}`);
    console.log('     Revisar los registros que la usaran: su valor queda fuera de la taxonomía.');
  }

  const detalle = [suma.length ? `+${suma.join(', ')}` : '', resta.length ? `-${resta.join(', ')}` : '']
    .filter(Boolean)
    .join('  ');

  if (ensayo) {
    console.log(`  ~  ${campo.objeto}.${campo.name}  ${actuales.length} → ${deseadas.length} opciones   ${detalle}`);
    return true;
  }

  const cuerpo = { options: deseadas };
  /* El defaultValue viaja en el mismo PATCH sólo si el que había dejó de
   * existir. Es la trampa que costó una corrida con `stage`: su default de
   * fábrica no sobrevivía al reemplazo y la API rechazaba el cambio entero.
   * Agregar una opción no lo rompe, así que casi siempre no hace falta. */
  const porDefecto = existente.defaultValue?.replace?.(/'/g, '');
  if (porDefecto && !valores.has(porDefecto)) cuerpo.defaultValue = `'${deseadas[0].value}'`;

  await api(`/fields/${existente.id}`, { method: 'PATCH', body: JSON.stringify(cuerpo) });
  console.log(`  ~  ${campo.objeto}.${campo.name}  ${deseadas.length} opciones   ${detalle}`);
  return true;
}

async function main() {
  const leerObjetos = async () => {
    const lista = desenvolver(await api('/objects?limit=60'));
    return Object.fromEntries(lista.map((o) => [o.nameSingular, o]));
  };

  let porNombre = await leerObjetos();
  for (const n of ['company', 'person', 'opportunity']) {
    if (!porNombre[n]) throw new Error(`No existe el objeto ${n}`);
  }

  console.log(ensayo ? '── ENSAYO, no se escribe nada ──\n' : '── Aplicando ──\n');

  let creados = 0;
  let salteados = 0;
  let ajustados = 0;
  let objetosNuevos = 0;

  /* Los objetos van primero: sus campos necesitan el objectMetadataId, que no
   * existe hasta que el objeto está creado. Igual de idempotente que los
   * campos — uno que ya está se saltea. */
  for (const objeto of OBJETOS) {
    if (porNombre[objeto.nameSingular]) {
      console.log(`  =  objeto ${objeto.nameSingular} ya existe, se saltea`);
      continue;
    }

    if (ensayo) {
      console.log(`  +  objeto ${objeto.nameSingular} → "${objeto.labelPlural}" en la barra lateral`);
      objetosNuevos++;
      continue;
    }

    await api('/objects', { method: 'POST', body: JSON.stringify(objeto) });
    console.log(`  +  objeto ${objeto.nameSingular} → "${objeto.labelPlural}" en la barra lateral`);
    objetosNuevos++;
  }

  /* Releer sólo si se creó alguno: el objeto nuevo trae su id y su campo `name`,
   * y sin eso el bucle de campos de abajo no tiene a dónde colgarlos. */
  if (objetosNuevos && !ensayo) porNombre = await leerObjetos();

  for (const campo of CAMPOS) {
    const obj = porNombre[campo.objeto];

    /* En ensayo, los campos de un objeto que todavía no existe no se pueden
     * comparar contra nada. Se reportan como a crear, que es lo que van a ser. */
    if (!obj) {
      if (!ensayo) throw new Error(`No existe el objeto ${campo.objeto} para el campo ${campo.name}`);
      const detalle = campo.options ? ` (${campo.options.length} opciones)` : '';
      console.log(`  +  ${campo.objeto}.${campo.name}  ${campo.type}${detalle}`);
      creados++;
      continue;
    }

    const existente = (obj.fields ?? []).find((f) => f.name === campo.name);

    if (existente) {
      /* Existe, pero si es una taxonomía todavía puede haberle cambiado la
       * lista. Ver sincronizarOpciones: agregar una opción tiene que ser un
       * solo cambio, acá. */
      if (campo.options && (await sincronizarOpciones(campo, existente))) {
        ajustados++;
      } else {
        console.log(`  =  ${campo.objeto}.${campo.name} ya existe, se saltea`);
        salteados++;
      }
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

  const ajuste = ajustados ? `, ${ajustados} con la lista ${ensayo ? 'a ajustar' : 'ajustada'}` : '';
  const objs = objetosNuevos ? `${objetosNuevos} objeto(s) ${ensayo ? 'a crear' : 'creados'}, ` : '';
  console.log(`\n${objs}${creados} campo(s) ${ensayo ? 'a crear' : 'creados'}, ${salteados} ya existían${ajuste}.`);
}

main().catch((e) => {
  console.error('\n✗ ' + e.message);
  process.exit(1);
});
