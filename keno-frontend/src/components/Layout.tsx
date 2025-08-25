import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

type LayoutProps = {
  children: ReactNode
  balance?: number
}

export default function Layout({ children, balance = 1000 }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <header className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <Header balance={balance} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        {children}
      </main>
      <footer className="border-t border-transparent">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Footer />
        </div>
      </footer>
    </div>
  )
}

