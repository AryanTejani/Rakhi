import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { addWish, canRemove, fetchWishes, removeWish, subscribeWishes } from '../lib/supabase'
import { chime } from '../lib/audio'
import { hostOf, safeUrl } from '../lib/seed'
import Rakhi from './Rakhi'

const FLOWERS = ['🌸','🌺','🌼','🌻','🌷','🌹','🪷','💮','🏵️','🥀','🌵','🍀','🪻','🌿','🍁','🌾','🪴','🎋','🍄','🌴']
const BLESSINGS = [
  'May your wish find its way 🌙',
  'Another knot on the family thread 🪢',
  'Tied with love, sealed with a prayer ✨',
  'The thread grew stronger tonight 😄',
  "Your brother's already smiling 😄",
]
const CONFETTI = ['#DB3F3C', '#FFC727', '#467E13', '#EBEBEB']

const spring = { type: 'spring', stiffness: 320, damping: 22 }

// Brother's shopping view is hidden from sisters — it only exists on his own
// bookmark. Three spellings so it works wherever the site is hosted:
//   yoursite.com/brother   ← prettiest, needs an SPA rewrite on static hosts
//   yoursite.com/#brother  ← works everywhere, no server config
//   yoursite.com/?bhai     ← the original link, kept so it does not break
const IS_BROTHER = (() => {
  const { pathname, hash, search } = window.location
  return (
    /^\/(brother|bhai)\/?$/.test(pathname) ||
    hash === '#brother' ||
    hash === '#bhai' ||
    new URLSearchParams(search).has('bhai')
  )
})()

// One continuous thread draped in three swags (like string lights).
// Rakhis knot on sequentially, 6 per swag, then overlap — the thread
// always has room for one more sister. Coordinates in viewBox units
// (800×340); container is aspect-locked so rakhis sit on the curve.
const SWAG_ENDS = [62, 148, 234] // y of each swag's endpoints
const CTRL_DROP = 107 // control-point offset of the bezier swags below

function threadSpot(i) {
  const slot = i % 6
  const swag = Math.floor(i / 6) % SWAG_ENDS.length
  const jitter = ((i * 37) % 7) - 3
  const t = (slot + 0.5) / 6
  // cubic bezier with both controls dropped by CTRL_DROP: y(t) = y0 + 3t(1-t)·drop
  const curveY = SWAG_ENDS[swag] + 3 * t * (1 - t) * CTRL_DROP
  return {
    x: 80 + t * 640 + jitter,
    // hang just below the curve, like a knotted rakhi
    y: curveY + 14 + jitter,
  }
}

const SWAG_PATH = `M 26 62 C 260 170, 540 170, 774 62
   C 792 72, 792 124, 774 148
   C 540 254, 260 254, 26 148
   C 8 158, 8 210, 26 234
   C 260 340, 540 340, 774 234`

export default function SacredThread() {
  const [wishes, setWishes] = useState([])
  const [shared, setShared] = useState(true)
  // land straight on the list when he opens his own link
  const [mode, setMode] = useState(IS_BROTHER ? 'brother' : null) // null | 'ceremony' | 'brother'
  const [step, setStep] = useState(1)
  const [name, setName] = useState(localStorage.getItem('rakhi-my-name') || '')
  const [picked, setPicked] = useState([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [blessing, setBlessing] = useState('')
  const [openWish, setOpenWish] = useState(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    const { wishes: w, shared: s } = await fetchWishes()
    setWishes(w)
    setShared(s)
  }, [])

  useEffect(() => {
    refresh()
    return subscribeWishes(refresh)
  }, [refresh])

  const startCeremony = () => {
    setMode('ceremony')
    setStep(1)
    setPicked([])
    setTitle('')
    setUrl('')
  }

  const tieWish = async () => {
    if (!title.trim()) return alert('Whisper the wish first 🌙')
    // only http(s) links are ever stored — a pasted javascript: URL would
    // otherwise become a click-to-run script for every sister on the thread
    const clean = safeUrl(url)
    if (!clean) return alert('The link must be a full https:// web address 🌙')
    setBusy(true)
    localStorage.setItem('rakhi-my-name', name)
    await addWish({ name: name.trim(), flowers: picked, title: title.trim(), url: clean })
    setBusy(false)
    setBlessing(BLESSINGS[Date.now() % BLESSINGS.length])
    setStep(4)
    chime()
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 }, colors: CONFETTI })
    refresh()
  }

  // one block per sister, in the order they first tied something on
  const bySister = [...new Set(wishes.map((w) => w.name))].map((n) => ({
    name: n,
    wishes: wishes.filter((w) => w.name === n),
  }))

  return (
    <section className="relative z-10 overflow-hidden px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">The shared thread</p>
        <h2 className="h2 mt-3">
          Tie a <em>wish</em> onto it
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-moon-dim">
          One thread holds all of us. Every wish knots one more rakhi onto it — and no two
          rakhis are ever the same. Tap any knot to open its wish.
        </p>

        <div className="mx-auto mt-6 max-w-xl rounded-sm border border-brass/25 bg-night-2/70 px-5 py-3 text-sm text-moon-dim">
          🪙 The thread carries wishes up to <b className="text-moon">₹1500</b> — love has no
          price, but the courier does. 💛
        </div>

        {!shared && (
          <p className="mt-3 text-xs text-moon-dim">
            (offline mode — wishes are saving on this phone only right now)
          </p>
        )}

        {/* ── THE FAMILY THREAD — one thread draped in three swags ── */}
        <div className="relative mx-auto mt-8 aspect-[800/340] w-full max-w-[680px]">
          <svg viewBox="0 0 800 340" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path
              d={SWAG_PATH}
              fill="none"
              stroke="#DB3F3C"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* gold braid wrapping the red core */}
            <path
              d={SWAG_PATH}
              fill="none"
              stroke="#FFC727"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="7 9"
              opacity="0.85"
            />
            <g>
              <circle cx="26" cy="62" r="7" fill="#FFC727" />
              <path
                d="M 22 66 L 8 96 M 26 68 L 20 100 M 30 66 L 36 98"
                stroke="#DB3F3C"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="774" cy="234" r="7" fill="#FFC727" />
              <path
                d="M 770 240 L 756 272 M 774 242 L 772 276 M 780 240 L 788 272"
                stroke="#DB3F3C"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>

          <AnimatePresence>
            {wishes.map((w, i) => {
              const pos = threadSpot(i)
              return (
                <motion.button
                  key={w.id}
                  initial={{ scale: 0, rotate: -120 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={spring}
                  whileHover={{ scale: 1.25, zIndex: 20 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute aspect-square w-[9%] cursor-pointer"
                  style={{
                    left: `${(pos.x / 800) * 100}%`,
                    top: `${(pos.y / 340) * 100}%`,
                    x: '-50%',
                    y: '-50%',
                    filter: 'drop-shadow(0 0 8px rgba(224,51,74,.35))',
                  }}
                  onClick={() => setOpenWish(w)}
                  aria-label={`Wish by ${w.name}`}
                >
                  {/* the rakhi is generated from this wish and only this wish */}
                  <Rakhi seed={`${w.name}${w.title}`} size="100%" threads={false} className="dangle" />
                </motion.button>
              )
            })}
          </AnimatePresence>

          {wishes.length === 0 && (
            <p className="absolute top-[44%] w-full text-sm text-moon-dim">
              The thread is waiting for its first rakhi 🥺
            </p>
          )}
        </div>

        {wishes.length >= 8 && (
          <p className="mt-1 text-xs italic text-moon-dim">
            {wishes.length} rakhis knotted — the thread is turning into a garland 😄
          </p>
        )}

        <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-2.5 md:flex-row md:justify-center">
          <button onClick={startCeremony} className="btn btn-solid btn-shimmer w-full md:w-auto">
            🪢 Knot your rakhi on
          </button>
          {IS_BROTHER && (
            <button
              onClick={() => setMode(mode === 'brother' ? null : 'brother')}
              className="btn w-full md:w-auto"
            >
              🛍️ Brother&apos;s list
            </button>
          )}
        </div>

        {/* ── CEREMONY ── */}
        <AnimatePresence mode="wait">
          {mode === 'ceremony' && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={spring}
              className="mx-auto mt-8 max-w-md rounded-sm border border-brass/25 border-t-2 border-t-kumkum bg-night-2 p-7 text-left"
            >
              {step === 1 && (
                <>
                  <p className="eyebrow">Step 1 of 3</p>
                  <h3 className="mt-2 text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    Who is wishing tonight?
                  </h3>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Write your name on the chit…"
                    className="mt-4 w-full rounded-sm border border-moon/15 bg-night-3 px-4 py-3 text-sm text-moon placeholder:text-moon-dim/60"
                  />
                  <button
                    onClick={() => (name.trim() ? setStep(2) : alert('Write your name on the chit 🌸'))}
                    className="btn btn-solid mt-4"
                  >
                    Next →
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <p className="eyebrow">Step 2 of 3</p>
                  <h3 className="mt-2 text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    Catch your flowers
                  </h3>
                  <p className="mt-1 text-xs text-moon-dim">
                    Pick as many as your heart wants — they bloom with your wish:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {FLOWERS.map((f) => (
                      <motion.button
                        key={f}
                        whileTap={{ scale: 1.4 }}
                        transition={spring}
                        aria-pressed={picked.includes(f)}
                        onClick={() =>
                          setPicked((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]))
                        }
                        className={`grid h-11 w-11 place-items-center rounded-sm border text-lg transition-colors ${
                          picked.includes(f)
                            ? 'border-kumkum bg-kumkum/15'
                            : 'border-moon/15 bg-night-3'
                        }`}
                      >
                        {f}
                      </motion.button>
                    ))}
                  </div>
                  <button onClick={() => setStep(3)} className="btn btn-solid mt-5">
                    Next →
                  </button>
                </>
              )}
              {step === 3 && (
                <>
                  <p className="eyebrow">Step 3 of 3</p>
                  <h3 className="mt-2 text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    Whisper your wish
                  </h3>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What does your heart wish for?"
                    className="mt-4 w-full rounded-sm border border-moon/15 bg-night-3 px-4 py-3 text-sm text-moon placeholder:text-moon-dim/60"
                  />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste the link (https://…)"
                    type="url"
                    inputMode="url"
                    className="mt-3 w-full rounded-sm border border-moon/15 bg-night-3 px-4 py-3 text-sm text-moon placeholder:text-moon-dim/60"
                  />
                  <button onClick={tieWish} disabled={busy} className="btn btn-solid mt-4 disabled:opacity-60">
                    {busy ? 'Tying…' : '🪢 Knot it on'}
                  </button>
                </>
              )}
              {step === 4 && (
                <div className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}>
                    <Rakhi seed={`${name}${title}`} size={96} className="mx-auto" />
                  </motion.div>
                  <h3 className="mt-3 text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {blessing}
                  </h3>
                  <p className="mt-1 text-xs text-moon-dim">
                    Your rakhi is knotted on the family thread. 🪢
                  </p>
                  <button onClick={() => setMode(null)} className="btn btn-solid mt-4">
                    See the thread
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BROTHER'S LIST — one block per sister ── */}
        {mode === 'brother' && (
          <div className="mx-auto mt-10 max-w-2xl text-left">
            <p className="eyebrow">Brother only · {wishes.length} wishes</p>

            {bySister.map((s) => (
              <div key={s.name} className="mt-8 first:mt-4">
                <h3
                  className="flex items-baseline gap-2 border-b border-brass/20 pb-2 text-xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {s.name}
                  <span className="text-xs tracking-widest text-moon-dim">
                    {s.wishes.length} {s.wishes.length === 1 ? 'wish' : 'wishes'}
                  </span>
                </h3>

                <div className="mt-3 flex flex-col gap-2.5">
                  {s.wishes.map((w) => {
                    const link = safeUrl(w.url)
                    return (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center gap-3 rounded-sm border border-moon/10 border-l-2 border-l-kumkum bg-night-2 px-4 py-3.5"
                      >
                        <span className="shrink-0">
                          <Rakhi seed={`${w.name}${w.title}`} size={34} threads={false} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">
                            {(w.flowers || []).join('')} {w.title}
                          </p>
                          <p className="text-xs text-moon-dim">{hostOf(w.url)}</p>
                        </div>
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold tracking-wider text-brass"
                          >
                            OPEN ↗
                          </a>
                        )}
                        {/* only the phone that tied this wish holds its delete token */}
                        {canRemove(w.id) && (
                          <button
                            onClick={() => removeWish(w.id).then(refresh)}
                            className="px-1 text-moon-dim hover:text-kumkum"
                            aria-label="remove wish"
                          >
                            ✕
                          </button>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}

            {wishes.length === 0 && (
              <p className="py-6 text-center text-sm text-moon-dim">No wishes yet 🎁</p>
            )}
          </div>
        )}
      </div>

      {/* Tapped knot. Portalled to <body> on purpose: this section is
          `relative z-10`, which makes it a stacking context, so a z-50 sheet
          rendered inside it still paints UNDER the next `z-10` section. */}
      {createPortal(
        <AnimatePresence>
        {openWish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1e1e1eb3] backdrop-blur-sm sm:items-center sm:p-5"
            onClick={() => setOpenWish(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={spring}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85svh] w-full max-w-sm overflow-y-auto rounded-t-lg border-t-2 border-kumkum bg-night-2 px-6 pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-7 text-center sm:rounded-lg"
            >
              <Rakhi seed={`${openWish.name}${openWish.title}`} size={96} className="mx-auto" />
              <h3 className="mt-3 text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                {openWish.title}
              </h3>
              <p className="mt-1 text-xs text-moon-dim">
                {(openWish.flowers || []).join('')} wished by <b className="text-moon">{openWish.name}</b>
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {/* The gift link is the brother's business, not the thread's.
                    On the common link a sister sees the wish, never where to
                    buy it — otherwise the surprise is gone. */}
                {IS_BROTHER && safeUrl(openWish.url) && (
                  <a
                    href={safeUrl(openWish.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-solid"
                  >
                    Open the link
                  </a>
                )}
                <button onClick={() => setOpenWish(null)} className="btn">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  )
}
