// Procedural rakhi seeding.
// Every wish hashes its own name+title into a rakhi that exists exactly once —
// so Riya's kettle wish and Meera's sketchbook wish are different objects,
// not the same three variants recoloured.

export function seedFrom(str) {
  let h = 2166136261
  const s = String(str)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// xorshift32 — deterministic, no state leaking between rakhis
export function rng(seed) {
  let s = seed || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

// Every rakhi has to look different from every other rakhi WITHOUT leaving the
// client's palette — red/yellow/green plus one darker shade of each, so
// variety comes from hue+depth, not from inventing off-brand colors.
const RING = ['#DB3F3C', '#FFC727', '#467E13', '#B93A37', '#37620F']

// Every visual parameter of a rakhi, derived from one string.
export function rakhiSpec(key) {
  const r = rng(seedFrom(key))
  return {
    ring: RING[Math.floor(r() * RING.length)],
    petals: 5 + Math.floor(r() * 4), // 5–8
    beads: 6 + Math.floor(r() * 7), // 6–12
    rot: r() * 60,
    core: r() > 0.5 ? '#FFC727' : '#FFFFFF',
    beadR: 3.4 + r() * 1.8,
    inner: 13 + r() * 4,
  }
}

// Only ever render links we trust into an href. A pasted `javascript:` URL
// otherwise becomes a click-to-run script for every sister on the thread.
export function safeUrl(url) {
  try {
    const u = new URL(String(url))
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

export function hostOf(url) {
  try {
    return new URL(String(url)).hostname.replace(/^www\./, '')
  } catch {
    return 'link'
  }
}
