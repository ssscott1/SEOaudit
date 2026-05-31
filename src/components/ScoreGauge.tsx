'use client'

interface ScoreGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
  const sizes = {
    sm: { svg: 120, cx: 60, cy: 60, r: 50, stroke: 8, fontSize: 28, labelSize: 12 },
    md: { svg: 200, cx: 100, cy: 100, r: 80, stroke: 12, fontSize: 48, labelSize: 14 },
    lg: { svg: 280, cx: 140, cy: 140, r: 120, stroke: 16, fontSize: 64, labelSize: 16 },
  }

  const s = sizes[size]
  const circumference = 2 * Math.PI * s.r
  const progress = (score / 100) * circumference
  const dashOffset = circumference - progress

  const getColor = (score: number) => {
    if (score >= 80) return '#10B981' // green
    if (score >= 60) return '#F59E0B' // yellow
    if (score >= 40) return '#F97316' // orange
    return '#EF4444' // red
  }

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  const color = getColor(score)
  const grade = getGrade(score)

  return (
    <div className="flex flex-col items-center">
      <svg width={s.svg} height={s.svg} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="none"
          stroke="#334155"
          strokeWidth={s.stroke}
        />
        {/* Progress circle */}
        <circle
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="none"
          stroke={color}
          strokeWidth={s.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
        {/* Center text */}
        <text
          x={s.cx}
          y={s.cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="transform rotate-90"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${s.cx}px ${s.cy}px`,
            fill: color,
            fontSize: s.fontSize,
            fontWeight: 'bold',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
        >
          {score}
        </text>
        <text
          x={s.cx}
          y={s.cy + s.fontSize / 2 + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${s.cx}px ${s.cy}px`,
            fill: '#94A3B8',
            fontSize: s.labelSize,
            fontFamily: 'Inter, Arial, sans-serif',
          }}
        >
          / 100
        </text>
      </svg>
      <div
        className="mt-2 text-sm font-bold px-3 py-1 rounded-full"
        style={{ backgroundColor: `${color}20`, color }}
      >
        Grade: {grade}
      </div>
    </div>
  )
}
