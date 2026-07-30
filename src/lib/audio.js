// Tiny synthesized temple-bell chime — no audio files needed.
let ctx

export function chime() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    ;[523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.12 / (i + 1), now + 0.02 + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6 + i * 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.06)
      osc.stop(now + 2.2 + i * 0.3)
    })
  } catch {
    /* sound is a bonus, never an error */
  }
}
