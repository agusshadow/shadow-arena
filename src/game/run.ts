import { STAGES, START_LEVEL } from './data'

/** Progreso de una partida: se guarda para poder seguir al recargar. */
export interface Run {
  starterId: string
  level: number
  stage: number
}

export interface Save {
  run: Run | null
  /** Mejor resultado: etapas superadas en una sola partida. */
  best: number
  wins: number
}

const STORAGE_KEY = 'shadow-arena:v1'
export const EMPTY_SAVE: Save = { run: null, best: 0, wins: 0 }

export function newRun(starterId: string): Run {
  return { starterId, level: START_LEVEL, stage: 0 }
}

/** Avanza a la siguiente etapa tras una victoria. Devuelve null si era la última. */
export function advance(run: Run): Run | null {
  const next = run.stage + 1
  if (next >= STAGES.length) return null
  return { ...run, level: run.level + 1, stage: next }
}

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_SAVE
    const parsed = JSON.parse(raw) as Partial<Save>
    const run = parsed.run
    const validRun =
      run && typeof run.starterId === 'string' && Number.isInteger(run.level) && Number.isInteger(run.stage) && run.stage < STAGES.length
        ? run
        : null
    return { run: validRun, best: Number(parsed.best) || 0, wins: Number(parsed.wins) || 0 }
  } catch {
    return EMPTY_SAVE
  }
}

export function persist(save: Save): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
  } catch {
    // sin localStorage el juego sigue funcionando, pero no guarda el progreso
  }
}
