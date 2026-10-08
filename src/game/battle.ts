import { MOVES, SPECIES, TYPE_CHART, TYPE_LABEL } from './data'
import type { BattleEvent, BattleState, Fighter, Move, Rng, Stats } from './types'

export function computeStats(base: { hp: number; attack: number; defense: number; speed: number }, level: number): Stats {
  const scale = (b: number) => Math.floor((b * 2 * level) / 100) + 5
  return {
    maxHp: Math.floor((base.hp * 2 * level) / 100) + level + 10,
    attack: scale(base.attack),
    defense: scale(base.defense),
    speed: scale(base.speed),
  }
}

export function createFighter(speciesId: string, level: number): Fighter {
  const species = SPECIES[speciesId]
  if (!species) throw new Error(`Especie desconocida: ${speciesId}`)
  const stats = computeStats(species.base, level)
  return { species, level, stats, hp: stats.maxHp, moves: species.moves.map((id) => MOVES[id]) }
}

export function createBattle(player: Fighter, enemy: Fighter): BattleState {
  return { player, enemy, outcome: 'ongoing' }
}

export function typeMultiplier(moveType: Move['type'], defenderType: Fighter['species']['type']): number {
  return TYPE_CHART[moveType][defenderType]
}

/** Daño de un ataque. `rng` debe devolver un número en [0, 1). */
export function calculateDamage(attacker: Fighter, defender: Fighter, move: Move, rng: Rng): number {
  const base = Math.floor((((2 * attacker.level) / 5 + 2) * move.power * attacker.stats.attack) / defender.stats.defense / 50) + 2
  const stab = move.type === attacker.species.type ? 1.5 : 1
  const variance = 0.85 + rng() * 0.15
  const damage = Math.floor(base * stab * typeMultiplier(move.type, defender.species.type) * variance)
  return Math.max(1, damage)
}

/** Elige el ataque del rival: casi siempre el más efectivo, a veces uno al azar. */
export function chooseEnemyMove(enemy: Fighter, player: Fighter, rng: Rng): Move {
  if (rng() < 0.3) return enemy.moves[Math.floor(rng() * enemy.moves.length)]
  const score = (m: Move) => m.power * typeMultiplier(m.type, player.species.type) * (m.type === enemy.species.type ? 1.5 : 1)
  return enemy.moves.reduce((best, m) => (score(m) > score(best) ? m : best))
}

function effectivenessText(mult: number): string | null {
  if (mult > 1) return '¡Es muy efectivo!'
  if (mult < 1) return 'No es muy efectivo...'
  return null
}

interface Turn {
  side: 'player' | 'enemy'
  move: Move
}

function runAttack(
  state: BattleState,
  side: 'player' | 'enemy',
  move: Move,
  rng: Rng,
  events: BattleEvent[],
): BattleState {
  const attacker = side === 'player' ? state.player : state.enemy
  const defender = side === 'player' ? state.enemy : state.player
  const defenderSide = side === 'player' ? 'enemy' : 'player'

  events.push({ kind: 'text', text: `${attacker.species.name} usa ${move.name}.` })

  if (rng() * 100 >= move.accuracy) {
    events.push({ kind: 'text', text: `¡${attacker.species.name} falló!` })
    return state
  }

  const damage = calculateDamage(attacker, defender, move, rng)
  const hp = Math.max(0, defender.hp - damage)
  events.push({ kind: 'damage', target: defenderSide, hp })

  const note = effectivenessText(typeMultiplier(move.type, defender.species.type))
  if (note) events.push({ kind: 'text', text: note })

  const updated = { ...defender, hp }
  if (hp === 0) {
    events.push({ kind: 'faint', target: defenderSide })
    events.push({ kind: 'text', text: `${defender.species.name} se debilitó.` })
  }
  return side === 'player' ? { ...state, enemy: updated } : { ...state, player: updated }
}

/**
 * Resuelve un turno completo. El más rápido ataca primero; si el primero
 * debilita al otro, el segundo no actúa. Devuelve el estado final y la lista
 * de eventos para que la interfaz los reproduzca en orden.
 */
export function resolveTurn(
  state: BattleState,
  playerMove: Move,
  rng: Rng,
): { state: BattleState; events: BattleEvent[] } {
  if (state.outcome !== 'ongoing') return { state, events: [] }

  const events: BattleEvent[] = []
  const enemyMove = chooseEnemyMove(state.enemy, state.player, rng)

  const playerFirst =
    state.player.stats.speed > state.enemy.stats.speed ||
    (state.player.stats.speed === state.enemy.stats.speed && rng() < 0.5)

  const order: Turn[] = playerFirst
    ? [
        { side: 'player', move: playerMove },
        { side: 'enemy', move: enemyMove },
      ]
    : [
        { side: 'enemy', move: enemyMove },
        { side: 'player', move: playerMove },
      ]

  let current = state
  for (const turn of order) {
    if (current.player.hp === 0 || current.enemy.hp === 0) break
    current = runAttack(current, turn.side, turn.move, rng, events)
  }

  const outcome = current.enemy.hp === 0 ? 'player-won' : current.player.hp === 0 ? 'player-lost' : 'ongoing'
  if (outcome === 'player-won') events.push({ kind: 'text', text: '¡Ganaste el combate!' })
  if (outcome === 'player-lost') events.push({ kind: 'text', text: 'Perdiste el combate...' })

  return { state: { ...current, outcome }, events }
}

export function typeName(type: Move['type']): string {
  return TYPE_LABEL[type]
}
