import { lazy, Suspense, useState } from 'react'
import { motion } from 'motion/react'
import { chime } from '../lib/audio'
import Embers from './Embers'
import { can3D } from '../lib/device'

// The sky behind the diya is real 3D — a point galaxy that brightens when lit.
const Galaxy3D = lazy(() => import('./three/Galaxy3D'))

// Diya: unlit until tapped — lighting it is the closing ritual.
function Diya({ lit, onLight }) {
  return (
    <button onClick={onLight} aria-label="light the diya" className="relative outline-none">
      <svg viewBox="0 0 160 120" className="w-40 md:w-48">
        {lit && (
          <g className="flicker" style={{ transformOrigin: '80px 46px' }}>
            <path d="M 80 12 C 92 30, 94 44, 80 54 C 66 44, 68 30, 80 12 Z" fill="#DB3F3C" />
            <path d="M 80 24 C 87 34, 88 44, 80 50 C 72 44, 73 34, 80 24 Z" fill="#FFC727" />
          </g>
        )}
        <rect x="78" y="50" width="4" height="10" rx="2" fill="#1E1E1E" />
        <path
          d="M 22 66 C 40 60, 120 60, 138 66 C 134 92, 106 106, 80 106 C 54 106, 26 92, 22 66 Z"
          fill="#5b2a30"
        />
        <path
          d="M 22 66 C 40 60, 120 60, 138 66 C 132 74, 104 78, 80 78 C 56 78, 28 74, 22 66 Z"
          fill="#7a3a41"
        />
        <ellipse cx="80" cy="66" rx="44" ry="6" fill="#2a1219" opacity="0.7" />
      </svg>
      {!lit && (
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-semibold tracking-widest text-[#FFC727]"
          style={{ textShadow: '0 0 12px rgba(255,199,39,0.5)' }}
        >
          👇 tap to light
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
    // The rest of the site is now a flat light theme, but this section stays
    // its own dark "night sky" island on purpose — a diya being lit only
    // reads as a moment if it's actually dark around it. #1E1E1E is the
    // client's own "Black / Primary Text" token, repurposed here as ground
    // instead of ink, so it's still strictly inside the given palette.
    // Because of that inversion, text inside can't use the global text-moon
    // (now dark ink) or .eyebrow (now green, low-contrast on near-black) —
    // both are overridden locally below.
    <section className="relative z-10 overflow-hidden bg-[#1e1e1e] px-6 py-24 text-center">
      {can3D && (
        <Suspense fallback={null}>
          <Galaxy3D intensity={lit ? 1 : 0.25} />
        </Suspense>
      )}
      <Embers intensity={lit ? 1 : 0.3} />

      {/* warm glow spreads when lit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: lit ? 1 : 0 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, rgba(219,63,60,0.24) 0%, transparent 62%)',
        }}
      />

      {/* The galaxy's core is brightest dead centre, which is exactly where the
          blessing sits. Sink the section's own ground back in behind the words
          so they read over it. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 42% at 50% 62%, rgba(30,30,30,0.88) 0%, rgba(30,30,30,0.6) 48%, transparent 80%)',
        }}
      />

      <div className="relative text-[#f5f5f5]">
        <Diya lit={lit} onLight={light} />

        <p
          className="mx-auto mt-8 max-w-[24ch] text-[clamp(1.15rem,4vw,1.9rem)] font-light leading-loose"
          style={{
            fontFamily: 'var(--font-indic)',
            textShadow: '0 2px 18px rgba(30,30,30,0.95), 0 0 4px rgba(30,30,30,0.9)',
          }}
        >
          જ્યાં દોરો બંધાય છે,
          <br />
          ત્યાં અંતર મટી જાય છે.
        </p>

        <h2 className="h2 mt-8">Happy Raksha Bandhan</h2>
        <p className="mx-auto mt-2 max-w-sm text-moon-dim">
          May our bond grow stronger every year.
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="mt-10 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#FFC727]"
        >
          28 · 08 · 2026
        </motion.p>
      </div>
    </section>
  )
}
