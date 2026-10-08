import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, enemyLevel, LEVELS_PER_WIN, STAGES, START_LEVEL } from './data'
import { advance, newRun } from './run'
import { chooseEnemyMove, createFighter } from './battle'

describe('run', () => {
  it('arranca en la etapa 0 con el nivel inicial y sin estadísticas', () => {
    expect(newRun('brasito')).toEqual({
      starterId: 'brasito',
      level: START_LEVEL,
      stage: 0,
      difficulty: 'normal',
      stats: { damageDealt: 0, damageTaken: 0, turns: 0 },
    })
  })

  it('al ganar sube de nivel, pasa de etapa y acumula estadísticas', () => {
    const next = advance(newRun('gotin', 'dificil'), { damageDealt: 30, damageTaken: 10, turns: 4 })
    expect(next).toMatchObject({ level: START_LEVEL + LEVELS_PER_WIN, stage: 1, difficulty: 'dificil' })
    expect(next?.stats).toEqual({ damageDealt: 30, damageTaken: 10, turns: 4 })
    const again = advance(next!, { damageDealt: 20, damageTaken: 5, turns: 3 })
    expect(again?.stats).toEqual({ damageDealt: 50, damageTaken: 15, turns: 7 })
  })

  it('devuelve null al superar la última etapa', () => {
    const last = { ...newRun('brotin'), stage: STAGES.length - 1 }
    expect(advance(last)).toBeNull()
  })
})

describe('dificultad', () => {
  it('ajusta el nivel del rival y nunca baja de 1', () => {
    const stage = { speciesId: 'chispo', level: 2, title: 'x' }
    expect(enemyLevel(stage, 'normal')).toBe(2)
    expect(enemyLevel(stage, 'dificil')).toBe(2 + DIFFICULTIES.dificil.levelOffset)
    expect(enemyLevel(stage, 'facil')).toBe(1)
  })

  it('en difícil el rival siempre elige el mejor ataque; en fácil, a menudo no', () => {
    const enemy = createFighter('brasito', 10)
    const player = createFighter('zarzo', 10)
    const seq = (values: number[]) => {
      let i = 0
      return () => values[i++ % values.length]
    }
    // Con rng 0.2: en difícil (sin azar) no entra al azar y elige el mejor ataque (Llamarada).
    expect(chooseEnemyMove(enemy, player, seq([0.2]), DIFFICULTIES.dificil.aiRandomness).id).toBe('llamarada')
    // En fácil (60% de azar) sí entra al azar; con el siguiente rng 0.99 elige el último ataque.
    expect(chooseEnemyMove(enemy, player, seq([0.2, 0.99]), DIFFICULTIES.facil.aiRandomness).id).toBe(
      enemy.moves[enemy.moves.length - 1].id,
    )
  })
})
