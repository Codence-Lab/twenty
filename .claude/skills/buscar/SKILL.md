---
name: buscar
description: Sale a encontrar prospectos nuevos por familia de señal. Trabaja las fuentes donde cada familia se publica, abre y verifica cada una, descarta contra el ICP y contra lo que ya está en Twenty, y entrega candidatos listos para /prospectar. No carga nada en Twenty. Usar cuando Alan pida buscar prospectos, llenar la lista, o encontrar empresas de una familia de señal.
---

# /buscar — llenar la lista

**El cuello de botella es la lista, no el sistema de registro.** Ocho prospectos, uno contactado. Este comando existe para eso y nada más.

**Este comando no carga nada en Twenty.** Entrega candidatos verificados; `/prospectar` los carga. Esa lógica ya está escrita —tres registros más la nota, con el vocabulario leído en vivo— y **no se duplica acá**.

**Argumento:** una familia de señal y un recorte. `B, fintech Argentina`. Si no viene la familia, arrancar por **B**, que es la de ventana más corta y la que más se desperdicia.

**El catálogo de señales es [`codence/senales.md`](../../../codence/senales.md).** Este comando es su procedimiento; el documento es la fuente. Si los dos se contradicen, manda el documento.

---

## La regla que hace posible salir a buscar

**La señal no se busca: se encuentra.** Buscar el síntoma devuelve a quien vende la cura — pedir *"logística Argentina seguimiento de envíos por WhatsApp"* devolvió Andreani, Chazki y 99minutos, que ofrecen eso **como producto**.

Lo que sí se busca:

> No se busca el síntoma. Se busca **el hecho que la empresa publicó**.

Nadie publica *"tenemos un proceso manual"*. Sí publica *"buscamos analista para carga de datos"*. Una ronda con monto y fecha, un aviso abierto, un mercado nuevo: son eventos con fuente citable, no interpretaciones.

**De ahí sale la forma de este comando, y conviene entenderla antes de correrlo:**

| Familia | ¿Se puede buscar desde cero? | Cómo entra acá |
|---|---|---|
| **B** — capital fresco | **Sí.** La ronda es una nota de prensa | Búsqueda abierta en prensa de negocios. **Es la única entrada de cero que queda** |
| **A** — demanda declarada | **Ya no.** El aviso está indexado, pero los portales que lo listan no se pueden abrir | Se **lee la bolsa propia** de empresas que ya salieron de B, o de las tarjetas en `Por investigar` |
| **C** — la marca no acompaña | **No.** Ninguna consulta devuelve *"empresas cuya marca se quedó atrás"* | Se **evalúa** sobre candidatos que ya salieron de A o B |
| **D** — fricción operativa | **Casi no.** Se lee de lo mismo que A | Se **recoge de paso** mientras se trabaja A |

**Desde el 07/08, solo B se busca de cero.** A, C y D se leen encima de lo que B trajo, o encima de las tarjetas que ya están en `Por investigar`. Por eso **una corrida arranca siempre por B**, incluso cuando el pedido nombra otra familia: sin la lista que B produce, las otras tres no tienen insumo.

Pedir "buscá familia A" o "buscá familia C" sin una lista de entrada es pedir algo que no existe: en ese caso, tomar como entrada las tarjetas en `Por investigar` de Twenty y decirlo.

---

## Paso 0 — Qué ya está

Antes de gastar una búsqueda, traer de Twenty lo que ya existe, **de sólo lectura**:

- `find_many_companies` — para no devolver una empresa que ya está.
- Y **las borradas también**: `filter=deletedAt[is]:NOT_NULL`. Twenty no borra de verdad, marca `deletedAt`, y un registro borrado sigue contando para la detección de duplicados. Una empresa que vuelve como "candidata nueva" hace que `/prospectar` reviente con `400 duplicate entry` al final de todo el trabajo.

Leer también el vocabulario vigente con `get_field_metadata` sobre `company.industria`, `opportunity.canal`, `opportunity.angulo` y `opportunity.servicio`. **No para cargar nada** — para no proponer un candidato con un ángulo que no existe.

## Paso 1 — El recorte

Un recorte es **industria + geografía**, y sirve para acotar la búsqueda, no para decidir la calificación.

- **Industrias del ICP:** fintech, logística y operaciones, plataformas B2B y SaaS.
- **Geografía:** Argentina y LatAm, público hispanohablante. Todo el outreach es en español.
- **Una empresa fuera de esas tres industrias entra por la señal, no por el rubro.** Si la señal es fuerte y hay a quién escribirle, es candidata igual — se anota que entró por la señal.

Si Alan no dio recorte, proponerlo y seguir. No frenar por eso.

## Paso 2 — Trabajar la fuente

Acá está el trabajo real. **Cada familia tiene su procedimiento y no son intercambiables.**

En las cuatro vale la misma división de tareas:

> **`WebSearch` sirve para encontrar la página. `WebFetch` sirve para leerla.**
> Un resumen de búsqueda **no es una fuente**: los resumidores agregan cifras que la página no dice. Uno le atribuyó *"más de 40.000 abonados"* a Security 24, y esa cifra no está ni en su sitio ni en su ficha de cámara. **Ningún dato pasa al candidato sin haberse visto en la página, no en el resumen de la página.**

### Familia B — capital fresco. Ventana: días

La más corta y la que más se desperdicia. **A las tres semanas ya llegaste tarde.**

**Dónde mirar**, en orden de rendimiento:

1. **Prensa de negocios y tecnología** — Contxto, iProfesional, Ámbito, La Nación, Infobae economía, TechCrunch, Forbes, Startupeable, LatamList.
2. **LAVCA y asociaciones de capital privado**, que publican el movimiento agregado del trimestre.
3. **La sala de prensa de la propia empresa.**
4. **El LinkedIn del founder, que suele ser lo primero que sale** — pero se lee a mano, no con navegador automatizado.

**Cómo se consulta:** la búsqueda nombra el evento, no el problema. *"serie A" fintech Argentina*, *"levantó" ronda millones logística LatAm*, acotado a las últimas semanas. Buscar *"fintech que necesita marca"* no devuelve nada usable.

**Qué hay que confirmar abriendo la nota: monto, fecha y ronda.** Los tres. Si la nota no los trae, no alcanza — se busca otra nota que sí, o se descarta.

**Descalifica:** la ronda tiene más de dos meses · el monto no está publicado · la única fuente es un agregador que resume otra nota.

⚠️ **Crunchbase quedó afuera: eliminó su API gratuita en 2025.** No hay acceso programático barato a rondas. La prensa además es **mejor fuente para el mensaje**, porque es lo que el prospecto vio publicado sobre sí mismo.

⚠️ **Al candidato no se le escribe felicitando.** Eso se decide en `/outbound-mensaje`, pero conviene anotarlo en la señal: lo que se usa es la **consecuencia** —levantaron para expandirse, y expandirse es competir por atención contra otros que también levantaron—, no el saludo que reciben doscientas veces.

### Familia A — demanda declarada. Ventana: semanas

La más fuerte de las cuatro. Un aviso abierto es **presupuesto ya asignado a un problema que ellos mismos nombraron, con sus palabras**.

**Hay una sola entrada que funciona: la bolsa de empleo de la propia empresa.** Con una lista de empresas ya identificadas, se mira **su propia página de empleos**.

**El insumo de esta familia es una lista, no un buscador.** Sale de dos lugares: los candidatos que la familia B trajo en esta misma corrida, y las tarjetas en `Por investigar` de Twenty. Igual que la familia C, la A se trabaja **encima** de lo que B ya produjo.

> **Las dos señales más fuertes que produjo este sistema salieron de páginas de empleo.** La de ICG10 —la que abrió la conversación con Warren— de `icg10.com/careers`. La de Bull Market, de dos búsquedas abiertas al mismo tiempo. **Ninguna de las dos vino de medir nada.**

⚠️ **Pero esa URL se encuentra, no se adivina.** `/about` y `/team` dando 404 sobre un sitio en español no probó nada. El enlace a empleos se saca de la navegación del propio sitio: se trae la portada y se leen sus enlaces. Si no aparece ninguno, es que no se encontró — **no que no exista**.

**Y funciona.** El 07/08 se leyeron dos bolsas propias así, las dos encontradas desde la navegación del sitio y las dos con los títulos exactos de cada aviso: `work.belo.app`, con 5 posiciones, y `blanco.app/trabaja-con-nosotros`, encontrada como *"Trabaja con nosotros"* en el menú, con 3.

⚠️ **La búsqueda abierta en portales quedó cerrada el 07/08.** `getonbrd.com/jobs/city/buenos-aires` devuelve **403** a un pedido plano, y Bumeran, Computrabajo, Indeed y Glassdoor sólo salen como páginas de listado — que es justamente lo que esta skill prohíbe registrar como fuente. **No se gasta una búsqueda ahí.** Si vale la pena mirar un portal, se dice y lo mira Alan, igual que LinkedIn Jobs.

**Cómo se verifica: se abre el aviso y se lee entero.** La fuente que se registra es **la URL del aviso**, no la del listado de resultados. Una fuente que salía de un listado devolvía 403.

⚠️ **Una bolsa leída sin avisos relevantes es un resultado, no un fracaso**, y se escribe con el alcance declarado. Belo tenía 5 posiciones abiertas al 07/08 y **ninguna nombraba un problema que Codence resuelva**: eso descarta la familia A para esa empresa y hay que decirlo así, no dejarlo en silencio.

**Descalifica:** el aviso está cerrado · es una consultora reclutando para un tercero sin nombrarlo · el puesto es de otra cosa y el problema aparece de pasada.

**Dos búsquedas de la misma función al mismo tiempo valen más que una.** Es volumen que no da abasto, no una vacante.

⚠️ **La trampa:** un aviso abierto también significa que ya eligieron resolverlo contratando. Eso no descalifica, pero se anota en la señal, porque el mensaje va a tener que decir qué agrega Codence a eso en vez de fingir que no lo vio.

⚠️ **LinkedIn Jobs no se lee acá.** No hay forma legítima de leerlo programáticamente y la sanción es la cuenta, que es el único canal de distribución. Si vale la pena mirarlo, se dice y lo mira Alan.

### Familia D — fricción operativa. Se recoge trabajando A

**No se sale a buscarla sola.** `D sola` es la combinación más débil del catálogo, y desde el 07/08 ya no se lee midiendo el sitio del prospecto: se lee de lo que la empresa publica, igual que las otras tres.

Mientras se leen los avisos de la familia A, se anota si además **describen trabajo manual** — carga de datos, conciliación, seguimiento uno por uno — o si la dotación no se corresponde con el volumen. Eso convierte una `A` en una **`A + D`**, que es una tarjeta mejor.

**Descalifica:** es una deducción y no una observación · no hay evidencia de que la empresa adopte herramientas digitales, con lo cual el ciclo de convencimiento no lo justifica.

### Familia C — la marca no acompaña. Se evalúa, no se busca

Es la que habilita el pitch de rebranding y **la más fácil de arruinar**. Tiene ángulo propio desde el 07/08.

**Entrada:** los candidatos que ya salieron de A o B en esta misma corrida, o las tarjetas en `Por investigar` de Twenty. Nunca una búsqueda abierta.

**Se mira la portada completa, en capturas.** El script vive en el otro repo:

```bash
node "d:\Admin\Desktop\Codence Studio\CLAUDE\CODENCE\Proyectos\Agencia\Estructura\codence-auditorias\scripts\capturar-portada.mjs" https://dominio.com
```

Devuelve la página entera más tramos, con consentimientos cerrados y animaciones apagadas, y un `manifiesto.json` con las condiciones y las advertencias. **Hay que mirar las capturas**, no el nombre de los archivos.

⚠️ **La trampa que ya costó una tarjeta:** las señales de marca casi siempre tienen forma de *"no tienen X"* o *"no nombran a Y"* — y **`WebFetch` no puede establecer una ausencia.** Sobre un sitio armado con JavaScript devuelve el cascarón sin fallar y sin avisar, así que la ausencia se lee como hallazgo. Se afirmó que InsightPlay no nombraba a nadie de su equipo: su portada mide 6.235 px y en el tercer tramo hay una foto del equipo entero. **Al medir bien, el ángulo tampoco se sostenía** — esa portada muestra premios, clientes nombrados, programas de partner y cuatro certificaciones.

⚠️ **Y re-verificar con la herramienta que produjo el error no verifica nada.** Esa señal falsa sobrevivió a dos re-verificaciones porque las tres lecturas usaron el mismo método ciego.

**Descalifica, y no se negocia:**

> **La inquietud estética no es razón para rebrandear. Un problema comercial identificable, sí.**

Si no se puede nombrar el problema comercial en una frase, no hay señal. Se dice y se sigue.

**`B + C` es el ICP más claro para rebranding** — levantaron y la marca no acompaña. Ahí `C` hereda la ventana de días de `B`, y el mensaje abre por la expansión, no por la marca.

---

## Paso 3 — El filtro del ICP, antes de verificar

Verificar cuesta caro. Descartar cuesta barato. **En este orden:**

| Se mira | Descarta si |
|---|---|
| **Escala** | Es tan grande que no la decide una persona a la que se le pueda escribir |
| **Etapa** | Es una startup en etapa de idea. **La empresa ya factura y está en expansión** |
| **Idioma** | No es de público hispanohablante |
| **Ya está** | Aparece en Twenty, incluidas las borradas |

**La escala es el descarte más frecuente y el más barato.** Mirarla primero.

Recién después de pasar esos cuatro se abre la fuente y se lee.

## Paso 4 — Verificar, una por una

Nada llega al Paso 5 sin esto. **Estas reglas no se adaptan por contexto:**

- **Toda fuente que se registra tiene que haberse abierto.** No el resultado de búsqueda: la página.
- **`WebFetch` confirma que algo está, nunca que algo falta.**
- **Adivinar rutas no es buscar.**
- **Un resumen de búsqueda no es una fuente.**
- **Describir el mecanismo que produce una observación es una afirmación aparte.** Que en 12 de 15 capturas no aparezca el conteo de me gusta está medido; que *la cuenta lo oculte* es una causa deducida. Si no se comprobó el mecanismo, se describe lo observado y listo.
- **Una ausencia en una página no es una ausencia en la empresa.** Se concluyó que ICG10 no tenía operación de marketing: tienen 1.464 publicaciones en Instagram. Antes de afirmar que a una empresa le falta una función, hay que haber mirado dónde esa función dejaría rastro.
- **Instagram se lee con `WebFetch`**, que es un pedido público plano y devuelve biografía, enlace y seguidores. **Nunca con navegador automatizado**, igual que LinkedIn.

**Y la ventana se comprueba acá.** Una señal fuera de su ventana no es una señal: es un dato viejo. Se anota y se espera la próxima.

| Ventana | Vence | Qué la cierra |
|---|---|---|
| **Días** | 1-2 semanas | La noticia deja de ser noticia |
| **Semanas** | 3-8 semanas | El aviso se cierra, el puesto se cubre |
| **Vigilar** | Sin vencimiento | No hay urgencia |

## Paso 5 — Entregar el candidato

Un candidato entregado trae **exactamente esto**, y no una tarjeta:

| | |
|---|---|
| **Empresa** | Nombre y sitio |
| **Industria** | Del vocabulario vigente. Si no encaja en ninguna, decirlo — no forzar |
| **Familia** | A, B, C o D. Si son varias, todas: **cuantas más familias, más fuerte la tarjeta** |
| **Ventana** | Cuál es y **la fecha en que vence**, calculada, no el nombre de la ventana |
| **Señal** | Escrita con la anatomía de abajo |
| **Fuente** | La URL exacta, abierta y comprobada |
| **Qué falta** | Decisor, canal, o lo que sea. **Escrito como lista de tareas propuestas, una por deuda, no como una frase.** Cada una con qué la cierra, si vence, y si la puede hacer solo Alan. `/prospectar` las carga como Tasks |

### La anatomía de una señal escrita

Las ocho señales ya cargadas comparten una forma, y es replicable:

1. **Un hecho contable y citable** — un número, un nombre propio, una frase literal del prospecto.
2. **La cita textual entre comillas angulares** «...», para marcar que es copy suyo y no paráfrasis.
3. **Una tensión implícita, nunca declarada como juicio.** Ninguna dice *"su marca es mala"*. Dicen dos hechos que no cierran: seis clientes de moda reconocibles *contra* 550 seguidores; un desarrollo de USD 370 millones *y* el enlace sin etiquetar. **El lector saca la conclusión.**
4. **La fecha de verificación**, cuando el dato es volátil.
5. **El alcance declarado**, cuando la medición es parcial — *"sobre la primera página del catálogo, que muestra 10 productos y tiene paginación de 5"*.
6. **Una fuente que abre y que muestra la señal entera.**
7. **Las deudas anotadas adentro del propio campo**, en mayúsculas: *"PENDIENTE: falta la observación de marca que sostenga el ángulo"*.

### Y después, el traspaso

Alan elige cuáles van. Los elegidos pasan a **`/prospectar`**, que carga Company, Person, Opportunity y la Note, leyendo el vocabulario en vivo. **Acá no se escribe nada en Twenty.**

## Paso 6 — Reportar, incluido lo que no entró

Cuántas se miraron, cuántas quedaron, y **por qué quedó afuera cada una que no quedó**. Descartada por escala es una decisión distinta de descartada por no tener señal verificable: decir cuál fue.

**Si un candidato entró con señal floja, decirlo.** Una lista larga con tarjetas flojas es peor que una corta: cada una sin señal es un mensaje que no se va a poder escribir.

**Un descarte que puede cambiar no se tira.** Una ronda vencida o un aviso cerrado son señales que volverán a aparecer. Esa empresa se propone como tarjeta en `Por investigar` vía `/prospectar`, con el faltante escrito. **No se abre un archivo aparte para guardarlas** — el registro vive en un solo lugar y ese lugar es Twenty.

---

## Cuánto entregar

**Entre 5 y 10 candidatos verificados por corrida es suficiente**, y conviene no pasarse.

El volumen sostenible escribiendo uno por uno es de 10-15 mensajes por día, con 2-3 seguimientos cada uno. Una lista de cuarenta candidatos flojos no acelera nada: agranda la cola de tarjetas que después quedan trabadas en `/outbound-hoy` sin poder escribirse.

**Si una corrida entera no produjo ningún candidato, eso es un resultado.** Decirlo, decir qué fuentes se trabajaron, y proponer otro recorte u otra familia. Inventar candidatos para no volver con las manos vacías es el peor resultado posible.

---

## Reglas que no se negocian

**La señal no se busca, se encuentra. Lo que se busca es el hecho que la empresa publicó.**

**Ningún candidato sale sin una observación específica y verificable sobre esa empresa, con su fuente abierta.** Es la regla de *nunca inventar un número*, aplicada al primer contacto.

**Un resumen de búsqueda no es una fuente.**

**`WebFetch` no puede establecer una ausencia.**

**No apuntar un navegador automatizado a Instagram ni a LinkedIn.** La sanción es la cuenta, y es el único canal de distribución mientras no haya pauta.

**Este comando no carga nada en Twenty ni le escribe a nadie.** Entrega candidatos. Cargar es `/prospectar`, escribir es `/outbound-mensaje`, **aprobar lo hace Alan en el CRM**, y mandar lo sigue apretando él — en Gmail si el canal es `Email`, con `/enviar` armando el borrador; a mano si es LinkedIn o WhatsApp.

**Las taxonomías se adaptan; las reglas de evidencia no.** Agregar una familia o un ángulo es una decisión de negocio. Qué cuenta como fuente y qué se puede afirmar, no.
