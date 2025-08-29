import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message?: string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) }
  }
  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('UI error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 p-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
            <div className="text-lg font-semibold">Something went wrong</div>
            {this.state.message ? <div className="mt-2 text-sm text-slate-300">{this.state.message}</div> : null}
            <div className="mt-3 text-xs text-slate-400">Check console for details.</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}


