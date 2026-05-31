'use client'

interface ScoreGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function ScoreGauge({ score, size = 'lg', showLabel = true }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score))

  const sizeMap = {
    sm: { outer: 80, stroke: 6, fontSize: 'text-2xl', labelSize: 'text-xs' },
    md: { outer: 120, stroke: 8, fontSize: 'text-3xl', labelSize: 'text-sm' },
    lg: { outer: 160, stroke: 10, fontSize: 'text-5xl', labelSize: 'text-base' },
  }

  const { outer, stroke, fontSize, labelSize } = sizeMap[size]
  const radius = (outer - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedScore / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 70) return '#10b981' // emerald
    if (s >= 40) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const getLabel = (s: number) => {
    if (s >= 80) return 'Excellent'
    if (s >= 70) return 'Good'
    if (s >= 50) return 'Needs Work'
    if (s >= 30) return 'Poor'
    return 'Critical'
  }

  const color = getColor(clampedScore)
  const cx = outer / 2
  const cy = outer / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: outer, height: outer }}>
        <svg
          width={outer}
          height={outer}
          className="-rotate-90"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-slate-50 ${fontSize}`}>{clampedScore}</span>
          <span className={`text-slate-400 ${labelSize}`}>/100</span>
        </div>
      </div>
      {showLabel && (
        <span
          className={`font-semibold ${labelSize}`}
          style={{ color }}
        >
          {getLabel(clampedScore)}
        </span>
      )}
    </div>
  )
}
