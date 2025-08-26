import React from 'react'

export default function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button aria-label="Close" className="text-2xl text-gray-400 hover:text-black" onClick={onClose}>
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}