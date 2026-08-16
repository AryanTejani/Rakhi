import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { maxDpr, onVisible, pick } from '../../lib/device'

/* ============================================================================
   THE HERO — one point cloud, many shapes.

   Same idea as three.js's webgpu_compute_particles demos, rebuilt on plain
   WebGL so it survives a mid-range Android: positions live in two attributes
   and the morph is a mix() in the vertex shader, so the whole cloud is ONE
   draw call and the CPU never touches a particle after boot.

   The cycle is dust → રક્ષાબંધન → a rakhi mandala → dust, on a loop.
   Matter reorganising itself, not a crossfade.
   ========================================================================== */

const VERT = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aRand;

  uniform float uProgress;
  uniform float uSize;
  uniform float uTime;
  uniform float uPixelRatio;

  varying float vRand;

  void main() {
    // each particle leaves at a slightly different moment, so the shape
    // dissolves like sand rather than snapping like a slide transition
    float delay = aRand * 0.35;
    float t = clamp((uProgress - delay) / 0.65, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);            // smoothstep ease

    vec3 pos = mix(aFrom, aTo, t);

    // bloom outward at mid-flight
    float arc = sin(t * 3.141592);
    pos += normalize(pos + vec3(0.0001)) * arc * (0.35 + aRand * 1.1);

    // settled shapes still breathe
    pos.x += sin(uTime * 0.5 + aRand * 21.0) * 0.028;
    pos.y += cos(uTime * 0.4 + aRand * 17.0) * 0.028;

    vRand = aRand;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 / max(0.001, -mv.z));
  }
`

const FRAG = /* glsl */ `
  precision mediump float;

  uniform vec3 uInk;
  uniform vec3 uGreen;
  uniform vec3 uRed;

  varying float vRand;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.05, d);

    // normal blending now (see below) — overlapping translucent points darken
    // toward solid ink in dense areas instead of the glow-toward-white the old
    // additive mode gave on a dark ground
    vec3 col = vRand < 0.58 ? uInk : (vRand < 0.86 ? uGreen : uRed);
    gl_FragColor = vec4(col, alpha * 0.5);
  }
`

/* --- shape builders: every one returns a Float32Array of length count*3 --- */

function dustShape(count) {
  const a = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 2.2 + Math.random() * 2.0
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    a[i * 3] = r * Math.sin(ph) * Math.cos(th)
    a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6
    a[i * 3 + 2] = r * Math.cos(ph) * 0.5
  }
  return a
}

// Rakhi mandala: beaded ring, petals around it, a core, and two hanging threads.
function mandalaShape(count) {
  const a = new Float32Array(count * 3)
  const PETALS = 8
  for (let i = 0; i < count; i++) {
    const roll = Math.random()
    let x, y
    if (roll < 0.24) {
      // the beaded ring — thin, so it reads as a line and not a filled donut
      const th = Math.random() * Math.PI * 2
      const r = 1.3 + (Math.random() - 0.5) * 0.07
      x = Math.cos(th) * r
      y = Math.sin(th) * r
    } else if (roll < 0.58) {
      // petals — narrow enough that the GAPS between them are visible, which
      // is the only thing that makes the silhouette read as a rakhi
      const k = Math.floor(Math.random() * PETALS)
      const base = (k / PETALS) * Math.PI * 2
      const spread = (Math.random() - 0.5) * 0.3
      const r = 1.78 + (Math.random() - 0.5) * 0.42 * Math.cos(spread * 5)
      x = Math.cos(base + spread) * r
      y = Math.sin(base + spread) * r
    } else if (roll < 0.72) {
      // inner ring, with clear empty space either side of it
      const th = Math.random() * Math.PI * 2
      const r = 0.74 + (Math.random() - 0.5) * 0.06
      x = Math.cos(th) * r
      y = Math.sin(th) * r
    } else if (roll < 0.9) {
      // core
      const th = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * 0.3
      x = Math.cos(th) * r
      y = Math.sin(th) * r
    } else {
      // the two threads hanging off the medallion
      const side = Math.random() < 0.5 ? -1 : 1
      const t = Math.random()
      x = side * (0.3 + t * 0.22 + Math.sin(t * 6) * 0.08)
      y = -1.35 - t
    }
    // sized to sit in the same optical frame as the word, and lifted so the
    // medallion is optically centred instead of the whole thing hanging low
    a[i * 3] = x * 1.45
    a[i * 3 + 1] = y * 1.45 + 0.45
    a[i * 3 + 2] = (Math.random() - 0.5) * 0.4
  }
  return a
}

// Flower: seven petals radiating from a dense spiral centre, with a stem
// and leaves at the bottom. More organic than the mandala — reads as a
// marigold rather than a geometric badge.
function flowerShape(count) {
  const a = new Float32Array(count * 3)
  const PETALS = 7

  for (let i = 0; i < count; i++) {
    const roll = Math.random()
    let x, y

    if (roll < 0.44) {
      // large outer petals — teardrop profile
      const k = Math.floor(Math.random() * PETALS)
      const base = (k / PETALS) * Math.PI * 2
      const t = Math.random()
      const width = 0.55 * Math.sin(t * Math.PI)
      const r = 0.4 + t * 1.6
      const spread = (Math.random() - 0.5) * width
      x = Math.cos(base) * r - Math.sin(base) * spread
      y = Math.sin(base) * r + Math.cos(base) * spread
    } else if (roll < 0.6) {
      // inner smaller petals (between the main ones)
      const k = Math.floor(Math.random() * PETALS) + 0.5
      const base = (k / PETALS) * Math.PI * 2
      const t = Math.random()
      const width = 0.35 * Math.sin(t * Math.PI)
      const r = 0.3 + t * 1.0
      const spread = (Math.random() - 0.5) * width
      x = Math.cos(base) * r - Math.sin(base) * spread
      y = Math.sin(base) * r + Math.cos(base) * spread
    } else if (roll < 0.76) {
      // centre disk — dense spiral like a real flower head
      const th = Math.random() * Math.PI * 2 * 6
      const r = Math.sqrt(Math.random()) * 0.42
      x = Math.cos(th + r * 8) * r
      y = Math.sin(th + r * 8) * r
    } else if (roll < 0.87) {
      // pollen dots along petal centres
      const k = Math.floor(Math.random() * PETALS)
      const base = (k / PETALS) * Math.PI * 2
      const r = 0.8 + Math.random() * 0.6
      x = Math.cos(base) * r + (Math.random() - 0.5) * 0.1
      y = Math.sin(base) * r + (Math.random() - 0.5) * 0.1
    } else {
      // stem + leaves at the bottom
      const t = Math.random()
      x = Math.sin(t * 5) * 0.12
      y = -2.0 - t * 1.2
      if (Math.random() < 0.35) {
        const side = Math.random() < 0.5 ? -1 : 1
        const lt = Math.random()
        x += side * (0.2 + lt * 0.5) * Math.sin(lt * Math.PI)
        y += lt * 0.3 - 0.4
      }
    }

    a[i * 3] = x * 1.35
    a[i * 3 + 1] = y * 1.35 + 0.3
    a[i * 3 + 2] = (Math.random() - 0.5) * 0.3
  }
  return a
}

// Rasterise text once, then scatter particles across its opaque pixels.
// Gujarati has to go through the browser's shaper — canvas fillText does
// that for free, which is why the text is sampled and not path-traced.
function textShape(count, text, { font, worldWidth = 6.4 }) {
  const W = 1400
  const H = 340
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d', { willReadFrequently: true })
  g.fillStyle = '#fff'
  g.textAlign = 'center'
  g.textBaseline = 'middle'

  // Render as large as the canvas allows — the glyphs get measured after, so
  // a bigger raster only means a finer point cloud.
  let size = H * 0.6
  g.font = `700 ${size}px ${font}`
  const w = g.measureText(text).width
  if (w > 0) size = Math.min(size * ((W * 0.94) / w), H * 0.74)
  g.font = `700 ${size}px ${font}`
  g.fillText(text, W / 2, H / 2)

  const data = g.getImageData(0, 0, W, H).data
  const hits = []
  let minX = W
  let maxX = 0
  let minY = H
  let maxY = 0
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 128) {
        hits.push(x, y)
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (!hits.length) return dustShape(count)

  // Normalise by the INK's bounding box, not the canvas. Otherwise the word
  // is sized by however much empty margin the raster happened to have, which
  // is what made it render as a small smudge.
  const spanX = Math.max(1, maxX - minX)
  const scale = worldWidth / spanX
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  const a = new Float32Array(count * 3)
  const n = hits.length / 2
  for (let i = 0; i < count; i++) {
    const k = (Math.random() * n) | 0
    const px = hits[k * 2] + (Math.random() - 0.5) * 2.4
    const py = hits[k * 2 + 1] + (Math.random() - 0.5) * 2.4
    a[i * 3] = (px - cx) * scale
    a[i * 3 + 1] = -(py - cy) * scale
    a[i * 3 + 2] = (Math.random() - 0.5) * 0.22
  }
  return a
}

export default function ParticleMorph() {
  const host = useRef(null)

  useEffect(() => {
    const el = host.current
    if (!el) return

    const COUNT = pick(12000, 26000, 45000)
    const HOLD = 3200 // ms a shape is held — long enough to actually read it
    const MORPH = 2000 // ms a transition takes

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
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
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.z = 8

    const from = dustShape(COUNT)
    const to = dustShape(COUNT) // placeholder — replaced once the webfont loads
    const rand = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) rand[i] = Math.random()

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(from.slice(), 3)) // frustum culling only
    geo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3))
    geo.setAttribute('aTo', new THREE.BufferAttribute(to, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8)

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uProgress: { value: 0 },
        uSize: { value: pick(15, 17, 19) },
        uTime: { value: 0 },
        uPixelRatio: { value: dpr },
        uInk: { value: new THREE.Color('#1E1E1E') },
        uGreen: { value: new THREE.Color('#467E13') },
        uRed: { value: new THREE.Color('#DB3F3C') },
      },
      transparent: true,
      depthWrite: false,
      // was AdditiveBlending: correct for bright dust on a dark page, but on
      // #F5F5F5 additive only ever adds toward white — the cloud would
      // render as a faint smear. Normal blending is what makes dark ink
      // particles actually show up against a light ground.
      blending: THREE.NormalBlending,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // Fit the cloud to whatever the viewport can hold, on BOTH axes. A phone
    // is a tall narrow window (width binds); a laptop is a short wide one
    // (height binds, and fitting on width alone drops the rakhi's hanging
    // threads straight through the copy underneath).
    const TARGET_HALF_W = 3.6
    const TARGET_HALF_H = 3.4
    const fit = () => {
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
      const halfW = halfH * camera.aspect
      const s = Math.min((halfW * 0.92) / TARGET_HALF_W, (halfH * 0.9) / TARGET_HALF_H)
      points.scale.setScalar(THREE.MathUtils.clamp(s, 0.3, 1.0))
    }
    fit()

    // Shapes cycle in this order. Text shapes are appended once the webfont
    // has actually loaded — sampling before that rasterises a fallback face.
    // Shapes are populated after the webfont loads so the text rasterises
    // with the correct glyphs. Until then the cloud sits as static dust.
    const shapes = []
    let shapeIndex = -1
    let started = false

    const loadText = async () => {
      try {
        if (document.fonts) {
          await document.fonts.load('700 100px "Anek Gujarati"')
          await document.fonts.ready
        }
      } catch {
        /* sampling still works with whatever face is available */
      }
      const font = '"Anek Gujarati", system-ui, sans-serif'

      // Text appears FIRST out of the dust, then a flower, then dust again.
      // Removed mandalaShape per user request.
      shapes.push(
        (n) => textShape(n, 'રક્ષાબંધન', { font }),
        flowerShape,
        dustShape,
      )

      // Show the text IMMEDIATELY — no dust→text morph.
      // Set both aFrom AND aTo to the text shape with progress=1 so the
      // text is fully resolved the instant the first frame paints.
      const textPositions = shapes[0](COUNT)
      const aFrom = geo.getAttribute('aFrom')
      const aTo = geo.getAttribute('aTo')
      aFrom.array.set(textPositions)
      aTo.array.set(textPositions)
      aFrom.needsUpdate = true
      aTo.needsUpdate = true
      mat.uniforms.uProgress.value = 1
      shapeIndex = 0

      // Start in 'hold' so the text stays visible before transitioning.
      started = true
      phase = 'hold'
      phaseStart = performance.now()
    }
    loadText()

    /* --- timeline: morph to a shape, hold it, repeat.
       Starts mid-morph on purpose: the page opens with the dust already
       pulling itself into a rakhi, not with three seconds of static noise. --- */
    let phase = 'wait' // stays 'wait' until loadText() sets 'morph'
    let phaseStart = performance.now()

    const advance = () => {
      const aFrom = geo.getAttribute('aFrom')
      const aTo = geo.getAttribute('aTo')
      aFrom.array.set(aTo.array) // land where the last morph ended
      shapeIndex = (shapeIndex + 1) % shapes.length
      aTo.array.set(shapes[shapeIndex](COUNT))
      aFrom.needsUpdate = true
      aTo.needsUpdate = true
      mat.uniforms.uProgress.value = 0
    }

    /* --- pointer parallax --- */
    const pointer = { x: 0, y: 0 }
    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e
      pointer.x = (t.clientX / window.innerWidth) * 2 - 1
      pointer.y = (t.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let visible = true
    let running = false
    let raf = 0
    const clock = new THREE.Clock()

    const loop = () => {
      if (!visible) {
        running = false
        return
      }
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      mat.uniforms.uTime.value = clock.getElapsedTime()

      if (started) {
        if (phase === 'hold' && now - phaseStart > HOLD) {
          phase = 'morph'
          phaseStart = now
        } else if (phase === 'morph') {
          const p = Math.min(1, (now - phaseStart) / MORPH)
          mat.uniforms.uProgress.value = p
          if (p >= 1) {
            advance()
            phase = 'hold'
            phaseStart = now
          }
        }
      }

      points.rotation.y += (pointer.x * 0.28 - points.rotation.y) * 0.04
      points.rotation.x += (pointer.y * 0.18 - points.rotation.x) * 0.04

      renderer.render(scene, camera)
    }

    // One loop, ever — the observer fires on mount too, and starting a second
    // loop there would render the scene twice per frame for no difference.
    const start = () => {
      if (running) return
      running = true
      loop()
    }
    const stopWatching = onVisible(el, (v) => {
      visible = v
      if (v) {
        phaseStart = performance.now() // do not fast-forward through a scroll-away
        start()
      } else {
        cancelAnimationFrame(raf)
        running = false
      }
    })
    start()

    const onResize = () => {
      if (!el.clientWidth) return
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight, false)
      fit()
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
      window.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('webglcontextlost', onLost)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={host} className="absolute inset-0" aria-hidden="true" />
}
