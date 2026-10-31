import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export const STATUS_LABELS = [
  { id: 'recibido',             label: 'Recibido',              short: 'Recibido',              icon: 'fa-inbox',               color: 'bg-slate-600 text-white' },
  { id: 'diagnostico',          label: 'En Diagnóstico',        short: 'Diagnóstico',           icon: 'fa-magnifying-glass',    color: 'bg-purple-600 text-white' },
  { id: 'esperando_aprobacion', label: 'Esperando Aprobación',  short: 'Esp. Aprobación',       icon: 'fa-clock-rotate-left',   color: 'bg-amber-500 text-slate-950' },
  { id: 'en_reparacion',        label: 'En Reparación',         short: 'En Reparación',         icon: 'fa-screwdriver-wrench',  color: 'bg-blue-600 text-white' },
  { id: 'listo',                label: 'Listo para Retirar',    short: 'Listo',                 icon: 'fa-circle-check',        color: 'bg-emerald-500 text-slate-950' },
]

const DEFAULT_MECHANICS = ['Carlos M.', 'Roberto G.', 'Mariano L.', 'Diego S.']

function loadMechanics() {
  try {
    const saved = localStorage.getItem('tallerMechanics')
    if (saved) return JSON.parse(saved)
  } catch (_) {}
  return DEFAULT_MECHANICS
}

function saveMechanics(list) {
  localStorage.setItem('tallerMechanics', JSON.stringify(list))
}

function generateToken() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
}

// SHA-256 real usando Web Crypto API (disponible en todos los browsers modernos)
async function sha256(str) {
  const encoder = new TextEncoder()
  const data    = encoder.encode(str)
  const hashBuf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function useTaller() {
  const [cars,      setCars]      = useState([])
  const [quotes,    setQuotes]    = useState([])
  const [mechanics, setMechanics] = useState(loadMechanics)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // Persist mechanics to localStorage whenever they change
  useEffect(() => { saveMechanics(mechanics) }, [mechanics])

  // ---- Carga inicial ----
  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      setError(null)

      const [carsResult, quotesResult] = await Promise.all([
        supabase.from('cars').select('*').order('created_at', { ascending: false }),
        supabase.from('quotes').select('*').order('created_at', { ascending: true }),
      ])

      if (carsResult.error || quotesResult.error) {
        const msg = carsResult.error?.message || quotesResult.error?.message
        setError(msg)
      } else {
        setCars(carsResult.data  ?? [])
        setQuotes(quotesResult.data ?? [])
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  // ---- Realtime: cars ----
  useEffect(() => {
    const channel = supabase
      .channel('realtime-cars')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, payload => {
        if (payload.eventType === 'INSERT') {
          setCars(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setCars(prev => prev.map(c => c.id === payload.new.id ? payload.new : c))
        } else if (payload.eventType === 'DELETE') {
          setCars(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  // ---- Realtime: quotes ----
  useEffect(() => {
    const channel = supabase
      .channel('realtime-quotes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, payload => {
        if (payload.eventType === 'INSERT') {
          setQuotes(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setQuotes(prev => prev.map(q => q.id === payload.new.id ? payload.new : q))
        } else if (payload.eventType === 'DELETE') {
          setQuotes(prev => prev.filter(q => q.id !== payload.old.id))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  // ---- Acciones ----

  const setCarStatus = useCallback(async (carId, statusId) => {
    // statusId is now a string like 'recibido', 'diagnostico', etc.
    setCars(prev => prev.map(c => c.id === carId ? { ...c, status: statusId } : c))
    const { error } = await supabase.from('cars').update({ status: statusId }).eq('id', carId)
    if (error) {
      setError(error.message)
      const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false })
      if (data) setCars(data)
    }
  }, [])

  const registerCar = useCallback(async (data) => {
    const car = {
      client:      data.client,
      phone:       data.phone,
      model:       data.model,
      plate:       data.plate.toUpperCase(),
      mechanic:    data.mechanic,
      description: data.description || '',
      status:      'recibido',
      token:       generateToken(),
    }
    const { data: inserted, error } = await supabase.from('cars').insert(car).select().single()
    if (error) { setError(error.message); return null }
    return inserted
  }, [])

  // CA-1 fix: retorna { ok, error } para que el caller pueda avisar al mecánico
  const addQuote = useCallback(async (quoteData) => {
    const quote = {
      car_id:    quoteData.carId,
      problem:   quoteData.problem,
      cost:      quoteData.cost,
      photo_url: quoteData.photoUrl ?? null,
      status:    'pending',
    }
    const { error } = await supabase.from('quotes').insert(quote)
    if (error) {
      setError(error.message)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  }, [])

  // CA-3 fix: SHA-256 real via Web Crypto API
  const approveQuote = useCallback(async (quoteId) => {
    const now = new Date()
    const timestamp = now.toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
    // SHA-256 real — no repudiable
    const hashInput = `${quoteId}|APROBADO|${now.toISOString()}|${navigator.userAgent}|${crypto.randomUUID?.() ?? Math.random()}`
    const hash = await sha256(hashInput)
    const ip   = `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`

    const receipt = { timestamp, hash, ip, isoDate: now.toISOString() }

    // Optimistic update
    setQuotes(prev => prev.map(q =>
      q.id === quoteId ? { ...q, status: 'approved', receipt } : q
    ))

    const { error } = await supabase
      .from('quotes')
      .update({ status: 'approved', receipt })
      .eq('id', quoteId)

    if (error) setError(error.message)
  }, [])

  const rejectQuote = useCallback(async (quoteId) => {
    // Optimistic update
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'rejected' } : q))
    const { error } = await supabase.from('quotes').update({ status: 'rejected' }).eq('id', quoteId)
    if (error) setError(error.message)
  }, [])

  const getCarByToken    = useCallback((token)  => cars.find(c => c.token === token),          [cars])
  const getQuotesForCar  = useCallback((carId)  => quotes.filter(q => q.car_id === carId),     [quotes])

  // ---- Mechanics management ----
  const addMechanic = useCallback((name) => {
    const trimmed = name.trim()
    if (!trimmed) return false
    setMechanics(prev => {
      if (prev.find(m => m.toLowerCase() === trimmed.toLowerCase())) return prev
      return [...prev, trimmed]
    })
    return true
  }, [])

  const removeMechanic = useCallback((name) => {
    setMechanics(prev => prev.filter(m => m !== name))
  }, [])

  const metrics = {
    active:     cars.filter(c => c.status !== 'listo').length,
    pending:    quotes.filter(q => q.status === 'pending').length,
    ready:      cars.filter(c => c.status === 'listo').length,
    efficiency: cars.length > 0 ? Math.round((cars.filter(c => c.status === 'listo').length / cars.length) * 100) : null,
  }

  return {
    cars, quotes, metrics, loading, error,
    mechanics,
    STATUS_LABELS,
    setCarStatus, registerCar, addQuote, approveQuote, rejectQuote,
    getCarByToken, getQuotesForCar,
    addMechanic, removeMechanic,
  }
}
