let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioContext) {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!Ctx) return null
      sharedAudioContext = new Ctx()
    }
    const ctx = sharedAudioContext
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume()
    }
    return ctx
  } catch {
    return null
  }
}

function playTone({
  frequency,
  durationMs = 140,
  type = 'sine',
  volume = 0.04,
  when = 0,
  attackMs = 8,
  releaseMs = 90,
}: {
  frequency: number
  durationMs?: number
  type?: OscillatorType
  volume?: number
  when?: number
  attackMs?: number
  releaseMs?: number
}) {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime + when
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  osc.type = type
  osc.frequency.value = frequency
  filter.type = 'lowpass'
  filter.frequency.value = Math.max(800, frequency * 2)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume, now + attackMs / 1000)
  const end = now + durationMs / 1000
  gain.gain.setTargetAtTime(0, end - releaseMs / 1000, releaseMs / 1000)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(end + 0.02)
}

export function playCall() {
  // Softer, lower-pitched number call blip
  playTone({ frequency: 420, type: 'sine', durationMs: 110, volume: 0.03, attackMs: 12, releaseMs: 140 })
}

export function playHit() {
  // Distinct chime when user's selection is hit (two short notes)
  playTone({ frequency: 740, type: 'sine', durationMs: 140, volume: 0.06 })
  playTone({ frequency: 980, type: 'sine', durationMs: 160, volume: 0.055, when: 0.09 })
}

export function playRoundStart() {
  // Softer, lower round start chime (gentle triad)
  playTone({ frequency: 330, type: 'sine', durationMs: 170, volume: 0.035, attackMs: 15, releaseMs: 180 })
  playTone({ frequency: 392, type: 'sine', durationMs: 190, volume: 0.035, when: 0.09, attackMs: 15, releaseMs: 190 })
  playTone({ frequency: 440, type: 'sine', durationMs: 210, volume: 0.035, when: 0.18, attackMs: 15, releaseMs: 200 })
}

export function muteAll() {
  if (sharedAudioContext) {
    try {
      const gain = (sharedAudioContext as any).destination.gain as GainNode | undefined
      if (gain) gain.gain.value = 0
    } catch {}
  }
}


