import React from 'react'

export default function ProgressBar({ value = 0 }: { value?: number }) {
  const width = Math.min(value || 0, 100)
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-[width]"
        style={{ width: `${width}%` }}
      />
    </div>
  )
}