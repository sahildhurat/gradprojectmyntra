# Myntra Match Check — Technical Architecture

---

## 1. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Frontend UI** | Stitch AI (design-to-code) | All screens, components, layouts, and styling are built using Stitch AI. Generated code is uploaded to the project and integrated with the backend. |
| **Framework** | Next.js 14 (App Router) | API routes for AI calls, share-token generation, and vote collection — all server-side without a separate backend. Static/ISR for the voting page. One-day timeline demands a single deployable unit. |
| **Language** | TypeScript | Structured output schema, product data shapes, and vote types all benefit from compile-time safety. Prevents seeded-data drift silently breaking the UI. |
| **Styling** | Vanilla CSS (CSS Modules) | Maximum control over mobile-first layout, micro-animations, glassmorphism effects. No utility-class overhead. Stitch AI generates the initial styles; integration may refine them. |
| **AI Provider** | Google Gemini API (structured output mode) | Native JSON schema-constrained output eliminates parsing. `responseMimeType: "application/json"` + `responseSchema` enforces the exact assessment shape at generation time. |
| **Data Storage (MVP)** | JSON seed files (products) + Vercel KV / in-memory Map (shares, votes, checks) | No database provisioning. Products are static. Shares and votes need server-side persistence only for the demo window — Vercel KV (Redis) provides this at zero config, with an in-memory fallback for local dev. |
| **Deployment** | Vercel (via GitHub) | Zero-config Next.js deploys. Public URL on push. Aligns with "deploy via GitHub" requirement. |
| **Font** | Google Fonts — Inter | Clean, modern, excellent at mobile body sizes. |

---

## 2. Project Structure

```
myntra-match-check/
├── public/
│   └── images/
│       └── products/              # Product images (seeded)
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout — font loading, meta, illustrative-data header
│   │   ├── page.tsx               # Screen 1 — Wishlist
│   │   ├── check/
│   │   │   └── [productId]/
│   │   │       ├── page.tsx       # Screen 2 — Context questions
│   │   │       └── result/
│   │   │           └── page.tsx   # Screen 3 — Match Check result
│   │   ├── decision/
│   │   │   └── [checkId]/
│   │   │       └── page.tsx       # Screen 4 — Decision checkpoint
│   │   ├── share/
│   │   │   └── [token]/
│   │   │       └── page.tsx       # Screen 5 & 6 — Share card + Friend voting
│   │   ├── confirm/
│   │   │   └── page.tsx           # Prototype buy confirmation
│   │   └── api/
│   │       ├── assess/
│   │       │   └── route.ts       # POST — AI assessment generation
│   │       ├── shares/
│   │       │   └── route.ts       # POST — create share token; GET — fetch share data
│   │       ├── votes/
│   │       │   └── route.ts       # POST — cast vote; GET — fetch votes by token
│   │       └── events/
│   │           └── route.ts       # POST — log analytics events
│   │
│   ├── components/
│   │   ├── wishlist/
│   │   │   ├── WishlistCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── IllustrativeHeader.tsx
│   │   ├── context/
│   │   │   ├── OccasionPicker.tsx
│   │   │   ├── WearSlider.tsx
│   │   │   ├── HesitationPicker.tsx
│   │   │   ├── FitQuestions.tsx
│   │   │   └── CostPerWearLive.tsx
│   │   ├── matchcheck/
│   │   │   ├── TrustBlock.tsx
│   │   │   ├── MatchReasons.tsx
│   │   │   ├── Considerations.tsx
│   │   │   ├── Unknowns.tsx
│   │   │   ├── CostPerWearExplorer.tsx
│   │   │   ├── WorthItQuestion.tsx
│   │   │   └── EvidenceDrawer.tsx
│   │   ├── decision/
│   │   │   ├── DoubtResolved.tsx
│   │   │   └── ActionButtons.tsx
│   │   ├── innercircle/
│   │   │   ├── ShareCard.tsx
│   │   │   ├── ShareActions.tsx
│   │   │   ├── VotingForm.tsx
│   │   │   └── VoteResults.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Slider.tsx
│   │       ├── RadioGroup.tsx
│   │       ├── Chip.tsx
│   │       ├── Drawer.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── data/
│   │   ├── products.ts            # Seeded product array with evidence[], verification{}, fallbackAssessment
│   │   ├── referenceWearBands.ts   # Occasion → wear-band mapping
│   │   └── types.ts               # All TypeScript interfaces (Product, Check, Share, Vote, Assessment, etc.)
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── prompt.ts          # System prompt with seller-protection rules
│   │   │   ├── schema.ts          # Assessment JSON schema for structured output
│   │   │   ├── assess.ts          # Gemini API call + fallback logic
│   │   │   └── evidenceGuard.ts   # Runtime guard — drops statements with invalid evidence IDs
│   │   ├── store/
│   │   │   ├── checksStore.ts     # In-memory / KV store for checks
│   │   │   ├── sharesStore.ts     # In-memory / KV store for share tokens
│   │   │   └── votesStore.ts      # In-memory / KV store for votes
│   │   ├── events.ts              # Client-side event emitter + POST to /api/events
│   │   ├── shareToken.ts          # Token generation + 24h expiry logic
│   │   └── costPerWear.ts         # Pure calculation: price ÷ expectedWears
│   │
│   └── styles/
│       ├── globals.css            # CSS custom properties, reset, typography, design tokens
│       ├── wishlist.module.css
│       ├── context.module.css
│       ├── matchcheck.module.css
│       ├── decision.module.css
│       ├── innercircle.module.css
│       └── components.module.css  # Shared UI component styles
│
├── scripts/
│   ├── calibrate.ts               # Standalone calibration script (6 products × 4 scenarios)
│   └── pregenerate.ts             # Pre-generate fallback assessments for all products
│
├── calibration.json               # Output of calibration script
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Data Layer

### 3.1 Seeded Product Data — `src/data/products.ts`

Each product is a fully self-contained record. No external API calls.

```typescript
interface Product {
  id: string;                        // e.g. "prod_dress_01"
  name: string;
  brand: string;
  category: string;                  // "dress" | "shirt" | "lehenga" | "sneakers" | "top" | "trousers"
  price: number;                     // in ₹
  originalPrice?: number;            // shows discount when present
  imageUrl: string;
  rating: number;
  ratingCount: number;
  savedDaysAgo: number;              // for "Saved X days ago" label
  doubt: string;                     // the seeded doubt this product represents (internal, not shown to user)

  attributes: ProductAttribute[];
  evidence: Evidence[];
  verification: Verification;
  referenceWearBand: Record<Occasion, { min: number; max: number; label: string }>;
  sizeChart?: SizeChart;

  fallbackAssessment: Assessment;    // pre-generated, cached
}

interface ProductAttribute {
  key: string;                       // "material", "care", "fit", "origin", "closure"
  value: string;
}

interface Evidence {
  id: string;                        // e.g. "ev_dress_01_r1"
  type: "review" | "size_chart" | "product_attribute" | "rating_aggregate";
  source: string;                    // "Verified purchase review", "Size chart", "Product description"
  content: string;                   // the actual text excerpt or data point
  verifiedPurchase?: boolean;
}

interface Verification {
  brandAuthorised: boolean;
  verifiedPurchaseShare: number;     // 0.0–1.0
  styleCode: string | null;         // matched against catalogue, or null
  returnsWindow: string;            // e.g. "30-day returns"
  refundProtection: string;         // e.g. "Full refund if returned in original condition"
  exchangePolicy: string;           // e.g. "Free size exchange"
}
```

### 3.2 Runtime Data — Checks, Shares, Votes

**MVP strategy:** Use a server-side `Map<string, T>` in development and Vercel KV (Redis) in production. Both share the same interface:

```typescript
interface DataStore<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttlSeconds?: number): Promise<void>;
  list(prefix: string): Promise<T[]>;
}
```

| Entity | Key Pattern | TTL | Notes |
|---|---|---|---|
| `Check` | `check:{checkId}` | 24 hours | Stores user context + assessment result |
| `Share` | `share:{token}` | 24 hours | Links to checkId; expiry doubles as decision deadline |
| `Vote` | `vote:{token}:{voteId}` | 24 hours | Tied to share token lifecycle |
| `Event` | Fire-and-forget POST | — | Logged to console in dev; could pipe to analytics in production |

### 3.3 Session Identity

No authentication. Generate an `anonymousUserId` (UUID v4) on first visit, stored in `localStorage`. Used only for:
- Linking checks to a session (progress tracking)
- Associating events with a session

Never transmitted externally. Never tied to PII.

---

## 4. AI Pipeline

### 4.1 Assessment Flow

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  User Context │────▶│ Prompt       │────▶│  Gemini API     │────▶│ Evidence     │
│  (Screen 2)   │     │ Assembly     │     │  Structured     │     │ Guard        │
│               │     │              │     │  Output         │     │              │
│ occasion      │     │ system +     │     │                 │     │ Drops any    │
│ expectedWears │     │ product data │     │ Returns typed   │     │ statement    │
│ hesitation    │     │ + user ctx   │     │ Assessment JSON │     │ with invalid │
│ usualSize?    │     │ + evidence[] │     │                 │     │ evidence_ids │
│ priorFitIssue?│     │              │     │                 │     │              │
└──────────────┘     └──────────────┘     └─────────────────┘     └──────┬───────┘
                                                                         │
                                                                         ▼
                                                               ┌──────────────────┐
                                                               │ Validated        │
                                                               │ Assessment       │
                                                               │ → render Screen 3│
                                                               └──────────────────┘
```

### 4.2 Fallback Strategy

```
                       ┌──────────────────┐
                       │ POST /api/assess  │
                       └────────┬─────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Call Gemini API       │
                    │  (3s timeout)          │
                    └───────────┬───────────┘
                                │
                   ┌────────────┼────────────┐
                   │ Success    │ Fail/Timeout│
                   ▼            │             ▼
          ┌────────────┐       │    ┌─────────────────┐
          │ Evidence    │       │    │ Load product's   │
          │ Guard       │       │    │ fallbackAssessment│
          └─────┬──────┘       │    └────────┬────────┘
                │              │             │
                ▼              │             ▼
          ┌────────────┐       │    ┌─────────────────┐
          │ Return live │       │    │ Return cached +  │
          │ assessment  │       │    │ { fallback: true }│
          └────────────┘       │    └─────────────────┘
                               │
                    Cost per wear is ALWAYS
                    calculated client-side
                    (price ÷ slider value) —
                    never depends on AI
```

### 4.3 System Prompt Structure

```
┌─────────────────────────────────────────────────────┐
│ SYSTEM PROMPT                                        │
│                                                      │
│  1. Role definition                                  │
│     "You assess whether a fashion item suits a       │
│      specific person's stated use."                  │
│                                                      │
│  2. Seller-protection rules (all 10, verbatim)       │
│                                                      │
│  3. Output constraints                               │
│     - match_reasons: max 3, each with evidence_ids   │
│     - considerations: max 3, "If X matters to you…"  │
│     - unknowns: only where evidence is genuinely thin │
│     - question_to_resolve: one open question          │
│     - evidence_completeness: honest assessment        │
│                                                      │
│  4. Evidence IDs rule                                │
│     "Only reference IDs from the supplied evidence   │
│      array. Never invent an ID."                     │
│                                                      │
│  5. Anti-boilerplate rule                            │
│     "Do not use generic sizing or care hedges.       │
│      Every consideration must cite specific          │
│      evidence from this product."                    │
│                                                      │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ USER MESSAGE (assembled per request)                 │
│                                                      │
│  - Product: { name, category, price, attributes }    │
│  - Evidence array: [ { id, type, source, content } ] │
│  - Size chart (if available)                         │
│  - User context: { occasion, expectedWears,          │
│    hesitation, usualSize?, priorFitIssue? }          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 4.4 Evidence Guard — Runtime Safety Net

```typescript
function guardAssessment(assessment: Assessment, validIds: Set<string>): Assessment {
  return {
    ...assessment,
    match_reasons: assessment.match_reasons.filter(r =>
      r.evidence_ids.every(id => validIds.has(id))
    ),
    considerations: assessment.considerations.filter(c =>
      c.evidence_ids.every(id => validIds.has(id))
    ),
    // unknowns have no evidence_ids — pass through
    unknowns: assessment.unknowns,
  };
}
```

This guard is **permanent** — it runs in production, not just during calibration. A hallucinated evidence ID can never reach the screen.

---

## 5. API Routes

### 5.1 `POST /api/assess`

Generates (or falls back to) a Match Check assessment.

```
Request:
{
  productId: string,
  occasion: Occasion,
  expectedWears: number,
  hesitation: Hesitation,
  usualSize?: string,
  priorFitIssue?: FitIssue
}

Response:
{
  checkId: string,
  assessment: Assessment,     // after evidence guard
  trustBlock: TrustBlock,     // assembled from product.verification (no AI)
  fallback: boolean           // true if cached assessment was used
}
```

**Trust block is never AI-generated.** It is assembled server-side from `product.verification` fields and returned alongside the assessment. This separation is architecturally enforced — the Gemini prompt never receives verification fields.

### 5.2 `POST /api/shares`

Creates a share token for an Inner Circle ask.

```
Request:
{
  checkId: string,
  shopperQuestion: string     // e.g. "I'm unsure about the fit"
}

Response:
{
  token: string,              // URL-safe, 12 chars
  shareUrl: string,           // full public URL to /share/{token}
  expiresAt: string           // ISO 8601, 24h from now
}
```

### 5.3 `GET /api/shares?token={token}`

Returns the share card data for the friend voting page.

```
Response:
{
  product: { name, brand, price, imageUrl },
  context: { occasion, costPerWear, consideration },
  shopperQuestion: string,
  expiresAt: string,
  expired: boolean
}
```

### 5.4 `POST /api/votes`

Casts a friend's vote.

```
Request:
{
  shareToken: string,
  response: "works_for_you" | "only_if" | "not_for_this_use" | "not_sure",
  comment?: string
}

Response:
{ voteId: string }
```

### 5.5 `GET /api/votes?token={token}`

Returns all votes for a share token (polled by the owner).

```
Response:
{
  votes: [
    { response: string, comment?: string, createdAt: string }
  ],
  summary: { works: number, onlyIf: number, notForThis: number, notSure: number }
}
```

### 5.6 `POST /api/events`

Fire-and-forget analytics event logging.

```
Request:
{
  sessionId: string,
  eventName: string,
  productId?: string,
  metadata?: Record<string, any>,
  timestamp: string
}

Response:
{ ok: true }
```

---

## 6. Component Architecture

> **Development workflow:** All UI components and screen layouts below are built using **Stitch AI** (design-to-code). The generated frontend code is uploaded to the project. During integration, these components are wired to the data layer, API routes, AI pipeline, event tracking, and state management described in the sections above.

### 6.1 Screen → Component Mapping

```
Screen 1 — Wishlist (page.tsx)
├── IllustrativeHeader           // persistent prototype disclaimer
├── ProgressBar                  // "3 of 8 checked · 2 resolved"
└── WishlistCard[]               // product cards with CTAs
    ├── Product image, name, brand, price, rating
    ├── "Saved 8 days ago"
    ├── [Primary] "Check if it's right for me"
    └── [Secondary] "Buy now"

Screen 2 — Context (/check/[productId]/page.tsx)
├── Product summary strip        // image + name + price (compact)
├── OccasionPicker               // chip-based single-select
├── WearSlider                   // range 1–30+
│   ├── Reference band label     // "Wedding wear is typically worn 2–6 times"
│   └── CostPerWearLive          // updates on drag: "₹2,499 ÷ 20 = ₹125/wear"
├── HesitationPicker             // radio group
├── FitQuestions (conditional)   // shown only when hesitation = "fit"
│   ├── Usual size input
│   └── Prior fit issue selector
└── [CTA] "Generate my Match Check"

Screen 3 — Match Check (/check/[productId]/result/page.tsx)
├── TrustBlock                   // static — no AI
│   ├── Brand-authorised badge
│   ├── Verified purchase share
│   ├── Style code match
│   └── Platform protection (always shown as floor)
├── MatchReasons                 // "Why it could work for you" (max 3)
│   └── EvidenceDrawer trigger per statement
├── Considerations               // "Things to consider" (max 3)
│   └── EvidenceDrawer trigger per statement
├── Unknowns                     // "What remains unclear"
├── CostPerWearExplorer          // independent slider
│   ├── Live cost per wear
│   ├── Reference band
│   └── WorthItQuestion          // "Would this feel worth it at ₹X?" → Yes / Not sure / No
├── EvidenceDrawer (slide-up)    // product attribute, review excerpt, source, user input used
└── [CTA] "Continue to decision"

Screen 4 — Decision (/decision/[checkId]/page.tsx)
├── DoubtResolved                // "Has your main doubt been resolved?" → Yes / Partly / No
└── ActionButtons
    ├── "Buy this" → /confirm
    ├── "Ask my Inner Circle" → Screen 5
    ├── "Keep for later" → back to wishlist
    └── "Not right for me — remove" → remove + back to wishlist

Screen 5 — Inner Circle Share (modal or /share/create/[checkId])
├── ShareCard preview
│   ├── Product image + price
│   ├── Occasion + cost per wear
│   ├── One consideration
│   └── Shopper's question
└── ShareActions
    ├── WhatsApp deep link
    ├── Copy link
    └── Native share (Web Share API)

Screen 6 — Friend Voting (/share/[token]/page.tsx)
├── ShareCard (read-only)         // same card the owner previewed
├── VotingForm
│   ├── "Works for you" / "Only if…" / "Not for this use" / "Not sure"
│   └── Optional comment textarea
└── VoteResults (owner view)
    ├── Live vote summary          // "3 Works for you · 1 Only if…"
    └── [CTA] "Return to my decision"
```

### 6.2 Shared UI Components

| Component | Purpose | Notes |
|---|---|---|
| `Button` | Primary / secondary / ghost variants | Animated press state, loading spinner integration |
| `Slider` | Range input with live value display | Used for expected wears (Screen 2) and cost-per-wear explorer (Screen 3) |
| `RadioGroup` | Single-select option group | Used for occasion, hesitation, doubt resolution, worth-it question |
| `Chip` | Tappable selection chips | Used for occasion picker |
| `Drawer` | Slide-up panel | Evidence drawer, expandable on tap |
| `LoadingSpinner` | AI generation loading state | Shown during Match Check generation |

---

## 7. State Management

### 7.1 Strategy

**No global state library.** The data flow is linear (wishlist → context → assessment → decision → share → vote), and each screen has well-defined inputs/outputs.

| Scope | Mechanism | What it holds |
|---|---|---|
| **Page-level** | React `useState` / `useReducer` | Form inputs, slider values, UI toggles |
| **Cross-page** | URL params + `localStorage` | `anonymousUserId`, checked/resolved product IDs (for progress bar) |
| **Server** | API routes + KV store | Checks, shares, votes |

### 7.2 Data Flow Between Screens

```
Wishlist (Screen 1)
  │  click "Check if it's right for me"
  │  passes: productId (URL param)
  ▼
Context (Screen 2)
  │  submit context form
  │  POST /api/assess { productId, occasion, expectedWears, hesitation, ... }
  │  receives: { checkId, assessment, trustBlock }
  │  stores checkId in URL, marks product as "checked" in localStorage
  ▼
Match Check (Screen 3)
  │  renders assessment + trust block
  │  cost-per-wear slider is purely client-side (no API call)
  │  click "Continue to decision"
  │  passes: checkId (URL param)
  ▼
Decision (Screen 4)
  │  records doubt resolution + action
  │  if "Ask Inner Circle" → POST /api/shares { checkId, shopperQuestion }
  │  receives: { token, shareUrl }
  │  marks product as "resolved" in localStorage if applicable
  ▼
Inner Circle (Screen 5)
  │  shows share card + share actions
  │  owner polls GET /api/votes?token={token} on interval (5s)
  │  click "Return to my decision" → back to Screen 4
  ▼
Friend Voting (Screen 6) — separate visitor, no shared state
  │  GET /api/shares?token={token} → renders share card
  │  POST /api/votes { shareToken, response, comment }
```

---

## 8. Trust Block Architecture

The trust block is **architecturally isolated from AI** to guarantee it can never be influenced by model output.

```
┌────────────────────────────────┐
│ product.verification           │
│ (static seed data)             │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ assembleTrustBlock(product)    │      ← Pure function, no AI
│                                │
│  IF brandAuthorised            │
│    → "Brand-authorised seller" │
│  IF verifiedPurchaseShare > 0  │
│    → "X% verified purchases"  │
│  IF styleCode !== null         │
│    → "Style code matches       │
│       brand catalogue"         │
│                                │
│  ALWAYS (floor):               │
│    → returnsWindow             │
│    → refundProtection          │
│    → exchangePolicy            │
│                                │
│  NEVER:                        │
│    → empty state               │
│    → "limited data" label      │
│    → hedged language           │
└────────────────────────────────┘
```

**Asymmetry rule enforcement:** The function only has `if (positive) → show` branches. There is no `else` — absence is silence, never suspicion.

---

## 9. Cost-Per-Wear Architecture

Entirely client-side. No API dependency.

```typescript
// Pure calculation — never touches AI
function calculateCostPerWear(price: number, expectedWears: number): number {
  return Math.round(price / Math.max(expectedWears, 1));
}
```

| Location | Behaviour |
|---|---|
| **Screen 2 — WearSlider** | Updates live as slider moves. Shows reference band for selected occasion. |
| **Screen 3 — CostPerWearExplorer** | Independent slider (can differ from Screen 2 value). Includes the "Would this feel worth it?" mechanic. |
| **Screen 5 — ShareCard** | Static snapshot at the user's last slider position. |

**Reference wear bands** — sourced from `src/data/referenceWearBands.ts`:

```typescript
const referenceWearBands: Record<Occasion, { min: number; max: number; label: string }> = {
  everyday:       { min: 20, max: 50,  label: "Everyday basics are typically worn 20–50+ times" },
  college:        { min: 15, max: 40,  label: "College wear is typically worn 15–40 times" },
  work:           { min: 15, max: 40,  label: "Workwear is typically worn 15–40 times" },
  date:           { min: 5,  max: 15,  label: "Date outfits are typically worn 5–15 times" },
  wedding_event:  { min: 2,  max: 6,   label: "Wedding and event wear is typically worn 2–6 times" },
  travel:         { min: 8,  max: 25,  label: "Travel wear is typically worn 8–25 times" },
};
```

---

## 10. Inner Circle — Share & Vote Architecture

### 10.1 Share Token Flow

```
Owner                                           Friend
  │                                                │
  │ POST /api/shares                               │
  │ { checkId, shopperQuestion }                   │
  │──────────────────────────▶                     │
  │                                                │
  │ ◀──────────────────────────                    │
  │ { token: "abc123xyz",                          │
  │   shareUrl: "https://app.vercel.app/share/abc123xyz",
  │   expiresAt: "2026-09-05T10:00:00Z" }          │
  │                                                │
  │  Share via WhatsApp / copy / native share       │
  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▶ │
  │                                                │
  │                         GET /api/shares?token=abc123xyz
  │                                                │──▶ Server
  │                                                │◀── ShareCard data
  │                                                │
  │                         POST /api/votes        │
  │                         { shareToken, response, comment }
  │                                                │──▶ Server
  │                                                │
  │ GET /api/votes?token=abc123xyz (polling, 5s)   │
  │──────────────────────────▶ Server              │
  │◀──────────────────────────                     │
  │ { votes: [...], summary: { works: 2, ... } }   │
  │                                                │
```

### 10.2 Token Properties

- 12-character URL-safe random string (nanoid)
- 24-hour TTL — enforced server-side; expired tokens return `{ expired: true }`
- One share token per check (one item per ask, as specified)
- No login required for voting — the token *is* the access control

### 10.3 WhatsApp Deep Link

```typescript
function buildWhatsAppLink(shareUrl: string, productName: string): string {
  const text = encodeURIComponent(
    `Help me decide: does this ${productName} work for me? ${shareUrl}`
  );
  return `https://wa.me/?text=${text}`;
}
```

---

## 11. Event Tracking

### 11.1 Client-Side Event Emitter

```typescript
// Fires event to /api/events and logs to console in dev
function trackEvent(eventName: string, productId?: string, metadata?: Record<string, any>) {
  const event = {
    sessionId: getSessionId(),  // from localStorage
    eventName,
    productId,
    metadata,
    timestamp: new Date().toISOString(),
  };

  // Fire and forget — never blocks UI
  navigator.sendBeacon('/api/events', JSON.stringify(event));
}
```

### 11.2 Event Catalog

| Event | Trigger | Metadata |
|---|---|---|
| `wishlist_viewed` | Wishlist page mount | `{ productCount }` |
| `match_check_started` | Tap "Check if it's right for me" | `{ productId }` |
| `context_submitted` | Submit context form | `{ occasion, expectedWears, hesitation }` |
| `match_check_generated` | Assessment renders | `{ fallback, evidenceCompleteness }` |
| `trust_block_viewed` | Trust block enters viewport | `{ productId }` |
| `evidence_opened` | Tap "Why am I seeing this?" | `{ evidenceId, statementType }` |
| `cost_per_wear_changed` | Slider drag ends | `{ newValue, costPerWear }` |
| `worth_it_answered` | Tap yes/not sure/no | `{ answer, costPerWear }` |
| `doubt_resolved_yes` | Tap "Yes" on checkpoint | — |
| `doubt_resolved_partly` | Tap "Partly" | — |
| `doubt_resolved_no` | Tap "No" | — |
| `inner_circle_shared` | Share action completed | `{ shareMethod }` |
| `inner_circle_vote_received` | Vote POST succeeds | `{ response }` |
| `owner_returned_after_vote` | Tap "Return to my decision" | `{ voteCount }` |
| `buy_clicked` | Tap "Buy this" | — |
| `kept_for_later` | Tap "Keep for later" | — |
| `removed_from_wishlist` | Tap "Not right for me — remove" | — |

---

## 12. Mobile-First Responsive Strategy

### 12.1 Breakpoints

```css
/* Design target: 375px (iPhone SE / standard Android) */
/* Single breakpoint for tablet/desktop graceful scaling */

:root {
  --content-max-width: 430px;    /* phone viewport cap */
  --content-padding: 16px;
}

@media (min-width: 768px) {
  :root {
    --content-max-width: 480px;  /* centered card on larger screens */
    --content-padding: 24px;
  }
}
```

### 12.2 Touch Targets

All interactive elements: minimum 44×44px touch target (Apple HIG). Sliders use a 48px thumb for reliable drag on mobile.

### 12.3 Performance Budget

| Metric | Target | Approach |
|---|---|---|
| First Contentful Paint | < 1.5s | Static product data, no blocking API calls on wishlist |
| Largest Contentful Paint | < 2.5s | Product images: WebP, lazy-loaded below fold |
| Total Bundle Size | < 200KB gzipped | No heavy dependencies; vanilla CSS; tree-shaken imports |
| AI Assessment Response | < 5s (3s timeout + fallback) | Pre-cached fallback guarantees a response |

---

## 13. Calibration Script Architecture

Standalone script, not part of the app. Run once before building UI.

```
scripts/calibrate.ts
       │
       │  Imports:
       │  - products from src/data/products.ts
       │  - system prompt from src/lib/ai/prompt.ts
       │  - schema from src/lib/ai/schema.ts
       │
       ▼
┌─────────────────────────────────────┐
│  6 products × 4 scenarios = 24 runs │
│                                     │
│  Scenarios:                         │
│  A: Everyday, 25 wears, value       │
│  B: Wedding, 4 wears, wear-it       │
│  C: Work, 15 wears, fit (M, incon.) │
│  D: Date, 8 wears, trust            │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Score 4 checks:                    │
│                                     │
│  1. Evidence validity               │
│     ∀ evidence_id ∈ output:         │
│       assert id ∈ product.evidence  │
│     Target: 0 failures              │
│                                     │
│  2. Objection rate                  │
│     count(has considerations) / 24  │
│     Target: 33–50% (8–12 of 24)    │
│                                     │
│  3. Boilerplate repetition          │
│     group considerations by phrase  │
│     Target: no phrase > 50%         │
│                                     │
│  4. evidence_completeness variance  │
│     distinct(values) across 24      │
│     Target: ≥ 2 distinct values     │
└──────────┬──────────────────────────┘
           │
           ▼
     calibration.json
```

---

## 14. Pre-generation Script Architecture

Runs after calibration passes. Generates one fallback assessment per product.

```
scripts/pregenerate.ts
       │
       │  For each product:
       │    Call Gemini with a "neutral" context:
       │      occasion = "everyday"
       │      expectedWears = 15
       │      hesitation = "worth_the_price"
       │
       │    Run evidence guard on response
       │    Write to product.fallbackAssessment
       │
       ▼
  Updated src/data/products.ts
  (fallbackAssessment fields populated)
```

The fallback assessment is **generic enough** to be useful across contexts but is never the preferred path — it only activates on API failure.

---

## 15. Deployment Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  GitHub Repo  │─────▶│  Vercel      │─────▶│  Public URL   │
│              │  push │  Build       │      │              │
│  main branch │      │  Next.js     │      │  *.vercel.app │
└──────────────┘      │  + API routes│      └──────────────┘
                      │  + Vercel KV │
                      └──────────────┘
```

### Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API access | Yes |
| `KV_REST_API_URL` | Vercel KV endpoint | Production only |
| `KV_REST_API_TOKEN` | Vercel KV auth | Production only |
| `NEXT_PUBLIC_BASE_URL` | For share link generation | Yes |

### Local Development

```bash
npm run dev          # Next.js dev server on :3000
# Uses in-memory Map for shares/votes (no KV setup needed)
# Gemini API key loaded from .env.local
```

---

## 16. Security & Safety Guardrails

### AI Safety

| Guard | Layer | Enforcement |
|---|---|---|
| Seller-protection rules | System prompt | 10 explicit rules in every Gemini call |
| Evidence ID validation | `evidenceGuard.ts` | Runtime — drops statements with invalid IDs; runs on every response including fallbacks |
| Schema constraint | Gemini API config | `responseSchema` rejects non-conforming output at generation time |
| Trust block isolation | Architecture | Verification data never enters the Gemini prompt; trust block is assembled from static fields only |
| Asymmetry rule | `assembleTrustBlock()` | Function has no negative branches — only `if (positive) → show` |

### Data Safety

| Concern | Mitigation |
|---|---|
| No PII collected | Anonymous UUID only, in localStorage |
| Share token access | Token = access; 24h TTL; no sensitive data in share payload |
| API key exposure | Server-side only (API routes); never in client bundle |
| CORS | Next.js API routes are same-origin by default |

---

## 17. Dependency Summary

| Package | Purpose | Approximate Size |
|---|---|---|
| `next` | Framework | — (build tool) |
| `react`, `react-dom` | UI | ~40KB gzipped |
| `@google/generative-ai` | Gemini structured output | ~15KB gzipped |
| `nanoid` | Share token generation | ~1KB |
| `@vercel/kv` | Redis KV store (production) | ~5KB |

**Total client-side JS budget:** < 200KB gzipped. No CSS framework, no state management library, no animation library (CSS transitions only).

---

## 18. Key Architectural Decisions Summary

| Decision | Why |
|---|---|
| **Stitch AI for frontend** | All UI screens, components, and styling are generated via Stitch AI (design-to-code). Accelerates the one-day timeline by parallelizing design work. The generated code is uploaded and integrated with the manually-built backend. |
| **Next.js over plain Vite** | Share/vote flow requires server-side persistence and API routes. A separate backend doubles infra complexity on a one-day timeline. |
| **Gemini structured output over OpenAI** | Native JSON schema enforcement eliminates post-hoc parsing and format validation. |
| **No database** | Products are static. Shares/votes have 24h TTL. Vercel KV (Redis) + in-memory fallback covers both environments with zero setup. |
| **No global state** | Linear user flow with clear handoff points. URL params + localStorage + server store cover all cross-page needs. |
| **Trust block isolated from AI** | Architectural guarantee that verification can never be negatively influenced by model output. Not a prompt constraint — a code-level separation. |
| **Evidence guard as permanent runtime** | Hallucinated evidence IDs are a known LLM failure mode. The guard is not a dev-time check — it's a production safety net. |
| **CSS Modules over utility classes** | Full control over mobile-first layout, glassmorphism, and micro-animations without class-name bloat. |
| **Fire-and-forget events** | `navigator.sendBeacon` ensures analytics never block UI interaction. Events are secondary to the user experience. |
