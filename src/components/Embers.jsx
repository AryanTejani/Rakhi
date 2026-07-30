import { useEffect, useRef } from 'react'

// Rising warm embers for the diya section — visual borrowed from the
// 21st.dev @lepikhinb Sparkles demo (particles over a glowing horizon),
// hand-rolled on canvas to skip the ~80KB tsparticles dependency.
export default function Embers({ intensity = 1 }) {
  const ref = useRef(null)
  const intensityRef = useRef(intensity)
  intensityRef.current = intensity

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf, W, H

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const N = 70
    const embers = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.8,
      speed: 0.0004 + Math.random() * 0.001,
      phase: Math.random() * Math.PI * 2,
      warm: Math.random(),
    }))

    const tick = (t) => {
      ctx.clearRect(0, 0, W, H)
      const boost = intensityRef.current
      const active = Math.floor(N * (0.4 + 0.6 * boost))
      for (let i = 0; i < active; i++) {
        const e = embers[i]
        e.y -= e.speed * boost
        if (e.y < -0.05) {
          e.y = 1.05
          e.x = Math.random()
        }
        const x = e.x * W + Math.sin(t / 1300 + e.phase) * 14
        const y = e.y * H
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t / 700 + e.phase))
        ctx.beginPath()
        ctx.fillStyle = e.warm > 0.5 ? '#ffb340' : '#ffd9a0'
        ctx.globalAlpha = twinkle * (0.25 + 0.5 * boost)
        ctx.arc(x, y, e.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
