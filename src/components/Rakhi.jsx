import { useMemo } from 'react'
import { rakhiSpec } from '../lib/seed'

// Procedural SVG rakhi. `seed` is any string — a wish's name+title, a variant
// name, anything. Same string always draws the same rakhi; different strings
// never draw the same one.
//
// The SVG matches the 3D Medallion in Rakhi3D so the thali preview and the
// tie-ceremony model look like the same object:
//   · ring at r=21 from centre (maps to 1.05 in 3D, ×20)
//   · petals centred at r=30 (maps to 1.5 in 3D, ×20)
//   · beads sit ON the ring at r=21
//   · core disc + kumkum dot at centre

export default function Rakhi({ seed = 'rakhi', size = 150, threads = true, className = '' }) {
  const s = useMemo(() => rakhiSpec(seed), [seed])

  const CX = 50
  const CY = 50
  const RING_R = 21 // matches 1.05 in 3D
  const PETAL_R = 30 // matches 1.5 in 3D

  const petals = Array.from({ length: s.petals }, (_, i) => (i / s.petals) * Math.PI * 2)
  const beads = Array.from({ length: s.beads }, (_, i) => (i / s.beads) * Math.PI * 2)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      {threads && (
        <g stroke={s.ring} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M 36 62 C 18 74, 14 84, 10 98" />
          <path d="M 64 62 C 82 74, 86 84, 90 98" />
          <circle cx="10" cy="98" r="2.6" fill="#FFC727" stroke="none" />
          <circle cx="90" cy="98" r="2.6" fill="#FFC727" stroke="none" />
        </g>
      )}

      <g transform={`rotate(${s.rot.toFixed(1)} ${CX} ${CY})`}>
        {/* petals — elongated teardrops radiating outward, matching the 3D
            spheres that are scaled [0.55, 0.15, 0.05]. rx is the long axis
            (along the radius) and ry is the narrow cross-section. */}
        {petals.map((a, i) => {
          const x = CX + Math.cos(a) * PETAL_R
          const y = CY + Math.sin(a) * PETAL_R
          return (
            <ellipse
              key={i}
              cx={x.toFixed(1)}
              cy={y.toFixed(1)}
              rx="11"
              ry="3"
              transform={`rotate(${((a * 180) / Math.PI).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`}
              fill={s.ring}
              opacity="0.7"
            />
          )
        })}

        {/* kumkum ring — the torus in 3D */}
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          stroke={s.ring}
          strokeWidth="3.6"
          opacity="0.85"
        />

        {/* brass beads ON the ring — instanced spheres in 3D */}
        {beads.map((a, i) => (
          <circle
            key={i}
            cx={(CX + Math.cos(a) * RING_R).toFixed(1)}
            cy={(CY + Math.sin(a) * RING_R).toFixed(1)}
            r="2.2"
            fill="#FFC727"
          />
        ))}

        {/* core disc — the flat sphere in 3D (scale [1,1,0.34]) */}
        <circle cx={CX} cy={CY} r="7.2" fill={s.core} />

        {/* kumkum dot at centre — the tiny emissive sphere */}
        <circle cx={CX} cy={CY} r="2.4" fill={s.ring} />
      </g>
    </svg>
  )
}

// The three rakhis offered in the tie ceremony — named after what they evoke,
// each still generated from its own seed.
export const RAKHI_VARIANTS = ['mogra', 'kesari', 'bandhani']
