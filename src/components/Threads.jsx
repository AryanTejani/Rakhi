import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BONDS = [
  {
    icon: (
      <svg viewBox="0 0 48 48" className="h-9 w-9">
        <path
          d="M24 5 L40 11 v12 c0 10 -7.4 16.6 -16 20 C15.4 39.6 8 33 8 23 V11 Z"
          fill="#f6d7ce"
          stroke="#7b1e26"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M17 23 l5 5 10 -11" fill="none" stroke="#7b1e26" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'The Thread of Protection',
    text: 'She ties a thread on my wrist — but truth is, her prayers protect me more than I could ever protect her.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="h-9 w-9">
        <circle cx="24" cy="24" r="18" fill="#ffd9a0" stroke="#d4a017" strokeWidth="2.4" />
        <path d="M15 27 c3 6 15 6 18 0" fill="none" stroke="#7b1e26" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="17.5" cy="19" r="2.2" fill="#7b1e26" />
        <circle cx="30.5" cy="19" r="2.2" fill="#7b1e26" />
      </svg>
    ),
    title: 'The Thread of Laughter',
    text: 'The teasing, the inside jokes, the fights over the last sweet — and laughing again five minutes later.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="h-9 w-9">
        <path d="M8 30 c4 -8 10 -8 14 -3" fill="none" stroke="#4e6b2f" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 30 c-4 -8 -10 -8 -14 -3" fill="none" stroke="#7b1e26" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 28 l4 4 4 -4" fill="none" stroke="#d4a017" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'The Thread of Always',
    text: 'No matter what happens, no matter where life takes us — a sister is the person who always has your back.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="h-9 w-9">
        <path
          d="M24 40 C12 32 6 25 6 17.5 C6 11 11 7 16.5 7 C20 7 22.8 8.8 24 11.4 C25.2 8.8 28 7 31.5 7 C37 7 42 11 42 17.5 C42 25 36 32 24 40 Z"
          fill="#ff9933"
          stroke="#7b1e26"
          strokeWidth="2.2"
        />
      </svg>
    ),
    title: 'The Thread of Blessings',
    text: 'Every rakhi is a promise renewed — her wish for my long life, my promise to stand by her, always.',
  },
]

export default function Threads() {
  const root = useRef(null)
  const path = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      // the sacred thread draws itself down the page as you scroll
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
          x: reduced ? 0 : i % 2 ? 60 : -60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 82%' },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="threads" ref={root} className="relative px-5 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h2
          className="text-center text-[clamp(1.7rem,6vw,2.5rem)] font-semibold text-maroon"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The Threads That Bind Us
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sand">
          What a sister means — one thread at a time.
        </p>

        <div className="relative mt-12">
          {/* drawn thread spine */}
          <svg
            className="pointer-events-none absolute left-4 top-0 h-full w-10 md:left-1/2 md:-translate-x-1/2"
            viewBox="0 0 40 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={path}
              d="M 20 0 C 34 120, 6 240, 20 360 C 34 480, 6 600, 20 720 C 30 830, 12 920, 20 1000"
              fill="none"
              stroke="#7b1e26"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>

          <div className="flex flex-col gap-7 pl-12 md:pl-0">
            {BONDS.map((b, i) => (
              <div
                key={b.title}
                className={`bond-card flex w-full items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(123,30,38,0.08)] md:w-[74%] ${
                  i % 2 ? 'md:self-end' : 'md:self-start'
                }`}
              >
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-cream">
                  {b.icon}
                </div>
                <div>
                  <h3
                    className="text-lg text-maroon"
                    style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
                  >
                    {b.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#6f584a]">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
