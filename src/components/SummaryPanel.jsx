export default function SummaryPanel({ state, collapsed, toggle }) {
  return (
    <aside className="bg-white rounded-2xl shadow-soft p-4">
      <button className="text-xs text-blue-600 mb-3" onClick={toggle}>{collapsed ? 'Expand Summary' : 'Collapse Summary'}</button>
      {!collapsed && <div className="space-y-2 text-sm">
        {Object.entries(state).filter(([k,v]) => !['messages','thinking','loading','error','currentStepLabel'].includes(k) && v).map(([k,v]) => (
          <div key={k} className="flex justify-between gap-2 border-b border-slate-100 pb-1"><span className="text-slate-500">{k}</span><span className="text-right">{String(v)}</span></div>
        ))}
      </div>}
    </aside>
  )
}
