function Shimmer() { return <div className="animate-pulse bg-slate-200 h-36 rounded-xl"/> }

export default function CanvasPanel({ step, state, loading, error }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 min-h-[230px]">
      <h3 className="text-sm font-semibold mb-4">Live Canvas</h3>
      {loading ? <Shimmer/> : error ? <div className="text-amber-700 bg-amber-50 rounded-xl p-3 text-sm">Couldn’t fetch that. We can try another route.</div> : (
        <div className="rounded-xl border border-slate-200 p-4">
          {step === 0 && <div><p className="text-xs text-slate-500">PAN Preview</p><p className="font-semibold mt-2">{state.pan || 'ABCDE1234F'}</p><p className="text-sm">{state.name || '—'}</p></div>}
          {step === 1 && <div><p className="text-xs text-slate-500">CKYC Address Card</p><p className="text-sm mt-2">{state.address || 'Awaiting OTP verification'}</p></div>}
          {step === 6 && <div><p className="text-xs text-slate-500">Bank Verification Card</p><p className="text-sm mt-2">A/C: {state.bankAccount || '—'}</p><p className="text-sm">IFSC: {state.ifsc || '—'}</p><p className="text-sm">Holder: {state.accountHolderName || 'Pending penny drop'}</p></div>}
          {![0,1,6].includes(step) && <p className="text-sm text-slate-600">{`Step canvas for ${step + 1}: ${state.currentStepLabel}`}</p>}
        </div>
      )}
    </div>
  )
}
