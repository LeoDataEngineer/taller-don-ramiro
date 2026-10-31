import { useState } from 'react'
import { useTallerStore } from '../store/TallerContext'
import { useToast } from '../components/Toast'
import { formatDate } from '../utils/helpers'

const MECHANIC_COLORS = [
  'bg-amber-500',  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-rose-500',   'bg-cyan-500', 'bg-orange-500', 'bg-indigo-500',
]

function mechanicColor(name, list) {
  const idx = list.indexOf(name)
  return MECHANIC_COLORS[idx % MECHANIC_COLORS.length] ?? 'bg-slate-500'
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function AdminView({ onViewClient }) {
  const {
    cars, quotes, STATUS_LABELS,
    mechanics, addMechanic, removeMechanic,
    registerCar,
  } = useTallerStore()
  const showToast = useToast()

  const [form, setForm] = useState({
    client: '', phone: '', model: '', plate: '',
    mechanic: mechanics[0] ?? '', description: '',
  })
  const [newMechName, setNewMechName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // mechanic name to confirm

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.client || !form.phone || !form.model || !form.plate) {
      showToast('Campos Incompletos', 'Completá todos los campos obligatorios')
      return
    }
    if (cars.find(c => c.plate.toUpperCase() === form.plate.toUpperCase())) {
      showToast('Placa Duplicada', 'Ya existe un vehículo con esa patente')
      return
    }
    const car = await registerCar(form)
    if (car) {
      setForm(f => ({ ...f, client: '', phone: '', model: '', plate: '', description: '' }))
      showToast('Vehículo Ingresado', `Se registró ${car.model} [${car.plate}] con éxito.`)
    }
  }

  function handleAddMechanic(e) {
    e.preventDefault()
    if (!newMechName.trim()) return
    const ok = addMechanic(newMechName.trim())
    if (ok) {
      showToast('Mecánico Agregado', `${newMechName.trim()} fue agregado al equipo.`)
      setNewMechName('')
    } else {
      showToast('Ya existe', 'Ese nombre ya está en la lista.')
    }
  }

  function handleRemoveMechanic(name) {
    const activeCars = cars.filter(c => c.mechanic === name && c.status !== 'listo')
    if (activeCars.length > 0) {
      showToast('No se puede eliminar', `${name} tiene ${activeCars.length} auto(s) activo(s).`)
      setConfirmDelete(null)
      return
    }
    removeMechanic(name)
    showToast('Mecánico Eliminado', `${name} fue removido del equipo.`)
    setConfirmDelete(null)
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-10 space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Express intake form ───────────────────── */}
        <div className="space-y-6">

          {/* Register car */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200
                          dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="bg-blue-600 text-white p-2.5 rounded-2xl">
                <i className="fa-solid fa-car-tunnel text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ingreso Express</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Registrar nuevo vehículo</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { label: 'Nombre del Cliente *', name: 'client', type: 'text',  placeholder: 'Ej: Juan Pérez' },
                { label: 'WhatsApp *',           name: 'phone',  type: 'tel',   placeholder: '5491123456789' },
              ].map(f => (
                <FormField key={f.name} {...f} value={form[f.name]} onChange={handleChange} />
              ))}
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Vehículo / Modelo *" name="model" type="text"
                           placeholder="Toyota Corolla" value={form.model} onChange={handleChange} />
                <FormField label="Placa *" name="plate" type="text"
                           placeholder="AB 123 CD" value={form.plate} onChange={handleChange}
                           extra="uppercase font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo / Falla
                </label>
                <textarea name="description" rows={2} value={form.description} onChange={handleChange}
                  placeholder="Ej: Ruido en frenos..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800
                             rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100
                             focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mecánico Asignado
                </label>
                <select name="mechanic" value={form.mechanic} onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800
                             rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100
                             focus:outline-none focus:border-amber-500">
                  {mechanics.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4
                           rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
                <i className="fa-solid fa-plus-circle text-lg" />
                Registrar e Iniciar Seguimiento
              </button>
            </form>
          </div>

          {/* ── Mechanic management ── */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200
                          dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="bg-amber-500 text-slate-950 p-2.5 rounded-2xl">
                <i className="fa-solid fa-users-gear text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Equipo de Mecánicos</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mechanics.length} mecánico{mechanics.length !== 1 ? 's' : ''} registrado{mechanics.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Mechanic list */}
            <div className="space-y-2">
              {mechanics.map(name => {
                const activeCars = cars.filter(c => c.mechanic === name && c.status !== 'listo').length
                const color = mechanicColor(name, mechanics)
                const isConfirming = confirmDelete === name

                return (
                  <div key={name}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition
                      ${isConfirming
                        ? 'border-red-500/60 bg-red-500/5'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}>

                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-9 h-9 ${color} rounded-full flex items-center justify-center
                                       text-white text-xs font-black flex-shrink-0`}>
                        {initials(name)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{name}</p>
                        <p className="text-[11px] text-slate-400">
                          {activeCars > 0
                            ? <span className="text-amber-500 font-semibold">{activeCars} auto(s) activo(s)</span>
                            : 'Sin autos activos'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isConfirming ? (
                      <button
                        onClick={() => setConfirmDelete(name)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10
                                   rounded-xl transition"
                        title="Eliminar mecánico"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400 font-bold">¿Confirmar?</span>
                        <button
                          onClick={() => handleRemoveMechanic(name)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white
                                     rounded-xl text-xs font-black transition"
                        >
                          Sí, eliminar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700
                                     dark:text-slate-300 rounded-xl text-xs font-bold transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add mechanic form */}
            <form onSubmit={handleAddMechanic} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newMechName}
                onChange={e => setNewMechName(e.target.value)}
                placeholder="Nombre del nuevo mecánico"
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800
                           rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100
                           focus:outline-none focus:border-amber-500"
              />
              <button type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black
                           px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5 flex-shrink-0">
                <i className="fa-solid fa-plus" />
                Agregar
              </button>
            </form>
          </div>

        </div>

        {/* ── RIGHT: Vehicle table ─────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200
                          dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-amber-500" />
                Control Global de Vehículos
              </h3>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                               px-2.5 py-1 rounded-lg">
                En Tiempo Real
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400
                                 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Vehículo / Placa</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Mecánico</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Cotiz.</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                  {cars.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <i className="fa-solid fa-car text-3xl block mb-2 opacity-30" />
                        Sin vehículos en taller.
                      </td>
                    </tr>
                  ) : cars.map(car => {
                    const stageObj  = STATUS_LABELS.find(s => s.id === car.status) || STATUS_LABELS[0]
                    const carQuotes = quotes.filter(q => q.car_id === car.id)
                    const pending   = carQuotes.filter(q => q.status === 'pending').length
                    const clientLink = `${window.location.href.split('#')[0]}#/cliente/${car.token}`
                    const waMsg = encodeURIComponent(
                      `Hola ${car.client}, podés ver el estado de tu ${car.model} aquí: ${clientLink}`
                    )
                    const waPhone = car.phone.replace(/\D/g, '')
                    const mechColor = mechanicColor(car.mechanic, mechanics)

                    return (
                      <tr key={car.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-800 dark:text-slate-100">{car.model}</div>
                          <span className="font-mono text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-black">
                            {car.plate}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-700 dark:text-slate-200">{car.client}</div>
                          <div className="text-xs text-slate-400 font-mono">{car.phone}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 ${mechColor} rounded-full flex items-center
                                             justify-center text-white text-[10px] font-black flex-shrink-0`}>
                              {initials(car.mechanic)}
                            </div>
                            <span className="font-semibold text-slate-600 dark:text-slate-300 text-xs">
                              {car.mechanic}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                                           rounded-xl text-xs font-bold ${stageObj.color}`}>
                            <i className={`fa-solid ${stageObj.icon}`} />
                            {stageObj.short}
                          </span>
                        </td>
                        <td className="p-3">
                          {carQuotes.length > 0 ? (
                            <div>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                {carQuotes.length} total
                              </span>
                              {pending > 0 && (
                                <span className="block text-xs font-bold text-amber-500 animate-pulse">
                                  {pending} pendiente{pending > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Ninguna</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-center">
                            <a href={`https://wa.me/${waPhone}?text=${waMsg}`}
                               target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400
                                          text-slate-950 px-2.5 py-1.5 rounded-xl font-black text-xs
                                          shadow transition active:opacity-80">
                              <i className="fa-brands fa-whatsapp text-sm" />
                              WA
                            </a>
                            <button onClick={() => onViewClient(car.token)}
                              className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800
                                         border border-slate-200 dark:border-slate-700
                                         text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-xl
                                         font-bold text-xs transition active:opacity-80">
                              <i className="fa-solid fa-eye text-xs" />
                              Ver
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function FormField({ label, name, type, placeholder, value, onChange, extra = '' }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input
        type={type} name={name} placeholder={placeholder}
        value={value} onChange={onChange}
        className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800
                    rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100
                    focus:outline-none focus:border-amber-500 ${extra}`}
        style={extra.includes('uppercase') ? { textTransform: 'uppercase' } : {}}
      />
    </div>
  )
}
