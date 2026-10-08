import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadSave } from './run'

// Entorno node: simulamos localStorage con un objeto mínimo.
const store: Record<string, string> = {}
beforeEach(() => {
  ;(globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => void (store[k] = v),
    removeItem: (k: string) => void delete store[k],
    clear: () => Object.keys(store).forEach((k) => delete store[k]),
    key: () => null,
    length: 0,
  } as Storage
})
afterEach(() => Object.keys(store).forEach((k) => delete store[k]))

describe('loadSave', () => {
  it('descarta una partida guardada con un personaje que ya no existe', () => {
    store['shadow-arena:v1'] = JSON.stringify({
      run: { starterId: 'mateo', level: 9, stage: 2, difficulty: 'normal', stats: { damageDealt: 1, damageTaken: 1, turns: 1 } },
      best: 3,
      wins: 1,
    })
    const save = loadSave()
    expect(save.run).toBeNull()
    expect(save.best).toBe(3)
    expect(save.wins).toBe(1)
  })

  it('conserva una partida válida', () => {
    store['shadow-arena:v1'] = JSON.stringify({
      run: { starterId: 'gotin', level: 9, stage: 2, difficulty: 'dificil', stats: { damageDealt: 5, damageTaken: 2, turns: 3 } },
      best: 2,
      wins: 0,
    })
    expect(loadSave().run).toMatchObject({ starterId: 'gotin', stage: 2, difficulty: 'dificil' })
  })
})
