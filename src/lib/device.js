// Device budget. The site is opened on mid-range Indian Android phones first,
// desktop second — so every 3D scene asks here before it decides how much to draw.

export const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const hasWebGL = (() => {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
})()

// True when we should render 3D at all.
export const can3D = hasWebGL && !reducedMotion

const coarse =
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches

const smallScreen =
  typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 700

const weakCores = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 8) <= 4

// 'low' phones, 'mid' tablets/light laptops, 'high' desktops.
export const tier = (() => {
  if (!hasWebGL) return 'none'
  if ((coarse && smallScreen) || weakCores) return 'low'
  if (coarse || smallScreen) return 'mid'
  return 'high'
})()

export const pick = (low, mid, high) => (tier === 'low' ? low : tier === 'mid' ? mid : high)

// Never render at 3x on a phone — it is a 9x fill-rate bill for no visible gain.
export const maxDpr = () =>
  Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, pick(1.5, 1.75, 2))

// Pause any rAF loop while its canvas is offscreen. Every scene uses this;
// three simultaneous render loops on a phone is how the battery dies.
export function onVisible(el, cb) {
  const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold: 0.01 })
  io.observe(el)
  return () => io.disconnect()
}
