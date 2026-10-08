import { useEffect, useRef, useState } from 'react'
import { sfx } from '../audio'
import { battleStatsBetween, createBattle, createFighter, resolveTurn, typeName } from '../game/battle'
import { DIFFICULTIES, enemyLevel, STAGES } from '../game/data'
import { addStats, EMPTY_STATS } from '../game/run'
import type { BattleEvent, BattleOutcome, BattleState, BattleStats, Difficulty, Fighter, Move } from '../game/types'
import { CreatureArt } from './CreatureArt'

interface Props {
  starterId: string
  level: number
  stage: number
  difficulty: Difficulty
  onEnd: (outcome: Exclude<BattleOutcome, 'ongoing'>, stats: BattleStats) => void
}

interface Floater {
  id: number
  side: 'player' | 'enemy'
  text: string
}

interface View {
  playerHp: number
  enemyHp: number
  playerFainted: boolean
  enemyFainted: boolean
  text: string
  animating: 'player-attack' | 'enemy-attack' | null
  flash: 'player' | 'enemy' | null
  floaters: Floater[]
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function HpBar({ hp, max, label }: { hp: number; max: number; label: string }) {
  const pct = Math.max(0, Math.round((hp / max) * 100))
  const color = pct > 50 ? 'bg-accent' : pct > 20 ? 'bg-warning' : 'bg-primary'
  return (
    <div
      role="progressbar"
      aria-label={`Vida de ${label}`}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={hp}
      className="h-4 w-full border-2 border-black bg-black"
    >
      <div className={`h-full ${color}`} style={{ width: `${pct}%`, transition: 'width 400ms steps(8)' }} />
    </div>
  )
}

function InfoBox({ fighter, hp, align }: { fighter: Fighter; hp: number; align: 'left' | 'right' }) {
  return (
    <div className={`px-box w-[58%] max-w-[220px] p-2 ${align === 'right' ? 'ml-auto' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate">{fighter.species.name}</span>
        <span className="shrink-0 text-muted-foreground">Nv {fighter.level}</span>
      </div>
      <HpBar hp={hp} max={fighter.stats.maxHp} label={fighter.species.name} />
      {align === 'right' && (
        <p className="mt-1 text-right tabular-nums">
          {hp}/{fighter.stats.maxHp}
        </p>
      )}
    </div>
  )
}

function FloatingNumbers({ floaters, side }: { floaters: Floater[]; side: 'player' | 'enemy' }) {
  return (
    <>
      {floaters
        .filter((f) => f.side === side)
        .map((f) => (
          <span
            key={f.id}
            aria-hidden="true"
            className="float-up font-pixel pointer-events-none absolute -top-2 left-1/2 z-20 text-sm text-warning"
            style={{ textShadow: '2px 2px 0 #000' }}
          >
            {f.text}
          </span>
        ))}
    </>
  )
}

export function Battle({ starterId, level, stage, difficulty, onEnd }: Props) {
  const stageInfo = STAGES[stage]
  const config = DIFFICULTIES[difficulty]
  const [battle, setBattle] = useState<BattleState>(() =>
    createBattle(createFighter(starterId, level), createFighter(stageInfo.speciesId, enemyLevel(stageInfo, difficulty))),
  )
  const [view, setView] = useState<View>(() => ({
    playerHp: battle.player.hp,
    enemyHp: battle.enemy.hp,
    playerFainted: false,
    enemyFainted: false,
    text: `¡${battle.enemy.species.name} salvaje (Nv ${battle.enemy.level}) aparece!`,
    animating: null,
    flash: null,
    floaters: [],
  }))
  const [busy, setBusy] = useState(false)
  const mounted = useRef(true)
  const totals = useRef<BattleStats>(EMPTY_STATS)
  const floaterId = useRef(0)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, reducedMotion() ? Math.min(ms, 250) : ms))

  async function play(events: BattleEvent[], before: BattleState, sideOf: (text: string) => 'player' | 'enemy' | null) {
    const hp = { player: before.player.hp, enemy: before.enemy.hp }
    for (const event of events) {
      if (!mounted.current) return
      if (event.kind === 'text') {
        const side = sideOf(event.text)
        if (event.text.includes('muy efectivo')) {
          if (event.text.startsWith('No')) sfx.weakHit()
          else sfx.superHit()
        } else if (event.text.includes('falló')) {
          sfx.miss()
        } else if (event.text.includes('Ganaste')) {
          sfx.win()
        } else if (event.text.includes('Perdiste')) {
          sfx.lose()
        }
        setView((v) => ({ ...v, text: event.text, animating: side ? (side === 'player' ? 'player-attack' : 'enemy-attack') : null }))
        await sleep(side ? 900 : 700)
        setView((v) => ({ ...v, animating: null }))
      } else if (event.kind === 'damage') {
        const dealt = hp[event.target] - event.hp
        hp[event.target] = event.hp
        const id = ++floaterId.current
        // El golpe normal suena acá; los efectivos suenan al mostrar su mensaje.
        sfx.hit()
        setView((v) => ({
          ...v,
          flash: event.target,
          playerHp: event.target === 'player' ? event.hp : v.playerHp,
          enemyHp: event.target === 'enemy' ? event.hp : v.enemyHp,
          floaters: [...v.floaters, { id, side: event.target, text: `-${dealt}` }],
        }))
        await sleep(500)
        setView((v) => ({ ...v, flash: null, floaters: v.floaters.filter((f) => f.id !== id) }))
      } else {
        sfx.faint()
        setView((v) => ({
          ...v,
          playerFainted: event.target === 'player' ? true : v.playerFainted,
          enemyFainted: event.target === 'enemy' ? true : v.enemyFainted,
        }))
        await sleep(600)
      }
    }
  }

  async function choose(move: Move) {
    if (busy || battle.outcome !== 'ongoing') return
    sfx.click()
    setBusy(true)
    const before = battle
    const { state, events } = resolveTurn(before, move, Math.random, config.aiRandomness)
    totals.current = addStats(totals.current, battleStatsBetween(before, state))
    const playerName = before.player.species.name
    const enemyName = before.enemy.species.name
    await play(events, before, (text) => {
      if (text.startsWith(`${playerName} usa`)) return 'player'
      if (text.startsWith(`${enemyName} usa`)) return 'enemy'
      return null
    })
    if (!mounted.current) return
    setBattle(state)
    setBusy(false)
  }

  const over = battle.outcome !== 'ongoing'
  const won = battle.outcome === 'player-won'
  const isLast = stage === STAGES.length - 1

  return (
    <section aria-label={`Combate: ${stageInfo.title}`} className="mx-auto flex w-full max-w-md flex-col gap-3 p-3">
      <p className="font-pixel text-[10px] text-muted-foreground">
        {stageInfo.title} · {stage + 1}/{STAGES.length} · {config.label}
      </p>

      <div className="px-box relative aspect-[4/5] w-full overflow-hidden">
        <div className="arena-bg absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 flex h-full flex-col justify-between p-3">
          <div className="flex items-start">
            <InfoBox fighter={battle.enemy} hp={view.enemyHp} align="left" />
            <div className={`relative ml-auto ${isLast ? 'size-36' : 'size-28'}`}>
              <div
                className={`size-full ${view.enemyFainted ? 'faint' : view.animating === 'enemy-attack' ? 'lunge-left' : view.flash === 'enemy' ? 'hit' : 'idle'}`}
              >
                <CreatureArt species={battle.enemy.species} className="size-full" />
              </div>
              <FloatingNumbers floaters={view.floaters} side="enemy" />
            </div>
          </div>
          <div className="flex items-end">
            <div className="relative size-32">
              <div
                className={`size-full ${view.playerFainted ? 'faint' : view.animating === 'player-attack' ? 'lunge-right' : view.flash === 'player' ? 'hit' : 'idle'}`}
              >
                <CreatureArt species={battle.player.species} className="size-full -scale-x-100" />
              </div>
              <FloatingNumbers floaters={view.floaters} side="player" />
            </div>
            <InfoBox fighter={battle.player} hp={view.playerHp} align="right" />
          </div>
        </div>
      </div>

      <div className="px-box min-h-[5.5rem] p-3" aria-live="polite">
        <p>{view.text}</p>
      </div>

      {over ? (
        <button
          type="button"
          className="px-btn font-pixel px-4 text-xs"
          onClick={() => {
            sfx.select()
            onEnd(won ? 'player-won' : 'player-lost', totals.current)
          }}
        >
          {won ? (isLast ? '¡Terminar!' : 'Siguiente combate') : 'Continuar'}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Ataques">
          {battle.player.moves.map((move) => (
            <button
              key={move.id}
              type="button"
              disabled={busy}
              onClick={() => choose(move)}
              className="px-btn flex flex-col items-start px-3 py-2 text-left"
              style={{ borderColor: '#000', borderLeftColor: `var(--t-${move.type})`, borderLeftWidth: 10 }}
            >
              <span>{move.name}</span>
              <span className="text-base text-muted-foreground">
                {typeName(move.type)} · Pot {move.power}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
