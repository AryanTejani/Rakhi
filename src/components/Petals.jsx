import { useEffect, useRef } from 'react'

const COLORS = ['#ff9933', '#ffb75e', '#f6d7ce', '#e8843c', '#ffd9a0']

// Marigold petals drifting down the hero on a canvas.
export default function Petals({ count = 26 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf
    let W, H

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const petals = Array.from({ length: count }, () => ({
      x: Math.random() * 1,
      y: Math.random() * -1.2,
      r: 3 + Math.random() * 5,
      speed: 0.0006 + Math.random() * 0.0011,
      sway: 20 + Math.random() * 42,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      spin: Math.random() * Math.PI,
    }))

    const tick = (t) => {
      ctx.clearRect(0, 0, W, H)
      for (const p of petals) {
        p.y += p.speed
        if (p.y > 1.1) {
          p.y = -0.08
          p.x = Math.random()
        }
        const x = p.x * W + Math.sin(t / 1600 + p.phase) * p.sway
        const y = p.y * H
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(t / 900 + p.spin)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.85
        ctx.beginPath()
        ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [count])

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
