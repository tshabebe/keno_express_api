import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

type LayoutProps = {
	children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 antialiased flex flex-col">
			<header className="relative">
				<div aria-hidden className="glow-emerald -top-20 -right-24 h-56 w-56"></div>
				<div aria-hidden className="glow-indigo -bottom-24 -left-24 h-56 w-56"></div>
				<div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
					<Header />
				</div>
			</header>
			<main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 flex-1">
				{children}
			</main>
			<footer className="mt-auto border-t border-white/10">
				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
					<Footer />
				</div>
			</footer>
		</div>
	)
}

