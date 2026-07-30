import { useState } from 'react'
import { motion } from 'motion/react'
import { chime } from '../lib/audio'
import Embers from './Embers'

// Diya: unlit until tapped — lighting it is the closing ritual.
function Diya({ lit, onLight }) {
  return (
    <button onClick={onLight} aria-label="light the diya" className="relative outline-none">
      <svg viewBox="0 0 160 120" className="w-40 md:w-48">
        {/* flame */}
        {lit && (
          <g className="flicker" style={{ transformOrigin: '80px 46px' }}>
            <path d="M 80 12 C 92 30, 94 44, 80 54 C 66 44, 68 30, 80 12 Z" fill="#ffb340" />
            <path d="M 80 24 C 87 34, 88 44, 80 50 C 72 44, 73 34, 80 24 Z" fill="#ffe08a" />
          </g>
        )}
        {/* wick */}
        <rect x="78" y="50" width="4" height="10" rx="2" fill="#3a2620" />
        {/* bowl */}
        <path d="M 22 66 C 40 60, 120 60, 138 66 C 134 92, 106 106, 80 106 C 54 106, 26 92, 22 66 Z" fill="#8a3324" />
        <path d="M 22 66 C 40 60, 120 60, 138 66 C 132 74, 104 78, 80 78 C 56 78, 28 74, 22 66 Z" fill="#a54a35" />
        <ellipse cx="80" cy="66" rx="44" ry="6" fill="#5c1f14" opacity="0.65" />
      </svg>
      {!lit && (
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs tracking-wide text-[#d9b894]"
        >
          tap to light
        </motion.span>
      )}
    </button>
  )
}

export default function Blessing() {
  const [lit, setLit] = useState(false)

  const light = () => {
    if (lit) return
    setLit(true)
    chime()
  }

  return (
    <motion.section
      animate={{
        backgroundColor: lit ? '#3a1518' : '#2b1114',
      }}
      transition={{ duration: 1.6 }}
      className="relative overflow-hidden px-5 py-24 text-center text-[#f6e7d4]"
    >
      {/* glowing horizon arc — look borrowed from 21st.dev lepikhinb sparkles demo */}
      <div
        className="pointer-events-none absolute -bottom-[46%] left-1/2 aspect-[1/0.7] w-[190%] -translate-x-1/2 rounded-[100%] border-t border-[#ffb340]/25"
        style={{ background: '#241012', boxShadow: '0 -18px 70px rgba(255,160,60,0.12)' }}
      />
      <Embers intensity={lit ? 1 : 0.3} />

      {/* warm glow spreads when lit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: lit ? 1 : 0 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, rgba(255,160,60,0.28) 0%, transparent 62%)',
        }}
      />

      <div className="relative">
        <Diya lit={lit} onLight={light} />

        <h2
          className="mt-6 text-[clamp(1.7rem,6vw,2.7rem)] text-[#ffd9a0]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Happy Raksha Bandhan
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[#d9b894]">
          May our bond grow stronger every year.
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="mt-8 text-sm tracking-[4px] text-[#b98d5f]"
        >
          28 · 08 · 2026
        </motion.p>
      </div>
    </motion.section>
  )
}
