# 🔧 Taller Don Ramiro

> Plataforma web móvil para la gestión operativa de un taller mecánico. Diseñada para mecánicos con las manos sucias, clientes que quieren saber el estado de su auto y un administrador que necesita control total sin papeles.

---

## 📋 Tabla de contenidos

- [El problema que resuelve](#el-problema-que-resuelve)
- [Demo](#demo)
- [Funcionalidades](#funcionalidades)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Base de datos](#base-de-datos)
- [Instalación y configuración](#instalación-y-configuración)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Roles de usuario](#roles-de-usuario)
- [Spec principal](#spec-principal)
- [Scripts disponibles](#scripts-disponibles)

---

## El problema que resuelve

El **Taller Don Ramiro** tiene 4 mecánicos que trabajan todo el día con las manos ocupadas. Tres problemas operativos frenan el trabajo cada día:

1. **Interrupciones constantes** — Los clientes llaman por teléfono para preguntar el estado de su auto. Cada llamada para al mecánico.
2. **Demoras por aprobaciones** — Cuando surge una reparación adicional, el trabajo se detiene hasta obtener autorización del cliente por teléfono. A veces tarda días.
3. **Disputas sin prueba** — El cliente puede negar haber aprobado una reparación. Sin registro, el taller no tiene cómo defenderse.

Esta app resuelve los tres problemas con tres módulos conectados en tiempo real.

---

## Demo

| Módulo | Descripción |
|--------|-------------|
| 🏠 Dashboard | Métricas en vivo del taller |
| 🔩 Mecánico | Interfaz táctil para operar con las manos sucias |
| 📋 Admin | Control global, registro de autos y mecánicos |
| 📱 Cliente | Seguimiento sin contraseña + aprobación auditable |

---

## Funcionalidades

### Dashboard
- Banner de estado del taller en tiempo real
- 4 métricas en vivo: vehículos activos, cotizaciones pendientes, listos para entrega, eficiencia del día
- Acceso directo a los 3 módulos operativos

### Modo Mecánico — "Manos Sucias"
- Grilla de tarjetas por mecánico con conteo de autos activos
- Al seleccionar un mecánico: lista de todos sus autos asignados
- **Cambio de estado con 1 toque** — 5 estados: Recibido → Diagnóstico → Esperando Aprobación → En Reparación → Listo
- **Agregar reparación adicional** — modal con descripción, costo y foto de evidencia (cámara del celular o presets)
- Al enviar cotización: estado del auto cambia automáticamente a "Esperando Aprobación"
- Actualización en tiempo real cuando el cliente aprueba o rechaza

### Administración (Don Ramiro)
- **Registro express de vehículos** — nombre del cliente, WhatsApp, modelo, patente, mecánico asignado
- **Gestión de mecánicos** — agregar y eliminar mecánicos (con validación: no se puede eliminar un mecánico con autos activos)
- **Tabla global** de vehículos con estado, mecánico asignado y cotizaciones
- **Botón WhatsApp** — genera y abre un mensaje con el link de seguimiento del cliente

### Vista Cliente — Sin contraseña
- Acceso mediante link único enviado por WhatsApp
- Barra de progreso visual con porcentaje
- Timeline de 5 pasos con estado actual resaltado
- **Cotizaciones pendientes** — foto de evidencia, descripción del problema y costo adicional
- **Aprobar / Rechazar** con botones grandes y táctiles
- **Comprobante auditable** al aprobar: timestamp exacto, ISO date, IP y hash SHA-256
- Registro permanente visible en pantalla

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS v4 |
| Base de datos | Supabase (PostgreSQL) |
| Tiempo real | Supabase Realtime |
| Íconos | FontAwesome 6 |
| Fuentes | Inter + Rajdhani (Google Fonts) |
| Hash criptográfico | Web Crypto API — `crypto.subtle.digest('SHA-256')` |

---

## Arquitectura

```
Browser (React SPA)
  │
  ├── TallerContext (React Context)
  │     └── useTaller (custom hook)
  │           ├── Estado: cars, quotes, mechanics
  │           ├── Supabase Client (CRUD)
  │           └── Supabase Realtime (WebSocket)
  │
  ├── Views
  │     ├── Dashboard
  │     ├── MechanicView
  │     ├── AdminView
  │     └── ClientView
  │
  └── Components
        ├── Header (nav + theme toggle)
        └── Toast (notificaciones)
```

### Flujo de aprobación de cotizaciones

```
Mecánico detecta problema
  → Abre modal → completa descripción + costo + foto
  → addQuote() → INSERT en Supabase (status: 'pending')
  → setCarStatus() → UPDATE car (status: 'esperando_aprobacion')

Cliente abre su link único
  → Ve cotización pendiente con foto y costo
  → Presiona "Aprobar"
    → SHA-256(quoteId + timestamp + userAgent + UUID)
    → approveQuote() → UPDATE quote (status: 'approved', receipt: {...})
    → Comprobante visible inmediatamente (update optimista)

Mecánico (en otro celular, misma red o no)
  → Supabase Realtime emite evento UPDATE
  → React state se actualiza
  → Pantalla cambia sin recargar ⚡
```

---

## Base de datos

### Tabla `cars`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | PK — generado automáticamente |
| `client` | text | Nombre del cliente |
| `phone` | text | WhatsApp (con código de país) |
| `model` | text | Modelo del vehículo |
| `plate` | text | Patente/placa — única |
| `mechanic` | text | Nombre del mecánico asignado |
| `status` | text | Estado actual del vehículo |
| `description` | text | Falla o trabajo inicial |
| `token` | text | Token único para el link del cliente |
| `created_at` | timestamptz | Fecha de ingreso |

**Estados válidos para `status`:**
```
recibido → diagnostico → esperando_aprobacion → en_reparacion → listo
```

### Tabla `quotes`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | PK |
| `car_id` | uuid | FK → cars.id (cascade delete) |
| `problem` | text | Descripción de la reparación adicional |
| `cost` | numeric | Costo estimado |
| `photo_url` | text | URL de la foto de evidencia |
| `status` | text | `pending` / `approved` / `rejected` |
| `receipt` | jsonb | Comprobante de aprobación |
| `created_at` | timestamptz | Fecha de creación |

**Estructura del `receipt`:**
```json
{
  "timestamp": "29/10/2026 19:53:00",
  "isoDate": "2026-10-29T22:53:00.000Z",
  "ip": "192.168.x.x",
  "hash": "a3f9c2b1d4e5f6..."
}
```

### SQL de configuración inicial

```sql
-- Tabla de vehículos
CREATE TABLE cars (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client      text NOT NULL,
  phone       text NOT NULL,
  model       text NOT NULL,
  plate       text NOT NULL UNIQUE,
  mechanic    text NOT NULL,
  status      text NOT NULL DEFAULT 'recibido',
  description text,
  token       text NOT NULL UNIQUE,
  created_at  timestamptz DEFAULT now()
);

-- Tabla de cotizaciones
CREATE TABLE quotes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id      uuid REFERENCES cars(id) ON DELETE CASCADE,
  problem     text NOT NULL,
  cost        numeric NOT NULL,
  photo_url   text,
  status      text NOT NULL DEFAULT 'pending',
  receipt     jsonb,
  created_at  timestamptz DEFAULT now()
);

-- Tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE cars;
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;

-- Row Level Security (acceso público para la vista cliente sin login)
ALTER TABLE cars   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read cars"    ON cars   FOR SELECT USING (true);
CREATE POLICY "public write cars"   ON cars   FOR ALL    USING (true);
CREATE POLICY "public read quotes"  ON quotes FOR SELECT USING (true);
CREATE POLICY "public write quotes" ON quotes FOR ALL    USING (true);
```

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/LeoDataEngineer/taller-don-ramiro.git
cd taller-don-ramiro
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editá el archivo `.env` con tus credenciales de Supabase (ver sección siguiente).

### 4. Crear las tablas en Supabase

Copiá el SQL de la sección [Base de datos](#base-de-datos) y ejecutalo en el **SQL Editor** de tu proyecto de Supabase.

### 5. Levantar el servidor de desarrollo

```bash
npm run dev
```

Abrí **http://localhost:5173** en el browser.

---

## Variables de entorno

Creá un archivo `.env` en la raíz del proyecto con las siguientes variables. Las encontrás en tu proyecto de Supabase en **Settings → API**.

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu_anon_key
```

> ⚠️ **Nunca subas el archivo `.env` a Git.** Ya está incluido en `.gitignore`.

---

## Estructura del proyecto

```
taller-don-ramiro/
├── .kiro/
│   ├── steering/
│   │   └── proyecto.md          ← Contexto persistente para el agente IA
│   ├── skills/
│   │   └── brand-design.md      ← Guía de diseño de marca
│   └── specs/
│       └── aprobacion-cotizaciones.md  ← Spec del feature principal
├── src/
│   ├── store/
│   │   ├── supabase.js          ← Cliente Supabase
│   │   ├── useTaller.js         ← Lógica de estado + llamadas a Supabase
│   │   └── TallerContext.jsx    ← React Context provider
│   ├── components/
│   │   ├── Header.jsx           ← Nav con tabs y toggle de tema
│   │   └── Toast.jsx            ← Notificaciones
│   ├── views/
│   │   ├── Dashboard.jsx        ← Home con métricas en vivo
│   │   ├── MechanicView.jsx     ← Modo manos sucias
│   │   ├── AdminView.jsx        ← Gestión de autos y mecánicos
│   │   └── ClientView.jsx       ← Seguimiento y aprobación
│   ├── utils/
│   │   └── helpers.js           ← formatDate, buildWhatsAppLink
│   ├── App.jsx                  ← Router principal + tema
│   └── index.css                ← Tailwind + animaciones
├── .env.example                 ← Plantilla de variables de entorno
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Roles de usuario

### 🔩 Mecánico
Accede desde el celular con las manos ocupadas. Interfaz con botones gigantes de 1 toque. No necesita contraseña — accede por el tab "Mecánico".

### 📋 Administrador (Don Ramiro)
Registra autos nuevos, gestiona el equipo de mecánicos y envía links de seguimiento a los clientes por WhatsApp.

### 📱 Cliente
Recibe un link único por WhatsApp. No necesita crear cuenta ni contraseña. Ve el estado de su auto en tiempo real y puede aprobar o rechazar cotizaciones adicionales dejando un comprobante auditable.

---

## Spec principal

El feature más crítico de la app es la **aprobación de cotizaciones** — resuelve el problema de las disputas y las demoras.

La especificación completa está en `.kiro/specs/aprobacion-cotizaciones.md` e incluye:

- Definición del problema
- Flujo completo mecánico → cliente → mecánico
- Diseño del comprobante auditable
- 5 criterios de aceptación verificables

**Estado de los criterios:**

| Criterio | Estado |
|----------|--------|
| CA-1: Mecánico envía cotización con foto y costo | ✅ |
| CA-2: Cliente ve cotización con botones táctiles | ✅ |
| CA-3: Aprobación genera comprobante SHA-256 persistente | ✅ |
| CA-4: Mecánico ve la aprobación en tiempo real | ✅ |
| CA-5: Cotización respondida no puede modificarse | ✅ |

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo en http://localhost:5173
npm run build    # Build de producción en /dist
npm run preview  # Preview del build de producción
```

---

## Desarrollado con

- [React](https://react.dev)
- [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com)
- [FontAwesome](https://fontawesome.com)
- [Kiro IDE](https://kiro.dev) — desarrollo asistido con IA usando Spec Driven Development
