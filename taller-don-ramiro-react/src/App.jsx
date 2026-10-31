import { useState, useEffect } from 'react'
import { TallerProvider } from './store/TallerContext'
import { ToastProvider } from './components/Toast'
import { useTallerStore } from './store/TallerContext'
import Header from './components/Header'
import Dashboard from './views/Dashboard'
import MechanicView from './views/MechanicView'
import AdminView from './views/AdminView'
import ClientView from './views/ClientView'

function AppContent() {
  const { loading, error } = useTallerStore()
  const [theme, setTheme]             = useState('dark')
  const [view,  setView]              = useState('home')
  const [clientToken, setClientToken] = useState(null)

  // Detect #/cliente/TOKEN in URL
  useEffect(() => {
    function checkHash() {
      const match = window.location.hash.match(/^#\/cliente\/(.+)$/)
      if (match) {
        setClientToken(match[1])
        setView('client-link')
      }
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function navigate(target) {
    setView(target)
    window.scrollTo(0, 0)
    if (window.location.hash && target !== 'client-link') {
      history.pushState('', document.title, window.location.pathname)
    }
  }

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  // Client view via direct link — no header
  if (view === 'client-link') {
    return (
      <div className="bg-slate-100 dark:bg-slate-950 min-h-screen">
        <ClientView token={clientToken} onBack={null} />
      </div>
    )
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200">
      <Header theme={theme} onToggleTheme={toggleTheme} view={view} onNavigate={navigate} />

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-slate-300 dark:border-slate-700 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Conectando con Supabase...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto w-full px-4 mt-4">
          <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl text-red-400 text-sm font-semibold flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation" />
            Error de conexión: {error}
          </div>
        </div>
      )}

      {!loading && (
        <main className="flex-1 flex flex-col">
          {view === 'home'     && <Dashboard onNavigate={navigate} />}
          {view === 'mechanic' && <MechanicView />}
          {view === 'admin'    && (
            <AdminView onViewClient={(token) => { setClientToken(token); navigate('client') }} />
          )}
          {/* client-demo: lista de clientes sin token preseleccionado */}
          {view === 'client-demo' && <ClientView token={null} onBack={() => navigate('home')} />}
          {/* client: viene desde admin "Ver", abre detalle directo */}
          {view === 'client'   && <ClientView token={clientToken} onBack={() => navigate('admin')} />}
        </main>
      )}
    </div>
  )
}

export default function App() {
  return (
    <TallerProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </TallerProvider>
  )
}
