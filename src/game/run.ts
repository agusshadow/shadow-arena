import { LEVELS_PER_WIN, STAGES, START_LEVEL } from './data'
import type { BattleStats, Difficulty } from './types'

/** Progreso de una partida: se guarda para poder seguir al recargar. */
export interface Run {
  starterId: string
  level: number
  stage: number
  difficulty: Difficulty
  /** Acumulado de todos los combates de la partida. */
  stats: BattleStats
}

export interface Save {
  run: Run | null
  /** Mejor resultado: etapas superadas en una sola partida. */
  best: number
  wins: number
  /** Última dificultad elegida. */
  difficulty: Difficulty
}

const STORAGE_KEY = 'shadow-arena:v1'
export const EMPTY_STATS: BattleStats = { damageDealt: 0, damageTaken: 0, turns: 0 }
export const EMPTY_SAVE: Save = { run: null, best: 0, wins: 0, difficulty: 'normal' }

const DIFFICULTIES: Difficulty[] = ['facil', 'normal', 'dificil']

export function newRun(starterId: string, difficulty: Difficulty = 'normal'): Run {
  return { starterId, level: START_LEVEL, stage: 0, difficulty, stats: EMPTY_STATS }
}

export function addStats(a: BattleStats, b: BattleStats): BattleStats {
  return {
    damageDealt: a.damageDealt + b.damageDealt,
    damageTaken: a.damageTaken + b.damageTaken,
    turns: a.turns + b.turns,
  }
}

/** Avanza a la siguiente etapa tras una victoria. Devuelve null si era la última. */
export function advance(run: Run, battle: BattleStats = EMPTY_STATS): Run | null {
  const stats = addStats(run.stats, battle)
  const next = run.stage + 1
  if (next >= STAGES.length) return null
  return { ...run, level: run.level + LEVELS_PER_WIN, stage: next, stats }
}

const isDifficulty = (v: unknown): v is Difficulty => DIFFICULTIES.includes(v as Difficulty)
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0)

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_SAVE
    const parsed = JSON.parse(raw) as Partial<Save> & { run?: Partial<Run> | null }
    const r = parsed.run
    const run: Run | null =
      r && typeof r.starterId === 'string' && Number.isInteger(r.level) && Number.isInteger(r.stage) && (r.stage as number) < STAGES.length
        ? {
            starterId: r.starterId,
            level: r.level as number,
            stage: r.stage as number,
            difficulty: isDifficulty(r.difficulty) ? r.difficulty : 'normal',
            stats: {
              damageDealt: num(r.stats?.damageDealt),
              damageTaken: num(r.stats?.damageTaken),
              turns: num(r.stats?.turns),
            },
          }
        : null
    return {
      run,
      best: num(parsed.best),
      wins: num(parsed.wins),
      difficulty: isDifficulty(parsed.difficulty) ? parsed.difficulty : 'normal',
    }
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
