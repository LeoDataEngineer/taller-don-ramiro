import { useState, useRef } from 'react'
import { useTallerStore } from '../store/TallerContext'
import { useToast } from '../components/Toast'

const MECHANIC_ICONS = {
  'Carlos M.':  { icon: 'fa-wrench',             color: 'bg-amber-500',   ring: 'ring-amber-500'   },
  'Roberto G.': { icon: 'fa-bolt',               color: 'bg-blue-500',    ring: 'ring-blue-500'    },
  'Mariano L.': { icon: 'fa-car-burst',          color: 'bg-purple-500',  ring: 'ring-purple-500'  },
  'Diego S.':   { icon: 'fa-screwdriver-wrench', color: 'bg-emerald-500', ring: 'ring-emerald-500' },
}

const FALLBACK_COLORS = [
  'bg-amber-500','bg-blue-500','bg-purple-500','bg-emerald-500',
  'bg-rose-500','bg-cyan-500','bg-orange-500','bg-indigo-500',
]

function getMechanicStyle(name, allNames) {
  if (MECHANIC_ICONS[name]) return MECHANIC_ICONS[name]
  const idx = allNames.indexOf(name)
  const color = FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
  return { icon: 'fa-user-gear', color, ring: color.replace('bg-', 'ring-') }
}

export default function MechanicView() {
  const { cars, quotes, STATUS_LABELS, mechanics, setCarStatus, addQuote, getQuotesForCar } = useTallerStore()
  const showToast  = useToast()
  const [selectedMechanic, setSelectedMechanic] = useState(null)
  const [quoteCarId, setQuoteCarId] = useState(null)

  // Combine: mechanics from local list + any mechanic that has a car in Supabase
  const activeMechanicNames = [...new Set(cars.map(c => c.mechanic).filter(Boolean))]
  const allMechanicNames    = [...new Set([...mechanics, ...activeMechanicNames])]

  function handleSetStatus(carId, statusId) {
    setCarStatus(carId, statusId)
    const s = STATUS_LABELS.find(s => s.id === statusId)
    showToast('Estado Actualizado', `Pasó a: ${s?.label}`)
  }

  async function handleSubmitQuote(data) {
    const result = await addQuote({ carId: quoteCarId, ...data })
    if (!result.ok) {
      showToast('Error', 'No se pudo guardar la cotización. Intentá de nuevo.')
      return
    }
    await setCarStatus(quoteCarId, 'esperando_aprobacion')
    setQuoteCarId(null)
    showToast('Cotización Enviada', 'Se notificó al cliente para aprobación digital.')
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 pb-10">

      {/* Mode Banner */}
      <div className="bg-amber-500/10 border-2 border-amber-500/30 p-4 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-4 w-4 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-amber-500 uppercase tracking-wide">
              Modo Manos Sucias
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Seleccioná un mecánico para ver sus trabajos activos
            </p>
          </div>
        </div>
        {selectedMechanic && (
          <button
            onClick={() => setSelectedMechanic(null)}
            className="bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-2xl border border-slate-200
                       dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300
                       hover:text-amber-500 transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left" /> Mecánicos
          </button>
        )}
      </div>

      {/* STEP 1: Mechanic selector grid */}
      {!selectedMechanic && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allMechanicNames.map(mechanic => {
            const style   = getMechanicStyle(mechanic, allMechanicNames)
            const myCars  = cars.filter(c => c.mechanic === mechanic && c.status !== 'listo')
            const pending = quotes.filter(q =>
              myCars.some(c => c.id === q.car_id) && q.status === 'pending'
            ).length

            return (
              <button
                key={mechanic}
                onClick={() => setSelectedMechanic(mechanic)}
                className="group bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800
                           hover:border-amber-500 dark:hover:border-amber-500 rounded-3xl p-5 shadow-lg
                           transition-all hover:-translate-y-1 active:scale-[0.98] text-center space-y-4"
              >
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className={`w-16 h-16 ${style.color} ${style.ring} ring-4 ring-offset-2
                                   dark:ring-offset-slate-900 rounded-full flex items-center justify-center
                                   shadow-lg text-white text-2xl`}>
                    <i className={`fa-solid ${style.icon}`} />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base
                                 group-hover:text-amber-500 transition leading-tight">
                    {mechanic}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {myCars.length} auto{myCars.length !== 1 ? 's' : ''} activo{myCars.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-3">
                  <div className="text-center">
                    <div className="text-xl font-black text-slate-800 dark:text-white">{myCars.length}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">En taller</div>
                  </div>
                  {pending > 0 && (
                    <div className="text-center">
                      <div className="text-xl font-black text-amber-500 animate-pulse">{pending}</div>
                      <div className="text-[10px] text-amber-500 font-semibold">Pendientes</div>
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1
                                group-hover:translate-x-1 transition">
                  Ver trabajos <i className="fa-solid fa-arrow-right" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* STEP 2: Cars for selected mechanic */}
      {selectedMechanic && (
        <>
          {/* Mechanic header */}
          <div className="flex items-center gap-4">
            {(() => {
              const style = getMechanicStyle(selectedMechanic, allMechanicNames)
              return (
                <div className={`w-12 h-12 ${style.color} ${style.ring} ring-4 ring-offset-2
                                 dark:ring-offset-slate-950 rounded-full flex items-center justify-center
                                 text-white text-xl shadow-md`}>
                  <i className={`fa-solid ${style.icon}`} />
                </div>
              )
            })()}
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedMechanic}</h3>
              <p className="text-xs text-slate-400">
                {cars.filter(c => c.mechanic === selectedMechanic && c.status !== 'listo').length} vehículo(s) activo(s)
              </p>
            </div>
          </div>

          {/* Cars grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cars.filter(c => c.mechanic === selectedMechanic && c.status !== 'listo').length === 0 ? (
              <div className="col-span-full text-center py-16 text-slate-500">
                <i className="fa-solid fa-flag-checkered text-5xl mb-3 block text-slate-400" />
                <p className="font-semibold">No hay vehículos activos asignados a {selectedMechanic}</p>
              </div>
            ) : (
              cars
                .filter(c => c.mechanic === selectedMechanic && c.status !== 'listo')
                .map(car => (
                  <CarCard
                    key={car.id}
                    car={car}
                    STATUS_LABELS={STATUS_LABELS}
                    carQuotes={getQuotesForCar(car.id)}
                    onSetStatus={handleSetStatus}
                    onAddQuote={() => setQuoteCarId(car.id)}
                  />
                ))
            )}
          </div>
        </>
      )}

      {/* Quote Modal */}
      {quoteCarId && (
        <QuoteModal
          car={cars.find(c => c.id === quoteCarId)}
          onClose={() => setQuoteCarId(null)}
          onSubmit={handleSubmitQuote}
        />
      )}
    </div>
  )
}

/* ── Car Card ─────────────────────────────────────────── */
function CarCard({ car, STATUS_LABELS, carQuotes, onSetStatus, onAddQuote }) {
  const hasPending = carQuotes.some(q => q.status === 'pending')

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border-2
                     ${hasPending
                       ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/5'
                       : 'border-slate-200 dark:border-slate-800'}
                     shadow-xl space-y-4 flex flex-col justify-between`}>

      {/* Top info */}
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="bg-amber-500 text-slate-950 text-base font-black px-3 py-1
                             rounded-xl font-mono inline-block shadow-md uppercase tracking-wider">
              {car.plate}
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">{car.model}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              <i className="fa-solid fa-user mr-1" />{car.client}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-bold">Mecánico:</span>
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1
                             rounded-lg border border-amber-500/20">
              {car.mechanic}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-black block">Falla / Trabajo Inicial:</span>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium mt-0.5">
            {car.description || 'Sin descripción'}
          </p>
        </div>

        {/* Quotes summary */}
        {carQuotes.length > 0 && (
          <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-3
                          border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Cotizaciones Adicionales:
            </span>
            {carQuotes.map(q => (
              <div key={q.id}
                className="flex items-center justify-between text-xs sm:text-sm bg-white dark:bg-slate-900
                           p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 overflow-hidden">
                  {q.photo_url && (
                    <img src={q.photo_url} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                  )}
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {q.problem}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="font-bold text-amber-500">${Number(q.cost).toLocaleString()}</span>
                  <span className={`block text-[10px] font-black uppercase
                    ${q.status === 'approved' ? 'text-emerald-500'
                    : q.status === 'rejected' ? 'text-red-500'
                    : 'text-amber-500 animate-pulse'}`}>
                    {q.status === 'approved' ? 'aprobado'
                    : q.status === 'rejected' ? 'rechazado'
                    : 'pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status buttons */}
        <div>
          <label className="block text-xs font-extrabold text-slate-400 uppercase mb-2">
            <i className="fa-solid fa-arrows-spin text-amber-500 mr-1" /> Cambiar Estado (1-Toque):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STATUS_LABELS.map(s => {
              const isCurrent = car.status === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => onSetStatus(car.id, s.id)}
                  className={`p-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center
                               justify-between border-2 transition active:scale-95
                    ${isCurrent
                      ? `${s.color} border-slate-900/20 dark:border-white/20 shadow-lg`
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <i className={`fa-solid ${s.icon} text-base`} />
                    <span>{s.label}</span>
                  </span>
                  {isCurrent && <i className="fa-solid fa-circle-check text-lg" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add quote */}
      <div className="pt-2">
        <button
          onClick={onAddQuote}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black
                     py-4 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-3
                     text-base active:scale-[0.98] transition uppercase tracking-wide"
        >
          <i className="fa-solid fa-circle-plus text-2xl" />
          Agregar Reparación Adicional
        </button>
      </div>
    </div>
  )
}

/* ── Quote Modal ──────────────────────────────────────── */
const PHOTO_PRESETS = [
  { key: 'brakes', label: 'Pastillas', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80' },
  { key: 'engine', label: 'Fuga Aceite', url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80' },
]

function QuoteModal({ car, onClose, onSubmit }) {
  const [problem,    setProblem]    = useState('')
  const [cost,       setCost]       = useState('')
  const [photoUrl,   setPhotoUrl]   = useState(PHOTO_PRESETS[0].url)
  const [photoLabel, setPhotoLabel] = useState('Foto de muestra cargada')
  const fileRef = useRef()

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPhotoUrl(ev.target.result); setPhotoLabel(`Capturada: ${file.name}`) }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const parsedCost = parseFloat(cost)
    if (!problem.trim()) return
    if (!cost || isNaN(parsedCost) || parsedCost <= 0) return
    onSubmit({ problem: problem.trim(), cost: parsedCost, photoUrl })
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-3xl
                      max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2.5 rounded-xl">
              <i className="fa-solid fa-file-invoice-dollar text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Agregar Reparación Adicional</h3>
              <p className="text-xs text-amber-500 font-bold">{car?.model} [{car?.plate}]</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl p-2">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              Descripción del Problema / Repuesto *
            </label>
            <input type="text" required value={problem} onChange={e => setProblem(e.target.value)}
              placeholder="Ej: Pastillas de freno desgastadas al 90%"
              className="w-full bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800
                         rounded-2xl px-4 py-3 text-slate-900 dark:text-slate-100
                         focus:outline-none focus:border-amber-500 text-base font-semibold" />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              Costo Adicional ($) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-extrabold text-lg">$</span>
              <input type="number" required min="0" step="50" value={cost} onChange={e => setCost(e.target.value)}
                placeholder="12500"
                className="w-full bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800
                           rounded-2xl pl-9 pr-4 py-3 text-slate-900 dark:text-slate-100
                           focus:outline-none focus:border-amber-500 text-xl font-bold" />
            </div>
          </div>

          {/* Photo presets */}
          <div>
            <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              Foto de Evidencia
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="cursor-pointer border-2 border-dashed border-amber-500/50 hover:border-amber-500
                                bg-amber-500/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-1">
                <i className="fa-solid fa-camera text-2xl text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-300">Tomar Foto</span>
                <input ref={fileRef} type="file" accept="image/*" capture="environment"
                       className="hidden" onChange={handleFileChange} />
              </label>
              {PHOTO_PRESETS.map(p => (
                <div key={p.key} onClick={() => { setPhotoUrl(p.url); setPhotoLabel(`Foto: ${p.label}`) }}
                  className={`cursor-pointer border-2 rounded-2xl p-1 bg-slate-100 dark:bg-slate-950
                               flex flex-col items-center justify-center transition
                               ${photoUrl === p.url ? 'border-amber-500' : 'border-slate-300 dark:border-slate-800 hover:border-amber-500'}`}>
                  <img src={p.url} alt={p.label} className="h-10 w-full object-cover rounded-xl mb-1" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{p.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-500 mt-1 font-semibold flex items-center gap-1">
              <i className="fa-solid fa-check" /> {photoLabel}
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button type="button" onClick={onClose}
              className="w-1/3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700
                         text-slate-700 dark:text-slate-200 font-bold py-3.5 px-4 rounded-2xl text-sm transition">
              Cancelar
            </button>
            <button type="submit"
              className="w-2/3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black
                         py-3.5 px-4 rounded-2xl text-base shadow-xl transition
                         flex items-center justify-center gap-2 active:scale-[0.98]">
              <i className="fa-solid fa-paper-plane text-lg" />
              Enviar a Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
