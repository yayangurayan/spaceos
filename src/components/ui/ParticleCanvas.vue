<template>
  <canvas
    ref="canvasRef"
    class="particle-canvas"
    :style="{ opacity: opacity }"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  /** Number of particles */
  count?: number
  /** Base color in HSL hue (0-360) */
  hue?: number
  /** Secondary hue for color variety */
  hue2?: number
  /** Max connection distance */
  linkDistance?: number
  /** Particle speed multiplier */
  speed?: number
  /** Canvas opacity */
  opacity?: number
  /** Enable mouse interaction */
  interactive?: boolean
  /** Particle size range [min, max] */
  sizeRange?: [number, number]
}

const props = withDefaults(defineProps<Props>(), {
  count: 60,
  hue: 190,
  hue2: 240,
  linkDistance: 140,
  speed: 0.4,
  opacity: 0.6,
  interactive: true,
  sizeRange: () => [1.5, 4],
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  alpha: number
  pulsePhase: number
  pulseSpeed: number
}

let particles: Particle[] = []
let animationId: number | null = null
let mouse = { x: -9999, y: -9999 }
let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let dpr = 1

function initParticles() {
  particles = []
  for (let i = 0; i < props.count; i++) {
    const hue = Math.random() > 0.5 ? props.hue : props.hue2
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * props.speed,
      vy: (Math.random() - 0.5) * props.speed,
      size: props.sizeRange[0] + Math.random() * (props.sizeRange[1] - props.sizeRange[0]),
      hue: hue + (Math.random() - 0.5) * 30,
      alpha: 0.3 + Math.random() * 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    })
  }
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.parentElement?.getBoundingClientRect()
  if (!rect) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = rect.width
  height = rect.height
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function animate() {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)



  // Update & draw particles
  for (const p of particles) {
    // Mouse attraction / repulsion
    if (props.interactive) {
      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 200 && dist > 0) {
        const force = (200 - dist) / 200 * 0.015
        p.vx += dx / dist * force
        p.vy += dy / dist * force
      }
    }

    // Damping
    p.vx *= 0.998
    p.vy *= 0.998

    p.x += p.vx
    p.y += p.vy

    // Wrap edges
    if (p.x < -20) p.x = width + 20
    if (p.x > width + 20) p.x = -20
    if (p.y < -20) p.y = height + 20
    if (p.y > height + 20) p.y = -20

    // Pulse
    p.pulsePhase += p.pulseSpeed
    const pulse = 0.6 + Math.sin(p.pulsePhase) * 0.4
    const currentAlpha = p.alpha * pulse

    // Glow
    const glowSize = p.size * 3
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize)
    gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${currentAlpha * 0.8})`)
    gradient.addColorStop(0.4, `hsla(${p.hue}, 70%, 60%, ${currentAlpha * 0.3})`)
    gradient.addColorStop(1, `hsla(${p.hue}, 60%, 50%, 0)`)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2)
    ctx.fill()

    // Core
    ctx.fillStyle = `hsla(${p.hue}, 85%, 75%, ${currentAlpha})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2)
    ctx.fill()
  }

  // Draw connections
  ctx.lineWidth = 1
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < props.linkDistance) {
        const alpha = (1 - dist / props.linkDistance) * 0.15
        const avgHue = (particles[i].hue + particles[j].hue) / 2
        ctx.strokeStyle = `hsla(${avgHue}, 70%, 60%, ${alpha})`
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }

  // Draw mouse glow
  if (props.interactive && mouse.x > 0 && mouse.y > 0) {
    const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120)
    mg.addColorStop(0, `hsla(${props.hue}, 80%, 70%, 0.06)`)
    mg.addColorStop(1, `hsla(${props.hue}, 80%, 70%, 0)`)
    ctx.fillStyle = mg
    ctx.beginPath()
    ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2)
    ctx.fill()
  }

  animationId = requestAnimationFrame(animate)
}

function onMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

function onMouseLeave() {
  mouse.x = -9999
  mouse.y = -9999
}

function onResize() {
  resize()
  initParticles()
}

onMounted(() => {
  resize()
  initParticles()
  animate()
  window.addEventListener('resize', onResize)
  if (props.interactive) {
    canvasRef.value?.parentElement?.addEventListener('mousemove', onMouseMove)
    canvasRef.value?.parentElement?.addEventListener('mouseleave', onMouseLeave)
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  canvasRef.value?.parentElement?.removeEventListener('mousemove', onMouseMove)
  canvasRef.value?.parentElement?.removeEventListener('mouseleave', onMouseLeave)
})
</script>

<style scoped>
.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
