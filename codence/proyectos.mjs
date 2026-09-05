/**
 * proyectos.mjs — carga los directorios de trabajo de Codence al CRM.
 *
 * Hermano de partners.mjs y con la misma doctrina: la lista vive versionada acá
 * y esto la empuja al CRM, no al revés.
 *
 * POR QUÉ EXISTE ESTE OBJETO. De cada sesión de trabajo quedan deudas, y hasta
 * ahora vivían donde cayeran: un recuadro en un README, una sección «Lo que
 * quedó pendiente» en un decisiones.md, una fila «A confirmar» en un PLAN.md.
 * Al abrir una sesión en cualquiera de estas carpetas no había forma de
 * preguntar qué quedó abierto.
 *
 * El objeto Proyecto existe para darle a una Task algo a qué atarse cuando lo
 * pendiente es de un repo y no de un prospecto. Crear el objeto hace que el
 * server genere solo `targetProyecto` sobre `taskTarget`, así que la ficha de
 * cada proyecto muestra sus tareas sin que nadie construya una pantalla.
 *
 * QUÉ NO VA ACÁ. Nada que ya viva en el repo del proyecto. El README, el
 * CLAUDE.md y el decisiones.md de cada carpeta son la fuente de qué es y cómo se
 * trabaja; duplicar eso en una ficha crearía la segunda fuente que la doctrina
 * de codence-bases prohíbe. Acá va lo mínimo para encontrar el registro desde
 * una carpeta y saber si sus pendientes entran hoy en la cola.
 *
 *   node codence/proyectos.mjs --ensayo       muestra qué haría, no escribe
 *   node codence/proyectos.mjs                crea los que faltan
 *   node codence/proyectos.mjs --actualizar   además corrige los que ya están
 *
 * Idempotente por nombre: uno que ya está se saltea. Correrlo dos veces no
 * duplica nada.
 *
 * ⚠️ Va en un sentido solo, igual que el resto: pisa el CRM con lo que dice este
 * archivo. Lo que se haya editado a mano en la ficha y no esté acá se pierde.
 * Las tareas no se tocan nunca: cuelgan del proyecto, no viven adentro.
 */

const URL_BASE = process.env.TWENTY_URL ?? 'http://localhost:3000';
const CLAVE = process.env.TWENTY_KEY ?? process.env.TWENTY_API_KEY;

if (!CLAVE) {
  console.error('Falta TWENTY_KEY (o TWENTY_API_KEY). Se genera en Ajustes → API y Webhooks.');
  process.exit(1);
}

const ensayo = process.argv.includes('--ensayo');
const actualizar = process.argv.includes('--actualizar');

/* ── Los directorios ─────────────────────────────────────────────────────── */

/* La misma lista que la tabla de codence-bases/CLAUDE.md, que es la fuente. Esa
 * tabla es prosa para leer; esto es lo mismo pero apuntable desde una tarea.
 *
 * `queEs` es una línea y se queda en una línea a propósito: si empieza a crecer,
 * lo que está pasando es que el README del proyecto se está copiando acá.
 *
 * codence-auditorias entra en pausa y no archivado. Está parado desde el
 * 07/08/2026 pero con trabajo abierto adentro: archivarlo perdería las deudas, y
 * dejarlo activo las mezclaría con lo que sí se está haciendo hoy. */
const PROYECTOS = [
  {
    name: 'codence-bases',
    ruta: 'D:\\codence-bases',
    repo: 'Codence-Lab/codence-bases',
    queEs: 'El cerebro: identidad, modelo de negocio, marca, y la bitácora de por qué cambió cada cosa.',
  },
  {
    name: 'codence-crm',
    ruta: 'D:\\codence-crm',
    repo: 'Codence-Lab/twenty',
    queEs: 'Este CRM, fork de Twenty, y el outbound que corre encima: las skills, las señales y el ICP vigente.',
  },
  {
    name: 'codence-backoffice',
    ruta: 'D:\\codence-backoffice',
    repo: 'Codence-Lab/codence-backoffice',
    queEs: 'Calculadora fiscal y generador de contratos. Corre en Docker, en localhost:5173.',
  },
  {
    name: 'codence-clientes',
    ruta: 'D:\\codence-clientes',
    repo: 'Codence-Lab/codence-clientes',
    queEs: 'Material de clientes activos: arquitecturas y relevamientos. Hoy sólo ADA.',
  },
  {
    name: 'codence-logistica',
    ruta: 'D:\\codence-logistica',
    repo: 'Codence-Lab/codence-logistica',
    queEs: 'Producto propio: conciliación de liquidación de fletes de granos. Planificado, sin código. La fecha real es marzo de 2027.',
  },
  {
    name: 'codence-harness',
    ruta: 'D:\\codence-harness',
    repo: 'Codence-Lab/codence-harness',
    queEs: 'Infraestructura de desarrollo compartida entre los repos, como plugin de Claude Code.',
  },
  {
    name: 'codence-auditorias',
    ruta: 'D:\\Admin\\Desktop\\Codence Studio\\CLAUDE\\CODENCE\\Proyectos\\Agencia\\Estructura\\codence-auditorias',
    repo: 'Codence-Lab/codence-auditorias',
    estado: 'En pausa',
    queEs: 'Motor de auditorías. Pausado desde el 07/08/2026, con trabajo abierto adentro.',
  },
];

/* ── El cliente ──────────────────────────────────────────────────────────── */

async function api(base, ruta, opts = {}) {
  const r = await fetch(`${URL_BASE}${base}${ruta}`, {
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

const meta = (ruta, opts) => api('/rest/metadata', ruta, opts);
const datos = (ruta, opts) => api('/rest', ruta, opts);

const links = (principal) => ({
  primaryLinkUrl: principal?.url ?? '',
  primaryLinkLabel: principal?.label ?? '',
  secondaryLinks: [],
});

/* Qué se compara cuando el registro ya existe. El CRM guarda la URL sin la barra
 * final, así que compararla cruda daría «cambió» en cada corrida. */
const comparable = (campo, valor) => {
  if (valor === null || valor === undefined) return null;
  if (campo === 'repo') {
    const sinBarra = (u) => (u ?? '').replace(new RegExp('/+$'), '');
    return `${sinBarra(valor.primaryLinkUrl)}|${valor.primaryLinkLabel ?? ''}`;
  }
  return String(valor);
};

async function main() {
  const objetos = await meta('/objects?limit=60');
  const lista = objetos?.data?.objects ?? objetos?.objects ?? objetos?.data ?? objetos;
  const proyecto = lista.find((o) => o.nameSingular === 'proyecto');

  if (!proyecto) {
    throw new Error('No existe el objeto proyecto. Correr primero: node codence/modelo.mjs');
  }

  /* El mapa rótulo → valor interno, leído del esquema real. Derivarlo acá
   * duplicaría la regla de aValor que ya vive en modelo.mjs. */
  const valorDe = {};
  for (const campo of proyecto.fields ?? []) {
    if (!campo.options) continue;
    valorDe[campo.name] = Object.fromEntries(campo.options.map((o) => [o.label, o.value]));
  }

  const resolver = (campo, rotulo) => {
    if (!rotulo) return null;
    const valor = valorDe[campo]?.[rotulo];
    if (!valor) throw new Error(`${campo}: no existe la opción "${rotulo}" en el esquema`);
    return valor;
  };

  const existentes = await datos('/proyectos?limit=60');
  const porNombre = new Map(
    (existentes?.data?.proyectos ?? []).map((p) => [p.name?.toLowerCase(), p]),
  );

  console.log(ensayo ? '── ENSAYO, no se escribe nada ──\n' : '── Cargando ──\n');

  let creados = 0;
  let salteados = 0;
  let corregidos = 0;

  for (const p of PROYECTOS) {
    const cuerpo = {
      name: p.name,
      rutaLocal: p.ruta,
      repo: links({ url: `https://github.com/${p.repo}`, label: p.repo }),
      estado: resolver('estado', p.estado ?? 'Activo'),
      queEs: p.queEs ?? '',
    };

    const marca = p.estado && p.estado !== 'Activo' ? `  (${p.estado.toLowerCase()})` : '';
    const existente = porNombre.get(p.name.toLowerCase());

    if (existente) {
      const distintos = Object.keys(cuerpo).filter(
        (k) => k !== 'name' && comparable(k, cuerpo[k]) !== comparable(k, existente[k]),
      );

      if (!actualizar || distintos.length === 0) {
        const nota = distintos.length
          ? `  (${distintos.length} campo(s) difieren, --actualizar los corrige)`
          : '';
        console.log(`  =  ${p.name} ya está, se saltea${nota}`);
        salteados++;
        continue;
      }

      const parche = Object.fromEntries(distintos.map((k) => [k, cuerpo[k]]));

      if (!ensayo) {
        await datos(`/proyectos/${existente.id}`, {
          method: 'PATCH',
          body: JSON.stringify(parche),
        });
      }
      console.log(`  ~  ${p.name}  ${distintos.join(', ')}`);
      corregidos++;
      continue;
    }

    if (!ensayo) {
      await datos('/proyectos', { method: 'POST', body: JSON.stringify(cuerpo) });
    }
    console.log(`  +  ${p.name}${marca}`);
    creados++;
  }

  const verbo = ensayo ? 'a crear' : 'creados';
  const verboC = ensayo ? 'a corregir' : 'corregidos';
  const cola = actualizar
    ? `, ${corregidos} ${verboC}, ${salteados} sin cambios.`
    : `, ${salteados} ya estaban.`;
  console.log(`\n${creados} proyecto(s) ${verbo}${cola}`);
}

main().catch((e) => {
  console.error('\n' + e.message);
  process.exit(1);
});
