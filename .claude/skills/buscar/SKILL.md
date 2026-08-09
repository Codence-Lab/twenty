---
name: buscar
description: Sale a encontrar prospectos nuevos. Trabaja padrones de empresas reales y lee sobre cada una los seis dolores del catálogo, descarta contra el ICP y contra lo que ya está en Twenty, y entrega candidatos listos para /prospectar. No carga nada en Twenty. Usar cuando Alan pida buscar prospectos, llenar la lista, o encontrar empresas de un rubro, una región o una fuente.
---

# /buscar — llenar la lista

**El cuello de botella es la lista, no el sistema de registro.** Este comando existe para eso y nada más.

**No carga nada en Twenty.** Entrega candidatos verificados; `/prospectar` los carga.

**Argumento:** un recorte. Puede ser un rubro y una geografía (`logística, Neuquén`), una región (`el corredor de Vaca Muerta`), un padrón concreto, o nada — si no viene, se propone uno y se sigue.

**El catálogo es [`codence/senales.md`](../../../codence/senales.md).** Este comando es su procedimiento; el documento es la fuente. Si los dos se contradicen, manda el documento.

---

## La doctrina, antes de correr nada

> **La señal es el dolor. Lo publicado es una ruta para llegar a la empresa, no la única, y muchas veces la peor.**

**Corregido el 08/08/2026, y conviene saber por qué.** Hasta ese día esta skill decía *"sólo la familia B se busca de cero"*, y el resultado está medido: **14 de 21 tarjetas con el mismo ángulo, `Crecimiento reciente`, y ninguna contactada.** Las tres que produjeron algo salieron de páginas de empleo y de mirar una portada.

Dos ejes, y no se mezclan:

- **El dolor** — qué hace a la empresa un prospecto. Decide el ángulo y el servicio.
- **La ruta** — cómo llegué hasta ella. No decide nada del mensaje.

⚠️ **Y la regla que hace falta escribir, porque el error se repitió tres veces en un día:**

> **Ninguna lista de fuentes de este documento es cerrada.** Son ejemplos de rutas, no el conjunto de rutas permitidas. **Antes de reportar que no hay candidatos, hay que poder nombrar tres rutas que no se probaron.** Un recorte que no rinde no cierra la corrida: cambia la ruta.

### La regla del buscador

> **Buscar el síntoma devuelve a quien vende la cura.** *"Logística Argentina seguimiento por WhatsApp"* devolvió Andreani, Chazki y 99minutos: las tres venden eso.
> **Buscar el padrón funciona perfecto.** *"Cámara de proveedores de Vaca Muerta"*, *"expositores Arminera 2026"* devuelven listas de empresas reales.

**El buscador no se usa para encontrar el dolor. Se usa para encontrar la lista sobre la cual leer el dolor.**

---

## Paso 0 — La bandeja, y qué ya está

**Primero las `Pistas`.** Es la bandeja de entrada del sistema y arranca acá, no en un buscador:

```
find_many_pistas  con estado = SIN_MIRAR
```

- Una de tipo **`Fuente o padrón`** se convierte en **ruta de esta corrida**.
- Una de tipo **`Prospecto posible`** entra directo al Paso 3, salteándose el descubrimiento.
- Una **`Idea`** o **`Referencia`** se lee y se decide si aplica al recorte.

**Al usarla se la deja en `Usada` o `Descartada`, con el motivo en `detalle`.** Una pista trabajada que queda en `Sin mirar` va a volver a salir en la próxima corrida.

⚠️ **Y si una pista trae una imagen adjunta, hay que mirarla.** Es la puerta por donde entra lo que no se puede leer solo: LinkedIn e Instagram no se tocan con navegador automatizado, pero Alan sí los ve.

**Después, lo que ya existe en Twenty**, de sólo lectura:

- `find_many_companies` — para no devolver una empresa que ya está.
- Y **las borradas también**: `filter=deletedAt[is]:NOT_NULL` por REST. Twenty no borra de verdad, marca `deletedAt`, y un registro borrado sigue contando para la detección de duplicados. Una empresa que vuelve como "candidata nueva" hace que `/prospectar` reviente con `400 duplicate entry` al final de todo el trabajo.
- Las oportunidades en `Por investigar`: son insumo, no ruido. Una tarjeta vieja sin señal viva puede tener un dolor que nunca se leyó.

Y el vocabulario vigente con `get_field_metadata` sobre `company.industria`, `opportunity.angulo` y `opportunity.servicio`. **No para cargar nada** — para no proponer un candidato con un ángulo que no existe.

## Paso 1 — El recorte

Un recorte acota dónde buscar, no decide la calificación.

- **Industrias del ICP declarado:** fintech, logística y operaciones, plataformas B2B y SaaS. **Una empresa fuera de esas tres entra por el dolor, no por el rubro** — se anota que entró así.
- **Geografía: mercados hispanos y anglosajones.** El test **no es el país: es el idioma en que se le puede escribir**, español o inglés. EE.UU. es válido. Una brasileña con sitio en inglés también. Una cuyo producto sólo existe en portugués, no.
- **La escala importa más que el rubro.** Una empresa que no la decide una persona a la que se le pueda escribir no sirve, por buena que sea la señal.

**Un recorte fértil no es un rubro: es una situación.** Una región en expansión —Vaca Muerta, el cobre de San Juan, el litio del norte— arrastra a todos sus proveedores a la vez. Nadie publica que necesita una marca, pero cientos de empresas creciendo más rápido que su estructura es un hecho del recorte, no de cada una.

## Paso 2 — Motor 1: el padrón

**Es el motor principal.** Entrega empresas que ya facturan, sin ventana que venza.

**Dónde salen los padrones:** cámaras sectoriales · parques industriales y tecnológicos · guías oficiales de industria · listados de expositores de ferias · registros municipales y provinciales de proveedores · padrones de proveedores de las grandes operadoras · polos y clusters. **Y los que traiga una `Pista`.**

### Cómo se lee un padrón, y el reparto de herramientas

**Playwright para llegar, `WebFetch` para leer.** Medido el 08/08/2026 sobre `guiavacamuerta.com`:

1. **La navegación de un padrón suele ser JavaScript**, y entonces la URL del listado no aparece en un fetch de la portada. Ahí se abre con Playwright, se navega por el menú **haciendo clic**, y se anota la URL a la que se llegó.
2. **Las páginas de listado suelen ser HTML plano, y `WebFetch` las lee mejor.** Devolvió las 26 empresas de Transporte y Logística con nombre, localidad, correo, teléfono y sitio **en una sola llamada**, donde Playwright necesitó cinco.

⚠️ **Y la trampa que ya se comió una lectura: adivinar la ruta.** Ese padrón se dio por vacío porque se pidió `/empresas/`, que es **una página de plantilla sin contenido**. La real es `/companias` → `/categorias/NN-nombre.htm`. El mismo error se repitió a los cinco minutos inventando `/categorias/12-transporte-y-logistica.htm`, que dio 404 mientras la buena era `/categorias/04-servicios-de-transporte.htm`.

> **El enlace se saca de la navegación del sitio. Siempre. Aunque la ruta inventada parezca obvia.**

Y **una página que devuelve algo raro no es un padrón vacío hasta haber comprobado que la URL era la correcta.**

Un directorio público de empresas **sí** se puede leer con navegador automatizado. Instagram y LinkedIn **no**, y esa regla no se toca.

⚠️ **Un 403 no cierra una ruta.** `traded.co`, FinSMEs y FinTech Futures bloquean el pedido plano. Lo que corresponde es proponer resolverlas por otra vía —el boletín por correo a `core@codencelab.com`, que ya está conectado— no darlas por inexistentes.

De cada empresa del padrón se saca lo mínimo para el Paso 3: nombre, sitio, actividad, localidad.

## Paso 3 — Leer los seis dolores sobre cada empresa

Acá está el trabajo real, y es **por empresa, no por búsqueda**. Se miran sus propias superficies:

1. **Su bolsa de empleo propia** — la ruta que produjo las dos mejores señales del sistema. El enlace **se encuentra en la navegación del sitio, no se adivina**: se trae la portada y se leen sus enlaces. Si no aparece ninguno, es que no se encontró, **no que no exista**. Un aviso abierto que nombre el problema es `Demanda declarada`, el dolor más fuerte y de ventana más larga.
2. **Su puerta de entrada, seguida hasta el final.** Dónde cae el enlace de la biografía, qué recibe el formulario, si se puede comprar o agendar. Una puerta que muere sin nada del otro lado es `Presencia que no vende`, verificable en diez segundos.
3. **Su sitio y su catálogo.** Precios ausentes, pedidos sólo por WhatsApp, un proceso que se adivina manual: `Proceso manual` o `Volumen sin sistema`.
4. **Su nombre a través de las superficies.** Si el sitio, el correo y las redes lo escriben distinto, es `Marca que no acompaña` — y es una observación de presencia, no de ausencia.
5. **La prensa, al final y sólo sobre esta empresa.** Una ronda, una planta nueva, un mercado nuevo: `Crecimiento reciente`, y le pone ventana de días a una tarjeta que sin eso no tenía apuro.

⚠️ **`Marca que no acompaña` no se asigna desde un `WebFetch`.** Esa familia casi siempre tiene forma de *"no tienen X"*, y **`WebFetch` no puede establecer una ausencia**. Se propone el ángulo con la deuda escrita, y se cierra corriendo `capturar-portada.mjs` y mirando las capturas.

**Una empresa puede tener varios dolores. Cuantos más, más fuerte la tarjeta**, y el mensaje abre con uno solo.

## Paso 4 — Motor 2: el evento, como acelerador

**No es para descubrir empresas. Es para darle urgencia a las que el padrón ya trajo.**

Sobre los candidatos que salieron del Paso 3, se mira si además publicaron algo con ventana corta: una ronda, una expansión, una adquisición, un ejecutivo nuevo. Prensa de negocios y tecnología, prensa regional, la sala de prensa de la propia empresa.

**Qué hay que confirmar abriendo la nota:** el hecho, la fecha y el monto si es una ronda. Si la nota no los trae, no alcanza.

⚠️ **Un agregador que resume otra nota no es fuente.** El 08/08 uno fechó la ronda de Hunty en agosto de **2026** cuando Forbes Colombia y Portafolio la fechan en agosto de **2025**. Un año de diferencia, y sólo se vio al abrir las originales.

**Se puede correr el motor 2 solo** cuando el pedido es explícitamente sobre eventos recientes. Pero una corrida que produce **sólo** tarjetas de `Crecimiento reciente` es la señal de que se volvió al defecto viejo: hay que decirlo.

## Paso 5 — El filtro del ICP, antes de verificar

Verificar cuesta caro. Descartar cuesta barato. **En este orden:**

| Se mira | Descarta si |
|---|---|
| **Escala** | Es tan grande que no la decide una persona a la que se le pueda escribir |
| **Etapa** | Es una startup en etapa de idea. **La empresa ya factura** |
| **Idioma** | No se le puede escribir en español ni en inglés |
| **Ya está** | Aparece en Twenty, incluidas las borradas |

**La escala es el descarte más frecuente y el más barato. Mirarla primero.**

## Paso 6 — Verificar, una por una

Nada llega al Paso 7 sin esto. **Estas reglas no se adaptan por contexto:**

- **Toda fuente que se registra tiene que haberse abierto.** No el resultado de búsqueda: la página.
- **`WebFetch` confirma que algo está, nunca que algo falta.**
- **Un resumen de búsqueda no es una fuente.** Tres veces el 08/08 un resumen atribuyó a una fuente algo que la fuente no decía.
- **Adivinar rutas no es buscar.**
- **Re-verificar con la herramienta que produjo el error no verifica nada.**
- **Describir el mecanismo que produce una observación es una afirmación aparte.**
- **Una ausencia en una página no es una ausencia en la empresa.**
- **Instagram se lee con `WebFetch`**, nunca con navegador automatizado.

**Y la ventana se comprueba acá**, si el dolor viene con una: **días** para el crecimiento reciente, **semanas** para un aviso abierto, sin vencimiento para los demás.

## Paso 7 — Entregar el candidato

Un candidato trae **exactamente esto**, y no una tarjeta:

| | |
|---|---|
| **Empresa** | Nombre y sitio |
| **Industria** | Del vocabulario vigente. Si no encaja, decirlo — no forzar |
| **Dolor y ángulo** | Cuál de los seis, con el ángulo del vocabulario. Si son varios, todos |
| **Ventana** | Cuál es y **la fecha en que vence**, calculada — o "sin vencimiento" |
| **Señal** | Escrita con la anatomía de `senales.md` |
| **Fuente** | La URL exacta, abierta y comprobada |
| **Ruta** | Por dónde se llegó. Sirve para saber qué ruta rinde |
| **Qué falta** | **Como lista de tareas propuestas, una por deuda**, con qué la cierra, si vence, y si sólo la puede hacer Alan |

**Alan elige cuáles van.** Los elegidos pasan a `/prospectar`. **Acá no se escribe nada en Twenty**, salvo el estado de las `Pistas` que se trabajaron.

## Paso 8 — Reportar

Cuántas se miraron, cuántas quedaron, y **por qué quedó afuera cada una**. Descartada por escala es distinto de descartada por no tener dolor verificable.

**Y el reparto de ángulos de la corrida.** Es la métrica que dice si la doctrina está funcionando: **si todos los candidatos tienen el mismo ángulo, la corrida falló aunque traiga diez.**

**Si un candidato entró con señal floja, decirlo.** Una lista larga con tarjetas flojas es peor que una corta.

**Un descarte que puede cambiar no se tira:** se propone como tarjeta en `Por investigar` con el faltante escrito, o como `Pista`. El registro vive en Twenty, no en un archivo aparte.

---

## Cuánto entregar

**Entre 5 y 10 candidatos verificados por corrida**, y conviene no pasarse. El volumen sostenible escribiendo uno por uno es de 10-15 mensajes por día. Una lista de cuarenta candidatos flojos agranda la cola de tarjetas trabadas.

**Si una corrida no produjo ningún candidato, eso es un resultado** — pero antes de decirlo hay que poder nombrar **tres rutas que no se probaron**. Inventar candidatos para no volver con las manos vacías es el peor resultado posible.

---

## Reglas que no se negocian

**La señal es el dolor, y vale aunque la empresa no lo haya declarado.** Lo que no cambia es qué se puede afirmar sobre él.

**Ningún candidato sale sin una observación específica y verificable sobre esa empresa, con su fuente abierta.**

**Un resumen de búsqueda no es una fuente. `WebFetch` no puede establecer una ausencia.**

**No apuntar un navegador automatizado a Instagram ni a LinkedIn.** Padrones públicos sí.

**Este comando no carga nada en Twenty ni le escribe a nadie.** Cargar es `/prospectar`, escribir es `/outbound-mensaje`, **aprobar lo hace Alan en el CRM**, y mandar lo sigue apretando él.

**Las taxonomías se adaptan; las reglas de evidencia no.**
