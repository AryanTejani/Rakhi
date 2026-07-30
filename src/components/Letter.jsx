import { motion } from 'motion/react'

// ✍️ EDIT THIS — the real letter to your sisters. The emotional core of the site.
const LETTER_LINES = [
  'Dear sisters,',
  'Some threads are not made of cotton or silk —',
  'they are made of laughter, fights, secrets kept, and prayers whispered.',
  'You are my strength, my madness, and my family.',
  'This little site is my rakhi gift to all of you.',
  'Happy Raksha Bandhan. 💛',
]

export default function Letter() {
  return (
    <section className="px-5 py-20 md:py-28">
      <h2
        className="text-center text-[clamp(1.7rem,6vw,2.5rem)] font-semibold text-maroon"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        For My Sisters
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mx-auto mt-8 max-w-xl rounded-md border-t-[6px] border-marigold bg-[#fffdf6] px-7 py-10 shadow-[0_10px_30px_rgba(58,38,32,0.12)] md:px-11"
      >
        {LETTER_LINES.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + i * 0.35, duration: 0.6 }}
            className="text-[1.02rem] italic leading-loose text-[#5d4636]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {line}
          </motion.p>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + LETTER_LINES.length * 0.35, duration: 0.8 }}
          className="mt-6 text-right text-xl text-maroon"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          — your brother ♥
        </motion.p>
      </motion.div>
    </section>
  )
}
