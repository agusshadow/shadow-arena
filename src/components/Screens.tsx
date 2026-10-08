import { useEffect, useId, type ReactNode } from 'react'
import { sfx } from '../audio'
import { DIFFICULTIES, DIFFICULTY_ORDER, SPECIES, STAGES, STARTERS, TYPE_LABEL } from '../game/data'
import type { Save } from '../game/run'
import type { BattleStats, Difficulty } from '../game/types'
import { CreatureArt } from './CreatureArt'

function Shell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 p-4 pt-20">
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
            <CreatureArt key={id} species={SPECIES[id]} className="idle size-16" />
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

export function StarterScreen({
  difficulty,
  onDifficulty,
  onPick,
  onBack,
}: {
  difficulty: Difficulty
  onDifficulty: (d: Difficulty) => void
  onPick: (id: string) => void
  onBack: () => void
}) {
  const headingId = useId()
  return (
    <Shell title="Elegí tu criatura">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-muted-foreground">Dificultad</legend>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_ORDER.map((d) => (
            <label
              key={d}
              className={`px-btn flex items-center justify-center text-center ${difficulty === d ? 'bg-secondary' : ''}`}
            >
              <input
                type="radio"
                name="difficulty"
                value={d}
                checked={difficulty === d}
                onChange={() => {
                  sfx.click()
                  onDifficulty(d)
                }}
                className="sr-only"
              />
              {DIFFICULTIES[d].label}
            </label>
          ))}
        </div>
        <p className="text-base text-muted-foreground">{DIFFICULTIES[difficulty].description}</p>
      </fieldset>

      <ul className="flex flex-col gap-3" aria-labelledby={headingId}>
        {STARTERS.map((id) => {
          const sp = SPECIES[id]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  sfx.select()
                  onPick(id)
                }}
                className="px-btn flex w-full items-center gap-3 p-2 text-left"
              >
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

function StatsList({ stats }: { stats: BattleStats }) {
  const rows: [string, number][] = [
    ['Daño causado', stats.damageDealt],
    ['Daño recibido', stats.damageTaken],
    ['Turnos jugados', stats.turns],
  ]
  return (
    <dl className="px-box divide-y-2 divide-black p-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between py-1">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

const CONFETTI = ['#facc15', '#22c55e', '#38bdf8', '#f97316', '#a78bfa', '#ef4444']

function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className="confetti absolute top-0 block size-3"
          style={{
            left: `${(i * 37) % 100}%`,
            background: CONFETTI[i % CONFETTI.length],
            animationDelay: `${(i % 7) * 0.25}s`,
            animationDuration: `${2.6 + (i % 5) * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
}

export function EndScreen({
  won,
  reached,
  stats,
  difficulty,
  onRetry,
}: {
  won: boolean
  reached: number
  stats: BattleStats
  difficulty: Difficulty
  onRetry: () => void
}) {
  useEffect(() => {
    // El sonido del combate ya sonó; acá solo un detalle al aparecer la pantalla.
    if (won) sfx.win()
  }, [won])

  return (
    <>
      {won && <Confetti />}
      <div className="relative z-10">
        <Shell title={won ? '¡Campeón de la arena!' : 'Fin del juego'}>
          {won && (
            <div className="mx-auto flex gap-2" aria-hidden="true">
              {['★', '★', '★'].map((s, i) => (
                <span key={i} className="star-pop font-pixel text-3xl text-warning" style={{ animationDelay: `${i * 180}ms` }}>
                  {s}
                </span>
              ))}
            </div>
          )}
          <p>
            {won
              ? `Superaste los ${STAGES.length} combates en dificultad ${DIFFICULTIES[difficulty].label} y derrotaste al Rey Shadow.`
              : `Llegaste hasta ${STAGES[Math.min(reached, STAGES.length - 1)].title}. ¡La próxima sale!`}
          </p>
          <StatsList stats={stats} />
          <button
            type="button"
            className="px-btn font-pixel px-4 text-xs"
            onClick={() => {
              sfx.select()
              onRetry()
            }}
          >
            Jugar de nuevo
          </button>
        </Shell>
      </div>
    </>
  )
}
