import { describe, expect, it } from 'vitest'
import { MOVES } from './data'
import { calculateDamage, chooseEnemyMove, computeStats, createBattle, createFighter, resolveTurn, typeMultiplier } from './battle'

/** RNG determinista: siempre devuelve el mismo valor. */
const fixed = (v: number) => () => v

describe('typeMultiplier', () => {
  it('fuego es fuerte contra planta y débil contra agua', () => {
    expect(typeMultiplier('fuego', 'planta')).toBe(2)
    expect(typeMultiplier('fuego', 'agua')).toBe(0.5)
  })
  it('sombra solo es fuerte contra sombra', () => {
    expect(typeMultiplier('sombra', 'sombra')).toBe(2)
    expect(typeMultiplier('sombra', 'fuego')).toBe(1)
  })
})

describe('computeStats', () => {
  it('crece con el nivel', () => {
    const low = computeStats({ hp: 50, attack: 50, defense: 50, speed: 50 }, 5)
    const high = computeStats({ hp: 50, attack: 50, defense: 50, speed: 50 }, 20)
    expect(high.maxHp).toBeGreaterThan(low.maxHp)
    expect(high.attack).toBeGreaterThan(low.attack)
  })
})

describe('calculateDamage', () => {
  it('un ataque súper efectivo hace más daño que uno resistido', () => {
    const attacker = createFighter('brasito', 10)
    const grass = createFighter('dev', 10)
    const water = createFighter('dj', 10)
    const superEffective = calculateDamage(attacker, grass, MOVES.llamarada, fixed(0.5))
    const resisted = calculateDamage(attacker, water, MOVES.llamarada, fixed(0.5))
    expect(superEffective).toBeGreaterThan(resisted)
  })

  it('siempre hace al menos 1 de daño', () => {
    const weak = createFighter('gamer', 1)
    const tank = createFighter('rey', 50)
    expect(calculateDamage(weak, tank, MOVES.placaje, fixed(0))).toBeGreaterThanOrEqual(1)
  })

  it('el mismo tipo da bonificación (STAB)', () => {
    const fire = createFighter('brasito', 10)
    const target = createFighter('shadow', 10)
    const stab = calculateDamage(fire, target, MOVES.brasa, fixed(0.5))
    const noStab = calculateDamage(createFighter('gotin', 10), target, MOVES.brasa, fixed(0.5))
    expect(stab).toBeGreaterThan(noStab)
  })
})

describe('chooseEnemyMove', () => {
  it('prefiere el ataque más efectivo cuando no elige al azar', () => {
    const enemy = createFighter('brasito', 10)
    const player = createFighter('dev', 10)
    expect(chooseEnemyMove(enemy, player, fixed(0.9)).type).toBe('fuego')
  })
})

describe('resolveTurn', () => {
  it('el más rápido ataca primero', () => {
    const player = createFighter('shadow', 10)
    const enemy = createFighter('dj', 10)
    const { events } = resolveTurn(createBattle(player, enemy), MOVES.garra, fixed(0))
    const first = events.find((e) => e.kind === 'text')
    expect(first && first.kind === 'text' && first.text.startsWith('Shadow')).toBe(true)
  })

  it('si el primero debilita al otro, el segundo no actúa', () => {
    const player = createFighter('rey', 30)
    const enemy = { ...createFighter('gamer', 3), hp: 1 }
    const { state, events } = resolveTurn(createBattle(player, enemy), MOVES.eclipse, fixed(0))
    expect(state.outcome).toBe('player-won')
    expect(state.player.hp).toBe(player.hp)
    expect(events.some((e) => e.kind === 'faint' && e.target === 'enemy')).toBe(true)
  })

  it('un ataque con precisión baja puede fallar', () => {
    const player = createFighter('rey', 10)
    const enemy = createFighter('dj', 10)
    // rng = 0.99 => 99 >= 85 (precisión de Eclipse): falla.
    const { state } = resolveTurn(createBattle(player, enemy), MOVES.eclipse, fixed(0.99))
    expect(state.enemy.hp).toBe(enemy.hp)
  })

  it('termina en derrota si el jugador se queda sin vida', () => {
    const player = { ...createFighter('brotin', 3), hp: 1 }
    const enemy = createFighter('rey', 30)
    const { state } = resolveTurn(createBattle(player, enemy), MOVES.hoja, fixed(0))
    expect(state.outcome).toBe('player-lost')
  })

  it('no hace nada si el combate ya terminó', () => {
    const base = createBattle(createFighter('brasito', 5), createFighter('gamer', 3))
    const over = { ...base, outcome: 'player-won' as const }
    expect(resolveTurn(over, MOVES.brasa, fixed(0)).events).toEqual([])
  })
})
