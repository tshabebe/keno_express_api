type CalledBallsProps = {
  numbers: number[]
  countdownMs?: number
}

export default function CalledBalls({ numbers, countdownMs }: CalledBallsProps) {
  return (
    <div className="flex flex-col gap-2">
      {typeof countdownMs === 'number' ? (
        <div className="text-xs text-slate-300/90">Next round in {Math.max(0, Math.ceil(countdownMs / 1000))}s</div>
      ) : null}
      <div className="flex flex-wrap gap-2">
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
    </div>
  )
}


