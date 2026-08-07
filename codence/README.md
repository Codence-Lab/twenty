# codence/

Lo propio de Codence sobre Twenty. Vive en una carpeta que upstream no tiene, así que traer releases de `twentyhq/twenty` no genera conflictos acá.

## Levantar el CRM

Docker Desktop tiene que estar corriendo (la ballena fija en la bandeja). Después:

```bash
cd packages/twenty-docker
docker compose up -d
```

Entra por **http://localhost:3000**.

Para apagarlo: `docker compose stop`. Los datos viven en volúmenes de Docker y sobreviven.

## Los scripts

| | |
|---|---|
| `modelo.mjs` | Declara qué es un prospecto y lo empuja por la Metadata API |
| `migrar.mjs` | Vuelca el respaldo del CRM propio al modelo nativo. Corrió una vez el 07/08/2026 |
| `reparar.mjs` | Devuelve los 8 prospectos si un borrado se los lleva. Ver *Trampas* |

Los dos necesitan `TWENTY_KEY`, que se genera en *Ajustes → API y Webhooks*, y aceptan `--ensayo` para ver qué harían sin escribir.

```bash
TWENTY_KEY=... node codence/modelo.mjs --ensayo
```

Los dos son **idempotentes**: `modelo.mjs` saltea el campo que ya existe, `migrar.mjs` saltea la empresa que ya está. Correrlos dos veces no duplica nada.

## El modelo

Decidido el 07/08/2026: **nativo**, no un objeto plano propio. Twenty ya resolvía 11 de los 21 campos que tenía el CRM viejo, y el pipeline en Kanban sale gratis de `Opportunity.stage`.

| Objeto | Qué guarda |
|---|---|
| **Company** | La empresa — `name`, `domainName`, y `industria` (custom) |
| **Person** | El decisor — `name`, `jobTitle`, `linkedinLink`, `emails`, y `gradoConexion` (custom) |
| **Opportunity** | El outbound — `stage` es el **Estado**, más 10 campos custom |
| **Note** | La bitácora: la investigación de `/prospectar` y el historial de mensajes |

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
| `/prospectar` | Investiga, califica y carga los 3 registros más la nota |
| `/outbound-hoy` | La cola del día, las trabadas con qué le falta, y el registro del toque |
| `/outbound-mensaje` | Redacta en el formato y el largo del canal. **No envía** |

Hablan con Twenty por su **servidor MCP**, declarado en `.mcp.json` como `twenty` → `http://localhost:3000/mcp`. La clave no está en el archivo: sale de `TWENTY_API_KEY` del entorno de usuario de Windows.

⚠️ **Un servidor MCP se carga al iniciar la sesión.** Si se cambia `.mcp.json`, la sesión en curso sigue con lo viejo.

**El paso 0 de las tres llama a `get_field_metadata`** en vez de leer un archivo de taxonomías. Agregar una opción desde la interfaz alcanza, y las skills la ven.

## Trampas

**Twenty no borra de verdad: marca `deletedAt`.** Un registro borrado sigue contando para la detección de duplicados, así que rehacer una migración devuelve `400 duplicate entry`. Se listan con `filter=deletedAt[is]:NOT_NULL` y se restauran con `PATCH {"deletedAt": null}`.

⚠️ **Un DELETE sobre un registro que ya pasó por la papelera lo purga de verdad.** Así se perdió la empresa ICG10 Capital el 07/08 y hubo que recrearla.

**Borrar la información de demo se lleva puesto lo migrado si se hace en bloque.** Pasó el 07/08. Para eso está `reparar.mjs`.

**Un SELECT no acepta un valor que empiece con dígito.** `1º` derivaba a `1` y la API lo rechaza; `gradoConexion` lleva valores explícitos.

**Al reemplazar las opciones de un SELECT hay que mandar `defaultValue` en el mismo PATCH**, porque el de fábrica deja de existir.

**`noteTargets` usa `targetCompanyId` / `targetOpportunityId`**, con prefijo — no `companyId`, que es lo que usan Opportunity y Person.

**El formato de filtro es `campo[COMPARADOR]:valor`**, con dos puntos. Sin ellos devuelve vacío sin error.

## Cosas del entorno

**El puerto está atado a loopback a propósito.** `docker-compose.yml` publica en `127.0.0.1:3000`, no en `0.0.0.0`: acá adentro hay credenciales y datos de empresas reales. Si algún día tiene que verse desde el celular, la salida es una VPN, no abrir el bind.

**Docker guarda su disco en `D:\DockerDesktopWSL`.** Se movió el 07/08 porque `C:` había quedado en 8 GB.

**El clon es parcial** (`--filter=blob:none`): 0,45 GB en vez de ~1,5, con el historial completo. Si algún comando necesita blobs viejos, git los baja solo.

## Respaldo del sistema anterior

`D:\respaldo-crm-codence-2026-08-07\` — los 8 prospectos en crudo y en JSON.

⚠️ **Notion no lo reemplaza.** Su base de prospectos quedó *CONGELADA* el 02/08, así que lo del 01/08 al 03/08 existe solo ahí.
