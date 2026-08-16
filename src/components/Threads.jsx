import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Each strand carries its own name in Gujarati rather than a numeral — the
// first one is રક્ષા, which is literally the raksha in Raksha Bandhan.
const BONDS = [
  {
    gu: 'રક્ષા',
    title: 'Protection',
    text: 'She ties a thread on my wrist. Her prayers protect me more than I could ever protect her.',
  },
  {
    gu: 'હાસ્ય',
    title: 'Laughter',
    text: 'The teasing, the inside jokes, the fight over the last sweet — and laughing again five minutes later.',
  },
  {
    gu: 'હંમેશાં',
    title: 'Always',
    text: 'Wherever life takes us, a sister is the person who already has your back.',
  },
  {
    gu: 'આશીર્વાદ',
    title: 'Blessing',
    text: 'Every rakhi renews the same promise: her wish for a long life, my word to stand by her.',
  },
]

export default function Threads() {
  const root = useRef(null)
  const path = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const p = path.current
      const len = p.getTotalLength()
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      gsap.to(p, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top 65%',
          end: 'bottom 78%',
          scrub: reduced ? false : 0.6,
        },
      })

      gsap.utils.toArray('.bond-card').forEach((card, i) => {
        gsap.from(card, {
          x: reduced ? 0 : i % 2 ? 50 : -50,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 84%' },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="threads" ref={root} className="relative z-10 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-center">What a sister is</p>
        <h2 className="h2 mt-3 text-center">
          The threads that <em>bind</em>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-moon-dim">
          Four strands. Twisted together, they hold.
        </p>

        <div className="relative mt-14">
          <svg
            className="pointer-events-none absolute left-3 top-0 h-full w-10 md:left-1/2 md:-translate-x-1/2"
            viewBox="0 0 40 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={path}
              d="M 20 0 C 34 120, 6 240, 20 360 C 34 480, 6 600, 20 720 C 30 830, 12 920, 20 1000"
              fill="none"
              stroke="#FFC727"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>

          <div className="flex flex-col gap-6 pl-12 md:gap-10 md:pl-0">
            {BONDS.map((b, i) => (
              <article
                key={b.title}
                className={`bond-card w-full rounded-sm border border-brass/20 bg-night-2/80 p-6 backdrop-blur-sm md:w-[46%] ${
                  i % 2 ? 'md:self-end' : 'md:self-start'
                }`}
              >
                {/* inline, not absolutely positioned — આશીર્વાદ is long enough
                    to collide with the title in a corner on a narrow card */}
                <h3
                  className="flex flex-wrap items-baseline gap-2.5 text-xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {b.title}
                  <span
                    className="text-sm text-brass"
                    style={{ fontFamily: 'var(--font-indic)' }}
                  >
                    {b.gu}
                  </span>
                </h3>
                <p className="mt-1.5 text-[0.94rem] leading-relaxed text-moon-dim">{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
