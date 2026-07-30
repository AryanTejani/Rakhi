import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { addWish, fetchWishes, removeWish, subscribeWishes } from '../lib/supabase'
import { chime } from '../lib/audio'
import Rakhi, { RAKHI_VARIANTS } from './Rakhi'

const FLOWERS = ['🌸','🌺','🌼','🌻','🌷','🌹','🪷','💮','🏵️','🥀','🌵','🍀','🪻','🌿','🍁','🌾','🪴','🎋','🍄','🌴']
const BLESSINGS = [
  'May your wish find its way 🌙',
  'Another knot on the family thread 🪢',
  'Tied with love, sealed with a prayer ✨',
  'The thread grew stronger today 😄',
  "Your brother's already smiling 😄",
]

const spring = { type: 'spring', stiffness: 320, damping: 22 }

// Brother's shopping view is hidden from sisters — it only exists when the
// site is opened as  yoursite.com/?bhai  (brother bookmarks that link).
const IS_BROTHER =
  new URLSearchParams(window.location.search).has('bhai') ||
  window.location.hash === '#bhai'

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

const rakhiVariant = (id) => {
  const n = typeof id === 'number' ? id : [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0)
  return RAKHI_VARIANTS[n % RAKHI_VARIANTS.length]
}

export default function SacredThread() {
  const [wishes, setWishes] = useState([])
  const [shared, setShared] = useState(true)
  const [mode, setMode] = useState(null) // null | 'ceremony' | 'brother'
  const [step, setStep] = useState(1)
  const [name, setName] = useState(localStorage.getItem('rakhi-my-name') || '')
  const [picked, setPicked] = useState([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [blessing, setBlessing] = useState('')
  const [openWish, setOpenWish] = useState(null)
  const [filterName, setFilterName] = useState(null)
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
    if (!title.trim() || !url.trim()) return alert('Whisper the wish AND paste its link 🌙')
    try {
      new URL(url)
    } catch {
      return alert('Link must start with https://')
    }
    setBusy(true)
    localStorage.setItem('rakhi-my-name', name)
    await addWish({ name: name.trim(), flowers: picked, title: title.trim(), url: url.trim() })
    setBusy(false)
    setBlessing(BLESSINGS[Date.now() % BLESSINGS.length])
    setStep(4)
    chime()
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 },
      colors: ['#ff9933', '#d4a017', '#7b1e26', '#f6d7ce'],
    })
    refresh()
  }

  const names = [...new Set(wishes.map((w) => w.name))]
  const listed = wishes.filter((w) => filterName === null || w.name === filterName)

  return (
    <section
      className="relative overflow-hidden px-5 py-20 md:py-28"
      style={{ background: 'linear-gradient(180deg, var(--color-cream), #f4ecd9)' }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="text-[clamp(1.7rem,6vw,2.5rem)] font-semibold text-maroon"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The Family Thread
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sand">
          One sacred thread holds us all. Every wish knots one more rakhi onto it —
          tap any rakhi to peek at its wish.
        </p>

        <div className="mx-auto mt-5 max-w-xl rounded-2xl border-[1.5px] border-gold bg-[#fff8e8] px-5 py-3.5 text-sm text-[#7c5c2e]">
          🪙 The thread carries wishes up to <b>₹2000</b> — love has no price, but
          brothers have salaries. 😄💛
        </div>

        {!shared && (
          <p className="mt-3 text-xs text-sand">
            (offline mode — wishes are saving on this phone only right now)
          </p>
        )}

        {/* ── THE FAMILY THREAD — one braided thread draped in three swags ── */}
        <div className="relative mx-auto mt-8 aspect-[800/340] w-full max-w-[680px]">
          <svg viewBox="0 0 800 340" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {/* thread shadow */}
            <path
              d="M 26 66 C 260 174, 540 174, 774 66
                 C 792 76, 792 128, 774 152
                 C 540 258, 260 258, 26 152
                 C 8 162, 8 214, 26 238
                 C 260 344, 540 344, 774 238"
              fill="none" stroke="#3a2620" strokeWidth="7" strokeLinecap="round" opacity="0.08"
              transform="translate(0 5)"
            />
            {/* maroon core thread */}
            <path
              d="M 26 62 C 260 170, 540 170, 774 62
                 C 792 72, 792 124, 774 148
                 C 540 254, 260 254, 26 148
                 C 8 158, 8 210, 26 234
                 C 260 340, 540 340, 774 234"
              fill="none" stroke="#7b1e26" strokeWidth="6" strokeLinecap="round"
            />
            {/* gold braid wrap */}
            <path
              d="M 26 62 C 260 170, 540 170, 774 62
                 C 792 72, 792 124, 774 148
                 C 540 254, 260 254, 26 148
                 C 8 158, 8 210, 26 234
                 C 260 340, 540 340, 774 234"
              fill="none" stroke="#d4a017" strokeWidth="2.4" strokeLinecap="round"
              strokeDasharray="7 9" opacity="0.9"
            />
            {/* tassels at both ends */}
            <g fill="#7b1e26">
              <circle cx="26" cy="62" r="7" fill="#d4a017" />
              <path d="M 22 66 L 8 96 M 26 68 L 20 100 M 30 66 L 36 98" stroke="#a5402a" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              <circle cx="774" cy="234" r="7" fill="#d4a017" />
              <path d="M 770 240 L 756 272 M 774 242 L 772 276 M 780 240 L 788 272" stroke="#a5402a" strokeWidth="3.4" strokeLinecap="round" fill="none" />
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
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.3))',
                  }}
                  onClick={() => setOpenWish(w)}
                  aria-label="a rakhi tied for a wish"
                >
                  <Rakhi
                    variant={rakhiVariant(w.id)}
                    size="100%"
                    threads={false}
                    className="dangle"
                  />
                </motion.button>
              )
            })}
          </AnimatePresence>

          {wishes.length === 0 && (
            <p className="absolute top-[44%] w-full text-sm font-semibold text-[#7c5c2e]">
              The thread is waiting for its first rakhi 🥺
            </p>
          )}
        </div>

        {wishes.length >= 8 && (
          <p className="mt-1 text-xs italic text-sand">
            {wishes.length} rakhis knotted — the thread is turning into a garland 😄
          </p>
        )}

        <div className="mx-auto mt-4 flex max-w-md flex-col gap-2.5 md:flex-row md:justify-center">
          <button
            onClick={startCeremony}
            className="btn-shimmer rounded-full bg-maroon px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_6px_20px_rgba(123,30,38,0.3)] transition-transform active:scale-95"
          >
            🪢 KNOT YOUR RAKHI ON THE THREAD
          </button>
          {IS_BROTHER && (
            <button
              onClick={() => setMode(mode === 'brother' ? null : 'brother')}
              className="rounded-full bg-mehndi px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_6px_20px_rgba(78,107,47,0.3)] transition-transform active:scale-95"
            >
              🛍️ BROTHER'S LIST
            </button>
          )}
        </div>

        {/* ── CEREMONY ── */}
        <AnimatePresence mode="wait">
          {mode === 'ceremony' && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 26, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={spring}
              className="mx-auto mt-8 max-w-md rounded-xl border-t-[5px] border-marigold bg-[#fffdf4] p-7 shadow-[0_8px_26px_rgba(58,38,32,0.14)]"
            >
              {step === 1 && (
                <>
                  <p className="text-[10px] tracking-[2px] text-sand">STEP 1 OF 3</p>
                  <h3 className="mt-2 text-xl text-maroon" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                    Who is wishing tonight?
                  </h3>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Write your name on the chit…"
                    className="mt-4 w-full rounded-xl border-[1.5px] border-[#e5d3b8] bg-white px-4 py-3 text-sm outline-marigold"
                  />
                  <button
                    onClick={() => (name.trim() ? setStep(2) : alert('Write your name on the chit 🌸'))}
                    className="mt-4 rounded-full bg-maroon px-8 py-3 text-sm font-bold text-white active:scale-95"
                  >
                    NEXT →
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <p className="text-[10px] tracking-[2px] text-sand">STEP 2 OF 3</p>
                  <h3 className="mt-2 text-xl text-maroon" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                    Catch your flowers
                  </h3>
                  <p className="mt-1 text-xs text-sand">
                    Pick as many as your heart wants — they bloom with your wish:
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {FLOWERS.map((f) => (
                      <motion.button
                        key={f}
                        whileTap={{ scale: 1.4 }}
                        transition={spring}
                        onClick={() =>
                          setPicked((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]))
                        }
                        className={`min-h-[42px] min-w-[42px] rounded-full border-[1.5px] text-lg ${
                          picked.includes(f)
                            ? 'border-maroon bg-maroon/10 shadow-[0_0_0_2px_#d4a017]'
                            : 'border-gold bg-white'
                        }`}
                      >
                        {f}
                      </motion.button>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="mt-5 rounded-full bg-maroon px-8 py-3 text-sm font-bold text-white active:scale-95"
                  >
                    NEXT →
                  </button>
                </>
              )}
              {step === 3 && (
                <>
                  <p className="text-[10px] tracking-[2px] text-sand">STEP 3 OF 3</p>
                  <h3 className="mt-2 text-xl text-maroon" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                    Whisper your wish
                  </h3>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What does your heart wish for?"
                    className="mt-4 w-full rounded-xl border-[1.5px] border-[#e5d3b8] bg-white px-4 py-3 text-sm outline-marigold"
                  />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste the link so brother finds the right one (https://…)"
                    type="url"
                    className="mt-3 w-full rounded-xl border-[1.5px] border-[#e5d3b8] bg-white px-4 py-3 text-sm outline-marigold"
                  />
                  <button
                    onClick={tieWish}
                    disabled={busy}
                    className="mt-4 rounded-full bg-maroon px-8 py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-60"
                  >
                    {busy ? 'TYING…' : '🪢 KNOT IT ON THE THREAD'}
                  </button>
                </>
              )}
              {step === 4 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                    className="text-5xl"
                  >
                    ✨
                  </motion.div>
                  <h3 className="mt-3 text-xl text-maroon" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                    {blessing}
                  </h3>
                  <p className="mt-1 text-xs text-sand">Your rakhi is knotted on the family thread. 🪢</p>
                  <button
                    onClick={() => setMode(null)}
                    className="mt-4 rounded-full bg-maroon px-8 py-3 text-sm font-bold text-white active:scale-95"
                  >
                    SEE THE THREAD
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BROTHER'S LIST ── */}
        {mode === 'brother' && (
          <div className="mx-auto mt-8 max-w-2xl text-left">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterName(null)}
                className={`min-h-[42px] rounded-full border-[1.5px] px-5 text-sm font-semibold ${
                  filterName === null ? 'border-maroon bg-maroon text-white' : 'border-gold bg-white text-maroon'
                }`}
              >
                ALL
              </button>
              {names.map((n) => (
                <button
                  key={n}
                  onClick={() => setFilterName(n)}
                  className={`min-h-[42px] rounded-full border-[1.5px] px-5 text-sm font-semibold ${
                    filterName === n ? 'border-maroon bg-maroon text-white' : 'border-gold bg-white text-maroon'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {listed.map((w) => {
                let host = ''
                try {
                  host = new URL(w.url).hostname.replace('www.', '')
                } catch { /* empty */ }
                return (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border-l-4 border-marigold bg-white px-4 py-3.5 shadow-[0_3px_12px_rgba(123,30,38,0.06)]"
                  >
                    <span className="text-lg">{(w.flowers || []).join('')}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{w.title}</p>
                      <p className="text-xs text-sand">
                        {w.name} · {host}
                      </p>
                    </div>
                    <a
                      href={w.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-mehndi"
                    >
                      OPEN ↗
                    </a>
                    <button
                      onClick={() => removeWish(w.id).then(refresh)}
                      className="px-1 text-[#cc9988]"
                      aria-label="remove wish"
                    >
                      ✕
                    </button>
                  </motion.div>
                )
              })}
              {listed.length === 0 && (
                <p className="py-6 text-center text-sm text-sand">No wishes yet 🎁</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* tapped flower card */}
      <AnimatePresence>
        {openWish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5"
            onClick={() => setOpenWish(null)}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={spring}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl border-t-[5px] border-marigold bg-[#fffdf4] p-7 text-center shadow-2xl"
            >
              <div className="text-4xl">{(openWish.flowers || []).join('') || '🌸'}</div>
              <h3 className="mt-3 text-xl text-maroon" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                {openWish.title}
              </h3>
              <p className="mt-1 text-xs text-sand">wished by <b>{openWish.name}</b></p>
              <a
                href={openWish.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full bg-maroon px-7 py-3 text-sm font-bold text-white"
              >
                OPEN GIFT ↗
              </a>
              <div>
                <button
                  onClick={() => setOpenWish(null)}
                  className="mt-3 text-xs font-semibold tracking-wide text-sand"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
