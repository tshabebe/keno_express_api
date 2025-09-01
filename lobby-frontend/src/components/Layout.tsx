import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0b0f1a_100%)] text-slate-100 antialiased flex flex-col">
      <header className="relative">
        <div aria-hidden className="pointer-events-none absolute -top-24 right-10 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/20 to-emerald-400/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/15 to-indigo-500/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <Header />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 flex-1">
        {children}
      </main>
      <footer className="mt-auto border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Footer />
        </div>
      </footer>
    </div>
  )
}

