// Hand-drawn SVG rakhi — mandala medallion with trailing threads.
// Three variants so sisters can pick "their" rakhi in the tie ceremony.
const VARIANTS = {
  surya: { outer: '#7b1e26', mid: '#ff9933', inner: '#d4a017', bead: '#fff3df' },
  kamal: { outer: '#a03a63', mid: '#f6a5c0', inner: '#7b1e26', bead: '#ffe9f1' },
  mor: { outer: '#1f5f5b', mid: '#3aa17e', inner: '#d4a017', bead: '#eafff5' },
}

export default function Rakhi({ variant = 'surya', size = 150, threads = true, className = '' }) {
  const c = VARIANTS[variant] || VARIANTS.surya
  const petals = Array.from({ length: 12 }, (_, i) => i * 30)

  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -60 120 120"
      className={className}
      aria-hidden="true"
    >
      {threads && (
        <g stroke={c.outer} strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M -18 6 C -46 14, -52 26, -57 42" opacity="0.9" />
          <path d="M 18 6 C 46 14, 52 26, 57 42" opacity="0.9" />
          <circle cx="-57" cy="45" r="3" fill={c.mid} stroke="none" />
          <circle cx="57" cy="45" r="3" fill={c.mid} stroke="none" />
        </g>
      )}
      {petals.map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-24"
          rx="7.5"
          ry="14"
          fill={c.mid}
          stroke={c.outer}
          strokeWidth="1.4"
          transform={`rotate(${deg})`}
          opacity="0.95"
        />
      ))}
      {petals.map((deg) => (
        <circle
          key={deg}
          cx="0"
          cy="-33"
          r="2.2"
          fill={c.bead}
          transform={`rotate(${deg + 15})`}
        />
      ))}
      <circle r="17" fill={c.inner} stroke={c.outer} strokeWidth="2" />
      <circle r="9" fill={c.outer} />
      <circle r="3.4" fill={c.bead} />
    </svg>
  )
}

export const RAKHI_VARIANTS = Object.keys(VARIANTS)
