---
name: outbound-hoy
description: La agenda de outbound del día. Lee los prospectos de Twenty, dice a quién le toca primer mensaje y a quién seguimiento, avisa de las tarjetas trabadas, y registra lo que Alan confirma que mandó. Usar al empezar el día o cuando Alan pregunte a quién le toca escribirle.
---

# /outbound-hoy — la agenda del día

**Este comando no envía nada.** Dice a quién le toca y registra lo que Alan confirma que ya mandó. El envío es siempre manual: por LinkedIn no hay forma legítima de automatizarlo.

---

## El modelo, en dos líneas

Un prospecto vive repartido en tres objetos de Twenty:

- **Company** — la empresa: `name`, `domainName`, `industria`
- **Person** — el decisor: `name`, `jobTitle`, `linkedinLink`, `emails`, `gradoConexion`
- **Opportunity** — el outbound: `stage` es el **Estado**, más `canal`, `senal`, `fuente`, `angulo`, `servicio`, `toques`, `ultimoToque`, `proximoToque`, `calificadoEn`, `auditoria`

La bitácora son **Notes** atadas a la empresa y a la oportunidad.

**Los valores internos van en mayúscula** (`Logística` → `LOGISTICA`, `Por investigar` → `POR_INVESTIGAR`). Al mostrarle algo a Alan, usar siempre el rótulo, nunca el valor interno.

## Paso 0 — Ver el vocabulario vigente

Antes de nombrar un estado o un canal, leer las opciones reales del campo — no las de memoria. Con las herramientas del servidor MCP de Twenty:

```
get_field_metadata sobre opportunity.stage, opportunity.canal, opportunity.angulo,
opportunity.servicio, company.industria, person.gradoConexion
```

**Si alguien agregó una opción desde la interfaz, esto la trae.** Asumir la lista vieja hace desaparecer tarjetas de la cola en silencio.

## Paso 1 — Armar la cola

Traer las oportunidades con `find_many_opportunities`, con su empresa y su punto de contacto.

Repartirlas en tres grupos, **en este orden de prioridad**:

**A. Le toca seguimiento** — `proximoToque` es hoy o antes, y el estado no es terminal.

**B. Le toca primer mensaje** — estado `Calificado` y `toques` en 0.

**C. Trabadas** — todo lo demás que no está en un estado terminal. Para cada una hay que decir **qué le falta**, no "esperando".

Los tres estados terminales son **`Convertido`, `Sin interés` y `Descalificado`**. No aparecen en ningún grupo.

**Después del tercer toque sin respuesta no se agenda otro.** Un cuarto mensaje no mejora la tasa de respuesta: se propone mover a `Sin interés`.

## Paso 2 — Qué le falta a cada trabada

Es lo más útil del comando, y no se resuelve con una frase genérica. Mirar el registro y decir el faltante concreto:

| Le falta | Cómo se ve |
|---|---|
| Decisor | No hay Person atada, o la que hay no decide |
| Canal | `canal` vacío — no se sabe por dónde sale |
| Grado de conexión | `canal` es `LinkedIn` y `gradoConexion` está vacío |
| Señal o fuente | `senal` o `fuente` vacíos |
| Calificar | Tiene puerta y decisor pero sigue en `Por investigar` |

**El grado de conexión no es un detalle:** decide si el mensaje es un DM libre (1º) o una nota de 300 caracteres (2º y 3º). Sin eso, `/outbound-mensaje` no puede escribir.

**Una Person que existe no siempre es un decisor.** Si el cargo no decide —una coordinación, una asistencia— la tarjeta sigue trabada aunque tenga contacto. Decirlo así.

## Paso 3 — Presentarlo

Corto y accionable. Para cada uno de A y B: empresa, decisor y cargo, canal, y **la señal en una línea**. Para las trabadas: empresa y qué le falta.

Si no hay nada en A ni en B, **decirlo derecho**: no hay a quién escribirle hoy, y el cuello de botella es la lista.

## Paso 4 — Registrar lo que Alan confirma

**Sólo cuando Alan dice que mandó algo.** Nunca antes, y nunca porque el mensaje se haya redactado.

Al registrar un toque, sobre la Opportunity:

- `toques` +1
- `ultimoToque` → la fecha real que diga Alan
- `proximoToque` → cuatro días después, **salvo que con eso llegue al cuarto toque**: ahí va vacío y se propone `Sin interés`
- `stage` sube un escalón: `Contactado` → `Seguimiento 1` → `Seguimiento 2`

Y **dejar entrada en la bitácora**: una Note nueva o un párrafo agregado a la que ya existe, atada a la empresa y a la oportunidad. Un campo que cambia sin dejar rastro pierde el historial — es la razón por la que la bitácora existe.

Si respondió: `stage` → `Respondió`. Si no le interesa: `Sin interés`, y `proximoToque` vacío.

**Fechas en GMT-3**, que es el huso de Alan, no UTC. Un toque registrado a las 22:00 no es de mañana.

---

## Reglas que no se negocian

**Nunca automatizar el envío por LinkedIn.** No hay API de mensajería para terceros y hacerlo con un navegador viola sus términos; la sanción es la restricción de la cuenta, que es el único canal de distribución.

**Nunca mandar email frío en tanda desde `core@codencelab.com`.** Es el dominio que entrega las auditorías y no tiene reputación de envío. De a pocos por día, escritos uno por uno.

**Un estado terminal es terminal.** Si una tarjeta terminal tiene `proximoToque` cargado, eso es un defecto: avisarlo.

**No inventar el faltante.** Si no está claro qué le falta a una tarjeta, decir qué se miró y qué no se pudo determinar.
