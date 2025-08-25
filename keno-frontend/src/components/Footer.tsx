export default function Footer() {
  return (
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>© {new Date().getFullYear()} Keno</span>
      <div className="flex items-center gap-3">
        <a className="hover:text-slate-300" href="#">Terms</a>
        <a className="hover:text-slate-300" href="#">Privacy</a>
        <a className="hover:text-slate-300" href="#">Help</a>
      </div>
    </div>
  )
}

