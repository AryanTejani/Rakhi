import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { maxDpr, onVisible, pick } from '../../lib/device'

/* ============================================================================
   The closing sky — a spiral galaxy of points behind the diya.

   Same generator as the three.js Journey galaxy, recoloured moon→kumkum and
   sized down for phones. One Points object, additive, no lights, no shadows:
   it costs almost nothing to keep on screen while the diya burns.
   ========================================================================== */

export default function Galaxy3D({ intensity = 1 }) {
  const host = useRef(null)
  const intensityRef = useRef(intensity)
  intensityRef.current = intensity

  useEffect(() => {
    const el = host.current
    if (!el) return

    const COUNT = pick(6000, 12000, 22000)
    const ARMS = 4
    const RADIUS = 6
    const SPIN = 1.1
    const RANDOMNESS = 0.42

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    } catch {
      return
    }

    const dpr = maxDpr()
    renderer.setPixelRatio(dpr)
    renderer.setSize(el.clientWidth, el.clientHeight, false)
    el.appendChild(renderer.domElement)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(0, 3.4, 7.5)
    camera.lookAt(0, 0, 0)

    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    // lives inside Blessing's dark island, not the page's light ground — the
    // near-white core still needs a bright colour, so it borrows Container
    // (#EBEBEB) rather than any text token
    const inner = new THREE.Color('#EBEBEB')
    const outer = new THREE.Color('#DB3F3C')
    const mid = new THREE.Color('#FFC727')
    const tmp = new THREE.Color()

    for (let i = 0; i < COUNT; i++) {
      const r = Math.pow(Math.random(), 1.6) * RADIUS
      const branch = ((i % ARMS) / ARMS) * Math.PI * 2
      const spin = r * SPIN
      const jitter = () => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * r

      positions[i * 3] = Math.cos(branch + spin) * r + jitter()
      positions[i * 3 + 1] = jitter() * 0.4
      positions[i * 3 + 2] = Math.sin(branch + spin) * r + jitter()

      const t = r / RADIUS
      tmp.copy(inner).lerp(mid, Math.min(1, t * 1.8)).lerp(outer, Math.max(0, t * 1.4 - 0.4))
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: pick(0.035, 0.03, 0.026),
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
    })

    const points = new THREE.Points(geo, mat)
    // lifted so the galaxy's dense core sits behind the diya, not behind the
    // blessing — the words are the subject, the sky is the ground
    points.position.y = 1.6
    scene.add(points)

    let visible = true
    let raf = 0
    const clock = new THREE.Clock()

    const loop = () => {
      if (!visible) return
      raf = requestAnimationFrame(loop)
      points.rotation.y = clock.getElapsedTime() * 0.045
      // the sky brightens when the diya is lit — but stays a background, not a
      // competitor to the words sitting on top of it
      mat.opacity += (0.13 + 0.32 * intensityRef.current - mat.opacity) * 0.03
      renderer.render(scene, camera)
    }

    const stopWatching = onVisible(el, (v) => {
      visible = v
      if (v) loop()
      else cancelAnimationFrame(raf)
    })
    loop()

    const onResize = () => {
      if (!el.clientWidth) return
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight, false)
    }
    window.addEventListener('resize', onResize, { passive: true })

    const onLost = (e) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      visible = false
    }
    renderer.domElement.addEventListener('webglcontextlost', onLost)

    return () => {
      cancelAnimationFrame(raf)
      stopWatching()
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('webglcontextlost', onLost)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={host} className="pointer-events-none absolute inset-0" aria-hidden="true" />
}
