import { describe, expect, it } from 'vitest'
import { SPECIES } from '../game/data'
import { BODY, buildSprite, composeShadow, DEFS, HUMAN_DEFS, SHADOW_BASE, SHADOW_SIZE } from './sprites'

describe('criaturas 16x16', () => {
  it('todas las filas miden 16 y el sprite tiene 15 filas útiles', () => {
    for (const [id, def] of Object.entries(DEFS)) {
      const rows = [...def!.top, ...BODY]
      expect(rows.length, id).toBe(15)
      for (const row of rows) expect(row.length, `${id}: "${row}"`).toBe(16)
    }
  })

  it('todas las letras usadas existen en la paleta', () => {
    for (const [id, def] of Object.entries(DEFS)) {
      for (const row of [...def!.top, ...BODY]) {
        for (const ch of row) if (ch !== '.') expect(def!.palette[ch], `${id}: "${ch}"`).toBeDefined()
      }
    }
  })
})

describe('shadows 24x24', () => {
  it('el busto base tiene 24 filas de ancho par (para centrarse bien)', () => {
    expect(SHADOW_BASE.length).toBe(SHADOW_SIZE)
    for (const row of SHADOW_BASE) {
      expect(row.length, `"${row}"`).toBeLessThanOrEqual(SHADOW_SIZE)
      expect(row.length % 2, `"${row}"`).toBe(0)
    }
  })

  it('cada variante compone 24x24 y usa solo colores definidos', () => {
    for (const [id, def] of Object.entries(HUMAN_DEFS)) {
      const rows = composeShadow(def!.layers)
      expect(rows.length, id).toBe(SHADOW_SIZE)
      for (const row of rows) {
        expect(row.length, id).toBe(SHADOW_SIZE)
        for (const ch of row) if (ch !== '.') expect(def!.palette[ch], `${id}: "${ch}"`).toBeDefined()
      }
    }
  })

  it('las capas con ancho impar no se desalinean', () => {
    for (const def of Object.values(HUMAN_DEFS)) {
      for (const layer of def!.layers) {
        for (const [i, content] of Object.entries(layer)) expect(content.length % 2, `fila ${i}: "${content}"`).toBe(0)
      }
    }
  })

  it('las variantes se distinguen de la base', () => {
    const base = composeShadow(HUMAN_DEFS.shadow!.layers).join('')
    expect(composeShadow(HUMAN_DEFS['shadow-dj']!.layers).join('')).not.toBe(base)
    expect(composeShadow(HUMAN_DEFS['shadow-rey']!.layers).join('')).not.toBe(composeShadow(HUMAN_DEFS['shadow-dj']!.layers).join(''))
  })
})

describe('especies', () => {
  it('cada especie tiene dibujo', () => {
    for (const s of Object.values(SPECIES)) expect(buildSprite(s.art).pixels.length, s.id).toBeGreaterThan(0)
  })
})
