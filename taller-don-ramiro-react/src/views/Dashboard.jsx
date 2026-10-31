import { useTallerStore } from '../store/TallerContext'
import { formatDate } from '../utils/helpers'

export default function Dashboard({ onNavigate }) {
  const { metrics, cars, quotes, STATUS_LABELS } = useTallerStore()

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 pb-10">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl
                      bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950
                      border border-slate-800 shadow-2xl p-6 sm:p-8 text-white">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-amber-500 text-9xl pointer-events-none">
          <i className="fa-solid fa-wrench" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40
                          text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            Taller Operativo en Tiempo Real
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Bienvenido al Sistema Digital de{' '}
            <span className="text-amber-500">Taller Don Ramiro</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Plataforma optimizada para mecánicos con manos sucias, aprobación instantánea de presupuestos
            extras por WhatsApp sin disputas y control transparente para los clientes.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
              <i className="fa-solid fa-users-gear text-amber-500 text-base" />
              4 Mecánicos Disponibles
            </div>
            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
              <i className="fa-solid fa-shield-check text-emerald-400 text-base" />
              Aprobaciones con Firma Digital
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard icon="fa-car"           color="text-amber-500"  bg="bg-amber-500/10"
                 label="Autos en Taller"      value={metrics.active}  onClick={() => onNavigate('admin')} />
        <KpiCard icon="fa-clock-rotate-left" color="text-amber-500"  bg="bg-amber-500/10"
                 label="Esperando Apr."       value={metrics.pending} valueColor="text-amber-500" onClick={() => onNavigate('admin')} />
        <KpiCard icon="fa-circle-check"  color="text-emerald-500" bg="bg-emerald-500/10"
                 label="Listos para Entrega"  value={metrics.ready}   valueColor="text-emerald-500" onClick={() => onNavigate('admin')} />
        <KpiCard icon="fa-bolt"          color="text-blue-500"    bg="bg-blue-500/10"
                 label="Eficiencia Taller"
                 value={metrics.efficiency !== null ? `${metrics.efficiency}%` : '—'}
                 valueColor="text-blue-500" />
      </div>

      {/* Acceso Rápido */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i className="fa-solid fa-rocket text-amber-500" /> Acceso Rápido por Rol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RoleCard
            icon="fa-hand-sparkles" iconBg="bg-amber-500 text-slate-950"
            badge="Manos Sucias"    badgeColor="text-amber-500 bg-amber-500/10"
            title="Modo Mecánico"  hoverBorder="hover:border-amber-500"
            titleHover="group-hover:text-amber-500"
            desc="Botones gigantes táctiles de 1-toque, cambio de estado de auto y reporte de adicionales con fotos."
            cta="Ingresar como Mecánico" ctaColor="text-amber-500"
            onClick={() => onNavigate('mechanic')}
          />
          <RoleCard
            icon="fa-user-gear"    iconBg="bg-blue-600 text-white"
            badge="Don Ramiro"     badgeColor="text-blue-500 bg-blue-500/10"
            title="Administración" hoverBorder="hover:border-blue-500"
            titleHover="group-hover:text-blue-500"
            desc="Ingreso ultrarrápido de nuevos coches, asignación a mecánicos y generación de enlaces de WhatsApp."
            cta="Abrir Administración" ctaColor="text-blue-500"
            onClick={() => onNavigate('admin')}
          />
          <RoleCard
            icon="fa-mobile-screen-button" iconBg="bg-emerald-500 text-slate-950"
            badge="Sin Contraseñas"        badgeColor="text-emerald-500 bg-emerald-500/10"
            title="Vista Cliente"          hoverBorder="hover:border-emerald-500"
            titleHover="group-hover:text-emerald-500"
            desc="Línea de tiempo de reparación y aprobación/rechazo digital con firma y comprobante auditable."
            cta="Simular Vista de Cliente" ctaColor="text-emerald-500"
            onClick={() => onNavigate('client-demo')}
          />
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5
                      border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-list-check text-amber-500" /> Actividad Reciente del Taller
          </h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">En tiempo real</span>
        </div>

        <div className="space-y-2">
          {cars.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Sin actividad reciente registrada.</p>
          ) : cars.map(car => {
            const stageObj = STATUS_LABELS.find(s => s.id === car.status) || STATUS_LABELS[0]
            const hasPending = quotes.some(q => q.car_id === car.id && q.status === 'pending')
            return (
              <div key={car.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950
                           rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-xl font-mono font-bold">
                    {car.plate}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{car.model}</p>
                    <p className="text-[11px] text-slate-500">
                      Mecánico: {car.mechanic} · Cliente: {car.client}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasPending && (
                    <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-lg text-[10px] font-bold animate-pulse">
                      Presupuesto Pendiente
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-xl font-bold text-[10px] ${stageObj.color}`}>
                    {stageObj.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

function KpiCard({ icon, color, bg, label, value, valueColor = 'text-slate-900 dark:text-white', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800
                  shadow-md flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-lg transition' : ''}`}
    >
      <div className={`${bg} ${color} p-3.5 rounded-2xl text-xl flex-shrink-0`}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{label}</p>
        <p className={`text-2xl font-black ${valueColor}`}>{value ?? 0}</p>
      </div>
    </div>
  )
}

function RoleCard({ icon, iconBg, badge, badgeColor, title, hoverBorder, titleHover, desc, cta, ctaColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-white dark:bg-slate-900 border-2
                  border-slate-200 dark:border-slate-800 ${hoverBorder} dark:${hoverBorder}
                  p-5 rounded-3xl shadow-lg transition-all hover:-translate-y-1 space-y-3`}
    >
      <div className="flex items-center justify-between">
        <div className={`${iconBg} p-3 rounded-2xl text-xl font-bold`}>
          <i className={`fa-solid ${icon}`} />
        </div>
        <span className={`text-xs font-bold ${badgeColor} px-2.5 py-1 rounded-full uppercase`}>
          {badge}
        </span>
      </div>
      <div>
        <h4 className={`text-lg font-black text-slate-900 dark:text-white ${titleHover} transition`}>
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
      </div>
      <div className={`text-xs font-bold ${ctaColor} flex items-center gap-1 group-hover:translate-x-1 transition`}>
        <span>{cta}</span>
        <i className="fa-solid fa-arrow-right" />
      </div>
    </div>
  )
}
