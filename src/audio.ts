import { useSyncExternalStore } from 'react'

/**
 * Sonido de 8 bits generado por código con la Web Audio API (sin archivos).
 * El audio solo arranca después de un gesto del usuario, como exigen los navegadores.
 */

const STORAGE_KEY = 'shadow-arena:sound'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = readMuted()
const listeners = new Set<() => void>()

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'off'
  } catch {
    return false
  }
}

function emit() {
  listeners.forEach((l) => l())
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 1
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Llamar desde un gesto del usuario (toque o tecla) para habilitar el audio. */
export function unlockAudio() {
  ensureContext()
  if (!muted) startMusic()
}

interface Tone {
  freq: number
  start: number
  dur: number
  type?: OscillatorType
  gain?: number
  /** Frecuencia final para hacer un barrido (slide). */
  to?: number
}

function playTones(tones: Tone[]) {
  const c = ensureContext()
  if (!c || !master || muted) return
  const t0 = c.currentTime
  for (const t of tones) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = t.type ?? 'square'
    osc.frequency.setValueAtTime(t.freq, t0 + t.start)
    if (t.to) osc.frequency.exponentialRampToValueAtTime(t.to, t0 + t.start + t.dur)
    const peak = t.gain ?? 0.12
    g.gain.setValueAtTime(0.0001, t0 + t.start)
    g.gain.exponentialRampToValueAtTime(peak, t0 + t.start + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + t.start + t.dur)
    osc.connect(g).connect(master)
    osc.start(t0 + t.start)
    osc.stop(t0 + t.start + t.dur + 0.02)
  }
}

/** Ruido corto para golpes. */
function playNoise(dur: number, gain = 0.15) {
  const c = ensureContext()
  if (!c || !master || muted) return
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = c.createBufferSource()
  src.buffer = buffer
  const g = c.createGain()
  g.gain.value = gain
  src.connect(g).connect(master)
  src.start()
}

export const sfx = {
  click: () => playTones([{ freq: 660, start: 0, dur: 0.06 }]),
  select: () =>
    playTones([
      { freq: 523, start: 0, dur: 0.08 },
      { freq: 784, start: 0.08, dur: 0.12 },
    ]),
  hit: () => {
    playNoise(0.12)
    playTones([{ freq: 180, to: 60, start: 0, dur: 0.15, type: 'sawtooth' }])
  },
  superHit: () => {
    playNoise(0.16, 0.2)
    playTones([
      { freq: 220, to: 80, start: 0, dur: 0.15, type: 'sawtooth' },
      { freq: 880, start: 0.12, dur: 0.08 },
      { freq: 1175, start: 0.2, dur: 0.12 },
    ])
  },
  weakHit: () => {
    playNoise(0.08, 0.08)
    playTones([{ freq: 140, to: 100, start: 0, dur: 0.12, type: 'triangle' }])
  },
  miss: () => playTones([{ freq: 400, to: 200, start: 0, dur: 0.18, type: 'triangle', gain: 0.08 }]),
  faint: () => playTones([{ freq: 440, to: 55, start: 0, dur: 0.6, type: 'square', gain: 0.1 }]),
  win: () =>
    playTones([
      { freq: 523, start: 0, dur: 0.14 },
      { freq: 659, start: 0.14, dur: 0.14 },
      { freq: 784, start: 0.28, dur: 0.14 },
      { freq: 1047, start: 0.42, dur: 0.4 },
    ]),
  lose: () =>
    playTones([
      { freq: 392, start: 0, dur: 0.2, type: 'triangle' },
      { freq: 330, start: 0.2, dur: 0.2, type: 'triangle' },
      { freq: 262, start: 0.4, dur: 0.2, type: 'triangle' },
      { freq: 196, start: 0.6, dur: 0.5, type: 'triangle' },
    ]),
}

/* ---------- Música ---------- */

// Notas en Hz de una escala menor pentatónica (La menor).
const A2 = 110
const NOTE = { A2, C3: 130.8, D3: 146.8, E3: 164.8, G3: 196, A3: 220, C4: 261.6, D4: 293.7, E4: 329.6, G4: 392, A4: 440 }
const BASS = [NOTE.A2, NOTE.A2, NOTE.C3, NOTE.C3, NOTE.D3, NOTE.D3, NOTE.E3, NOTE.G3]
const LEAD = [NOTE.A4, 0, NOTE.E4, NOTE.G4, NOTE.A4, NOTE.C4, 0, NOTE.D4, NOTE.E4, 0, NOTE.G4, NOTE.A4, NOTE.G4, NOTE.E4, NOTE.D4, 0]
const STEP = 0.2 // segundos por paso

let musicTimer: ReturnType<typeof setTimeout> | null = null
let nextStepTime = 0
let step = 0

function scheduleMusic() {
  if (!ctx || !master || muted) return
  while (nextStepTime < ctx.currentTime + 0.4) {
    const t = nextStepTime - ctx.currentTime
    if (t >= 0) {
      const lead = LEAD[step % LEAD.length]
      const bass = BASS[Math.floor(step / 2) % BASS.length]
      const tones: Tone[] = []
      if (lead) tones.push({ freq: lead, start: t, dur: STEP * 0.8, gain: 0.035 })
      if (step % 2 === 0) tones.push({ freq: bass, start: t, dur: STEP * 1.8, type: 'triangle', gain: 0.07 })
      playTones(tones)
    }
    nextStepTime += STEP
    step++
  }
  musicTimer = setTimeout(scheduleMusic, 120)
}

export function startMusic() {
  if (musicTimer || muted) return
  const c = ensureContext()
  if (!c) return
  nextStepTime = c.currentTime + 0.1
  scheduleMusic()
}

export function stopMusic() {
  if (musicTimer) clearTimeout(musicTimer)
  musicTimer = null
}

if (typeof document !== 'undefined') {
  // Pausar la música si la pestaña queda en segundo plano.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopMusic()
    else if (ctx && !muted) startMusic()
  })
}

/* ---------- Silenciar ---------- */

export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'off' : 'on')
  } catch {
    // ignorar
  }
  if (master) master.gain.value = value ? 0 : 1
  if (value) stopMusic()
  else if (ctx) startMusic()
  emit()
}

export function useMuted(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => muted,
    () => false,
  )
}
