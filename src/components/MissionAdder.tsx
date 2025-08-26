import React from 'react'

export default function MissionAdder({ onAdd }: { onAdd: (w: string, c: string, e: string) => void }) {
  const [word, setWord] = React.useState('')
  const [context, setContext] = React.useState('')
  const [example, setExample] = React.useState('')

  return (
    <div>
      <label className="block font-semibold mb-1">Add New Word:</label>
      <input
        className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 mb-3"
        placeholder="Enter a word you found..."
        value={word}
        onChange={(e) => setWord(e.target.value)}
      />
      <label className="block font-semibold mb-1">Context where you found it:</label>
      <input
        className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 mb-3"
        placeholder="Where did you see this word?"
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />
      <label className="block font-semibold mb-1">Your example sentence:</label>
      <input
        className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 mb-4"
        placeholder="Create your own sentence..."
        value={example}
        onChange={(e) => setExample(e.target.value)}
      />
      <button
        className="px-4 py-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-semibold"
        onClick={() => onAdd(word, context, example)}
      >
        Add Word
      </button>
    </div>
  )
}