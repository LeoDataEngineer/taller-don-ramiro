import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null) // { title, message }

  const showToast = useCallback((title, message = '') => {
    setToast({ title, message })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`fixed top-20 right-4 z-50 max-w-sm w-full transition-transform duration-300 ease-out pointer-events-none
                       ${toast ? 'translate-x-0' : 'translate-x-[120%]'}`}>
        <div className="bg-white dark:bg-slate-800 border-l-4 border-amber-500 border border-slate-200
                        dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-r-2xl shadow-2xl
                        flex items-center gap-3">
          <i className="fa-solid fa-circle-info text-amber-500 text-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{toast?.title}</p>
            {toast?.message && (
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">{toast.message}</p>
            )}
          </div>
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
