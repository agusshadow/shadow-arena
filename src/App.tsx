import { useEffect, useState } from 'react'
import { STAGES } from './game/data'
import { advance, loadSave, newRun, persist, type Save } from './game/run'
import { Battle } from './components/Battle'
import { EndScreen, StarterScreen, TitleScreen } from './components/Screens'

type Screen = 'title' | 'starter' | 'battle' | 'end'

export default function App() {
  const [save, setSave] = useState<Save>(loadSave)
  const [screen, setScreen] = useState<Screen>('title')
  const [endResult, setEndResult] = useState<{ won: boolean; reached: number }>({ won: false, reached: 0 })

  useEffect(() => persist(save), [save])

  function pickStarter(id: string) {
    setSave((s) => ({ ...s, run: newRun(id) }))
    setScreen('battle')
  }

  function handleBattleEnd(outcome: 'player-won' | 'player-lost') {
    const run = save.run
    if (!run) return setScreen('title')

    if (outcome === 'player-lost') {
      setSave((s) => ({ ...s, run: null, best: Math.max(s.best, run.stage) }))
      setEndResult({ won: false, reached: run.stage })
      return setScreen('end')
    }

    const next = advance(run)
    if (next) {
      setSave((s) => ({ ...s, run: next, best: Math.max(s.best, next.stage) }))
      return
    }
    setSave((s) => ({ ...s, run: null, best: STAGES.length, wins: s.wins + 1 }))
    setEndResult({ won: true, reached: STAGES.length })
    setScreen('end')
  }

  if (screen === 'title') {
    return <TitleScreen save={save} onContinue={() => setScreen('battle')} onNew={() => setScreen('starter')} />
  }
  if (screen === 'starter') {
    return <StarterScreen onPick={pickStarter} onBack={() => setScreen('title')} />
  }
  if (screen === 'end') {
    return <EndScreen won={endResult.won} reached={endResult.reached} onRetry={() => setScreen('starter')} />
  }

  const run = save.run
  if (!run) return <TitleScreen save={save} onContinue={() => setScreen('battle')} onNew={() => setScreen('starter')} />

  // El key reinicia el combate al pasar de etapa.
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md">
      <Battle key={`${run.starterId}-${run.stage}`} starterId={run.starterId} level={run.level} stage={run.stage} onEnd={handleBattleEnd} />
    </main>
  )
}
