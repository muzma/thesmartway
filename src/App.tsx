import React, { useMemo, useState } from 'react'
import Card from './components/Card'
import ProgressBar from './components/ProgressBar'
import TimeWorldBadge from './components/TimeWorldBadge'
import Modal from './components/Modal'
import MissionAdder from './components/MissionAdder'

type Sentence = { id: number; text: string; time: 'past' | 'present' | 'future' }

const initialSentences: Sentence[] = [
  { id: 1, text: 'I watched a movie yesterday.', time: 'past' },
  { id: 2, text: 'She works at the bank every day.', time: 'present' },
  { id: 3, text: 'We will travel to Japan next month.', time: 'future' },
  { id: 4, text: 'They finished the project last week.', time: 'past' },
]

export default function App() {
  const [pool, setPool] = useState<Sentence[]>(initialSentences)
  const [bins, setBins] = useState<Record<'past' | 'present' | 'future', number[]>>({
    past: [],
    present: [],
    future: [],
  })
  const [dragId, setDragId] = useState<number | null>(null)

  const [vocabOpen, setVocabOpen] = useState(false)
  const [vContext, setVContext] = useState('"The company plans to develop a new software."')
  const [vWord, setVWord] = useState('develop')
  const [vDef, setVDef] = useState('')
  const [vColloc, setVColloc] = useState('')
  const [vExample, setVExample] = useState('')

  const [aiOpen, setAiOpen] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiChat, setAiChat] = useState<{ who: 'AI' | 'You'; text: string }[]>([
    { who: 'AI', text: "Hi! I'm here to help you with grammar patterns, not rules. What would you like to practice?" },
  ])

  const [missionOpen, setMissionOpen] = useState(false)
  const [missionWords, setMissionWords] = useState<{ word: string; context: string; example: string }[]>([
    { word: 'Settings', context: 'Go to Settings to change language', example: 'I need to check my phone settings.' },
    { word: 'Notification', context: 'You have a new notification', example: 'I received a notification about the meeting.' },
  ])
  const missionProgress = Math.min((missionWords.length / 5) * 100, 100)

  const [recording, setRecording] = useState(false)

  const [selected, setSelected] = useState<{ subject?: string; verb?: string; object?: string }>({})
  const builtSentence = useMemo(() => {
    return [selected.subject, selected.verb, selected.object].filter(Boolean).join(' ') || 'Build your sentence here...'
  }, [selected])

  const now0 = Date.now()
  const [srsDeck, setSrsDeck] = useState(
    [
      { id: 101, term: 'develop', definition: 'to create or improve', example: 'I want to develop my English skills.', due: now0, interval: 1, ease: 2.5, reps: 0 },
      { id: 102, term: 'decision', definition: 'a choice you make', example: 'Make a decision quickly.', due: now0, interval: 1, ease: 2.5, reps: 0 },
    ] as Array<{ id: number; term: string; definition: string; example: string; due: number; interval: number; ease: number; reps: number }>
  )
  const [reviewOpen, setReviewOpen] = useState(false)
  const [showBack, setShowBack] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)

  const [ghOpen, setGhOpen] = useState(false)
  const [ghChoice, setGhChoice] = useState<'because' | 'so' | 'but' | 'and'>('because')
  const [ghInputA, setGhInputA] = useState('I was late')
  const [ghInputB, setGhInputB] = useState('there was a traffic jam')
  const [ghOutput, setGhOutput] = useState('')

  function onDrop(world: 'past' | 'present' | 'future') {
    if (dragId == null) return
    const sentence = pool.find((s) => s.id === dragId)
    if (!sentence) return
    if (sentence.time === world) {
      setBins((b) => ({ ...b, [world]: [...b[world], dragId] }))
      setPool((p) => p.filter((s) => s.id !== dragId))
      alert(`✓ Correct! This sentence belongs to ${world.toUpperCase()} time world.`)
    } else {
      alert('Hint: Look for signal words (e.g., yesterday/last week for Past; every day/now for Present; tomorrow/next month/will for Future).')
    }
  }

  function findCollocations() {
    const map: Record<string, string[]> = {
      develop: ['develop skills', 'develop software', 'develop a plan', 'develop relationships'],
      make: ['make a decision', 'make progress', 'make a mistake', 'make friends'],
      take: ['take time', 'take action', 'take a break', 'take care'],
      get: ['get information', 'get ready', 'get better', 'get started'],
    }
    const key = vWord.trim().toLowerCase()
    setVColloc((map[key] || [`${vWord} something`, `${vWord} well`]).join(', '))
  }

  function addMissionWord(word?: string, context?: string, example?: string) {
    if (!word || !context || !example) return alert('Please fill in all fields for the new word!')
    setMissionWords((w) => [...w, { word, context, example }])
    alert(`Word "${word}" added to your mission progress!`)
  }

  function sendAIMessage(message?: string) {
    const text = (message ?? aiInput).trim()
    if (!text) return
    setAiChat((c) => [...c, { who: 'You', text }])
    const lower = text.toLowerCase()
    let resp = `I understand you want help with "${text}". Let's focus on patterns native speakers use. Can you give a specific example?`
    if (lower.includes('see') && lower.includes('look') && lower.includes('watch')) {
      resp =
        'SEE = your eyes notice (I see a bird)\nLOOK = you choose to use eyes (Look at that bird)\nWATCH = you look at something that moves (Watch the movie). Try one sentence for each!'
    } else if (lower.includes('hotel')) {
      resp = "Let's practice hotel check-in!\nReceptionist: Good evening! Do you have a reservation?\nYou: [Your turn]"
    } else if (/(go|went).*will go/.test(lower)) {
      resp = "Present: I go (habit)\nPast: I went (finished)\nFuture: I will go (plan). What time signals are in your sentence?"
    } else if (lower.startsWith('correct this:')) {
      resp = "Tip: For past time, use 'didn't' + base verb (e.g., He didn't come)."
    }
    setAiChat((c) => [...c, { who: 'AI', text: resp }])
    setAiInput('')
  }

  const wordBank = {
    subject: ['I', 'She', 'They', 'The student'],
    verb: ['eat', 'read', 'watch', 'develop'],
    object: ['rice', 'a book', 'TV', 'skills'],
  }
  function choose(type: 'subject' | 'verb' | 'object', word: string) {
    setSelected((s) => ({ ...s, [type]: word }))
  }
  function checkSentence() {
    if (!selected.subject || !selected.verb || !selected.object)
      return alert('Please select a subject, verb, and object to complete your sentence!')
    alert(`Excellent! "${builtSentence}" follows the S + V + O pattern. Try creating another sentence!`)
  }
  function clearSentence() {
    setSelected({})
  }

  function addToSRS(term?: string, definition?: string, example?: string) {
    const t = (term || '').trim()
    if (!t) return alert('Please enter a word to save.')
    const card = {
      id: Math.floor(Math.random() * 1e9),
      term: t,
      definition: definition || '',
      example: example || '',
      due: Date.now(),
      interval: 1,
      ease: 2.5,
      reps: 0,
    }
    setSrsDeck((d) => [...d, card])
  }
  function dueCards(now?: number) {
    const time = now || Date.now()
    return srsDeck.filter((c) => c.due <= time)
  }
  function startReview() {
    setShowBack(false)
    setCurrentIdx(0)
    setReviewOpen(true)
  }
  function grade(rating: 'again' | 'hard' | 'good' | 'easy') {
    const now = Date.now()
    const due = dueCards(now)
    if (due.length === 0) {
      setReviewOpen(false)
      return
    }
    const card = due[Math.min(currentIdx, due.length - 1)]
    let interval = Math.max(1, card.interval)
    let ease = card.ease
    if (rating === 'again') {
      interval = 1
      ease = Math.max(1.3, ease - 0.2)
    }
    if (rating === 'hard') {
      interval = Math.round(interval * 1.2)
      ease = Math.max(1.3, ease - 0.05)
    }
    if (rating === 'good') {
      interval = Math.round(interval * ease)
      ease = ease + 0.02
    }
    if (rating === 'easy') {
      interval = Math.round(interval * (ease + 0.3))
      ease = ease + 0.05
    }
    const nextDue = now + interval * 60 * 1000
    setSrsDeck((deck) => deck.map((c) => (c.id === card.id ? { ...c, interval, ease, reps: (c.reps || 0) + 1, due: nextDue } : c)))
    setShowBack(false)
  }

  function makeHack() {
    const A = (ghInputA || '').trim()
    const B = (ghInputB || '').trim()
    if (!A || !B) return setGhOutput('Fill both parts first.')
    const map = {
      because: `${A} because ${B}.`,
      so: `${A}, so ${B}.`,
      but: `${A}, but ${B}.`,
      and: `${A} and ${B}.`,
    }
    setGhOutput(map[ghChoice])
  }

  return (
    <div className="min-h-screen text-gray-800">
      <div className="max-w-[1400px] mx-auto p-5">
        <nav className="bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-2xl mb-6 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-500">The Smart Way</div>
          <ul className="hidden md:flex gap-6 font-medium">
            <li><a href="#time-worlds" className="hover:text-indigo-500">Time Worlds</a></li>
            <li><a href="#vocabulary" className="hover:text-indigo-500">Vocabulary</a></li>
            <li><a href="#grammar-hack" className="hover:text-indigo-500">Grammar Hack</a></li>
            <li><a href="#srs" className="hover:text-indigo-500">SRS</a></li>
            <li><a href="#sound-core" className="hover:text-indigo-500">Sound Core</a></li>
            <li><a href="#missions" className="hover:text-indigo-500">Missions</a></li>
            <li><a href="#ai-partner" className="hover:text-indigo-500">AI Partner</a></li>
          </ul>
          <div className="flex items-center gap-3 bg-indigo-50 text-sm px-4 py-2 rounded-full">
            <span>87% Foundation Complete</span>
            <span>🔥 12 days streak</span>
            <div className="w-10 h-10 bg-indigo-500 rounded-full grid place-items-center text-white font-bold">JD</div>
          </div>
        </nav>

        <section id="time-worlds" className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl mb-6">
          <h2 className="text-center text-2xl font-bold mb-6">🌍 The 3 World of Time Framework</h2>
          <div className="flex flex-col md:flex-row items-center justify-around gap-4 mb-6">
            <TimeWorldBadge kind="past" mastery={78} signal="yesterday, last night, ago" />
            <TimeWorldBadge kind="present" mastery={65} signal="now, currently, every day" />
            <TimeWorldBadge kind="future" mastery={42} signal="tomorrow, next week, will" />
          </div>
          <div className="p-5 rounded-xl bg-indigo-50">
            <h3 className="text-center font-semibold mb-4">🎯 Drag sentences to the correct Time World</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="grid gap-3">
                  {pool.map((s) => (
                    <div
                      key={s.id}
                      draggable
                      onDragStart={() => setDragId(s.id)}
                      className="bg-white p-4 rounded-xl shadow cursor-move hover:scale-[1.01] transition"
                    >
                      {s.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 grid md:grid-cols-3 gap-3">
                {(['past', 'present', 'future'] as const).map((world) => (
                  <div
                    key={world}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(world)}
                    className={`min-h-[120px] rounded-xl border-2 border-dashed grid place-items-center text-center p-3 ${
                      world === 'past' ? 'bg-sky-50' : world === 'present' ? 'bg-emerald-50' : 'bg-pink-50'
                    }`}
                  >
                    {bins[world].length === 0 ? (
                      <span className="opacity-70">Drop {world.toUpperCase()} sentences here</span>
                    ) : (
                      <div className="space-y-2 w-full">
                        {initialSentences
                          .filter((s) => bins[world].includes(s.id))
                          .map((s) => (
                            <div key={s.id} className="bg-white p-3 rounded-lg shadow text-left">
                              {s.text}
                            </div>
                          ))}
                        <div className="text-emerald-600 font-semibold">✓ Correct!</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card title="Today's Mission" icon="🌟">
            <h3 className="text-lg font-bold">LANGUAGE SWITCH CHALLENGE</h3>
            <p className="mt-1">
              Change your phone's language to English for 1 hour today. Find 5 new words you learn from real UI text.
            </p>
            <div className="bg-sky-50 rounded-xl p-4 mt-4">
              <ProgressBar value={missionProgress} />
              <p className="mt-2">Current Progress: {missionWords.length}/5 words found</p>
            </div>
            <div className="mt-3 space-y-2">
              {missionWords.slice(0, 2).map((w, i) => (
                <div key={i} className="bg-white p-3 rounded-lg">
                  <strong>
                    {i + 1}. {w.word}
                  </strong>
                  <div className="text-sm text-gray-600">
                    <em>Context:</em> {w.context}
                  </div>
                  <div className="text-sm">
                    <em>My Example:</em> {w.example}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                className="px-4 py-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-semibold"
                onClick={() => setMissionOpen(true)}
              >
                VIEW DETAILS
              </button>
              <button
                className="px-4 py-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-semibold"
                onClick={() =>
                  missionWords.length >= 5
                    ? alert('🎉 Mission Complete! +50 XP')
                    : alert(`You need ${5 - missionWords.length} more words to complete this mission.`)
                }
              >
                MARK COMPLETE
              </button>
            </div>
          </Card>

          <Card title="Vocabulary Detective" icon="🔍">
            <h3 className="text-lg font-bold">Today's Word in Context</h3>
            <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg p-4 my-3">
              <em>
                "The company plans to <strong>develop</strong> a new software."
              </em>
            </div>
            <button
              className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-br from-indigo-400 to-violet-500"
              onClick={() => setVocabOpen(true)}
            >
              INVESTIGATE THIS WORD
            </button>
            <div className="mt-4">
              <h4 className="font-semibold">Core Features:</h4>
              <ul className="mt-2 text-sm space-y-1">
                <li>✓ Simple Definition: to create something new</li>
                <li>✓ Collocations: develop a plan, develop skills</li>
                <li>✓ Personal Example: "I want to develop my English skills."</li>
                <li>✓ Visual Association: [developers working]</li>
              </ul>
            </div>
            <div className="mt-4">
              <button
                className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-br from-indigo-400 to-violet-500"
                onClick={() => setVocabOpen(true)}
              >
                Find Word in Context
              </button>
            </div>
          </Card>

          <Card title="Your AI Language Partner" icon="🤖">
            <div className="bg-sky-50 p-4 rounded-lg mb-3">
              <p>
                <strong>AI:</strong> Hi there! Ready for today's conversation practice?
              </p>
            </div>
            <div className="flex gap-2 flex-wrap mb-3">
              <button
                className="px-3 py-1 rounded-full text-white text-xs bg-indigo-500"
                onClick={() => {
                  setAiOpen(true)
                  sendAIMessage('Help me practice hotel check-in conversation')
                }}
              >
                Simulate Hotel Check-in
              </button>
              <button
                className="px-3 py-1 rounded-full text-white text-xs bg-indigo-500"
                onClick={() => {
                  setAiOpen(true)
                  sendAIMessage('Explain: go vs went vs will go')
                }}
              >
                Get Grammar Explanation
              </button>
              <button
                className="px-3 py-1 rounded-full text-white text-xs bg-indigo-500"
                onClick={() => {
                  setAiOpen(true)
                  sendAIMessage('Correct this: He not come to party.')
                }}
              >
                Correct My Writing
              </button>
              <button
                className="px-3 py-1 rounded-full text-white text-xs bg-indigo-500"
                onClick={() => {
                  setAiOpen(true)
                  sendAIMessage('Explain: see vs look vs watch')
                }}
              >
                Explain See/Look/Watch
              </button>
            </div>
            <textarea
              className="w-full h-16 p-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-indigo-400"
              placeholder="Type your sentence here for AI feedback..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
            <button
              className="mt-2 px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-br from-indigo-400 to-violet-500"
              onClick={() => {
                setAiOpen(true)
                sendAIMessage()
              }}
            >
              Get AI Feedback
            </button>
          </Card>
        </div>

        <div id="sound-core" className="grid md:grid-cols-3 gap-6 mb-8">
          <Card title="Sound Core Practice" icon="🎧">
            <h3 className="font-semibold">Today's Focus: /iː/ vs /ɪ/ (sheep vs ship)</h3>
            <div className="mt-3 text-sm">
              <strong>Listen:</strong> "I see a ship."
            </div>
            <div className="flex justify-center gap-3 my-4">
              <button className={`w-12 h-12 rounded-full text-xl text-white ${recording ? 'bg-pink-500' : 'bg-emerald-400'}`} onClick={() => alert('▶️ Playing sample...')}>▶️</button>
              <button
                className={`w-12 h-12 rounded-full text-xl text-white ${
                  recording ? 'bg-pink-500 animate-pulse' : 'bg-emerald-400'
                }`}
                onClick={() => {
                  if (!recording) {
                    setRecording(true)
                    setTimeout(() => {
                      setRecording(false)
                      setTimeout(
                        () =>
                          alert(
                            'Recording complete! Your pronunciation sounds good. Keep practicing the /iː/ vs /ɪ/ distinction.'
                          ),
                        300,
                      )
                    }, 2000)
                  } else {
                    setRecording(false)
                  }
                }}
              >
                🎤
              </button>
              <button
                className="w-12 h-12 rounded-full text-xl text-white bg-emerald-400"
                onClick={() =>
                  alert('Comparing pronunciation... Good job! /iː/ in "see" is clear. Make /ɪ/ in "ship" a bit shorter.')
                }
              >
                📊
              </button>
            </div>
            <div className="h-14 rounded-full bg-gradient-to-r from-emerald-400 to-teal-600 relative overflow-hidden">
              <div className="absolute inset-0 -left-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[wave_2s_linear_infinite]" />
            </div>
            <style>{`@keyframes wave{0%{left:-100%}100%{left:100%}}`}</style>
            <div className="mt-3 bg-indigo-50 p-3 rounded-lg text-sm">
              <strong>Tip:</strong> For /iː/ (see), smile slightly. For /ɪ/ (ship), keep mouth more relaxed.
            </div>
          </Card>

          <Card title="Core Structure Builder" icon="🧩">
            <p>Build sentences using the pattern: Subject + Verb + Object</p>
            <div className="flex flex-wrap gap-2 my-3">
              {wordBank.subject.map((w) => (
                <button
                  key={w}
                  onClick={() => choose('subject', w)}
                  className={`px-4 py-2 rounded-full border-2 ${
                    selected.subject === w ? 'bg-violet-600 text-white border-indigo-400' : 'bg-sky-50 hover:bg-indigo-500 hover:text-white border-transparent'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 my-2">
              {wordBank.verb.map((w) => (
                <button
                  key={w}
                  onClick={() => choose('verb', w)}
                  className={`px-4 py-2 rounded-full border-2 ${
                    selected.verb === w ? 'bg-violet-600 text-white border-indigo-400' : 'bg-sky-50 hover:bg-indigo-500 hover:text-white border-transparent'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 my-2">
              {wordBank.object.map((w) => (
                <button
                  key={w}
                  onClick={() => choose('object', w)}
                  className={`px-4 py-2 rounded-full border-2 ${
                    selected.object === w ? 'bg-violet-600 text-white border-indigo-400' : 'bg-sky-50 hover:bg-indigo-500 hover:text-white border-transparent'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="min-h-[56px] bg-white p-3 rounded-lg border-2 border-dashed text-gray-500 my-3 flex items-center">
              {builtSentence}
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-semibold"
                onClick={checkSentence}
              >
                Check Sentence
              </button>
              <button className="px-4 py-2 rounded-full bg-gray-500 text-white font-semibold" onClick={clearSentence}>
                Clear
              </button>
            </div>
          </Card>

          <Card title="Your Progress" icon="📊">
            <div className="mb-3">
              <h4 className="font-semibold">Foundation Building: 85%</h4>
              <ProgressBar value={85} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-indigo-50 p-2 rounded">
                <span>Core Structure:</span>
                <span className="font-bold text-indigo-500">92%</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-50 p-2 rounded">
                <span>Sound Core:</span>
                <span className="font-bold text-indigo-500">76%</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-50 p-2 rounded">
                <span>Vocabulary Detective:</span>
                <span className="font-bold text-indigo-500">68%</span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold">Time Worlds Mastery:</h4>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between bg-sky-50 p-2 rounded">
                  <span>Past World:</span>
                  <span className="font-bold text-sky-500">78%</span>
                </div>
                <div className="flex items-center justify-between bg-emerald-50 p-2 rounded">
                  <span>Present World:</span>
                  <span className="font-bold text-emerald-500">65%</span>
                </div>
                <div className="flex items-center justify-between bg-pink-50 p-2 rounded">
                  <span>Future World:</span>
                  <span className="font-bold text-pink-500">42%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-3xl font-extrabold text-indigo-500">142</div>
              <p>Total Sentences Created</p>
              <div className="text-3xl font-extrabold text-indigo-500 mt-2">287</div>
              <p>Words Mastered in Context</p>
            </div>
          </Card>
        </div>

        <section id="grammar-hack" className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl mb-6">
          <h2 className="text-2xl font-bold mb-4">🧠 Grammar Hack – Pattern Power</h2>
          <p className="text-sm mb-4">
            Master meaning-first connectors: <strong>because</strong>, <strong>so</strong>, <strong>but</strong>, <strong>and</strong>.
            Combine two ideas with the best connector.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400"
                  value={ghInputA}
                  onChange={(e) => setGhInputA(e.target.value)}
                  placeholder="Clause A (e.g., I was late)"
                />
                <input
                  className="p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400"
                  value={ghInputB}
                  onChange={(e) => setGhInputB(e.target.value)}
                  placeholder="Clause B (e.g., there was a traffic jam)"
                />
              </div>
              <div className="flex gap-2 flex-wrap mt-3">
                {(['because', 'so', 'but', 'and'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setGhChoice(c)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      ghChoice === c
                        ? 'bg-violet-600 text-white border-indigo-400'
                        : 'bg-sky-50 hover:bg-indigo-500 hover:text-white border-transparent'
                    }`}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setGhInputA('I studied hard')
                    setGhInputB('I passed the test')
                    setGhChoice('so')
                  }}
                  className="px-4 py-2 rounded-full bg-gray-100"
                >
                  Try Example
                </button>
                <button
                  onClick={() => setGhOpen(true)}
                  className="px-4 py-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-semibold"
                >
                  Open Exercise
                </button>
              </div>
              <div className="min-h-[56px] bg-white p-3 rounded-lg border-2 border-dashed text-gray-700 my-3 flex items-center">
                {ghOutput || 'Result will appear here...'}
              </div>
              <button
                className="px-4 py-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-semibold"
                onClick={makeHack}
              >
                Make Sentence
              </button>
            </div>
            <div>
              <div className="bg-indigo-50 p-4 rounded-xl text-sm">
                <p className="font-semibold mb-2">When to use:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>because</strong> → gives a reason (cause)
                  </li>
                  <li>
                    <strong>so</strong> → shows a result (effect)
                  </li>
                  <li>
                    <strong>but</strong> → shows contrast
                  </li>
                  <li>
                    <strong>and</strong> → adds related info
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="srs" className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl mb-6">
          <h2 className="text-2xl font-bold mb-2">🗂️ Vocabulary Builder (SRS)</h2>
          <p className="text-sm mb-4">Manage your spaced-repetition deck. Add from Vocabulary Detective and review due cards.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <div className="text-3xl font-extrabold text-indigo-500">{srsDeck.length}</div>
                  <div className="text-sm">Cards in Deck</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <div className="text-3xl font-extrabold text-emerald-600">{dueCards().length}</div>
                  <div className="text-sm">Due Now</div>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl">
                  <div className="text-3xl font-extrabold text-pink-600">
                    {srsDeck.reduce((a, c) => a + (c.reps || 0), 0)}
                  </div>
                  <div className="text-sm">Total Reviews</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-br from-indigo-400 to-violet-500" onClick={startReview}>
                  Review Now
                </button>
                <button
                  onClick={() => {
                    addToSRS('collocation', 'words that often go together', 'make a decision, take a break')
                    addToSRS('context', 'the situation around words', 'Use words in context.')
                    alert('Sample words added!')
                  }}
                  className="px-5 py-2 rounded-full bg-gray-800 text-white font-semibold"
                >
                  Add Sample Pack
                </button>
              </div>
              <div className="mt-4 bg-white p-4 rounded-xl border">
                <h3 className="font-semibold mb-2">Recent Cards</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {srsDeck.slice(-6).reverse().map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-slate-50 border">
                      <div className="font-bold">{c.term}</div>
                      <div className="text-sm text-gray-600">{c.definition}</div>
                      <div className="text-xs opacity-70">
                        <em>e.g.</em> {c.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-indigo-50 p-4 rounded-xl text-sm">
                <p className="font-semibold mb-2">How SRS works (simple):</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Review due cards.</li>
                  <li>
                    Rate: <em>Again</em> / <em>Hard</em> / <em>Good</em> / <em>Easy</em>.
                  </li>
                  <li>We schedule the next review (minutes → hours → days).</li>
                </ol>
                <p className="mt-2">
                  Tip: Add <strong>your own example</strong> to make memory stronger.
                </p>
              </div>
            </div>
          </div>
        </section>

        <p className="text-white/80 text-center text-sm">Prototype UI • The Smart Way</p>
      </div>

      {/* Vocabulary Detective Modal */}
      <Modal open={vocabOpen} onClose={() => setVocabOpen(false)} title="🔍 Vocabulary Detective - Word Investigation">
        <label className="block font-semibold mb-1">Context Sentence:</label>
        <textarea
          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 mb-3"
          rows={3}
          value={vContext}
          onChange={(e) => setVContext(e.target.value)}
        />
        <label className="block font-semibold mb-1">Target Word:</label>
        <input
          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 mb-3"
          value={vWord}
          onChange={(e) => setVWord(e.target.value)}
        />
        <label className="block font-semibold mb-1">Simple Definition:</label>
        <input
          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 mb-3"
          value={vDef}
          onChange={(e) => setVDef(e.target.value)}
          placeholder="Write a simple definition..."
        />
        <label className="block font-semibold mb-1">Common Collocations:</label>
        <input
          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 mb-3"
          value={vColloc}
          onChange={(e) => setVColloc(e.target.value)}
          placeholder="develop a plan, develop skills..."
        />
        <label className="block font-semibold mb-1">Your Personal Example:</label>
        <textarea
          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 mb-4"
          rows={3}
          value={vExample}
          onChange={(e) => setVExample(e.target.value)}
          placeholder="Create your own sentence using this word..."
        />
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-semibold"
            onClick={() => {
              addToSRS(vWord, vDef || 'to create something new', vExample || 'I want to develop my English skills.')
              alert('Saved to SRS! Added to your deck.')
              setVocabOpen(false)
            }}
          >
            Save to My Vocabulary
          </button>
          <button className="px-4 py-2 rounded-full bg-emerald-500 text-white font-semibold" onClick={findCollocations}>
            Find Collocations
          </button>
        </div>
      </Modal>

      {/* AI Modal */}
      <Modal open={aiOpen} onClose={() => setAiOpen(false)} title="🤖 AI Language Partner">
        <div className="max-h-72 overflow-y-auto p-4 bg-indigo-50 rounded-lg mb-4 space-y-3">
          {aiChat.map((m, i) => (
            <div key={i} className={m.who === 'AI' ? 'bg-white p-3 rounded-lg' : ''}>
              <strong>{m.who}:</strong> {m.text}
            </div>
          ))}
        </div>
        <textarea
          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400 mb-3"
          rows={3}
          placeholder="Type your message or sentence for correction..."
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-3 py-1 rounded-full text-white text-xs bg-indigo-500"
            onClick={() => {
              setAiOpen(true)
              sendAIMessage('Explain: I go vs I went vs I will go')
            }}
          >
            Time Patterns
          </button>
          <button
            className="px-3 py-1 rounded-full text-white text-xs bg-indigo-500"
            onClick={() => {
              setAiOpen(true)
              sendAIMessage('Correct this: I am go to school yesterday')
            }}
          >
            Correct Sentence
          </button>
          <button
            className="px-3 py-1 rounded-full text-white text-xs bg-indigo-500"
            onClick={() => {
              setAiOpen(true)
              sendAIMessage('Explain: see vs look vs watch')
            }}
          >
            Word Differences
          </button>
          <button
            className="px-3 py-1 rounded-full text-white text-xs bg-indigo-500"
            onClick={() => {
              setAiOpen(true)
              sendAIMessage('Help me practice hotel check-in conversation')
            }}
          >
            Practice Scenario
          </button>
        </div>
        <button
          className="mt-3 px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-br from-indigo-400 to-violet-500"
          onClick={() => sendAIMessage()}
        >
          Send Message
        </button>
      </Modal>

      {/* Mission Modal */}
      <Modal open={missionOpen} onClose={() => setMissionOpen(false)} title="🌟 Language Switch Challenge">
        <p className="mb-2 font-semibold">Mission Description:</p>
        <p className="mb-4 text-sm">
          Change your device's language to English for 1 hour today. This challenges your brain to think in English and discover new vocabulary in real context.
        </p>
        <div className="bg-sky-50 p-4 rounded-xl mb-4">
          <h3 className="font-semibold">Steps to Complete:</h3>
          <ol className="list-decimal ml-6 text-sm space-y-1 mt-2">
            <li>Go to your phone/computer Settings</li>
            <li>Find Language & Region settings</li>
            <li>Change language to English</li>
            <li>Use your device normally for 1 hour</li>
            <li>Write down 5 new words you encounter</li>
            <li>Create example sentences with each word</li>
          </ol>
        </div>
        <div className="space-y-3 mb-4">
          <h3 className="font-semibold">Words Found ({missionWords.length}/5):</h3>
          {missionWords.map((w, i) => (
            <div key={i} className="bg-white p-3 rounded-lg">
              <strong>
                {i + 1}. {w.word}
              </strong>
              <br />
              <em>Context:</em> {w.context}
              <br />
              <em>My Example:</em> {w.example}
            </div>
          ))}
        </div>
        <MissionAdder onAdd={(w, c, e) => addMissionWord(w, c, e)} />
      </Modal>

      {/* Grammar Hack Exercise Modal */}
      <Modal open={ghOpen} onClose={() => setGhOpen(false)} title="🧠 Grammar Hack – Quick Exercise">
        <p className="text-sm mb-3">Combine the ideas using the best connector. Try to keep meaning natural.</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input className="p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400" value={ghInputA} onChange={(e) => setGhInputA(e.target.value)} placeholder="Clause A" />
          <input className="p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-400" value={ghInputB} onChange={(e) => setGhInputB(e.target.value)} placeholder="Clause B" />
        </div>
        <div className="flex gap-2 flex-wrap mb-3">
          {(['because', 'so', 'but', 'and'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setGhChoice(c)}
              className={`px-4 py-2 rounded-full border-2 ${
                ghChoice === c ? 'bg-violet-600 text-white border-indigo-400' : 'bg-sky-50 hover:bg-indigo-500 hover:text-white border-transparent'
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
          <button
            onClick={makeHack}
            className="px-4 py-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-semibold"
          >
            Make Sentence
          </button>
        </div>
        <div className="min-h-[56px] bg-white p-3 rounded-lg border-2 border-dashed">{ghOutput || 'Result will appear here...'}</div>
      </Modal>
    </div>
  )
}