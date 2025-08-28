import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type Toast = { id: string; message: string; type?: 'success' | 'error' | 'info' };

type ToastContextType = {
  show: (message: string, type?: Toast['type']) => void
  remove: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => remove(id), 4000)
  }, [remove])

  const value = useMemo(() => ({ show, remove }), [show, remove])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed inset-x-0 top-2 z-50 flex flex-col items-center gap-2 px-2">
        {toasts.map((t) => {
          const base = 'rounded-xl px-3 py-2 text-sm shadow-lg backdrop-blur-md border transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2'
          const tone = t.type === 'success'
            ? 'bg-emerald-800/80 text-emerald-50 border-emerald-300/20 shadow-emerald-900/30'
            : t.type === 'error'
              ? 'bg-rose-800/80 text-rose-50 border-rose-300/20 shadow-rose-900/30'
              : 'bg-slate-900/80 text-slate-100 border-white/10 shadow-black/20'
          return (
            <div key={t.id} className={`${base} ${tone}`}>{t.message}</div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}


