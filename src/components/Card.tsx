import React from 'react'

type Props = {
  title?: string
  icon?: React.ReactNode
  children?: React.ReactNode
}

export default function Card({ title, icon, children }: Props) {
  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl transition hover:-translate-y-1">
      {title && (
        <div className="flex items-center mb-4 text-lg font-semibold">
          {icon && <span className="mr-2 text-2xl">{icon}</span>}
          {title}
        </div>
      )}
      {children}
    </div>
  )
}