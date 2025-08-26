import React from 'react'

type Kind = 'past' | 'present' | 'future'

export default function TimeWorldBadge({
  kind,
  mastery,
  signal,
  onClick,
}: {
  kind: Kind
  mastery: number
  signal: string
  onClick?: () => void
}) {
  const styles: Record<Kind, string> = {
    past: 'from-sky-400 to-blue-600',
    present: 'from-emerald-400 to-teal-600',
    future: 'from-pink-400 to-fuchsia-600',
  }
  const label = { past: 'PAST WORLD', present: 'PRESENT WORLD', future: 'FUTURE WORLD' }[kind]
  const icon = kind === 'past' ? '🕰️' : kind === 'present' ? '⏳' : '🚀'

  return (
    <button
      className={`text-white text-center p-6 rounded-2xl min-w-[200px] cursor-pointer transition shadow-lg bg-gradient-to-br ${styles[kind]} hover:-translate-y-1`}
      onClick={
        onClick ||
        (() =>
          alert(`Starting ${label}!\n\nFocus on signal words and sentence patterns for this time world.`))
      }
    >
      <div className="text-5xl mb-2">{icon}</div>
      <h3 className="font-bold tracking-wide">{label}</h3>
      <div className="text-2xl font-extrabold my-1">{mastery}%</div>
      <div className="opacity-90 text-sm mb-3">{signal}</div>
      <span className="px-4 py-2 rounded-full border border-white/30 bg-white/10 font-semibold">
        Practice {label}
      </span>
    </button>
  )
}