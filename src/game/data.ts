import type { Difficulty, ElementType, Move, Species, Stage } from './types'

/** Multiplicador de daño: CHART[tipo del ataque][tipo del defensor]. */
export const TYPE_CHART: Record<ElementType, Record<ElementType, number>> = {
  fuego: { fuego: 0.5, agua: 0.5, planta: 2, sombra: 1 },
  agua: { fuego: 2, agua: 0.5, planta: 0.5, sombra: 1 },
  planta: { fuego: 0.5, agua: 2, planta: 0.5, sombra: 1 },
  sombra: { fuego: 1, agua: 1, planta: 1, sombra: 2 },
}

export const TYPE_LABEL: Record<ElementType, string> = {
  fuego: 'Fuego',
  agua: 'Agua',
  planta: 'Planta',
  sombra: 'Sombra',
}

export const MOVES: Record<string, Move> = {
  placaje: { id: 'placaje', name: 'Placaje', type: 'sombra', power: 40, accuracy: 100 },
  llamarada: { id: 'llamarada', name: 'Llamarada', type: 'fuego', power: 60, accuracy: 90 },
  brasa: { id: 'brasa', name: 'Brasa', type: 'fuego', power: 40, accuracy: 100 },
  chorro: { id: 'chorro', name: 'Chorro', type: 'agua', power: 60, accuracy: 90 },
  burbuja: { id: 'burbuja', name: 'Burbuja', type: 'agua', power: 40, accuracy: 100 },
  latigo: { id: 'latigo', name: 'Látigo', type: 'planta', power: 60, accuracy: 90 },
  hoja: { id: 'hoja', name: 'Hoja filosa', type: 'planta', power: 40, accuracy: 100 },
  garra: { id: 'garra', name: 'Garra umbría', type: 'sombra', power: 55, accuracy: 95 },
  sonrisa: { id: 'sonrisa', name: 'Sonrisa letal', type: 'sombra', power: 60, accuracy: 90 },
  abrazo: { id: 'abrazo', name: 'Abrazo de oso', type: 'sombra', power: 45, accuracy: 100 },
  rulazo: { id: 'rulazo', name: 'Rulazo', type: 'planta', power: 50, accuracy: 100 },
  eclipse: { id: 'eclipse', name: 'Eclipse', type: 'sombra', power: 75, accuracy: 85 },
}

export const SPECIES: Record<string, Species> = {
  brasito: {
    id: 'brasito',
    name: 'Brasito',
    type: 'fuego',
    base: { hp: 45, attack: 55, defense: 40, speed: 55 },
    moves: ['llamarada', 'brasa', 'garra', 'placaje'],
    art: 'brasito',
  },
  gotin: {
    id: 'gotin',
    name: 'Gotín',
    type: 'agua',
    base: { hp: 58, attack: 50, defense: 55, speed: 42 },
    moves: ['chorro', 'burbuja', 'garra', 'placaje'],
    art: 'gotin',
  },
  brotin: {
    id: 'brotin',
    name: 'Brotín',
    type: 'planta',
    base: { hp: 55, attack: 52, defense: 52, speed: 47 },
    moves: ['latigo', 'hoja', 'garra', 'placaje'],
    art: 'brotin',
  },
  mateo: {
    id: 'mateo',
    name: 'Mateo',
    type: 'sombra',
    base: { hp: 58, attack: 55, defense: 52, speed: 50 },
    moves: ['sonrisa', 'abrazo', 'rulazo', 'brasa'],
    art: 'umbra',
    image: '/characters/mateo.jpg',
  },
  chispo: {
    id: 'chispo',
    name: 'Chispo',
    type: 'fuego',
    base: { hp: 40, attack: 50, defense: 35, speed: 50 },
    moves: ['brasa', 'placaje'],
    art: 'chispo',
  },
  pozo: {
    id: 'pozo',
    name: 'Pozo',
    type: 'agua',
    base: { hp: 50, attack: 40, defense: 50, speed: 35 },
    moves: ['burbuja', 'placaje'],
    art: 'pozo',
  },
  zarzo: {
    id: 'zarzo',
    name: 'Zarzo',
    type: 'planta',
    base: { hp: 48, attack: 45, defense: 48, speed: 40 },
    moves: ['hoja', 'placaje'],
    art: 'zarzo',
  },
  umbra: {
    id: 'umbra',
    name: 'Umbra',
    type: 'sombra',
    base: { hp: 55, attack: 60, defense: 50, speed: 60 },
    moves: ['garra', 'placaje', 'brasa'],
    art: 'umbra',
  },
  rey: {
    id: 'rey',
    name: 'Rey Sombra',
    type: 'sombra',
    base: { hp: 75, attack: 70, defense: 65, speed: 65 },
    moves: ['eclipse', 'garra', 'llamarada', 'chorro'],
    art: 'rey',
  },
}

export const STARTERS = ['brasito', 'gotin', 'brotin', 'mateo'] as const

/** Nivel inicial del jugador; sube LEVELS_PER_WIN con cada victoria. */
export const START_LEVEL = 5
export const LEVELS_PER_WIN = 2

export const STAGES: Stage[] = [
  { speciesId: 'chispo', level: 2, title: 'Arena 1' },
  { speciesId: 'pozo', level: 4, title: 'Arena 2' },
  { speciesId: 'zarzo', level: 5, title: 'Arena 3' },
  { speciesId: 'umbra', level: 7, title: 'Arena 4' },
  { speciesId: 'rey', level: 10, title: 'Jefe final' },
]

export interface DifficultyConfig {
  label: string
  description: string
  /** Se suma al nivel de cada rival. */
  levelOffset: number
  /** Probabilidad de que el rival elija un ataque al azar en vez del mejor. */
  aiRandomness: number
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  facil: { label: 'Fácil', description: 'Rivales más débiles y menos astutos.', levelOffset: -2, aiRandomness: 0.6 },
  normal: { label: 'Normal', description: 'La experiencia pensada del juego.', levelOffset: 0, aiRandomness: 0.3 },
  dificil: { label: 'Difícil', description: 'Los rivales siempre eligen el mejor ataque.', levelOffset: 0, aiRandomness: 0 },
}

export const DIFFICULTY_ORDER: Difficulty[] = ['facil', 'normal', 'dificil']

/** Nivel real del rival de una etapa según la dificultad (mínimo 1). */
export function enemyLevel(stage: Stage, difficulty: Difficulty): number {
  return Math.max(1, stage.level + DIFFICULTIES[difficulty].levelOffset)
}
