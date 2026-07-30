import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { gsap } from 'gsap'
import Rakhi, { RAKHI_VARIANTS } from './Rakhi'
import { chime } from '../lib/audio'

const spring = { type: 'spring', stiffness: 300, damping: 20 }

export default function TieRakhi() {
  const [chosen, setChosen] = useState(null)
  const [tied, setTied] = useState(false)
  const threadRef = useRef(null)

  const tie = () => {
    if (tied) return
    setTied(true)
    const p = threadRef.current
    const len = p.getTotalLength()
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 })
    gsap.to(p, {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: 'power2.inOut',
      onComplete: () => {
        chime()
        confetti({
          particleCount: 130,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#ff9933', '#d4a017', '#7b1e26', '#f6d7ce', '#4e6b2f'],
        })
      },
    })
  }

  return (
    <section
      className="px-5 py-20 text-center md:py-28"
      style={{ background: 'linear-gradient(180deg, #f4ecd9, var(--color-cream))' }}
    >
      <h2
        className="text-[clamp(1.7rem,6vw,2.5rem)] font-semibold text-maroon"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Tie Your Rakhi
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sand">
        Pick your rakhi, then tap the glowing spot on the wrist — this thread is yours.
      </p>

      {/* choose */}
      <div className="mt-8 flex justify-center gap-4">
        {RAKHI_VARIANTS.map((v) => (
          <motion.button
            key={v}
            whileTap={{ scale: 0.85 }}
            transition={spring}
            onClick={() => {
              setChosen(v)
              setTied(false)
            }}
            className={`rounded-2xl bg-white p-3 shadow-md transition-shadow ${
              chosen === v ? 'shadow-[0_0_0_3px_#d4a017]' : ''
            }`}
            aria-label={`choose rakhi ${v}`}
          >
            <Rakhi variant={v} size={72} threads={false} />
          </motion.button>
        ))}
      </div>

      {/* wrist */}
      {chosen && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="relative mx-auto mt-8 w-full max-w-md"
        >
          <svg viewBox="0 0 400 240" className="w-full">
            {/* forearm */}
            <path
              d="M 40 100 C 120 84, 300 84, 400 96 L 400 190 C 300 202, 120 202, 40 186 C 20 170, 20 116, 40 100 Z"
              fill="#e8b88f"
            />
            <path
              d="M 40 100 C 120 84, 300 84, 400 96 L 400 110 C 300 98, 120 98, 40 114 Z"
              fill="#dfa87c"
              opacity="0.6"
            />
            {/* tie thread — drawn on tap */}
            <path
              ref={threadRef}
              d="M 200 88 C 236 96, 236 190, 200 198 C 164 190, 164 96, 200 88"
              fill="none"
              stroke="#7b1e26"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0"
            />
            {tied && (
              <g transform="translate(200 143) scale(0.55)">
                <Rakhi variant={chosen} size={120} threads={false} />
              </g>
            )}
          </svg>

          {!tied && (
            <motion.button
              onClick={tie}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold bg-marigold/40"
              aria-label="tap to tie the rakhi"
            />
          )}
        </motion.div>
      )}

      {tied && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="mx-auto mt-5 max-w-sm text-lg italic text-[#7c5c46]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The thread is tied. The promise is forever. 💛
        </motion.p>
      )}
    </section>
  )
}
