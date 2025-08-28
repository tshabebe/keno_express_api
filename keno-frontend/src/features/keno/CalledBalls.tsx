type CalledBallsProps = {
  numbers: number[]
}

export default function CalledBalls({ numbers }: CalledBallsProps) {
  return (
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
  )
}


