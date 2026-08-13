# Dossier de evidencia

Las fuentes que puede citar una página de argumento, con su ficha.

Existe porque la página nueva **no diagnostica al prospecto**: argumenta sobre su situación. Y un argumento sin evidencia verificable es una opinión con tipografía linda.

---

## La regla, cambiada el 07/08/2026

Hasta hoy era *"solo fuentes primarias — nunca un blog de agencia citando a otro blog de agencia"*. Bloqueaba las tres cifras que esta página necesita, así que Alan la amplió. La forma nueva:

> **Una fuente no primaria se puede usar siempre que la cita diga qué es.**
> No se prohíbe la encuesta de un proveedor. Se prohíbe presentarla como si fuera facturación medida.

En la práctica, la naturaleza de la evidencia va **adentro de la cita**:

| Así no | Así sí |
|---|---|
| *"El branding consistente aumenta los ingresos un 23%"* | *"Encuesta a responsables de marketing — Lucidpress/Demand Metric, 2016"* |

**Por qué así:** el lector es un founder que acaba de levantar capital y lee memos de diligencia todos los días. Una cifra que en treinta segundos de búsqueda aparece con tres valores distintos y un vendedor detrás es un riesgo justo con esa audiencia. Con el alcance a la vista, deja de serlo y sigue sirviendo.

**Cada ficha lleva cinco campos**, y de ahí sale la línea de la cita: qué dice · qué clase de evidencia es · población y método · quién la publica y qué vende · límite de transferencia.

---

## ✅ Verificadas — abiertas y citadas textual

### McKinsey — *The business value of design*

**Qué dice.** «Top-quartile MDI scorers increased their revenues and total returns to shareholders (TRS) substantially faster than their industry counterparts did over a five-year period — **32 percentage points higher revenue growth and 56 percentage points higher TRS growth** for the period as a whole.»

**Qué clase de evidencia es.** **Medición financiera combinada con encuesta.** No es solo una cosa: los datos financieros son duros, pero las prácticas de diseño se relevaron entrevistando o encuestando a los líderes de cada empresa.

**Población y método.** «We tracked the design practices of **300 publicly listed companies** over a **five-year period** in multiple countries and industries. Their senior business and design leaders were interviewed or surveyed. Our team collected more than **two million pieces of financial data** and recorded more than **100,000 design actions**.» Regresión sobre esas acciones → 12 con mayor correlación → 4 temas → el McKinsey Design Index. Los puntajes observados van de **43 a 92**.

**Quién la publica.** McKinsey & Company, 25 de octubre de 2018. Autores: Benedict Sheppard, Garen Kouyoumjian, Hugo Sarrazin. **Vende consultoría de diseño**, así que el hallazgo le conviene — pero publica muestra y método, que es lo que la distingue.

⚠️ **Límite de transferencia, y va en la cita.** «The results held true in all three of the industries we looked at: **medical technology, consumer goods, and retail banking**.» **Ninguna es una startup de tecnología.** Son empresas cotizantes, grandes y establecidas. Transferir el +32 a una startup que levantó una semilla es exactamente lo que la regla *"¿medida en qué condiciones, y son las del lector?"* prohíbe.

**Cómo se cita entonces.** Lo que transfiere es **el mecanismo, no el número**: que el diseño se puede medir y correlaciona con desempeño. El +32 se nombra con los tres sectores al lado, o no se nombra.

**Fuente.** `mckinsey.com/capabilities/mckinsey-design/our-insights/the-business-value-of-design`
⚠️ **El dominio bloquea la lectura automatizada.** Se abrió por una copia archivada de su propia página — el original de McKinsey, servido por otro lado. No es un tercero resumiendo.

---

### Gartner — *B2B Buying Journey*

**Qué dice, y es lo más útil del dossier.** «Our research shows that **99% of B2B purchases are driven by organizational changes**.»

**Por qué importa más que ninguna otra acá.** Es el fundamento del outbound por señales, dicho por Gartner: **nadie compra porque lo llamaste; compra porque algo cambió adentro.** Una ronda, una expansión, un ejecutivo nuevo, un puesto abierto. Encontrar ese cambio es el juego entero — y es justo lo que hace `senales.md`.

**Las otras dos de la misma página:**
- «Our research reveals that **75% of B2B buyers prefer a rep-free sales experience**.»
- «We surveyed **148 respondents** involved in technology purchase decisions and found that, when buyers were familiar with a product or service, **64% preferred a 100% digital buying experience**.»

**Qué clase de evidencia es.** Investigación propia de Gartner. La tercera declara su muestra (148); **las dos primeras no publican el n en esta página**.

**Quién la publica.** Gartner. Vende investigación y asesoramiento a equipos comerciales.

⚠️ **Límite.** Población B2B general, no startups ni agencias. El 99% describe **qué origina una compra**, no qué tan seguido se compra ni cuánto se paga.

**Fuente.** `gartner.com/en/sales/insights/b2b-buying-journey` — abierta por copia archivada; el dominio devuelve 403 a la lectura automatizada.

---

## ⚠️ No se pudo abrir — no se cita hasta verificar

### Gartner, el «17% del tiempo con proveedores»

La cifra más citada de Gartner en B2B: los compradores pasan solo el 17% de su tiempo de compra reunidos con proveedores, y 5-6% con un representante dado.

**No está en la página de Gartner que pude abrir.** Aparece por todos lados atribuida a Gartner, pero **un resumen de búsqueda no es una fuente** y no llegué al original.

🚨 **Y hay una consecuencia que hay que arreglar:** esta cifra **ya está citada** en `leads/_ejemplo-ficticio/content.json` del repo `codence-auditorias`, en `hallazgos[0].fuentes[1]`. Esa cita está sin verificar. Es un lead ficticio, así que no salió a ningún tercero — pero si alguien la copia de ahí creyendo que pasó el filtro, sale.

**Qué falta.** Encontrar el informe de Gartner que la publica, con su año y su muestra. Hasta entonces, **no se usa** — y para lo que se quería usar, el 99% dice más y está verificado.

### Edelman Trust Barometer

Pendiente de abrir y fichar. Candidata para la capa de confianza del Trust Stack.

### Interbrand · Kantar BrandZ · Brand Finance

Pendientes. Publican metodología de valuación de marca, que es más de lo que ofrece la mayoría del material de branding. Son proveedores: se fichan como tales.

---

## 📋 Secundarias — usables con su ficha puesta

### Lucidpress / Demand Metric — el «23% más de ingresos»

**Qué dice.** Que la presentación consistente de marca puede aumentar los ingresos hasta un 23%.

**Qué clase de evidencia es.** **Encuesta de opinión a responsables de marketing.** No son estados contables auditados: es lo que gente de marketing declara sobre su propia marca.

**Población y método.** ~200 organizaciones en el estudio inicial de 2016, hecho con Demand Metric; 600+ entre las dos ediciones.

**Quién la publica.** Lucidpress, que **vende software de consistencia de marca**. El hallazgo respalda exactamente lo que vende.

⚠️ **Tres límites, y los tres van a la vista:**

1. **El número se movió:** 23% (2016) → 33% (2019) → 23,4% (2026). Un efecto medido no cambia así; una encuesta a otra muestra, sí.
2. **La forma en que suele citarse está mal leída.** *"60% de las empresas reportó 10-20% de crecimiento"* no es lo que dice el original: ahí se habla de crecimiento **esperado**, no de resultados reportados. **Esa versión no se usa nunca.**
3. **Autoinforme con sesgo conocido:** el que contesta evalúa su propia marca.

**Cómo se cita.** *"Encuesta a ~200 responsables de marketing — Lucidpress/Demand Metric, 2016"*, y el número acompaña como lo que es: lo que la gente de marketing cree, no lo que la contabilidad muestra.

**Dónde encaja.** Como refuerzo, nunca como titular. El titular lo lleva McKinsey o Gartner.

---

### NeuralSoft en Megatrans — el caso testigo de La Capital

**Qué dice.** Megatrans, empresa de telemetría y monitoreo con 30 años en el mercado, reemplazó su ERP por MyLogic de NeuralSoft en poco más de un año, con integración de aplicaciones y rediseño de procesos. Resultados publicados: **«la automatización permitió ahorrar cerca de 47 horas de trabajo administrativo por mes»** sobre un promedio de **1.500 órdenes mensuales**, errores de carga manual reducidos prácticamente a cero, **dos colaboradores reubicados** a funciones estratégicas y **una semana de retardo eliminada** en la puesta en marcha de servicios.

**Y la frase que más sirve, de Germán Viceconti, Director Comercial de NeuralSoft:** *«Primero hay que construir una base sólida; después, la inteligencia artificial multiplica ese valor»*. Es el argumento del orden entre servicios dicho por un tercero: **la IA no arregla un proceso desordenado, lo multiplica.**

**Qué clase de evidencia es.** **Un caso publicado en prensa, n = 1.** No es un estudio: es una empresa contando su propia implementación. Las cifras las declaran la empresa y su proveedor; nadie las auditó.

**Población y método.** Una sola empresa, argentina, de servicios de conectividad y monitoreo vehicular. Sin grupo de control y sin línea de base publicada más allá de lo que declara el gerente de operaciones.

**Quién la publica.** La Capital (Rosario), 11/08/2026. **El Director Comercial de NeuralSoft está citado en la nota**, así que tiene forma de caso comercial colocado en prensa local. Eso no la invalida —las cifras son concretas y atribuibles— pero decide cómo se cita.

⚠️ **Límite de transferencia, y es el que importa.** **Esto es ERP, automatización de procesos y software a medida. No es marca ni diseño web.** Usarlo en una propuesta de `Rebranding` o `Diseño web` es transferir un resultado de un dominio a otro, que es justo lo que la ficha de McKinsey prohíbe. Aterriza en `Automatización de procesos`, `Software a medida` y `Agentes AI`.

**Cómo se cita.** *«Caso publicado en La Capital, 11/08/2026: Megatrans declara 47 horas administrativas ahorradas por mes tras reemplazar su ERP»*. La naturaleza —caso único, declarado, con el proveedor citado— va adentro de la cita. **Nunca como "está probado que".**

**Fuente.** `lacapital.com.ar/negocios/un-caso-testigo-como-la-inteligencia-artificial-transforma-las-empresas-n10273784.html`

---

## ❌ Descartada

### Google / BCG — «los anunciantes digitalmente maduros crecen el doble»

Descartada el 29/07/2026, y sigue descartada: la población son anunciantes europeos con presupuesto de medios y **el tamaño de muestra no está publicado**. Sin muestra no hay ficha posible, y sin ficha la regla nueva tampoco la habilita.

*"Sirve para ubicar, no para encabezar."*

---

## Antes de agregar una fuente

1. **Abrirla.** Si el dominio bloquea, buscar una copia archivada **de esa misma página**. Un tercero resumiéndola no sirve.
2. **Copiar la frase textual.** No la paráfrasis del resumidor: uno le atribuyó *"más de 40.000 abonados"* a Security 24 y esa cifra no existe en ningún lado.
3. **Completar los cinco campos.** Si falta la muestra o el método, se anota que faltan — eso es parte de la ficha, no una excusa para omitirlos.
4. **Escribir el límite de transferencia.** La pregunta no es *"¿está medida?"* sino ***"¿medida en qué condiciones, y son las del lector?"***
5. **Redactar la línea de cita** con la naturaleza de la evidencia adentro.

**Si un paso no se puede completar, la fuente entra en «no se pudo abrir» — no en el argumento.**
