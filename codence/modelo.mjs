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
/* El recorte cambió el 10/08: sale `Logística`, entra `Apps`. El ICP pasó a ser
 * producto digital que ya levantó o ya factura, y el motivo está medido — de las
 * 26 tarjetas cargadas hasta ese día, las 13 descalificadas eran casi todas
 * proveedores regionales que se trababan en el mismo punto: no había una persona
 * a la que escribirle. Ver `codence/icp.md`.
 *
 * ⚠️ Antes de correr esto con `Logística` afuera hubo que migrar las cuatro
 * empresas que la usaban: Einship a `B2B / SaaS` porque está viva, y Amarras 11,
 * MEHSA y Cruz del Sur a `Otro`. Este script borra toda opción no declarada, así
 * que al revés les habría vaciado el campo.
 *
 * `Apps` queda en la posición 1 y hereda el violeta que tenía `Logística`: la
 * paleta se asigna por posición, así que B2B / SaaS y Otro no cambian de color. */
const INDUSTRIA = ['Fintech', 'Apps', 'B2B / SaaS', 'Otro'];
/* El circuito de aprobación. Es un estado y no prosa en una Note a propósito:
 * se filtra, se ordena y se ve en el Kanban, que es lo que convierte a Twenty
 * en la bandeja de aprobación en vez de en un archivo.
 *
 * `Reformular` reemplazó a `Descartado` el 09/08, y el cambio no es de nombre:
 * `Descartado` cerraba el borrador y no pedía nada, así que un mensaje malo
 * moría sin decir por qué. `Reformular` es la única flecha que va para atrás y
 * obliga a que el motivo quede escrito en una Note. La corrección barata es la
 * que dice qué está mal, no la que tira el texto. */
const APROBACION = [
  'Sin borrador',
  'Redactado',
  'Aprobado',
  'En Gmail',
  'Enviado',
  'Reformular',
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
/* `GTM` —Go to market— entró el 09/08. Es el único que no produce una pieza y
 * el único que no viaja solo: acompaña a Rebranding y Diseño web cuando la
 * empresa entra a un mercado donde no la conoce nadie. El caso típico es una
 * del exterior apuntando a la Argentina. Ver el dolor 4 de senales.md. */
/* `Agentes AI` entró el 11/08 como sexto servicio, y en la misma decisión
 * `Automatización AI-native` pasó a `Automatización de procesos`. La frontera
 * entre los tres que se tocan está en identidad.md §4 y en el dolor 1 de
 * senales.md: falta quien atienda → Agentes AI · los sistemas no se hablan →
 * Automatización · el sistema no existe → Software a medida.
 *
 * El rename va en forma {label, value} y no como string, y no es un capricho:
 * `aValor` deriva el valor del rótulo, así que el rótulo nuevo produciría
 * `AUTOMATIZACION_DE_PROCESOS`, que no existe en la instancia.
 * `sincronizarOpciones` empareja por `value`, de modo que lo leería como una
 * opción nueva más una que desaparece — y una opción que desaparece deja a sus
 * registros con un valor fuera de la taxonomía, fuera de la cola y en silencio.
 * Conservando el valor viejo, el rename es sólo un rótulo. */
const SERVICIO = [
  'Rebranding',
  'Diseño web',
  'Software a medida',
  { label: 'Automatización de procesos', value: 'AUTOMATIZACION_AI_NATIVE' },
  'Agentes AI',
  'GTM',
];

/* La bandeja de entrada, agregada el 08/08. Una pista es material crudo que
 * todavía no es un prospecto: un enlace, un padrón, una captura, una idea.
 * Existe porque hasta ahora eso no tenía dónde caer y se perdía en la
 * conversación. Es también la puerta por donde entra lo que el agente no puede
 * leer solo: LinkedIn e Instagram no se tocan con navegador automatizado, pero
 * Alan sí los ve, y una captura suya entra por acá. */
const TIPO_PISTA = ['Prospecto posible', 'Fuente o padrón', 'Idea', 'Referencia'];
const ESTADO_PISTA = ['Sin mirar', 'En cola', 'Usada', 'Descartada'];

/* La documentación. `A revisar` es el estado que justifica el objeto: una Note
 * vieja se ve igual que una vigente, y un documento que miente sobre el sistema
 * es peor que no tenerlo. */
const TIPO_DOCUMENTO = ['Cómo se usa', 'Decisión', 'Referencia'];
const ESTADO_DOCUMENTO = ['Vigente', 'A revisar', 'Vieja'];

/* El contenido, agregado el 10/08. Un solo objeto para el blog y para redes: lo
 * que cambia entre un artículo y un post es el `formato` y el `canal`, no la
 * pieza. Agregar un canal nuevo es agregar una opción, no tocar el modelo. */
const FORMATO_CONTENIDO = ['Artículo', 'Post', 'Carrusel', 'Video'];
const CANAL_CONTENIDO = ['Blog', 'LinkedIn', 'Instagram', 'X'];
const ESTADO_CONTENIDO = [
  'Idea',
  'Borrador',
  'A revisar',
  'Aprobado',
  'Programado',
  'Publicado',
];

/* La misma lógica de color que el resto: amarillo lo que espera a Alan, azul lo
 * que ya pasó su revisión, violeta lo que está en vuelo —fecha puesta, todavía
 * no salió— y verde lo cerrado. */
const COLOR_ESTADO_CONTENIDO = {
  Idea: 'gray',
  Borrador: 'orange',
  'A revisar': 'yellow',
  Aprobado: 'blue',
  Programado: 'purple',
  Publicado: 'green',
};

const COLOR_ESTADO_DOCUMENTO = {
  Vigente: 'green',
  'A revisar': 'yellow',
  Vieja: 'gray',
};

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
  /* Naranja y no gris: gris es lo cerrado, y Reformular es la única columna del
   * Kanban donde hay trabajo pendiente del agente. Nació en gris porque Twenty
   * le asigna un color solo a la opción nueva. */
  Reformular: 'orange',
};

/* Los cuatro primeros son los que da la paleta por posición; GTM va en amarillo
 * porque lo eligió Alan al crearlo. Se declara para que la reconciliación de
 * color no se lo pise.
 *
 * Se clavea por rótulo —`opciones` busca `colores[label]`—, así que el rename
 * del 11/08 obliga a cambiar la clave: con la vieja, Automatización caería en el
 * color por posición y cambiaría sola. */
const COLOR_SERVICIO = {
  Rebranding: 'blue',
  'Diseño web': 'purple',
  'Software a medida': 'sky',
  'Automatización de procesos': 'turquoise',
  'Agentes AI': 'green',
  GTM: 'yellow',
};

const PALETA = ['blue', 'purple', 'sky', 'turquoise', 'green', 'yellow', 'orange', 'red', 'gray'];

/**
 * Twenty guarda el valor interno en MAYÚSCULA_CON_GUIONES y muestra el rótulo.
 * El valor es derivado del rótulo.
 *
 * ⚠️ Esto decía que renombrar la etiqueta visible nunca rompe los datos. Es
 * falso, y por derivar el valor de acá: cambiar el rótulo cambia el valor, y
 * `sincronizarOpciones` empareja por `value`, así que un rename declarado como
 * string se aplica como una opción nueva más una que desaparece. Los registros
 * que usaban la que desapareció quedan con un valor fuera de la taxonomía.
 *
 * Renombrar sin romper nada se hace con la forma {label, value} de `opciones`,
 * conservando el valor viejo. Ahí sí el rótulo es sólo un rótulo. Ver SERVICIO.
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
  /* La documentación del sistema, agregada el 09/08. Vivía como una Note suelta
   * marcada en Favoritos, que es un lugar donde algo se queda viejo sin que
   * nadie lo note: una Note no tiene estado, así que no hay forma de ver de un
   * vistazo cuál quedó atrasada. Acá sí. */
  {
    nameSingular: 'documento',
    namePlural: 'documentos',
    labelSingular: 'Documento',
    labelPlural: 'Documentos',
    icon: 'IconBook',
    description:
      'Cómo funciona este sistema, escrito para leer. El README del repo es la fuente; esto es el resumen legible desde adentro del CRM.',
  },
  /* El contenido, agregado el 10/08. Un objeto solo para el blog y las redes: la
   * pieza es la misma y lo que cambia es el formato y por dónde sale. El
   * calendario de salida es la vista Calendar de Twenty sobre `publicarEl`, y el
   * tablero de producción es el Kanban sobre `estado`: las dos salen gratis de
   * los campos, igual que el Kanban del outbound sale de `stage`. */
  {
    nameSingular: 'contenido',
    namePlural: 'contenidos',
    labelSingular: 'Contenido',
    labelPlural: 'Contenidos',
    icon: 'IconPencil',
    description:
      'Los artículos del blog y las piezas de redes, de la idea a la publicación. El plan editorial vive en codence-bases: operacion/web-copy.md.',
  },
];

const CAMPOS = [
  {
    objeto: 'company',
    name: 'industria',
    label: 'Industria',
    type: 'SELECT',
    icon: 'IconBuildingFactory',
    description: 'Las tres del recorte de codence/icp.md más Otro. El ICP es producto digital que ya levantó o ya factura; una empresa fuera de eso entra por la señal, no por el rubro.',
    options: opciones(INDUSTRIA),
  },
  /* Instagram prioriza, no descarta. Decidido el 10/08: 15k seguidores o más
   * sube el candidato en la cola, menos no lo saca. Es un campo y no prosa en la
   * señal justamente para que se pueda ordenar y filtrar en el CRM.
   *
   * Un piso duro se comía el mejor caso de `Marca que no acompaña` —pocos
   * seguidores contra clientes reales, que es Datcisions— y casi todo el fintech
   * B2B. El porqué entero está en codence/icp.md. */
  {
    objeto: 'company',
    name: 'seguidoresIg',
    label: 'Seguidores IG',
    type: 'NUMBER',
    icon: 'IconBrandInstagram',
    description: 'Cuántos seguidores tiene en Instagram. 15.000 o más prioriza el candidato; menos no lo descarta. Se lee con WebFetch, nunca con navegador automatizado.',
  },
  {
    objeto: 'person',
    name: 'gradoConexion',
    label: 'Grado de conexión',
    type: 'SELECT',
    icon: 'IconUsersGroup',
    description: '1º es DM libre. En 2º y 3º el Estado desempata: Calificado va por InMail de Sales Navigator (asunto obligatorio, 400-700 caracteres), Por investigar va por nota de conexión (300, límite de la plataforma). Se lee en el propio perfil, no se deduce.',
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
    settings: { displayedMaxRows: 99 },
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
    description: 'Qué le vendería Codence. Admite varios. Es también dónde tiene que aterrizar el mensaje: el ángulo elige por dónde se abre, el servicio elige a qué llega. GTM nunca va solo: acompaña a Rebranding y Diseño web cuando la empresa entra a un mercado nuevo.',
    options: opciones(SERVICIO, COLOR_SERVICIO),
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
  /* Cuándo abrió el mensaje sin contestarlo. Agregado el 12/08 sobre dos casos
   * reales el mismo día —Quinto en Rintin y Graciela en Megatrans—, y no es un
   * dato de vanidad: separa dos fallas que se arreglan distinto. Si no lo abren,
   * el problema es el asunto y a quién se eligió; si lo abren y no contestan, el
   * problema es el cuerpo. Sin el campo eso vivía en prosa dentro de una Note y
   * no se podía contar.
   *
   * Es DATE y no un booleano porque la fecha responde además cuánto tardaron en
   * abrirlo, y «no visto» es simplemente la ausencia. */
  {
    objeto: 'opportunity',
    name: 'vistoEl',
    label: 'Visto el',
    type: 'DATE',
    icon: 'IconEye',
    description: 'Cuándo abrió el mensaje sin responder. Vacío es que no consta que lo haya abierto. Cambia cómo se escribe el seguimiento: con medición de que lo vio, no se arranca preguntando si lo vio.',
  },
  /* La pausa de la tarjeta, agregada el 12/08. Hasta ahora vivía en `Standby`,
   * que es un estado de `task.status` — y la propia skill admitía el olor: «se
   * pone sobre una tarea, pero habla de la tarjeta entera». Un atributo de la
   * tarjeta guardado en un objeto hijo.
   *
   * Se decidió campo y no una opción de `stage`, y el motivo es Duppla: contestó
   * que Medellín es para el año que viene, así que está en `Respondió` Y en
   * pausa. `stage` guarda un solo valor, de modo que como estado la pausa habría
   * pisado la respuesta —el mejor resultado que dio el outbound hasta hoy— y al
   * despausar nadie sabría a qué etapa vuelve.
   *
   * Como fecha responde además la pregunta que importa, que es hasta cuándo, y
   * se filtra y se ordena igual que `proximoToque`: una tarjeta con fecha futura
   * sale de la cola sin que haya que leer tareas para saberlo. */
  {
    objeto: 'opportunity',
    name: 'pausadaHasta',
    label: 'Pausada hasta',
    type: 'DATE',
    icon: 'IconPlayerPause',
    description: 'Hasta cuándo no se la trabaja. Sale de la cola sin cerrarse: conserva su Estado y vuelve sola cuando la fecha llega. Vacío es activa. Para cerrar un prospecto están Sin interés y Descalificado.',
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
    description: 'El asunto exacto que va a salir. Lo llevan el canal Email y el InMail de LinkedIn. Se lee y se corrige en la ficha antes de aprobar.',
    settings: { displayedMaxRows: 2 },
  },
  /* Los 99 renglones no son decoración: apagado, Twenty recorta el campo a uno
   * solo con puntos suspensivos, y el texto que hay que leer entero antes de
   * aprobar era justo el que no se podía leer. */
  {
    objeto: 'opportunity',
    name: 'borradorCuerpo',
    label: 'Cuerpo del borrador',
    type: 'TEXT',
    icon: 'IconMessage',
    description: 'El cuerpo exacto que va a salir. Editable acá: corregir el texto es parte de aprobarlo.',
    settings: { displayedMaxRows: 99 },
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

  /* La documentación. El `name` del objeto lo crea Twenty solo. */
  {
    objeto: 'documento',
    name: 'tipo',
    label: 'Tipo',
    type: 'SELECT',
    icon: 'IconCategory',
    description: 'Qué clase de documento es. Cómo se usa explica el sistema; Decisión explica por qué es así.',
    options: opciones(TIPO_DOCUMENTO),
  },
  {
    objeto: 'documento',
    name: 'estado',
    label: 'Estado',
    type: 'SELECT',
    icon: 'IconProgressCheck',
    description: 'Un documento en A revisar avisa que el sistema cambió y esto todavía no. Es la razón por la que esto es un objeto y no una Note.',
    options: opciones(ESTADO_DOCUMENTO, COLOR_ESTADO_DOCUMENTO),
    defaultValue: `'${aValor(ESTADO_DOCUMENTO[0])}'`,
  },
  {
    objeto: 'documento',
    name: 'revisadoEn',
    label: 'Revisado el',
    type: 'DATE',
    icon: 'IconCalendarCheck',
    description: 'Cuándo se leyó por última vez contra el sistema real. Un documento sin revisar hace semanas se ve de un vistazo.',
  },
  {
    objeto: 'documento',
    name: 'contenido',
    label: 'Contenido',
    type: 'RICH_TEXT',
    icon: 'IconFileText',
    description: 'El documento. Se lee acá adentro, sin salir del CRM.',
  },

  /* El contenido. El `name` de la pieza lo crea Twenty solo, así que acá van los
   * siete que agregan algo.
   *
   * Lo que NO está y hay que crear a mano en la UI: la relación de una pieza con
   * la que deriva —un post que sale de un artículo—. Este archivo no maneja
   * RELATION, y agregarle soporte por un solo campo no se justifica todavía. */
  {
    objeto: 'contenido',
    name: 'formato',
    label: 'Formato',
    type: 'SELECT',
    icon: 'IconLayoutGrid',
    description: 'Qué clase de pieza es. Un artículo suele parir varios posts: eso se ve en la relación, no acá.',
    options: opciones(FORMATO_CONTENIDO),
    defaultValue: `'${aValor(FORMATO_CONTENIDO[0])}'`,
  },
  {
    objeto: 'contenido',
    name: 'canal',
    label: 'Canal',
    type: 'MULTI_SELECT',
    icon: 'IconShare',
    description: 'Por dónde sale. Es multi porque una misma pieza puede publicarse en más de un lado sin dejar de ser una.',
    options: opciones(CANAL_CONTENIDO),
  },
  {
    objeto: 'contenido',
    name: 'estado',
    label: 'Estado',
    type: 'SELECT',
    icon: 'IconProgressCheck',
    description: 'De la idea a la publicación. Es la columna del Kanban: mirarla tiene que alcanzar para saber de quién es el próximo movimiento.',
    options: opciones(ESTADO_CONTENIDO, COLOR_ESTADO_CONTENIDO),
    defaultValue: `'${aValor(ESTADO_CONTENIDO[0])}'`,
  },
  {
    objeto: 'contenido',
    name: 'publicarEl',
    label: 'Publicar el',
    type: 'DATE',
    icon: 'IconCalendarEvent',
    description: 'Cuándo sale. Es la clave del calendario de salida: sin fecha, la pieza no aparece en esa vista.',
  },
  {
    objeto: 'contenido',
    name: 'servicio',
    label: 'Servicio',
    type: 'SELECT',
    icon: 'IconTargetArrow',
    description: 'En cuál de los seis aterriza. Misma regla que el outbound: una pieza que no aterriza en un servicio deja al lector sin adónde ir.',
    options: opciones(SERVICIO, COLOR_SERVICIO),
  },
  {
    objeto: 'contenido',
    name: 'cuerpo',
    label: 'Cuerpo',
    type: 'RICH_TEXT',
    icon: 'IconFileText',
    description: 'El texto de la pieza. Se escribe y se lee acá adentro, sin salir del CRM.',
  },
  {
    objeto: 'contenido',
    name: 'enlace',
    label: 'Enlace',
    type: 'LINKS',
    icon: 'IconLink',
    description: 'Dónde quedó publicada. Admite secundarios cuando la misma pieza salió en varios canales.',
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

  /* El color entra en la comparación desde el 09/08. Antes era un punto ciego:
   * una opción creada desde la interfaz nace con el color que Twenty le asigna,
   * y el declarado acá no se aplicaba nunca. Le pasó a `Reformular`, que quedó
   * en gris junto a los estados terminales siendo el único accionable. */
  const igual =
    actuales.length === deseadas.length &&
    deseadas.every(
      (o, i) =>
        actuales[i].label === o.label &&
        actuales[i].value === o.value &&
        actuales[i].color === o.color,
    );
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

/**
 * Lo mismo que sincronizarOpciones, para lo que no es una taxonomía: el texto
 * de la descripción, que se lee en la ficha, y los ajustes de visualización.
 * Sin esto, corregir cualquiera de los dos en un campo que ya existe eran DOS
 * cambios —este archivo y la interfaz de Twenty—, que es exactamente el defecto
 * que ya se había arreglado para las listas.
 *
 * `displayedMaxRows` es lo que decide si un TEXT largo se lee entero en la
 * ficha o se recorta a un renglón con puntos suspensivos. Se agregó el 09/08
 * porque el borrador que hay que leer antes de aprobar era el que peor se leía.
 *
 * Devuelve true si tocó algo.
 */
async function sincronizarAjustes(campo, existente) {
  const cuerpo = {};

  if (campo.description && campo.description !== existente.description) {
    cuerpo.description = campo.description;
  }

  const deseados = campo.settings ?? {};
  const actuales = existente.settings ?? {};
  if (Object.keys(deseados).some((k) => deseados[k] !== actuales[k])) {
    cuerpo.settings = { ...actuales, ...deseados };
  }

  const cambios = Object.keys(cuerpo);
  if (!cambios.length) return false;

  if (ensayo) {
    console.log(`  ~  ${campo.objeto}.${campo.name}  ${cambios.join(' y ')}`);
    return true;
  }

  await api(`/fields/${existente.id}`, { method: 'PATCH', body: JSON.stringify(cuerpo) });
  console.log(`  ~  ${campo.objeto}.${campo.name}  ${cambios.join(' y ')}`);
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
      /* Existe, pero todavía puede haberle cambiado la lista, la descripción o
       * los ajustes de visualización. Las dos reconciliaciones corren siempre y
       * por separado: cambiar cualquiera de las tres cosas tiene que ser un
       * solo cambio, acá. */
      const conOpciones = Boolean(campo.options) && (await sincronizarOpciones(campo, existente));
      const conAjustes = await sincronizarAjustes(campo, existente);

      if (conOpciones || conAjustes) {
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

  const ajuste = ajustados ? `, ${ajustados} ${ensayo ? 'a ajustar' : 'ajustado(s)'}` : '';
  const objs = objetosNuevos ? `${objetosNuevos} objeto(s) ${ensayo ? 'a crear' : 'creados'}, ` : '';
  console.log(`\n${objs}${creados} campo(s) ${ensayo ? 'a crear' : 'creados'}, ${salteados} ya existían${ajuste}.`);
}

main().catch((e) => {
  console.error('\n✗ ' + e.message);
  process.exit(1);
});
