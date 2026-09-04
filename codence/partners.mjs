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
 * esquema se pueda reconstruir desde el repo; sin esto, los treinta y dos registros
 * sólo existirían dentro de la base y un `database:reset` los borraría sin
 * dejar rastro.
 *
 * LOS VALORES SE LEEN DE LA API, NO SE DERIVAN ACÁ. Cada taxonomía se resuelve
 * por rótulo contra las opciones que modelo.mjs ya creó. Derivarlas de nuevo
 * habría duplicado la regla de aValor y roto justo donde hay una excepción:
 * `Automatización de procesos` conserva el valor viejo AUTOMATIZACION_AI_NATIVE
 * del rename del 11/08.
 *
 *   node codence/partners.mjs --ensayo   muestra qué haría, no escribe
 *   node codence/partners.mjs            crea los que faltan
 *   node codence/partners.mjs --actualizar   además corrige los que ya están
 *
 * Idempotente por nombre: uno que ya está se saltea. Correrlo dos veces no
 * duplica nada.
 *
 * POR QUÉ EXISTE --actualizar. Sin eso la doctrina se rompía a la mitad: el
 * archivo es la fuente, pero un cambio en la fuente no tenía cómo llegar a un
 * registro ya creado. Se vio el 04/09/2026, cuando nueve partners marcados como
 * descartados dejaron de estarlo y el script no podía tocarlos. Compara campo
 * por campo contra lo que hay en el CRM y manda un PATCH sólo con lo que
 * difiere, así que correrlo de más no escribe de más.
 *
 * ⚠️ Va en un sentido solo, igual que el resto: pisa el CRM con lo que dice el
 * archivo. Lo que se haya editado a mano en la ficha y no esté acá se pierde.
 */

import { randomUUID } from 'node:crypto';

const URL_BASE = process.env.TWENTY_URL ?? 'http://localhost:3000';
const CLAVE = process.env.TWENTY_KEY ?? process.env.TWENTY_API_KEY;

if (!CLAVE) {
  console.error('Falta TWENTY_KEY (o TWENTY_API_KEY). Se genera en Ajustes → API y Webhooks.');
  process.exit(1);
}

const ensayo = process.argv.includes('--ensayo');
const actualizar = process.argv.includes('--actualizar');

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
    name: 'Halo Lab',
    rol: 'Producción',
    disciplinas: ['Rebranding', 'Diseño web', 'Software a medida', 'SEO / GEO'],
    /* Sin país de oficina a propósito: no publican dirección y la de Odesa sale
     * de Clutch y Craft, que es un directorio de terceros. */
    pais: 'Ucrania (sin ciudad publicada)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['inquiry@halo-lab.com'],
    telefono: [{ numero: '2133378573', iso: 'US', prefijo: '+1' }],
    sitio: { url: 'https://www.halo-lab.com', label: 'halo-lab.com' },
    otros: [
      { url: 'https://www.halo-lab.com/contacts', label: 'Formulario' },
      { url: 'https://linkedin.com/company/halolabteam', label: 'LinkedIn' },
      { url: 'https://dribbble.com/halolab', label: 'Dribbble' },
      { url: 'https://behance.net/halolab', label: 'Behance' },
      { url: 'https://github.com/Halo-Lab', label: 'GitHub' },
    ],
    limite:
      'Se superpone con cinco de los seis servicios, brazo de growth incluido: ejecuta bien por atrás y delante del cliente compite. Zona horaria de Ucrania, 5 a 6 horas de diferencia con Argentina, igual que Arounda. Y no publican dirección de oficina: la de Odesa sale de directorios de terceros y no entra acá, lo verificado es el mail y el teléfono.',
    detalle: [
      'El catálogo más ancho de la red: UI/UX, diseño web y mobile, branding y rebranding, Webflow, desarrollo web y móvil, MVP, chatbots y CMS. Por growth.halo-lab.com suma SEO, contenido y PPC.',
      'Tamaño: dice 150+ especialistas, 500+ proyectos y 78% de clientes que vuelven. Fundada hace 12 años. Son cifras propias, sin verificar.',
      'Posicionamiento: «Design & tech agency helping brands become top 1%» · «Crafted by Humans. Accelerated by AI».',
    ],
  },
  {
    name: 'Clarika',
    rol: 'Producción',
    disciplinas: ['Software a medida', 'Automatización de procesos', 'Agentes AI'],
    pais: 'Argentina (sin ciudad publicada)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['hello@clarika.com'],
    sitio: { url: 'https://www.clarikagroup.com', label: 'clarikagroup.com' },
    otros: [
      { url: 'https://www.clarikagroup.com/en/discovery-call', label: 'Booking' },
      { url: 'https://www.clarikagroup.com/en/contact', label: 'Formulario' },
      { url: 'https://linkedin.com/company/clarikagroup', label: 'LinkedIn' },
      { url: 'https://instagram.com/clarikagroup', label: 'Instagram' },
    ],
    limite:
      'El mail que publican es hello@clarika.com y el sitio es clarikagroup.com: el dominio no coincide, que es el segundo caso de la red después de Thorque. Lo publican ellos, así que se usa, pero el primer envío va solo y de prueba antes de usarlo en bulk. No publican teléfono ni dirección ni dotación.',
    detalle: [
      'Vende automatización de procesos con IA, software a medida, asistentes conversacionales y copilotos, flujos de datos con IA y sistemas de IA a medida. También vende staff augmentation y equipos dedicados, que es la señal estructural de que alquila capacidad y sabe trabajar por atrás.',
      'Fundada en 2007. Certificada Great Place to Work y #9 del ranking argentino 2025. El formulario dice responder en 24 h hábiles.',
      'Posicionamiento: «AI systems and software built for Real Operations» · «Engineering-first teams. Built to deliver.».',
    ],
  },
  {
    name: 'IT Patagonia',
    rol: 'Producción',
    disciplinas: ['Software a medida', 'Data / BI'],
    pais: 'Argentina (CABA), con oficinas en Montevideo, Lima y Madrid',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['info@itpatagonia.com'],
    sitio: { url: 'https://itpatagonia.com', label: 'itpatagonia.com' },
    otros: [{ url: 'https://itpatagonia.com/contacto/', label: 'Formulario' }],
    limite:
      'El ángulo es el hueco —diseño, branding, GTM—, nunca ingeniería ni infraestructura: tienen unidad propia, brazo de staffing y compiten con su propio costo. Es el mismo caso que Aditi y se abre igual. Sin teléfono publicado, después del mail el único camino es el formulario.',
    detalle: [
      'Unidades publicadas: Cobol Studio (mainframe y COBOL), Data & AI, Software Studio, Digital Talent (reclutamiento IT), Data Center, Learning Services, ciberseguridad y cloud. Productos propios: Opti y Urbanis. Alianzas técnicas con IBM, AWS y Dataiku.',
      'Empresa B. Direcciones: Av. Sáenz 17 piso 6 y Estados Unidos 20 piso 8 en CABA, Av. Luis Alberto de Herrera 1052 oficina 402 en Montevideo, Av. Alberto Alexander 2363 en Lima, Paseo de la Castellana 77 en Madrid. No publican dotación.',
      'Posicionamiento: «Impulsá tu negocio con tecnología y talento».',
    ],
  },
  {
    name: 'Asome',
    rol: 'Producción',
    disciplinas: ['Diseño web', 'Software a medida', 'Automatización de procesos', 'GTM'],
    pais: 'Argentina (Tucumán por el prefijo del WhatsApp), con trabajo remoto',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['hola@asomelab.com'],
    telefono: [{ numero: '3812360118', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://asomelab.com', label: 'asomelab.com' },
    otros: [
      {
        url: 'https://calendly.com/hola-asomelab/reunion-de-descubrimiento',
        label: 'Booking',
      },
      { url: 'https://asomelab.com/es-AR/contact', label: 'Formulario' },
      { url: 'https://www.instagram.com/asomelab/', label: 'Instagram' },
    ],
    limite:
      'Se superpone con cuatro de los seis servicios y se presenta como socio estratégico del negocio. Mismo trato que Celtis: ejecuta por atrás, no se lo pone delante del cliente. No publican dotación: describen el equipo por disciplinas, sin número.',
    detalle: [
      'Automatización de procesos, software de gestión a medida (ERP/CRM), landings y e-commerce, y diseño UX/UI. Stack publicado: Astro, React, Strapi, PostgreSQL, con despliegue en Railway y Vercel. Método en cinco fases: discovery, UX/UI en Figma, desarrollo, QA y puesta en producción.',
      'Publican llms.txt y llms-full.txt con misión, servicios, stack, metodología y casos. De ahí salieron estos datos, y es la ficha más barata de relevar de toda la red: si hay que rechequearlo, ése es el camino.',
      'Posicionamiento: «Dejá de pelear con tus procesos. Empezá a escalar con automatización».',
    ],
  },
  {
    name: 'Margon',
    rol: 'Producción',
    disciplinas: ['Software a medida', 'Automatización de procesos'],
    pais: 'Argentina (Buenos Aires por el prefijo del WhatsApp, sin dirección publicada)',
    canal: 'WhatsApp',
    verificacion: 'Verificado',
    telefono: [{ numero: '1131930330', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://www.margonsoftware.com', label: 'margonsoftware.com' },
    limite:
      'Un WhatsApp es todo lo que hay: sin mail, sin dirección, sin LinkedIn y sin dotación. Es el partner del que menos se sabe entre los que sí se pueden contactar. El tu-correo@empresa.com de su formulario es un marcador de posición y no entra acá.',
    detalle: [
      'Servicios publicados: aplicaciones web, apps nativas y multiplataforma, automatizaciones, integraciones y APIs, y consultoría técnica.',
      'Casos: un CRM para una desarrolladora inmobiliaria con captura de leads de Meta y embudo kanban, un SaaS de handball con estadísticas en vivo, invitaciones digitales con RSVP y un panel para una concesionaria.',
      'El sitio es un SPA de Vite y estos datos salieron del bundle, como en Celtis. En ese mismo bundle viaja su back-office completo —presupuestos, cobros, firma del cliente, portal—, que es la señal de un equipo chico que se construyó sus propias herramientas.',
      'Posicionamiento: «Transformamos ideas y procesos en soluciones digitales reales».',
    ],
  },
  {
    name: 'CuyoCode',
    rol: 'Producción',
    disciplinas: ['Software a medida'],
    pais: 'Argentina (Villa Mercedes, San Luis)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['info@cuyocode.com.ar', 'cuyosoftware@gmail.com'],
    telefono: [{ numero: '93517706985', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://www.cuyocode.com.ar', label: 'cuyocode.com.ar' },
    otros: [
      { url: 'https://www.linkedin.com/company/cuyocode/', label: 'LinkedIn' },
      { url: 'https://www.instagram.com/cuyocode/', label: 'Instagram' },
    ],
    limite:
      'La agenda es de producto y de escuela además de servicio: cinco SaaS propios más los cursos compiten por las mismas horas que un encargo subcontratado, así que hay que preguntar disponibilidad antes de comprometer fecha, igual que con Celtis. El prefijo 351 del WhatsApp es Córdoba y ellos se ubican en Villa Mercedes, San Luis.',
    detalle: [
      'Desarrollo a medida de apps web y móviles, MVPs y plataformas de gestión: ventas, inventario, clientes, analítica. Operan cinco SaaS propios —Autino, Trainify, Distrify, Orkpad y DailyPath— y dictan cursos, de fundamentos con PSeInt a fullstack.',
      'El sitio es un SPA de Vite: el mail y el WhatsApp salieron del chunk del pie, y las rutas del sitemap.xml. Su página de contacto no renderiza sin JavaScript. No publican dotación.',
      'Posicionamiento: «Software factory» · «democratizamos la gestión empresarial con software a medida».',
    ],
  },
  {
    name: 'Cultura IT',
    rol: 'Producción',
    disciplinas: ['Software a medida', 'Agentes AI', 'Automatización de procesos'],
    pais: 'Argentina (Buenos Aires), Uruguay (Montevideo) y EE.UU. (Delaware)',
    canal: 'Mail',
    verificacion: 'Verificado',
    /* Estaba ofuscado con Cloudflare en su propio sitio y salió de ahí
     * decodificado del atributo data-cfemail, no de un agregador. Mismo caso
     * que PCCentro. */
    mail: ['info@culturait.com.ar'],
    sitio: { url: 'https://www.culturait.com', label: 'culturait.com' },
    otros: [
      { url: 'https://www.linkedin.com/company/culturait', label: 'LinkedIn' },
      { url: 'https://www.instagram.com/cultura.it', label: 'Instagram' },
    ],
    limite:
      'El mail que publican es info@culturait.com.ar y el sitio es culturait.com: el dominio no coincide, que es el tercer caso de la red después de Thorque y Clarika. Lo publican ellos, así que se usa, pero el primer envío va solo y de prueba antes de usarlo en bulk. Se superpone con Agentes AI y con Automatización de procesos: ejecuta bien por atrás y delante del cliente compite. Buena parte del catálogo es GeneXus, que no está entre las seis disciplinas, y un encargo que caiga de ese lado se queda con ellos. El ángulo es el hueco —branding, diseño web y GTM—, nunca ingeniería: tienen equipo propio en Buenos Aires y compiten con su propio costo, igual que Aditi e IT Patagonia. Sin teléfono publicado, después del mail el único camino es un modal de la portada que no tiene URL propia.',
    detalle: [
      'Por qué entra, y es el argumento más directo de la red: Globant es cliente suyo, con caso publicado. El Digital Briefcase que le construyeron es un copiloto comercial hecho con GeneXus Enterprise AI. Globant es demasiado grande para subcontratar a Codence y está en la red como Par; que subcontrate a Cultura IT es la prueba de que Cultura IT trabaja por atrás. Vender Staff Augmentation+ y squads lo dice otra vez por la vía estructural: alquilan capacidad.',
      'Cuatro servicios publicados: Staff Augmentation+ (perfiles AI-native con coaching técnico continuo), AI Agile Squads (equipos de 3 a 5 personas), AMS.AI (mantenimiento evolutivo con soporte 24/7) y Enterprise AI Solutions (integrar IA en procesos críticos sin reescribir el sistema). Especialistas en modernizar legacy —GeneXus, .NET Framework, Java— con IA encima.',
      'Otros clientes publicados: Stellantis (migración de Win a web para operación automotriz), GDM (seis años, operaciones en tres países), Randstad, Prisma, Medife, Assist Card y Scotiabank. Partner GeneXus: Academic, Silver Solution, y AI Partner de Globant Enterprise AI.',
      'Fundada en 2009 como compañía GeneXus. No publican dotación. Posicionamiento: «AI Everywhere. Enterprise Ready.» · «El partner que combina experiencia enterprise + equipos AI-first».',
    ],
  },
  {
    name: 'Broco Solutions',
    rol: 'Producción',
    disciplinas: [
      'Software a medida',
      'Automatización de procesos',
      'Agentes AI',
      'Diseño web',
      'Data / BI',
    ],
    /* Sin `Infraestructura IT` a propósito, aunque vendan cloud: esa etiqueta es
     * la del hierro —cámaras, redes, fibra— y meter operación cloud adentro la
     * volvería inútil para las dos cosas. */
    pais: 'Argentina (Rosario, Santa Fe)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['contacto@brocosolutions.com'],
    telefono: [{ numero: '93412795326', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://www.brocosolutions.com', label: 'brocosolutions.com' },
    otros: [
      { url: 'https://www.linkedin.com/company/brocosolutions/', label: 'LinkedIn' },
      { url: 'https://www.instagram.com/broco.solutions/', label: 'Instagram' },
      { url: 'https://www.tiktok.com/@broco.solutions', label: 'TikTok' },
    ],
    limite:
      'Son dos personas, Tomás Broda y Francisco Velazquez, así que hay que preguntar disponibilidad antes de comprometer fecha, igual que con Celtis y CuyoCode. A favor sobre Celtis: acá hay a quién escalar si uno se enferma. Uno de los dos es docente universitario en la UCA, que son horas comprometidas fuera de Broco, y BrocoAgro es producto propio: la agenda tiene dos frentes que compiten con un encargo subcontratado. Se superpone con cuatro de los seis servicios, así que ejecuta bien por atrás y delante del cliente compite. Es el tercero de la red en Rosario después de Neuralsoft y Thorque, y de los tres es el más chico por lejos.',
    detalle: [
      'Cinco servicios publicados: automatización de procesos, soluciones en la nube, integración de IA, software a medida, y análisis y visualización de datos. Casos: PACSA (automatización corporativa por WhatsApp con enrutamiento inteligente, RRHH y difusión gerencial), Colegio de Odontólogos (transformación digital institucional, estampilla digital y documentos formales), Levain (despliegue, parametrización y mantenimiento cloud de un ERP Odoo) y tres sitios institucionales: Bertino Integrales, Argwines (distribuidora de vinos argentinos en Australia) y Rasafertil.',
      'Producto propio: BrocoAgro, que presentan como «el primer ERP agropecuario conversacional». Stock, gastos, cosecha y ventas gestionados desde WhatsApp con un agente de IA.',
      'El equipo, publicado por ellos: Tomás Broda (Software Lead, AI Advisor, ingeniero en sistemas de la UTN, docente de Inteligencia Artificial en la UCA y capacitador de IA en empresas) y Francisco Velazquez (AI Agents Engineer, ingeniero en sistemas, con experiencia en salud). Lo titulan «Equipo compacto, resultados grandes».',
      'Venden cloud —despliegue y mantenimiento del ERP Odoo de Levain— y eso no lleva disciplina acá: Infraestructura IT es la etiqueta del hierro. Si aparece un scope de operación cloud, la disciplina se agrega en modelo.mjs antes de etiquetarlo.',
      'El WhatsApp es el botón principal del sitio y el mail está publicado en texto plano, sin ofuscar. Posicionamiento: «Menos operación, mas decisión» · «Tecnología que transforma empresas».',
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
    name: 'Finsweet',
    rol: 'Par',
    disciplinas: ['Diseño web', 'Software a medida', 'Rebranding', 'SEO / GEO', 'CRO'],
    pais: 'Sin sede publicada (remotos, equipo en dieciséis países)',
    canal: 'Formulario',
    verificacion: 'Verificado',
    /* Sin mail a propósito, y no por falta de dato: publican legal@, security@,
     * plus@ y victoria.perez@finsweet.com, y ninguna es de ventas. Escribirlas
     * acá las pondría al alcance del workflow de envíos, que es justo el error.
     * Quedan en limite, donde se leen antes de usarse. */
    sitio: { url: 'https://finsweet.com', label: 'finsweet.com' },
    otros: [
      { url: 'https://finsweet.com/agency/sales', label: 'Formulario' },
      { url: 'https://twitter.com/finsweet', label: 'Twitter' },
      { url: 'https://www.instagram.com/finsweet/', label: 'Instagram' },
      { url: 'https://www.youtube.com/finsweet', label: 'YouTube' },
      { url: 'https://forum.finsweet.com/', label: 'Foro' },
    ],
    limite:
      'Es un Par: no se le manda presupuesto. A diferencia de 14islands, acá la clasificación tiene cifra detrás: su carril de autoservicio publica precios y son USD 300 la hora en el bloque más chico —cinco horas de Technical Problem Solving por USD 1.500—, a lo que no queda margen para subcontratarlos. La cartera lo confirma: Dropbox, GitHub, WeTransfer, Vanta, Clay, Abstract, Manitoba Blue Cross y Webflow, que es cliente de ellos. No publican mail de ventas: las cuatro casillas que sí publican son legal@, security@, plus@ (Finsweet+) y victoria.perez@finsweet.com (comunidad), y ninguna sirve para un encargo. El canal es el formulario de /agency/sales. Sin teléfono, sin dirección y sin LinkedIn de empresa enlazado desde su sitio.',
    detalle: [
      'Lo que los hace valer la ficha: hicieron el estándar sobre el que construye Tunel Studio. Client-First es el sistema de nomenclatura de Webflow que usa media industria y Attributes su librería de componentes; los dos son abiertos y gratis, más una extensión de Chrome y un foro público. Antes de resolver a mano un problema de Webflow dentro de un encargo, se mira si Finsweet ya lo publicó.',
      'El autoservicio es la única puerta que no pasa por una conversación de ventas, y es la excepción a que a un Par no se le manda nada: se compran horas sueltas para destrabar algo puntual. Paquetes publicados: cinco horas de TPS USD 1.500, diez USD 2.700, quince USD 3.800, y una auditoría de SEO/AEO USD 1.500 con una semana de plazo.',
      'Esa página está a medio terminar: los bloques «What is included» y «What is not included» siguen en lorem ipsum, y el contrato de ejemplo de USD 4.500 cotiza cinco horas de TPS a USD 2.500 contra las USD 1.500 del paquete real. Las cifras que valen son las de los paquetes, que salen del CMS; el ejemplo es una maqueta.',
      'También son producto, y eso compite por las mismas horas: Wized (apps sobre Webflow), Consent Pro (consentimiento GDPR, desde USD 19), Components, CMS Bridge y la membresía Finsweet+.',
      'Fundada en 2016. SOC 2 Type 2 y Webflow Premium Partner Enterprise. No publican dotación; publican «91% retention» sin decir de qué. Posicionamiento: «We build the websites and web apps behind high-growth B2B».',
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
  {
    name: 'Insights Apps',
    rol: 'Sin datos',
    /* Sin disciplinas por la misma razón que Atila: lo que hacen sale de su
     * copy y no está confirmado, y una disciplina inferida lo haría aparecer en
     * la búsqueda de quién ejecuta un encargo. */
    disciplinas: [],
    pais: 'Estados Unidos (Miami, Florida)',
    canal: 'Formulario',
    verificacion: 'No hay',
    sitio: { url: 'https://www.insightsapps.tech', label: 'insightsapps.tech' },
    otros: [
      { url: 'https://www.insightsapps.tech/#contacto', label: 'Formulario' },
      { url: 'https://instagram.com/fede.garbarino', label: 'Instagram del CEO' },
    ],
    limite:
      'No hay canal verificado: sin mail, sin teléfono y sin LinkedIn de empresa, y el único enlace social es la cuenta personal del CEO, Federico Garbarino. Hasta que haya uno publicado por ellos, no se lo contacta. Y las cifras que publican no se sostienen entre sí: dicen +322 miembros y +65 proyectos desde 2021, que es una relación que no cierra. Nada de eso entra acá.',
    detalle: [
      'Venden desarrollo de apps web y móviles, backend y APIs, arquitectura de base de datos, consultoría de marketing y una escuela interna de programadores llamada MyJobs. Stack publicado: Next.js, React y Flutter. Prometen demo en 48 horas y primera versión en 14 días.',
      'Qué falta: escribir una vez por el formulario y ver si de ahí sale un mail. Con eso se clasifica y sube a Producción, o se descarta con motivo.',
      'Posicionamiento: «Creamos aplicaciones en semanas fáciles de usar».',
    ],
  },
  /* Los tres que juegan en otra escala. El 04/09/2026 dejaron de estar marcados
   * como descartados: lo pidió Alan, y el motivo es que un scope cualquiera puede
   * necesitar a cualquiera de éstos, así que cerrarles la puerta de antemano
   * cuesta más de lo que ahorra. Siguen siendo Pares —no se les manda
   * presupuesto— y el porqué queda escrito en limite, que es lo que evita
   * relevarlos de nuevo en seis meses. Los tres tienen operación grande en
   * Argentina y eso los hace parecer cercanos: la cercanía geográfica no cambia
   * que no compran lo que Codence vende. */
  {
    name: 'Globant',
    rol: 'Par',
    disciplinas: ['Software a medida', 'Agentes AI', 'Data / BI'],
    pais: 'Argentina (Buenos Aires) y global',
    canal: 'Formulario',
    verificacion: 'No hay',
    sitio: { url: 'https://www.globant.com', label: 'globant.com' },
    limite:
      'Es contratista principal y no subcontratista: 336 clientes de más de USD 1M por año y un modelo de capacidad propia en centros de entrega, no de subcontratación de agencias. No se le manda presupuesto. Sirve como referral cuando un lead queda grande, y es competencia cuando no. Su sitio bloquea la lectura automática, así que rechequearlo cuesta un navegador real.',
    detalle: ['28.000 personas, USD 2.450M, cotiza en NYSE. Nació en Argentina.'],
  },
  {
    name: 'Accenture',
    rol: 'Par',
    disciplinas: ['Software a medida', 'Rebranding', 'GTM'],
    pais: 'Irlanda, con operación en Buenos Aires',
    canal: 'Formulario',
    verificacion: 'No hay',
    sitio: { url: 'https://www.accenture.com', label: 'accenture.com' },
    limite:
      'Compra agencias en vez de subcontratarlas: Work & Co y UNLIMITED fueron adquisiciones. Su portal de proveedores es abierto y gratis, así que registrarse cuesta una hora, pero su propia letra dice que sólo llaman si aparece una oportunidad que encaje: no se construye una secuencia de nurturing acá. Sirve como referral cuando un lead queda grande. Las disciplinas salen de Accenture Song y de las agencias que compró.',
    detalle: ['799.000 empleados.'],
  },
  {
    name: 'TP Group',
    rol: 'Par',
    disciplinas: [],
    pais: 'Francia, con 6.000 personas en tres ciudades de Argentina',
    canal: 'Formulario',
    verificacion: 'No hay',
    sitio: { url: 'https://www.tp.com', label: 'tp.com' },
    limite:
      'Su portal de proveedores es sólo por invitación, que es la señal directa de que no esperan proveedores chicos. Queda sin disciplinas a propósito y no por falta de relevamiento: es BPO y experiencia de cliente, y nada de eso entra en la taxonomía, que es lo mismo que decir que no compran branding, ni web, ni ingeniería de producto. Si alguna vez aparece un scope de ese lado, la disciplina se agrega en modelo.mjs antes de etiquetarlo acá.',
    detalle: ['440.000+ empleados, EUR 10.280M.'],
  },
  /* Los seis que están fuera de las seis disciplinas, del lote del 03/09/2026.
   * Cuatro trabajan sobre hierro —depósitos, cámaras, redes, domótica— y dos son
   * producto propio con programa de reventa.
   *
   * El 04/09/2026 pasaron de `Sin datos` y estado `Descartado` a `Especialista`
   * sin estado especial, y las cuatro disciplinas nuevas de modelo.mjs se
   * agregaron para ellos. La razón es la que dio Alan: nunca se sabe cuándo cae
   * un scope donde alguno sirve, y un partner sin disciplina no aparece en esa
   * búsqueda por más que esté cargado. Especialista y no Producción porque
   * ninguno toma un encargo de Codence entero: entran por su parte dentro de un
   * Pod. El contacto verificado ya estaba escrito y sigue igual. */
  {
    name: 'Stoka',
    rol: 'Especialista',
    disciplinas: ['Automatización industrial', 'Software a medida'],
    pais: 'Argentina (Maipú, Mendoza)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['contacto@stokagroup.com'],
    telefono: [{ numero: '92613419061', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://www.stokagroup.com', label: 'stokagroup.com' },
    limite:
      'Automatiza depósitos físicos y no procesos de software, así que queda fuera de las seis disciplinas de Codence. Entra dentro de un Pod y por su parte: la capa de almacenaje de un scope de logística, con el WMS/WCS que la maneja. No toma un encargo de Codence entero.',
    detalle: [
      'Almacenaje automático: transelevadores, torres verticales (VLM), robots de depósito, carruseles y el WMS/WCS que los maneja. Opera en Argentina y Chile. Posicionamiento: «Automatizamos hoy, optimizamos tu futuro».',
    ],
  },
  {
    name: 'PCCentro',
    rol: 'Especialista',
    disciplinas: ['Infraestructura IT'],
    pais: 'Argentina (Buenos Aires)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['info@pccentro.com.ar'],
    telefono: [{ numero: '1169783000', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://www.pccentro.com.ar', label: 'pccentro.com.ar' },
    otros: [
      { url: 'https://ar.linkedin.com/company/pccentrosrl', label: 'LinkedIn' },
      { url: 'https://instagram.com/pccentrosrl', label: 'Instagram' },
    ],
    limite:
      'Es obra e infraestructura física y no producto digital, así que queda fuera de las seis disciplinas. Entra dentro de un Pod cuando un scope necesita la capa de hierro: redes, videovigilancia, control de acceso, IoT o fibra. El mail está ofuscado con Cloudflare en su propio sitio y salió de ahí decodificado, no de un agregador, así que cuenta como publicado por ellos.',
    detalle: [
      'Infraestructura IT: videovigilancia, redes, control de acceso, IoT y fibra óptica. Fundada en 2003. Posicionamiento: «Infraestructura IT: diseño, obra y soporte».',
    ],
  },
  {
    name: 'Punto Domótica',
    rol: 'Especialista',
    disciplinas: ['Domótica'],
    pais: 'Argentina (Rosario y Funes, Santa Fe)',
    canal: 'WhatsApp',
    verificacion: 'Verificado',
    mail: ['iescobar@puntodomotica.com'],
    telefono: [{ numero: '3413661548', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://www.puntodomotica.com', label: 'puntodomotica.com' },
    limite:
      'Instalación de domótica, fuera de las seis disciplinas. Entra dentro de un Pod por la parte de edificio inteligente de un scope: hoteles, oficinas y edificios, que es donde tienen obra hecha. No toma un encargo de Codence entero.',
    detalle: [
      'Iluminación inteligente, climatización, seguridad, control de acceso, cortinas, multimedia y control por voz, para casas, hoteles, oficinas y edificios. Direcciones: Callao 1428 en Rosario y Córdoba 972 en Funes. Posicionamiento: «Convertí tu hogar en una casa inteligente».',
    ],
  },
  {
    name: 'Domotican',
    rol: 'Especialista',
    disciplinas: ['Domótica'],
    pais: 'Argentina (CABA)',
    canal: 'Mail',
    verificacion: 'Verificado',
    mail: ['ventas@domotican.com.ar'],
    telefono: [{ numero: '91173678842', iso: 'AR', prefijo: '+54' }],
    sitio: { url: 'https://www.domotican.com.ar', label: 'domotican.com.ar' },
    otros: [{ url: 'https://instagram.com/domotican.ok', label: 'Instagram' }],
    limite:
      'Es comercio e instalación de dispositivos de hogar inteligente, fuera de las seis disciplinas. Más chico y más de retail que Punto Domótica: sirve para la parte de dispositivos de un scope, con la integración a Google Assistant, HomeKit y Alexa ya resuelta. No toma un encargo de Codence entero.',
    detalle: [
      'Venta e instalación de cerraduras inteligentes, termostatos, interruptores, luces, sensores, timbres y enchufes, compatibles con Google Assistant, HomeKit y Alexa. Posicionamiento: «Domótica fácil de instalar».',
    ],
  },
  {
    name: 'Rindegastos',
    rol: 'Especialista',
    disciplinas: ['Producto / reventa'],
    pais: 'Chile, con operación en 22 países de LATAM',
    canal: 'Formulario',
    verificacion: 'No hay',
    sitio: { url: 'https://www.rindegastos.com', label: 'rindegastos.com' },
    otros: [
      { url: 'https://rindegastos.com/es-cl/partners', label: 'Programa de partners' },
      { url: 'https://www.rindegastos.com/es-cl/cotizar', label: 'Formulario' },
    ],
    limite:
      'Es producto y no capacidad de ejecución: no va a construir lo de Codence. Sirve para la parte de gestión de gastos de un scope, integrando o revendiendo lo suyo, y tiene el canal abierto con su página de partners y su Programa Contadores. Vender producto ajeno es otro negocio que el de licitar ejecución, y si se abre se decide en bases/modelo-de-negocio.md antes que acá. No publica mail.',
    detalle: [
      'SaaS de gestión de gastos empresariales con IA: escaneo de comprobantes, conciliación de tarjetas corporativas, firma digital y validación de políticas. Posicionamiento: «La plataforma líder en gestión de gastos empresariales con IA».',
    ],
  },
  {
    name: 'Sumsub',
    rol: 'Especialista',
    disciplinas: ['Producto / reventa'],
    pais: 'Reino Unido (Londres)',
    canal: 'Formulario',
    verificacion: 'No hay',
    telefono: [{ numero: '2038827770', iso: 'GB', prefijo: '+44' }],
    sitio: { url: 'https://sumsub.com', label: 'sumsub.com' },
    otros: [
      { url: 'https://sumsub.com/partners/', label: 'Programa de partners' },
      { url: 'https://www.linkedin.com/company/sumsub', label: 'LinkedIn' },
    ],
    limite:
      'Mismo caso que Rindegastos: es producto y no capacidad de ejecución. Sirve para la parte de identidad y cumplimiento de un scope —KYC/AML y antifraude—, que cae justo en el ICP de fintech, integrando o revendiendo lo suyo. Su programa de partners tiene tres niveles, Referral, Reseller y Technology, y los tres son para vender Sumsub. No publica mail: se aplica por formulario, con respuesta prometida en 48 horas.',
    detalle: [
      'SaaS de verificación de identidad, KYC/AML y antifraude. Dice 4.000+ clientes. Oficina en 30 St. Mary Axe, Londres. Posicionamiento: «AI-powered trust infrastructure for compliance operations at scale».',
    ],
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

/* Qué se compara cuando ya existe. Los compuestos se aplanan a algo estable:
 * detalle viaja como blocknote con un UUID nuevo por corrida, así que compararlo
 * crudo daría «cambió» siempre. Lo que importa es el texto. */
const comparable = (campo, valor) => {
  if (valor === null || valor === undefined) return null;
  if (campo === "detalle") {
    try {
      return JSON.parse(valor.blocknote ?? "[]")
        .map((b) => (b.content ?? []).map((c) => c.text).join(""))
        .join("\u0000");
    } catch {
      return "";
    }
  }
  if (campo === "mail") return [valor.primaryEmail ?? "", ...(valor.additionalEmails ?? [])].join(",");
  if (campo === "telefono") {
    const extra = (valor.additionalPhones ?? []).map((t) => `${t.callingCode ?? ""}${t.number ?? ""}`);
    return [`${valor.primaryPhoneCallingCode ?? ""}${valor.primaryPhoneNumber ?? ""}`, ...extra].join(",");
  }
  if (campo === "enlaces") {
    /* El CRM guarda la URL sin la barra final, así que compararla cruda daría
     * «cambió» en cada corrida para cualquier enlace escrito con barra. */
    const sinBarra = (u) => (u ?? "").replace(new RegExp("/+$"), "");
    const extra = (valor.secondaryLinks ?? []).map((l) => `${sinBarra(l.url)}|${l.label}`);
    return [sinBarra(valor.primaryLinkUrl), ...extra].join(",");
  }
  if (Array.isArray(valor)) return [...valor].sort().join(",");
  return String(valor);
};

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
  const porNombre = new Map(
    (existentes?.data?.partners ?? []).map((p) => [p.name?.toLowerCase(), p]),
  );

  console.log(ensayo ? '── ENSAYO, no se escribe nada ──\n' : '── Cargando ──\n');

  let creados = 0;
  let salteados = 0;
  let corregidos = 0;

  for (const p of RED) {
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

    const existente = porNombre.get(p.name.toLowerCase());

    if (existente) {
      const distintos = Object.keys(cuerpo).filter(
        (k) => k !== 'name' && comparable(k, cuerpo[k]) !== comparable(k, existente[k]),
      );

      if (!actualizar || distintos.length === 0) {
        const nota = distintos.length ? `  (${distintos.length} campo(s) difieren, --actualizar los corrige)` : '';
        console.log(`  =  ${p.name} ya está, se saltea${nota}`);
        salteados++;
        continue;
      }

      const parche = Object.fromEntries(distintos.map((k) => [k, cuerpo[k]]));

      if (!ensayo) {
        await datos(`/partners/${existente.id}`, {
          method: 'PATCH',
          body: JSON.stringify(parche),
        });
      }
      console.log(`  ~  ${p.name}  ${distintos.join(', ')}`);
      corregidos++;
      continue;
    }

    if (!ensayo) {
      await datos('/partners', { method: 'POST', body: JSON.stringify(cuerpo) });
    }
    console.log(`  +  ${p.name}  ${p.rol}${disc}${marca}`);
    creados++;
  }

  const verbo = ensayo ? 'a crear' : 'creados';
  const verboC = ensayo ? 'a corregir' : 'corregidos';
  const cola = actualizar
    ? `, ${corregidos} ${verboC}, ${salteados} sin cambios.`
    : `, ${salteados} ya estaban.`;
  console.log(`\n${creados} partner(s) ${verbo}${cola}`);
}

main().catch((e) => {
  console.error('\n' + e.message);
  process.exit(1);
});
