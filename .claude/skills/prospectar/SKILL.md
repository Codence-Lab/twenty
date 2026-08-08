---
name: prospectar
description: Investiga empresas, las califica contra el ICP de Codence y las carga en Twenty, cada una con su señal de fricción y la fuente que la respalda. Usar cuando Alan pegue una lista de empresas o pida buscar prospectos de una industria y un país.
---

# /prospectar — conseguir el lead

Investiga, califica y carga. **Ninguna tarjeta entra sin una señal verificable y una fuente que se haya abierto.**

**Argumento:** una industria y un país (`logística, Argentina`), una lista de empresas pegada, o **candidatos que vienen de `/buscar`** — que ya trabajó las fuentes y verificó. En ese caso no se rehace la investigación: se comprueba que la señal siga en pie y se carga.

**El catálogo de señales es [`codence/senales.md`](../../../codence/senales.md).** Dice qué hace que una empresa sea un prospecto, dónde se publica cada familia y qué la descalifica. Este comando carga; ese documento decide qué merece cargarse.

---

## Paso 0 — El vocabulario vigente

Leer las opciones reales con `get_field_metadata` sobre `company.industria`, `opportunity.canal`, `opportunity.angulo`, `opportunity.servicio`, `opportunity.stage` y `person.gradoConexion`.

**Cargar un valor fuera de la taxonomía hace desaparecer la tarjeta de la cola en silencio.** Si hace falta una opción que no existe, decirlo y proponerla — no forzar una que no encaja.

Y traer las empresas que ya están, con `find_many_companies`: **no duplicar**. Twenty además rechaza duplicados, y sus registros borrados siguen contando.

## Paso 1 — El ICP

Está en `docs/contexto-outbound.md` del repo `codence-auditorias`. Las tres industrias declaradas son **Fintech, Logística y B2B / SaaS**; una empresa fuera de esas tres entra **por la señal, no por el rubro**.

**La escala importa.** Una empresa demasiado grande no la decide una persona a la que se le pueda escribir.

## Paso 2 — La señal

Es lo que hace o deshace la tarjeta.

**La señal no se busca, se encuentra.** Buscar el síntoma en un buscador devuelve a quien vende la cura: pedir *"logística argentina seguimiento por WhatsApp"* trae a los que ofrecen eso como producto. **Primero se identifica la empresa, después se miran sus propias superficies.** Lo único que sí se busca de cero es **el hecho que la empresa publicó** — una ronda, un aviso abierto —, y de eso se ocupa `/buscar`.

### Las cuatro familias, y su ventana

La fricción operativa dejó de ser *la* señal el 07/08: es una de cuatro. **La familia decide el ángulo y con qué abre el mensaje; la ventana decide a quién se le escribe primero.** El detalle de cada una está en `senales.md`.

| Familia | Qué es | Ventana | Ángulo |
|---|---|---|---|
| **A** — demanda declarada | Un aviso abierto que nombra el problema. **La más fuerte** | Semanas | `Demanda declarada` |
| **B** — capital fresco | Ronda con monto y fecha, expansión, adquisición | **Días** | `Crecimiento reciente` |
| **C** — la marca no acompaña | Creció y su marca se quedó donde estaba | Vigilar | `Marca que no acompaña` |
| **D** — fricción operativa | Hacen a mano algo que ya no da a mano | Vigilar | Los tres de fricción |

**Cuantas más familias, más fuerte la tarjeta.** `B + C` es el ICP más claro para rebranding y abre por la expansión, no por la marca. `D sola` es la más débil: verificar antes de escribir.

**Una señal fuera de su ventana no es una señal: es un dato viejo.** Se anota y se espera la próxima.

⚠️ **`Marca que no acompaña` no se usa por impresión estética.** *La inquietud estética no es razón para rebrandear; un problema comercial identificable, sí.* Si no se puede nombrar el problema comercial en una frase, la señal no existe. Y esa familia casi siempre tiene forma de *"no tienen X"*, que es justo lo que `WebFetch` no puede establecer — ver las reglas de abajo.

Dónde mirar, en orden de rendimiento:

1. **Sus búsquedas de empleo.** Un aviso abierto es presupuesto ya asignado a un problema que ellos mismos nombraron. Es la señal más fuerte que existe.
2. **Sus puertas de entrada, seguidas hasta el final.** Dónde cae el enlace de la biografía, qué recibe el formulario, qué pasa después de enviar. Una puerta que muere sin nada del otro lado es un hallazgo verificable en diez segundos.
3. **Sus superficies públicas.** Instagram, LinkedIn, el sitio. Qué publican, con qué frecuencia, y qué pasa con lo que publican.

### Las reglas de evidencia

**`WebFetch` no puede establecer una ausencia.** Sirve para confirmar que algo está, **nunca** para afirmar que algo falta. Sobre un sitio armado con JavaScript devuelve el cascarón sin fallar y sin avisar, así que la ausencia se lee como hallazgo. Toda señal con forma *"no tienen X"* o *"no nombran a Y"* se verifica mirando la página completa en capturas.

**Adivinar rutas no es buscar.** `/about` y `/team` dando 404 sobre un sitio en español no prueba nada.

**Re-verificar con la herramienta que produjo el error no verifica nada.** Una señal falsa sobrevivió a dos re-verificaciones porque las tres lecturas usaron el mismo método ciego.

**Un resumen de búsqueda no es una fuente.** Los resumidores agregan cifras que la página no dice. Antes de escribir un número, hay que haberlo visto **en la página, no en el resumen de la página**.

**Toda fuente que se registra tiene que haberse abierto.** Una que salía de un listado de resultados devolvía 403.

**Describir el mecanismo que produce una observación es una afirmación aparte.** "En 12 de 15 capturas no aparece el conteo" está medido; "la cuenta lo oculta" es una causa deducida. Si no se comprobó el mecanismo, se describe lo observado.

**Una ausencia en una página no es una ausencia en la empresa.** Antes de afirmar que a una empresa le falta una función, hay que haber mirado dónde esa función dejaría rastro.

**Instagram se lee con `WebFetch`, nunca con un navegador automatizado.** Es un pedido público plano y devuelve biografía, enlace y seguidores. **No apuntar el navegador a Instagram ni a LinkedIn** — la sanción es la cuenta.

## Paso 3 — El canal

**Una puerta es un canal solamente si el mensaje aterriza en alguien que podría decir que sí.** El WhatsApp de distribuidores o un mostrador de ventas no son canales aunque los atienda una persona.

- **`LinkedIn`** si hay un perfil de un decisor. Requiere `gradoConexion`, que se lee en el propio perfil y **lo carga Alan**.
- **`Email`** si hay un correo de alguien que decide.
- **`WhatsApp`** si publican un número como puerta comercial. Sobre un número de empresa el destinatario es la empresa: **la tarjeta califica sin decisor**.

Si ninguna puerta califica, la tarjeta queda en `Por investigar` con el faltante escrito.

## Paso 4 — Cargar en Twenty

Tres registros por prospecto, más la nota, más una tarea por cada deuda:

**Company** — `name`, `domainName` (el sitio), `industria`.

**Person**, sólo si hay decisor — `name` partido en nombre y apellido, `jobTitle`, `linkedinLink`, `emails`, `gradoConexion`, atada a la Company.

**Opportunity** — `name` igual al de la empresa, y:

| Campo | Qué va |
|---|---|
| `stage` | `Calificado` si tiene puerta y decisor; si no, `Por investigar` |
| `canal`, `angulo`, `servicio` | De la taxonomía vigente |
| `senal` | La observación, específica y verificable |
| `fuente` | La URL exacta, abierta y comprobada |
| `calificadoEn` | La fecha, sólo si quedó en `Calificado` |
| `toques` | 0 |

**Y una Note con la investigación**, atada a la empresa y a la oportunidad: qué hace la empresa, qué se miró, qué se encontró y qué no se pudo comprobar. Es lo que después lee `/outbound-mensaje` y lo que evita rehacer el trabajo.

**Fechas en GMT-3.**

### Y una Task por cada deuda

**Nota y tarea no son lo mismo.** La Note es la bitácora: se lee y no se cierra nunca. La Task es lo que falta hacer: tiene dueño, vencimiento y estado, y se cierra. Hasta el 07/08 las dos cosas vivían en la Note, y por eso la Note no servía para ninguna de las dos: para saber qué le faltaba a un prospecto había que leer prosa, y para saber qué le faltaba a siete había que abrir siete tarjetas.

**Toda deuda que se escribe como `PENDIENTE` en `senal` genera además una Task.** Si no genera tarea, no era una deuda: era una aclaración, y va en la nota.

| Campo | Qué va |
|---|---|
| `title` | Imperativo, concreto, **sin el nombre de la empresa** — la columna de relaciones ya lo muestra. *"Leer el grado de conexión de Santiago Bibiloni en LinkedIn"*, no *"COR: pendiente grado"* |
| `bodyV2` | **Por qué está pendiente y qué la cierra**, con la fuente cuando corresponde. Una tarea que no dice qué la cierra volvió a ser prosa |
| `dueAt` | **La fecha en que vence la ventana de la señal**, si la deuda bloquea el mensaje. Sin fecha si no bloquea |
| `assigneeId` | El de Alan **si solo él puede hacerla** — leer un grado en LinkedIn, mandar un mensaje, mirar capturas. **Vacío si la hago yo** en la próxima corrida |
| `status` | `TODO` |

**`dueAt` hereda la ventana, y es la regla que hace que esto valga.** Una tarea que bloquea el mensaje vence el día en que la señal deja de servir, no cuatro días después ni "cuando se pueda": el grado de conexión de un prospecto de familia B vence con su ronda.

**`taskTargets` va a la Company y a la Opportunity**, igual que las notas. ⚠️ Y con el mismo prefijo: `targetCompanyId` y `targetOpportunityId`, no `companyId`.

**Las cierra `/outbound-hoy`** cuando el dato llega, y en el mismo paso saca el `PENDIENTE` de `senal`. Acá solo se crean.

## Paso 5 — Reportar

Cuántas se investigaron, cuántas entraron y **por qué quedó afuera cada una que no entró**. Una empresa descartada por escala es una decisión distinta de una sin señal verificable: decir cuál fue.

**Si una tarjeta entró sin señal fuerte, decirlo.** Una lista larga con tarjetas flojas es peor que una corta: cada una sin señal es un mensaje que no se va a poder escribir.
