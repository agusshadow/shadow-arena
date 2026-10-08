import { describe, expect, it } from 'vitest'
import { LEVELS_PER_WIN, STAGES, START_LEVEL } from './data'
import { advance, newRun } from './run'

describe('run', () => {
  it('arranca en la etapa 0 con el nivel inicial', () => {
    expect(newRun('brasito')).toEqual({ starterId: 'brasito', level: START_LEVEL, stage: 0 })
  })

  it('al ganar sube de nivel y pasa a la siguiente etapa', () => {
    const next = advance(newRun('gotin'))
    expect(next).toEqual({ starterId: 'gotin', level: START_LEVEL + LEVELS_PER_WIN, stage: 1 })
  })

  it('devuelve null al superar la última etapa', () => {
    const last = { starterId: 'brotin', level: 10, stage: STAGES.length - 1 }
    expect(advance(last)).toBeNull()
  })
})
