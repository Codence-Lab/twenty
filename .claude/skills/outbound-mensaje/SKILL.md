---
name: outbound-mensaje
description: Redacta el mensaje de outbound para un prospecto de Twenty, en el formato y el largo del canal que tenga asignado, y lo deja listo para copiar. No envía nada. Usar cuando Alan pida escribirle a un prospecto o preparar los seguimientos del día.
---

# /outbound-mensaje — redactar, no enviar

**Este comando nunca envía.** Deja el texto listo para que Alan lo copie y lo mande a mano. Cuando confirme que salió, se registra con `/outbound-hoy`.

**Argumento:** el nombre de la empresa. Si no viene, preguntar.

---

## Paso 0 — Traer el prospecto entero

Con las herramientas del servidor MCP de Twenty: la Opportunity, su Company, su punto de contacto, y **las Notes atadas**.

**La bitácora no es opcional.** Ahí está la investigación que justifica el mensaje, el historial de lo que ya se dijo, y —cuando lo hay— lo que salió mal antes. Escribir sin leerla es repetir errores ya cometidos.

Leer también el vocabulario vigente de `canal`, `angulo` y `servicio` con `get_field_metadata`, en vez de asumirlo.

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

## Paso 2 — Verificar que la señal siga en pie

**Una señal tiene fecha de vencimiento.** Un sitio se rehace, una búsqueda de empleo se cierra, un dato cambia. Antes de escribir, abrir la `fuente` y confirmar que lo que dice la señal sigue estando.

**`WebFetch` no puede establecer una ausencia.** Sirve para confirmar que algo está, **nunca** para afirmar que algo falta: sobre un sitio armado con JavaScript devuelve el cascarón sin fallar y sin avisar. Toda señal con forma *"no tienen X"* se verifica mirando capturas de la página completa, no con un fetch.

**Un resumen de búsqueda no es una fuente.** Antes de escribir un número, hay que haberlo visto en la página, no en el resumen de la página.

Si la señal ya no está: decirlo, no escribir el mensaje, y proponer volver la tarjeta a `Por investigar`.

## Paso 3 — Escribir

### El formato por canal

| Canal | Formato | Largo |
|---|---|---|
| LinkedIn, grado 1º | DM libre | 4-6 líneas |
| LinkedIn, grado 2º o 3º | Nota de conexión | **300 caracteres, límite de la plataforma** |
| WhatsApp | Mensaje corto | 3-5 líneas |
| Email | Asunto + cuerpo | 5-8 líneas |

**Los 300 caracteres son un límite duro, no una sugerencia.** Contarlos.

### Qué lleva el mensaje

1. **La observación específica**, en una línea, verificable por el destinatario en segundos.
2. **Qué implica**, sin diagnóstico grandilocuente.
3. **Una pregunta o una puerta chica.** No una propuesta.

### Qué NO lleva

**Nada de tono partido en dos fragmentos cortos, ni estructura de reversal** — *"No es X. Es Y."*, *"Esto no es un problema de diseño. Es un problema de sistema."* Está prohibido por la guía de marca y salió publicado doce veces en una auditoría porque se verificaba a ojo. **Contarlo con una expresión regular sobre el texto antes de entregarlo**: quien escribió el texto es justo quien no ve el patrón.

**Nunca nombrar un color.** Ni "los ejes en rojo" ni "la barra azul".

**No reformularle su problema si él ya lo dijo con sus palabras.** Si en la bitácora está lo que dijo, se usa su frase.

**No prometer en futuro sin nada que mostrar.** Entregar algo concreto le gana a anunciar que se va a entregar.

**No arrancar con "¿lo viste?"** cuando hay medición de que sí lo vio. Arrancar de un punto concreto del documento.

## Paso 4 — Entregarlo y anotarlo

Mostrarle a Alan el texto **listo para copiar**, con el conteo de caracteres si es una nota de conexión, y en qué canal va.

Dejar el mensaje escrito en la bitácora —una Note atada a la empresa y a la oportunidad— marcado como **redactado, no enviado**. Así, cuando Alan confirme, `/outbound-hoy` sólo registra el toque.

**No tocar `toques`, `ultimoToque` ni `stage`.** Redactar no es enviar.

---

## Si es un seguimiento

Leer **todo** lo que ya salió, en la bitácora. Un seguimiento que repite el primer mensaje quema la tarjeta.

**Arrancar de algo nuevo:** un dato que cambió, algo que se publicó, o un punto concreto de lo que ya se entregó. Si no hay nada nuevo que decir, decirlo — y proponer esperar o cerrar en `Sin interés`.
