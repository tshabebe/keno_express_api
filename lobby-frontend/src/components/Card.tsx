import type { ReactNode } from 'react'

export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
	return (
		<div className={`rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-xl backdrop-blur-xl ${className}`}>
			{children}
		</div>
	)
}
