<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, watchEffect } from 'vue'
import PandaSVG from './panda.svg'

let canvas = $ref<HTMLCanvasElement>()

let context = $ref<CanvasRenderingContext2D>()

watchEffect(() => {
  context = canvas?.getContext('2d') ?? undefined
}, { flush: 'sync' })

const image = new Image()
image.src = PandaSVG

const state = reactive({
  width: 0,
  height: 0,
  targetX: -1,
  targetY: -1,
  maxSpeed: 1,
  resistance: 0.5,
  running: false,
  animals: [
    { acceleration: 1 },
    { acceleration: 0.6 },
  ].map(animal => ({
    ...animal,
    x: -1,
    y: -1,
    arc: 0,
    xSpeed: 0,
    ySpeed: 0,
  })),
})

function resize() {
  state.width = window.innerWidth * window.devicePixelRatio
  state.height = window.innerHeight * window.devicePixelRatio
  for (const animal of state.animals) {
    if (animal.x < 0 || animal.x > state.width) {
      animal.x = Math.floor(Math.random() * state.width)
    }
    if (animal.y < 0 || animal.y > state.height) {
      animal.y = Math.floor(Math.random() * state.height)
    }
  }
}

onMounted(() => {
  window.addEventListener('resize', resize)
  onUnmounted(() => {
    window.removeEventListener('resize', resize)
  })
})

resize()

function fit() {
  if (!canvas) return
  canvas.width = state.width
  canvas.height = state.height
  const size = Math.max(Math.round(state.width / 20), Math.round(state.height / 20))
  image.width = size
  image.height = size
}

watchEffect(fit)

function draw() {
  if (!canvas) return
  if (!context) return
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.save()
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#B2FFFF')
  gradient.addColorStop(0.75, '#5980FF')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.restore()
  const baseSize = Math.max(Math.round(state.width / 20), Math.round(state.height / 20))
  for (const animal of state.animals) {
    const size = baseSize / animal.acceleration
    context.drawImage(
      image,
      animal.x - Math.floor(size / 2),
      animal.y - Math.floor(size / 2),
      size,
      size,
    )
  }
  context.restore()
}

watchEffect(draw)

onMounted(() => {
  if (image.complete) {
    draw()
  } else {
    image.addEventListener('load', draw, { once: true })
  }
})

function average(numbers: number[]) {
  return Math.round(numbers.reduce((a, b) => a + b) / numbers.length)
}

function handleTouchStart(event: TouchEvent) {
  const touches = Array.from(event.touches)
  const targetX = average(
    touches.map(item => item.clientX * window.devicePixelRatio),
  )
  const targetY = average(
    touches.map(item => item.clientY * window.devicePixelRatio),
  )
  state.targetX = targetX
  state.targetY = targetY
  state.running = true
}

function handleTouchMove(event: TouchEvent) {
  const touches = Array.from(event.touches)
  const targetX = average(
    touches.map(item => item.clientX * window.devicePixelRatio),
  )
  const targetY = average(
    touches.map(item => item.clientY * window.devicePixelRatio),
  )
  state.targetX = targetX
  state.targetY = targetY
}

function handleTouchEnd(event: TouchEvent) {
  state.running = false
}

let lastTime: DOMHighResTimeStamp | undefined

function move(period: number) {
  for (const animal of state.animals) {
    if (!animal.xSpeed && !animal.ySpeed && !state.running) return
    const scale = Math.min(state.width, state.height)
    const deltaX = state.targetX - animal.x
    const deltaY = state.targetY - animal.y
    animal.arc = Math.atan(deltaY / deltaX)
    const acceleration = state.running ? animal.acceleration : 0
    const xAcceleration = (acceleration * Math.sign(deltaX) - state.resistance * Math.sign(animal.xSpeed))
      * Math.abs(Math.cos(animal.arc))
    const yAcceleration = (acceleration * Math.sign(deltaY) - state.resistance * Math.sign(animal.ySpeed))
      * Math.abs(Math.sin(animal.arc))
    const targetXSpeed = animal.xSpeed + Math.max(-state.maxSpeed, Math.min(state.maxSpeed, xAcceleration * period))
    const targetYSpeed = animal.ySpeed + Math.max(-state.maxSpeed, Math.min(state.maxSpeed, yAcceleration * period))
    animal.xSpeed = Math.sign(targetXSpeed) === Math.sign(animal.xSpeed) || state.running ? targetXSpeed : 0
    animal.ySpeed = Math.sign(targetYSpeed) === Math.sign(animal.ySpeed) || state.running ? targetYSpeed : 0
    animal.x += animal.xSpeed * period * scale
    animal.y += animal.ySpeed * period * scale
  }
  draw() // WHY?
}

function run(time: DOMHighResTimeStamp) {
  if (lastTime) {
    move((time - lastTime) / 1000)
  }
  lastTime = time
  requestAnimationFrame(run)
}

onMounted(() => {
  requestAnimationFrame(run)
})
</script>

<template>
  <canvas
    v-once
    ref="canvas"
    class="canvas"
    @touchstart.prevent.stop="handleTouchStart"
    @touchmove.prevent.stop="handleTouchMove"
    @touchend.prevent.stop="handleTouchEnd"
  ></canvas>
</template>

<style scoped>
:global(:root) {
  font-family: system-ui, -apple-system, sans-serif;
}
:global(body) {
  margin: 0;
  user-select: none;
}
.canvas {
  width: 100vw;
  height: 100vh;
}
</style>
