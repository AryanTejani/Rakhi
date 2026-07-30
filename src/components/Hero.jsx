import { lazy, Suspense, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Petals from './Petals'
import Rakhi from './Rakhi'
import SparkleField from './SparkleField'

// 3D rakhi loads as its own chunk — the page never waits for Three.js.
const Rakhi3D = lazy(() => import('./Rakhi3D'))

const hasWebGL = (() => {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
})()

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const TITLE = 'रक्षाबंधन'
// Devanagari must be split by grapheme clusters, not code points —
// otherwise matras (ा ं) detach from their consonants and render broken.
const TITLE_SHADES = ['#7b1e26', '#a5402a', '#e07a22', '#ff9933', '#d4a017']

const GRAPHEMES =
  typeof Intl !== 'undefined' && Intl.Segmenter
    ? [...new Intl.Segmenter('hi', { granularity: 'grapheme' }).segment(TITLE)].map(
        (s) => s.segment
      )
    : [TITLE]

export default function Hero() {
  const root = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.from('.hero-letter', {
        y: 46,
        opacity: 0,
        stagger: 0.09,
        duration: 0.9,
        ease: 'back.out(1.6)',
        delay: 0.3,
      })
      gsap.from('.hero-sub', {
        opacity: 0,
        filter: 'blur(8px)',
        y: 14,
        duration: 1.1,
        delay: 1.2,
        ease: 'power2.out',
      })
      gsap.from('.hero-rakhi', {
        scale: 0,
        rotate: -120,
        duration: 1.2,
        ease: 'elastic.out(1, 0.55)',
        delay: 0.1,
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={root}
      className="relative flex min-h-[94svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        background:
          'radial-gradient(ellipse at 50% 28%, #fff3df 0%, var(--color-cream) 62%)',
      }}
    >
      <Petals />

      <div className="hero-rakhi relative z-10 h-[230px] w-[230px] md:h-[270px] md:w-[270px]">
        {hasWebGL && !reducedMotion ? (
          <Suspense fallback={<Rakhi variant="surya" size={150} className="floaty mx-auto mt-8" />}>
            <Rakhi3D />
          </Suspense>
        ) : (
          <Rakhi variant="surya" size={150} className="floaty mx-auto mt-8" />
        )}
      </div>

      <h1
        className="relative z-10 mt-5 text-[clamp(3.2rem,13vw,7rem)] leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <SparkleField count={12} className="-inset-x-8 -inset-y-4" />
        {GRAPHEMES.map((ch, i) => (
          <span
            key={i}
            className="hero-letter inline-block"
            /* solid per-grapheme colors instead of background-clip:text —
               Chromium clips the ं diacritic's ink overflow with clipped gradients */
            style={{
              color: TITLE_SHADES[i % TITLE_SHADES.length],
              textShadow: '0 2px 18px rgba(212,160,23,0.35)',
            }}
          >
            {ch}
          </span>
        ))}
      </h1>

      <p
        className="hero-sub relative z-10 mt-4 max-w-md text-[clamp(1.05rem,4vw,1.5rem)] italic text-[#7c5c46]"
        style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}
      >
        For my sisters — every thread a promise, every knot a prayer.
      </p>

      <a
        href="#threads"
        className="floaty absolute bottom-8 z-10 text-[11px] font-semibold tracking-[3px] text-sand"
      >
        ↓ SCROLL OUR STORY
      </a>
    </section>
  )
}
