---
name: enviar
description: Arma en el Gmail de Codence los borradores de los mensajes que Alan aprobó en el CRM, y después verifica contra Gmail cuáles salieron para hacer la contabilidad del toque. Sólo canal Email. Usar cuando Alan pida mandar los aprobados, o preguntar qué salió y quién contestó.
---

# /enviar — el aprobado se convierte en borrador, y lo enviado se registra solo

**Este comando no manda.** Deja el correo armado en el buzón de Codence y **el enviar lo aprieta Alan en Gmail**. Ese clic es a propósito: `core@codencelab.com` es el dominio que entrega las auditorías y no tiene reputación de envío.

Lo que sí hace solo, y es la mitad que hoy falla, es **verificar qué salió**. Hasta ahora la contabilidad dependía de que Alan se acordara de avisar, y por ese agujero se cayó el toque 2 de Warren, vencido el 04/08.

**Sólo trabaja el canal `Email`.** LinkedIn y WhatsApp no se automatizan y esa regla no se toca.

**Dos modos:**

| | Qué hace |
|---|---|
| `/enviar` | Toma los `Aprobado` y les arma el borrador en Gmail |
| `/enviar --confirmar` | Mira qué salió de verdad, hace la contabilidad y avisa quién contestó |

---

## El circuito, en una línea

`Sin borrador` → **`Redactado`** (lo escribe `/outbound-mensaje`) → **`Aprobado`** (lo mueve Alan en el CRM, a mano) → **`En Gmail`** (lo arma este comando) → **`Enviado`** (lo confirma este comando contra Gmail).

`Descartado` es la salida lateral: un borrador que Alan decidió no mandar.

**El único paso que no da una máquina es `Redactado` → `Aprobado`.** Esa es la aprobación, y por eso vive en un campo del CRM y no en una conversación.

---

# Modo por defecto — armar los borradores

## Paso 0 — Traer lo aprobado

Con las herramientas del servidor MCP de Twenty, `find_many_opportunities` filtrando por `aprobacion` en `APROBADO` y estado no terminal, con su Company y su punto de contacto.

```
select:     ["id","name","canal","aprobacion","borradorAsunto","borradorCuerpo",
             "borradorFecha","senal","fuente","toques","stage","pointOfContactId"]
aprobacion: { "eq": "APROBADO" }
```

⚠️ **Por MCP el filtro es un objeto, no la cadena con corchetes.** `{"aprobacion": {"eq": "APROBADO"}}`, no `aprobacion[eq]:APROBADO` — ese es el formato de la API REST, el que usan los scripts de `codence/`. Los dos existen y no son intercambiables.

⚠️ **`select` es obligatorio y es un arreglo de nombres de campo.** Sin él la llamada falla con *"Select is required"*, que al menos avisa; pero pedir de menos devuelve la tarjeta sin el campo que se iba a leer, y eso no avisa nada.

Leer también el vocabulario vigente de `aprobacion` y `canal` con `get_field_metadata`, en vez de asumirlo.

## Paso 1 — Los frenos, tarjeta por tarjeta

**Una tarjeta que falla se saltea y se informa. No se aborta el resto.** Que a la quinta le falte el mail no es motivo para que las otras cuatro se queden sin salir.

| Freno | Por qué |
|---|---|
| `canal` distinto de `Email` | LinkedIn y WhatsApp no pasan por acá. Nunca |
| Punto de contacto sin `primaryEmail` | No hay a dónde mandarlo |
| `borradorAsunto` o `borradorCuerpo` vacíos | No hay qué mandar. Es un defecto: la tarjeta llegó a `Aprobado` sin texto |
| Señal fuera de su ventana | Un mensaje que abre con un hecho vencido es peor que ninguno |
| Tono prohibido en el cuerpo | Ver abajo |
| Tope diario alcanzado | Ver abajo |

### El tono se vuelve a revisar acá

**Nada de tono partido en dos fragmentos cortos ni estructura de reversal** — *"No es X. Es Y."*, *"Esto no es un problema de diseño. Es un problema de sistema."* Está prohibido por la guía de marca.

`/outbound-mensaje` ya lo revisa, **y acá se revisa de nuevo con una expresión regular sobre `borradorCuerpo`.** No es redundancia: entre que se redactó y que se aprobó, el texto pasó por la ficha de Twenty, donde Alan pudo editarlo. Lo que sale es lo que está en el campo, así que es el campo lo que hay que revisar.

**Nunca nombrar un color.** Vale igual acá.

**Y nunca el monto de una ronda.** `USD 30M`, `6,2 millones`, una valuación: ninguno. Se abre por la consecuencia visible, no por la cifra. Se revisa con una expresión regular igual que el reversal, y por el mismo motivo: el texto pudo editarse en la ficha después de escribirse.

⚠️ Ojo con el falso positivo: hay empresas que **se llaman** como un color. Blanco es una de las cargadas. La expresión regular avisa, la decisión se toma mirando.

### El tope diario

Contar las opportunities con `canal = Email` y `ultimoToque` en hoy. **El tope es 8.** Alcanzado, se corta y se informa cuántas quedaron esperando.

No es una cifra estética: es la diferencia entre escribir de a uno y mandar en tanda, y es lo que protege al dominio que entrega las auditorías.

## Paso 2 — Armar el borrador

`mcp__claude_ai_Gmail__create_draft` sobre `core@codencelab.com`, con `to`, `subject` y `body`.

**Sólo texto plano. No pasar `htmlBody`.** Un correo en texto plano sale como `text/plain` y se lee como lo que es: algo escrito a mano para esa persona. En cuanto se le agrega la parte HTML se vuelve `multipart/alternative`, que es exactamente la forma de todo lo que sale de una herramienta de campañas.

**Sin imágenes, sin píxel de seguimiento, sin acortadores de enlaces.** Un correo frío que parece campaña se filtra como campaña.

## Paso 3 — Anotar en la tarjeta

Sobre la Opportunity:

- `gmailDraftId` → el id que devolvió `create_draft`. **Es lo único que ata la tarjeta al correo**; sin él no hay forma de verificar después si ese mensaje salió
- `aprobacion` → `En Gmail`

**No tocar `toques`, `ultimoToque` ni `stage`.** Armar no es enviar. Eso lo hace el modo `--confirmar`, y sólo contra lo que Gmail diga.

## Paso 4 — El parte

Cuántos borradores quedaron esperando en Gmail y para quién. Cuáles se saltearon y por qué. Cuánto queda contra el tope de hoy.

---

# Modo `--confirmar` — cerrar el circuito

## Paso A — Verificar contra Gmail

Para cada opportunity en `En Gmail`, buscar en el buzón con `mcp__claude_ai_Gmail__search_threads`:

```
in:sent to:<direccion del decisor> newer_than:7d
```

Si aparece un mensaje enviado a esa dirección **después de `borradorFecha`**, salió.

⚠️ **La verificación tiene que ser positiva. Que el borrador ya no esté en `list_drafts` no prueba nada:** Alan pudo borrarlo porque decidió no mandarlo. Un borrador que desapareció sin mensaje en `SENT` no es un envío, es un descarte — se propone mover a `Descartado` y se pregunta, no se asume.

**No preguntarle a Alan si mandó.** El buzón ya tiene la respuesta, y preguntar es reintroducir el paso que falla.

## Paso B — La contabilidad, sólo sobre lo confirmado

Sobre la Opportunity:

- `toques` +1
- `ultimoToque` → **la fecha real del mensaje en Gmail**, no la de hoy. Si Alan lo mandó el viernes y esto corre el lunes, el toque es del viernes
- `proximoToque` → cuatro días después, **salvo que con eso llegue al cuarto toque**: ahí va vacío y se propone `Sin interés`
- `stage` sube un escalón: `Calificado` → `Contactado` → `Seguimiento 1` → `Seguimiento 2`
- `aprobacion` → `Enviado`, y `borradorAsunto`, `borradorCuerpo` y `gmailDraftId` quedan vacíos

**Fechas en GMT-3**, que es el huso de Alan, no UTC.

Y **dejar entrada en la bitácora**: una Note atada a la empresa y a la oportunidad, con **el texto exacto que salió** y el `threadId` de Gmail. Un campo que cambia sin dejar rastro pierde el historial.

⚠️ **Los noteTargets van con prefijo:** `targetCompanyId` y `targetOpportunityId`, no `companyId`. Es la trampa que está en el README.

### Y cerrar la tarea que el envío resolvió

Si había una Task abierta que pedía mandar ese mensaje: `status` → `DONE`, y sacar el `PENDIENTE:` correspondiente de `senal`, **en la misma pasada**. No son dos mantenimientos: es uno con dos escrituras.

## Paso C — Quién contestó

Para los prospectos con toques ya registrados, buscar en el buzón por la dirección del decisor y mirar si hay mensaje **entrante** posterior a `ultimoToque`.

Se busca por dirección, no por un id guardado: así también aparecen las respuestas de los prospectos que se contactaron antes de que este circuito existiera.

Si contestó: `stage` → `Respondió`, `proximoToque` vacío, y **va arriba de todo el parte**. Una respuesta sin ver es lo más caro que puede pasar en outbound.

## Paso D — Lo trabado

**Un borrador que lleva más de tres días en `En Gmail` sin salir se reporta como trabado**, con cuántos días lleva.

Es exactamente el agujero por el que se cayó el toque 2 de Warren: el mensaje estaba escrito y nadie lo mandó, y como nada lo vigilaba, la ventana de la señal se venció sola.

---

## Reglas que no se negocian

**El envío lo aprieta Alan.** Este comando arma y verifica. La línea entre las dos cosas es el clic, y no se cruza.

**Nunca automatizar el envío por LinkedIn.** No hay API de mensajería para terceros y hacerlo con un navegador viola sus términos; la sanción es la restricción de la cuenta, que es el único canal de distribución.

**Nada sale de `Aprobado` sin que Alan lo haya movido ahí.** Este comando no aprueba, no reinterpreta un `Redactado` como listo, y no manda algo porque parezca terminado.

**Nada de tanda.** Tope de 8 por día, cada mensaje escrito para su prospecto. La reputación de un dominio la arruina el volumen y el contenido, no el transporte.

**No inventar que algo salió.** Si Gmail no lo muestra en `SENT`, no salió — aunque el borrador ya no esté, aunque la tarjeta parezca lista, aunque Alan haya dicho que lo iba a mandar.
