import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const svg = readFileSync('public/favicon.svg')
const maskable = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0F172A"/>
  <g transform="translate(76.8 76.8) scale(.7)">
    <path d="M256 96l48 112 120 8-92 76 30 116-106-64-106 64 30-116-92-76 120-8z" fill="#22C55E"/>
    <path d="M256 96l48 112 120 8-92 76 30 116-106-64z" fill="#16A34A"/>
  </g>
</svg>`)

await sharp(svg).resize(192, 192).png().toFile('public/pwa-192.png')
await sharp(svg).resize(512, 512).png().toFile('public/pwa-512.png')
await sharp(svg).resize(180, 180).png().toFile('public/apple-touch-icon.png')
await sharp(maskable).resize(512, 512).png().toFile('public/pwa-maskable-512.png')
console.log('icons generated')
