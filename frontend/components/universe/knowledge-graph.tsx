"use client"

import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

export type Phase = "hero" | "collapsing" | "workspace"

const NODE_COLORS = {
  paper: new THREE.Color("#3b82f6"),
  contradiction: new THREE.Color("#ff3b46"),
  gap: new THREE.Color("#ffce4a"),
}

/* Radial gradient sprite so every point reads as a soft glowing orb */
function makeGlowTexture() {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.2, "rgba(255,255,255,0.85)")
  g.addColorStop(0.45, "rgba(255,255,255,0.25)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/* ---- Node shader: each point is alive — twinkling, pulsing, waving ---- */
const NODE_VERTEX = /* glsl */ `
  attribute float size;
  attribute vec3 color;
  attribute float seed;
  attribute float ntype; // 0 paper, 1 contradiction, 2 gap
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uScale;
  uniform float uTime;
  void main() {
    vColor = color;
    float s = size;
    float a = 1.0;
    float ph = seed * 6.2831;

    if (ntype < 0.5) {
      // research papers gently appear and disappear
      float life = sin(uTime * 0.35 + ph);
      a = smoothstep(-0.75, 0.15, life);
      s *= 0.82 + 0.18 * sin(uTime * 1.6 + ph);
    } else if (ntype < 1.5) {
      // contradiction nodes emit sharp red pulses
      float pulse = sin(uTime * 3.0 + ph);
      s *= 1.35 + 0.75 * max(pulse, 0.0);
      a = 0.7 + 0.3 * max(pulse, 0.0);
    } else {
      // research gaps emit slow golden waves
      s *= 1.25 + 0.4 * sin(uTime * 1.1 + ph);
      a = 0.85 + 0.15 * sin(uTime * 1.1 + ph);
    }

    vAlpha = a;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = s * (uScale / -mv.z) * 8.0;
    gl_Position = projectionMatrix * mv;
  }
`

const NODE_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.01) discard;
    gl_FragColor = vec4(vColor, 1.0) * tex * vAlpha;
  }
`

/* ---- Line shader: citation pathways dynamically form and dissolve ---- */
const LINE_VERTEX = /* glsl */ `
  attribute vec3 color;
  attribute float lseed;
  varying vec3 vColor;
  varying float vA;
  uniform float uTime;
  void main() {
    vColor = color;
    float pulse = sin(uTime * 0.45 + lseed * 6.2831);
    vA = smoothstep(-0.35, 0.65, pulse);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const LINE_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vA;
  void main() {
    gl_FragColor = vec4(vColor, vA * 0.5);
  }
`

/* ---- Gap wave shader: expanding golden ripples around gap hubs ---- */
const WAVE_VERTEX = /* glsl */ `
  attribute float seed;
  varying float vAlpha;
  uniform float uScale;
  uniform float uTime;
  void main() {
    float cycle = fract(uTime * 0.18 + seed);
    float grow = cycle * 9.0;        // ripple radius growth (point size)
    vAlpha = (1.0 - cycle) * 0.5;    // fade as it expands
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (2.0 + grow) * (uScale / -mv.z) * 8.0;
    gl_Position = projectionMatrix * mv;
  }
`

const WAVE_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  varying float vAlpha;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.01) discard;
    // ring-like falloff
    gl_FragColor = vec4(1.0, 0.82, 0.32, 1.0) * tex.a * vAlpha;
  }
`

type GraphData = {
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  seeds: Float32Array
  ntypes: Float32Array
  count: number
  linePositions: Float32Array
  lineColors: Float32Array
  lineSeeds: Float32Array
  segCount: number
  flowPositions: Float32Array
  flowSeeds: Float32Array
  flowCount: number
  gapPositions: Float32Array
  gapSeeds: Float32Array
  gapCount: number
  starPositions: Float32Array
  starSizes: Float32Array
  starCount: number
  bokehPositions: Float32Array
  bokehColors: Float32Array
  bokehCount: number
}

function buildGraph(): GraphData {
  const clusters = 64
  const perCluster = 42
  const count = clusters * perCluster
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const seeds = new Float32Array(count)
  const ntypes = new Float32Array(count)

  const spread = 46
  const clusterCenters: THREE.Vector3[] = []
  for (let c = 0; c < clusters; c++) {
    clusterCenters.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * spread * 2,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 1.6,
      ),
    )
  }

  const linePairs: number[] = []
  const lineCols: number[] = []
  const lineSeedArr: number[] = []
  const gapHubs: number[] = []
  const tmp = new THREE.Color()

  let i = 0
  for (let c = 0; c < clusters; c++) {
    const center = clusterCenters[c]
    for (let n = 0; n < perCluster; n++) {
      const isHub = n === 0
      const radius = isHub ? 0 : Math.pow(Math.random(), 0.6) * 7
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const px = center.x + radius * Math.sin(phi) * Math.cos(theta)
      const py = center.y + radius * Math.sin(phi) * Math.sin(theta)
      const pz = center.z + radius * Math.cos(phi)

      positions[i * 3] = px
      positions[i * 3 + 1] = py
      positions[i * 3 + 2] = pz
      seeds[i] = Math.random()

      const r = Math.random()
      let type: 0 | 1 | 2 = 0
      if (isHub && Math.random() < 0.5) type = 2
      else if (r < 0.08) type = 1
      else if (r < 0.13) type = 2
      ntypes[i] = type

      if (type === 2) gapHubs.push(px, py, pz)

      const col =
        type === 0 ? NODE_COLORS.paper : type === 1 ? NODE_COLORS.contradiction : NODE_COLORS.gap
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b

      sizes[i] = isHub ? 2.6 + Math.random() * 1.4 : 0.5 + Math.random() * 0.9
      if (type === 2) sizes[i] *= 1.6
      if (type === 1) sizes[i] *= 1.25

      if (!isHub) {
        const hubIndex = c * perCluster
        linePairs.push(
          positions[hubIndex * 3],
          positions[hubIndex * 3 + 1],
          positions[hubIndex * 3 + 2],
          px,
          py,
          pz,
        )
        tmp.copy(col).multiplyScalar(0.5)
        lineCols.push(0.25, 0.45, 0.85, tmp.r, tmp.g, tmp.b)
        const ls = Math.random()
        lineSeedArr.push(ls, ls)
      }
      i++
    }
  }

  // Long-range inter-cluster citation bridges
  for (let b = 0; b < 90; b++) {
    const a = Math.floor(Math.random() * clusters) * perCluster
    const d = Math.floor(Math.random() * clusters) * perCluster
    linePairs.push(
      positions[a * 3],
      positions[a * 3 + 1],
      positions[a * 3 + 2],
      positions[d * 3],
      positions[d * 3 + 1],
      positions[d * 3 + 2],
    )
    lineCols.push(0.2, 0.4, 0.8, 0.2, 0.4, 0.8)
    const ls = Math.random()
    lineSeedArr.push(ls, ls)
  }

  const linePositions = new Float32Array(linePairs)
  const segCount = linePositions.length / 6

  // Ambient drifting motes
  const flowCount = 900
  const flowPositions = new Float32Array(flowCount * 3)
  const flowSeeds = new Float32Array(flowCount)
  for (let f = 0; f < flowCount; f++) {
    flowPositions[f * 3] = (Math.random() - 0.5) * spread * 2.2
    flowPositions[f * 3 + 1] = (Math.random() - 0.5) * spread * 1.3
    flowPositions[f * 3 + 2] = (Math.random() - 0.5) * spread * 1.8
    flowSeeds[f] = Math.random() * 100
  }

  // Gap ripple sources
  const gapCount = gapHubs.length / 3
  const gapPositions = new Float32Array(gapHubs)
  const gapSeeds = new Float32Array(gapCount)
  for (let g = 0; g < gapCount; g++) gapSeeds[g] = Math.random()

  // Far background starfield (depth layer)
  const starCount = 1400
  const starPositions = new Float32Array(starCount * 3)
  const starSizes = new Float32Array(starCount)
  for (let s = 0; s < starCount; s++) {
    starPositions[s * 3] = (Math.random() - 0.5) * 360
    starPositions[s * 3 + 1] = (Math.random() - 0.5) * 260
    starPositions[s * 3 + 2] = -90 - Math.random() * 160
    starSizes[s] = 0.4 + Math.random() * 1.4
  }

  // Large soft bokeh orbs near the camera (depth-of-field foreground)
  const bokehCount = 14
  const bokehPositions = new Float32Array(bokehCount * 3)
  const bokehColors = new Float32Array(bokehCount * 3)
  const palette = [NODE_COLORS.paper, NODE_COLORS.contradiction, NODE_COLORS.gap]
  for (let b = 0; b < bokehCount; b++) {
    bokehPositions[b * 3] = (Math.random() - 0.5) * 60
    bokehPositions[b * 3 + 1] = (Math.random() - 0.5) * 40
    bokehPositions[b * 3 + 2] = 6 + Math.random() * 14
    const col = palette[Math.floor(Math.random() * palette.length)]
    bokehColors[b * 3] = col.r
    bokehColors[b * 3 + 1] = col.g
    bokehColors[b * 3 + 2] = col.b
  }

  return {
    positions,
    colors,
    sizes,
    seeds,
    ntypes,
    count,
    linePositions,
    lineColors: new Float32Array(lineCols),
    lineSeeds: new Float32Array(lineSeedArr),
    segCount,
    flowPositions,
    flowSeeds,
    flowCount,
    gapPositions,
    gapSeeds,
    gapCount,
    starPositions,
    starSizes,
    starCount,
    bokehPositions,
    bokehColors,
    bokehCount,
  }
}

export function KnowledgeGraph({
  phase,
  pointer,
}: {
  phase: Phase
  pointer: React.RefObject<{ x: number; y: number }>
}) {
  const data = useMemo(buildGraph, [])
  const glow = useMemo(makeGlowTexture, [])

  // Depth layers
  const starGroup = useRef<THREE.Group>(null) // background
  const group = useRef<THREE.Group>(null) // midground (the graph)
  const fgGroup = useRef<THREE.Group>(null) // foreground bokeh

  const nodesRef = useRef<THREE.Points>(null)
  const flowRef = useRef<THREE.Points>(null)
  const packetRef = useRef<THREE.Points>(null)
  const nodeMat = useRef<THREE.ShaderMaterial>(null)
  const lineMat = useRef<THREE.ShaderMaterial>(null)
  const waveMat = useRef<THREE.ShaderMaterial>(null)
  const { camera } = useThree()

  const basePositions = useMemo(() => data.positions.slice(), [data])
  const collapseFactor = useRef(1)

  // Information packets travelling across the citation network
  const PACKETS = 240
  const packets = useMemo(() => {
    const seg = new Int32Array(PACKETS)
    const prog = new Float32Array(PACKETS)
    const speed = new Float32Array(PACKETS)
    const pos = new Float32Array(PACKETS * 3)
    for (let p = 0; p < PACKETS; p++) {
      seg[p] = Math.floor(Math.random() * data.segCount)
      prog[p] = Math.random()
      speed[p] = 0.25 + Math.random() * 0.6
    }
    return { seg, prog, speed, pos }
  }, [data])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const d = Math.min(delta, 0.05)
    const p = pointer.current ?? { x: 0, y: 0 }

    // Slow cinematic camera drift + mouse parallax
    const targetX = Math.sin(t * 0.05) * 2 + p.x * 4
    const targetY = Math.cos(t * 0.04) * 1.4 + p.y * 3
    camera.position.x += (targetX - camera.position.x) * 0.02
    camera.position.y += (targetY - camera.position.y) * 0.02
    camera.lookAt(0, 0, 0)

    // Per-layer parallax — establishes real depth
    if (starGroup.current) {
      starGroup.current.rotation.y = t * 0.004
      starGroup.current.position.x = -p.x * 1.2
      starGroup.current.position.y = -p.y * 1.0
    }
    if (group.current) {
      group.current.rotation.y = t * 0.015
      group.current.rotation.x = Math.sin(t * 0.05) * 0.04
    }
    if (fgGroup.current) {
      fgGroup.current.position.x = -p.x * 6
      fgGroup.current.position.y = -p.y * 5
      fgGroup.current.rotation.z = t * 0.01
    }

    // Drive all shader time uniforms (twinkle / pulse / wave / form-dissolve)
    if (nodeMat.current) nodeMat.current.uniforms.uTime.value = t
    if (lineMat.current) lineMat.current.uniforms.uTime.value = t
    if (waveMat.current) waveMat.current.uniforms.uTime.value = t

    // Ambient drifting motes
    const flowAttr = flowRef.current?.geometry.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined
    if (flowAttr) {
      const arr = flowAttr.array as Float32Array
      for (let f = 0; f < data.flowCount; f++) {
        arr[f * 3] += Math.sin(t * 0.3 + data.flowSeeds[f]) * d * 0.6
        arr[f * 3 + 1] += d * 0.5
        if (arr[f * 3 + 1] > 32) arr[f * 3 + 1] = -32
      }
      flowAttr.needsUpdate = true
    }

    // Information packets travelling along citation pathways
    const packetAttr = packetRef.current?.geometry.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined
    if (packetAttr) {
      const lp = data.linePositions
      const { seg, prog, speed, pos } = packets
      for (let k = 0; k < PACKETS; k++) {
        prog[k] += speed[k] * d
        if (prog[k] >= 1) {
          prog[k] = 0
          seg[k] = Math.floor(Math.random() * data.segCount)
        }
        const s = seg[k] * 6
        const u = prog[k]
        pos[k * 3] = lp[s] + (lp[s + 3] - lp[s]) * u
        pos[k * 3 + 1] = lp[s + 1] + (lp[s + 4] - lp[s + 1]) * u
        pos[k * 3 + 2] = lp[s + 2] + (lp[s + 5] - lp[s + 2]) * u
      }
      packetAttr.array.set(pos)
      packetAttr.needsUpdate = true
    }

    // Collapse transition: nodes accelerate outward toward the camera
    const target = phase === "collapsing" ? 2.6 : 1
    collapseFactor.current +=
      (target - collapseFactor.current) * d * (phase === "collapsing" ? 2.4 : 1)
    const cf = collapseFactor.current
    const posAttr = nodesRef.current?.geometry.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined
    if (posAttr && Math.abs(cf - 1) > 0.001) {
      const arr = posAttr.array as Float32Array
      for (let k = 0; k < data.count * 3; k++) {
        arr[k] = basePositions[k] * cf
      }
      posAttr.needsUpdate = true
    }
    if (phase === "collapsing") {
      camera.position.z += (4 - camera.position.z) * d * 1.6
    }
  })

  return (
    <>
      {/* BACKGROUND LAYER — distant starfield */}
      <group ref={starGroup}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.starPositions, 3]} />
            <bufferAttribute attach="attributes-size" args={[data.starSizes, 1]} />
          </bufferGeometry>
          <pointsMaterial
            color="#cdd8ff"
            size={1.1}
            sizeAttenuation
            map={glow}
            alphaMap={glow}
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* MIDGROUND LAYER — the living knowledge graph */}
      <group ref={group}>
        {/* Citation pathways that form and dissolve */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.linePositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[data.lineColors, 3]} />
            <bufferAttribute attach="attributes-lseed" args={[data.lineSeeds, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={lineMat}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            uniforms={{ uTime: { value: 0 } }}
            vertexShader={LINE_VERTEX}
            fragmentShader={LINE_FRAGMENT}
          />
        </lineSegments>

        {/* Slow golden waves emanating from research-gap hubs */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.gapPositions, 3]} />
            <bufferAttribute attach="attributes-seed" args={[data.gapSeeds, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={waveMat}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            uniforms={{ uMap: { value: glow }, uScale: { value: 26 }, uTime: { value: 0 } }}
            vertexShader={WAVE_VERTEX}
            fragmentShader={WAVE_FRAGMENT}
          />
        </points>

        {/* Living nodes — twinkling papers, pulsing contradictions, waving gaps */}
        <points ref={nodesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
            <bufferAttribute attach="attributes-size" args={[data.sizes, 1]} />
            <bufferAttribute attach="attributes-seed" args={[data.seeds, 1]} />
            <bufferAttribute attach="attributes-ntype" args={[data.ntypes, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={nodeMat}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            uniforms={{ uMap: { value: glow }, uScale: { value: 26 }, uTime: { value: 0 } }}
            vertexShader={NODE_VERTEX}
            fragmentShader={NODE_FRAGMENT}
          />
        </points>

        {/* Information packets travelling the network */}
        <points ref={packetRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[packets.pos, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color="#bfe3ff"
            size={0.55}
            sizeAttenuation
            map={glow}
            alphaMap={glow}
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Ambient drifting motes */}
        <points ref={flowRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.flowPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color="#ffffff"
            size={0.35}
            sizeAttenuation
            map={glow}
            alphaMap={glow}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* FOREGROUND LAYER — large soft bokeh for depth of field */}
      <group ref={fgGroup}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.bokehPositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[data.bokehColors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            vertexColors
            size={16}
            sizeAttenuation
            map={glow}
            alphaMap={glow}
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </>
  )
}
