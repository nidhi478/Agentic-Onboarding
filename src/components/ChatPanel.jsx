import { useEffect, useState } from 'react'

const facts = ['Trusted by 10,000+ merchants', '95% onboarding under 5 minutes', '₹500Cr+ processed via PayGlocal']

export default function ChatPanel({ messages, onSend, loading, thinking }) {
  const [input, setInput] = useState('')
  const [factIndex, setFactIndex] = useState(0)
  const [showThinking, setShowThinking] = useState(false)

  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setFactIndex((s) => (s + 1) % facts.length), 2300)
    return () => clearInterval(t)
  }, [loading])

  return (
    <section className="bg-white rounded-2xl shadow-soft p-4 flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, idx) => <div key={idx} className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${m.role === 'echo' ? 'bg-slate-100 mr-auto' : 'bg-blue-500 text-white ml-auto'}`}>{m.text}</div>)}
      </div>
      {loading && <div className="my-3 rounded-xl bg-indigo-50 text-indigo-700 text-xs p-2">{facts[factIndex]}</div>}
      <button className="text-xs text-blue-600 text-left mb-2" onClick={() => setShowThinking((s) => !s)}>Show Thinking</button>
      {showThinking && <div className="bg-slate-50 rounded-xl p-2 mb-2 text-xs space-y-1">{thinking.map((t, i) => <div key={i}>{t}</div>)}</div>}
      <form onSubmit={(e)=>{e.preventDefault(); if(!input.trim()) return; onSend(input); setInput('')}} className="flex gap-2">
        <input className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type your answer..."/>
        <button className="bg-slate-900 text-white rounded-xl px-4 text-sm">Send</button>
      </form>
    </section>
  )
}
