import { useId } from 'react'
import { SPECIES, STAGES, STARTERS, TYPE_LABEL } from '../game/data'
import type { Save } from '../game/run'
import { CreatureArt } from './CreatureArt'

function Shell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 p-4">
      {title && <h1 className="font-pixel text-base leading-relaxed text-warning">{title}</h1>}
      {children}
    </main>
  )
}

export function TitleScreen({
  save,
  onContinue,
  onNew,
}: {
  save: Save
  onContinue: () => void
  onNew: () => void
}) {
  return (
    <Shell>
      <div className="text-center">
        <h1 className="font-pixel text-2xl leading-loose text-warning">
          SHADOW
          <br />
          ARENA
        </h1>
        <div className="mx-auto mt-3 flex w-fit gap-3" aria-hidden="true">
          {STARTERS.map((id) => (
            <CreatureArt key={id} species={SPECIES[id]} className="idle size-20" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {save.run && (
          <button type="button" className="px-btn font-pixel px-4 text-xs" onClick={onContinue}>
            Continuar ({STAGES[save.run.stage].title})
          </button>
        )}
        <button type="button" className="px-btn font-pixel px-4 text-xs" onClick={onNew}>
          {save.run ? 'Nueva partida' : 'Jugar'}
        </button>
      </div>

      <p className="text-center text-muted-foreground">
        Mejor racha: {save.best}/{STAGES.length} combates · Victorias: {save.wins}
      </p>
    </Shell>
  )
}

export function StarterScreen({ onPick, onBack }: { onPick: (id: string) => void; onBack: () => void }) {
  const headingId = useId()
  return (
    <Shell title="Elegí tu criatura">
      <ul className="flex flex-col gap-3" aria-labelledby={headingId}>
        {STARTERS.map((id) => {
          const sp = SPECIES[id]
          return (
            <li key={id}>
              <button type="button" onClick={() => onPick(id)} className="px-btn flex w-full items-center gap-3 p-2 text-left">
                <CreatureArt species={sp} className="size-20 shrink-0" />
                <span className="flex flex-col">
                  <span className="font-pixel text-xs">{sp.name}</span>
                  <span style={{ color: `var(--t-${sp.type})` }}>Tipo {TYPE_LABEL[sp.type]}</span>
                  <span className="text-base text-muted-foreground">
                    Vida {sp.base.hp} · Ataque {sp.base.attack} · Defensa {sp.base.defense} · Vel {sp.base.speed}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p id={headingId} className="sr-only">
        Lista de criaturas iniciales
      </p>
      <p className="text-base text-muted-foreground">
        Fuego le gana a Planta, Planta a Agua y Agua a Fuego. Sombra solo es fuerte contra Sombra.
      </p>
      <button type="button" className="px-btn px-4" onClick={onBack}>
        Volver
      </button>
    </Shell>
  )
}

export function EndScreen({
  won,
  reached,
  onRetry,
}: {
  won: boolean
  reached: number
  onRetry: () => void
}) {
  return (
    <Shell title={won ? '¡Campeón de la arena!' : 'Fin del juego'}>
      <p>
        {won
          ? `Superaste los ${STAGES.length} combates y derrotaste al Rey Sombra.`
          : `Llegaste hasta ${STAGES[Math.min(reached, STAGES.length - 1)].title}. ¡La próxima sale!`}
      </p>
      <button type="button" className="px-btn font-pixel px-4 text-xs" onClick={onRetry}>
        Jugar de nuevo
      </button>
    </Shell>
  )
}
