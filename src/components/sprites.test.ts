import { describe, expect, it } from 'vitest'
import { SPECIES } from '../game/data'
import { BODY, DEFS, spritePixels } from './sprites'

describe('sprites', () => {
  it('todas las filas miden 16 y el sprite tiene 16 filas', () => {
    for (const [id, def] of Object.entries(DEFS)) {
      const rows = [...def.top, ...BODY]
      expect(rows.length, id).toBe(15)
      for (const row of rows) expect(row.length, `${id}: "${row}"`).toBe(16)
    }
  })

  it('todas las letras usadas existen en la paleta', () => {
    for (const [id, def] of Object.entries(DEFS)) {
      for (const row of [...def.top, ...BODY]) {
        for (const ch of row) if (ch !== '.') expect(def.palette[ch], `${id}: "${ch}"`).toBeDefined()
      }
    }
  })

  it('cada especie tiene dibujo', () => {
    for (const s of Object.values(SPECIES)) expect(spritePixels(s.art).length).toBeGreaterThan(0)
  })
})
