import { lazy, Suspense, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import Rakhi, { RAKHI_VARIANTS } from './Rakhi'
import { chime } from '../lib/audio'
import { can3D } from '../lib/device'

const Rakhi3D = lazy(() => import('./three/Rakhi3D'))

const spring = { type: 'spring', stiffness: 300, damping: 20 }
const gentle = { type: 'spring', stiffness: 200, damping: 26 }
const CONFETTI = ['#DB3F3C', '#FFC727', '#467E13', '#EBEBEB']

const LABELS = {
  mogra: 'Mogra',
  kesari: 'Kesari',
  bandhani: 'Bandhani',
}

/* ── Pooja Thali SVG — the golden plate a sister picks her rakhi from ── */
function PoojaThali() {
  return (
    <svg viewBox="0 0 480 280" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="thali-fill">
          <stop offset="0%" stopColor="#FFC727" />
          <stop offset="100%" stopColor="#C5943A" />
        </radialGradient>
      </defs>

      {/* plate surface */}
      <ellipse cx="240" cy="140" rx="218" ry="122" fill="url(#thali-fill)" opacity="0.06" />
      {/* outer rim */}
      <ellipse cx="240" cy="140" rx="230" ry="132" fill="none" stroke="#C5943A" strokeWidth="2.2" opacity="0.28" />
      {/* braid rim */}
      <ellipse cx="240" cy="140" rx="222" ry="126" fill="none" stroke="#E8C560" strokeWidth="1" opacity="0.18" strokeDasharray="6 5" />

      {/* decorative beads around the rim */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        return (
          <circle
            key={i}
            cx={240 + Math.cos(a) * 226}
            cy={140 + Math.sin(a) * 129}
            r="3"
            fill="#FFC727"
            opacity="0.28"
          />
        )
      })}

      {/* kumkum tikka holder — top centre */}
      <circle cx="240" cy="28" r="13" fill="#DB3F3C" opacity="0.1" />
      <circle cx="240" cy="28" r="5.5" fill="#DB3F3C" opacity="0.35" />

      {/* diya — bottom centre */}
      <g transform="translate(240, 252)" opacity="0.3">
        <path d="M -10 0 Q 0 -13 10 0 Z" fill="#FFC727" />
        <ellipse cx="0" cy="3" rx="14" ry="5.5" fill="#C5943A" opacity="0.4" />
        <line x1="0" y1="-5" x2="0" y2="-14" stroke="#FFC727" strokeWidth="1.5" />
        <circle cx="0" cy="-16" r="3.5" fill="#FFC727" opacity="0.55" />
      </g>

      {/* scattered rice grains */}
      {[
        [98, 78], [382, 82], [88, 195], [372, 198], [148, 50], [342, 55],
        [128, 222], [352, 225], [60, 130], [420, 135],
      ].map(([x, y], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="3.2"
          ry="1.1"
          fill="#FFFFF0"
          opacity="0.25"
          transform={`rotate(${(i * 37) % 180} ${x} ${y})`}
        />
      ))}

      {/* small marigold accents */}
      {[
        [65, 85], [415, 90], [70, 200], [410, 195],
      ].map(([x, y], i) => (
        <circle key={`m${i}`} cx={x} cy={y} r="5" fill="#FFC727" opacity="0.12" />
      ))}
    </svg>
  )
}

export default function TieRakhi() {
  const [chosen, setChosen] = useState(null)
  const [tied, setTied] = useState(false)

  const tie = () => {
    if (tied) return
    setTied(true)
    setTimeout(() => {
      chime()
      confetti({ particleCount: 130, spread: 90, origin: { y: 0.6 }, colors: CONFETTI })
    }, 1400)
  }

  return (
    <section className="relative z-10 px-6 py-20 text-center md:py-28">
      <p className="eyebrow">The ritual</p>
      <h2 className="h2 mt-3">
        Tie your <em>rakhi</em>
      </h2>
      <p className="mx-auto mt-3 max-w-md text-moon-dim">
        Choose a rakhi from the thali, then press to tie it with love. Turn it
        with your finger — this thread is yours.
      </p>

      {/* ── POOJA THALI — golden plate with rakhi options ── */}
      <div className="relative mx-auto mt-10 w-full max-w-[500px]">
        <PoojaThali />

        {/* rakhi buttons — positioned over the thali centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-5 md:gap-7">
            {RAKHI_VARIANTS.map((v) => (
              <motion.button
                key={v}
                whileHover={{ scale: 1.12, y: -6 }}
                whileTap={{ scale: 0.88 }}
                transition={spring}
                aria-pressed={chosen === v}
                onClick={() => {
                  setChosen(v)
                  setTied(false)
                }}
                className="group flex flex-col items-center gap-2"
                aria-label={`choose rakhi ${v}`}
              >
                <div
                  className={`grid h-[86px] w-[86px] place-items-center rounded-full border-2 backdrop-blur-sm transition-all duration-300 md:h-[100px] md:w-[100px] ${chosen === v
                      ? 'border-[#C5943A] bg-[#FFC727]/12 shadow-[0_0_28px_rgba(197,148,58,0.35)]'
                      : 'border-[#C5943A]/25 bg-night-3/60 group-hover:border-[#C5943A]/50 group-hover:bg-[#FFC727]/5'
                    }`}
                >
                  <Rakhi seed={v} size={66} threads={false} />
                </div>
                <span
                  className={`text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors ${chosen === v ? 'text-[#C5943A]' : 'text-moon-dim/70'
                    }`}
                >
                  {LABELS[v]}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* empty-state prompt */}
      {!chosen && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-sm italic text-moon-dim/50"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Pick a rakhi from the thali above ✨
        </motion.p>
      )}

      {/* ── TYING AREA — wrist + rakhi + thread ── */}
      <AnimatePresence>
        {chosen && (
          <motion.div
            key="tying"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={gentle}
            className="relative mx-auto mt-8 w-full max-w-lg"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#C5943A]/12 bg-gradient-to-b from-night-3/80 to-night-2/60 backdrop-blur-sm">
              {/* subtle dot pattern background */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 2px 2px, #C5943A 0.8px, transparent 0)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* wrist silhouette behind the rakhi */}
              <svg
                viewBox="0 0 500 50"
                preserveAspectRatio="none"
                className="pointer-events-none absolute bottom-[36%] left-0 w-full"
                aria-hidden="true"
                style={{ opacity: tied ? 0.3 : 0.1, transition: 'opacity 0.6s' }}
              >
                <defs>
                  <linearGradient id="wrist-skin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A574" />
                    <stop offset="100%" stopColor="#C5943A" />
                  </linearGradient>
                </defs>
                <path
                  d="M -10 6 C 80 4, 160 2, 250 1 C 340 2, 420 4, 510 6
                     L 510 44 C 420 46, 340 48, 250 49 C 160 48, 80 46, -10 44 Z"
                  fill="url(#wrist-skin)"
                  opacity="0.55"
                />
              </svg>

              {/* thread wrapping the wrist — appears on tie */}
              {tied && (
                <svg
                  viewBox="0 0 500 80"
                  className="pointer-events-none absolute bottom-[28%] left-0 w-full"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M 155 12 Q 250 0 345 12"
                    fill="none"
                    stroke="#DB3F3C"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.65 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                  <motion.path
                    d="M 155 68 Q 250 80 345 68"
                    fill="none"
                    stroke="#DB3F3C"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.65 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                  <motion.path
                    d="M 135 15 Q 250 -2 365 15"
                    fill="none"
                    stroke="#FFC727"
                    strokeWidth="1.3"
                    strokeDasharray="5 6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.45 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  />
                </svg>
              )}

              {/* 3D / 2D rakhi display */}
              <div className="relative z-10 mx-auto aspect-[4/3] w-full max-w-[360px] md:max-w-[400px]">
                {can3D ? (
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center">
                        <Rakhi seed={chosen} size={200} className="floaty" />
                      </div>
                    }
                  >
                    <Rakhi3D seed={chosen} tie={tied} className="absolute inset-0" />
                  </Suspense>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Rakhi seed={chosen} size={200} className="floaty" />
                  </div>
                )}
              </div>

              {/* tie button */}
              {!tied && (
                <div className="relative z-10 pb-6 pt-1">
                  <motion.button
                    onClick={tie}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="group relative mx-auto flex items-center gap-3 rounded-full border-2 border-kumkum/50 bg-gradient-to-r from-kumkum/12 via-kumkum/18 to-kumkum/12 px-8 py-3.5 text-sm font-semibold tracking-[0.16em] uppercase text-kumkum transition-all hover:border-kumkum/70 hover:from-kumkum/20 hover:via-kumkum/28 hover:to-kumkum/20 hover:shadow-[0_0_24px_rgba(219,63,60,0.25)]"
                    aria-label="press to tie the rakhi"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                      className="inline-block h-2.5 w-2.5 rounded-full bg-kumkum shadow-[0_0_10px_rgba(219,63,60,0.5)]"
                    />
                    Tie the Rakhi
                    <span className="text-base">🪢</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── POST-TIE BLESSING ── */}
      {tied && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mx-auto mt-6 max-w-sm"
        >
          <p
            className="text-lg italic text-brass"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The thread is tied. The promise holds. 💛
          </p>
          <p className="mt-1.5 text-xs text-moon-dim">
            This sacred thread now binds your love across all distances 🌙
          </p>
        </motion.div>
      )}
    </section>
  )
}
