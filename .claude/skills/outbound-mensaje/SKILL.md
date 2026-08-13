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

## Si la tarjeta viene en `Reformular`

**`Reformular` es Alan devolviendo un borrador que no le sirve, y siempre trae una Note con el motivo.** Leerla antes que nada: es la corrección más barata que existe, porque ya dice qué está mal.

- **Lo que se rehace es el mensaje, no la investigación.** La señal, la fuente y el ángulo siguen valiendo salvo que la nota diga lo contrario.
- **El reparo se responde, no se esquiva.** Si la nota dice que el mensaje no llega al servicio, el mensaje nuevo tiene que llegar al servicio. Cambiar dos palabras y devolverlo es la peor salida.
- **Si el reparo apunta a la tarjeta y no al texto** —el ángulo está mal, el servicio no corresponde— se dice, y se propone el cambio antes de reescribir.
- Al terminar vuelve a `Redactado`, con `borradorFecha` en hoy. **La Note del motivo no se toca ni se borra:** es el historial de por qué el mensaje es el que es.

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
| `gradoConexion`, si el canal es LinkedIn | Junto con el `stage`, decide el vehículo: DM libre, InMail o nota de conexión |

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
| `Marca que no acompaña` | **La ambición**: a qué aspira la empresa y qué le exige eso a su marca | **El defecto que se observó.** Ni la estética, ni los seguidores, ni el nombre que no coincide |
| `Presencia que no vende` | **La ambición**, salvo que **no tengan sitio**: esa ausencia sí abre | **Cómo funciona el sitio que sí existe.** Un formulario, un recorrido, una jerarquía |
| Los tres de fricción | **Lo observado**, no el mecanismo que uno le supone | Una deducción presentada como hallazgo |

⚠️ **Con `Demanda declarada` hay una trampa:** un aviso abierto también significa que ya eligieron resolverlo contratando. El mensaje tiene que decir qué agrega Codence a eso, **no fingir que no lo vio**.

### El ángulo dice por dónde se abre. El servicio dice dónde tiene que aterrizar

**Las dos cosas, en el mismo mensaje.** El `angulo` elige la puerta y el `servicio` de la tarjeta elige a qué tiene que llegar la observación. Un mensaje que abre bien y aterriza en cualquier lado no sirve: el destinatario no tiene forma de saber para qué le escribieron.

⚠️ **Con `Rebranding` y `Diseño web` el servicio manda las dos puntas**, por lo que dice el Paso 3 bis: abre por la ambición y aterriza en la marca o en el sitio. **Al ángulo le queda dar el momento** — es lo que hace que escribir hoy tenga sentido y no la semana que viene.

| Servicio en la tarjeta | El mensaje tiene que llegar a |
|---|---|
| `Rebranding` | **Un problema de marca**, nombrado como problema comercial: qué le cuesta a la empresa que su marca diga menos de lo que la empresa es |
| `Diseño web` | **Lo que le pasa a alguien que quiere comprarles y entra al sitio.** Una puerta que no lleva a ningún lado, un recorrido que se corta |
| `Software a medida` | **El proceso que hoy se sostiene a mano** y quién lo está sosteniendo |
| `Automatización AI-native` | **El volumen que ya no entra** por el camino actual |
| `GTM` | **Lo que la empresa no trae consigo al mercado nuevo**: entra a un país o una ciudad donde no la conoce nadie, sin lo que la respaldaba en el suyo |

⚠️ **`GTM` es Go to market, y nunca viaja solo.** Va **junto a** `Rebranding` y `Diseño web`, no en lugar de ellos: la estrategia decide qué se dice y a quién, y las otras dos la bajan a piezas. Una tarjeta con `GTM` como único servicio está mal cargada.

**El caso típico es una empresa del exterior que apunta a la Argentina**, y vale igual para cualquier entrada a un mercado donde no la conocen. El detalle está en [`senales.md`](../../../codence/senales.md), en el dolor 4.

⚠️ **Esto se rompió el 09/08 y es el motivo por el que la regla está escrita.** Tres de los cinco primeros mensajes volvieron en `Reformular`, con el mismo reparo en las tres notas: *«nada tiene que ver con rebranding y diseño web»*. Las tres observaciones eran correctas y verificables, y ninguna llegaba al servicio que la tarjeta declaraba. **Una observación que no aterriza en el servicio es una observación interesante, no un motivo para escribir.**

**El control antes de entregar:** leer el mensaje y poder decir en una frase qué contrataría el destinatario si contesta que sí. Si esa frase no es uno de los servicios de la tarjeta, el mensaje no sale.

**Y el segundo control, para marca y sitio:** volver a pasarle el test de «nada grave» a la primera línea. Ninguna expresión regular lo detecta, así que se hace leyendo.

⚠️ **Y si la observación buena aterriza en otro servicio que el cargado**, lo que está mal es la tarjeta, no el mensaje: se dice, y se propone cambiar `servicio` o `angulo` antes de escribir.

**La tensión se muestra, no se declara.** Ninguna señal dice *"su marca es mala"*: se ponen los hechos y el lector saca la conclusión. Ese es el registro, y vale para el cuerpo del mensaje.

⚠️ **Pero mostrar la tensión ya no es con qué se abre cuando el servicio es `Rebranding` o `Diseño web`.** El ejemplo que esta sección usaba —*seis clientes de moda reconocibles contra 550 seguidores*— es exactamente el mensaje que Alan devolvió el 09/08. Ver la sección de abajo: la señal califica, no siempre abre.

## Paso 3 bis — Para marca y sitio se abre por la ambición

**Es la regla que más cambió desde que existe el sistema, y sale de dos devoluciones de Alan del 09/08.** Sobre Datcisions: *«cuando se trata sobre servicios de branding y rebranding, tenemos que generar un mensaje que vaya por otro ángulo, no por los números de seguidores ni por cómo funciona la website»*. Sobre Blanco: *«el mensaje quiere entrar desde el ángulo técnico, sin mencionar que el error marcado es algo que el equipo de marketing lo puede resolver en unos minutos, nada grave»*.

**Aplica a `Rebranding` y a `Diseño web`.** Los otros tres servicios no cambian: fricción, volumen y demanda declarada siguen abriendo por lo observado, porque nada de eso se arregla en un rato.

### El test de «nada grave»

> **Si el equipo de marketing lo resuelve en unos minutos, no puede ser la razón del mensaje.**

Se aplica **antes** de escribir, sobre la observación que se pensaba usar de apertura:

- **Pasa el test** → puede abrir.
- **No lo pasa** → se usa como prueba de que miramos, va **después** de la apertura, o no va. Señalar algo chico como si fuera un hallazgo achica el problema y a quien lo señala.

### Entonces, ¿con qué se abre?

**Por la ambición: a qué aspira la empresa, y qué le exige eso a su marca o a su sitio.** Expandirse, entrar a un mercado nuevo, captar clientes de mejor nivel, dejar de competir por precio.

**La ambición se saca de hechos suyos**, nunca de un elogio ni de una suposición:

| De dónde sale | Ejemplo de dónde se leyó |
|---|---|
| Lo que declararon | Una frase del fundador en prensa sobre a dónde van |
| Capital fresco y para qué dijeron que era | Abren verticales, abren una ciudad, entran a un país |
| El nivel de sus propios clientes | Seis marcas reconocibles en la portada dicen en qué liga juega |
| El precio publicado | A quién le están hablando |

⚠️ **Si no se puede nombrar la ambición con un hecho suyo, no hay apertura y no se escribe.** Es la misma regla de siempre aplicada a la punta nueva: no se inventa hacia dónde va una empresa.

### La única excepción, y es de Alan

**Cuando no tienen sitio, esa ausencia sí abre.** *«Aunque sí cuando la compañía NO tiene website, en ese caso sí se puede usar como fundamento»*. Encaja con el test: una ausencia estructural no se resuelve en minutos y no es un detalle técnico, es que no hay puerta.

### Qué no abre nunca

- **Métricas de vanidad.** Seguidores, likes, alcance.
- **El detalle técnico del sitio que sí existe.** Un formulario que falla, un recorrido que se corta, una jerarquía mal resuelta.
- **El defecto que se arregla en minutos**, por el test de arriba.

### Si se cita una cifra

**Sólo de [`evidencia.md`](../../../codence/evidencia.md), y con la clase de evidencia adentro de la cita.** Es la regla que ya rige para la página de argumento y ahora también para el mensaje. **Nunca un número que no se haya abierto y fichado**, por más redondo que suene.

Dos límites que salen del propio dossier y que hay que mirar antes de usar nada:

- **McKinsey no transfiere a startups.** Su ficha tiene escrito el alcance: *medical technology, consumer goods y retail banking*, empresas cotizantes grandes. Usarlo sobre una startup es justo lo que la ficha prohíbe. Lo que transfiere es el mecanismo, no el número.
- **Una cita con su ficha ocupa entre 80 y 130 caracteres** de un cuerpo de 400 a 700, y desplaza a la observación específica. **Una cifra por mensaje como máximo, y sólo si entra sin sacar nada.** El lugar natural de los números sigue siendo la página de argumento.

## Paso 4 — Escribir

### El vehículo, y después el largo

En LinkedIn el canal no alcanza: hay tres vehículos y cada uno tiene su forma. **Los decide el grado de conexión, y en 2º y 3º también el `stage`.**

| Canal | Vehículo | Asunto | Cuerpo |
|---|---|---|---|
| LinkedIn, grado 1º | DM libre | no lleva | 4-6 líneas |
| LinkedIn, 2º o 3º en `Calificado` | **InMail** de Sales Navigator | **obligatorio**, 1-4 palabras | **400-700 caracteres**, tope duro 800 |
| LinkedIn, 2º o 3º en `Por investigar` | Nota de conexión | no lleva | **300 caracteres, límite de la plataforma** |
| WhatsApp | Mensaje corto | no lleva | 3-5 líneas |
| Email | Asunto + cuerpo | 1-4 palabras | 50-100 palabras, 5-8 líneas |

**El crédito de InMail se gasta donde la señal ya está verificada.** Son finitos y se reponen por mes: una tarjeta que todavía está en `Por investigar` no se lleva uno, va por nota de conexión. Si el crédito se acabó, la nota es la salida, y se dice.

**Los topes son duros, no sugerencias.** Contar los caracteres del cuerpo y decir el número al entregar.

**Esto vale para el primer toque.** Un seguimiento va en la conversación que ya está abierta, así que no elige vehículo ni lleva asunto.

**El idioma es el del prospecto: español o inglés.** Se escribe en el idioma en que la empresa se comunica — el de su sitio, el de su prensa. Una empresa de EE.UU. va en inglés; una brasileña con sitio en inglés, en inglés. Los largos de arriba valen igual en los dos.

### Qué lleva el mensaje

1. **`Hola <nombre de pila>,`** en su propia línea. Con el «Hola»: es el cambio que Alan le hizo a mano a los dos mensajes que aprobó.
2. **Quién escribe, en su propio párrafo y solo.** Nombre, rol, empresa, y a qué se dedica. *«Soy Alan, CEO y fundador de Codence: nos especializamos en diseño y tecnología»* es la muestra del registro, **no un texto a copiar**: cada mensaje lo dice con sus propias palabras. Lo que no se negocia es que las cuatro cosas estén, y que estén antes que nada.
3. **La apertura.** Lo observado para fricción, crecimiento y demanda declarada; **la ambición** para marca y sitio, según el Paso 3 bis.
4. **Qué implica**, sin diagnóstico grandilocuente.
5. **Una frase de contexto:** qué hace Codence con eso. Es lo que no entraba en 300 caracteres, y es lo que separa un mensaje de una consulta suelta. En la nota de conexión sigue sin entrar, y se saltea.
6. **Una pregunta o una puerta chica.** No una propuesta.

**Un párrafo por idea, separados por línea en blanco.** Los dos mensajes que Alan aprobó quedaron en cinco bloques cortos donde el original tenía cuatro más densos. Ese es el respiro que hace que 600 caracteres se lean en diez segundos.

⚠️ **La presentación dejó de ser una frase fija el 09/08, y el motivo importa.** Era literal, *«Soy Alan, de Codence: trabajamos marca y sitios web»*, y los cinco primeros mensajes salieron sonando calcados entre sí. Además describía dos de los cuatro servicios: dejaba afuera `Software a medida` y `Automatización AI-native`.

**El texto va en dos o tres párrafos, separados por línea en blanco.** 700 caracteres corridos son una pared y se abandonan en el primer renglón; los mismos 700 en tres párrafos se leen en diez segundos. Es la regla que evita que el espacio nuevo se gaste en volumen.

### La calidez no es cortesía

Lo que Alan pidió el 09/08 es que el primer mensaje sea más cálido. **Calidez no es fórmula de cortesía, y confundirlas produce exactamente la plantilla que se está tratando de evitar.**

Queda prohibido:

- **El relleno de cortesía.** *«Espero que estés muy bien»*, *«perdón por la interrupción»*, *«te robo un minuto»*. Es lo que abre todo mensaje masivo, y fabrica distancia en vez de cerrarla: delata que quien escribe no sabe nada de quien lee.
- **El elogio genérico.** *«Vienen haciendo un gran trabajo»* sin decir en qué. Si hay algo para reconocer se nombra; si no, no va.

Lo que sí produce calidez: **una línea que reconozca a la persona y no sólo a la empresa**, su rol frente al problema que se está nombrando. A un CTO no le pasa lo mismo con una portada que a un director comercial. Ese dato ya está en la tarjeta, en `jobTitle`, y usarlo es lo que hace que el mensaje no se lea como un mailing.

### Lo que dicen los datos ajenos

Medido por **Gong sobre 85 millones de correos en frío y más de un millón de ciclos de venta a ejecutivos**. Es la única fuente de outbound con datos propios a escala que se revisó: el resto de la literatura es marketing de proveedor que se contradice solo. Vale como número, y sólo esto:

- **Cuerpo de 50 a 100 palabras.** Pasadas las 100 la tasa de respuesta cae fuerte. Coincide con los 5-8 renglones que ya usábamos.
- **Asunto de 1 a 4 palabras.**
- **Vender en el mensaje cuesta hasta un 57% de respuesta.** Es la razón medida de algo que ya era regla acá.
- **Un CTA de interés le gana a pedir una reunión.** Pedir reunión directo rinde peor.
- **El lenguaje de ROI baja el éxito un 15%.** Y palabras como «AI» o «plataforma» también.

**Y para el InMail, la medición de LinkedIn sobre decenas de millones de mensajes** ([su publicación](https://www.linkedin.com/business/talent/blog/talent-strategy/these-inmails-get-best-response-rates), mayo 2021 a abril 2022):

- **Menos de 400 caracteres responde 22% por encima del promedio.** De 400 a 800, 5% por encima. De 800 a 1200, 6% por debajo. Más de 1200, **11% por debajo**.
- El 46% de los InMails que se mandan pasan los 800 caracteres. Ser corto distingue por formato antes de que lo lean.

⚠️ **Qué clase de evidencia es, porque cambia cuánto pesa:** son InMails de **reclutadores**, no de venta consultiva, y los publica la plataforma que los vende. Sirve para fijar la banda y para saber que 1900 es un techo y no una meta. No para más que eso.

⚠️ **Nada de esto reemplaza la observación específica.** Un mensaje de 60 palabras sin señal verificable sigue sin salir.

### Si el mensaje es para el segundo contacto

Una tarjeta puede llevar dos personas: **quien decide** y **quien sufre el dolor**. No se les escribe lo mismo.

- **A quien decide**, la consecuencia comercial: qué le cuesta a la empresa que eso siga así.
- **A quien sufre el dolor**, la observación tal cual, sin traducirla a lenguaje de negocio. Reconoce el problema porque lo vive.

**Escribirle el mismo texto a los dos es la peor versión de esto**, y se nota si comparan. Cada uno lleva su ángulo en la tarjeta.

⚠️ **Una nota de conexión no abre la venta: consigue que te acepten.** Ese es todo su trabajo. El argumento va en el mensaje siguiente, cuando ya hay conversación. Una nota que intenta cerrar algo en 300 caracteres se lee como lo que es.

**Un InMail es lo contrario:** llega al buzón sin pedir permiso, tiene asunto y tiene lugar, así que ahí sí va el argumento entero. Por eso cuesta un crédito y por eso se gasta en las tarjetas que ya están calificadas.

### Nunca poner la cifra

**No se escribe el monto de una ronda.** Ni `USD 30M`, ni `los 6,2 millones`, ni la valuación.

Es la misma razón por la que no se felicita: **la cifra es lo que menciona todo el que les quiere vender algo**, y ponerla delata que la investigación fue sobre su plata. Se abre por **la consecuencia visible** —abren verticales, entran a un país nuevo, abren una ciudad—, que es lo que el destinatario reconoce como propio.

Se puede decir *«con la ronda nueva»* o *«vi que levantaron»*. **El número, no.** Decidido el 08/08 después de leer los cinco primeros mensajes, que lo tenían.

### Qué NO lleva

**Nada de tono partido en dos fragmentos cortos, ni estructura de reversal** — *"No es X. Es Y."*, *"Esto no es un problema de diseño. Es un problema de sistema."* Está prohibido por la guía de marca y salió publicado doce veces en una auditoría porque se verificaba a ojo. **Contarlo con una expresión regular sobre el texto antes de entregarlo**: quien escribió el texto es justo quien no ve el patrón.

⚠️ **La expresión regular tiene que aceptar coma además de punto.** *"No es el problema, es la punta de otra cosa"* es el mismo giro con otra puntuación, y se coló en un borrador del 09/08 justamente porque el patrón buscaba `\.` y no `[.,]`.

**Nunca nombrar un color.** Ni "los ejes en rojo" ni "la barra azul".

**La misma pasada de expresiones regulares cubre el relleno de cortesía y la cifra de una ronda.** Son tres controles sobre el mismo texto y se corren juntos, antes de entregar.

**No reformularle su problema si él ya lo dijo con sus palabras.** Si en la bitácora está lo que dijo, se usa su frase.

**No prometer en futuro sin nada que mostrar.** Entregar algo concreto le gana a anunciar que se va a entregar.

**No arrancar con "¿lo viste?"** cuando hay medición de que sí lo vio. Arrancar de un punto concreto del documento.

**Dónde consta:** el campo `vistoEl` de la Opportunity, agregado el 12/08. Con fecha ahí, la pregunta está descartada y el seguimiento arranca de algo concreto. Vacío significa que no consta que lo haya abierto, **no que no lo haya abierto** — un bloqueador impide el registro y el cero nunca prueba una ausencia, igual que con el escaneo.

Y sirve para leer qué falla: si no lo abren, el problema es el asunto y a quién se eligió; si lo abren y no contestan, el problema es el cuerpo.

## Paso 5 — Entregarlo y dejarlo esperando aprobación

Mostrarle a Alan el texto completo, **el vehículo** y **el conteo de caracteres del cuerpo contra la banda que le toca**. Si el canal es `LinkedIn` o `WhatsApp`, **listo para copiar**: de ahí lo manda él. Si es `Email`, lo que sigue es leerlo en el CRM y aprobarlo, así que alcanza con decirle en qué tarjeta quedó.

Y dejarlo escrito **en la tarjeta**, sobre la Opportunity:

- `borradorAsunto` → el asunto, si el canal es `Email` **o si el vehículo es InMail**. Un InMail sin asunto no se puede mandar: el compositor de Sales Navigator lo exige
- `borradorCuerpo` → el texto completo
- `borradorFecha` → hoy, en GMT-3
- `aprobacion` → `Redactado`

**El borrador va en campos y no en una Note porque un borrador es un estado.** Se filtra, se ordena, se ve en el Kanban y se edita en la ficha — corregir el texto ahí es parte de aprobarlo, y lo que salga va a ser lo que quedó en el campo. Una Note es prosa: sirve para leer, no para saber en qué punto está algo.

**La bitácora se escribe recién cuando el mensaje salió**, con el texto que efectivamente se mandó. Para `Email` la escribe `/enviar --confirmar`; para los otros dos canales, `/outbound-hoy` al registrar el toque. Así se sostiene que la Note se lee y no se cierra nunca.

**No tocar `toques`, `ultimoToque` ni `stage`.** Redactar no es enviar.

⚠️ **Y no poner `aprobacion` en `Aprobado`.** Ese salto lo da Alan a mano en el CRM, y es la única parte del circuito que no da una máquina. Un comando que se autoaprueba no es una aprobación.

**El circuito completo, con la vuelta:**

```
Sin borrador → Redactado → Aprobado → En Gmail → Enviado
                  ↑   ↓
                  Reformular
```

**`Reformular` es la única flecha que va para atrás**, y también la mueve Alan a mano, con una Note que dice por qué.

---

## Si es un seguimiento

Leer **todo** lo que ya salió, en la bitácora. Un seguimiento que repite el primer mensaje quema la tarjeta.

**Arrancar de algo nuevo:** un dato que cambió, algo que se publicó, o un punto concreto de lo que ya se entregó. Si no hay nada nuevo que decir, decirlo — y proponer esperar o cerrar en `Sin interés`.
