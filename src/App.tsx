import { useEffect, useState } from 'react'
import { unlockAudio } from './audio'
import { STAGES } from './game/data'
import { addStats, advance, EMPTY_STATS, loadSave, newRun, persist, type Save } from './game/run'
import type { BattleStats, Difficulty } from './game/types'
import { Battle } from './components/Battle'
import { EndScreen, StarterScreen, TitleScreen } from './components/Screens'
import { SoundToggle } from './components/SoundToggle'

type Screen = 'title' | 'starter' | 'battle' | 'end'

interface EndResult {
  won: boolean
  reached: number
  stats: BattleStats
  difficulty: Difficulty
}

export default function App() {
  const [save, setSave] = useState<Save>(loadSave)
  const [screen, setScreen] = useState<Screen>('title')
  const [end, setEnd] = useState<EndResult>({ won: false, reached: 0, stats: EMPTY_STATS, difficulty: 'normal' })

  useEffect(() => persist(save), [save])

  // El navegador solo permite audio después de un gesto: lo habilitamos con el primer toque.
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  function pickStarter(id: string) {
    setSave((s) => ({ ...s, run: newRun(id, s.difficulty) }))
    setScreen('battle')
  }

  function handleBattleEnd(outcome: 'player-won' | 'player-lost', battleStats: BattleStats) {
    const run = save.run
    if (!run) return setScreen('title')
    const stats = addStats(run.stats, battleStats)

    if (outcome === 'player-lost') {
      setSave((s) => ({ ...s, run: null, best: Math.max(s.best, run.stage) }))
      setEnd({ won: false, reached: run.stage, stats, difficulty: run.difficulty })
      return setScreen('end')
    }

    const next = advance(run, battleStats)
    if (next) {
      setSave((s) => ({ ...s, run: next, best: Math.max(s.best, next.stage) }))
      return
    }
    setSave((s) => ({ ...s, run: null, best: STAGES.length, wins: s.wins + 1 }))
    setEnd({ won: true, reached: STAGES.length, stats, difficulty: run.difficulty })
    setScreen('end')
  }

  const run = save.run
  let content
  if (screen === 'starter') {
    content = (
      <StarterScreen
        difficulty={save.difficulty}
        onDifficulty={(difficulty) => setSave((s) => ({ ...s, difficulty }))}
        onPick={pickStarter}
        onBack={() => setScreen('title')}
      />
    )
  } else if (screen === 'end') {
    content = <EndScreen {...end} onRetry={() => setScreen('starter')} />
  } else if (screen === 'battle' && run) {
    // El key reinicia el combate al pasar de etapa.
    content = (
      <main className="mx-auto min-h-dvh w-full max-w-md pt-16">
        <Battle
          key={`${run.starterId}-${run.stage}`}
          starterId={run.starterId}
          level={run.level}
          stage={run.stage}
          difficulty={run.difficulty}
          onEnd={handleBattleEnd}
        />
      </main>
    )
  } else {
    content = <TitleScreen save={save} onContinue={() => setScreen('battle')} onNew={() => setScreen('starter')} />
  }

  return (
    <>
      <SoundToggle />
      {content}
    </>
  )
}
