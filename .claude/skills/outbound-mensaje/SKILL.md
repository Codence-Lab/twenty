---
name: outbound-mensaje
description: Redacta el mensaje de outbound para un prospecto de Twenty, en el formato y el largo del canal que tenga asignado, y lo deja esperando aprobación en el CRM. No envía nada. Usar cuando Alan pida escribirle a un prospecto o preparar los seguimientos del día.
---

# /outbound-mensaje — redactar, no enviar

**Este comando nunca envía.** Deja el texto escrito y esperando el visto bueno de Alan.

De ahí en más, el camino depende del canal:

| Canal | Qué sigue |
|---|---|
| `Email` | Alan aprueba en el CRM, `/enviar` arma el borrador en Gmail, y `/enviar --confirmar` registra el toque |
| `LinkedIn`, `WhatsApp` | Alan lo copia y lo manda a mano, y `/outbound-hoy` registra el toque cuando él lo confirma |

**Argumento:** el nombre de la empresa. Si no viene, preguntar.

---

## Paso 0 — Traer el prospecto entero

Con las herramientas del servidor MCP de Twenty: la Opportunity, su Company, su punto de contacto, y **las Notes atadas**.

**La bitácora no es opcional.** Ahí está la investigación que justifica el mensaje, el historial de lo que ya se dijo, y —cuando lo hay— lo que salió mal antes. Escribir sin leerla es repetir errores ya cometidos.

Leer también el vocabulario vigente de `canal`, `angulo`, `servicio` y `aprobacion` con `get_field_metadata`, en vez de asumirlo.

## Paso 1 — Comprobar que se puede escribir

Frenar y pedir el dato si falta alguno:

| Falta | Por qué frena |
|---|---|
| `senal` o `fuente` | **Ningún mensaje sale sin una observación específica y verificable con su fuente.** Es la regla de "nunca inventar un número" aplicada al primer contacto |
| `canal` | Decide el formato y el largo |
| Decisor, salvo canal de empresa | Si el mensaje aterriza en una persona, hay que saber en quién |
| `gradoConexion`, si el canal es LinkedIn | Decide DM libre o nota de 300 caracteres |

**El canal `WhatsApp` es la excepción del decisor:** sobre un número de empresa el destinatario es la empresa, así que no hay a quién errarle el nombre.

**No inventar el dato faltante para poder seguir.** Frenar y pedirlo es el comportamiento correcto.

**Y dejar la tarea creada al frenar**, atada a la Company y a la Opportunity, con qué la cierra y con `dueAt` en la fecha en que vence la ventana de la señal. Pedir un dato de viva voz y no anotarlo es cómo un pendiente se pierde: si mañana Alan no se acuerda, la tarjeta queda trabada sin que nadie sepa por qué. Si ya existe una tarea abierta que cubre ese dato, no se duplica.

## Paso 2 — Verificar que la señal siga en pie

**Una señal tiene fecha de vencimiento.** Un sitio se rehace, una búsqueda de empleo se cierra, un dato cambia. Antes de escribir, abrir la `fuente` y confirmar que lo que dice la señal sigue estando.

**`WebFetch` no puede establecer una ausencia.** Sirve para confirmar que algo está, **nunca** para afirmar que algo falta: sobre un sitio armado con JavaScript devuelve el cascarón sin fallar y sin avisar. Toda señal con forma *"no tienen X"* se verifica mirando capturas de la página completa, no con un fetch.

**Un resumen de búsqueda no es una fuente.** Antes de escribir un número, hay que haberlo visto en la página, no en el resumen de la página.

Si la señal ya no está: decirlo, no escribir el mensaje, y proponer volver la tarjeta a `Por investigar`.

**Y comprobar que siga dentro de su ventana**, que está en [`codence/senales.md`](../../../codence/senales.md): **días** para capital fresco, **semanas** para un aviso de empleo, sin vencimiento para las de vigilar. Una señal fuera de su ventana no es una señal: es un dato viejo, y escribir con ella lo delata.

## Paso 3 — Con qué se abre

**La familia de la señal decide la apertura.** Es lo que dice `senales.md`, y el `angulo` de la tarjeta es lo que la nombra.

| Ángulo | Abre por | Y nunca por |
|---|---|---|
| `Demanda declarada` | **Lo que el aviso dice**, citado. *"Están buscando un Email Marketing & Growth Lead"* es un hecho | *"Les falta generación de demanda"*, que es un juicio |
| `Crecimiento reciente` | **La consecuencia** de haber levantado: expandirse es competir por atención contra otros que también levantaron | **La felicitación.** *"¡Felicitaciones por la Serie A!"* es el saludo que reciben doscientas veces y que manda todo el que les quiere vender algo |
| `Marca que no acompaña` | **El problema comercial**, nombrado en una frase. Si viene con crecimiento reciente, abre por la expansión | La estética. *"Su marca se ve vieja"* no es un motivo |
| `Presencia que no vende` | **La puerta que no lleva a ningún lado**, seguida hasta el final y contada como lo que le pasa a quien quiere comprarles | Una crítica al diseño. El problema es comercial: alguien quiso y no pudo |
| Los tres de fricción | **Lo observado**, no el mecanismo que uno le supone | Una deducción presentada como hallazgo |

⚠️ **Con `Demanda declarada` hay una trampa:** un aviso abierto también significa que ya eligieron resolverlo contratando. El mensaje tiene que decir qué agrega Codence a eso, **no fingir que no lo vio**.

**La tensión se muestra, no se declara.** Ninguna de las ocho señales cargadas dice *"su marca es mala"*: dicen dos hechos que no cierran —seis clientes de moda reconocibles contra 550 seguidores— y el lector saca la conclusión. Ese es el registro.

## Paso 4 — Escribir

### El formato por canal

| Canal | Formato | Largo |
|---|---|---|
| LinkedIn, grado 1º | DM libre | 4-6 líneas |
| LinkedIn, grado 2º o 3º | Nota de conexión | **300 caracteres, límite de la plataforma** |
| WhatsApp | Mensaje corto | 3-5 líneas |
| Email | Asunto + cuerpo | 5-8 líneas |

**Los 300 caracteres son un límite duro, no una sugerencia.** Contarlos.

**El idioma es el del prospecto: español o inglés.** Se escribe en el idioma en que la empresa se comunica — el de su sitio, el de su prensa. Una empresa de EE.UU. va en inglés; una brasileña con sitio en inglés, en inglés. Los largos de arriba valen igual en los dos.

### Qué lleva el mensaje

1. **Quién escribe.** `Soy Alan, de Codence: trabajamos marca y sitios web.` Va primero y no se saltea.
2. **La observación específica**, en una línea, verificable por el destinatario en segundos.
3. **Qué implica**, sin diagnóstico grandilocuente.
4. **Una pregunta o una puerta chica.** No una propuesta.

### Lo que dicen los datos ajenos

Medido por **Gong sobre 85 millones de correos en frío y más de un millón de ciclos de venta a ejecutivos**. Es la única fuente de outbound con datos propios a escala que se revisó: el resto de la literatura es marketing de proveedor que se contradice solo. Vale como número, y sólo esto:

- **Cuerpo de 50 a 100 palabras.** Pasadas las 100 la tasa de respuesta cae fuerte. Coincide con los 5-8 renglones que ya usábamos.
- **Asunto de 1 a 4 palabras.**
- **Vender en el mensaje cuesta hasta un 57% de respuesta.** Es la razón medida de algo que ya era regla acá.
- **Un CTA de interés le gana a pedir una reunión.** Pedir reunión directo rinde peor.
- **El lenguaje de ROI baja el éxito un 15%.** Y palabras como «AI» o «plataforma» también.

⚠️ **Nada de esto reemplaza la observación específica.** Un mensaje de 60 palabras sin señal verificable sigue sin salir.

### Si el mensaje es para el segundo contacto

Una tarjeta puede llevar dos personas: **quien decide** y **quien sufre el dolor**. No se les escribe lo mismo.

- **A quien decide**, la consecuencia comercial: qué le cuesta a la empresa que eso siga así.
- **A quien sufre el dolor**, la observación tal cual, sin traducirla a lenguaje de negocio. Reconoce el problema porque lo vive.

**Escribirle el mismo texto a los dos es la peor versión de esto**, y se nota si comparan. Cada uno lleva su ángulo en la tarjeta.

⚠️ **Una nota de conexión no abre la venta: consigue que te acepten.** Ese es todo su trabajo. El argumento va en el mensaje siguiente, cuando ya hay conversación. Una nota que intenta cerrar algo en 300 caracteres se lee como lo que es.

### Nunca poner la cifra

**No se escribe el monto de una ronda.** Ni `USD 30M`, ni `los 6,2 millones`, ni la valuación.

Es la misma razón por la que no se felicita: **la cifra es lo que menciona todo el que les quiere vender algo**, y ponerla delata que la investigación fue sobre su plata. Se abre por **la consecuencia visible** —abren verticales, entran a un país nuevo, abren una ciudad—, que es lo que el destinatario reconoce como propio.

Se puede decir *«con la ronda nueva»* o *«vi que levantaron»*. **El número, no.** Decidido el 08/08 después de leer los cinco primeros mensajes, que lo tenían.

### Qué NO lleva

**Nada de tono partido en dos fragmentos cortos, ni estructura de reversal** — *"No es X. Es Y."*, *"Esto no es un problema de diseño. Es un problema de sistema."* Está prohibido por la guía de marca y salió publicado doce veces en una auditoría porque se verificaba a ojo. **Contarlo con una expresión regular sobre el texto antes de entregarlo**: quien escribió el texto es justo quien no ve el patrón.

**Nunca nombrar un color.** Ni "los ejes en rojo" ni "la barra azul".

**No reformularle su problema si él ya lo dijo con sus palabras.** Si en la bitácora está lo que dijo, se usa su frase.

**No prometer en futuro sin nada que mostrar.** Entregar algo concreto le gana a anunciar que se va a entregar.

**No arrancar con "¿lo viste?"** cuando hay medición de que sí lo vio. Arrancar de un punto concreto del documento.

## Paso 5 — Entregarlo y dejarlo esperando aprobación

Mostrarle a Alan el texto completo, con el conteo de caracteres si es una nota de conexión, y en qué canal va. Si el canal es `LinkedIn` o `WhatsApp`, **listo para copiar**: de ahí lo manda él. Si es `Email`, lo que sigue es leerlo en el CRM y aprobarlo, así que alcanza con decirle en qué tarjeta quedó.

Y dejarlo escrito **en la tarjeta**, sobre la Opportunity:

- `borradorAsunto` → el asunto, si el canal es `Email`
- `borradorCuerpo` → el texto completo
- `borradorFecha` → hoy, en GMT-3
- `aprobacion` → `Redactado`

**El borrador va en campos y no en una Note porque un borrador es un estado.** Se filtra, se ordena, se ve en el Kanban y se edita en la ficha — corregir el texto ahí es parte de aprobarlo, y lo que salga va a ser lo que quedó en el campo. Una Note es prosa: sirve para leer, no para saber en qué punto está algo.

**La bitácora se escribe recién cuando el mensaje salió**, con el texto que efectivamente se mandó. Para `Email` la escribe `/enviar --confirmar`; para los otros dos canales, `/outbound-hoy` al registrar el toque. Así se sostiene que la Note se lee y no se cierra nunca.

**No tocar `toques`, `ultimoToque` ni `stage`.** Redactar no es enviar.

⚠️ **Y no poner `aprobacion` en `Aprobado`.** Ese salto lo da Alan a mano en el CRM, y es la única parte del circuito que no da una máquina. Un comando que se autoaprueba no es una aprobación.

---

## Si es un seguimiento

Leer **todo** lo que ya salió, en la bitácora. Un seguimiento que repite el primer mensaje quema la tarjeta.

**Arrancar de algo nuevo:** un dato que cambió, algo que se publicó, o un punto concreto de lo que ya se entregó. Si no hay nada nuevo que decir, decirlo — y proponer esperar o cerrar en `Sin interés`.
