/**
 * partners.mjs — vuelca la red de partners de codence/partners.md al CRM.
 *
 * Hermano de migrar.mjs y con la misma doctrina: el archivo versionado es la
 * fuente y esto lo empuja al CRM, no al revés. `partners.md` guarda el porqué
 * de cada clasificación —lo que se leyó, qué se descartó y con qué motivo—, y
 * eso no cabe en una ficha. El CRM guarda lo que hace falta para filtrar y
 * para contactar.
 *
 * POR QUÉ EXISTE COMO SCRIPT Y NO SE CARGA A MANO. modelo.mjs hace que el
 * esquema se pueda reconstruir desde el repo; sin esto, los diecisiete
 * registros sólo existirían dentro de la base y un `database:reset` los
 * borraría sin dejar rastro.
 *
 * LOS VALORES SE LEEN DE LA API, NO SE DERIVAN ACÁ. Cada taxonomía se resuelve
 * por rótulo contra las opciones que modelo.mjs ya creó. Derivarlas de nuevo
 * habría duplicado la regla de aValor y roto justo donde hay una excepción:
 * `Automatización de procesos` conserva el valor viejo AUTOMATIZACION_AI_NATIVE
 * del rename del 11/08.
 *
 *   node codence/partners.mjs --ensayo   muestra qué haría, no escribe
 *   node codence/partners.mjs            lo aplica
 *
 * Idempotente por nombre: uno que ya está se saltea. Correrlo dos veces no
 * duplica nada.
 */

import { randomUUID } from 'node:crypto';

const URL_BASE = process.env.TWENTY_URL ?? 'http://localhost:3000';
const CLAVE = process.env.TWENTY_KEY ?? process.env.TWENTY_API_KEY;

if (!CLAVE) {
  console.error('Falta TWENTY_KEY (o TWENTY_API_KEY). Se genera en Ajustes → API y Webhooks.');
  process.exit(1);
}

const ensayo = process.argv.includes('--ensayo');

/* ── La red ──────────────────────────────────────────────────────────────── */

/* Todo lo que está acá salió de codence/partners.md. Lo que no está es a
 * propósito: nada sin verificar entra, y ningún mail inferido se escribe.
 *
 * `limite` es el campo que evita el error caro. En partners.md es el ⚠️ de cada
 * ficha, y no se deduce del rol ni de las disciplinas: Santex es de desborde y
 * no de capacidad nueva, Orbyn es competencia directa, Celtis toma un proyecto
 * por vez. Sin eso, la lista se lee como proveedores intercambiables. */
const RED = [
  {
    name: 'Neuralsoft',
    rol: 'Producción',
    disciplinas: ['Software a medida', 'Automatización de procesos'],
    pais: 'Argentina (Rosario, Santa Fe)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['ventas@neuralsoft.com', 'sales@neuralsoft.com'],
    telefono: [{ numero: '1140000777', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://neuralsoft.com', label: 'neuralsoft.com' },
    otros: [
      { url: 'https://neuralsoft.com/programa-de-partners/', label: 'Programa de partners' },
      { url: 'https://neuralsoft.com/contacto', label: 'Formulario' },
      { url: 'https://linkedin.com/company/neuralsoft', label: 'LinkedIn' },
      { url: 'https://instagram.com/neuralsoft_erp', label: 'Instagram' },
    ],
    limite:
      'La dirección de Villa Gobernador Gálvez que devuelven los directorios no está en su sitio: no se usa.',
    detalle: [
      'Prioridad 1 de la red, y no está cerca el segundo. Es el único con programa de partners publicado y reclutando, con cuatro niveles de compromiso: Intermediario (sólo referencia, cierran ellos), Agente de ventas, Partner (vende e implementa, cobra recurrente por usuario) y Partner Plus (desarrolla y revende sobre su plataforma). Hay un nivel de riesgo cero.',
      'Producto propio: MyLogic (ERP), más Presea y Deonics. Dos metodologías nombradas, Implementación Rápida e Implementación Incremental.',
      'El ángulo: sus huecos son exactamente branding, diseño web y GTM, que es lo que Codence tiene y ellos no. Argentina, en español, y con punto de entrada publicado.',
      'Posicionamiento: «De la operación diaria, a la estrategia del negocio».',
    ],
  },
  {
    name: 'Arounda',
    rol: 'Producción',
    disciplinas: ['Rebranding', 'Diseño web', 'Software a medida'],
    pais: 'Estonia (Tallinn) y Ucrania (Odesa)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['info@arounda.agency'],
    sitio: { url: 'https://arounda.agency', label: 'arounda.agency' },
    otros: [
      { url: 'https://calendly.com/arounda/1-hour', label: 'Booking' },
      { url: 'https://arounda.agency/contact', label: 'Formulario' },
      { url: 'https://linkedin.com/company/arounda', label: 'LinkedIn' },
    ],
    limite:
      'Zona horaria: Europa del Este, 5 a 6 horas de diferencia con Argentina. Las otras seis oficinas que publica son direcciones registradas, no operación.',
    detalle: [
      'El stack más ancho de la red, y su modelo comercial ya es de subcontratación: vende Team Extension con prueba gratis de 3 días y cancelación en cualquier momento, en niveles de media jornada, jornada completa y equipo.',
      'Es el único que publica precios: proyectos desde USD 6.000, MVP entre USD 10k y 80k+. Sirve de referencia de costo para toda la red.',
      'Tamaño: dice 50+, Clutch dice 10-49. Posicionamiento: «Your design & dev partner that unites brand, website, ui/ux design into a holistic product».',
    ],
  },
  {
    name: 'Santex',
    rol: 'Producción',
    disciplinas: ['Rebranding', 'Diseño web', 'Software a medida', 'Agentes AI'],
    pais: 'Argentina (Córdoba y Buenos Aires), HQ en Carlsbad, California',
    canal: 'Formulario',
    verificacion: 'No hay',
    telefono: [
      { numero: '3512101081', iso: 'AR', prefijo: '+54' },
      { numero: '8886227098', iso: 'US', prefijo: '+1' },
    ],
    sitio: { url: 'https://santexgroup.com', label: 'santexgroup.com' },
    otros: [
      { url: 'https://santexgroup.com/contact', label: 'Formulario' },
      { url: 'https://linkedin.com/company/santexgroup', label: 'LinkedIn' },
    ],
    limite:
      'Es partner de desborde, no de capacidad nueva: ya vende branding, UX/UI y design systems propios, itemizados en su web. El pitch depende de la relación, no de una propuesta de valor que entre en un correo frío. Y no publica ningún mail: el único camino es el formulario o el teléfono de Córdoba. El patrón First.Last@santexgroup.com que devuelven los agregadores es una inferencia y no se usa.',
    detalle: [
      'Tamaño: 501-1.000 personas, fundada en 1999, B Corp. Córdoba en Humberto Primo 630 piso 9, Buenos Aires en Costa Rica 6019 piso 3, Palermo.',
      'Posicionamiento: «Integrating People and Technology».',
    ],
  },
  {
    name: 'Aditi Consulting',
    rol: 'Producción',
    disciplinas: ['Software a medida', 'Automatización de procesos', 'Data / BI'],
    pais: 'Estados Unidos (Bellevue, WA), HQ de LATAM en Buenos Aires',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['info@aditiconsulting.com'],
    telefono: [{ numero: '4253055091', iso: 'US', prefijo: '+1' }],
    sitio: { url: 'https://www.aditiconsulting.com', label: 'aditiconsulting.com' },
    otros: [
      { url: 'https://www.aditiconsulting.com/contact-us/', label: 'Formulario' },
      { url: 'https://linkedin.com/company/aditiconsulting', label: 'LinkedIn' },
    ],
    limite:
      'aditi.com NO es esta empresa: es Life and Freedom Organization, una institución budista. La consultora es aditiconsulting.com. El ángulo es el hueco (diseño, branding, front-end), nunca ingeniería: ahí tienen 300 personas nearshore en Buenos Aires y se compite contra su propio costo.',
    detalle: [
      'Por qué entra: su negocio de Talent on Demand está construido sobre comprar capacidad externa, así que estructuralmente contratan proveedores.',
      'Tamaño: ~1.500 consultores en EE.UU. más 300 nearshore, ~USD 450M. HQ de LATAM en Juana Manso 1870, Buenos Aires. También Bangalore.',
      'Posicionamiento: «Global. Innovative. Transformative.».',
    ],
  },
  {
    name: 'Tunel Studio',
    rol: 'Producción',
    disciplinas: ['Diseño web', 'SEO / GEO', 'CRO'],
    pais: 'Bosnia y Herzegovina (Banja Luka)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['hello@tunel.studio'],
    sitio: { url: 'https://www.tunel.studio', label: 'tunel.studio' },
    otros: [
      { url: 'https://www.tunel.studio/contact', label: 'Formulario' },
      { url: 'https://linkedin.com/company/tunel-studio', label: 'LinkedIn' },
      { url: 'https://www.instagram.com/tunelstudio/', label: 'Instagram' },
    ],
    limite:
      'Seis personas. Alcanza para un encargo de web entero, no para dos en paralelo con fecha dura.',
    detalle: [
      'Lo que tiene y nadie más en la lista: GEO, visibilidad en búsqueda por IA (ChatGPT, Perplexity). Es un diferencial actual y Codence no lo ofrece.',
      'Publica SLAs duros: respuesta en 24 h hábiles, avances cada dos días, 30 días de soporte post-lanzamiento incluidos. El formulario responde en 1 día hábil.',
      '85+ proyectos B2B/SaaS. Posicionamiento: «Embedded Growth Partner for B2B and SaaS».',
    ],
  },
  {
    name: 'Thorque',
    rol: 'Producción',
    disciplinas: ['Automatización de procesos', 'Agentes AI', 'Software a medida'],
    pais: 'Argentina (Rosario, Santa Fe)',
    canal: 'WhatsApp',
    verificacion: 'Verificado',
    mail: ['contact@thorque.software'],
    telefono: [{ numero: '93416009423', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://www.thorque.com.ar', label: 'thorque.com.ar' },
    otros: [
      { url: 'https://calendly.com/thorque/30min', label: 'Booking' },
      { url: 'https://linkedin.com/company/thorque-software', label: 'LinkedIn' },
      { url: 'https://www.instagram.com/thorque_software', label: 'Instagram' },
    ],
    limite:
      'El mail contact@thorque.software está en otro dominio que el del sitio, thorque.com.ar. Verificar con un envío de prueba antes de usarlo en bulk. El canal seguro es el WhatsApp de Rosario, que sí publican.',
    detalle: [
      'Stack publicado: Node, Python, TypeScript, PostgreSQL, Docker, Kubernetes, AWS, OpenAI. APIs oficiales de WhatsApp Business y Meta, relevante para Agentes AI.',
      'Dr. Álvarez 1530, Rosario. Posicionamiento: «Automatizamos la infraestructura digital de tu negocio».',
    ],
  },
  {
    name: 'Celtis',
    rol: 'Producción',
    disciplinas: ['Automatización de procesos', 'Software a medida', 'Agentes AI', 'Data / BI'],
    pais: 'Argentina (Buenos Aires)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['celtis.ai@gmail.com'],
    telefono: [{ numero: '91160299844', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://somosceltis.com/landing/', label: 'somosceltis.com' },
    otros: [{ url: 'https://instagram.com/celtis.ai', label: 'Instagram' }],
    limite:
      'Es una persona: José Manuel Diaz Herrera. Toma un proyecto por vez y lo dice él, así que no es capacidad elástica sino una agenda: hay que preguntarle si está libre antes de comprometer fecha, y no hay a quién escalar si se enferma. Nunca para un encargo con fecha dura. Se superpone con tres de los seis servicios y se presenta como estudio propio: ejecuta bien por atrás, no se lo pone delante del cliente. El mail es un Gmail y no un dominio propio.',
    detalle: [
      'Por qué entra: es el perfil más barato de la red y cubre el dolor 1 entero sin estructura encima. Para un encargo chico de automatización deja margen donde Neuralsoft o Thorque cotizan como empresa.',
      'Lo que vende, con sus palabras: «Diseñamos sistemas a medida para empresas que se quedaron cortas con el SaaS». Dashboards, automatizaciones, aplicaciones internas e IA adentro del sistema y no pegada arriba. Su método publicado son tres pasos: estudiar el flujo de trabajo, construir la herramienta, implementar e iterar.',
      'El sitio no se puede leer con WebFetch: es React compilado en el navegador. Estos datos salieron de las fuentes .jsx que sirve el propio sitio en /landing/sections/. Si hay que volver a chequearlo, ése es el camino, o un navegador real.',
      'Posicionamiento: «Entender. Diseñar. Implementar.» · «Estudio de sistemas a medida con IA en el proceso».',
    ],
  },
  {
    name: 'Orbyn',
    rol: 'Especialista',
    disciplinas: ['Agentes AI', 'Automatización de procesos'],
    pais: 'España',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['admin@orbyn.ai'],
    sitio: { url: 'https://www.orbyn.ai', label: 'orbyn.ai' },
    otros: [
      { url: 'https://cal.com/orbyn.ai/sesiondeestrategia', label: 'Booking' },
      { url: 'https://www.linkedin.com/company/orbyn-ai/', label: 'LinkedIn' },
      { url: 'https://www.instagram.com/orbyn_ai', label: 'Instagram' },
    ],
    limite:
      'Es competencia directa en Agentes AI, no complemento. Sirve para desborde, nunca para un proyecto donde Codence quiera quedarse con la relación.',
    detalle: [
      'Dos fundadores, Gonzalo y Mateo. 55+ agentes desplegados.',
      'Vale la pena leerlos igual: su forma de argumentar velocidad sin comprometer fecha es la referencia que web-copy.md cita para el bloque de Agentes AI.',
      'Posicionamiento: «Tu aliado IA para la próxima década».',
    ],
  },
  {
    name: 'Agio',
    rol: 'Especialista',
    disciplinas: ['Motion', 'Rebranding'],
    pais: 'Italia (Milán)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['info@weareagio.com'],
    sitio: { url: 'https://www.weareagio.com', label: 'weareagio.com' },
    otros: [
      { url: 'https://www.weareagio.com/contact-us', label: 'Formulario' },
      { url: 'https://www.linkedin.com/company/weareagio', label: 'LinkedIn' },
      { url: 'https://www.behance.net/weareagio', label: 'Behance' },
      { url: 'https://vimeo.com/weareagio', label: 'Vimeo' },
    ],
    limite: '',
    detalle: [
      'Para qué sirve: la capa de motion que Codence no tiene y que ninguna de las de producción cubre bien.',
      'Clientes desproporcionados para su tamaño: OpenAI (The Intelligence Age), Bloomberg, FIFA U-20, Luma AI. Y en Behance figuran «Available for freelance work», que es señal explícita de que toman subcontratación.',
      'Tamaño: 2-10, fundada en 2024. Posicionamiento: «A Motion & Branding Studio».',
    ],
  },
  {
    name: 'Merovingian Data',
    rol: 'Especialista',
    disciplinas: ['Data / BI', 'Agentes AI'],
    pais: 'Argentina (Mendoza)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['info@merovingiandata.com'],
    telefono: [{ numero: '92616508040', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://merovingiandata.com', label: 'merovingiandata.com' },
    otros: [
      { url: 'https://merovingiandata.com/contacto', label: 'Formulario' },
      { url: 'https://www.linkedin.com/company/merovingiandata/', label: 'LinkedIn' },
      { url: 'https://www.instagram.com/merovingiandata/', label: 'Instagram' },
    ],
    limite: '',
    detalle: [
      'Para qué sirve: la parte de datos de un proyecto de Software a medida o Automatización, es decir dashboards, ETL y arquitectura de datos. Es la disciplina que más seguido aparece dentro de un encargo y que Codence no nombra como servicio.',
      'Tamaño: 20+, fundada en 2020. Opera en Argentina, Brasil, España y EE.UU.',
      'Posicionamiento: «Empodera tu organización con datos».',
    ],
  },
  {
    name: 'Motto',
    rol: 'Par',
    disciplinas: ['Rebranding', 'GTM'],
    pais: 'Estados Unidos (Nueva York y Dallas) y Reino Unido (Londres)',
    canal: 'Formulario',
    verificacion: 'No hay',
    sitio: { url: 'https://wearemotto.com', label: 'wearemotto.com' },
    otros: [
      { url: 'https://wearemotto.com/contact', label: 'Formulario' },
      { url: 'https://www.linkedin.com/company/motto', label: 'LinkedIn' },
    ],
    limite:
      'Es un Par: no se le manda presupuesto, se le deriva. Pisos de USD 50k-100k+. El mail está ofuscado en su sitio y el patrón firstname@wearemotto.com es inferencia de RocketReach, así que no se usa. Los dos teléfonos que devuelven los directorios no coinciden entre sí y tampoco se usan: el formulario es el único canal confiable. Ojo con el dominio, mottoagency.com y motto.agency están en venta y no son ellos.',
    detalle: [
      'Es la referencia de la que salió el modelo de tres niveles, y bases/identidad.md §4 ya lo citaba por Strategic Branding.',
      'Sus cinco programas registrados (Foundation®, Flagship®, Framework®, FastTrack®, VisionCamp®) son el patrón que Codence copió: nombrados por lo que son, nunca por tamaño.',
      'Tamaño: 11-50, fundada en 2005. 199 Water St, Nueva York. Posicionamiento: «Ideas Worth Rallying Around®».',
    ],
  },
  {
    name: 'Together Agency',
    rol: 'Par',
    disciplinas: ['Rebranding', 'Diseño web', 'Software a medida'],
    pais: 'Reino Unido (Londres)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['work@together.agency', 'hello@together.agency'],
    sitio: { url: 'https://together.agency', label: 'together.agency' },
    otros: [
      { url: 'https://together.agency/contact/', label: 'Formulario' },
      { url: 'https://www.linkedin.com/company/istogether', label: 'LinkedIn' },
      { url: 'https://github.com/Made-Together', label: 'GitHub' },
    ],
    limite:
      'Es un Par: no se le manda presupuesto. Piso ~£50k. Su posicionamiento de IA es vertical de mercado y no capacidad técnica: ningún caso está etiquetado como producto ni como IA, sólo Brand y Website. El teléfono aparece sólo en directorios de terceros y no se usa. work@ es el de proyectos.',
    detalle: [
      'Tamaño: 40-50, fundada en 2018. No publica dirección.',
      'Tiene GitHub público, que es inusual en una agencia de diseño.',
      'Posicionamiento: «Design & technology for pivotal moments» · «The design partner for B2B tech & AI».',
    ],
  },
  {
    name: '14islands',
    rol: 'Par',
    disciplinas: ['Diseño web', 'Rebranding', 'Software a medida'],
    pais: 'Suecia (Estocolmo) e Islandia (Reikiavik)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['hello@14islands.com'],
    sitio: { url: 'https://www.14islands.com', label: '14islands.com' },
    otros: [
      { url: 'https://linkedin.com/company/14islands', label: 'LinkedIn' },
      { url: 'https://instagram.com/14islands/', label: 'Instagram' },
    ],
    limite:
      'Es un Par: no se le manda presupuesto. Su cartera publicada incluye Cartier, Google y Naciones Unidas, y un estudio que factura a esos clientes no toma trabajo subcontratado de una agencia más chica; si lo tomara sería a un precio sin margen. La clasificación es una lectura y no un dato: no publican dotación ni pisos, así que sale de quiénes son sus clientes. Si alguna vez hay una conversación real, esto se corrige con lo que digan. Sin teléfono ni formulario: el mail es el único canal.',
    detalle: [
      'Estudio de producto digital premium. Además de Cartier, Google y Naciones Unidas: Neko Health, Primer y Breakthrough Energy.',
      'Lo que sí vale mirar: tienen una sección AI propia en el menú. Para cuando haya que decidir cómo se muestra ese servicio en la web de Codence, es una referencia de cómo lo encuadra un estudio premium.',
      'Estocolmo en Blekingegatan 14, Reikiavik en Austurstræti 10a. Posicionamiento: «We design and build premium digital products, brands, and experiences».',
    ],
  },
  {
    name: 'Atila',
    rol: 'Sin datos',
    /* Sin disciplinas a propósito. partners.md las tiene marcadas como inferidas
     * y sin confirmar, y una disciplina inferida lo haría aparecer en la
     * búsqueda de quién ejecuta un encargo, que es exactamente el error. */
    disciplinas: [],
    pais: 'Argentina (Bell Ville, Córdoba)',
    canal: 'WhatsApp',
    verificacion: 'Verificado',
    telefono: [{ numero: '93537446654', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://www.atila.com.ar', label: 'atila.com.ar' },
    otros: [
      { url: 'https://www.instagram.com/atilasoftware/', label: 'Instagram' },
      { url: 'https://linktr.ee/atila.software', label: 'Linktree' },
    ],
    limite:
      'No se puede clasificar todavía. El sitio es una SPA con router de hash y no se pudo leer, y los agregadores devuelven registros que se contradicen entre sí: fundada en 1984 vs 2017, ~11 empleados, un mail @gmail y una razón social distinta (DSA SRL). Nada de eso entra acá. El único dato confiable es el WhatsApp. Falta abrirlo en un navegador real y leer qué hacen.',
    detalle: [
      'Instagram con 576 seguidores. Disciplinas inferidas y sin confirmar: software de gestión e IA.',
    ],
  },
  /* Los descartados. Van al CRM y no se borran: existen para que no vuelvan a la
   * lista en seis meses, y el motivo escrito es lo único que evita relevarlos de
   * nuevo. Los tres tienen operación grande en Argentina y eso los hace parecer
   * cercanos: la cercanía geográfica no cambia que no compran lo que Codence
   * vende. */
  {
    name: 'Globant',
    rol: 'Par',
    estado: 'Descartado',
    disciplinas: [],
    pais: 'Argentina (Buenos Aires) y global',
    canal: 'Formulario',
    verificacion: 'No hay',
    sitio: { url: 'https://www.globant.com', label: 'globant.com' },
    limite:
      'Descartado: es contratista principal, no subcontratista. 336 clientes de más de USD 1M por año y un modelo de capacidad propia en centros de entrega, no de subcontratación de agencias. Su sitio hasta bloquea la lectura automática.',
    detalle: ['28.000 personas, USD 2.450M, cotiza en NYSE. Nació en Argentina.'],
  },
  {
    name: 'Accenture',
    rol: 'Par',
    estado: 'Descartado',
    disciplinas: [],
    pais: 'Irlanda, con operación en Buenos Aires',
    canal: 'Formulario',
    verificacion: 'No hay',
    sitio: { url: 'https://www.accenture.com', label: 'accenture.com' },
    limite:
      'Descartado: compra agencias en vez de subcontratarlas, Work & Co y UNLIMITED fueron adquisiciones. Su portal de proveedores es abierto y gratis, así que registrarse cuesta una hora, pero su propia letra dice que sólo llaman si aparece una oportunidad que encaje. No se construye una secuencia de nurturing acá.',
    detalle: ['799.000 empleados.'],
  },
  {
    name: 'TP Group',
    rol: 'Par',
    estado: 'Descartado',
    disciplinas: [],
    pais: 'Francia, con 6.000 personas en tres ciudades de Argentina',
    canal: 'Formulario',
    verificacion: 'No hay',
    sitio: { url: 'https://www.tp.com', label: 'tp.com' },
    limite:
      'Descartado: su portal de proveedores es sólo por invitación, que es la señal directa de que no esperan proveedores chicos. Y cero superposición de disciplinas: no compran branding, ni web, ni ingeniería de producto.',
    detalle: ['440.000+ empleados, EUR 10.280M.'],
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

/* ── Las formas compuestas ───────────────────────────────────────────────── */

const emails = (lista = []) => ({
  primaryEmail: lista[0] ?? '',
  additionalEmails: lista.slice(1),
});

const phones = (lista = []) => ({
  primaryPhoneNumber: lista[0]?.numero ?? '',
  primaryPhoneCountryCode: lista[0]?.iso ?? '',
  primaryPhoneCallingCode: lista[0]?.prefijo ?? '',
  additionalPhones: lista.slice(1).map((t) => ({
    number: t.numero,
    countryCode: t.iso,
    callingCode: t.prefijo,
  })),
});

const links = (principal, secundarios = []) => ({
  primaryLinkUrl: principal?.url ?? '',
  primaryLinkLabel: principal?.label ?? '',
  secondaryLinks: secundarios.map((l) => ({ url: l.url, label: l.label })),
});

/* RICH_TEXT se guarda como el JSON de BlockNote y no como Markdown: así lo tiene
 * documento.contenido, que es el que ya se lee dentro del CRM. Un párrafo por
 * entrada del array. */
const richText = (parrafos = []) => ({
  blocknote: JSON.stringify(
    parrafos.map((texto) => ({
      id: randomUUID(),
      type: 'paragraph',
      props: { backgroundColor: 'default', textColor: 'default', textAlignment: 'left' },
      content: [{ type: 'text', text: texto, styles: {} }],
      children: [],
    })),
  ),
});

async function main() {
  const objetos = await meta('/objects?limit=60');
  const lista = objetos?.data?.objects ?? objetos?.objects ?? objetos?.data ?? objetos;
  const partner = lista.find((o) => o.nameSingular === 'partner');

  if (!partner) {
    throw new Error('No existe el objeto partner. Correr primero: node codence/modelo.mjs');
  }

  /* El mapa rótulo → valor interno, leído del esquema real. Es lo que hace que
   * este archivo pueda escribir «Automatización de procesos» sin saber que por
   * dentro se sigue llamando AUTOMATIZACION_AI_NATIVE. */
  const valorDe = {};
  for (const campo of partner.fields ?? []) {
    if (!campo.options) continue;
    valorDe[campo.name] = Object.fromEntries(campo.options.map((o) => [o.label, o.value]));
  }

  const resolver = (campo, rotulo) => {
    if (!rotulo) return null;
    const valor = valorDe[campo]?.[rotulo];
    if (!valor) throw new Error(`${campo}: no existe la opción "${rotulo}" en el esquema`);
    return valor;
  };

  const existentes = await datos('/partners?limit=100');
  const yaEstan = new Set((existentes?.data?.partners ?? []).map((p) => p.name?.toLowerCase()));

  console.log(ensayo ? '── ENSAYO, no se escribe nada ──\n' : '── Cargando ──\n');

  let creados = 0;
  let salteados = 0;

  for (const p of RED) {
    if (yaEstan.has(p.name.toLowerCase())) {
      console.log(`  =  ${p.name} ya está, se saltea`);
      salteados++;
      continue;
    }

    const cuerpo = {
      name: p.name,
      rol: resolver('rol', p.rol),
      disciplinas: (p.disciplinas ?? []).map((d) => resolver('disciplinas', d)),
      estado: resolver('estado', p.estado ?? 'Sin contactar'),
      pais: p.pais ?? '',
      canal: resolver('canal', p.canal),
      verificacion: resolver('verificacion', p.verificacion),
      mail: emails(p.mail),
      telefono: phones(p.telefono),
      enlaces: links(p.sitio, p.otros),
      limite: p.limite ?? '',
      detalle: richText(p.detalle),
    };

    const marca = p.estado === 'Descartado' ? '  (descartado)' : '';
    const disc = p.disciplinas?.length ? `  ${p.disciplinas.join(' · ')}` : '';

    if (ensayo) {
      console.log(`  +  ${p.name}  ${p.rol}${disc}${marca}`);
      creados++;
      continue;
    }

    await datos('/partners', { method: 'POST', body: JSON.stringify(cuerpo) });
    console.log(`  +  ${p.name}  ${p.rol}${disc}${marca}`);
    creados++;
  }

  const verbo = ensayo ? 'a crear' : 'creados';
  console.log(`\n${creados} partner(s) ${verbo}, ${salteados} ya estaban.`);
}

main().catch((e) => {
  console.error('\n' + e.message);
  process.exit(1);
});
