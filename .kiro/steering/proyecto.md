# Taller Don Ramiro — Contexto del Proyecto

## Descripción
Aplicación web móvil para la gestión operativa de un taller mecánico. Resuelve tres problemas concretos: mecánicos que trabajan con las manos ocupadas, clientes que llaman constantemente para preguntar el estado de su auto, y disputas por reparaciones adicionales que no fueron aprobadas formalmente.

## Stack tecnológico
- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **Base de datos / Backend:** Supabase (PostgreSQL + Realtime + Row Level Security)
- **Íconos:** FontAwesome 6 (via CDN en index.css)
- **Fuentes:** Inter (principal), Rajdhani (logo)
- **Estado global:** React Context + custom hook `useTaller`

## Estructura del proyecto
```
taller-don-ramiro-react/
├── src/
│   ├── store/
│   │   ├── supabase.js          ← cliente Supabase
│   │   ├── useTaller.js         ← toda la lógica de estado y llamadas a Supabase
│   │   └── TallerContext.jsx    ← React Context provider
│   ├── components/
│   │   ├── Header.jsx           ← nav con tabs
│   │   └── Toast.jsx            ← notificaciones
│   ├── views/
│   │   ├── Dashboard.jsx        ← home con métricas
│   │   ├── MechanicView.jsx     ← modo manos sucias
│   │   ├── AdminView.jsx        ← gestión de autos y mecánicos
│   │   └── ClientView.jsx       ← seguimiento y aprobación
│   ├── utils/helpers.js
│   ├── App.jsx
│   └── index.css
```

## Base de datos (Supabase)
### Tabla `cars`
| campo       | tipo      | descripción                          |
|-------------|-----------|--------------------------------------|
| id          | uuid      | PK generado automáticamente          |
| client      | text      | nombre del cliente                   |
| phone       | text      | WhatsApp del cliente                 |
| model       | text      | modelo del vehículo                  |
| plate       | text      | patente/placa (única)                |
| mechanic    | text      | nombre del mecánico asignado         |
| status      | text      | estado actual (ver valores abajo)    |
| description | text      | falla o trabajo inicial              |
| token       | text      | token único para el link del cliente |
| created_at  | timestamptz | fecha de ingreso                   |

### Tabla `quotes`
| campo      | tipo    | descripción                              |
|------------|---------|------------------------------------------|
| id         | uuid    | PK                                       |
| car_id     | uuid    | FK → cars.id                             |
| problem    | text    | descripción de la reparación adicional   |
| cost       | numeric | costo estimado                           |
| photo_url  | text    | URL de la foto de evidencia              |
| status     | text    | 'pending' / 'approved' / 'rejected'      |
| receipt    | jsonb   | comprobante de aprobación (timestamp, hash, ip) |
| created_at | timestamptz |                                      |

## Estados del vehículo (en orden)
1. `recibido`
2. `diagnostico`
3. `esperando_aprobacion`
4. `en_reparacion`
5. `listo`

## Roles de usuario
- **Mecánico:** accede desde celular, opera con botones grandes, cambia estados y agrega cotizaciones
- **Administrador (Don Ramiro):** registra autos, gestiona mecánicos, envía links por WhatsApp
- **Cliente:** recibe un link único (sin contraseña), ve el estado de su auto y aprueba/rechaza cotizaciones

## Specs y documentación
- **SPEC-001 — Aprobación de cotizaciones:** `.kiro/specs/aprobacion-cotizaciones.md` (feature implementado, CA-1 a CA-5).
- **SPEC-002 — Seguimiento y recordatorio automático de cotizaciones:** `.kiro/specs/seguimiento-cotizaciones.md` (propuesta). Agrega `viewed_at`, vencimiento (`expires_at`), recordatorios por WhatsApp (30 min, 2 h, 12 h), tabla `quote_events`, panel de seguimiento, reenvío manual, reapertura y modo degradado sin proveedor. Incluye CA-1 a CA-13 y métricas de éxito.
- **Paso 1 — ICP y User Persona:** `docs/paso-1-icp-user-persona.md` y `docs/Paso-1-ICP-User-Persona.docx`.
- **Paso 2 — SPEC en Word/PDF:** `docs/Paso-2-SPEC-Seguimiento-Cotizaciones.docx` y `.pdf`.

### Cambios de datos propuestos por SPEC-002
La tabla `quotes` suma `sent_at`, `cycle_started_at`, `viewed_at`, `expires_at`, `reminder_count`, `last_reminder_at`, `reminders_enabled`, `expired_at` y `resolved_at`; el estado `expired` se agrega a los valores válidos. Se agrega `quote_events` (append-only) para auditar creación, vista, recordatorios, aprobación/rechazo, vencimiento y reapertura.

## Convenciones de código
- Componentes en PascalCase, archivos `.jsx`
- Hooks y utilidades en camelCase, archivos `.js`
- Tailwind clases directamente en JSX, sin CSS modules
- Llamadas a Supabase siempre en `useTaller.js`, nunca en componentes
- Updates optimistas: actualizar estado local primero, luego persistir en Supabase
- Todas las acciones del store retornan `null` en caso de error y setean `error` state

## Estilo visual
- Tema oscuro por defecto, con toggle a modo claro
- Acento principal: `amber-500` (#f59e0b)
- Fondo oscuro: `slate-950` / `slate-900`
- Tarjetas: `bg-white dark:bg-slate-900` con `border-slate-200 dark:border-slate-800`
- Bordes redondeados grandes: `rounded-3xl` para cards, `rounded-2xl` para botones
- Tipografía: Inter 800/900 para títulos, 600/700 para labels
- Íconos FontAwesome con clases `fa-solid fa-[nombre]`
