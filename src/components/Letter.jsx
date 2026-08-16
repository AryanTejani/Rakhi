import { motion } from 'motion/react'

// ✍️ EDIT THIS — the real letter to your sisters. The emotional core of the site.
// The 3D is only the delivery; this is the payload.
// Each entry is a whole thought — they render as separate paragraphs, so a
// line that trails off mid-sentence leaves its punctuation dangling.
const LETTER_LINES = [
  'Dear sisters,',
  'Some threads are not made of cotton or silk. They are made of laughter, fights, secrets kept, and prayers whispered.',
  'You still call to ask if I have eaten. You still know from one word on the phone that the day went badly.',
  'You are my strength, my madness, and my family.',
]

export default function Letter() {
  return (
    <section className="relative z-10 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-center">Unfolded</p>
        <h2 className="h2 mt-3 text-center">
          The <em>letter</em>
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto mt-10 max-w-xl rounded-sm border-l-2 border-kumkum bg-night-2/80 px-7 py-9 backdrop-blur-sm md:px-10"
        >
          {LETTER_LINES.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 + i * 0.3, duration: 0.6 }}
              className="mt-4 text-[1.02rem] leading-loose text-moon first:mt-0"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {line}
            </motion.p>
          ))}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + LETTER_LINES.length * 0.3, duration: 0.8 }}
            className="mt-8 text-right text-lg text-brass"
            style={{ fontFamily: 'var(--font-indic)' }}
          >
            — તમારો ભાઈ
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
