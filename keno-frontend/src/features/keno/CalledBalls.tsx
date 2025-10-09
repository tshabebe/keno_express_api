type CalledBallsProps = {
  numbers: number[]
}

export default function CalledBalls({ numbers }: CalledBallsProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-xl backdrop-blur-xl p-3">
      {numbers.map((n, idx) => (
        <div
          key={`${n}-${idx}`}
          className="called-ball animate-pop-in"
          style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}
          aria-label={`Called ${n}`}
        >
          <span>{n}</span>
        </div>
      ))}
    </div>
  )
}


