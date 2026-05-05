# PayGlocal Conversational Onboarding — Build Spec

## 1) Product Goal
Create a chat-first onboarding journey for individual merchants that can be completed in about 3 minutes, with high trust and minimal manual input.

Primary outcomes:
- Reduce form fatigue with one-question-at-a-time conversation.
- Maximize auto-filled fields using verification and enrichment APIs.
- Keep users informed through visible progress, transparent system actions, and live visual summaries.

---

## 2) UX Layout (3+1 Columns)

### A. Left Sidebar: Progress Tracker
- Vertical list of all onboarding steps.
- State per step: `completed` | `active` | `upcoming`.
- Step is clickable; clicking rewinds/focuses chat and canvas to that step.
- Always visible on desktop; collapsible drawer on smaller screens.

### B. Main Panel: Chat
- Persona: AI assistant **Echo**.
- Tone: friendly, concise, non-jargon.
- Message alignment:
  - Echo on left.
  - Merchant on right.
- Input modes by step:
  - Text (PAN, URL, account number, IFSC, GST).
  - OTP input.
  - Quick-reply chips (Yes/No, Skip, Select option).

#### Chat Subcomponents
1. **Message list** (virtualized if long).
2. **Composer** (contextual input + validation hints).
3. **Show Thinking drawer**:
   - Collapsed by default.
   - Expand to show step-level action log.
   - Example events:
     - `🔍 Validating PAN via Signzy`
     - `📡 Fetching CKYC details`
     - `✅ Verification successful`
4. **Dynamic trust bubble**:
   - Rotates social-proof facts every 2–3 seconds while async ops run.
   - Stops when response resolves.
   - Examples:
     - Trusted by 10,000+ merchants
     - 95% onboarding completed in under 5 minutes
     - ₹500Cr+ processed through PayGlocal

### C. Canvas Panel: Live Visualization
- Mirrors current step with a visual card/skeleton.
- Step examples:
  - PAN step: PAN card preview.
  - Aadhaar step: identity/address card.
  - Bank step: bank account verification card.
- Required states:
  - `loading`: shimmer animation.
  - `success`: populated values.
  - `error`: safe fallback + retry affordance.

### D. Right Sidebar: Summary Panel (Collapsible)
- Sticky panel with collected fields grouped by step.
- Editable values.
- Clicking a field scrolls chat and canvas to relevant step.
- Shows completion meter and unresolved items.

---

## 3) Visual Guidelines
- Theme: Light.
- Typography: Inter.
- UI style: minimal, rounded cards, soft shadows, subtle motion.
- Keep animation purposeful; avoid decorative noise.

---

## 4) Onboarding State Machine

## Steps
1. PAN collection + verification.
2. CKYC via Aadhaar OTP.
3. GST handling.
4. Website capture + validation.
5. Purpose code (optional/skippable).
6. Brand name (auto/manual).
7. Aggregator volume (auto/manual).
8. Bank details.
9. Penny drop verification + cheque fallback.
10. Confirmation (details + pricing + T&C consent).
11. Completion (Onboarded, VKYC pending prompt).

### Per-step behavior

#### Step 1: PAN
- Ask PAN.
- Validate format client-side.
- Trigger Signzy verification.
- Parse and store: name, DOB, gender, and GST candidates if available.
- Canvas: PAN shimmer → populated PAN card.

#### Step 2: CKYC via Aadhaar
- Ask phone number.
- Send OTP, capture OTP, verify.
- Fetch Aadhaar-linked identity and addresses.
- On failure: conversationally switch to DigiLocker path.

#### Step 3: GST logic
- If GST list is available from PAN/KYC response:
  - Display selectable GST list.
- Else ask: “Do you have GST?”
  - Yes → input GST and validate.
  - No → continue without GST.

#### Step 4: Website
- Ask URL.
- Validate syntax + optional reachability check.

#### Step 5: Purpose code (optional)
- Provide searchable dropdown/chips.
- Allow explicit skip.

#### Step 6: Brand name
- If GST exists: fetch via Karza.
- Else collect manual brand name.

#### Step 7: Aggregator volume
- If GST exists: fetch estimate automatically.
- Else collect manual monthly/annual volume.

#### Step 8: Bank details
- Ask account number and IFSC.
- Validate IFSC format + account length constraints.

#### Step 9: Penny drop
- Trigger verification.
- Success: save account holder name.
- Failure: ask for cancelled cheque upload and continue.

#### Step 10: Confirmation
- Render final summary of all collected data.
- Show pricing.
- Require T&C checkbox before submit.

#### Step 11: Completion
- Display final state:
  - `Onboarded ✅`
  - `VKYC Pending ⚠️`
- Primary CTA: Start VKYC.

---

## 5) System Rules

### Speed
- Parallelize independent fetches (e.g., enrichment + metadata).
- Prefetch the next step’s assets/config when current step begins.

### Conversational UX
- One question at a time.
- Short responses; no wall of text.
- Use quick replies frequently.
- Keep progress always visible.

### Error handling
- Never expose raw stack/API errors.
- Transform failures into friendly fallbacks.
- Example: “Hmm, I couldn’t verify that. Let’s try another way.”

### Trust & transparency
- Surface ongoing actions in the “Show Thinking” drawer.
- Use trust bubble only during waits.
- Confirm auto-fetched values before locking.

---

## 6) Data Model (TypeScript)

```ts
type Address = {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

type BankDetails = {
  accountNumber: string
  ifsc: string
  accountHolderName?: string
  cancelledChequeUrl?: string
}

type OnboardingStatus = 'in_progress' | 'completed'
type StepStatus = 'completed' | 'active' | 'upcoming' | 'error'

type OnboardingState = {
  step: number
  stepStatus: Record<number, StepStatus>

  pan?: string
  name?: string
  dob?: string
  gender?: string

  phone?: string
  aadhaarMasked?: string
  permanentAddress?: Address
  correspondenceAddress?: Address

  gst?: string[]
  selectedGst?: string

  website?: string
  purposeCode?: string
  brandName?: string
  volume?: number

  bankDetails?: BankDetails

  acceptedTerms?: boolean
  status: OnboardingStatus
}
```

---

## 7) Frontend Architecture (React)

## Suggested stack
- React + Tailwind.
- Zustand for state.
- Framer Motion for micro-animations.

## Component map
- `OnboardingPage`
  - `ProgressSidebar`
  - `ChatPanel`
    - `MessageList`
    - `ThinkingDrawer`
    - `TrustBubble`
    - `InputComposer`
  - `CanvasPanel`
    - `PanCardCanvas`
    - `AadhaarCanvas`
    - `BankCanvas`
    - `FallbackCanvas`
  - `SummarySidebar`

## State slices
- `conversationSlice`: messages, pending state, typing indicators.
- `onboardingSlice`: current step, payload, validations, completion.
- `integrationSlice`: API statuses, retries, timeout markers.
- `uiSlice`: drawers, selected sidebar field, collapse states.

## Orchestration pattern
- Step handlers define:
  - prompt,
  - input type,
  - validation,
  - submission action,
  - success/failure transitions.

---

## 8) API Contract Design (Abstract)

Use resilient wrappers around provider APIs (Signzy, CKYC/CERSAI, Karza, Penny Drop), returning normalized objects.

Example normalized result pattern:

```ts
type ProviderResult<T> = {
  ok: boolean
  data?: T
  errorCode?: string
  message?: string
  retryable?: boolean
}
```

Guidelines:
- Timeout every external call.
- Store correlation IDs for audits.
- Sanitize PII in logs.
- Maintain deterministic fallbacks per step.

---

## 9) Metrics & Success Criteria
- Median completion time ≤ 3 minutes.
- 90%+ auto-fill coverage for eligible merchants.
- Reduced step drop-off, especially before bank verification.
- Low correction rate for auto-fetched fields.

Track:
- step enter/exit timestamps,
- retries per integration,
- fallback usage (e.g., DigiLocker path),
- completion and VKYC start conversion.

---

## 10) Optional Enhancements
- Voice input in chat composer.
- Smart suggestions based on prior responses.
- Resume later with secure session recovery.
- Echo typing indicators + optimistic UI.

