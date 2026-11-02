# Spec: Seguimiento y recordatorio automático de cotizaciones

**ID:** SPEC-002
**Estado:** Propuesta lista para implementación
**Feature base:** Aprobación de cotizaciones (SPEC-001)
**Proyecto:** Taller Don Ramiro
**Fecha:** noviembre 2026
**Responsable:** Producto / Desarrollo

---

## 0. Resumen ejecutivo

La aprobación de cotizaciones ya funciona, pero depende de que el cliente abra el link en el momento justo. Si no lo hace, el auto queda detenido, el mecánico espera y el dueño vuelve a llamar por teléfono.

Esta spec agrega **seguimiento activo de la cotización**: el sistema registra si el cliente la vio, envía recordatorios automáticos por WhatsApp, avisa al dueño cuando una cotización lleva demasiado tiempo sin respuesta, permite reenviarla y establece un vencimiento con opción de reapertura.

**Promesa de la feature:**

> "Ninguna cotización queda en el olvido: el cliente recibe el recordatorio justo, el dueño ve qué pasa y la decisión sigue teniendo respaldo auditable."

**North Star Metric:** porcentaje de cotizaciones resueltas (aprobadas o rechazadas) dentro de las **2 horas** posteriores al envío.

---

## 1. Definición del problema

### 1.1 Situación actual

El flujo actual es:

1. El mecánico detecta una reparación adicional y crea la cotización.
2. El auto pasa a `esperando_aprobacion`.
3. El cliente recibe (o ya tenía) un link por WhatsApp.
4. El cliente aprueba o rechaza desde el celular.
5. El mecánico ve el cambio por Supabase Realtime.

El problema aparece entre los pasos 3 y 4.

### 1.2 Problemas concretos

| # | Problema | Consecuencia |
|---|---|---|
| P1 | La cotización no se notifica específicamente: el cliente tiene un link genérico y puede no enterarse de que hay algo nuevo para decidir. | El auto queda detenido sin que nadie lo sepa. |
| P2 | No hay registro de si el cliente vio la cotización. | El dueño no sabe si esperar, llamar o seguir con otro trabajo. |
| P3 | No hay recordatorios ni vencimiento. | La cotización queda `pending` para siempre y el taller pierde el control. |
| P4 | El seguimiento se hace por teléfono, de memoria. | Interrupciones, reprocesos y discusiones sin prueba. |
| P5 | No hay evidencia de los recordatorios enviados. | Si hay una disputa, el taller solo puede mostrar la cotización, no que avisó. |

### 1.3 Costo del problema (hipótesis a medir)

| Indicador | Línea base hipotética | Fuente |
|---|---|---|
| Tiempo medio hasta la decisión del cliente | 4 horas | A medir en la semana 0 del piloto. |
| Cotizaciones resueltas dentro de 2 horas | 35% | A medir. |
| Autos detenidos más de 24 horas esperando aprobación | 3 por semana | A medir. |
| Llamadas o mensajes manuales por cotización | 1,8 | Entrevistas y registro manual. |

> **Nota:** las cifras anteriores son supuestos de trabajo, no datos relevados. La primera tarea del piloto es medirlas para establecer la línea base real.

---

## 2. Objetivo y propuesta de valor

### 2.1 Objetivo general

Reducir el tiempo entre el envío de una cotización y la decisión del cliente, eliminando el seguimiento manual y dejando trazabilidad completa de cada recordatorio.

### 2.2 Objetivos específicos

1. Que el cliente reciba un aviso claro cuando hay una cotización nueva.
2. Que el sistema insista de forma acotada y respetuosa si no hay respuesta.
3. Que el dueño vea en un solo lugar qué cotizaciones están sin ver, vistas sin respuesta o vencidas.
4. Que el mecánico sepa si el cliente ya vio la cotización antes de decidir si espera.
5. Que todo el seguimiento quede registrado para auditoría.

### 2.3 Valor por rol

| Rol | Valor |
|---|---|
| **Ramiro (dueño)** | Menos llamadas, visibilidad del cuello de botella y prueba de que el taller avisó. |
| **Lucas (mecánico)** | Sabe si el cliente vio la cotización y deja de preguntar o esperar a ciegas. |
| **Mariana (clienta)** | Recibe un recordatorio claro, con foto, precio y link directo; puede decidir sin llamar. |
| **Taller** | Menos autos detenidos, más rápido el ingreso y menos disputas. |

### 2.4 Lo que NO cambia

- El comprobante auditable de aprobación (timestamp, IP y hash SHA-256) se mantiene igual.
- Una cotización aprobada o rechazada sigue siendo inmutable.
- El cliente sigue sin necesitar contraseña.
- El mecánico sigue operando con botones grandes y un toque.

---

## 3. Alcance

### 3.1 Incluido en el MVP

- Registro de `sent_at`, `viewed_at`, `expires_at`, `resolved_at`, `reminder_count` y `last_reminder_at` en `quotes`.
- Tabla `quote_events` para la línea de tiempo auditable.
- Mensaje inicial al crear la cotización.
- Recordatorios automáticos a los 30 minutos, 2 horas y 12 horas.
- Horario de silencio: 21:00 a 08:00 (America/Argentina/Buenos_Aires).
- Vencimiento configurable: 4, 8, 12, 24 o 48 horas (default 24).
- Panel de seguimiento en Admin y Dashboard.
- Reenvío manual con límite de frecuencia.
- Reapertura de cotizaciones vencidas.
- Opt-out del cliente para no recibir más recordatorios.
- Pedido de reactivación por parte del cliente.
- Actualización en tiempo real de vistas, recordatorios y vencimientos.
- Modo degradado si el proveedor de WhatsApp no está disponible.

### 3.2 Fuera de alcance

- Chatbot o conversación bidireccional por WhatsApp.
- Notificaciones push o aplicación PWA.
- Cobros o pagos online.
- Negociación automática de precios.
- Firma digital con validez legal certificada.
- Multi-taller o multi-sucursal.
- Mensajes en idiomas distintos del español.
- Automatización del cambio de estado del auto al vencer una cotización.

### 3.3 Supuestos

- El taller ya usa WhatsApp como canal principal con el cliente.
- El cliente aceptó recibir mensajes sobre su vehículo al registrar el auto.
- Supabase Edge Functions y `pg_cron` están disponibles en el plan del proyecto.
- Existe una cuenta de WhatsApp Business API o un proveedor equivalente.
- El volumen del piloto permite medir con al menos 50 cotizaciones en 4 semanas.

---

## 4. Experiencia y flujo

### 4.1 Flujo principal (camino feliz)

```
Mecánico crea cotización
  → Se guarda con status = 'pending', sent_at = now(), expires_at = now() + vigencia
  → Se registra evento 'created'
  → Se envía mensaje inicial por WhatsApp con foto, costo y link
  → El auto pasa a 'esperando_aprobacion'

Cliente abre el link
  → Se registra viewed_at (una sola vez) y evento 'viewed'
  → Ve la cotización con contador de vencimiento
  → Aprueba o rechaza

Cliente decide
  → status = 'approved' o 'rejected'
  → resolved_at = now()
  → Se detienen los recordatorios
  → Se registra evento 'approved' o 'rejected'
  → El mecánico y el dueño ven el cambio en tiempo real
```

### 4.2 Flujo sin respuesta

| Momento | Acción | Condición |
|---|---|---|
| 0 min | Mensaje inicial | Siempre que se crea la cotización. |
| 30 min | Recordatorio 1 | `pending`, sin `viewed_at`, recordatorios activos. |
| 2 h | Recordatorio 2 | `pending`, aunque ya la haya visto. |
| 12 h | Recordatorio 3 (último) | `pending`. |
| 24 h | Vencimiento | `pending` y `expires_at` cumplido. |
| Después | Reenvío manual o reapertura | Decisión del dueño. |

**Reglas:**

- Máximo **3 recordatorios automáticos** por ciclo.
- Si el cliente responde, no se envía ningún recordatorio más.
- Si el cliente vio la cotización pero no respondió, se mantienen los recordatorios 2 y 3.
- Si el cliente pidió no recibir recordatorios, se detienen todos los automáticos.
- Si el mensaje falla, se reintenta una vez a los 10 minutos; si vuelve a fallar, se alerta al dueño y se ofrece el link para copiar.
- Los recordatorios automáticos respetan el horario de silencio. Si vencen entre las 21:00 y las 08:00, se envían a las 08:00.
- El vencimiento se registra a la hora exacta, pero no se envía un mensaje al cliente durante el horario de silencio.

### 4.3 Flujo de vencimiento y reapertura

```
Cotización pendiente llega a expires_at
  → status = 'expired'
  → expired_at = now()
  → Evento 'expired'
  → El auto NO cambia de estado automáticamente
  → El cliente ve "Cotización vencida" y no puede aprobar ni rechazar
  → El dueño ve la cotización como vencida con dos acciones:
       a) Reabrir: nuevo ciclo de 24 h, status = 'pending', recordatorios reiniciados
       b) Descartar: la cotización queda vencida y el auto sigue su curso
  → Si el cliente pide reactivación, se registra el pedido y se avisa al dueño
```

**Decisión de diseño:** el vencimiento no cambia el estado del auto porque el taller puede decidir continuar con el trabajo original, entregar el auto o reabrir la cotización. Automatizar esa decisión sería peligroso para el negocio.

### 4.4 Cambios de interfaz

#### Modo Mecánico — `QuoteModal`

- Selector **"Vigencia de la cotización"**: 4, 8, 12, 24 o 48 horas (default 24).
- Toggle **"Enviar recordatorios automáticos"** (default activado).
- Aviso: "El cliente recibirá un mensaje ahora y hasta 3 recordatorios si no responde."

#### Vista Cliente — `ClientView`

- Badge de estado: `Pendiente`, `Vista`, `Aprobada`, `Rechazada` o `Vencida`.
- Contador: "Vence en 23 h 40 min" (amber si queda menos de 2 h, rojo si venció).
- Texto: "Recibimos tu consulta. Podés aprobar o rechazar hasta el [fecha/hora]."
- Link discreto: **"No recibir más recordatorios"** con confirmación.
- Si está vencida: botón **"Pedir al taller que la reactive"**.
- Si ya fue respondida: se mantiene el comprobante auditable actual.

#### Administración — `AdminView`

- Nueva columna **"Seguimiento"** en la tabla global:
  - `Sin ver` (gris)
  - `Visto` (azul)
  - `Recordado 1/2/3` (ámbar)
  - `Vencida` (rojo)
- Filtros: `Todas`, `Sin ver +1 h`, `Vencidas`, `Vistas sin respuesta`.
- Acciones por cotización:
  - **Reenviar** (deshabilitado 10 minutos después del último envío; máximo 5 por día).
  - **Reabrir** (solo para vencidas).
  - **Copiar link** (fallback manual).
- Alerta cuando una cotización lleva más de 1 hora sin ver o más de 2 horas vista sin respuesta.

#### Dashboard

- Tarjeta **"Cotizaciones sin respuesta"**: cantidad y antigüedad de la más vieja.
- Métrica **"Tiempo medio de aprobación"**.
- Acceso directo al filtro de cotizaciones trabadas.

#### Modo Mecánico — tarjeta del auto

- Debajo de cada cotización:
  - "Sin ver por el cliente"
  - "Vista hace 12 min"
  - "Recordatorio 1 enviado"
  - "Vencida"
- El mecánico puede decidir si espera o continúa con otro trabajo.

---

## 5. Modelo de datos

### 5.1 Cambios en `quotes`

```sql
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS sent_at            timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS cycle_started_at   timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS viewed_at          timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at         timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  ADD COLUMN IF NOT EXISTS reminder_count     int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminder_at   timestamptz,
  ADD COLUMN IF NOT EXISTS reminders_enabled  boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS expired_at         timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_at        timestamptz;
```

**Estados válidos de `status`:**

```
pending → approved
pending → rejected
pending → expired
expired → pending   (solo por reapertura del dueño)
approved / rejected → inmutables
```

`viewed_at` **no es un estado**: una cotización puede estar vista y seguir pendiente. Se guarda como timestamp para no perder la posibilidad de aprobar o rechazar.

### 5.2 Tabla `quote_events`

```sql
CREATE TABLE IF NOT EXISTS quote_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id         uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  event_type       text NOT NULL,
  channel          text CHECK (channel IN ('whatsapp', 'manual', 'system')),
  reminder_number  int,
  dedupe_key       text UNIQUE,
  metadata         jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_events_quote
  ON quote_events (quote_id, created_at);

CREATE INDEX IF NOT EXISTS idx_quote_events_type
  ON quote_events (event_type, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE quote_events;
```

**Tipos de evento:**

| Evento | Cuándo se registra |
|---|---|
| `created` | Se crea la cotización. |
| `initial_message_sent` | Se envía el mensaje inicial. |
| `initial_message_failed` | Falla el mensaje inicial. |
| `viewed` | El cliente abre la cotización por primera vez. |
| `reminder_sent` | Se envía un recordatorio automático. |
| `reminder_failed` | Falla un recordatorio. |
| `manual_reminder_sent` | El dueño reenvía manualmente. |
| `approved` | El cliente aprueba. |
| `rejected` | El cliente rechaza. |
| `expired` | La cotización vence. |
| `reopened` | El dueño reabre una cotización vencida. |
| `reminders_disabled` | El cliente o el dueño desactivan los recordatorios. |
| `reminders_enabled` | Se reactivan los recordatorios. |
| `reactivation_requested` | El cliente pide que reabran la cotización. |

**Idempotencia:** `dedupe_key` evita duplicados. Ejemplos:

- `quote:{id}:reminder:1`
- `quote:{id}:reminder:2`
- `quote:{id}:viewed`
- `quote:{id}:expired`

### 5.3 Índices y consultas

```sql
CREATE INDEX IF NOT EXISTS idx_quotes_pending_expiry
  ON quotes (status, expires_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_quotes_pending_reminders
  ON quotes (reminders_enabled, cycle_started_at)
  WHERE status = 'pending';
```

### 5.4 RPCs necesarias

| RPC | Función |
|---|---|
| `mark_quote_viewed(p_quote_id uuid, p_token text)` | Valida que la cotización pertenezca al auto del token y registra `viewed_at` una sola vez. |
| `request_quote_reactivation(p_quote_id uuid, p_token text)` | Registra el pedido del cliente y avisa al dueño. |
| `reopen_quote(p_quote_id uuid)` | Reabre una cotización vencida, reinicia el ciclo y registra el evento. |
| `disable_quote_reminders(p_quote_id uuid, p_token text)` | Desactiva recordatorios por pedido del cliente. |
| `resend_quote(p_quote_id uuid)` | Reenvío manual con control de frecuencia y registro de evento. |

Las RPCs validan el token del auto y el estado de la cotización. No se confía en el cliente para decidir si una cotización puede aprobarse.

---

## 6. Reglas de negocio

| # | Regla |
|---|---|
| R1 | Una cotización vence por defecto a las 24 horas, configurable al crearla. |
| R2 | Solo se envían recordatorios si `status = 'pending'` y `reminders_enabled = true`. |
| R3 | Máximo 3 recordatorios automáticos por ciclo. |
| R4 | No se envían mensajes automáticos entre las 21:00 y las 08:00 (America/Argentina/Buenos_Aires). |
| R5 | Si el cliente responde, se cancelan los recordatorios pendientes. |
| R6 | Si el cliente pide no recibir recordatorios, se detienen los automáticos, pero puede seguir aprobando o rechazando. |
| R7 | El reenvío manual se permite cada 10 minutos y hasta 5 veces por día por cotización. |
| R8 | Una cotización vencida no puede aprobarse ni rechazarse; solo reabrirse. |
| R9 | La reapertura reinicia el ciclo de recordatorios y fija una nueva vigencia. |
| R10 | El vencimiento no cambia automáticamente el estado del auto. |
| R11 | Todo evento de seguimiento es append-only: no se edita ni se borra desde la interfaz. |
| R12 | Los mensajes incluyen solo los datos necesarios: nombre, modelo, patente, costo y link. |

---

## 7. Criterios de aceptación

> **Convención:** cada criterio debe poder verificarse con una prueba manual o automatizada. Los criterios `Must` son obligatorios para el MVP; los `Should` pueden pasar a la siguiente iteración.

### CA-1 — Creación con vigencia y recordatorios (Must)

**Dado** que estoy en Modo Mecánico y creo una cotización con descripción, costo, foto y vigencia de 24 horas,
**cuando** confirmo el envío,
**entonces** la cotización se guarda con `status = 'pending'`, `sent_at = now()`, `cycle_started_at = now()`, `expires_at = now() + 24 h` y `reminders_enabled = true`,
**y** el auto cambia a `esperando_aprobacion`,
**y** se registra un evento `created`,
**y** el cliente recibe un mensaje inicial por WhatsApp con el link, la foto, el costo y la fecha de vencimiento,
**y** si el proveedor de WhatsApp falla, la cotización igual se guarda y se registra `initial_message_failed`.

**Verificación:** crear una cotización en staging y comprobar los campos en Supabase y el evento en `quote_events`.

---

### CA-2 — Vista del cliente registrada una sola vez (Must)

**Dado** que existe una cotización pendiente,
**cuando** el cliente abre el link por primera vez,
**entonces** se registra `viewed_at` con la hora exacta y un evento `viewed`,
**y** el dueño y el mecánico ven el estado "Visto" en menos de 5 segundos, sin recargar la página,
**y** si el cliente vuelve a abrir el link, `viewed_at` no cambia y no se duplica el evento.

**Verificación:** abrir el link dos veces con el mismo token y comparar `viewed_at` y la cantidad de eventos.

---

### CA-3 — Primer recordatorio automático (Must)

**Dado** que una cotización lleva 30 minutos pendiente, sin `viewed_at`, con recordatorios activos y dentro del horario permitido,
**cuando** corre el job de seguimiento,
**entonces** se envía exactamente un recordatorio por WhatsApp,
**y** `reminder_count` pasa a 1, `last_reminder_at = now()` y se registra `reminder_sent` con `reminder_number = 1`,
**y** si el job vuelve a correr, no se envía un segundo mensaje para el mismo recordatorio.

**Verificación:** simular `cycle_started_at` 31 minutos atrás, ejecutar el job dos veces y comprobar un solo envío.

---

### CA-4 — Recordatorios 2 y 3, y cancelación al responder (Must)

**Dado** que una cotización sigue pendiente,
**cuando** pasan 2 horas desde el inicio del ciclo,
**entonces** se envía el recordatorio 2,
**y** cuando pasan 12 horas, se envía el recordatorio 3,
**y** después del tercero no se envían más recordatorios automáticos,
**y** si el cliente aprueba o rechaza en cualquier momento, no se envía ningún recordatorio posterior,
**y** los recordatorios 2 y 3 también se envían si el cliente vio la cotización pero no respondió.

**Verificación:** prueba con reloj simulado o actualizando `cycle_started_at`; verificar eventos 1, 2 y 3 y ausencia de envíos después de una respuesta.

---

### CA-5 — Panel de seguimiento y reenvío manual (Must)

**Dado** que el dueño abre Admin o Dashboard,
**cuando** hay cotizaciones pendientes,
**entonces** ve para cada una: estado de vista, tiempo desde el envío, cantidad de recordatorios y vencimiento,
**y** puede filtrar por "Sin ver +1 h", "Vistas sin respuesta" y "Vencidas",
**y** puede presionar "Reenviar" para enviar un recordatorio manual,
**y** el botón se deshabilita durante 10 minutos después de cada envío,
**y** se registra `manual_reminder_sent` con el actor y el canal,
**y** si el envío falla, se muestra un error accionable y la opción "Copiar link".

**Verificación:** crear una cotización, abrir el panel, reenviar dos veces seguidas y comprobar el bloqueo y los eventos.

---

### CA-6 — Vencimiento de la cotización (Must)

**Dado** que una cotización está pendiente,
**cuando** se cumple `expires_at`,
**entonces** su estado pasa a `expired`, se setea `expired_at` y se registra un evento `expired`,
**y** el cliente ve "Cotización vencida" y no puede aprobar ni rechazar,
**y** el dueño ve la cotización como vencida con las acciones "Reabrir" y "Descartar",
**y** el estado del auto no cambia automáticamente,
**y** una cotización aprobada o rechazada nunca pasa a vencida,
**y** un intento de aprobar una cotización vencida por API o por link directo es rechazado por el servidor.

**Verificación:** forzar `expires_at` en el pasado, abrir el link del cliente e intentar aprobar; debe fallar y quedar registrado.

---

### CA-7 — Reapertura de una cotización vencida (Must)

**Dado** que una cotización está vencida,
**cuando** el dueño presiona "Reabrir",
**entonces** vuelve a `status = 'pending'`, `expired_at = null`, `cycle_started_at = now()`, `reminder_count = 0`, `last_reminder_at = null` y una nueva `expires_at` (default 24 h),
**y** se registra un evento `reopened` con la fecha anterior y la nueva,
**y** el cliente recibe un nuevo mensaje con el link,
**y** los eventos anteriores se conservan sin modificaciones.

**Verificación:** vencer una cotización, reabrirla y comprobar el nuevo ciclo, el evento y la conservación del historial.

---

### CA-8 — Opt-out y reactivación pedida por el cliente (Should)

**Dado** que el cliente abre una cotización pendiente,
**cuando** presiona "No recibir más recordatorios" y confirma,
**entonces** `reminders_enabled = false` y se registra `reminders_disabled`,
**y** no se envían más recordatorios automáticos,
**y** la cotización sigue pudiendo aprobarse o rechazarse,
**y** si está vencida, el cliente puede presionar "Pedir al taller que la reactive", lo que registra `reactivation_requested` y avisa al dueño.

**Verificación:** desactivar recordatorios, simular el job y comprobar que no envía; luego probar el pedido de reactivación.

---

### CA-9 — Modo degradado sin proveedor de WhatsApp (Must)

**Dado** que el proveedor de WhatsApp no está configurado o devuelve error,
**cuando** se crea una cotización o se ejecuta un recordatorio,
**entonces** la cotización se guarda igual y el flujo de aprobación sigue funcionando,
**y** se registra `initial_message_failed` o `reminder_failed` con el error,
**y** el dueño ve una alerta con la opción "Copiar link" para enviarlo manualmente,
**y** se reintenta una vez a los 10 minutos,
**y** después de 3 fallas consecutivas se desactivan los recordatorios de esa cotización y se avisa al dueño,
**y** no se generan mensajes duplicados.

**Verificación:** desactivar las credenciales del proveedor en staging, crear una cotización y comprobar el flujo manual y los eventos.

---

### CA-10 — Auditoría y trazabilidad (Must)

**Dado** que una cotización tuvo actividad,
**cuando** el dueño abre su detalle,
**entonces** ve una línea de tiempo con: creación, mensaje inicial, vista, recordatorios (número, canal y hora), reenvíos manuales, aprobación o rechazo, vencimiento y reapertura,
**y** los eventos son append-only: no se pueden editar ni eliminar desde la interfaz,
**y** el comprobante de aprobación existente se mantiene visible e inalterado.

**Verificación:** recorrer el ciclo completo y comparar la línea de tiempo con los registros de `quote_events`.

---

### CA-11 — Consistencia en tiempo real (Must)

**Dado** que el dueño o el mecánico tienen la app abierta,
**cuando** el cliente ve, aprueba o rechaza una cotización, o cuando se registra un recordatorio o vencimiento,
**entonces** la interfaz se actualiza en menos de 5 segundos sin recargar,
**y** si Realtime falla, un refresh manual muestra el estado correcto,
**y** no se generan estados duplicados ni parpadeos inconsistentes.

**Verificación:** abrir dos dispositivos, ejecutar cada evento y medir el tiempo de actualización.

---

### CA-12 — Seguridad y privacidad (Must)

**Dado** que un usuario abre un link con un token inválido o ajeno,
**cuando** intenta ver o modificar una cotización,
**entonces** el servidor rechaza la operación,
**y** las RPCs validan que la cotización pertenezca al auto del token,
**y** los mensajes de WhatsApp incluyen solo nombre, modelo, patente, costo y link,
**y** el reenvío manual y la marcación de vista tienen límite de frecuencia,
**y** no se registran datos sensibles innecesarios en `metadata`.

**Verificación:** probar tokens inválidos, cotizaciones de otro auto y llamadas repetidas a las RPCs.

---

### CA-13 — No regresión del flujo actual (Must)

**Dado** que la feature está activa,
**cuando** se ejecuta el flujo existente de aprobación,
**entonces** se siguen cumpliendo los criterios CA-1 a CA-5 de la spec `aprobacion-cotizaciones.md`,
**y** el comprobante SHA-256 se genera y persiste igual,
**y** una cotización aprobada o rechazada no puede modificarse.

**Verificación:** ejecutar la suite de regresión de la spec base.

---

### Matriz de prioridad y prueba

| CA | Prioridad | Tipo de prueba | Fase |
|---|---|---|---|
| CA-1 | Must | Integración | 1 |
| CA-2 | Must | Integración + E2E | 1 |
| CA-3 | Must | Integración con reloj simulado | 2 |
| CA-4 | Must | Integración con reloj simulado | 2 |
| CA-5 | Must | E2E | 1 |
| CA-6 | Must | Integración + E2E | 1 |
| CA-7 | Must | E2E | 1 |
| CA-8 | Should | E2E | 1 |
| CA-9 | Must | Integración + manual | 2 |
| CA-10 | Must | E2E | 1 |
| CA-11 | Must | E2E multi-dispositivo | 1 |
| CA-12 | Must | Seguridad | 1 |
| CA-13 | Must | Regresión | 3 |

---

## 8. Métricas de éxito

### 8.1 North Star Metric

**Tasa de cotizaciones resueltas dentro de 2 horas**

> `cotizaciones con resolved_at - sent_at <= 2 h / cotizaciones enviadas`

Incluye aprobadas y rechazadas. No incluye cotizaciones todavía pendientes al momento de la medición.

**Por qué esta métrica:** mide lo que realmente importa —que el cliente decida rápido— y no solo que se hayan enviado mensajes. Un aumento de recordatorios sin mejora en la decisión sería un fracaso.

### 8.2 Métricas primarias

| # | Métrica | Definición | Línea base (hipótesis) | Objetivo a 4 semanas | Fuente |
|---|---|---|---|---|---|
| M1 | Tiempo medio hasta la decisión | Mediana de `resolved_at - sent_at` en minutos. | 4 h | ≤ 45 min | `quotes` |
| M2 | % resueltas dentro de 2 h | North Star. | 35% | ≥ 70% | `quotes` |
| M3 | % vistas dentro de 15 min | `viewed_at - sent_at <= 15 min` sobre cotizaciones enviadas. | 20% | ≥ 60% | `quotes` |
| M4 | Autos detenidos > 24 h | Cotizaciones pendientes o vencidas con más de 24 h desde `sent_at`, por semana. | 3 / semana | ≤ 1 / semana | `quotes` + `cars` |
| M5 | Respuesta después de un recordatorio | Decisiones dentro de 2 h después de un recordatorio / recordatorios enviados. | Sin dato | ≥ 25% | `quote_events` |
| M6 | Seguimientos manuales por cotización | Reenvíos manuales + llamadas registradas / cotizaciones. | 1,8 | ≤ 0,5 | `quote_events` + entrevistas |

### 8.3 Métricas secundarias y de negocio

| # | Métrica | Definición | Objetivo | Fuente |
|---|---|---|---|---|
| M7 | Tasa de respuesta | `(approved + rejected) / enviadas`. | ≥ 85% | `quotes` |
| M8 | Tasa de aprobación sobre respondidas | `approved / (approved + rejected)`. | No bajar; +10% ideal | `quotes` |
| M9 | Ingreso adicional capturado | Suma de cotizaciones aprobadas por mes. | +15% vs. línea base | `quotes` |
| M10 | Horas ahorradas por semana | Tiempo de seguimiento manual evitado (time diary). | ≥ 3 h / semana | Entrevistas |
| M11 | Disputas por reparaciones adicionales | Reclamos formales por mes. | 0 | Registro del taller |
| M12 | Cotizaciones reabiertas | % de vencidas que se reabren y se resuelven. | ≥ 50% | `quote_events` |

### 8.4 Guardrails (no degradar)

| Guardrail | Umbral | Acción si se incumple |
|---|---|---|
| Tasa de fallas de envío de WhatsApp | < 2% | Revisar proveedor, templates y números; activar fallback manual. |
| Tasa de opt-out | < 1% | Revisar frecuencia, tono y horarios; reducir recordatorios. |
| Recordatorios duplicados | < 0,1% | Revisar idempotencia y locking del job. |
| Quejas de clientes por mensajes | < 0,5% | Pausar automáticos y revisar consentimiento. |
| Costo de mensajería | ≤ USD 5 por taller/mes | Ajustar cantidad de recordatorios o proveedor. |
| Tasa de aprobación | No caer más de 5 puntos | Revisar fricción del flujo y calidad de las cotizaciones. |
| Disputas | No aumentar | Revisar registro de eventos y claridad de los mensajes. |
| Latencia de actualización Realtime | p95 < 5 s | Revisar canales y suscripciones. |

### 8.5 Instrumentación

**Eventos a registrar en `quote_events`:**

- `created`, `initial_message_sent`, `initial_message_failed`
- `viewed`
- `reminder_sent`, `reminder_failed`, `manual_reminder_sent`
- `approved`, `rejected`
- `expired`, `reopened`
- `reminders_disabled`, `reminders_enabled`
- `reactivation_requested`

**Dimensiones mínimas:**

- `quote_id`, `car_id`, `event_type`
- `channel` (`whatsapp`, `manual`, `system`)
- `reminder_number`
- `created_at` en UTC
- `metadata`: template, proveedor, error, actor, `previous_expires_at`, `new_expires_at`

**Consultas de ejemplo:**

```sql
-- Tiempo medio hasta la decisión (últimos 28 días)
SELECT
  percentile_cont(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (resolved_at - sent_at)) / 60
  ) AS mediana_minutos,
  percentile_cont(0.9) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (resolved_at - sent_at)) / 60
  ) AS p90_minutos
FROM quotes
WHERE resolved_at IS NOT NULL
  AND sent_at >= now() - interval '28 days';

-- North Star: % resueltas dentro de 2 horas
SELECT
  count(*) FILTER (
    WHERE resolved_at IS NOT NULL
      AND resolved_at - sent_at <= interval '2 hours'
  )::numeric
  / nullif(count(*) FILTER (WHERE resolved_at IS NOT NULL), 0) AS tasa_2h
FROM quotes
WHERE sent_at >= now() - interval '28 days';

-- Efectividad de recordatorios
SELECT
  (metadata->>'reminder_number') AS recordatorio,
  count(*) AS enviados,
  count(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_events.quote_id
        AND q.resolved_at BETWEEN quote_events.created_at
                              AND quote_events.created_at + interval '2 hours'
    )
  ) AS respuestas_2h
FROM quote_events
WHERE event_type = 'reminder_sent'
GROUP BY 1
ORDER BY 1;
```

### 8.6 Plan de medición

1. **Semana 0 — Línea base:** medir 2 semanas del flujo actual en los talleres piloto. Registrar tiempos, llamadas y decisiones.
2. **Semanas 1-2 — Implementación:** migraciones, panel, vencimiento y reenvío manual. Medir adopción interna.
3. **Semanas 3-4 — Automatización:** activar WhatsApp y recordatorios. Medir M1-M6 y guardrails.
4. **Semana 5 — Análisis:** comparar contra la línea base y decidir.
5. **Semana 6 — Decisión:** escalar, iterar o detener.

**Criterio de éxito del piloto:**

- Al menos **3 de las 6 métricas primarias** alcanzan el objetivo.
- Ningún guardrail se incumple de forma sostenida.
- Al menos **2 talleres** siguen usando la feature después de 4 semanas.
- Al menos **1 taller** acepta pagar por el plan con la feature incluida.

**Diseño de medición:** pre/post con línea base de 2 semanas y, si es posible, un taller de control con el flujo actual para separar el efecto de la estacionalidad.

---

## 9. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El proveedor de WhatsApp tarda en aprobar los templates. | Retrasa la fase 2. | Empezar con el flujo manual (fase 1) y usar templates de utilidad simples. |
| Los clientes perciben los recordatorios como spam. | Opt-out y daño de marca. | Máximo 3, horario de silencio, tono útil, opt-out visible. |
| Números de teléfono mal cargados. | Mensajes perdidos. | Validar formato al registrar el auto y ofrecer "Copiar link". |
| Errores de zona horaria o horario de silencio. | Mensajes a horas inadecuadas. | Guardar en UTC, convertir a America/Argentina/Buenos_Aires, tests de borde. |
| Recordatorios duplicados por concurrencia del job. | Mala experiencia y costo. | `dedupe_key`, `FOR UPDATE SKIP LOCKED`, job cada 5 minutos. |
| El vencimiento hace perder ventas. | Menos ingresos. | Default 24 h, reapertura fácil, aviso al dueño, no cambiar el auto automáticamente. |
| Dependencia de un proveedor externo. | Feature frágil. | Modo degradado con reenvío manual y alertas. |
| Falta de consentimiento para mensajes. | Riesgo legal y de confianza. | Checkbox de consentimiento al registrar el auto; opt-out; revisión legal. |
| El dueño no usa el panel. | No se captura el valor. | Alertas en el dashboard, filtros simples y onboarding de 10 minutos. |
| Métricas mal definidas o datos sucios. | Decisiones equivocadas. | Instrumentación desde el día 1; validar eventos en staging; deduplicar. |

---

## 10. Dependencias técnicas

| Dependencia | Uso | Estado |
|---|---|---|
| Supabase PostgreSQL | Nuevos campos, `quote_events`, RPCs. | Disponible. |
| Supabase Realtime | Vista, recordatorios y vencimientos en vivo. | Disponible. |
| Supabase Edge Functions | Envío de mensajes y job de seguimiento. | A configurar. |
| `pg_cron` o scheduler externo | Ejecutar el job cada 5 minutos. | A configurar. |
| WhatsApp Business API / proveedor | Mensajes iniciales y recordatorios. | A contratar. |
| Templates aprobados | Mensajes de utilidad. | A aprobar. |
| Variables de entorno | Credenciales del proveedor. | A configurar en secrets. |

### Variables de entorno nuevas

```env
WHATSAPP_PROVIDER=meta
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_TEMPLATE_INITIAL=cotizacion_pendiente
WHATSAPP_TEMPLATE_REMINDER=recordatorio_cotizacion
WHATSAPP_TEMPLATE_EXPIRED=cotizacion_vencida
FOLLOWUP_TIMEZONE=America/Argentina/Buenos_Aires
FOLLOWUP_QUIET_START=21
FOLLOWUP_QUIET_END=8
```

> Las credenciales van en Supabase Secrets, nunca en el frontend ni en el repositorio.

---

## 11. Plan de implementación

| Fase | Alcance | Entregable | Duración estimada |
|---|---|---|---|
| **Fase 0 — Datos y auditoría** | Campos nuevos, `quote_events`, `viewed_at`, RPC de vista. | Migración SQL + eventos + tests. | 2-3 días |
| **Fase 1 — Control sin proveedor** | Panel de seguimiento, vencimiento, reapertura, opt-out, reenvío manual. | Admin/Dashboard/Cliente actualizados. | 4-5 días |
| **Fase 2 — Automatización** | Edge Function, scheduler, templates, reintentos, modo degradado. | Recordatorios automáticos. | 4-5 días |
| **Fase 3 — Piloto** | 2 talleres, 4 semanas, línea base y métricas. | Reporte de piloto. | 4 semanas |
| **Fase 4 — Decisión** | Escalar, iterar o detener. | Documento de decisión. | 1 semana |

**Estrategia de entrega:** la fase 1 ya genera valor sin depender de WhatsApp. Si el proveedor se demora, el taller igual puede ver vencimientos, reenviar manualmente y auditar.

---

## 12. Definition of Done

- [ ] Migración SQL aplicada en staging y producción.
- [ ] `quote_events` recibe eventos sin duplicados.
- [ ] Todos los CA `Must` pasan en staging.
- [ ] Suite de regresión de la spec base pasa.
- [ ] Edge Function desplegada con secrets y monitoreo.
- [ ] Templates de WhatsApp aprobados.
- [ ] Panel de seguimiento visible en Admin y Dashboard.
- [ ] Vista Cliente muestra vencimiento, estado de vista y opt-out.
- [ ] Modo degradado probado sin proveedor.
- [ ] Runbook de fallas y reintentos documentado.
- [ ] README y `.kiro/steering/proyecto.md` actualizados.
- [ ] Reporte de piloto con métricas y decisión.

---

## 13. Preguntas abiertas

1. ¿Proveedor de WhatsApp: Meta Cloud API directo o un intermediario como Twilio?
2. ¿Quién absorbe el costo de los mensajes: el taller o la plataforma?
3. ¿La reapertura debe ser automática a pedido del cliente o siempre requiere aprobación del dueño?
4. ¿Se permite más de un ciclo de recordatorios por cotización reabierta?
5. ¿Qué retención legal se necesita para `quote_events` y los comprobantes?
6. ¿Se agrega autenticación para la vista Admin antes de producción?
7. ¿La feature se vende como add-on o incluida en el plan base?

---

## Anexo A — Plantillas de mensajes

### A.1 Mensaje inicial

```
Hola {{cliente}}, en Taller Don Ramiro encontramos una reparación adicional en tu {{modelo}} ({{patente}}).

Costo: ${{costo}}.
Mirá la foto y aprobá o rechazá acá:
{{link}}

La cotización vence el {{fecha}} a las {{hora}}.
```

### A.2 Recordatorio

```
Hola {{cliente}}, seguimos esperando tu decisión sobre la reparación adicional de tu {{modelo}}.

Costo: ${{costo}}.
Aprobá o rechazá acá:
{{link}}
```

### A.3 Vencimiento

```
Hola {{cliente}}, la cotización de tu {{modelo}} venció.

Si querés que la revisemos de nuevo, pedí la reactivación desde el link o escribinos al taller.
{{link}}
```

> Los templates deben estar aprobados por el proveedor y respetar las políticas de WhatsApp Business. No se envían mensajes promocionales: son mensajes de utilidad sobre un servicio en curso.

---

## Anexo B — Casos de prueba mínimos

| # | Caso | Resultado esperado |
|---|---|---|
| T1 | Crear cotización con vigencia 24 h. | Campos y evento `created` correctos. |
| T2 | Abrir link dos veces. | `viewed_at` único y un solo evento. |
| T3 | Job a los 30 min, dos ejecuciones. | Un solo `reminder_sent` con `reminder_number = 1`. |
| T4 | Job a las 2 h y 12 h. | Recordatorios 2 y 3, sin un cuarto. |
| T5 | Aprobar después del recordatorio 1. | No se envían 2 ni 3; `resolved_at` seteado. |
| T6 | Forzar vencimiento e intentar aprobar. | Rechazo del servidor; estado `expired`. |
| T7 | Reabrir cotización vencida. | Nuevo ciclo, evento `reopened`, historial intacto. |
| T8 | Desactivar recordatorios. | Job no envía; la cotización sigue aprobable. |
| T9 | Proveedor caído. | Evento de falla, alerta y link copiable; sin duplicados. |
| T10 | Link con token ajeno. | Acceso denegado. |
| T11 | Reenvío manual dos veces seguidas. | Segundo bloqueado por 10 minutos. |
| T12 | Realtime en dos dispositivos. | Actualización en menos de 5 segundos. |

---

## Anexo C — Glosario

| Término | Definición |
|---|---|
| **Ciclo de recordatorios** | Período que empieza al crear o reabrir una cotización y termina cuando el cliente responde o la cotización vence. |
| **Recordatorio** | Mensaje automático o manual que invita al cliente a decidir. |
| **Opt-out** | Pedido del cliente de no recibir más recordatorios. |
| **Reapertura** | Acción del dueño que devuelve una cotización vencida a estado pendiente con un nuevo ciclo. |
| **North Star Metric** | Métrica principal que expresa el valor central de la feature. |
| **Guardrail** | Métrica que no debe degradarse aunque mejore la métrica principal. |
| **Modo degradado** | Funcionamiento de la feature sin el proveedor de WhatsApp, usando reenvío manual y alertas. |
