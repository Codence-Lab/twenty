# El ICP

A quién le escribe Codence, y qué descarta una empresa antes de gastar trabajo en verificarla.

**Este archivo es la única fuente del ICP vigente.** Las skills lo apuntan, no lo copian. Si
`/buscar` o `/prospectar` dicen algo distinto de lo que dice acá, gana este archivo y se corrige
la skill.

> ⚠️ **Al 10/08/2026 hay un desacuerdo abierto con las bases, y es temporal.**
> `bases/identidad.md` (sección 3) todavía nombra **logística** dentro del ICP. Alan tiene cambios
> sin pushear en `Codence-Lab/codence-bases` y va a alinear esa sección cuando termine.
> **Mientras tanto, la regla es que gana la base.** Esta advertencia se borra cuando la base se
> actualice — no está acá para marcar una diferencia intencional, sino para que nadie la lea así.

---

## El recorte

**Empresas de producto digital que ya levantaron o ya facturan.**

Los rubros que lo nombran hoy son **fintech, apps y plataformas B2B / SaaS**. Son ejemplos de la
categoría, no la lista cerrada: lo que define el recorte es que la empresa **viva de un producto
digital**, no en cuál de los tres cajones cae.

**Una empresa fuera de eso entra por el dolor, no por el rubro** — y se anota que entró así, con
`industria` en `Otro`. Ecoterra entró de esa forma.

**Cambiado el 10/08/2026.** Antes eran fintech, logística y B2B / SaaS. El motivo no es una
corazonada: de las 26 tarjetas cargadas hasta ese día, **las 13 que se descalificaron eran casi
todas proveedores regionales sin producto digital** — MEHSA, Cruz del Sur, AXIS, Landmark,
Asesores & NovaMind, Test.Ing, ÁgilDev, Centro de Chapas, Security 24. Todas se trabaron en el
mismo punto: **no había una persona a la que escribirle.** El recorte viejo producía tarjetas que
morían antes del primer mensaje.

## El piso de etapa

**Post-ronda institucional o facturación comprobable.** Una de las dos alcanza.

**Cambiado el 10/08/2026, y es una corrección, no un criterio nuevo.** `/buscar` venía descartando
con *"la empresa ya factura"*, que es más duro que lo que dice la base: `bases/identidad.md`
define lead calificado como *"usuarios pagos, MRR validado, **o ronda de inversión temprana**"*.
La skill había endurecido la base por su cuenta. Ahora vuelve a lo que la base dice.

**Qué sí sigue descartando:** la startup en etapa de idea, sin producto vivo ni capital
institucional detrás.

## La escala

**Si no la decide una persona a la que se le pueda escribir, no sirve**, por buena que sea la
señal. Es el descarte más barato y por eso va primero.

## La geografía

**Mercados hispanos y anglosajones.** El test **no es el país: es el idioma en que se le puede
escribir**, español o inglés.

EE.UU. es válido. Una brasileña con sitio en inglés también — Einship y Strattum entraron así. Una
cuyo producto sólo existe en portugués, no: Jusfy quedó afuera por eso y no por ser de Brasil.
**El idioma se anota, porque decide en qué idioma se le escribe.**

---

## Instagram: prioriza, no descarta

**Se lee siempre y se anota el número** en `company.seguidoresIg`. **15.000 seguidores o más sube
el candidato en la cola. Menos no lo descarta.**

**Decidido el 10/08/2026, y la distinción entre priorizar y descartar es el punto entero.** Un
piso duro de 15k se comería dos cosas a la vez:

- **El mejor caso del dolor `Marca que no acompaña`**, que se sostiene justamente sobre pocos
  seguidores contra clientes reales. Datcisions es el ejemplo: seis marcas de moda reconocibles en
  su portada contra 550 seguidores. Con filtro duro, esa tarjeta no existe.
- **Buena parte del fintech B2B**, donde Instagram no mide nada. Rintin, COR y Duppla difícilmente
  lleguen a 15k, y son las tres primeras que llegaron a salir.

**Qué sí indica un número alto:** que la empresa ya invierte en presencia de marca, así que la
marca le importa y hay con qué pagarla. Eso ordena la cola, no la filtra.

**Cómo se lee:** con `WebFetch`, que sobre Instagram es un pedido público plano y devuelve
biografía, enlace y seguidores. **Nunca con navegador automatizado** — la sanción es la cuenta.

---

## Qué descarta, en orden de costo

Verificar cuesta caro. Descartar cuesta barato. **En este orden:**

| Se mira | Descarta si |
|---|---|
| **Escala** | Es tan grande que no la decide una persona a la que se le pueda escribir |
| **Etapa** | No levantó capital institucional **ni** factura. La idea sola no entra |
| **Idioma** | No se le puede escribir en español ni en inglés |
| **Ya está** | Aparece en Twenty, **incluidas las borradas** |

**La escala es el descarte más frecuente y el más barato. Mirarla primero.**

⚠️ **Las borradas cuentan.** Twenty no borra de verdad, marca `deletedAt`, y un registro borrado
sigue contando para la detección de duplicados. Una empresa que vuelve como candidata nueva hace
que `/prospectar` reviente con `400 duplicate entry` al final de todo el trabajo.

---

## Lo que el ICP no toca

**Las reglas de evidencia no se adaptan con el recorte.** Qué cuenta como fuente, que `WebFetch`
no puede establecer una ausencia, que no se apunta un navegador a Instagram ni a LinkedIn, que
adivinar rutas no es buscar. Eso está en `senales.md` y en las skills, y sigue igual cambie el ICP
las veces que cambie.

**Y el ICP tampoco decide el mensaje.** Para eso están `senales.md` (qué dolor, qué ángulo, qué
ventana) y `/outbound-mensaje` (con qué se abre).

---

## Qué cambió y cuándo

| Fecha | Cambio | Por qué |
|---|---|---|
| **10/08/2026** | El archivo existe | El ICP estaba duplicado en dos skills y `prospectar` apuntaba a `docs/contexto-outbound.md` de `codence-auditorias`, **que ya estaba muerto**. Es la misma falla de las cuatro copias del 09/08 |
| **10/08/2026** | Sale logística, entra producto digital | Las 13 descalificadas eran proveedores regionales sin decisor al que escribirle |
| **10/08/2026** | El piso pasa a post-ronda **o** factura | `/buscar` era más duro que `bases/identidad.md`. Se corrige hacia la base |
| **10/08/2026** | Instagram entra como prioridad | Un filtro duro de 15k mataba el mejor caso de `Marca que no acompaña` y casi todo el fintech B2B |
