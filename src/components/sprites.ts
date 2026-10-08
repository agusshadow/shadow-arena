import type { ArtId } from '../game/types'

/**
 * Sprites dibujados con texto. Cada letra es un color de la paleta del sprite
 * y "." es transparente.
 *
 * Hay dos familias:
 *  - Criaturas 16x16: cuerpo compartido (BODY) y una parte superior propia.
 *  - Shadows 24x24: un busto base (SHADOW_BASE) al que se le suman capas de
 *    accesorios (auriculares, corona, corchetes de código...) y se recolorea.
 */

export interface SpriteDef {
  top: [string, string, string, string]
  palette: Record<string, string>
}

/* ---------- Criaturas 16x16 ---------- */

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
const BASE_PALETTE = { o: '#0b1020', w: '#ffffff', k: '#0b1020' }

export const DEFS: Partial<Record<ArtId, SpriteDef>> = {
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
}

/* ---------- Shadows 24x24 ---------- */

export const SHADOW_SIZE = 24

/** Filas del busto base, de arriba a abajo; cada una se centra en 24 columnas. */
export const SHADOW_BASE: string[] = [
  '', // 0
  '', // 1
  'oooooooooo', // 2  pelo (borde superior)
  'ohhhhhhhhhho', // 3
  'ohhHhhhhhhHhho', // 4
  'ohhhhHhhhhhhho', // 5
  'ohhhhhhHhhhhho', // 6
  'ohhhhhhsssshho', // 7  flequillo
  'ohhsssssssshho', // 8  frente
  'ohggggggggggho', // 9  marco de los lentes
  'ohgwegssgewgho', // 10 ojos
  'ohggggssggggho', // 11
  'ohssssSSssssho', // 12 nariz
  'obbbssssssbbbo', // 13 barba
  'obbbBBBBBBbbbo', // 14 bigote
  'obbbbmmmmbbbbo', // 15 boca
  'obbbbbbbbbbo', // 16 mentón
  'obbbbbbbbo', // 17
  'oooooooo', // 18
  'ottsssstto', // 19 cuello
  'otttttttttttto', // 20 hombros
  'otttttttttttttttto', // 21
  'otttttttttttttttttto', // 22
  'otttttttttttttttttttto', // 23
]

type Layer = Record<number, string>

const dots = (n: number) => '.'.repeat(n)

/** Auriculares: banda sobre la cabeza y almohadillas a los costados. */
const HEADPHONES: Layer = {
  2: 'pPPPPPPPPp',
  3: `pp${dots(8)}pp`,
  4: `pp${dots(10)}pp`,
  5: `pp${dots(10)}pp`,
  6: `pp${dots(10)}pp`,
  7: `ppp${dots(14)}ppp`,
  8: `pPp${dots(14)}pPp`,
  9: `pPp${dots(14)}pPp`,
  10: `pPp${dots(14)}pPp`,
  11: `pPp${dots(14)}pPp`,
  12: `pPp${dots(14)}pPp`,
  13: `ppp${dots(14)}ppp`,
}

/** Corona dorada con una gema roja. */
const CROWN: Layer = {
  0: 'c...cc...c',
  1: 'ccc.cc.ccc',
  2: 'CcccrrcccC',
}

/** Corchetes de código a los lados de la cabeza: < y >. */
const BRACKETS: Layer = (() => {
  const left = ['..a', '.a.', 'a..', '.a.', '..a']
  const right = ['a..', '.a.', '..a', '.a.', 'a..']
  const layer: Layer = {}
  left.forEach((l, i) => {
    layer[8 + i] = `${l}${dots(16)}${right[i]}`
  })
  return layer
})()

const SHADOW_PALETTE = {
  o: '#0b1020',
  h: '#3b4252',
  H: '#5b6478',
  s: '#e8b998',
  S: '#c98f6b',
  g: '#2f4a5e',
  w: '#ffffff',
  e: '#6b4423',
  b: '#59627a',
  B: '#454e62',
  m: '#9a5a4a',
  t: '#475569',
  p: '#1f2937',
  P: '#4b5563',
  c: '#facc15',
  C: '#ca8a04',
  r: '#ef4444',
  a: '#22c55e',
}

interface HumanDef {
  layers: Layer[]
  palette: Record<string, string>
}

export const HUMAN_DEFS: Partial<Record<ArtId, HumanDef>> = {
  // Shadow base: solo el busto.
  shadow: { layers: [], palette: SHADOW_PALETTE },
  // Auriculares y ropa celeste.
  'shadow-dj': {
    layers: [HEADPHONES],
    palette: { ...SHADOW_PALETTE, t: '#0ea5e9', p: '#0f172a', P: '#38bdf8' },
  },
  // Verde terminal, lentes brillantes y corchetes <>.
  'shadow-dev': {
    layers: [BRACKETS],
    palette: { ...SHADOW_PALETTE, t: '#15803d', g: '#22c55e', a: '#4ade80', h: '#334155' },
  },
  // Auriculares y buzo rojo.
  'shadow-gamer': {
    layers: [HEADPHONES],
    palette: { ...SHADOW_PALETTE, t: '#dc2626', p: '#111827', P: '#f97316' },
  },
  // Corona, auriculares y ropa real.
  'shadow-rey': {
    layers: [HEADPHONES, CROWN],
    palette: { ...SHADOW_PALETTE, t: '#4c1d95', p: '#0f172a', P: '#a78bfa' },
  },
}

const center = (row: string, width: number): string => {
  const total = width - row.length
  const left = Math.floor(total / 2)
  return dots(left) + row + dots(total - left)
}

/** Arma las 24 filas finales: busto base + capas, en ese orden. */
export function composeShadow(layers: Layer[]): string[] {
  const rows = SHADOW_BASE.map((r) => center(r, SHADOW_SIZE).split(''))
  for (const layer of layers) {
    for (const [index, content] of Object.entries(layer)) {
      const overlay = center(content, SHADOW_SIZE)
      const row = rows[Number(index)]
      for (let x = 0; x < SHADOW_SIZE; x++) if (overlay[x] !== '.') row[x] = overlay[x]
    }
  }
  return rows.map((r) => r.join(''))
}

/* ---------- Conversión a rectángulos ---------- */

export interface Pixel {
  x: number
  y: number
  w: number
  fill: string
}

function rowsToPixels(rows: string[], palette: Record<string, string>): Pixel[] {
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
      pixels.push({ x, y, w: end - x, fill: palette[ch] ?? '#ff00ff' })
      x = end
    }
  })
  return pixels
}

export interface Sprite {
  size: number
  pixels: Pixel[]
}

export function buildSprite(art: ArtId): Sprite {
  const human = HUMAN_DEFS[art]
  if (human) return { size: SHADOW_SIZE, pixels: rowsToPixels(composeShadow(human.layers), human.palette) }
  const def = DEFS[art]
  if (!def) throw new Error(`Sin sprite para ${art}`)
  return { size: 16, pixels: rowsToPixels([...def.top, ...BODY, BLANK], def.palette) }
}

/** Compatibilidad: píxeles de un sprite. */
export function spritePixels(art: ArtId): Pixel[] {
  return buildSprite(art).pixels
}
