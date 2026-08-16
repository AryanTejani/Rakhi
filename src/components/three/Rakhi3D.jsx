import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { maxDpr, pick } from '../../lib/device'
import { rakhiSpec } from '../../lib/seed'

/* ============================================================================
   The rakhi you actually tie — real geometry, neutral studio lighting.

   Every mesh here is instanced or shared, so the whole medallion plus its
   thread is a handful of draw calls. Segment counts are picked per device:
   a phone gets a 10-segment torus nobody can tell from a 48-segment one.
   ========================================================================== */
function Medallion({ seed, tie }) {
  const group = useRef()
  const spec = useMemo(() => rakhiSpec(seed), [seed])

  const seg = pick([8, 24], [10, 32], [14, 48])
  const sphereSeg = pick([8, 6], [12, 8], [16, 12])

  const thread = useRef()

  // the two threads that hang off a real rakhi
  const tube = useMemo(() => {
    // routed BEHIND the medallion (negative z through the middle)
    // Inverted Y coordinates so threads hang downwards (bottom to top wrap)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.7, -1.8, 0.1),
      new THREE.Vector3(-0.9, -0.4, -0.5),
      new THREE.Vector3(0, 0.15, -0.6),
      new THREE.Vector3(0.9, -0.4, -0.5),
      new THREE.Vector3(1.7, -1.8, 0.1),
    ])
    const g = new THREE.TubeGeometry(curve, pick(24, 40, 64), 0.05, pick(4, 5, 6), false)
    g.setDrawRange(0, 0) // nothing is tied yet
    return g
  }, [])

  // instanced brass beads around the ring — one draw call for all of them
  const beadMatrices = useMemo(() => {
    const m = new THREE.Matrix4()
    const out = []
    for (let i = 0; i < spec.beads; i++) {
      const a = (i / spec.beads) * Math.PI * 2
      m.makeTranslation(Math.cos(a) * 1.05, Math.sin(a) * 1.05, 0.06)
      out.push(m.clone())
    }
    return out
  }, [spec.beads])

  const beadsRef = useRef()

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.5
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, state.pointer.y * 0.35, 0.06)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -state.pointer.x * 0.28, 0.06)

    // the tie: the thread grows along its own curve instead of fading in
    const t = thread.current
    if (t) {
      const total = tube.index.count
      const target = tie ? total : 0
      const cur = Number.isFinite(t.geometry.drawRange.count) ? t.geometry.drawRange.count : 0
      const next = THREE.MathUtils.damp(cur, target, 2.4, delta)
      t.geometry.setDrawRange(0, Math.round(next))
    }

    if (beadsRef.current && !beadsRef.current.userData.set) {
      beadMatrices.forEach((m, i) => beadsRef.current.setMatrixAt(i, m))
      beadsRef.current.instanceMatrix.needsUpdate = true
      beadsRef.current.userData.set = true
    }
  })

  const petals = Array.from({ length: spec.petals }, (_, i) => (i / spec.petals) * Math.PI * 2)

  return (
    <group ref={group}>
      {petals.map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * 1.5, Math.sin(a) * 1.5, -0.02]}
          rotation={[0, 0, a]}
          /* long and flat, so they read as silk petals rather than balloons */
          scale={[0.55, 0.15, 0.05]}
        >
          <sphereGeometry args={[1, sphereSeg[0], sphereSeg[1]]} />
          <meshStandardMaterial color={spec.ring} roughness={0.62} metalness={0.05} />
        </mesh>
      ))}

      <instancedMesh ref={beadsRef} args={[null, null, spec.beads]}>
        <sphereGeometry args={[0.11, sphereSeg[0], sphereSeg[1]]} />
        <meshStandardMaterial color="#FFC727" roughness={0.24} metalness={0.85} />
      </instancedMesh>

      {/* kumkum ring */}
      <mesh>
        <torusGeometry args={[1.05, 0.09, seg[0], seg[1]]} />
        <meshStandardMaterial color={spec.ring} roughness={0.42} metalness={0.15} />
      </mesh>

      {/* core — a flat disc, not a ball; a rakhi is a medallion */}
      <mesh scale={[1, 1, 0.34]}>
        <sphereGeometry args={[0.36, sphereSeg[0] * 2, sphereSeg[1] * 2]} />
        <meshStandardMaterial color={spec.core} roughness={0.42} metalness={0.35} />
      </mesh>

      <mesh position={[0, 0, 0.19]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial
          color={spec.ring}
          roughness={0.15}
          metalness={0.3}
          emissive={spec.ring}
          emissiveIntensity={0.8}
        />
      </mesh>

      <mesh ref={thread} geometry={tube} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#DB3F3C" roughness={0.75} />
      </mesh>
    </group>
  )
}

export default function Rakhi3D({ seed = 'mogra', tie = false, className = '' }) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      dpr={[1, maxDpr()]}
      gl={{ antialias: pick(false, true, true), alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y' }}
    >
      {/* neutral key light + a red rim — the indigo-moonlight ambient tint
          only made sense against the old dark ground */}
      <ambientLight intensity={0.75} color="#ffffff" />
      <directionalLight position={[2.5, 3, 4]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-3.5, -1.5, 2]} intensity={2.2} distance={14} color="#DB3F3C" />

      <Float speed={2} rotationIntensity={0.22} floatIntensity={0.8}>
        <Medallion seed={seed} tie={tie} />
      </Float>

      <Sparkles count={pick(14, 22, 32)} scale={6} size={2.2} speed={0.3} color="#FFC727" />
    </Canvas>
  )
}
