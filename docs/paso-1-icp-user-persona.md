# Paso 1 — ICP y User Persona

**Proyecto:** Taller Don Ramiro — plataforma de gestión operativa para talleres mecánicos
**Basado en:** definición del problema de la Tarea 1 y spec `.kiro/specs/aprobacion-cotizaciones.md`
**Fecha:** noviembre 2026

> **Nota metodológica.** El ICP y las personas se construyen a partir de los tres problemas de la definición: interrupciones constantes, demoras por aprobaciones y disputas sin prueba. Las características que no estaban en esa definición —edad, tamaño del taller, hábitos digitales, volumen de trabajo y disposición a pagar— son **hipótesis de trabajo plausibles**, no datos relevados. Se marcan como tales y se validan en la sección 9 antes de convertirlas en decisiones de producto.

---

## 0. Resumen ejecutivo

| Elemento | Definición |
|---|---|
| **ICP** | Taller mecánico independiente, multimarca, de barrio o ciudad intermedia, con 3 a 8 mecánicos y dueño operador. |
| **Persona primaria (decisor)** | Ramiro González, 56 años, dueño y administrador del taller. |
| **Persona de uso crítico** | Lucas Ferreyra, 29 años, mecánico. |
| **Persona beneficiaria** | Mariana Silva, 38 años, clienta del taller. |
| **Enemigo a vencer** | El status quo: WhatsApp suelto + llamadas + cuaderno + acuerdos "de palabra". |
| **Promesa** | "El auto avanza, el cliente decide y queda prueba." |

### ICP vs. user persona: no son lo mismo

| Concepto | Qué describe | Unidad de análisis | En este proyecto |
|---|---|---|---|
| **ICP** | A quién le vendemos | Empresa / taller | Taller Don Ramiro y talleres similares |
| **User persona** | Quién usa el producto | Persona | Ramiro, Lucas y Mariana |
| **Buyer persona** | Quién firma el pago | Persona | Ramiro (dueño) |

El ICP define el **segmento de negocio**; las personas describen a las **personas reales** dentro de ese segmento. Sin las dos cosas, el producto puede resolverle el problema a alguien que nunca lo va a pagar.

---

## 1. Punto de partida: el problema de la Tarea 1

El taller no pierde tiempo por "falta de una app". Lo pierde porque el proceso de autorización de reparaciones adicionales es informal y depende del teléfono.

| Problema | Quién lo sufre | Necesidad real |
|---|---|---|
| **Interrupciones constantes** | Dueño y mecánicos | Que el cliente consulte el estado solo, sin llamar. |
| **Demoras por aprobaciones** | Mecánico, dueño y cliente | Autorización rápida y asincrónica, sin frenar el auto. |
| **Disputas sin prueba** | Dueño del taller | Registro irrefutable de qué se aprobó, cuándo y por cuánto. |

**Trabajo principal del producto:** convertir una conversación telefónica difusa en un flujo de tres pasos con evidencia: el mecánico cotiza, el cliente decide y ambos ven el resultado en tiempo real.

### Trazabilidad problema → persona → feature

| Problema | Persona más afectada | Feature que lo ataca |
|---|---|---|
| Interrupciones | Ramiro / Lucas | Link de seguimiento sin contraseña + estado en tiempo real |
| Demoras | Lucas / Mariana | Cotización con foto y aprobación desde el celular |
| Disputas | Ramiro | Comprobante auditable con timestamp, IP y hash SHA-256 |

---

## 2. ICP — Ideal Customer Profile

### 2.1 Definición en una frase

> Talleres mecánicos independientes, multimarca, de barrio o ciudad intermedia, con **3 a 8 mecánicos**, dueño operador y uso intensivo de WhatsApp, que hoy gestionan el estado de los autos y las autorizaciones de reparación de forma informal.

No es "cualquier taller". Es el taller donde hay **suficiente volumen y suficiente equipo** como para que la coordinación informal duela todos los días.

### 2.2 Ficha del ICP (hipótesis de trabajo)

| Dimensión | Perfil |
|---|---|
| **Tipo de negocio** | Taller independiente, multimarca, no concesionario. |
| **Tamaño** | 3 a 8 mecánicos + 1 aprendiz. |
| **Volumen** | 40 a 120 vehículos por mes. |
| **Facturación estimada** | USD 8.000 a 40.000 por mes; ticket promedio USD 80 a 300. |
| **Ubicación** | Argentina: AMBA, Córdoba, Rosario y ciudades intermedias. Expansión posterior a LATAM. |
| **Antigüedad** | 5 a 30 años; reputación construida en el barrio. |
| **Decisor** | El dueño, que sigue trabajando en el taller, o su pareja/familiar a cargo de la administración. |
| **Madurez digital** | Media-baja: WhatsApp Business, Excel básico, sin ERP ni CRM. |
| **Canal con clientes** | WhatsApp, teléfono y mostrador. No tiene portal de cliente. |
| **Proceso actual** | Cuaderno, pizarra, WhatsApp y memoria. |
| **Dolor principal** | Interrupciones, trabajos frenados y discusiones por plata. |
| **Trigger de compra** | Una disputa concreta, un cliente enojado o el crecimiento del equipo. |
| **Disposición a pagar** | USD 25 a 60 por mes por taller (hipótesis). |
| **Métrica de éxito** | Menos llamadas, aprobaciones rápidas y cero disputas. |
| **Barreras** | "Ya funcionamos así", miedo a que los mecánicos no lo usen, clientes sin costumbre. |

### 2.3 Filtros: cuándo un taller SÍ es ICP

Un taller entra al ICP si cumple al menos **4 de estos 6** criterios:

- [ ] Tiene **2 o más mecánicos** (hay delegación y cuello de botella de aprobación).
- [ ] Recibe **30 o más vehículos por mes** (el dolor es frecuente, no anecdótico).
- [ ] Hace **reparaciones adicionales** además del servicio inicial.
- [ ] Usa **WhatsApp con clientes todos los días**.
- [ ] Tiene **smartphone o tablet en el taller**.
- [ ] El dueño puede nombrar **una pérdida concreta** de tiempo o plata por este problema.

Si falla 3 o más criterios, no es prioridad para el MVP: puede ser un usuario válido, pero no un cliente ideal.

### 2.4 Antipersona: quién NO es ICP

| Segmento | Por qué no es prioridad |
|---|---|
| **Concesionarios oficiales** | Ya tienen DMS/ERP y procesos corporativos; ciclo de venta largo y requisitos de integración. |
| **Cadenas grandes de talleres** | Compra centralizada, comité de compras y exigencias de seguridad que el MVP no cubre. |
| **Talleres de carrocería y pintura** | Flujo distinto, peritajes de aseguradora y autorizaciones que no dependen solo del cliente. |
| **Taller unipersonal** | El dueño es el mecánico; no hay coordinación que optimizar y la disposición a pagar es baja. |
| **Talleres sin smartphone ni WhatsApp** | El canal por donde se entrega el valor no existe. |
| **Clientes finales** | Usan el producto, no lo compran. Son beneficiarios, no clientes. |

### 2.5 Mapa de roles: comprador, usuario y beneficiario

| Rol | Quién | Qué necesita | Qué mide | Poder en la decisión |
|---|---|---|---|---|
| **Comprador económico** | Ramiro (dueño) | Control, prueba y menos interrupciones | Tiempo y plata | Decide la compra |
| **Usuario operativo** | Lucas (mecánico) | Un toque, cero papeleo | Que el auto avance | Puede adoptar o boicotear |
| **Usuario administrador** | Ramiro / Susana | Registrar autos y enviar el link | Orden y visibilidad | Configura el sistema |
| **Beneficiario** | Mariana (clienta) | Saber y decidir sin llamar | Certeza y trato justo | Recomienda o reclama |
| **Bloqueador** | Mecánico escéptico | Que no le sumen trabajo | Esfuerzo percibido | Puede volver al cuaderno |

**Lectura clave:** el que paga es Ramiro, pero el que decide si el producto sobrevive es Lucas. Si el mecánico no lo usa, el dueño vuelve al teléfono y el producto muere.

---

## 3. User Personas

### 3.1 Cómo leer las fichas

Cada persona incluye contexto, un día típico, objetivos, frustraciones, miedos, una frase textual y lo que necesita del producto. Los datos demográficos son **hipótesis ilustrativas** basadas en el segmento; no reemplazan una entrevista real.

---

### 3.2 Persona primaria — Ramiro González
#### "El dueño que no puede soltar el teléfono"

| Dimensión | Detalle |
|---|---|
| **Edad** | 56 años |
| **Rol** | Dueño y administrador |
| **Taller** | Taller Don Ramiro, San Martín, Buenos Aires |
| **Antigüedad** | 18 años con el taller; 30 en el oficio |
| **Equipo** | 4 mecánicos + 1 aprendiz |
| **Volumen** | 70 a 90 autos por mes (hipótesis) |
| **Tecnología** | Android de gama media, WhatsApp Business, Excel básico. No usa CRM ni planillas complejas. |
| **Administración** | Susana, su esposa, ayuda 3 días por semana con facturas y turnos. |

**Un día típico**

Abre a las 7:30. Recibe autos, pide repuestos, cotiza, atiende clientes y cierra caja a las 19:00. Almuerza en el taller. Contesta el teléfono entre tareas. A las 18:00 todavía está persiguiendo autorizaciones y explicando por qué un auto no está listo.

**Objetivos**

- Mantener los elevadores ocupados.
- Cobrar sin discusiones.
- No perder clientes por falta de comunicación.
- Crecer sin que el taller se vuelva un caos.
- Delegar sin perder el control.

**Frustraciones**

- El teléfono lo interrumpe todo el día.
- Los clientes no atienden cuando hay que autorizar.
- Los autos quedan desarmados esperando un "sí".
- Discusiones por adicionales que "nadie autorizó".
- No sabe qué está pasando sin preguntarles a los mecánicos.

**Miedos**

- Que la app sea un gasto más y no un ahorro.
- Que los mecánicos no la usen.
- Que el cliente se confunda y lo llame igual.
- Que se le escape un trabajo o un cobro.

**Frase textual**

> "Yo no puedo estar todo el día al teléfono. Y cuando el cliente dice que no autorizó, ¿qué le muestro?"

**Qué necesita del producto**

- Ver el estado global del taller en 10 segundos.
- Enviar un link por WhatsApp sin escribir a mano.
- Que la aprobación quede registrada con fecha y hora.
- Que el mecánico actualice el estado sin fricción.
- Que el cliente no tenga que crear una cuenta.

**Cómo mide el éxito**

> "Menos llamadas, autos que salen y ninguna discusión por plata."

**Qué lo haría pagar**

Una sola disputa evitada o dos horas por día recuperadas.

**Qué lo haría abandonar**

Cargar los datos dos veces, que el cliente tenga que registrarse o tener que ser él quien actualice cada estado.

---

### 3.3 Persona de uso — Lucas Ferreyra
#### "El mecánico que no va a escribir con las manos sucias"

| Dimensión | Detalle |
|---|---|
| **Edad** | 29 años |
| **Rol** | Mecánico |
| **Experiencia** | 6 años en el oficio; 2 en Don Ramiro |
| **Contexto** | Trabaja con guantes; el celular está en el carrito o en el bolsillo. |
| **Tecnología** | WhatsApp, YouTube y Mercado Libre. No usa planillas ni formularios. |

**Un día típico**

Recibe autos, diagnostica, pide repuestos, repara y avisa al dueño. Mientras trabaja, alguien le pregunta "¿cómo va?". Cuando encuentra un problema adicional, tiene que esperar la autorización con el auto desarmado.

**Objetivos**

- Terminar el trabajo y pasar al siguiente.
- No repetir información.
- Que no lo culpen por un adicional que no autorizó.
- Saber qué sigue sin preguntar.

**Frustraciones**

- Formularios largos y pantallas pequeñas.
- Tener que iniciar sesión para algo operativo.
- Escribir en el celular con las manos sucias.
- Que el dueño le pregunte el estado a cada rato.
- Esperar una autorización con el auto frenado.

**Miedos**

- Que la app le sume trabajo administrativo.
- Que lo exponga si algo sale mal.
- Que lo obliguen a usar una herramienta que no le sirve.

**Frase textual**

> "Decime qué toco y listo. No me pidas que escriba un informe."

**Qué necesita del producto**

- Botones grandes.
- Un toque por cambio de estado.
- Foto como evidencia, sin explicar de más.
- Confirmación visual inmediata.
- Cero login.

**Cómo mide el éxito**

> "Termino el auto y no tengo que explicar dos veces."

**Riesgo de adopción**

Si en la primera semana no le ahorra tiempo, vuelve al cuaderno o al WhatsApp.

---

### 3.4 Persona beneficiaria — Mariana Silva
#### "La clienta que necesita certeza, no un taller que le explique después"

| Dimensión | Detalle |
|---|---|
| **Edad** | 38 años |
| **Ocupación** | Empleada administrativa |
| **Contexto** | Vive en San Martín; dos hijos; su auto es parte de la rutina familiar. |
| **Vehículo** | VW Gol Trend 2016 |
| **Tecnología** | Usa WhatsApp todo el día; no descarga apps para un trámite puntual. |

**Un día típico**

Deja el auto antes del trabajo. Necesita saber cuándo estará listo. Durante el día consulta el celular entre reuniones. Si el taller la llama para autorizar un gasto, tiene que decidir rápido y sin contexto.

**Objetivos**

- Saber cuándo estará listo el auto.
- No pagar sorpresas.
- Decidir rápido y con información.
- Tener un respaldo de lo que autorizó.

**Frustraciones**

- Llamar y que no atiendan.
- Escuchar "está en proceso" sin detalle.
- Enterarse del adicional cuando ya se hizo.
- Sentirse presionada por teléfono.
- No entender por qué subió el presupuesto.

**Miedos**

- Que le cambien el precio.
- Que le cobren algo que no autorizó.
- Quedarse sin auto más días de lo previsto.

**Frase textual**

> "No quiero que me llamen para avisarme de un gasto. Quiero verlo, entenderlo y decidir."

**Qué necesita del producto**

- Link sin contraseña.
- Foto de la pieza o del problema.
- Descripción clara y precio final.
- Botones grandes para aprobar o rechazar.
- Comprobante visible.

**Cómo mide el éxito**

> "Abrí el link, vi la foto, aprobé y supe cuándo retirarlo."

**Riesgo**

Si el link no abre o el adicional no se entiende, llama al taller y el problema de las interrupciones vuelve.

---

### 3.5 Por qué Ramiro es la persona primaria

| Criterio | Ramiro | Lucas | Mariana |
|---|---|---|---|
| **Paga** | Sí | No | No |
| **Decide la adopción** | Sí | Puede bloquearla | No |
| **Sufre el costo económico** | Sí | Parcialmente | No |
| **Frecuencia de uso** | Diaria | Diaria | Esporádica |
| **Define el valor percibido** | Sí | Sí | Sí |

Ramiro concentra el dolor económico y la decisión de compra; por eso es la persona primaria. Lucas determina si el producto se usa de verdad. Mariana determina si el valor se percibe. Los tres importan, pero el diseño se prioriza por Ramiro y se valida con Lucas y Mariana.

---

## 4. Mapa de empatía — Ramiro

| Zona | Qué se observa |
|---|---|
| **Piensa y siente** | "El taller es mi casa." "No quiero deberle nada a nadie." "La tecnología me tiene que resolver, no complicar." |
| **Ve** | Autos esperando, mecánicos ocupados, el teléfono sonando, un cuaderno con tachones. |
| **Oye** | "¿Ya está?", "¿Me lo podés hacer más barato?", "No me avisaste", "Che, el cliente llamó". |
| **Dice y hace** | "Mandame un WhatsApp", "Decile que sí", "Anotalo", "Después vemos". |
| **Dolores** | Interrupciones, reprocesos, disputas, falta de visibilidad. |
| **Ganancias** | Tranquilidad, control, prueba y tiempo. |

---

## 5. Jobs to be Done

| Persona | Job funcional | Job emocional | Job social |
|---|---|---|---|
| **Ramiro** | "Cuando surge un adicional, quiero autorización rápida y registrada para no frenar el auto ni perder plata." | "Quiero sentir que tengo el taller bajo control sin estar encima." | "Quiero ser el dueño serio que cumple y no discute." |
| **Lucas** | "Cuando termino un paso, quiero marcarlo en un toque para que no me pregunten." | "Quiero que mi trabajo se vea y no cargar con culpas." | "Quiero que me reconozcan como el que resuelve." |
| **Mariana** | "Cuando dejo el auto, quiero saber qué pasa y decidir los adicionales sin llamar." | "Quiero estar tranquila de que no me van a sorprender." | "Quiero poder contar que me trataron bien y me dieron comprobante." |

---

## 6. Customer journey del ICP

| Etapa | Qué hace Ramiro | Dolor | Oportunidad para el producto |
|---|---|---|---|
| **Trigger** | Una disputa o una llamada que lo desborda | "Esto no puede seguir así" | Caso concreto y testimonio de otro dueño. |
| **Búsqueda** | Pregunta a colegas, grupos de WhatsApp y proveedores | No sabe qué buscar | Boca a boca y presencia en circuitos de repuestos. |
| **Evaluación** | Prueba con un solo auto | Miedo a que sea complicado | Onboarding en 10 minutos, sin migrar nada. |
| **Onboarding** | Carga un auto y envía un link | Fricción de datos | Registro express y link automático. |
| **Uso diario** | El mecánico actualiza; el cliente aprueba | Si no lo usan, vuelve el caos | Un toque, tiempo real y notificaciones. |
| **Renovación** | Ve métricas y decide si sigue | No mide el valor | Reporte mensual de tiempo ahorrado y disputas evitadas. |
| **Recomendación** | Se lo cuenta a otro dueño | — | Programa de referidos. |

---

## 7. De las personas al producto

| Necesidad de la persona | Implicación de producto | Cómo lo resuelve la app hoy | Qué falta o hay que validar |
|---|---|---|---|
| El cliente no quiere crear cuenta | Acceso por link único con token | `ClientView` sin login | Expiración y seguridad del link. |
| Decidir rápido | Foto + precio + botones grandes | `QuoteModal` + `ClientDetail` | Notificación push o recordatorio por WhatsApp. |
| Tener prueba | Comprobante persistente | `receipt` con SHA-256 | Lenguaje claro: "comprobante", no "hash". |
| Cero fricción para el mecánico | Un toque, sin tipeo | Estados + modal | Modo offline y foto directa desde cámara. |
| Control del dueño | Tabla global y métricas | `Dashboard` + `AdminView` | Alerta de cotización pendiente hace más de X horas. |
| Confianza en tiempo real | Actualización sin recargar | Supabase Realtime | Manejo de errores y reintentos. |
| No cargar datos dos veces | Registro express | Formulario de alta | Importar desde WhatsApp o escanear patente. |

---

## 8. Posicionamiento y propuesta de valor

**Statement de posicionamiento**

> Para talleres mecánicos independientes con 3 a 8 mecánicos que pierden tiempo y plata esperando autorizaciones por teléfono, **Taller Don Ramiro** es la plataforma móvil que convierte cada reparación adicional en una decisión del cliente con evidencia auditable. A diferencia del WhatsApp suelto y el cuaderno, el taller ve el estado en tiempo real, el cliente decide sin llamar y la aprobación queda firmada con fecha, hora y hash.

**Tagline**

> **Menos llamadas. Menos discusiones. Más autos saliendo.**

**Pilares de valor**

| Pilar | Qué significa para el cliente | Cómo se demuestra |
|---|---|---|
| **Rapidez** | Un toque para avanzar, sin frenar el auto. | Cambio de estado en 1 toque y aprobación desde el celular. |
| **Confianza** | Queda prueba de lo aprobado. | Comprobante con timestamp, IP y hash persistido. |
| **Cero fricción** | Nadie tiene que crear cuenta ni aprender un sistema. | Link único y UI táctil para manos sucias. |

---

## 9. Supuestos y plan de validación

| # | Supuesto | Riesgo si es falso | Cómo validarlo | Criterio de éxito |
|---|---|---|---|---|
| 1 | Los clientes usan el link sin llamar. | Las interrupciones siguen y el producto no resuelve el problema principal. | Prueba con 10 clientes reales. | 8 de 10 abren y responden sin ayuda. |
| 2 | Los mecánicos actualizan el estado en un toque. | El dueño no tiene visibilidad y vuelve a preguntar. | Observación durante una semana en un piloto. | 80% de los cambios los hace el mecánico. |
| 3 | El dueño paga USD 25 a 60 por mes. | No hay modelo de negocio. | 5 entrevistas de precio y piloto pago. | 3 de 5 aceptan el piloto pago. |
| 4 | La disputa es un dolor prioritario. | El producto se percibe como "nice to have". | Entrevistas a dueños sin mencionar el tema. | La disputa aparece espontáneamente. |
| 5 | La foto acelera la decisión. | El cliente igual llama para preguntar. | Comparar aprobaciones con y sin foto. | 30% menos tiempo de aprobación. |
| 6 | El comprobante genera confianza. | Se percibe como burocracia. | Test de comprensión con 10 clientes. | 8 de 10 entienden para qué sirve. |

**Plan mínimo de investigación**

1. **8 a 10 entrevistas:** 4 dueños, 3 mecánicos y 3 clientes.
2. **2 talleres piloto** durante 2 semanas, con un solo auto por taller al inicio.
3. **Métricas del piloto:**
   - Activación: primer auto cargado y primer link enviado.
   - Tiempo hasta la primera cotización.
   - Porcentaje de cotizaciones respondidas.
   - Tiempo medio de aprobación.
   - Llamadas por día antes y después.
   - Disputas registradas.
4. **Decisión:** si 2 de 2 talleres siguen usándolo después de 2 semanas y al menos 1 acepta pagar, se avanza a la siguiente etapa.

---

## 10. Cierre

> El cliente del negocio es el taller. El usuario que decide si el producto vive es el mecánico. La persona que experimenta el valor es el cliente final.

El ICP y las personas no son un adorno del trabajo académico: son el filtro para decidir qué construir, qué no construir y a quién decir que no. En este proyecto, ese filtro dice: **talleres con equipo y volumen, dueño operador, mecánico con las manos sucias y cliente con miedo a la sorpresa.**

---

## Anexo A — Guion breve de entrevista

### Para el dueño

1. Contame cómo es un día normal en el taller, de principio a fin.
2. ¿Cuántas veces por día te interrumpen para preguntar por un auto?
3. ¿Qué pasa cuando un mecánico encuentra algo más para arreglar?
4. ¿Cómo autoriza el cliente hoy? ¿Qué hacés si no contesta?
5. ¿Tuviste alguna discusión por una reparación que el cliente dice no haber aprobado?
6. ¿Qué hacés hoy para registrar lo que se autorizó?
7. Si pudieras eliminar una sola tarea de tu día, ¿cuál sería?
8. ¿Cuánto tiempo o plata perdés por mes por este problema?
9. ¿Qué probaste antes para resolverlo? ¿Por qué no funcionó?
10. ¿Cuánto pagarías por resolverlo de verdad?

### Para el mecánico

1. ¿Cómo sabés qué auto te toca y en qué estado está?
2. ¿Cómo avisás que terminaste un paso?
3. ¿Qué hacés cuando encontrás un problema adicional?
4. ¿Qué es lo que más te molesta de las herramientas o planillas que usás?
5. ¿Usarías una app en el celular con las manos sucias? ¿Qué te haría usarla?
6. ¿Qué te haría dejar de usarla?

### Para el cliente

1. ¿Cómo dejaste el auto y qué te dijeron?
2. ¿Cómo supiste cuándo estaba listo?
3. ¿Llamaste al taller? ¿Cuántas veces?
4. ¿Alguna vez te avisaron de un gasto extra? ¿Cómo te sentiste?
5. ¿Qué necesitarías para aprobar un adicional desde el celular?
6. ¿Qué te daría confianza de que el cobro es justo?
7. ¿Preferís que te llamen, te manden WhatsApp o te manden un link? ¿Por qué?

---

## Anexo B — Glosario

| Término | Definición |
|---|---|
| **ICP** | Perfil de cliente ideal: descripción del tipo de empresa a la que el producto le resuelve un problema relevante y que puede pagar por ello. |
| **User persona** | Representación ficticia pero basada en evidencia de un usuario típico, con objetivos, frustraciones y comportamientos. |
| **Buyer persona** | Persona que toma o influye en la decisión de compra, aunque no use el producto todos los días. |
| **JTBD** | Jobs to be Done: el "trabajo" que el usuario quiere resolver cuando usa el producto, más allá de la función técnica. |
| **Antipersona** | Perfil que se parece al cliente ideal pero que, por sus características, no es prioridad para el producto. |
