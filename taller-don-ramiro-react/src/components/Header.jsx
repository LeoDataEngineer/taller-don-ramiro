export default function Header({ theme, onToggleTheme, view, onNavigate }) {
  const tabs = [
    { id: 'home',     icon: 'fa-gauge-high',            label: 'Inicio',   color: 'text-amber-500' },
    { id: 'mechanic', icon: 'fa-hand-sparkles',          label: 'Mecánico', color: 'text-amber-500' },
    { id: 'admin',    icon: 'fa-user-gear',              label: 'Admin',    color: 'text-blue-500'  },
    { id: 'client-demo', icon: 'fa-mobile-screen-button', label: 'Cliente',  color: 'text-emerald-500' },
  ]

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800
                       sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="bg-amber-500 text-slate-950 p-2.5 rounded-2xl font-black text-xl
                          flex items-center justify-center w-11 h-11 shadow-lg shadow-amber-500/20">
            <i className="fa-solid fa-wrench" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-amber-500 leading-none tracking-tight font-tech">
              DON RAMIRO
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              Taller Mecánico & Control Digital
            </p>
          </div>
        </div>

        {/* Nav tabs + theme */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">

          <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-950 p-1
                          rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold
                          w-full sm:w-auto">
            {tabs.map(tab => {
              const isActive = view === tab.id ||
                (tab.id === 'client-demo' && view === 'client')
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`px-2.5 sm:px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition
                    ${isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                >
                  <i className={`fa-solid ${tab.icon} ${isActive ? '' : tab.color}`} />
                  <span className={tab.id === 'home' ? 'hidden md:inline' : ''}>{tab.label}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300
                       rounded-xl hover:bg-amber-500 hover:text-slate-950 transition"
            title="Cambiar Tema"
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>
        </div>

      </div>
    </header>
  )
}
