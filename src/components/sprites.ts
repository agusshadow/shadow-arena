import type { ArtId } from '../game/types'

/**
 * Sprites 16x16 dibujados con texto. Cada letra es un color de la paleta del
 * sprite y "." es transparente. Todos comparten el mismo cuerpo (filas 4 a 14)
 * y cambian la parte superior y los colores.
 *
 * Claves: o contorno, b cuerpo, d sombra, l luz, w ojo, k pupila,
 *         a, c, r colores propios de cada criatura.
 */
export const BODY = [
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '..obwwbbbbwwbo..',
  '..obwkbbbbwkbo..',
  '..obbbbbbbbbbo..',
  '..oblbbbbbblbo..',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '...obddbbddbo...',
  '....oooooooo....',
]

const BLANK = '................'

export interface SpriteDef {
  top: [string, string, string, string]
  palette: Record<string, string>
}

const BASE_PALETTE = { o: '#0b1020', w: '#ffffff', k: '#0b1020' }

export const DEFS: Record<ArtId, SpriteDef> = {
  brasito: {
    top: ['.......aa.......', '......aaaa......', '......acca......', '.....acccca.....'],
    palette: { ...BASE_PALETTE, b: '#f97316', d: '#c2410c', l: '#fdba74', a: '#ef4444', c: '#fde047' },
  },
  gotin: {
    top: ['.......aa.......', '......aaaa......', '.....aaaaaa.....', '.....aaacaa.....'],
    palette: { ...BASE_PALETTE, b: '#38bdf8', d: '#0284c7', l: '#bae6fd', a: '#0ea5e9', c: '#ffffff' },
  },
  brotin: {
    top: ['......aa..aa....', '.....aaaaaaaa...', '........cc......', '........cc......'],
    palette: { ...BASE_PALETTE, b: '#4ade80', d: '#15803d', l: '#bbf7d0', a: '#22c55e', c: '#166534' },
  },
  chispo: {
    top: [BLANK, '....a..aa..a....', '....aa.aa.aa....', '....aaaaaaaa....'],
    palette: { ...BASE_PALETTE, b: '#ef4444', d: '#991b1b', l: '#fca5a5', a: '#f97316', c: '#fde047' },
  },
  pozo: {
    top: ['.......c........', '.......a........', '.......a........', '......aaaa......'],
    palette: { ...BASE_PALETTE, b: '#60a5fa', d: '#1d4ed8', l: '#dbeafe', a: '#2563eb', c: '#ffffff' },
  },
  zarzo: {
    top: [BLANK, '...a...aa...a...', '...aa.aaaa.aa...', '....aaaaaaaa....'],
    palette: { ...BASE_PALETTE, b: '#84cc16', d: '#3f6212', l: '#d9f99d', a: '#166534', c: '#14532d' },
  },
  umbra: {
    top: ['....a......a....', '....aa....aa....', '....aaa..aaa....', '.....aaaaaaa....'],
    palette: { ...BASE_PALETTE, b: '#6d28d9', d: '#3b0764', l: '#a78bfa', a: '#4c1d95', c: '#fde047', w: '#fde047' },
  },
  rey: {
    top: ['....c..c..c.....', '....cc.cc.cc....', '....cccccccc....', '....cccrcccc....'],
    palette: { ...BASE_PALETTE, b: '#1e1b4b', d: '#0f172a', l: '#4338ca', c: '#facc15', r: '#ef4444', w: '#ef4444' },
  },
}

export interface Pixel {
  x: number
  y: number
  w: number
  fill: string
}

/** Convierte un sprite en rectángulos (agrupando píxeles contiguos del mismo color). */
export function spritePixels(art: ArtId): Pixel[] {
  const def = DEFS[art]
  const rows = [...def.top, ...BODY, BLANK]
  const pixels: Pixel[] = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      if (ch === '.') {
        x++
        continue
      }
      let end = x + 1
      while (end < row.length && row[end] === ch) end++
      pixels.push({ x, y, w: end - x, fill: def.palette[ch] ?? '#ff00ff' })
      x = end
    }
  })
  return pixels
}
