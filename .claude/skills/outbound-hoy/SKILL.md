---
name: outbound-hoy
description: La agenda de outbound del día. Lee los prospectos de Twenty, dice a quién le toca primer mensaje y a quién seguimiento, avisa de las tarjetas trabadas, y registra lo que Alan confirma que mandó. Usar al empezar el día o cuando Alan pregunte a quién le toca escribirle.
---

# /outbound-hoy — la agenda del día

**Este comando no envía nada.** Dice a quién le toca y en qué punto del circuito está cada tarjeta.

El registro del toque se reparte por canal: **para `LinkedIn` y `WhatsApp` lo hace este comando**, cuando Alan confirma que mandó. **Para `Email` lo hace `/enviar --confirmar`**, que no pregunta sino que lo verifica contra el buzón de Gmail. El envío en sí lo aprieta Alan siempre, en los tres canales.

---

## El modelo, en dos líneas

Un prospecto vive repartido en tres objetos de Twenty:

- **Company** — la empresa: `name`, `domainName`, `industria`
- **Person** — el decisor: `name`, `jobTitle`, `linkedinLink`, `emails`, `gradoConexion`
- **Opportunity** — el outbound: `stage` es el **Estado**, más `canal`, `senal`, `fuente`, `angulo`, `servicio`, `toques`, `ultimoToque`, `proximoToque`, `calificadoEn`, `argumento`, `auditoria`, y el circuito de aprobación del canal Email: `aprobacion`, `borradorAsunto`, `borradorCuerpo`, `borradorFecha`, `gmailDraftId`

La bitácora son **Notes** atadas a la empresa y a la oportunidad. Y lo que falta hacer son **Tasks**, atadas igual, con `status`, `dueAt` y `assignee`. **La Note se lee y no se cierra; la Task se cierra.**

**Los valores internos van en mayúscula** (`Logística` → `LOGISTICA`, `Por investigar` → `POR_INVESTIGAR`). Al mostrarle algo a Alan, usar siempre el rótulo, nunca el valor interno.

## Paso 0 — Ver el vocabulario vigente

Antes de nombrar un estado o un canal, leer las opciones reales del campo — no las de memoria. Con las herramientas del servidor MCP de Twenty:

```
get_field_metadata sobre opportunity.stage, opportunity.canal, opportunity.angulo,
opportunity.servicio, opportunity.aprobacion, company.industria, person.gradoConexion
```

**Si alguien agregó una opción desde la interfaz, esto la trae.** Asumir la lista vieja hace desaparecer tarjetas de la cola en silencio.

## Paso 1 — Armar la cola

Traer las oportunidades con `find_many_opportunities`, con su empresa y su punto de contacto.

Repartirlas en grupos, **en este orden de prioridad**:

**A. Le toca seguimiento** — `proximoToque` es hoy o antes, y el estado no es terminal.

**B. Le toca primer mensaje** — estado `Calificado` y `toques` en 0.

**C. Trabadas** — todo lo demás que no está en un estado terminal. Para cada una hay que decir **qué le falta**, no "esperando".

**D. En pausa** — las que tienen una tarea en `Standby`. Van al final, **sin fecha y sin urgencia**, diciendo desde cuándo y qué las despausa.

Los tres estados terminales son **`Convertido`, `Sin interés` y `Descalificado`**. No aparecen en ningún grupo.

### Y el circuito de aprobación, aparte

Las tarjetas con `aprobacion` en movimiento **ya tienen el mensaje escrito**: no le tocan a Alan como "escribirle a alguien", le tocan como "resolvé este". Van en su propio bloque, arriba de A, porque son trabajo que está a un paso de salir:

| `aprobacion` | Qué le toca a Alan |
|---|---|
| `Redactado` | **Leerlo y aprobarlo** en el CRM, o corregir el texto en la ficha primero |
| `Aprobado` | Nada: le toca a `/enviar` armar el borrador |
| `En Gmail` | **Mandarlo desde Gmail.** Si lleva más de tres días acá, se reporta como trabado |

**Una tarjeta con borrador no aparece además en A ni en B.** Ofrecerle a Alan que le escriba a alguien cuyo mensaje ya está escrito y esperando su visto bueno es hacerle escribir dos veces lo mismo.

### `Standby` pausa el prospecto, no solo la tarea

Es la cuarta opción de `task.status`, agregada el 08/08. **Significa que el prospecto está en pausa pero sigue en proceso: no se lo descarta.** Tres consecuencias:

1. **Se pone sobre una tarea, pero habla de la tarjeta entera.** Es la diferencia con `To do` y `Done`, que hablan solo de la tarea.
2. **No es terminal.** No se confunde con `Sin interés` ni `Descalificado`, que sí cierran el prospecto. Una tarjeta en pausa vuelve.
3. **Una tarjeta con una tarea en `Standby` sale de A, B y C**, y aparece solo en D. Si siguiera en la cola, la pausa no serviría de nada — que es exactamente lo que pasaba con ICG10, saliendo como seguimiento vencido en todos los reportes.

**`proximoToque` no se borra al pausar:** queda como registro de cuándo le tocaba. Al despausar, se recalcula desde la fecha real, no se hereda la vieja.

**Después del tercer toque sin respuesta no se agenda otro.** Un cuarto mensaje no mejora la tasa de respuesta: se propone mover a `Sin interés`.

## Paso 2 — Qué le falta a cada trabada

Es lo más útil del comando, y no se resuelve con una frase genérica.

**El faltante ya no se deduce leyendo prosa: está escrito.** Desde el 07/08, cada deuda de un prospecto es una **Task** atada a su Company y a su Opportunity, con vencimiento y dueño. Traerlas con `find_many_tasks` filtrando `status` distinto de `DONE`, y usarlas como respuesta:

- **Asignada a Alan** = la deuda es suya y solo él puede resolverla. Leer un grado en LinkedIn, mandar un mensaje, mirar capturas. Va en el reporte con su fecha.
- **Sin asignar** = la resuelvo yo. Se dice qué es y que está en la cola, no se le pide a Alan.
- **Con `dueAt` en hoy o antes** = la deuda está venciendo junto con la señal. **Sube al tope del reporte**, arriba de los seguimientos.

Si una tarjeta está trabada y **no tiene tarea abierta que lo explique**, eso es un defecto: avisarlo y crear la tarea que falta. Y la tabla de abajo sigue valiendo para saber qué mirar:

| Le falta | Cómo se ve |
|---|---|
| Decisor | No hay Person atada, o la que hay no decide |
| Canal | `canal` vacío — no se sabe por dónde sale |
| Grado de conexión | `canal` es `LinkedIn` y `gradoConexion` está vacío |
| Señal o fuente | `senal` o `fuente` vacíos |
| Calificar | Tiene puerta y decisor pero sigue en `Por investigar` |
| **Señal vencida** | El `angulo` es de una familia con ventana y `calificadoEn` quedó lejos |

**Una señal fuera de su ventana no es una señal: es un dato viejo.** Las ventanas están en `senales.md`: **días** para capital fresco —a las tres semanas felicitar por una ronda es llegar tarde y se nota—, **semanas** para un aviso de empleo, que se cierra y se cubre. Las de `vigilar` no vencen.

Una tarjeta con la señal vencida **no se manda igual**: se dice, y se propone volverla a `Por investigar` o buscarle una señal nueva. Escribir con una ronda de tres meses lo delata.

**El grado de conexión no es un detalle:** decide si el mensaje es un DM libre (1º) o una nota de 300 caracteres (2º y 3º). Sin eso, `/outbound-mensaje` no puede escribir.

**Una Person que existe no siempre es un decisor.** Si el cargo no decide —una coordinación, una asistencia— la tarjeta sigue trabada aunque tenga contacto. Decirlo así.

⚠️ **Y una tarjeta en `Calificado` sin canal, o cuya Person no decide, es un defecto — no una tarjeta de la cola.** `Calificado` significa que tiene puerta y decisor; si no los tiene, el grupo B la va a ofrecer para primer mensaje y `/outbound-mensaje` va a frenar. **Se devuelve a `Por investigar` con su tarea, y se avisa.** El 08/08 le pasó a cuatro a la vez: Bull Market Brokers, Datcisions, Udaondo y Security 24.

⚠️ **Un canal cargado no vuelve viva una señal muerta.** Conseguir el decisor de una tarjeta cuya ronda venció no la califica: hay con quién hablar, falta de qué. Esas se quedan en `Por investigar` esperando señal nueva, y se dice así.

## Paso 3 — Presentarlo

Corto y accionable. Para cada uno de A y B: empresa, decisor y cargo, canal, y **la señal en una línea**. Para las trabadas: empresa y qué le falta.

Si no hay nada en A ni en B, **decirlo derecho**: no hay a quién escribirle hoy, y el cuello de botella es la lista.

## Paso 4 — Registrar lo que Alan confirma

**Este paso es para `LinkedIn` y `WhatsApp`.** Son los canales que Alan manda a mano y de los que no queda rastro consultable, así que su palabra es la única fuente.

⚠️ **Para `Email` no se registra acá.** Lo hace `/enviar --confirmar`, que lo verifica contra el buzón de Gmail en vez de preguntar. Si Alan dice que mandó un email, la respuesta correcta es correr ese comando, no anotarlo a mano: preguntar es reintroducir justo el paso que falla. Por ahí se cayó el toque 2 de Warren, vencido el 04/08.

**Sólo cuando Alan dice que mandó algo.** Nunca antes, y nunca porque el mensaje se haya redactado.

Al registrar un toque, sobre la Opportunity:

- `toques` +1
- `ultimoToque` → la fecha real que diga Alan
- `proximoToque` → cuatro días después, **salvo que con eso llegue al cuarto toque**: ahí va vacío y se propone `Sin interés`
- `stage` sube un escalón: `Contactado` → `Seguimiento 1` → `Seguimiento 2`
- `aprobacion` → `Enviado`, y `borradorAsunto` y `borradorCuerpo` quedan vacíos

**Ese último punto es lo que cierra el circuito de LinkedIn y WhatsApp.** El mensaje se escribe en la tarjeta igual que para Email —es de donde Alan lo copia—, pero ahí **no hay nada que aprobar: se copia y se manda.** La tarjeta se queda en `Redactado` hasta que Alan confirme, y recién entonces pasa a `Enviado`. Un borrador que quedó en `Redactado` con el toque ya registrado es un defecto: avisarlo.

⚠️ **Para estos dos canales, `Aprobado` no se usa.** `/enviar` sólo mira el canal Email, así que una tarjeta de LinkedIn en `Aprobado` se queda ahí para siempre esperando a un comando que nunca la va a tomar. Si aparece una, avisarlo y devolverla a `Redactado`.

Y **dejar entrada en la bitácora**: una Note nueva o un párrafo agregado a la que ya existe, atada a la empresa y a la oportunidad. Un campo que cambia sin dejar rastro pierde el historial — es la razón por la que la bitácora existe.

Si respondió: `stage` → `Respondió`. Si no le interesa: `Sin interés`, y `proximoToque` vacío.

**Fechas en GMT-3**, que es el huso de Alan, no UTC. Un toque registrado a las 22:00 no es de mañana.

### Y cerrar la tarea que el dato resolvió

**Cada vez que llega un dato que estaba pendiente, se cierra su Task y se saca su `PENDIENTE` de `senal`, en la misma pasada.** Las dos escrituras, no una.

- `status` de la Task → `DONE`
- El `PENDIENTE:` correspondiente sale del campo `senal`

**No son dos mantenimientos: es uno con dos escrituras.** El `PENDIENTE` vive en `senal` a propósito, porque `senal` es lo que se lee en el instante anterior a redactar y ahí la advertencia tiene que estar a la vista. Pero **un `PENDIENTE` que sobrevive a su tarea cerrada es un defecto**, igual que una tarjeta terminal con `proximoToque` cargado: avisarlo.

Vale también al revés. Si Alan trae un dato que nadie había pedido —un canal, un decisor, un grado— y hay una tarea abierta que lo cubre, se cierra igual.

---

## Reglas que no se negocian

**Nunca automatizar el envío por LinkedIn.** No hay API de mensajería para terceros y hacerlo con un navegador viola sus términos; la sanción es la restricción de la cuenta, que es el único canal de distribución.

**Nunca mandar email frío en tanda desde `core@codencelab.com`.** Es el dominio que entrega las auditorías y no tiene reputación de envío. De a pocos por día, escritos uno por uno.

Sigue valiendo entera con `/enviar`: ese comando **arma** el borrador en Gmail, uno por prospecto y sólo sobre lo que Alan aprobó en el CRM, con tope de 8 por día. **El enviar lo sigue apretando él.** Lo que se automatizó es el transporte y la verificación, nunca el volumen ni la redacción.

**Un estado terminal es terminal.** Si una tarjeta terminal tiene `proximoToque` cargado, eso es un defecto: avisarlo.

**No inventar el faltante.** Si no está claro qué le falta a una tarjeta, decir qué se miró y qué no se pudo determinar.
