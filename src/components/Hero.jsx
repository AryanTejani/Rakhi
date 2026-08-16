import { lazy, Suspense, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Rakhi from './Rakhi'
import { can3D } from '../lib/device'

// The particle field is its own chunk — the page paints before three.js lands.
const ParticleMorph = lazy(() => import('./three/ParticleMorph'))

export default function Hero() {
  const root = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.from('.hero-fade', {
        opacity: 0,
        y: 16,
        filter: 'blur(6px)',
        stagger: 0.18,
        duration: 1,
        delay: 0.6,
        ease: 'power2.out',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      {/* the cloud that becomes her name, then a rakhi, then dust again.
          It gets its own band of the screen so the copy never sits on top of
          it — on a phone that overlap is unreadable. */}
      <div className="pointer-events-none relative h-[42svh] w-full max-w-3xl md:h-[48svh]">
        {can3D ? (
          <Suspense fallback={null}>
            <ParticleMorph />
          </Suspense>
        ) : (
          <div className="grid h-full place-items-center">
            <Rakhi seed="hero" size={220} className="floaty" />
          </div>
        )}
      </div>

      {/* the cloud draws the title, so the real heading only has to exist for
          screen readers and search engines */}
      <h1 className="sr-only">રક્ષાબંધન — Shravan Purnima</h1>

      <div className="relative z-10 mt-10 flex flex-col items-center md:mt-14">
        <p
          className="hero-fade text-[clamp(1.1rem,4vw,1.5rem)] text-moon"
          style={{ fontFamily: 'var(--font-indic)' }}
        >
          મારી બહેનો માટે
        </p>

        <p
          className="hero-fade mt-3 max-w-[30ch] text-[clamp(1rem,3.4vw,1.3rem)] italic text-moon-dim"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          One thread. Tied on the night of the Shravan full moon.
        </p>

        <p className="hero-fade eyebrow mt-8">Purnima · 2026</p>

        <a
          href="#threads"
          className="hero-fade floaty mt-10 text-[11px] font-semibold tracking-[3px] text-moon-dim"
        >
          ↓ THE THREAD IS LONG
        </a>
      </div>
    </section>
  )
}
