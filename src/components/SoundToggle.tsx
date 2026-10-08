import { setMuted, sfx, unlockAudio, useMuted } from '../audio'

export function SoundToggle() {
  const muted = useMuted()
  return (
    <button
      type="button"
      onClick={() => {
        unlockAudio()
        setMuted(!muted)
        if (muted) sfx.select()
      }}
      aria-pressed={!muted}
      aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
      className="px-btn fixed top-3 right-3 z-50 inline-flex size-12 items-center justify-center"
    >
      <svg viewBox="0 0 16 16" className="size-6" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
        <path d="M2 6h3l3-3v10l-3-3H2z" />
        {muted ? (
          <path d="M10 6l1 1 1-1 1 1-1 1 1 1-1 1-1-1-1 1-1-1 1-1-1-1z" />
        ) : (
          <>
            <path d="M10 6h1v4h-1z" />
            <path d="M12 4h1v8h-1z" />
          </>
        )}
      </svg>
    </button>
  )
}
