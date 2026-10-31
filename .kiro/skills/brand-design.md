# Skill: Diseño de Marca — Taller Don Ramiro

## Identidad de marca
**Nombre:** Taller Don Ramiro  
**Personalidad:** Industrial, confiable, directo. Sin adornos innecesarios. Hecho para trabajadores que tienen las manos sucias y necesitan que las cosas funcionen rápido.

## Paleta de colores

### Modo oscuro (default)
| Rol                | Token Tailwind       | Hex       |
|--------------------|----------------------|-----------|
| Acento principal   | `amber-500`          | #f59e0b   |
| Acento hover       | `amber-400`          | #fbbf24   |
| Fondo app          | `slate-950`          | #020617   |
| Fondo card         | `slate-900`          | #0f172a   |
| Fondo input        | `slate-950`          | #020617   |
| Borde              | `slate-800`          | #1e293b   |
| Texto principal    | `white`              | #ffffff   |
| Texto secundario   | `slate-400`          | #94a3b8   |
| Texto muted        | `slate-500`          | #64748b   |
| Éxito              | `emerald-500`        | #10b981   |
| Peligro            | `red-500`            | #ef4444   |
| Info               | `blue-600`           | #2563eb   |
| Alerta             | `amber-500`          | #f59e0b   |

### Modo claro
| Rol                | Token Tailwind       |
|--------------------|----------------------|
| Fondo app          | `slate-100`          |
| Fondo card         | `white`              |
| Borde              | `slate-200`          |
| Texto principal    | `slate-900`          |

### Colores por estado del vehículo
| Estado                 | Color Tailwind                        |
|------------------------|---------------------------------------|
| Recibido               | `bg-slate-600 text-white`             |
| En Diagnóstico         | `bg-purple-600 text-white`            |
| Esperando Aprobación   | `bg-amber-500 text-slate-950`         |
| En Reparación          | `bg-blue-600 text-white`              |
| Listo para Retirar     | `bg-emerald-500 text-slate-950`       |

### Colores por cotización
| Estado    | Color                                                      |
|-----------|------------------------------------------------------------|
| Pendiente | `border-amber-500` + `bg-amber-500/10`                    |
| Aprobada  | `border-emerald-500/50` + `bg-emerald-500/10`             |
| Rechazada | `border-red-500/30` + `bg-red-500/10`                     |

## Tipografía
- **Logo / títulos hero:** `font-tech` (Rajdhani 700) — solo para "DON RAMIRO" en el header
- **Títulos de sección:** Inter 800-900 (`font-black` / `font-extrabold`)
- **Labels y subtítulos:** Inter 700 (`font-bold`)
- **Cuerpo:** Inter 400-600
- **Patentes / placas:** `font-mono` siempre, con `tracking-wider` o `tracking-widest`
- **Tamaños mínimos en interfaces táctiles:** `text-sm` (14px) como mínimo, preferir `text-base` (16px)

## Espaciado y forma
- **Cards principales:** `rounded-3xl` con `shadow-lg` o `shadow-xl`
- **Botones secundarios:** `rounded-2xl`
- **Badges / pills:** `rounded-full` o `rounded-xl`
- **Padding cards:** `p-5` o `p-4` en mobile
- **Gap entre cards:** `gap-4`
- **Bordes activos/hover:** siempre usar `border-2`, cambiar color en hover/active

## Botones táctiles (interfaz mecánico)
- Tamaño mínimo: `py-4 px-4` — suficiente para tocar con el dedo gordo
- Font: `font-black` o `font-bold`
- Feedback táctil: `active:scale-95` o `active:scale-[0.98]`
- Transición: `transition` en todos los botones interactivos
- Botón primario de acción: `bg-amber-500 text-slate-950 font-black`
- Botón de éxito: `bg-emerald-500 text-slate-950 font-black`
- Botón destructivo: `bg-red-500 text-white font-black`

## Íconos
- Librería: FontAwesome 6 Solid (`fa-solid`)
- Uso: siempre con `<i className="fa-solid fa-[nombre]" />`
- Tamaño en botones grandes: `text-xl` o `text-2xl`
- Tamaño en labels: `text-sm` o `text-xs`

## Componentes de marca

### Header
- Fondo: `bg-white dark:bg-slate-900` con `border-b border-slate-200 dark:border-slate-800`
- Logo: ícono `fa-wrench` sobre fondo `bg-amber-500` con texto "DON RAMIRO" en `text-amber-500 font-tech`
- Nav tabs: activo = `bg-amber-500 text-slate-950`, inactivo = texto `slate-500`

### Cards de módulo
- Borde `border-2` que cambia de color según el módulo al hacer hover
- Mecánico: hover `border-amber-500`
- Admin: hover `border-blue-500`
- Cliente: hover `border-emerald-500`
- Animación: `hover:-translate-y-1` + `transition-all`

### Indicadores de estado en vivo
- Punto pulsante: `animate-ping` + punto sólido superpuesto
- Color: `bg-amber-400` para "activo", `bg-emerald-400` para "operativo"

### Comprobante auditable
- Fondo: `bg-white dark:bg-slate-900` con borde `border-emerald-500/30`
- Texto: `font-mono text-[11px]`
- Header del comprobante: `text-emerald-500 font-bold` con ícono `fa-shield-halved`
