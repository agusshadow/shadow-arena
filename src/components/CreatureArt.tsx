import { useMemo } from 'react'
import type { Species } from '../game/types'
import { spritePixels } from './sprites'

interface Props {
  species: Species
  className?: string
  /** Texto alternativo; por defecto el nombre de la criatura. */
  label?: string
}

export function CreatureArt({ species, className = '', label }: Props) {
  const pixels = useMemo(() => spritePixels(species.art), [species.art])
  const alt = label ?? species.name

  // Si la especie define una imagen (por ejemplo una foto), reemplaza al dibujo.
  if (species.image) {
    return <img src={species.image} alt={alt} className={`border-4 border-black object-cover ${className}`} draggable={false} />
  }

  return (
    <svg viewBox="0 0 16 16" role="img" aria-label={alt} shapeRendering="crispEdges" className={className}>
      {pixels.map((p) => (
        <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={p.w} height={1} fill={p.fill} />
      ))}
    </svg>
  )
}
