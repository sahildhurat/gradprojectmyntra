# Myntra Match Check — Implementation Plan

---

## Overview

This plan translates the [architecture](file:///d:/Grad%20Project/Docs/architecture.md) and [problem statement](file:///d:/Grad%20Project/Docs/ProblemStatement.md) into a phased, file-level execution sequence. The build order follows the spec's prescribed sequence — data first, cheapest wins early, AI last, deploy before polish.

**Total phases:** 10 · **Timeline:** One day · **Deliverable:** Live public URL, demo-able in under two minutes.

### Development Workflow Split

| Track | Owner | Scope |
|---|---|---|
| **Frontend (Track A)** | Stitch AI | All UI screens, components, layouts, and styling. Generated code is uploaded to the project. |
| **Backend & Logic (Track B)** | Manual | Data layer, TypeScript types, API routes, AI pipeline (Gemini), server stores, event tracking, calibration scripts, trust block logic, share/vote logic. |
| **Integration (Track C)** | Manual | Wiring Stitch AI frontend to backend — API calls, data flow, state management, event tracking. |

Tracks A and B run in parallel. Track C begins after the Stitch AI frontend is uploaded.

---

## Phase 0 — Project Scaffold & Design System

**Goal:** Bootable Next.js app with the design foundation in place. Everything after this phase builds on a running dev server.

**Owner:** Manual (Track B). Stitch AI (Track A) can work on screen designs in parallel.

**Time estimate:** ~30 minutes

### 0.1 Initialize Project

| Step | Action |
|---|---|
| 0.1.1 | Run `npx -y create-next-app@latest ./` with TypeScript, App Router, no Tailwind, no `src/` directory alias disabled — use `src/` directory enabled, ESLint enabled. |
| 0.1.2 | Install dependencies: `npm install @google/generative-ai nanoid` |
| 0.1.3 | Create `.env.local` with `GEMINI_API_KEY` and `NEXT_PUBLIC_BASE_URL=http://localhost:3000` |
| 0.1.4 | Verify `npm run dev` starts successfully on `:3000` |

#### Files created/modified:
- `package.json` — dependencies added
- `.env.local` — environment variables
- `.gitignore` — ensure `.env.local` is listed
- `next.config.js` — default, no modifications yet

### 0.2 Design System — `src/styles/globals.css`

Build the design token system. Stitch AI-generated components may bring their own styles — this file provides the shared tokens and variables they should reference. Integration will reconcile any discrepancies.

```css
/* Tokens to define: */
--color-bg-primary        /* deep dark: #0a0a0f */
--color-bg-secondary      /* card surface: rgba(255,255,255,0.04) */
--color-bg-glass          /* glassmorphism: rgba(255,255,255,0.06) */
--color-surface-elevated  /* elevated cards */
--color-accent-primary    /* Myntra pink-magenta: #ff3f6c */
--color-accent-secondary  /* warm amber for trust: #f5a623 */
--color-accent-green      /* positive/match: #27ae60 */
--color-text-primary      /* #f0f0f0 */
--color-text-secondary    /* #a0a0a0 */
--color-text-muted        /* #666 */
--color-border            /* rgba(255,255,255,0.08) */

--font-family             /* 'Inter', sans-serif */
--font-size-xs through --font-size-2xl
--font-weight-regular / medium / semibold / bold

--radius-sm / md / lg / xl
--spacing-xs through --spacing-2xl
--shadow-card / elevated / glow
--transition-fast / normal / slow

--content-max-width: 430px;
--content-padding: 16px;
```

Include: CSS reset, box-sizing, smooth scrolling, font import (`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')`), body dark mode defaults.

#### Files created:
- [globals.css](file:///d:/Grad%20Project/src/styles/globals.css) — full design token system + reset

### 0.3 Root Layout — `src/app/layout.tsx`

- HTML `lang="en"`, charset, viewport meta
- SEO: `<title>Myntra Match Check</title>`, meta description
- Import `globals.css`
- Font loading via next/font (Inter)
- Persistent `IllustrativeHeader` component at the top of every page

#### Files created:
- [layout.tsx](file:///d:/Grad%20Project/src/app/layout.tsx) — root layout with meta and font

### 0.4 Shared UI Components

> **Note:** These UI components will come from **Stitch AI**. The table below defines the expected component API contract that the Stitch AI-generated components should satisfy. During integration (Track C), verify the generated components match these contracts or adapt them.

Build the atomic UI kit. These are used across all screens.

| Component | File | Notes |
|---|---|---|
| `Button` | `src/components/ui/Button.tsx` | `variant`: primary / secondary / ghost / danger. Animated press state. Optional loading spinner. Min 44×44px touch target. |
| `Slider` | `src/components/ui/Slider.tsx` | Custom-styled range input. 48px thumb. Live value display callback. Optional reference band overlay. |
| `RadioGroup` | `src/components/ui/RadioGroup.tsx` | Vertical option list with custom radio styling. Label + optional description per option. |
| `Chip` | `src/components/ui/Chip.tsx` | Tappable pill for single-select groups. Active state with accent color. |
| `Drawer` | `src/components/ui/Drawer.tsx` | Slide-up panel with backdrop. Close on backdrop tap. CSS transition. |
| `LoadingSpinner` | `src/components/ui/LoadingSpinner.tsx` | Branded spinner with pulse animation. Optional status message. |

#### Files created:
- `src/components/ui/Button.tsx` + `Button.module.css`
- `src/components/ui/Slider.tsx` + `Slider.module.css`
- `src/components/ui/RadioGroup.tsx` + `RadioGroup.module.css`
- `src/components/ui/Chip.tsx` + `Chip.module.css`
- `src/components/ui/Drawer.tsx` + `Drawer.module.css`
- `src/components/ui/LoadingSpinner.tsx` + `LoadingSpinner.module.css`

### Checkpoint 0
- [ ] `npm run dev` runs without errors
- [ ] Dark theme renders with correct tokens
- [ ] UI components render in isolation (manually visit a test route)

---

## Phase 1 — Seeded Product Data & Wishlist Screen

**Goal:** Screen 1 is complete and demoable. All product data exists for downstream phases.

**Owner:** Manual (Track B) for data; Stitch AI (Track A) for wishlist UI.

**Time estimate:** ~60 minutes

**Spec reference:** Build order steps 1.

### 1.1 TypeScript Interfaces — `src/data/types.ts`

Define all data shapes used across the app:

```typescript
// Types to define:
Occasion          // "everyday" | "college" | "work" | "date" | "wedding_event" | "travel"
Hesitation        // "worth_the_price" | "will_it_fit" | "trust_listing" | "will_i_wear_it" | "right_for_occasion"
FitIssue          // "too_tight" | "too_loose" | "inconsistent" | "no_issues"
WorthItAnswer     // "yes" | "not_sure" | "no"
DoubtResolution   // "yes" | "partly" | "no"
FinalDecision     // "buy" | "inner_circle" | "keep_later" | "remove"
VoteResponse      // "works_for_you" | "only_if" | "not_for_this_use" | "not_sure"

Product           // full product interface (as defined in architecture §3.1)
ProductAttribute
Evidence
Verification
SizeChart
Assessment        // { match_reasons, considerations, unknowns, question_to_resolve, evidence_completeness }
MatchReason       // { statement, evidence_ids }
Consideration     // { condition, implication, evidence_ids }
Unknown           // { statement, missing_information }
TrustBlock        // assembled from Verification, rendered separately

Check             // { id, anonymousUserId, productId, occasion, expectedWears, hesitation, usualSize?, priorFitIssue?, assessment, doubtResolved?, finalDecision?, createdAt }
Share             // { token, checkId, shopperQuestion, productId, occasion, costPerWear, consideration?, expiresAt }
Vote              // { id, shareToken, response, comment?, createdAt }
AnalyticsEvent    // { sessionId, eventName, productId?, metadata?, timestamp }
```

#### Files created:
- [types.ts](file:///d:/Grad%20Project/src/data/types.ts) — all TypeScript interfaces and union types

### 1.2 Reference Wear Bands — `src/data/referenceWearBands.ts`

Static mapping of occasion → honest wear-band range with label text.

```typescript
// Six entries:
everyday:      { min: 20, max: 50,  label: "Everyday basics are typically worn 20–50+ times" }
college:       { min: 15, max: 40,  label: "College wear is typically worn 15–40 times" }
work:          { min: 15, max: 40,  label: "Workwear is typically worn 15–40 times" }
date:          { min: 5,  max: 15,  label: "Date outfits are typically worn 5–15 times" }
wedding_event: { min: 2,  max: 6,   label: "Wedding and event wear is typically worn 2–6 times" }
travel:        { min: 8,  max: 25,  label: "Travel wear is typically worn 8–25 times" }
```

#### Files created:
- [referenceWearBands.ts](file:///d:/Grad%20Project/src/data/referenceWearBands.ts)

### 1.3 Seeded Products — `src/data/products.ts`

Six products, each designed around a specific doubt. Each product must have:
- Basic info (id, name, brand, category, price, imageUrl, rating, ratingCount, savedDaysAgo)
- `attributes[]` — 4–6 product attributes (material, care, fit, origin, etc.)
- `evidence[]` — 5–10 evidence items per product (mix of reviews, size-chart data, product attributes, rating aggregates). Some products deliberately have thin evidence for calibration.
- `verification{}` — brand authorisation, verified purchase share, style code, returns/refund/exchange
- `sizeChart` — where relevant (dress, shirt, trousers)
- `fallbackAssessment` — placeholder initially, populated in Phase 5

| # | Product | Category | Doubt | Price (₹) | Key characteristics |
|---|---|---|---|---|---|
| 1 | Floral wrap dress | dress | Inconsistent sizing | 1,899 | Rich evidence, conflicting fit reviews, size chart available |
| 2 | Premium oxford shirt | shirt | Value hesitation at price | 3,499 | Brand-authorised, high verified-purchase share, good materials |
| 3 | Embroidered lehenga | lehenga | Low expected repeat usage | 8,999 | Occasion-specific, limited reviews, high original price |
| 4 | Discounted branded sneakers | sneakers | Steep discount feels suspicious | 2,499 (was ₹5,999) | Strong verification data, style code match, discount is legitimate |
| 5 | Oversized graphic tee | top | Trend longevity uncertain | 1,299 | Trendy, mixed reviews on quality, styling-versatile |
| 6 | Chino trousers | trousers | Strong utility case | 1,499 | High rating, consistent sizing, everyday durability |

#### Evidence ID convention:
`ev_{productShortId}_{type}{number}` — e.g., `ev_dress01_r1` (review 1), `ev_dress01_sc1` (size chart 1), `ev_dress01_pa1` (product attribute 1).

#### Files created:
- [products.ts](file:///d:/Grad%20Project/src/data/products.ts) — 6 fully seeded products (fallbackAssessment as empty placeholder)

### 1.4 Product Images

Generate 6 product images or use high-quality placeholder fashion images stored in `public/images/products/`.

#### Files created:
- `public/images/products/dress_01.webp`
- `public/images/products/shirt_01.webp`
- `public/images/products/lehenga_01.webp`
- `public/images/products/sneakers_01.webp`
- `public/images/products/top_01.webp`
- `public/images/products/trousers_01.webp`

### 1.5 Cost-Per-Wear Utility — `src/lib/costPerWear.ts`

```typescript
export function calculateCostPerWear(price: number, expectedWears: number): number {
  return Math.round(price / Math.max(expectedWears, 1));
}
```

#### Files created:
- [costPerWear.ts](file:///d:/Grad%20Project/src/lib/costPerWear.ts)

### 1.6 Wishlist Components

> **Owner: Stitch AI (Track A).** These components are generated by Stitch AI and uploaded. The table below defines the expected behaviour that integration (Track C) must verify.

| Component | File | Responsibility |
|---|---|---|
| `IllustrativeHeader` | `src/components/wishlist/IllustrativeHeader.tsx` | Persistent amber banner: `"Illustrative product and review data — built for prototype testing."` |
| `ProgressBar` | `src/components/wishlist/ProgressBar.tsx` | Reads checked/resolved counts from `localStorage`. Displays: `"3 of 6 checked · 2 resolved"` |
| `WishlistCard` | `src/components/wishlist/WishlistCard.tsx` | Product card: image, name, brand, price (+ original if discounted), rating, "Saved X days ago", checked badge if already checked. Primary CTA: "Check if it's right for me" → `/check/{productId}`. Secondary CTA: "Buy now" → `/confirm`. |

### 1.7 Wishlist Page — `src/app/page.tsx`

- Import all products from `src/data/products.ts`
- Render `IllustrativeHeader` (moved to layout for persistence)
- Render `ProgressBar`
- Render grid of `WishlistCard` components (2-column on mobile, max 430px width)
- Track `wishlist_viewed` event on mount

#### Files created:
- `src/components/wishlist/IllustrativeHeader.tsx` + CSS module
- `src/components/wishlist/ProgressBar.tsx` + CSS module
- `src/components/wishlist/WishlistCard.tsx` + CSS module
- `src/app/page.tsx` — wishlist page
- `src/styles/wishlist.module.css`

### Checkpoint 1
- [ ] Wishlist renders 6 product cards on mobile viewport
- [ ] Illustrative data header is visible and non-dismissable
- [ ] Progress bar shows "0 of 6 checked · 0 resolved"
- [ ] "Check if it's right for me" navigates to `/check/{productId}`
- [ ] Cards show discount badge for the sneakers (₹2,499 was ₹5,999)

---

## Phase 2 — Context Flow (Screen 2)

**Goal:** Three-question context form with live cost-per-wear, reference band, and conditional fit questions.

**Owner:** Stitch AI (Track A) for UI components; Manual (Track B) for calculation logic and data wiring.

**Time estimate:** ~45 minutes

**Spec reference:** Build order step 2.

### 2.1 Context Components

> **Owner: Stitch AI (Track A).** The generated components must expose the props/callbacks listed below for integration.

| Component | File | Behaviour |
|---|---|---|
| `OccasionPicker` | `src/components/context/OccasionPicker.tsx` | 6 chips in a flex-wrap layout. Single-select. On selection, updates the reference band in `WearSlider`. |
| `WearSlider` | `src/components/context/WearSlider.tsx` | Range 1–30+. Displays reference band label below slider (from `referenceWearBands[occasion]`). Calls parent callback on change. |
| `CostPerWearLive` | `src/components/context/CostPerWearLive.tsx` | Receives `price` and `expectedWears` as props. Renders: `"₹2,499 ÷ 20 wears = ₹125 per wear"`. Updates live on slider drag. Uses `calculateCostPerWear()`. |
| `HesitationPicker` | `src/components/context/HesitationPicker.tsx` | 5-option radio group. Selecting "Will it fit?" reveals `FitQuestions`. |
| `FitQuestions` | `src/components/context/FitQuestions.tsx` | Shown conditionally. Two inputs: usual size (S/M/L/XL/XXL chips) and prior fit issue (radio group: too tight / too loose / inconsistent across brands / no issues). Animated slide-in when shown. |

### 2.2 Context Page — `src/app/check/[productId]/page.tsx`

- Load product by `productId` param from seeded data
- Render compact product summary strip at top (image, name, price)
- Render `OccasionPicker` → `WearSlider` + `CostPerWearLive` → `HesitationPicker` → (conditional) `FitQuestions`
- Track `match_check_started` on mount
- CTA: "Generate my Match Check" — validates all required fields, then:
  - POST to `/api/assess` with form data
  - Show `LoadingSpinner` during API call
  - On success, navigate to `/check/{productId}/result?checkId={checkId}`
  - Track `context_submitted`

### 2.3 Form Validation

- Occasion: required (at least one chip selected)
- Expected wears: always has value (slider default = reference band midpoint for selected occasion)
- Hesitation: required
- Fit questions: required only when hesitation = "will_it_fit"
- CTA disabled until all required fields are filled. Subtle animation when CTA becomes enabled.

#### Files created:
- `src/components/context/OccasionPicker.tsx` + CSS module
- `src/components/context/WearSlider.tsx` + CSS module
- `src/components/context/CostPerWearLive.tsx` + CSS module
- `src/components/context/HesitationPicker.tsx` + CSS module
- `src/components/context/FitQuestions.tsx` + CSS module
- `src/app/check/[productId]/page.tsx`
- `src/styles/context.module.css`

### Checkpoint 2
- [ ] Selecting an occasion updates the reference band text
- [ ] Cost per wear updates live as the slider moves
- [ ] Fit questions appear with animation when "Will it fit?" is selected
- [ ] CTA is disabled until all required fields are complete
- [ ] Form submits to `/api/assess` (will 404 for now — that's expected)

---

## Phase 3 — Trust & Verification Block

**Goal:** Static trust block rendering. No AI. Cheapest win — build early.

**Time estimate:** ~20 minutes

**Spec reference:** Build order step 3.

### 3.1 Trust Block Assembly — `src/lib/trustBlock.ts`

Pure function `assembleTrustBlock(product: Product): TrustBlock`

Logic (affirmable only — no negative branches):
1. If `verification.brandAuthorised === true` → add "Brand-authorised seller" item
2. If `verification.verifiedPurchaseShare > 0` → add "X% of reviews from verified purchases" item
3. If `verification.styleCode !== null` → add "Style code matches brand catalogue" item
4. **Always** add platform protection items: returnsWindow, refundProtection, exchangePolicy

Never: empty state, "limited data", hedged language. The floor (platform protection) guarantees at least 3 items always render.

### 3.2 Trust Block Component — `src/components/matchcheck/TrustBlock.tsx`

- Takes `TrustBlock` data as props
- Renders a card with a shield/checkmark icon header: "Trust & Verification"
- Each trust item: icon (✓ checkmark for verified fields, 🛡️ shield for platform protection) + text
- Verification items get a subtle green tint; platform items get a neutral style
- Track `trust_block_viewed` when component enters viewport (Intersection Observer)

#### Files created:
- [trustBlock.ts](file:///d:/Grad%20Project/src/lib/trustBlock.ts) — `assembleTrustBlock()` function
- `src/components/matchcheck/TrustBlock.tsx` + CSS module

### Checkpoint 3
- [ ] Trust block renders for each product with correct data
- [ ] Sneakers (product 4) show all verification items — strongest trust display
- [ ] Products with sparse verification data still show platform protection — never empty
- [ ] No hedged or negative language in any trust block

---

## Phase 4 — Static Match Check Components (Screen 3)

**Goal:** All Match Check UI components exist and can render with hardcoded/fallback data. Ready for AI to be plugged in.

**Owner:** Stitch AI (Track A) for UI components; Manual (Track B) for trust block logic and evidence guard.

**Time estimate:** ~60 minutes

**Spec reference:** Build order step 4.

> **All components in this phase are generated by Stitch AI.** The specifications below define the expected props, rendering behaviour, and data contracts that integration (Track C) must verify.

### 4.1 Match Reasons Component — `src/components/matchcheck/MatchReasons.tsx`

- Header: "Why it could work for you"
- Renders 1–3 `MatchReason` items
- Each item: positive icon (✦) + statement text + "Why am I seeing this?" link
- Tapping "Why am I seeing this?" opens the Evidence Drawer for that statement

### 4.2 Considerations Component — `src/components/matchcheck/Considerations.tsx`

- Header: "Things to consider"
- Renders 0–3 `Consideration` items
- Each item: thoughtful icon (◆) + "If {condition}…" + implication + "Why am I seeing this?" link
- **Equal visual weight** with MatchReasons — same card style, same typography. Positive and considerations are peers, not hero vs. warning.
- If `considerations` array is empty, the section is simply absent (not "No concerns found" — that reads as endorsement)

### 4.3 Unknowns Component — `src/components/matchcheck/Unknowns.tsx`

- Header: "What remains unclear"
- Renders only when `unknowns` is non-empty
- Each item: "?" icon + statement + what information is missing
- Honest, not hedged. "Reviews don't mention fabric feel after washing" — not "We're not sure about the fabric"

### 4.4 Cost-Per-Wear Explorer — `src/components/matchcheck/CostPerWearExplorer.tsx`

- Independent slider (separate from Screen 2's slider — can be adjusted without regenerating)
- Initial value: the `expectedWears` from the context form
- Live cost-per-wear display: `"₹{price} ÷ {wears} wears = ₹{cpw} per wear"`
- Reference band label stays visible (from selected occasion)
- Track `cost_per_wear_changed` on slider drag end

### 4.5 Worth-It Question — `src/components/matchcheck/WorthItQuestion.tsx`

- Displays after cost-per-wear: `"Would this feel worth it at ₹{cpw} per wear?"`
- Three options: Yes / Not sure / No
- Track `worth_it_answered` with answer and current cost per wear
- This is the mechanic — the arithmetic alone is not.

### 4.6 Evidence Drawer — `src/components/matchcheck/EvidenceDrawer.tsx`

- Slide-up `Drawer` component
- Content sections:
  - **Product attribute** — the raw attribute this statement references
  - **Review excerpt** — the actual review text (if evidence type is "review")
  - **Size chart data** — if relevant
  - **Verification source** — for trust-related evidence
  - **Your input** — which user input influenced this statement (e.g., "You selected: Work, 15 expected wears")
- Each evidence item shows its source: "Verified purchase review", "Product description", etc.
- Track `evidence_opened` with evidence ID and statement type

### 4.7 Match Check Result Page — `src/app/check/[productId]/result/page.tsx`

- Reads `checkId` from URL search params
- Fetches check data from the checks store (or passes via client state)
- Renders in order: TrustBlock → MatchReasons → Considerations → Unknowns → CostPerWearExplorer + WorthItQuestion → EvidenceDrawer (hidden until triggered)
- CTA at bottom: "Continue to my decision" → `/decision/{checkId}`
- Track `match_check_generated` on mount

#### Files created:
- `src/components/matchcheck/MatchReasons.tsx` + CSS module
- `src/components/matchcheck/Considerations.tsx` + CSS module
- `src/components/matchcheck/Unknowns.tsx` + CSS module
- `src/components/matchcheck/CostPerWearExplorer.tsx` + CSS module
- `src/components/matchcheck/WorthItQuestion.tsx` + CSS module
- `src/components/matchcheck/EvidenceDrawer.tsx` + CSS module
- `src/app/check/[productId]/result/page.tsx`
- `src/styles/matchcheck.module.css`

### Checkpoint 4
- [ ] Match Check renders with hardcoded assessment data
- [ ] Trust block appears at top, clearly separated from AI-generated sections
- [ ] Evidence drawer slides up on "Why am I seeing this?" tap
- [ ] Cost-per-wear slider updates independently without page refresh
- [ ] Worth-it question renders with the correct dynamic price
- [ ] Positive and consideration sections have equal visual prominence

---

## Phase 5 — Fallback Assessments & AI Pipeline

**Goal:** AI assessment generation works end-to-end. Fallback assessments are cached. Evidence guard is active.

**Time estimate:** ~90 minutes

**Spec reference:** Build order steps 5 and 6.

### 5.1 AI System Prompt — `src/lib/ai/prompt.ts`

Write the full system prompt. Include:
1. Role definition
2. All 10 seller-protection rules (verbatim from spec)
3. Output constraints (max 3 match_reasons, max 3 considerations, etc.)
4. Evidence ID rule: "Only reference IDs from the supplied evidence array. Never invent an ID."
5. Anti-boilerplate rule: "Do not use generic sizing or care hedges. Every consideration must cite specific evidence from this product."

Also export a `buildUserMessage(product, userContext)` function that assembles the per-request user message with product data, evidence array, size chart, and user context.

### 5.2 Assessment Schema — `src/lib/ai/schema.ts`

Export the Gemini-compatible JSON schema object for structured output:

```typescript
export const assessmentSchema = {
  type: "object",
  properties: {
    match_reasons: { type: "array", items: { ... }, maxItems: 3 },
    considerations: { type: "array", items: { ... }, maxItems: 3 },
    unknowns: { type: "array", items: { ... } },
    question_to_resolve: { type: "string" },
    evidence_completeness: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["match_reasons", "considerations", "unknowns", "question_to_resolve", "evidence_completeness"]
};
```

### 5.3 Evidence Guard — `src/lib/ai/evidenceGuard.ts`

```typescript
export function guardAssessment(assessment: Assessment, validIds: Set<string>): Assessment
```

- Filters out any `match_reasons` or `considerations` whose `evidence_ids` contain an ID not in `validIds`
- Passes `unknowns` through (they have no evidence_ids)
- **Permanent runtime guard** — runs on every response, including fallbacks
- Logs filtered statements to console for debugging

### 5.4 Assessment Function — `src/lib/ai/assess.ts`

```typescript
export async function generateAssessment(product: Product, context: UserContext): Promise<{
  assessment: Assessment;
  fallback: boolean;
}>
```

Logic:
1. Build the user message with `buildUserMessage(product, context)`
2. Call Gemini API with system prompt, user message, and `responseSchema`
3. Set timeout at 3 seconds
4. On success: run `guardAssessment()` on the response, return `{ assessment, fallback: false }`
5. On failure/timeout: return `{ assessment: product.fallbackAssessment, fallback: true }`

### 5.5 Server Stores — `src/lib/store/`

Three stores, all sharing the `DataStore<T>` interface:

| Store | File | Key pattern | TTL |
|---|---|---|---|
| `checksStore` | `src/lib/store/checksStore.ts` | `check:{id}` | 24h |
| `sharesStore` | `src/lib/store/sharesStore.ts` | `share:{token}` | 24h |
| `votesStore` | `src/lib/store/votesStore.ts` | `vote:{token}:{id}` | 24h |

MVP implementation: server-side `Map<string, T>` (persists across requests in dev server process). Production path: swap to Vercel KV with identical interface.

### 5.6 Assess API Route — `src/app/api/assess/route.ts`

`POST /api/assess`:
1. Parse request body: `{ productId, occasion, expectedWears, hesitation, usualSize?, priorFitIssue? }`
2. Look up product in seeded data
3. Call `generateAssessment(product, context)`
4. Assemble trust block via `assembleTrustBlock(product)` — **separate from AI call**
5. Create `Check` record, store in `checksStore`
6. Return `{ checkId, assessment, trustBlock, fallback }`

### 5.7 Calibration Script — `scripts/calibrate.ts`

Standalone script, run via `npx tsx scripts/calibrate.ts`:

1. Import products, system prompt, schema
2. Define 4 context scenarios (A/B/C/D from spec)
3. Loop 6 products × 4 scenarios = 24 calls
4. Write all responses to `calibration.json`
5. Score 4 checks:
   - Evidence validity: assert all evidence_ids exist in product.evidence → target: 0 failures
   - Objection rate: count runs with ≥1 consideration → target: 8–12 of 24
   - Boilerplate repetition: group consideration phrasings → target: no phrase > 50%
   - evidence_completeness variance → target: ≥2 distinct values
6. Print results table to console
7. Exit with code 1 if evidence validity fails

### 5.8 Pre-generation Script — `scripts/pregenerate.ts`

Run via `npx tsx scripts/pregenerate.ts`:

1. For each product, call `generateAssessment()` with neutral context (everyday, 15 wears, worth_the_price)
2. Run evidence guard
3. Write the validated assessment to a `fallbacks.json` file
4. Also update `src/data/products.ts` to embed fallback assessments inline

### 5.9 Wire Context → Result Flow

Update Screen 2 (`src/app/check/[productId]/page.tsx`):
- On "Generate my Match Check" tap: POST to `/api/assess`, show loading spinner
- On response: navigate to `/check/{productId}/result?checkId={checkId}` with assessment data

Update Screen 3 (`src/app/check/[productId]/result/page.tsx`):
- Read `checkId` from search params
- Fetch check data from `/api/assess` response (passed via query params or fetched from checksStore)
- Render assessment and trust block with real data

#### Files created:
- `src/lib/ai/prompt.ts` — system prompt + user message builder
- `src/lib/ai/schema.ts` — Gemini schema definition
- `src/lib/ai/evidenceGuard.ts` — runtime evidence validation
- `src/lib/ai/assess.ts` — Gemini API call + fallback logic
- `src/lib/store/checksStore.ts`
- `src/lib/store/sharesStore.ts`
- `src/lib/store/votesStore.ts`
- `src/app/api/assess/route.ts`
- `scripts/calibrate.ts`
- `scripts/pregenerate.ts`

#### Files modified:
- `src/app/check/[productId]/page.tsx` — wire to API
- `src/app/check/[productId]/result/page.tsx` — render real data

### Checkpoint 5
- [ ] `npx tsx scripts/calibrate.ts` runs 24 assessments and prints results
- [ ] Evidence validity check: 0 failures
- [ ] Objection rate: 8–12 of 24
- [ ] `npx tsx scripts/pregenerate.ts` populates fallback assessments
- [ ] POST `/api/assess` returns a valid assessment with trust block
- [ ] Evidence guard correctly filters out any invalid evidence IDs
- [ ] Disconnecting API key triggers fallback assessment (verify by temporarily removing key)
- [ ] Full flow: wishlist → context → loading → Match Check result with real AI data

---

## Phase 6 — Decision Checkpoint (Screen 4)

**Goal:** User can record doubt resolution and take an action.

**Time estimate:** ~30 minutes

**Spec reference:** Build order step 7 (interleaved — the checkpoint is needed before Inner Circle).

### 6.1 Decision Components

| Component | File | Behaviour |
|---|---|---|
| `DoubtResolved` | `src/components/decision/DoubtResolved.tsx` | "Has your main doubt been resolved?" → Yes / Partly / No. Radio group. Tracks `doubt_resolved_yes\|partly\|no`. |
| `ActionButtons` | `src/components/decision/ActionButtons.tsx` | Four actions: **Buy this** (→ `/confirm`), **Ask my Inner Circle** (→ share flow), **Keep for later** (→ wishlist, marks resolved in localStorage), **Not right for me — remove** (→ wishlist, removes product from localStorage wishlist). Each tracks its event. |

### 6.2 Decision Page — `src/app/decision/[checkId]/page.tsx`

- Fetch check data by `checkId` from checksStore
- Show product summary strip
- Render `DoubtResolved` → `ActionButtons`
- Update check record with doubtResolved and finalDecision
- Update localStorage progress (checked → resolved)

### 6.3 Confirmation Page — `src/app/confirm/page.tsx`

Simple prototype confirmation screen:
- "Order confirmed!" (mock)
- Product summary
- "This is a prototype — no real order has been placed."
- CTA: "Back to wishlist"

#### Files created:
- `src/components/decision/DoubtResolved.tsx` + CSS module
- `src/components/decision/ActionButtons.tsx` + CSS module
- `src/app/decision/[checkId]/page.tsx`
- `src/app/confirm/page.tsx`
- `src/styles/decision.module.css`

### Checkpoint 6
- [ ] Decision page renders with doubt resolution question
- [ ] All four action buttons navigate correctly
- [ ] "Buy this" → confirmation page
- [ ] "Keep for later" and "Not right for me" return to wishlist with updated progress
- [ ] Progress bar on wishlist updates after resolution

---

## Phase 7 — Inner Circle Share & Voting (Screens 5 & 6)

**Goal:** End-to-end share → vote → return flow works.

**Time estimate:** ~60 minutes

**Spec reference:** Build order step 8.

### 7.1 Share Token Utility — `src/lib/shareToken.ts`

```typescript
export function generateShareToken(): string  // nanoid, 12 chars, URL-safe
export function buildShareUrl(token: string): string  // NEXT_PUBLIC_BASE_URL + /share/ + token
export function buildWhatsAppLink(shareUrl: string, productName: string): string
export function isExpired(expiresAt: string): boolean
```

### 7.2 Share API Routes — `src/app/api/shares/route.ts`

**POST:** Create share
- Input: `{ checkId, shopperQuestion }`
- Fetch check from checksStore
- Generate token, compute expiresAt (now + 24h)
- Store in sharesStore
- Return `{ token, shareUrl, expiresAt }`

**GET:** Fetch share data for voting page
- Query param: `?token={token}`
- Return product info, context, consideration, shopper question, expiry status

### 7.3 Vote API Routes — `src/app/api/votes/route.ts`

**POST:** Cast vote
- Input: `{ shareToken, response, comment? }`
- Validate token exists and not expired
- Store vote in votesStore
- Return `{ voteId }`

**GET:** Fetch votes for owner
- Query param: `?token={token}`
- Return `{ votes[], summary: { works, onlyIf, notForThis, notSure } }`

### 7.4 Inner Circle Components

| Component | File | Behaviour |
|---|---|---|
| `ShareCard` | `src/components/innercircle/ShareCard.tsx` | Preview card: product image + price, occasion + cost per wear, one consideration (first from assessment), shopper's question. Used in both owner preview and friend view. |
| `ShareActions` | `src/components/innercircle/ShareActions.tsx` | WhatsApp deep link button, copy link button (with "Copied!" feedback), native share button (Web Share API with graceful fallback). Tracks `inner_circle_shared` with share method. |
| `VotingForm` | `src/components/innercircle/VotingForm.tsx` | 4 vote options + optional comment textarea. Submit button. "Thank you" state after voting. |
| `VoteResults` | `src/components/innercircle/VoteResults.tsx` | Live vote summary: "3 Works for you · 1 Only if the sizing checks out". Polls GET `/api/votes` every 5 seconds. Shows individual comments. CTA: "Return to my decision". Tracks `owner_returned_after_vote`. |

### 7.5 Share/Vote Page — `src/app/share/[token]/page.tsx`

Single page serves both roles:
- **Friend view** (default): ShareCard (read-only) + VotingForm. Detects if token is expired → shows expiry message.
- **Owner view** (if `?owner=true` in URL or same session detected via localStorage): ShareCard + VoteResults + "Return to my decision" CTA.

### 7.6 Wire Decision → Share Flow

Update `ActionButtons` component:
- "Ask my Inner Circle" action:
  1. Prompt for shopper question (pre-filled based on hesitation, e.g., "I'm unsure about the fit")
  2. POST to `/api/shares`
  3. Navigate to `/share/{token}?owner=true`

#### Files created:
- `src/lib/shareToken.ts`
- `src/app/api/shares/route.ts`
- `src/app/api/votes/route.ts`
- `src/components/innercircle/ShareCard.tsx` + CSS module
- `src/components/innercircle/ShareActions.tsx` + CSS module
- `src/components/innercircle/VotingForm.tsx` + CSS module
- `src/components/innercircle/VoteResults.tsx` + CSS module
- `src/app/share/[token]/page.tsx`
- `src/styles/innercircle.module.css`

#### Files modified:
- `src/components/decision/ActionButtons.tsx` — wire Inner Circle action

### Checkpoint 7
- [ ] "Ask my Inner Circle" creates a share token and shows the share card
- [ ] WhatsApp deep link opens WhatsApp with pre-filled message + URL
- [ ] Copy link button copies URL to clipboard with feedback
- [ ] Opening the share URL in a different browser shows the voting form
- [ ] Casting a vote succeeds and shows "Thank you" state
- [ ] Owner view shows live vote count (poll every 5s)
- [ ] Expired token shows expiry message
- [ ] "Return to my decision" navigates back to decision checkpoint

---

## Phase 8 — Event Tracking & Progress State

**Goal:** All analytics events fire. Progress bar reflects accurate check/resolve state.

**Time estimate:** ~30 minutes

**Spec reference:** Build order step 9.

### 8.1 Event Emitter — `src/lib/events.ts`

```typescript
export function trackEvent(eventName: string, productId?: string, metadata?: Record<string, any>): void
export function getSessionId(): string  // UUID v4 from localStorage, created on first call
```

Uses `navigator.sendBeacon` for fire-and-forget delivery. Falls back to `fetch` if sendBeacon unavailable.

### 8.2 Events API Route — `src/app/api/events/route.ts`

`POST /api/events`:
- Accepts event payload
- Logs to `console.log` with structured format (dev)
- Returns `{ ok: true }`
- Never blocks, never fails the client

### 8.3 Instrument All Screens

Add `trackEvent()` calls to every screen per the event catalog:

| Screen | Events |
|---|---|
| Wishlist | `wishlist_viewed` |
| Context | `match_check_started`, `context_submitted` |
| Match Check | `match_check_generated`, `trust_block_viewed`, `evidence_opened`, `cost_per_wear_changed`, `worth_it_answered` |
| Decision | `doubt_resolved_yes\|partly\|no`, `buy_clicked`, `kept_for_later`, `removed_from_wishlist` |
| Inner Circle | `inner_circle_shared`, `inner_circle_vote_received`, `owner_returned_after_vote` |

### 8.4 Progress State Refinement

Update `ProgressBar` to accurately track:
- **Checked:** products where a Match Check was completed (check record exists in localStorage)
- **Resolved:** products where the user reached a final decision (buy, keep, or remove — recorded in localStorage)

localStorage schema:
```typescript
{
  checkedProducts: string[],    // product IDs
  resolvedProducts: string[],   // product IDs
  removedProducts: string[]     // product IDs (hidden from wishlist)
}
```

#### Files created:
- `src/lib/events.ts`
- `src/app/api/events/route.ts`

#### Files modified:
- All page files — add `trackEvent()` calls
- `src/components/wishlist/ProgressBar.tsx` — use localStorage state
- `src/app/page.tsx` — filter out removed products

### Checkpoint 8
- [ ] Open browser console → verify events fire on every interaction
- [ ] `wishlist_viewed` fires on page load
- [ ] `context_submitted` fires with correct metadata
- [ ] Progress bar updates: checking a product increments "checked", resolving increments "resolved"
- [ ] Removed products disappear from wishlist
- [ ] Events use `sendBeacon` (verify in Network tab)

---

## Phase 9 — Visual Polish & Micro-Animations

**Goal:** Premium look and feel. The app should wow at first glance.

**Owner:** Stitch AI (Track A) handles initial visual quality. Manual (Track C) refines and ensures animations, accessibility, and mobile touch optimizations are in place.

**Time estimate:** ~45 minutes

**Spec reference:** Build order step 10 (mobile pass).

> **Note:** Stitch AI may generate much of the visual polish already. This phase focuses on verifying and refining what Stitch AI produced — adding any missing animations, ensuring accessibility compliance, and testing on real mobile viewports.

### 9.1 Animations & Transitions

| Element | Animation |
|---|---|
| Wishlist cards | Staggered fade-in on page load (each card delayed 50ms) |
| Chip selection | Scale bounce + color transition (150ms) |
| Slider thumb | Subtle glow on drag |
| Cost-per-wear value | Number morphing/counting animation on change |
| CTA enable | Gentle pulse when button becomes enabled |
| Evidence drawer | Slide-up with spring easing (300ms) |
| Loading spinner | Branded pulse with "Analyzing reviews…" → "Building your assessment…" → "Almost ready…" cycling messages |
| Trust block items | Sequential fade-in (shield icon first, then items) |
| Vote results | Count-up animation when new votes arrive |
| Page transitions | Fade + slight vertical slide between screens |

### 9.2 Visual Enhancements

| Element | Treatment |
|---|---|
| Cards | Glassmorphism: `backdrop-filter: blur(12px)`, subtle border, `box-shadow` with colored glow |
| Trust block | Distinct visual identity — bordered card with shield icon, amber/green accent |
| Match reasons | Green-tinted left border, soft green background |
| Considerations | Amber-tinted left border, soft amber background. **Same size and prominence as match reasons.** |
| Cost-per-wear | Large, bold number with subtle gradient text |
| Share card | Premium card with product image, gradient overlay, clear typography |
| Progress bar | Thin gradient bar (pink-to-green as progress increases) |
| Illustrative header | Amber background, ⚠️ icon, non-intrusive but always visible |

### 9.3 Mobile Touch Optimizations

- Active state on all tappable elements (subtle scale-down on press)
- Haptic feedback hints via CSS (`touch-action` properties)
- No hover-dependent interactions (hover effects are bonus, not required)
- Safe area insets for notched phones (`env(safe-area-inset-*)`)
- Smooth scrolling with `overscroll-behavior: contain`

#### Files modified:
- All CSS modules — add animations and visual polish
- `src/styles/globals.css` — add animation keyframes and utility classes

### Checkpoint 9
- [ ] Open app on mobile viewport (375px) — first impression should feel premium
- [ ] Cards have glassmorphism effect
- [ ] Staggered card fade-in on wishlist load
- [ ] Slider drag feels smooth with visual feedback
- [ ] Loading state cycles through messages
- [ ] Evidence drawer slides smoothly
- [ ] No horizontal scroll on any screen
- [ ] Touch targets are comfortable (≥44px)

---

## Phase 10 — Deployment & Final Verification

**Goal:** Live public URL. Full demo script passes. No broken states.

**Time estimate:** ~30 minutes

**Spec reference:** Build order step 10.

### 10.1 Production Readiness

| Task | Action |
|---|---|
| Environment variables | Set `GEMINI_API_KEY` and `NEXT_PUBLIC_BASE_URL` in Vercel dashboard |
| KV store (optional) | Provision Vercel KV if persistence across deploys is needed. Otherwise, in-memory is acceptable for prototype. |
| Build check | Run `npm run build` locally — fix any TypeScript or build errors |
| Image optimization | Ensure all product images are WebP, reasonable size (<200KB each) |
| Meta tags | Verify title, description, OG tags for share link previews |

### 10.2 Deploy to Vercel

```bash
# Option A: Vercel CLI
npx -y vercel --prod

# Option B: Push to GitHub → auto-deploy
git add -A && git commit -m "Initial deploy" && git push origin main
```

### 10.3 Post-Deploy Verification

Run the full demo script on the live URL:

| Step | Action | Verify |
|---|---|---|
| 1 | Open live URL on phone | Wishlist loads, header visible, 6 products render |
| 2 | Tap "Check if it's right for me" on sneakers | Context form loads |
| 3 | Select "Everyday", slide to 25 wears, select "Can I trust this listing?" | Cost per wear updates live, reference band shows |
| 4 | Tap "Generate my Match Check" | Loading spinner → Match Check renders |
| 5 | Verify trust block | Brand-authorised, verified-purchase share, style-code match all visible |
| 6 | Tap "Continue to my decision" | Decision checkpoint loads |
| 7 | Select "Yes" → "Buy this" | Confirmation screen appears |
| 8 | Return to wishlist | Progress: "1 checked · 1 resolved" |
| 9 | Tap lehenga → "Wedding or event" → 6 wears → "Will I actually wear it?" | Cost per wear: ₹8,999 ÷ 6 = ₹1,500 |
| 10 | Generate Match Check | Assessment renders with considerations |
| 11 | Open evidence drawer on a consideration | Evidence source and user input visible |
| 12 | Adjust cost-per-wear slider | Value updates without regenerating |
| 13 | "Would this feel worth it?" → "Not sure" | Recorded |
| 14 | Continue → "Ask my Inner Circle" | Share card generates |
| 15 | Copy link → open in different browser | Voting page loads without login |
| 16 | Vote "Only if the sizing checks out" | Vote recorded, thank you shown |
| 17 | Return to owner view | Vote appears live |
| 18 | "Return to my decision" → resolve | Flow completes |

### 10.4 Fallback Verification

| Test | Action | Expected |
|---|---|---|
| API failure | Temporarily set invalid API key, generate Match Check | Fallback assessment renders, `fallback: true` flag |
| Expired share | Manually create a share with past expiry | "This link has expired" message on voting page |
| No votes | Open owner view before any friend votes | Empty state: "Waiting for responses…" |

### Checkpoint 10
- [ ] Live public URL accessible
- [ ] Full demo script passes end-to-end
- [ ] Fallback assessment works when API is unavailable
- [ ] Share links work across browsers
- [ ] No console errors on any screen
- [ ] Performance: wishlist loads in <2s on mobile

---

## Execution Timeline

| Time Block | Phase | Owner | Key Output |
|---|---|---|---|
| **Hour 0–0.5** | Phase 0: Scaffold + Design System | Manual | Running dev server, design tokens |
| **Hour 0–2** | *Stitch AI screens (parallel)* | Stitch AI | All 6 screens designed and exported |
| **Hour 0.5–1.5** | Phase 1: Seed Data + Types | Manual | All product data, TypeScript interfaces |
| **Hour 1.5–2.5** | Phase 3: Trust Block + Phase 5.1–5.4: AI Pipeline | Manual | Trust assembly, system prompt, schema, evidence guard |
| **Hour 2–3** | *Upload Stitch AI code* | Manual | Frontend code in project |
| **Hour 2.5–3.5** | Phase 5.5–5.8: API Routes + Stores + Calibration | Manual | API routes, calibration passes |
| **Hour 3.5–5** | Integration: Wire frontend to backend | Manual | Screens 1–4 functional end-to-end |
| **Hour 5–6** | Phase 7: Inner Circle integration | Manual | Share → vote flow working |
| **Hour 6–6.5** | Phase 8: Events + Progress | Manual | All tracking live |
| **Hour 6.5–7.25** | Phase 9: Polish + Accessibility | Manual | Animations verified, mobile tested |
| **Hour 7.25–8** | Phase 10: Deploy + Verify | Manual | Live URL, demo script passes |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini API rate limits during calibration | Medium | Blocks Phase 5 | Add 2-second delay between calls; reduce to 12 calls (2 products × 4 scenarios) if needed |
| AI generates boilerplate considerations | High | Undermines product credibility | Calibration catches this; tune prompt per spec §5 Step 5 |
| Evidence ID hallucination | Medium | False claims reach UI | Evidence guard drops invalid statements at runtime — permanent, not dev-only |
| Mobile layout breaks on specific devices | Medium | Bad demo | Test on 375px (iPhone SE) and 390px (iPhone 14) viewports explicitly |
| Vercel KV not provisioned | Low | Share/vote data lost on redeploy | In-memory store is acceptable for prototype demo; KV is a production upgrade |
| Product images not loading | Low | Broken wishlist cards | Use generated fallback images with explicit dimensions to prevent layout shift |
| Time overrun on AI pipeline | Medium | Phases 6–10 rushed | Fallback assessments + pre-generation are done before live API; even without live AI, the demo works |
| Stitch AI components lack expected props | High | Integration blocked | Define prop contracts in advance (done in this plan). During integration, add missing props or create wrapper components. |
| Stitch AI uses hardcoded data | High | App looks like a static mockup | Expected behaviour — search-and-replace hardcoded values with prop references during integration. Budget extra time for this. |
| Stitch AI styling conflicts with design tokens | Medium | Inconsistent visual identity | Accept Stitch AI's approach. Map design tokens into generated CSS where possible. Don't force a full migration. |
| Stitch AI missing a screen | Low | Demo flow blocked | Build missing screens manually using the Stitch AI design language for consistency. Verify all 6 screens exist before wiring. |

---

## File Manifest

Total files to create: **~55 files**

| Category | Count | Owner | Files |
|---|---|---|---|
| Data & Types | 3 | Manual | `types.ts`, `products.ts`, `referenceWearBands.ts` |
| Pages | 7 | Stitch AI → Integration | Wishlist, Context, Result, Decision, Confirm, Share, Layout |
| API Routes | 4 | Manual | assess, shares, votes, events |
| Components — Wishlist | 3 | Stitch AI | IllustrativeHeader, ProgressBar, WishlistCard |
| Components — Context | 5 | Stitch AI | OccasionPicker, WearSlider, CostPerWearLive, HesitationPicker, FitQuestions |
| Components — Match Check | 7 | Stitch AI | TrustBlock, MatchReasons, Considerations, Unknowns, CostPerWearExplorer, WorthItQuestion, EvidenceDrawer |
| Components — Decision | 2 | Stitch AI | DoubtResolved, ActionButtons |
| Components — Inner Circle | 4 | Stitch AI | ShareCard, ShareActions, VotingForm, VoteResults |
| Components — UI | 6 | Stitch AI | Button, Slider, RadioGroup, Chip, Drawer, LoadingSpinner |
| Lib — AI | 4 | Manual | prompt.ts, schema.ts, assess.ts, evidenceGuard.ts |
| Lib — Store | 3 | Manual | checksStore.ts, sharesStore.ts, votesStore.ts |
| Lib — Utilities | 4 | Manual | costPerWear.ts, events.ts, shareToken.ts, trustBlock.ts |
| Styles | 7 | Stitch AI + Manual | globals.css (manual tokens) + 6 module files (Stitch AI) |
| Scripts | 2 | Manual | calibrate.ts, pregenerate.ts |
| Config | 5 | Manual | package.json, tsconfig.json, next.config.js, .env.local, .gitignore |
| Product Images | 6 | Stitch AI / Generated | 6 WebP product images |
