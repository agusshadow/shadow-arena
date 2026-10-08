export type ElementType = 'fuego' | 'agua' | 'planta' | 'sombra'

export interface Move {
  id: string
  name: string
  type: ElementType
  /** Potencia base del ataque. */
  power: number
  /** Probabilidad de acertar (1-100). */
  accuracy: number
}

export interface BaseStats {
  hp: number
  attack: number
  defense: number
  speed: number
}

export interface Species {
  id: string
  name: string
  type: ElementType
  base: BaseStats
  moves: string[]
  /** Ilustración por código. */
  art: ArtId
  /**
   * Imagen opcional (ruta o URL). Si existe, reemplaza al dibujo en SVG:
   * así se puede usar una foto sin tocar el resto del juego.
   */
  image?: string
}

export type ArtId = 'brasito' | 'gotin' | 'brotin' | 'shadow' | 'shadow-dj' | 'shadow-dev' | 'shadow-gamer' | 'shadow-chef' | 'shadow-rey'

export interface Stats {
  maxHp: number
  attack: number
  defense: number
  speed: number
}

export interface Fighter {
  species: Species
  level: number
  stats: Stats
  hp: number
  moves: Move[]
}

export type BattleEvent =
  | { kind: 'text'; text: string }
  | { kind: 'damage'; target: 'player' | 'enemy'; hp: number }
  | { kind: 'faint'; target: 'player' | 'enemy' }

export type BattleOutcome = 'ongoing' | 'player-won' | 'player-lost'

export interface BattleState {
  player: Fighter
  enemy: Fighter
  outcome: BattleOutcome
}

export type Rng = () => number

export interface Stage {
  speciesId: string
  level: number
  title: string
}

export type Difficulty = 'facil' | 'normal' | 'dificil'

export interface BattleStats {
  /** Daño que hiciste al rival. */
  damageDealt: number
  /** Daño que recibiste. */
  damageTaken: number
  turns: number
}
