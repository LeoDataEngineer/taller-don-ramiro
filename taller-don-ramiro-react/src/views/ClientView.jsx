import { useState } from 'react'
import { useTallerStore } from '../store/TallerContext'
import { useToast } from '../components/Toast'
import { formatDate } from '../utils/helpers'

/* ─────────────────────────────────────────────────────────
   STATUS badge colors
───────────────────────────────────────────────────────── */
const STATUS_BADGE = {
  recibido:             'bg-slate-600 text-white',
  diagnostico:          'bg-purple-600 text-white',
  esperando_aprobacion: 'bg-amber-500 text-slate-950',
  en_reparacion:        'bg-blue-600 text-white',
  listo:                'bg-emerald-500 text-slate-950',
}

/* ─────────────────────────────────────────────────────────
   Main component — decides whether to show list or detail
───────────────────────────────────────────────────────── */
export default function ClientView({ token: externalToken, onBack }) {
  const [selectedToken, setSelectedToken] = useState(externalToken ?? null)

  // If an external token was passed (direct link / admin "Ver"), skip the list
  if (selectedToken) {
    return (
      <ClientDetail
        token={selectedToken}
        onBack={externalToken ? onBack : () => setSelectedToken(null)}
        backLabel={externalToken ? '← Volver' : '← Clientes'}
      />
    )
  }

  return <ClientList onSelect={setSelectedToken} />
}

/* ─────────────────────────────────────────────────────────
   CLIENT LIST — grid of client cards
───────────────────────────────────────────────────────── */
function ClientList({ onSelect }) {
  const { cars, quotes, STATUS_LABELS } = useTallerStore()
  const [search, setSearch] = useState('')

  const filtered = cars.filter(car =>
    car.client.toLowerCase().includes(search.toLowerCase()) ||
    car.plate.toLowerCase().includes(search.toLowerCase()) ||
    car.model.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-10 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-mobile-screen-button text-emerald-500" />
            Vista Clientes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {cars.length} vehículo{cars.length !== 1 ? 's' : ''} registrado{cars.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente, placa o modelo..."
            className="pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200
                       dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100
                       focus:outline-none focus:border-amber-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <i className="fa-solid fa-users text-5xl block mb-3 opacity-30" />
          <p className="font-semibold">
            {search ? 'No se encontraron resultados.' : 'No hay clientes registrados aún.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(car => {
            const stageObj    = STATUS_LABELS.find(s => s.id === car.status) || STATUS_LABELS[0]
            const carQuotes   = quotes.filter(q => q.car_id === car.id)
            const pending     = carQuotes.filter(q => q.status === 'pending').length
            const stageIndex  = STATUS_LABELS.findIndex(s => s.id === car.status)
            const progressPct = Math.round(((Math.max(stageIndex, 0) + 1) / STATUS_LABELS.length) * 100)
            const avatarLetter = car.client.charAt(0).toUpperCase()

            return (
              <button
                key={car.id}
                onClick={() => onSelect(car.token)}
                className="group bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800
                           hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-5 shadow-lg
                           transition-all hover:-translate-y-1 active:scale-[0.98] text-left space-y-4 w-full"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center
                                    text-white text-lg font-black flex-shrink-0 shadow">
                      {avatarLetter}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-sm leading-tight
                                    group-hover:text-emerald-500 transition">
                        {car.client}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{car.phone}</p>
                    </div>
                  </div>
                  {/* Status badge */}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0
                                   ${STATUS_BADGE[car.status] ?? 'bg-slate-600 text-white'}`}>
                    {stageObj.short}
                  </span>
                </div>

                {/* Car info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{car.model}</p>
                    <p className="font-mono text-xs text-amber-500 font-black mt-0.5">{car.plate}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <i className="fa-solid fa-wrench mr-1" />
                    {car.mechanic}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span>Progreso</span>
                    <span className="text-amber-500">{progressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Alerts */}
                {pending > 0 && (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/40
                                  rounded-xl px-3 py-2 text-xs font-bold text-amber-500">
                    <i className="fa-solid fa-triangle-exclamation animate-bounce" />
                    {pending} cotización{pending > 1 ? 'es' : ''} pendiente{pending > 1 ? 's' : ''}
                  </div>
                )}

                {car.status === 'listo' && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/40
                                  rounded-xl px-3 py-2 text-xs font-bold text-emerald-500">
                    <i className="fa-solid fa-circle-check" />
                    Listo para retirar
                  </div>
                )}

                <div className="text-xs font-bold text-emerald-500 flex items-center gap-1
                                group-hover:translate-x-1 transition">
                  Ver seguimiento <i className="fa-solid fa-arrow-right" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   CLIENT DETAIL — full tracking view
───────────────────────────────────────────────────────── */
function ClientDetail({ token, onBack, backLabel = '← Volver' }) {
  const { cars, STATUS_LABELS, approveQuote, rejectQuote, getQuotesForCar } = useTallerStore()
  const showToast = useToast()

  const car = cars.find(c => c.token === token)

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <i className="fa-solid fa-circle-xmark text-6xl text-red-400 mb-4" />
        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Vehículo no encontrado</h2>
        <p className="text-slate-400 text-sm mb-6">
          El enlace puede ser inválido o el vehículo fue removido.
        </p>
        {onBack && (
          <button onClick={onBack}
            className="px-5 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200
                       dark:border-slate-700 rounded-xl text-slate-700 dark:text-white font-bold">
            {backLabel}
          </button>
        )}
      </div>
    )
  }

  const carQuotes    = getQuotesForCar(car.id)
  const stageIndex   = STATUS_LABELS.findIndex(s => s.id === car.status)
  const safeIndex    = stageIndex === -1 ? 0 : stageIndex
  const progressPct  = Math.round(((safeIndex + 1) / STATUS_LABELS.length) * 100)
  const currentStage = STATUS_LABELS[safeIndex]
  const pendingQ     = carQuotes.filter(q => q.status === 'pending')
  const answeredQ    = carQuotes.filter(q => q.status !== 'pending')

  function handleApprove(qId) {
    approveQuote(qId)
    showToast('Presupuesto Aprobado', 'Se registró el comprobante digital con firma IP.')
  }
  function handleReject(qId) {
    rejectQuote(qId)
    showToast('Presupuesto Rechazado', 'Se notificó al mecánico de la decisión.')
  }

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6 pb-10 space-y-4">

      {/* Back */}
      {onBack && (
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400
                     hover:text-slate-900 dark:hover:text-white transition">
          <i className="fa-solid fa-arrow-left" /> {backLabel}
        </button>
      )}

      {/* Main card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200
                      dark:border-slate-800 overflow-hidden shadow-2xl">

        {/* Card header */}
        <div className="bg-slate-100 dark:bg-slate-950 p-5 border-b border-slate-200
                        dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Seguimiento en Vivo para
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{car.model}</h2>
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5
                             rounded-md font-mono mt-1 inline-block uppercase">
              {car.plate}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Cliente</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{car.client}</span>
            <span className="text-xs text-slate-400 block mt-0.5">
              <i className="fa-solid fa-wrench mr-1" />{car.mechanic}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-6">

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <i className="fa-solid fa-spinner animate-spin text-amber-500" /> Progreso de Reparación
              </span>
              <span className="text-amber-500 font-mono text-sm">{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-3
                            border border-slate-300 dark:border-slate-800 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-center pt-1">
              <span className="text-xs text-slate-400">Estado Actual: </span>
              <span className="text-sm font-extrabold text-amber-500 uppercase tracking-wide">
                {currentStage.label}
              </span>
            </div>
          </div>

          {/* Timeline steps */}
          <div className="grid grid-cols-5 gap-1">
            {STATUS_LABELS.map((s, idx) => {
              const isDone = idx <= safeIndex
              return (
                <div key={s.id} className="flex flex-col items-center text-center gap-1">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center
                                   justify-center text-xs font-bold transition
                    ${isDone
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg scale-105'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-400 border border-slate-300 dark:border-slate-800'
                    }`}>
                    <i className={`fa-solid ${s.icon}`} />
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-bold leading-tight
                    ${isDone ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                    {s.short}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Work description */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl
                          border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Falla / Trabajo Solicitado:
            </span>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
              {car.description || 'Sin descripción'}
            </p>
          </div>

          {/* Pending quotes */}
          {pendingQ.length > 0 && (
            <div className="bg-amber-500/10 border-2 border-amber-500 rounded-3xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-500 font-black">
                <i className="fa-solid fa-triangle-exclamation text-xl animate-bounce" />
                <h4 className="text-base sm:text-lg">Reparación Adicional Requerida</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                El mecánico encontró el siguiente detalle que requiere su aprobación para continuar:
              </p>
              {pendingQ.map(q => (
                <div key={q.id}
                  className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-amber-500/40 space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {q.photo_url && (
                      <img src={q.photo_url} alt="Evidencia"
                           className="w-full sm:w-28 h-28 object-cover rounded-xl
                                      border border-slate-200 dark:border-slate-800" />
                    )}
                    <div className="flex-1 space-y-1">
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                        {q.problem}
                      </h5>
                      <p className="text-xs text-slate-400">
                        Detectado: {new Date(q.created_at).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit'
                        })} hs
                      </p>
                      <div className="pt-1">
                        <span className="text-xs text-slate-400 block font-semibold">Costo Adicional:</span>
                        <span className="text-2xl font-black text-amber-500">
                          ${Number(q.cost).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button onClick={() => handleReject(q.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30
                                 font-bold py-3 px-3 rounded-xl text-xs sm:text-sm flex items-center
                                 justify-center gap-1.5 transition active:scale-95">
                      <i className="fa-solid fa-xmark" /> Rechazar
                    </button>
                    <button onClick={() => handleApprove(q.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black
                                 py-3 px-3 rounded-xl text-xs sm:text-sm shadow-lg flex items-center
                                 justify-center gap-1.5 transition active:scale-95">
                      <i className="fa-solid fa-check text-lg" /> Aprobar Cotización
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Answered quotes — audit log */}
          {answeredQ.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Registro Auditable de Aprobaciones:
              </h4>
              {answeredQ.map(q => (
                <div key={q.id}
                  className={`bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border text-xs space-y-2
                    ${q.status === 'approved' ? 'border-emerald-500/40' : 'border-red-500/40'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{q.problem}</span>
                      <span className="block font-black text-amber-500">
                        ${Number(q.cost).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg font-black uppercase text-[10px]
                      ${q.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                      {q.status === 'approved' ? 'aprobado' : 'rechazado'}
                    </span>
                  </div>
                  {q.receipt && (
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl text-[11px] font-mono
                                    text-slate-500 dark:text-slate-400 space-y-0.5
                                    border border-slate-200 dark:border-slate-800">
                      <div className="text-emerald-500 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-shield-halved" /> Registro Digital con Firma IP
                      </div>
                      <div><span className="text-slate-400">Fecha/Hora:</span> {q.receipt.timestamp}</div>
                      <div><span className="text-slate-400">IP Registro:</span> {q.receipt.ip}</div>
                      <div>
                        <span className="text-slate-400">Hash ID:</span>{' '}
                        <span className="text-slate-700 dark:text-slate-300 break-all">{q.receipt.hash}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* WhatsApp contact */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200
                          dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">¿Dudas con la reparación?</p>
              <p className="text-[11px] text-slate-400">Atendido por {car.mechanic}</p>
            </div>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Hola Taller Don Ramiro, consulto por mi auto ${car.plate}`)}`}
               target="_blank" rel="noopener noreferrer"
               className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-2
                          rounded-xl text-xs flex items-center gap-1.5 transition flex-shrink-0 active:opacity-80">
              <i className="fa-brands fa-whatsapp text-lg" />
              Enviar WhatsApp
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
