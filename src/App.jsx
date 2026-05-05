import { useMemo, useState } from 'react'
import ProgressSidebar from './components/ProgressSidebar'
import ChatPanel from './components/ChatPanel'
import CanvasPanel from './components/CanvasPanel'
import SummaryPanel from './components/SummaryPanel'
import { verifyOtp, verifyPan, verifyPennyDrop } from './lib/mockApi'

const steps = [
  { id: 'pan', label: 'PAN' },{ id: 'ckyc', label: 'CKYC' },{ id: 'gst', label: 'GST' },{ id: 'website', label: 'Website' },{ id: 'purpose', label: 'Purpose Code' },{ id: 'brand', label: 'Brand' },{ id: 'bank', label: 'Bank' },{ id: 'confirmation', label: 'Confirmation' },
]

const prompts = [
  'Hey! I’m Echo 👋 Could you share your PAN?','Great. Share your phone number for OTP verification.','Do you have GST? (yes/no)','Please share your website URL.','Optional: add purpose code or type skip.','Share your brand name (or type auto).','Enter bank account number and IFSC separated by comma.','Review complete. Type confirm to finish onboarding.'
]

export default function App() {
  const [activeStep, setActiveStep] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [state, setState] = useState({ messages: [{ role: 'echo', text: prompts[0] }], thinking: [], loading: false, error: false, currentStepLabel: steps[0].label })

  const update = (patch) => setState((s) => ({ ...s, ...patch }))
  const next = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1))

  const handleSend = async (text) => {
    update({ messages: [...state.messages, { role: 'user', text }], error: false })
    try {
      if (activeStep === 0) {
        update({ loading: true, thinking: ['🔍 Validating PAN via Signzy'] })
        const res = await verifyPan(text)
        update({ pan: text, name: res.name, loading: false, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: `Found you — ${res.name}.` }, { role: 'echo', text: prompts[1] }] })
      } else if (activeStep === 1) {
        if (!state.phone) { update({ phone: text, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: 'OTP sent. Enter 123456 to continue.' }] }); return }
        update({ loading: true, thinking: ['📡 Verifying OTP', '📡 Fetching CKYC details'] })
        const res = await verifyOtp(state.phone, text)
        update({ address: res.address, loading: false, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: `Address found: ${res.address}` }, { role: 'echo', text: prompts[2] }] })
      } else if (activeStep === 2) {
        const gst = text.toLowerCase() === 'yes' ? '29ABCDE1234F1Z8' : 'N/A'
        update({ gst, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: prompts[3] }] })
      } else if (activeStep === 3) update({ website: text, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: prompts[4] }] })
      else if (activeStep === 4) update({ purposeCode: text === 'skip' ? '' : text, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: prompts[5] }] })
      else if (activeStep === 5) update({ brand: text === 'auto' ? 'PayGlocal Partner Brand' : text, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: prompts[6] }] })
      else if (activeStep === 6) {
        const [bankAccount, ifsc] = text.split(',').map((x) => x.trim())
        update({ bankAccount, ifsc, loading: true, thinking: ['🏦 Running penny drop verification'] })
        try {
          const pd = await verifyPennyDrop()
          update({ accountHolderName: pd.accountHolderName, loading: false, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: `Penny drop successful. Holder: ${pd.accountHolderName}` }, { role: 'echo', text: prompts[7] }] })
        } catch {
          update({ loading: false, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: 'Penny drop failed. Please upload cancelled cheque later.' }, { role: 'echo', text: prompts[7] }] })
        }
      } else if (activeStep === 7) {
        update({ status: text.toLowerCase() === 'confirm' ? 'Onboarded ✅ | VKYC Pending ⚠️' : 'Pending', messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: 'All set! Onboarded ✅ VKYC Pending ⚠️' }] })
      }
      setCompletedSteps((prev) => new Set(prev).add(activeStep))
      if (activeStep < steps.length - 1) next()
    } catch {
      update({ loading: false, error: true, messages: [...state.messages, { role: 'user', text }, { role: 'echo', text: 'Hmm, I couldn’t verify that. Let’s try another way.' }] })
    }
  }

  const viewState = useMemo(() => ({ ...state, currentStepLabel: steps[activeStep].label }), [state, activeStep])

  return (
    <main className="p-4 grid grid-cols-12 gap-4 min-h-screen">
      <div className="col-span-2"><ProgressSidebar steps={steps} activeStep={activeStep} onStepClick={setActiveStep} completedSteps={completedSteps} /></div>
      <div className="col-span-5"><ChatPanel messages={state.messages} onSend={handleSend} loading={state.loading} thinking={state.thinking} /></div>
      <div className="col-span-3"><CanvasPanel step={activeStep} state={viewState} loading={state.loading} error={state.error} /></div>
      <div className="col-span-2"><SummaryPanel state={state} collapsed={collapsed} toggle={() => setCollapsed((s)=>!s)} /></div>
    </main>
  )
}
