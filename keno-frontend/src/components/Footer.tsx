export default function Footer() {
  return (
    <div className="flex items-center justify-between text-xs text-slate-400">
      <span>© {new Date().getFullYear()} Next Games</span>
      <div className="flex items-center gap-3">
        <a className="transition-colors hover:text-slate-200" href="#">Terms</a>
        <a className="transition-colors hover:text-slate-200" href="#">Privacy</a>
        <a className="transition-colors hover:text-slate-200" href="#">Help</a>
      </div>
    </div>
  )
}

