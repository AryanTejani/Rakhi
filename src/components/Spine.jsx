import { useEffect, useRef } from 'react'

// One thread runs the whole page and draws itself as you scroll. Structural,
// not decorative — it is the subject of the site, used as the scroll indicator.
export default function Spine() {
  const path = useRef(null)

  useEffect(() => {
    const p = path.current
    if (!p) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      p.style.strokeDashoffset = 0
      return
    }

    const LEN = 1000
    p.style.strokeDasharray = LEN
    p.style.strokeDashoffset = LEN

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const prog = max > 0 ? window.scrollY / max : 0
        p.style.strokeDashoffset = LEN * (1 - Math.min(1, prog))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <svg
      className="pointer-events-none fixed left-4 top-0 z-30 h-screen w-1 md:left-8"
      viewBox="0 0 2 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* track needs more than the old 0.12 opacity — that was gold-on-indigo
          (high contrast even faint); gold-on-#F5F5F5 needs more presence */}
      <line x1="1" y1="0" x2="1" y2="1000" stroke="#FFC727" strokeWidth="2" opacity="0.35" />
      <line
        ref={path}
        x1="1"
        y1="0"
        x2="1"
        y2="1000"
        stroke="#DB3F3C"
        strokeWidth="2"
        opacity="0.8"
      />
    </svg>
  )
}
