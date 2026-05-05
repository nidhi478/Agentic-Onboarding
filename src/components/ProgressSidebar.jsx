export default function ProgressSidebar({ steps, activeStep, onStepClick, completedSteps }) {
  return (
    <aside className="bg-white rounded-2xl shadow-soft p-4">
      <h2 className="text-sm font-semibold mb-4">Progress</h2>
      <ul className="space-y-3">
        {steps.map((step, i) => {
          const isActive = i === activeStep
          const isCompleted = completedSteps.has(i)
          return (
            <li key={step.id}>
              <button onClick={() => onStepClick(i)} className="flex items-center gap-3 w-full text-left">
                <span className={`h-7 w-7 rounded-full grid place-content-center text-xs font-semibold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                <span className={`text-sm ${isActive ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{step.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
