import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import Threads from './components/Threads'
import SacredThread from './components/SacredThread'
import TieRakhi from './components/TieRakhi'
import Letter from './components/Letter'
import Blessing from './components/Blessing'
import Spine from './components/Spine'

function AgentationDev() {
  const [Agentation, setAgentation] = useState(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return

    let mounted = true
    import('agentation').then((mod) => {
      if (mounted) setAgentation(() => mod.Agentation)
    })

    return () => {
      mounted = false
    }
  }, [])

  return Agentation ? <Agentation endpoint="http://localhost:4747" /> : null
}

export default function App() {
  return (
    <>
      <Spine />
      <main>
        <Hero />
        <Threads />
        <SacredThread />
        <TieRakhi />
        <Letter />
        <Blessing />
      </main>
      <footer className="relative z-10 border-t border-brass/15 py-10 text-center text-[0.72rem] uppercase tracking-[0.14em] text-moon-dim">
        Shravan Purnima · તમારા માટે
      </footer>
      <AgentationDev />
    </>
  )
}
