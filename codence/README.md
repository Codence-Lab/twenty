# codence/

Lo propio de Codence sobre Twenty. Vive en una carpeta que upstream no tiene, así que traer releases de `twentyhq/twenty` no genera conflictos acá.

> ## 📍 Al 08/08/2026
>
> ### Lo primero el lunes 10/08
>
> **Mandar los cinco mensajes, y empezar por COR y Duppla.** Están escritos y
> esperando en la vista *Para aprobar*, con `proximoToque` el 10/08 para que
> salgan solos en `/outbound-hoy`. Se copian de la tarjeta y se mandan por
> LinkedIn: los seis contactos son de 2º o 3er grado, así que son notas de
> conexión de 300 caracteres.
>
> | | Ventana | Margen desde el lunes |
> |---|---|---|
> | COR, Duppla | vencen 13/08 | **3 días** |
> | Rintin | 18/08 | 8 días |
> | Blanco | 19/08 | 9 días |
> | Datcisions | vigilar | sin vencimiento |
>
> Si el lunes se complica, COR y Duppla son las que no esperan: son rondas
> anunciadas el 30/07 y escribir sobre una de tres semanas se nota.
>
> ### Lo que se hizo
>
> **El catálogo de señales se reescribió entero, y es el cambio más grande del
> día.** El sistema había derivado a cazar una sola cosa —rondas de inversión— y
> el número lo prueba: **14 de 21 tarjetas con el ángulo `Crecimiento reciente`,
> y ninguna de las 14 contactada jamás.** Las tres únicas que produjeron algo
> salieron de lo que el sistema había dejado de mirar: ICG10 y Bull Market de
> páginas de empleo, Datcisions de mirarle la portada.
>
> El defecto era de diseño. El catálogo mezclaba **qué hace a una empresa un
> prospecto** con **cómo llego hasta ella**, y como la segunda pregunta tiene una
> respuesta fácil de buscar en Google, se comió a la primera. Ahora van
> separadas, y la regla nueva es:
>
> > **La señal es el dolor. Lo publicado es una ruta para llegar a la empresa, no
> > la única, y muchas veces la peor.**
>
> Lo que sale de ahí: **seis dolores** en vez de cuatro familias, un ángulo nuevo
> —`Presencia que no vende`, el que mapea a Diseño web—, **el padrón como motor
> principal** y la prensa degradada a acelerador, y una regla dura contra el error
> que se repitió tres veces en el día: *ninguna lista de fuentes es cerrada, y
> antes de decir que no hay candidatos hay que poder nombrar tres rutas que no se
> probaron*.
>
> **Y una bandeja de entrada: el objeto `Pistas`**, que aparece en la barra
> lateral. Ahí caen enlaces, padrones, ideas y capturas. `/buscar` arranca
> leyéndola y `/outbound-hoy` cuenta las que llevan mucho sin mirar.
>
> **El circuito de aprobación del canal Email, cerrado.** Cinco campos nuevos en
> `opportunity`, tres vistas, la skill `/enviar` con sus dos modos, y las otras
> cuatro skills ajustadas al reparto nuevo. El detalle está más abajo, en
> *El circuito de aprobación*.
>
> **Alan cargó los siete `gradoConexion`**, que era el punto 5 pendiente del
> 07/08. Ninguno es de 1er grado.
>
> **Landmark Developments reemplaza a Udaondo.** Udaondo es un edificio, no una
> empresa: un desarrollo no contrata un rebranding, lo contrata quien lo
> desarrolla. La tarjeta vieja quedó **descalificada, no borrada** — un segundo
> DELETE sobre algo que ya pasó por la papelera lo purga de verdad, y así se
> perdió ICG10 el 07/08.
>
> ### La regla de redacción que salió de acá
>
> Los cinco mensajes se escribieron dos veces. La primera versión ponía el monto
> de la ronda —«los USD 30M»— y Alan la marcó como demasiado directa. Quedó como
> regla en `/outbound-mensaje`, con dos partes:
>
> **Nunca la cifra.** Es el mismo caso que la felicitación: el monto es lo que
> menciona todo el que les quiere vender algo, y ponerlo delata que la
> investigación fue sobre su plata. Se abre por la consecuencia visible —abren
> verticales, entran a un país nuevo— y se puede decir «con la ronda nueva». El
> número no.
>
> **Y quién escribe va primero.** `Soy Alan, de Codence: trabajamos marca y
> sitios web.` Una nota de conexión no abre la venta: consigue que te acepten.
> El argumento va en el mensaje siguiente, cuando ya hay conversación.
>
> ### La doctrina nueva se probó el mismo día, y funcionó
>
> Primera corrida de `/buscar` con motor de padrón, sobre la Guía Vaca Muerta.
> **Seis candidatos, y cero con el ángulo viejo:** cuatro de `Presencia que no
> vende` —Test.Ing, MEHSA, Cruz del Sur y AXIS— y dos de `Marca que no
> acompaña` —Asesores & NovaMind y ÁgilDev Patagonia—. El pipeline pasó de 21 a
> 27 tarjetas y las 14 de `Crecimiento reciente` quedaron donde estaban.
>
> ⚠️ **El reparo, porque la métrica corta para los dos lados:** 4 de 6 cayeron
> en un solo ángulo. Es otro que el de antes, pero sigue concentrado. Un padrón
> de proveedores chicos deja ver desde afuera sobre todo la puerta de entrada;
> para sacar `Demanda declarada` hay que leerles la bolsa de empleo, y estas
> empresas casi no tienen.
>
> **Y cuatro atribuciones falsas atrapadas en un día**, todas abriendo la fuente
> original: la ronda de Hunty fechada en 2026 cuando Forbes Colombia y Portafolio
> la fechan en **2025**; los «40.000 abonados» de Security 24; una cifra de win
> rate atribuida a una página que no tiene ninguna; y la portada de Test.Ing que
> `WebFetch` dio por vacía y con navegador tiene 26 imágenes. **La regla de
> evidencia no es paranoia: es lo único que separa al sistema de escribir cifras
> inventadas.**
>
> ### Lo que falta
>
> **`/enviar` nunca se corrió punta a punta.** No hay ninguna tarjeta con
> `canal = Email` —las 15 son LinkedIn o WhatsApp—, así que no tiene sobre qué
> trabajar. La prueba contra una dirección propia de Alan sigue pendiente, y
> **el borrador de prueba hay que borrarlo a mano**: el conector de Gmail no
> tiene herramienta para borrar borradores.
>
> **Landmark tiene dos tareas, y la del Grupo Werthein va primero.** Si ya
> trabajan con una agencia, no hace falta buscar el decisor. Es la misma
> pregunta que Alan encontró en **Security 24**, donde el marketing lo lleva
> `laidea.agenciacreativa` y por eso esa tarjeta apunta a descalificarse.
>
> **Bull Market sigue en `Standby`**, esperando confirmar que sus dos avisos
> sigan abiertos.
>
> **Y sigue sin resolverse lo del 07/08:** el toque 2 de Warren venció el 04/08
> y no salió, e ICG10 sigue en `Contactado`. Es el caso que justificó todo este
> circuito y todavía está abierto.
>
> ---
>
> ## Al 07/08/2026
>
> **Los puntos 1, 2 y 3 están hechos.** `/buscar` existe, `modelo.mjs` aplica sus
> dos ajustes y quedó verificado idempotente, y las tres skills de outbound se
> revisaron contra [`senales.md`](senales.md). El porqué de cada cosa está en
> `docs/decisiones.md` del repo `codence-auditorias`, entrada del 07/08.
>
> **El punto 5 también se hizo, más tarde ese mismo día.** `/buscar` corrió por
> primera vez sobre familia B y entregó 7 candidatos, que `/prospectar` cargó:
> **COR, Blanco y Rintin en `Calificado`**, y Duppla, Infinia, TripWip y Belo en
> `Por investigar` con el faltante escrito. De 19 empresas miradas, 12 se
> descartaron con su razón anotada. La lista pasó de 8 prospectos a 15.
>
> **Dos cosas que la corrida rompió, y quedaron arregladas:** la búsqueda abierta
> en portales de empleo está cerrada —devuelven 403 o solo páginas de listado—, así
> que la familia A ahora se trabaja solo desde la bolsa propia de la empresa. Y las
> deudas dejaron de ser prosa: son **Tasks**, 13 cargadas.
>
> **Lo que falta:**
>
> **4. Fichar dos fuentes más:** Edelman Trust Barometer, y la metodología de
> Interbrand / Kantar BrandZ / Brand Finance.
>
> ~~**5. Los tres grados de conexión.**~~ **Resuelto el 08/08:** Alan cargó los
> siete, no tres. Solo los podía leer él, porque apuntar algo automatizado a
> LinkedIn cuesta la cuenta.
>
> **Y lo que no es técnico:** el toque 2 de Warren venció el 04/08 y no salió.
> ICG10 sigue en `Contactado`. Su bitácora entera está en Twenty.
>
> Lo de Warren es el caso que justificó el circuito de aprobación: el mensaje
> estaba escrito y nadie lo mandó, y como nada lo vigilaba, la ventana de la
> señal se venció sola. Ahora un borrador parado más de tres días se reporta.

## Los documentos

| | |
|---|---|
| [`senales.md`](senales.md) | **Qué hace que una empresa sea un prospecto, y cómo se llega a ella.** Los 6 dolores con su ventana, y el catálogo abierto de rutas |
| [`evidencia.md`](evidencia.md) | Las fuentes que puede citar una página de argumento, con su ficha |

**La regla de fuentes cambió el 07/08.** Antes era *solo primarias*. Ahora: **cualquiera, siempre que la cita diga qué clase de evidencia es.** No se prohíbe la encuesta de un proveedor; se prohíbe presentarla como si fuera facturación medida.

⚠️ **El documento que se le manda al prospecto se genera en el otro repo** (`codence-auditorias`), con `render-web.mjs` y un `content.json` que traiga `bloques`. Ahí viven `template/` y `brand/`.

## Levantar el CRM

Docker Desktop tiene que estar corriendo (la ballena fija en la bandeja). Después:

```bash
cd packages/twenty-docker
docker compose up -d
```

Entra por **http://localhost:3000**.

Para apagarlo: `docker compose stop`. Los datos viven en volúmenes de Docker y sobreviven.

⚠️ **Si Docker Desktop está cerrado, el CRM cae y con él su servidor MCP.** Pasó el 08/08. El ejecutable **no está en `Program Files`**: es una instalación por usuario y vive en

```
C:\Users\Alan Dev\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe
```

Los contenedores vuelven solos al levantarlo, pero **el servidor tarda unos 4 minutos** en responder en `/healthz` después de que el motor arranca. El disco sigue en `D:\DockerDesktopWSL` y los datos no se tocan.

## Los scripts

| | |
|---|---|
| `modelo.mjs` | Declara qué es un prospecto y lo empuja por la Metadata API |
| `migrar.mjs` | Vuelca el respaldo del CRM propio al modelo nativo. Corrió una vez el 07/08/2026 |
| `reparar.mjs` | Devuelve los 8 prospectos si un borrado se los lleva. Ver *Trampas* |

Los tres necesitan la clave de API, que se genera en *Ajustes → API y Webhooks*, y aceptan `--ensayo` para ver qué harían sin escribir.

La leen de `TWENTY_KEY` **o de `TWENTY_API_KEY`**, que es la que ya está en el entorno de usuario de Windows porque la consume el servidor MCP. Es la misma credencial, así que no hay que declararla dos veces:

```bash
node codence/modelo.mjs --ensayo          # toma TWENTY_API_KEY del entorno
TWENTY_KEY=... node codence/modelo.mjs    # o se pasa explícita
```

Los dos son **idempotentes**: `modelo.mjs` saltea el campo que ya existe, `migrar.mjs` saltea la empresa que ya está. Correrlos dos veces no duplica nada.

⚠️ **Pero un campo que ya existe todavía puede tener la lista cambiada**, y saltearlo sin más era un defecto: hasta el 07/08, agregarle una opción a una taxonomía eran **dos** cambios —este archivo *y* la interfaz de Twenty— porque el bucle no aplicaba nunca la lista declarada. El archivo no quedaba incompleto: quedaba **mintiendo sobre el esquema real**, sin avisar. Hoy `sincronizarOpciones()` la reconcilia, conservando el `id` de cada opción que sobrevive para no reescribir datos cargados. **Si una opción desaparece, avisa y aplica igual** — la declaración es la fuente de verdad, y queda escrito cuál fue.

## El modelo

Decidido el 07/08/2026: **nativo**, no un objeto plano propio. Twenty ya resolvía 11 de los 21 campos que tenía el CRM viejo, y el pipeline en Kanban sale gratis de `Opportunity.stage`.

| Objeto | Qué guarda |
|---|---|
| **Company** | La empresa — `name`, `domainName`, y `industria` (custom) |
| **Person** | El decisor — `name`, `jobTitle`, `linkedinLink`, `emails`, y `gradoConexion` (custom) |
| **Opportunity** | El outbound — `stage` es el **Estado**, más 16 campos custom: 11 del prospecto y 5 del circuito de aprobación |
| **Note** | La bitácora: la investigación de `/prospectar` y el historial de mensajes |
| **Task** | Lo que falta hacer, con `status`, `dueAt` y `assignee`. Nativo, sin campos custom |
| **Pista** | **La bandeja de entrada.** Objeto propio, agregado el 08/08 — `tipo`, `enlace`, `estado`, `detalle` |

**`Person` admite dos por empresa desde el 08/08:** quien decide y quien sufre el
dolor. La que decide es el `pointOfContact` de la Opportunity; la otra cuelga
sólo de la Company. Se busca la segunda sólo en las tarjetas que lo valen, y cada
una lleva su propio ángulo y su propio mensaje.

⚠️ **`Pista` es el único objeto propio, y es el que hace aparecer una entrada en
la barra lateral izquierda.** Crearlo le agregó solo las relaciones por defecto
—adjuntos, notas, tareas y línea de tiempo—, así que **acepta capturas
arrastradas sin declarar ningún campo de archivo**. Es también la puerta por
donde entra lo que el agente no puede leer: LinkedIn e Instagram no se tocan con
navegador automatizado, pero Alan sí los ve.

`task.status` tiene cuatro opciones. Las tres de fábrica —**To do**, **In progress**, **Done**— hablan de la tarea. La cuarta se agregó el 08/08 y habla de otra cosa:

⚠️ **`Standby` pausa el prospecto, no la tarea.** Significa que la tarjeta está en pausa pero **sigue en proceso: no se la descarta**, así que no se confunde con `Sin interés` ni con `Descalificado`, que son estados terminales del pipeline y viven en `opportunity.stage`. Una tarjeta con una tarea en `Standby` **sale de la cola de `/outbound-hoy`** y aparece en su propia sección. Sin eso la pausa no serviría de nada: ICG10 venía saliendo como seguimiento vencido en todos los reportes.

**Note y Task no son lo mismo, y separarlas fue el ajuste del 07/08:** la Note se lee y no se cierra nunca; la Task se cierra. Antes las dos cosas vivían en la Note, y por eso para saber qué le faltaba a un prospecto había que leer prosa, y para saber qué le faltaba a siete había que abrir siete tarjetas.

**El `dueAt` de una tarea hereda la ventana de su señal.** Es lo que hace que la lista sirva: una deuda que bloquea el mensaje vence el día en que la señal deja de servir. Y el `assignee` marca la propiedad — **asignada a Alan es lo que solo él puede hacer** (leer un grado en LinkedIn, mandar, mirar capturas); sin asignar lo hace el agente.

⚠️ **El `PENDIENTE:` sigue escrito dentro de `senal`, además de existir como tarea.** No es duplicación por descuido: `senal` es lo que se lee en el instante anterior a redactar, y que un dato esté en duda cambia **lo que se puede afirmar**, no solo lo que falta hacer. La regla que evita mantenerlos a mano: **cuando la tarea pasa a `Done`, el `PENDIENTE` sale de `senal` en la misma pasada.** Uno que sobrevive a su tarea cerrada es un defecto.

`Opportunity.stage` se reescribió con los 9 estados del outbound: *Por investigar → Calificado → Contactado → Seguimiento 1 → Seguimiento 2 → Respondió*, y los tres terminales *Convertido / Sin interés / Descalificado* en gris.

**Los rótulos visibles son los de siempre; el valor interno va derivado** (`Logística` → `LOGISTICA`). Renombrar una etiqueta no rompe los datos.

## Reglas que vinieron del sistema viejo

Están completas en `docs/decisiones.md` del repo `codence-auditorias`. Las dos que tocan a este código:

**Las taxonomías se adaptan; las reglas de evidencia no.** `Estado`, `Canal`, `Industria`, `Ángulo` y `Servicio` viven en **un solo lugar** — hoy es `modelo.mjs`, y agregar una opción es una línea ahí o el control de la interfaz. Lo que nunca se adapta es qué cuenta como fuente y qué se puede afirmar.

**Ningún mensaje de outbound sale sin una observación específica y verificable** sobre esa empresa, con su fuente abierta. Por eso `senal` y `fuente` son campos y no un comentario.

## Las skills

En `.claude/skills/`, y se descubren al abrir Claude Code **en esta carpeta** (`D:\codence-crm`), no en `codence-auditorias`.

| | |
|---|---|
| `/buscar` | Trabaja padrones de empresas reales y lee sobre cada una los 6 dolores. **No carga nada**: entrega |
| `/prospectar` | Investiga, califica y carga los 3 registros, la nota, y una tarea por deuda |
| `/outbound-hoy` | La cola del día, las trabadas con qué le falta, y el registro del toque de LinkedIn y WhatsApp |
| `/outbound-mensaje` | Redacta en el formato y el largo del canal, y lo deja en `Redactado`. **No envía** |
| `/enviar` | Arma en Gmail el borrador de lo aprobado, y verifica contra el buzón qué salió. **Solo canal Email** |

**El motor de `/buscar` es el padrón, no la prensa.** Se toma una lista de empresas reales —una cámara, un parque, una guía de industria, los expositores de una feria— y sobre cada una se leen sus propias superficies buscando los seis dolores. La prensa de eventos quedó como **acelerador**: le pone urgencia a una tarjeta que el padrón ya trajo.

⚠️ **Playwright para llegar, `WebFetch` para leer.** El menú de un padrón suele ser JavaScript, así que la URL del listado no sale de un fetch de la portada: eso se resuelve navegando con Playwright. Pero las páginas de listado son HTML plano y `WebFetch` las lee mejor — sobre `guiavacamuerta.com` devolvió **26 empresas de transporte y logística con correo y sitio en una sola llamada**, donde Playwright necesitó cinco.

⚠️ **Y la trampa real no era el JavaScript: era adivinar la ruta.** Ese padrón se dio por vacío al pedir `/empresas/`, que es una página de plantilla; la buena es `/companias` → `/categorias/NN-nombre.htm`. El error se repitió cinco minutos después inventando otra ruta que dio 404. **El enlace se saca de la navegación del sitio, siempre.**

⚠️ **Y un 403 no cierra una ruta.** `traded.co`, FinSMEs y FinTech Futures bloquean el pedido plano; lo que corresponde es buscarles el boletín por correo, no darlas por inexistentes. **403 significa que el servidor entendió el pedido y se negó**, no que la página no exista.

Hablan con Twenty por su **servidor MCP**, declarado en `.mcp.json` como `twenty` → `http://localhost:3000/mcp`. La clave no está en el archivo: sale de `TWENTY_API_KEY` del entorno de usuario de Windows.

⚠️ **Un servidor MCP se carga al iniciar la sesión.** Si se cambia `.mcp.json`, la sesión en curso sigue con lo viejo.

**El paso 0 de todas llama a `get_field_metadata`** en vez de leer un archivo de taxonomías. Agregar una opción desde la interfaz alcanza, y las skills la ven.

## El circuito de aprobación del canal Email

Agregado el 08/08. Resuelve los dos cortes que tenía el outbound: no había en Twenty nada que distinguiera *"esperando visto bueno"* de *"nunca se escribió"*, y la contabilidad del toque dependía de que Alan se acordara de avisar. Por el segundo se cayó el toque 2 de Warren.

```
Sin borrador → Redactado → Aprobado → En Gmail → Enviado
                          ↑
                    lo mueve Alan, a mano, en el CRM
```

`/outbound-mensaje` deja el texto en `borradorAsunto` y `borradorCuerpo` y pone `Redactado`. Alan lo lee en la ficha, corrige ahí mismo si hace falta, y lo pasa a `Aprobado`. `/enviar` toma los aprobados y arma el borrador en Gmail. **Alan aprieta enviar.** Después `/enviar --confirmar` mira el buzón, y sobre lo que encuentra en `SENT` hace la contabilidad —`toques`, `ultimoToque`, `proximoToque`, `stage`— y escribe la bitácora.

**El borrador vive en campos y no en una Note porque un borrador es un estado:** se filtra, se ordena y se ve en el Kanban. La Note se escribe recién cuando el mensaje salió, con el texto que efectivamente se mandó — la Note se lee y no se cierra nunca.

**El único paso que no da una máquina es `Redactado` → `Aprobado`.** Por eso vive en un campo del CRM y no en una conversación.

### Por qué Gmail y no un navegador

Manejar el DOM del compositor de Gmail es frágil, las fallas son silenciosas y no devuelve identificador de hilo, así que lo enviado no queda atado a nada. Tampoco compra entregabilidad: **salir por API desde `core@codencelab.com` es el mismo sobre, el mismo pool de IPs y el mismo DKIM que salir desde la interfaz.** La reputación del dominio la arruinan el volumen y el contenido, no el transporte — de ahí el tope de 8 por día y un mensaje escrito por prospecto.

⚠️ **El conector de Gmail de Claude está sobre `core@codencelab.com` y no tiene herramienta de envío.** Son 16: leer hilos, armar y editar borradores, y etiquetas. Ninguna manda. Eso fija el diseño: la agente arma, Alan aprieta.

⚠️ **Y es una conexión de Claude, no de Twenty.** El servidor de Twenty no puede usar ese token. Su `send_email` nativo existe y manda de verdad, pero exige cuenta conectada propia. Queda como mejora futura si algún día se quiere envío sin clic: proyecto en Google Cloud, `AUTH_GOOGLE_*` y `MESSAGING_PROVIDER_GMAIL_ENABLED` en `packages/twenty-docker/.env`, y ojo que con la pantalla de consentimiento en modo *Testing* el refresh token de Google **caduca a los 7 días** y la cuenta se desconecta sola.

## Trampas

**Twenty no borra de verdad: marca `deletedAt`.** Un registro borrado sigue contando para la detección de duplicados, así que rehacer una migración devuelve `400 duplicate entry`. Se listan con `filter=deletedAt[is]:NOT_NULL` y se restauran con `PATCH {"deletedAt": null}`.

⚠️ **Un DELETE sobre un registro que ya pasó por la papelera lo purga de verdad.** Así se perdió la empresa ICG10 Capital el 07/08 y hubo que recrearla.

**Borrar la información de demo se lleva puesto lo migrado si se hace en bloque.** Pasó el 07/08. Para eso está `reparar.mjs`.

**Un SELECT no acepta un valor que empiece con dígito.** `1º` derivaba a `1` y la API lo rechaza; `gradoConexion` lleva valores explícitos.

**Al reemplazar las opciones de un SELECT hay que mandar `defaultValue` en el mismo PATCH**, porque el de fábrica deja de existir.

**`noteTargets` usa `targetCompanyId` / `targetOpportunityId`**, con prefijo — no `companyId`, que es lo que usan Opportunity y Person.

**El formato de filtro de la API REST es `campo[COMPARADOR]:valor`**, con dos puntos. Sin ellos devuelve vacío sin error.

⚠️ **Pero por MCP el filtro es otro, y no son intercambiables.** Ahí va como objeto —`{"aprobacion": {"eq": "APROBADO"}}`— y `select` es obligatorio, un arreglo de nombres de campo. Los scripts de esta carpeta hablan REST; las skills hablan MCP. Copiar el filtro de un lado al otro es el error fácil.

⚠️ **Verificar un envío por la ausencia del borrador es un falso positivo.** Que no esté en `list_drafts` no prueba que salió: pudo borrarse porque se decidió no mandarlo. Sólo cuenta encontrarlo en `SENT`.

## Cosas del entorno

**El puerto está atado a loopback a propósito.** `docker-compose.yml` publica en `127.0.0.1:3000`, no en `0.0.0.0`: acá adentro hay credenciales y datos de empresas reales. Si algún día tiene que verse desde el celular, la salida es una VPN, no abrir el bind.

**Docker guarda su disco en `D:\DockerDesktopWSL`.** Se movió el 07/08 porque `C:` había quedado en 8 GB.

**El clon es parcial** (`--filter=blob:none`): 0,45 GB en vez de ~1,5, con el historial completo. Si algún comando necesita blobs viejos, git los baja solo.

## Respaldo del sistema anterior

`D:\respaldo-crm-codence-2026-08-07\` — los 8 prospectos en crudo y en JSON.

⚠️ **Notion no lo reemplaza.** Su base de prospectos quedó *CONGELADA* el 02/08, así que lo del 01/08 al 03/08 existe solo ahí.
