import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

// Adapted from MagicUI "Sparkles Text" (21st.dev @dillionverma/sparkles-text) —
// same sparkle lifecycle engine, restyled to festival gold and made an overlay
// so it wraps any element instead of owning the text.

const COLORS = ['#ffd700', '#ff9933', '#fff3df', '#d4a017']

const STAR_PATH =
  'M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z'

export default function SparkleField({ count = 12, className = '' }) {
  const [sparkles, setSparkles] = useState([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const gen = () => ({
      id: `${Math.random()}-${Date.now()}`,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      delay: Math.random() * 2,
      scale: Math.random() * 0.9 + 0.35,
      lifespan: Math.random() * 10 + 5,
    })
    setSparkles(Array.from({ length: count }, gen))
    const iv = setInterval(
      () =>
        setSparkles((cur) =>
          cur.map((s) => (s.lifespan <= 0 ? gen() : { ...s, lifespan: s.lifespan - 0.1 }))
        ),
      100
    )
    return () => clearInterval(iv)
  }, [count])

  return (
    <span className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {sparkles.map((s) => (
        <motion.svg
          key={s.id}
          className="absolute z-20"
          initial={{ opacity: 0, left: s.x, top: s.y }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, s.scale, 0],
            rotate: [75, 120, 150],
          }}
          transition={{ duration: 0.9, repeat: Infinity, delay: s.delay }}
          width="18"
          height="18"
          viewBox="0 0 21 21"
        >
          <path d={STAR_PATH} fill={s.color} />
        </motion.svg>
      ))}
    </span>
  )
}
