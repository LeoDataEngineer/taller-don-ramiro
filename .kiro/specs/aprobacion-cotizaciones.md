# Spec: Aprobación de Cotizaciones por el Cliente

## 1. Definición del problema

Cuando un mecánico encuentra una reparación adicional no prevista, el trabajo se detiene porque necesita autorización del cliente. Hoy eso se hace por teléfono, lo que genera dos problemas graves:

1. **Demoras**: el cliente no siempre atiende, el mecánico queda bloqueado esperando.
2. **Disputas**: el cliente puede negar haber aprobado la reparación y el taller no tiene prueba de la aprobación.

El feature debe permitir que el mecánico envíe una cotización al cliente con foto y costo, y que el cliente la apruebe o rechace desde su celular dejando un registro auditable irrefutable.

## 2. Diseño de la solución

### Flujo completo

```
Mecánico detecta problema adicional
  → Abre modal en Modo Mecánico
  → Completa: descripción + costo + foto de evidencia
  → Envía cotización
    → Se guarda en tabla `quotes` con status = 'pending'
    → El estado del auto cambia a 'esperando_aprobacion'

Cliente recibe notificación (por WhatsApp, link ya enviado)
  → Abre su link único desde el celular
  → Ve la cotización con foto, descripción y costo
  → Presiona "Aprobar" o "Rechazar"
    → Si aprueba:
      - status → 'approved'
      - Se genera receipt con: timestamp, IP simulada, hash SHA-256
      - El estado del auto vuelve a 'en_reparacion'
    → Si rechaza:
      - status → 'rejected'
      - El estado del auto vuelve a 'en_reparacion'

Mecánico ve el cambio en tiempo real (Supabase Realtime)
  → Sin recargar la pantalla
  → Puede continuar el trabajo
```

### Componentes involucrados
- `MechanicView.jsx` → QuoteModal (crear cotización)
- `ClientView.jsx` → ClientDetail (ver y responder cotización)
- `useTaller.js` → `addQuote`, `approveQuote`, `rejectQuote`
- Tabla `quotes` en Supabase

### Comprobante auditable
Al aprobar, el sistema genera y persiste en el campo `receipt` (jsonb):
```json
{
  "timestamp": "29/10/2026 19:53:00",
  "isoDate": "2026-10-29T22:53:00.000Z",
  "ip": "192.168.x.x",
  "hash": "a3f9c2b1..."
}
```
Este comprobante es visible para el cliente y queda guardado permanentemente en Supabase.

## 3. Criterios de aceptación

### CA-1: El mecánico puede enviar una cotización con foto y costo
- Dado que estoy en Modo Mecánico y selecciono un auto
- Cuando presiono "Agregar Reparación Adicional" y completo descripción, costo y foto
- Entonces la cotización se guarda en Supabase con `status = 'pending'`
- Y el estado del auto cambia automáticamente a `esperando_aprobacion`

### CA-2: El cliente ve la cotización pendiente en su link de seguimiento
- Dado que el cliente abre su link único desde el celular
- Cuando hay una cotización con `status = 'pending'`
- Entonces ve una sección destacada con la foto de evidencia, la descripción del problema y el costo adicional
- Y los botones "Aprobar Cotización" y "Rechazar" son claramente visibles y táctiles

### CA-3: La aprobación genera un comprobante auditable persistente
- Dado que el cliente presiona "Aprobar Cotización"
- Entonces el sistema genera un comprobante con timestamp exacto, IP y hash
- Y ese comprobante se guarda en el campo `receipt` de la tabla `quotes` en Supabase
- Y el cliente puede verlo inmediatamente en pantalla sin recargar

### CA-4: El mecánico ve la aprobación en tiempo real sin recargar
- Dado que el mecánico tiene la app abierta en su celular
- Cuando el cliente aprueba o rechaza la cotización
- Entonces el estado del auto y el indicador de cotización se actualizan en menos de 3 segundos
- Sin que el mecánico tenga que recargar manualmente la página

### CA-5: Una cotización aprobada no puede volver a modificarse
- Dado que una cotización tiene `status = 'approved'` o `status = 'rejected'`
- Entonces los botones "Aprobar" y "Rechazar" no aparecen en la pantalla del cliente
- Y el comprobante auditable queda visible como registro permanente
