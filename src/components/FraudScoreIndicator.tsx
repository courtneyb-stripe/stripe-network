/**
 * FraudScoreIndicator — Figma 1966:24804 (Stripe Network H1 '26).
 * Semi-circular gauge with orange-to-red gradient, indicator dot at score, value and label.
 */

type FraudScoreIndicatorProps = {
  /** Score 0–100; default 85. */
  score?: number
}

const RADIUS = 33
const CENTER_X = 43
const CENTER_Y = 40
const SVG_WIDTH = 86
const SVG_HEIGHT = 56

/** Score 0 = left end of arc (180°), 100 = right end (0°). Returns angle in degrees. */
function scoreToAngle(score: number): number {
  const clamped = Math.max(0, Math.min(100, score))
  return 180 - (clamped / 100) * 180
}

/** Angle in degrees to x,y on the arc (bottom semicircle, center at CENTER_X, CENTER_Y). */
function angleToPoint(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER_X + RADIUS * Math.cos(rad),
    y: CENTER_Y - RADIUS * Math.sin(rad),
  }
}

export default function FraudScoreIndicator({ score = 85 }: FraudScoreIndicatorProps) {
  const angle = scoreToAngle(score)
  const dotPos = angleToPoint(angle)
  // Arc path: bottom semicircle from left (180°) to right (0°). SVG arc: A rx ry x-axis-rotation large-arc sweep x y.
  const left = angleToPoint(180)
  const right = angleToPoint(0)
  const arcPath = `M ${left.x} ${left.y} A ${RADIUS} ${RADIUS} 0 0 1 ${right.x} ${right.y}`

  return (
    <div
      className="flex flex-col items-center pt-1"
      data-name="Fraud score indicator"
      data-node-id="1966:24804"
    >
      <div className="flex flex-col items-center gap-0.5" style={{ width: SVG_WIDTH }}>
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id="fraud-score-arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-feedback-attention-on, #b13600)" />
              <stop offset="100%" stopColor="var(--color-feedback-critical-on, #c0123c)" />
            </linearGradient>
          </defs>
          {/* Semi-circular arc (bottom half) */}
          <path
            d={arcPath}
            fill="none"
            stroke="url(#fraud-score-arc-gradient)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* Indicator dot at score position */}
          <circle
            cx={dotPos.x}
            cy={dotPos.y}
            r={5}
            fill="var(--color-feedback-critical-on)"
          />
          {/* Score number centered below arc */}
          <text
            x={CENTER_X}
            y={48}
            textAnchor="middle"
            style={{
              fill: 'var(--color-feedback-critical-on)',
              fontFamily: 'inherit',
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: 28,
              letterSpacing: '-0.15px',
            }}
          >
            {score}
          </text>
        </svg>
        <p className="font-label-small text-subdued leading-4 tracking-[-0.02em] whitespace-nowrap">
          Fraud score
        </p>
      </div>
    </div>
  )
}
