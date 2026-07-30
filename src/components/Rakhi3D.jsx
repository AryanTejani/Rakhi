import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// Real 3D rakhi medallion — slow spin, leans toward the finger/cursor.
// Lazy-loaded; weak devices get the SVG rakhi instead (see Hero.jsx).

function Petal({ angle, radius, color }) {
  const x = Math.sin(angle) * radius
  const y = Math.cos(angle) * radius
  return (
    <mesh position={[x, y, 0]} rotation={[0, 0, -angle]} scale={[0.42, 0.78, 0.16]}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  )
}

function Bead({ angle, radius }) {
  const x = Math.sin(angle) * radius
  const y = Math.cos(angle) * radius
  return (
    <mesh position={[x, y, 0.14]}>
      <sphereGeometry args={[0.09, 16, 12]} />
      <meshStandardMaterial color="#fff3df" roughness={0.2} metalness={0.3} />
    </mesh>
  )
}

function Medallion() {
  const group = useRef()

  useFrame((state) => {
    const g = group.current
    // gentle rocking, never edge-on — a full spin turns the medallion into a sliver
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.5
    // lean toward pointer/touch — the "alive" feel
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, state.pointer.y * 0.4, 0.06)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -state.pointer.x * 0.3, 0.06)
  })

  const N = 12
  const petals = Array.from({ length: N }, (_, i) => (i / N) * Math.PI * 2)
  const beads = Array.from({ length: N }, (_, i) => ((i + 0.5) / N) * Math.PI * 2)

  return (
    <group ref={group}>
      {petals.map((a, i) => (
        <Petal key={a} angle={a} radius={1.18} color={i % 2 ? '#ff9933' : '#ffb75e'} />
      ))}
      {beads.map((a) => (
        <Bead key={a} angle={a} radius={1.62} />
      ))}

      {/* gold ring */}
      <mesh>
        <torusGeometry args={[0.72, 0.13, 20, 48]} />
        <meshStandardMaterial color="#d4a017" roughness={0.25} metalness={0.75} />
      </mesh>

      {/* maroon core dome */}
      <mesh scale={[1, 1, 0.62]}>
        <sphereGeometry args={[0.58, 32, 24]} />
        <meshStandardMaterial color="#7b1e26" roughness={0.4} />
      </mesh>

      {/* center jewel */}
      <mesh position={[0, 0, 0.4]}>
        <sphereGeometry args={[0.18, 20, 16]} />
        <meshStandardMaterial
          color="#ffe08a"
          roughness={0.1}
          metalness={0.6}
          emissive="#ff9933"
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  )
}

export default function Rakhi3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#fff3df" />
      <pointLight position={[-4, -2, 3]} intensity={0.5} color="#ff9933" />

      <Float speed={2.2} rotationIntensity={0.25} floatIntensity={0.9}>
        <Medallion />
      </Float>

      <Sparkles count={26} scale={5.5} size={2.6} speed={0.35} color="#ffd9a0" />
    </Canvas>
  )
}
