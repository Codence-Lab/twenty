# Outbound automatizado por LinkedIn

> **Estado: standby hasta que Codence tenga capital para construirlo y sostenerlo.** Decidido el
> 22/09/2026. Mientras tanto sigue vigente la regla de `/enviar`: *«Nunca automatizar el envío por
> LinkedIn»*. Cuando se retome, esa regla se revierte con entrada fechada en el README.

## Por qué

El circuito de hoy es `/buscar` → `/prospectar` → `/outbound-mensaje` (deja `Redactado`) → Alan
aprueba → Alan copia y manda a mano en LinkedIn → `/outbound-hoy` registra el toque. Se corta en dos
lugares: los mensajes no convencen y quedan sin aprobar, y los aprobados no salen porque dependen de
copiar y pegar.

El objetivo es que búsqueda, análisis, redacción y envío corran solos, con un solo clic de Alan.

## Nombre

Es un sistema de **outbound**: la estrategia completa, en la que Codence contacta primero. El tramo
de contactar se llama **outreach**, y las herramientas de envío como HeyReach se venden como
*LinkedIn outreach automation*.

## Decisiones tomadas

| Qué | Decisión |
|---|---|
| Aprobación | **Un clic.** Alan mueve la tarjeta a `Aprobado` y sale sola. Los seguimientos también pasan por ese clic. Las respuestas se contestan a mano |
| Envío por LinkedIn | **HeyReach.** Trae límites, horario, calentamiento de la cuenta y bandeja unificada |
| Búsqueda | **Apollo** (plugin `sales:apollo`) más Sales Navigator |
| Clay | **Afuera.** Rinde con cientos de leads por semana; Codence manda de 8 a 15 por día, uno escrito por prospecto. Duplicaría la investigación de `/prospectar` y partiría la fuente de verdad entre Clay y el CRM. Se reevalúa si el volumen cambia |

⚠️ **LinkedIn no tiene API de mensajería para terceros.** Toda herramienta que manda por la cuenta
de una persona va contra sus términos. HeyReach es de las que menos cuentas pierde porque respeta
límites y horarios, pero el riesgo de restricción no es cero, y la cuenta de Alan es el canal.

## Qué hace falta

| Pieza | Para qué |
|---|---|
| Cuenta HeyReach con el LinkedIn de Alan conectado | Envío, límites, bandeja |
| API key de HeyReach | Variable de entorno `HEYREACH_API_KEY`, como `TWENTY_API_KEY` |
| Apollo autenticado en Claude | Búsqueda de empresas y decisores |
| Sales Navigator | InMail y búsqueda filtrada. Ya está pagado |
| Plan de Claude | Corre todo el pipeline |
| PC prendida con Docker | El CRM corre en `localhost:3000`; un agente en la nube no lo ve |

**Los precios se verifican al retomar**, no se anotan acá: cambian y un número viejo se toma por
vigente.

## Qué se construye

1. **Diagnóstico de calidad, primero.** Leer todas las Notes de `Reformular` y comparar los
   borradores contra lo que Alan editó antes de aprobar; ajustar `/outbound-mensaje` con los
   patrones que sigan fallando. Hacer obligatorio `codence-bases/.claude/skills/copy-codence/auditar.py`
   antes de dejar un borrador en `Redactado`. Mandar solo mensajes que hoy no se aprobarían
   empeora el problema.
2. **Campañas en HeyReach, una por vehículo:** nota de conexión (300 caracteres), DM a 1er grado, e
   InMail si HeyReach lo soporta con Sales Navigator (verificar; si no, InMail queda manual). Cada
   paso es sólo la variable `{mensaje}`: sale el texto aprobado en el CRM, sin plantilla.
3. **`codence/heyreach.mjs`**, mismo estilo que los otros scripts (`--ensayo`, clave por entorno):
   agregar lead a campaña con variables, leer su estado, leer conversaciones nuevas.
4. **`/enviar` gana el canal LinkedIn:** toma los `Aprobado`, elige vehículo con la tabla del Paso 4
   de `/outbound-mensaje`, repasa los frenos (señal vencida, tono, cifra de ronda, color) y carga el
   lead en la campaña. `aprobacion` pasa a `En LinkedIn` (opción nueva). `--confirmar` consulta
   HeyReach y hace la contabilidad y la bitácora igual que con Email.
5. **Aceptaciones y respuestas:** una invitación aceptada deja la tarjeta lista para redactar el
   mensaje con el argumento completo. Una respuesta pasa a `Respondió` y va arriba del parte.
6. **`/buscar` y `/prospectar` con rutas nuevas:** Apollo y Sales Navigator además del padrón.
   `icp.md` y `senales.md` siguen siendo el filtro. `gradoConexion` deja de cargarse a mano.
7. **`/outbound-auto`:** encadena `--confirmar` → buscar → prospectar → redactar → cargar aprobados,
   con tope por corrida. Lo dispara el Programador de tareas de Windows con
   `claude -p "/outbound-auto"` a las 9:00 de días hábiles.
8. **Documentación:** entrada fechada en el README revirtiendo la regla de LinkedIn, y actualizar
   `enviar`, `outbound-mensaje` y `outbound-hoy`.

## Verificación, al construirlo

- `node codence/heyreach.mjs --ensayo`: listar campañas y cuenta conectada sin escribir.
- `node codence/modelo.mjs --ensayo` antes de aplicar la opción nueva de `aprobacion`.
- Una tarjeta de prueba contra un perfil propio de Alan, de punta a punta.
- Primera semana con tope bajo (5 invitaciones por día) mirando el estado de la cuenta.
- Tasa de `Reformular` de los primeros 10 borradores con el verificador obligatorio, contra la histórica.
