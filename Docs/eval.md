# Myntra Match Check — Evaluation Framework

Post-build evaluation across every measurable dimension of the project. Each parameter has a definition, measurement method, pass/fail threshold, and the evidence required to claim a pass.

---

## 1. Prototype Test Bar (5 Users)

The spec defines five hard criteria. These are the **primary success gates** — everything else supports them.

### 1.1 Unassisted Completion

| | |
|---|---|
| **What it measures** | Can a user complete the full flow without help? |
| **Method** | 5 users attempt the flow: wishlist → context → Match Check → decision. Facilitator observes silently. No hints, no explanations, no pointing. Record where each user pauses >10 seconds, taps wrong elements, or expresses confusion. |
| **Pass threshold** | **4 of 5** users complete the full flow unaided (reach a decision: buy, keep, remove, or share). |
| **Evidence** | Screen recording + facilitator notes per user. Completion timestamps. List any point where a user asked for help or got stuck. |

#### Scoring rubric per user:

| Outcome | Score |
|---|---|
| Completed without any pause >10s or wrong tap | ✅ Clean pass |
| Completed with 1–2 minor hesitations but self-recovered | ✅ Pass |
| Completed but needed 1 verbal hint from facilitator | ❌ Fail (assisted) |
| Did not reach a final decision | ❌ Fail (incomplete) |

---

### 1.2 Reduced Need to Leave Myntra

| | |
|---|---|
| **What it measures** | Does the tool reduce the user's felt need to search elsewhere? |
| **Method** | Post-task interview question: *"After using Match Check, do you feel you'd still need to leave Myntra to check price, reviews, or authenticity before deciding?"* — Definitely yes / Probably yes / Probably no / Definitely no. |
| **Pass threshold** | **3 of 5** answer "Probably no" or "Definitely no." |
| **Evidence** | Recorded answers. Verbatim quotes where users explain their reasoning. |

#### Follow-up probes:
- "What would you still want to check outside Myntra?"
- "Was there a specific piece of information that made you feel you didn't need to leave?"
- "Would you have normally opened another app at this point?"

---

### 1.3 Clearer Decision

| | |
|---|---|
| **What it measures** | Does the user reach a clearer buy/no-buy position than they would have without Match Check? |
| **Method** | Pre-task: *"How decided are you about this item?"* — 1 (no idea) to 5 (completely decided). Post-task: same question. Measure the delta. Also capture the in-app "Has your main doubt been resolved?" response. |
| **Pass threshold** | **3 of 5** show a positive delta (post > pre) OR answer "Yes" to doubt resolution. |
| **Evidence** | Pre/post scores per user. In-app doubt resolution responses. Qualitative notes on what shifted their position. |

---

### 1.4 No Perceived Seller Attack

| | |
|---|---|
| **What it measures** | Does the user perceive the tool as attacking or devaluing the seller/product? |
| **Method** | Post-task question: *"Did anything in Match Check feel like Myntra was criticizing the product or the seller?"* — Open-ended, then prompted with: *"Did the 'Things to consider' section feel fair to the seller?"* |
| **Pass threshold** | **0 of 5** report feeling the tool attacks the seller. |
| **Evidence** | Verbatim responses. Flag any user who uses words like "negative," "attacking," "unfair," "biased against," "making it look bad." |

#### Red flag phrases to listen for:
- "It was trying to talk me out of buying"
- "It made the product look bad"
- "The seller wouldn't like this"
- "It felt like a warning against the product"

---

### 1.5 End-to-End Friend Vote

| | |
|---|---|
| **What it measures** | Does the Inner Circle flow work with a real human on the other end? |
| **Method** | At least 1 of the 5 users shares a link. A real friend (not the facilitator) opens the link and votes. The vote appears on the owner's screen. |
| **Pass threshold** | **≥1** real friend vote lands end to end. |
| **Evidence** | Screenshot of the owner's vote results screen showing the friend's vote. Timestamp of share creation vs. vote arrival. Confirmation that the friend was not briefed or assisted. |

---

## 2. Doubt Resolution Rate (Primary MVP Signal)

| | |
|---|---|
| **Definition** | Completed Match Checks answering "Yes" to "Has your main doubt been resolved?" ÷ total completed Match Checks. |
| **Data source** | In-app `doubt_resolved_yes`, `doubt_resolved_partly`, `doubt_resolved_no` events + `Check` records in the store. |
| **Measurement** | After all 5 user tests: count Yes / Partly / No across all checks performed by all users. |
| **Target** | Directional — no hard threshold for MVP. Track the rate. ≥50% "Yes" is a strong signal. ≥30% "Yes" + "Partly" combined is acceptable. |
| **Report format** | |

```
Doubt Resolution Summary (N checks across 5 users)
───────────────────────────────────────────────────
Yes:     X of N  (XX%)
Partly:  X of N  (XX%)
No:      X of N  (XX%)

By hesitation type:
  Worth the price:    X Yes / X Partly / X No
  Will it fit:        X Yes / X Partly / X No
  Trust this listing: X Yes / X Partly / X No
  Will I wear it:     X Yes / X Partly / X No
  Right for occasion: X Yes / X Partly / X No
```

---

## 3. AI Assessment Quality

### 3.1 Calibration Metrics (Pre-Build, Automated)

Run the calibration script: 6 products × 4 scenarios = 24 assessments.

| Metric | Measurement | Target | How to measure |
|---|---|---|---|
| **Evidence validity** | For every `evidence_ids` value in every output, assert it exists in that product's `evidence[]` | **0 failures** | Automated set-membership test in `scripts/calibrate.ts` |
| **Objection rate** | Count of runs where `considerations` has ≥1 applicable item | **8–12 of 24 (33–50%)** | Automated count |
| **Boilerplate repetition** | Group consideration phrasings across all 24 outputs. Max frequency of any single phrasing. | **No phrase in >50% of outputs** | Automated string grouping (fuzzy match on consideration.condition) |
| **`evidence_completeness` variance** | Count distinct values across 24 runs | **≥2 distinct values** | Automated set size check |

#### Report format:

```
Calibration Results
───────────────────────────────────────
Total runs:                24
Evidence validity failures: 0  ✅ / N  ❌
Objection rate:            X/24 (XX%)  [target: 33–50%]
Max phrasing frequency:    X/24 (XX%)  [target: <50%]
Distinct completeness vals: X          [target: ≥2]

Top 5 consideration phrasings:
  1. "If you are between sizes..."       — appeared X/24
  2. "If low-maintenance matters..."     — appeared X/24
  ...
```

### 3.2 Assessment Relevance (Manual Review)

| | |
|---|---|
| **What it measures** | Are the AI-generated statements actually relevant to the product and the user's context? |
| **Method** | Manually review 6 assessments (one per product, random context). For each statement, rate: Relevant / Generic / Irrelevant / Fabricated. |
| **Target** | ≥80% of statements rated "Relevant." 0 rated "Fabricated." |
| **Evidence** | Spreadsheet with product ID, statement text, rating, and reviewer notes. |

#### Rating definitions:

| Rating | Definition |
|---|---|
| **Relevant** | Statement references specific product evidence and addresses the user's context (occasion, hesitation, expected wears) |
| **Generic** | Statement could apply to any product in the category (e.g., "Check the size chart" for every garment) |
| **Irrelevant** | Statement doesn't relate to the product or the user's context |
| **Fabricated** | Statement cites evidence that doesn't exist, or makes claims not supported by any evidence item |

### 3.3 Seller-Protection Compliance

| | |
|---|---|
| **What it measures** | Does any assessment output violate the 10 seller-protection rules? |
| **Method** | Review all 24 calibration outputs + all assessments generated during user testing. Check each against the 10 rules. |
| **Target** | **0 violations.** |
| **Evidence** | Checklist per assessment with pass/fail for each rule. |

#### Violation checklist (per assessment):

- [ ] Rule 1: Assesses match, not absolute worth
- [ ] Rule 2: Never calls item bad/overpriced/fake/poor/not worth buying
- [ ] Rule 3: Never alleges/implies/hedges about authenticity
- [ ] Rule 4: Every concern is conditional ("If X matters to you…")
- [ ] Rule 5: Every claim references a supplied evidence ID
- [ ] Rule 6: Isolated reviews treated as individual reports
- [ ] Rule 7: Contradictory evidence named, not resolved
- [ ] Rule 8: Equal prominence for positives and considerations
- [ ] Rule 9: Never makes the decision for the user
- [ ] Rule 10: Never references competitors

---

## 4. Trust Block Accuracy

| Metric | What it measures | Method | Target |
|---|---|---|---|
| **Completeness** | Does every product render a non-empty trust block? | Visually inspect all 6 products' trust blocks. | 6 of 6 render at least platform protection |
| **Asymmetry compliance** | Does any trust block contain negative, hedged, or "limited data" language? | Text review of every rendered trust block across all products. | 0 instances of negative/hedged language |
| **Data accuracy** | Do rendered verification items match the seeded `product.verification` data? | Compare displayed text against `products.ts` source data. | 100% match |
| **Display threshold** | Is `verifiedPurchaseShare` hidden when below 50%? | Check products with low share. | Correctly hidden |
| **Platform protection floor** | Do products with no brand authorization / style code / verified purchases still show returnsWindow, refundProtection, exchangePolicy? | Check the weakest-verification product. | All 3 floor items render |

---

## 5. Cost-Per-Wear Calculator

| Metric | What it measures | Method | Target |
|---|---|---|---|
| **Arithmetic accuracy** | Is `price ÷ expectedWears` calculated correctly? | Test 10 price/wear combinations against manual calculation. | 100% match |
| **Live update** | Does the value update instantly as the slider moves? | Drag the slider on all 6 products. Observe for lag or stale values. | No perceptible delay (<100ms) |
| **Reference band correctness** | Does the reference band text match the selected occasion? | Select each of the 6 occasions and verify the displayed text against `referenceWearBands.ts`. | 6 of 6 correct |
| **Slider at boundaries** | Does slider work at min (1) and max (30+)? | Set slider to 1 and 30+ for each product. Verify cost per wear is correct. | No errors, no NaN, no Infinity |
| **Occasion change resets slider** | When occasion changes, does the slider reset to the new reference band midpoint? | Change occasion after setting a custom slider value. | Slider resets |
| **Screen 3 independence** | Can the Screen 3 slider be adjusted without regenerating the assessment? | Adjust the explorer slider on Screen 3. Verify assessment text doesn't change. | Assessment static, only cost per wear updates |

---

## 6. Evidence Drawer

| Metric | What it measures | Method | Target |
|---|---|---|---|
| **Traceability** | Does every "Why am I seeing this?" link open a drawer with the correct evidence? | Tap every evidence link across 3 different assessments. Verify the evidence ID in the drawer matches the statement's `evidence_ids`. | 100% match |
| **Source attribution** | Does each evidence item show its type and source? | Check that each evidence entry shows "Verified purchase review" / "Product description" / "Size chart" / "Rating aggregate" as appropriate. | All entries attributed |
| **User input shown** | Does the drawer show which user input influenced the statement? | Verify that "You selected: [occasion], [expected wears]" or similar appears in the drawer. | Present for every statement |
| **Equal access** | Are evidence drawers available for both match_reasons and considerations — with equal visibility? | Verify both positive statements and considerations have "Why am I seeing this?" links. | Both have links |

---

## 7. Inner Circle Flow

| Metric | What it measures | Method | Target |
|---|---|---|---|
| **Share creation** | Does POST `/api/shares` return a valid token and URL? | Create shares for 3 different products. | 3 of 3 succeed |
| **WhatsApp deep link** | Does the WhatsApp link open WhatsApp with the correct pre-filled message and URL? | Tap the WhatsApp button on a mobile device. | Message contains product name and share URL |
| **Copy link** | Does "Copy link" copy the correct URL to clipboard? | Tap copy, paste into a new tab. | URL matches and loads the voting page |
| **Share card content** | Does the friend see the correct product, occasion, cost per wear, and shopper's question? | Open a share link in a different browser. Verify all fields match the owner's context. | All fields correct |
| **Vote submission** | Can a friend vote and see a "Thank you" confirmation? | Submit all 4 vote types + comments across different shares. | All votes succeed |
| **Vote delivery** | Does the owner see the friend's vote appear? | After voting, check the owner's view. Wait for polling (≤5s). | Vote appears within 5 seconds |
| **24h expiry** | Does an expired share link show the expiry message? | Create a share, manually set `expiresAt` to the past, visit the link. | "This link has expired" message shown, no voting form |
| **Duplicate vote prevention** | Can the same friend vote twice? | Vote, refresh, try to vote again. | Second vote blocked; "Thank you" state shown |

---

## 8. User Experience & Design

### 8.1 Mobile Responsiveness

| Test | Method | Target |
|---|---|---|
| 375px viewport (iPhone SE) | Open in Chrome DevTools at 375×667. Navigate all screens. | No horizontal scroll, no text overflow, no unreachable buttons |
| 390px viewport (iPhone 14) | Open at 390×844. | Same as above |
| 360px viewport (small Android) | Open at 360×640. | Same as above |
| 430px viewport (iPhone 14 Pro Max) | Open at 430×932. | Content fills width without excess whitespace |
| Tablet (768px+) | Open at 768×1024. | Content centered, max-width applied, no awkward stretching |

### 8.2 Touch Targets

| | |
|---|---|
| **Method** | Audit every interactive element on every screen. Measure rendered size. |
| **Target** | All tappable elements ≥ 44×44px. Slider thumb ≥ 48px. |
| **Tool** | Chrome DevTools → Elements → Computed → check width/height. |

### 8.3 Visual Polish Checklist

| Element | Criteria | Pass/Fail |
|---|---|---|
| **Dark theme** | Consistent use of design tokens. No plain white backgrounds. No harsh contrast transitions. | |
| **Glassmorphism** | Cards have backdrop-filter blur and subtle border. Effect is visible but not distracting. | |
| **Typography** | Inter font loaded. Heading hierarchy clear. Body text readable at mobile sizes. | |
| **Animations** | Staggered card fade-in. Slider glow. Drawer slide-up. CTA pulse. No janky or stuttering animations. | |
| **Loading state** | Branded spinner with cycling messages. Feels alive, not broken. | |
| **Color palette** | Accent colors are harmonious (Myntra pink, amber trust, green match). No generic red/blue/green. | |
| **Illustrative header** | Always visible, amber background, non-dismissable. | |
| **Progress bar** | Thin gradient bar visible on wishlist. Updates correctly. | |
| **Equal prominence** | Match reasons and considerations have the same card size, typography, and visual weight. | |

### 8.4 Accessibility

| Test | Method | Target |
|---|---|---|
| `prefers-reduced-motion` | Enable reduced motion in OS. Reload app. | Animations disabled; functional state changes are instant |
| Font scaling (200%) | Set OS font to 200%. Reload app. | All text readable, no clipping, no overflow |
| Color contrast | Run Chrome Lighthouse accessibility audit. | No contrast violations on text elements |
| Screen reader labels | Audit with VoiceOver (iOS) or TalkBack (Android) for key flows. | All interactive elements have accessible names |

---

## 9. Technical Reliability

### 9.1 Fallback Behavior

| Test | Method | Expected Result |
|---|---|---|
| API key removed | Delete `GEMINI_API_KEY` from `.env.local`. Generate a Match Check. | Fallback assessment renders. `fallback: true` logged. Trust block, cost per wear, sharing all work normally. |
| API timeout | Set an impossibly short timeout (50ms). Generate a Match Check. | Fallback serves within 100ms. No spinner hang. |
| Malformed API response | Mock Gemini to return `{ invalid: true }`. | Fallback serves. No crash. Error logged server-side. |
| Evidence guard filters everything | Mock Gemini to return assessments with invalid evidence IDs. | Fallback serves. Original response logged for debugging. |

### 9.2 Performance

| Metric | Target | How to measure |
|---|---|---|
| First Contentful Paint | < 1.5s | Lighthouse on 4G throttling |
| Largest Contentful Paint | < 2.5s | Lighthouse on 4G throttling |
| Total Blocking Time | < 200ms | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Total bundle size (client JS) | < 200KB gzipped | `npm run build` output |
| Assessment response time (live) | < 5s (3s API + overhead) | Network tab timing on `/api/assess` |
| Assessment response time (fallback) | < 500ms | Network tab timing when API key is missing |

### 9.3 Build Health

| Check | Method | Target |
|---|---|---|
| TypeScript compilation | `npm run build` | 0 type errors |
| ESLint | `npm run lint` | 0 errors (warnings acceptable) |
| No console errors | Open each screen in browser. Check console. | 0 errors on any screen |
| No 404s | Navigate all routes. Check Network tab. | 0 failed resource loads |
| No hydration mismatches | Check console for React hydration warnings. | 0 warnings |

---

## 10. Event Tracking Completeness

| Event | Screen | Trigger | Verification Method |
|---|---|---|---|
| `wishlist_viewed` | Wishlist | Page load | Open console → navigate to wishlist → verify event logged |
| `match_check_started` | Wishlist | Tap "Check if it's right for me" | Tap CTA → verify event with productId |
| `context_submitted` | Context | Submit form | Submit → verify event with occasion, expectedWears, hesitation |
| `match_check_generated` | Result | Assessment renders | Verify event with fallback flag and evidenceCompleteness |
| `trust_block_viewed` | Result | Trust block enters viewport | Scroll to trust block → verify event fires once |
| `evidence_opened` | Result | Tap "Why am I seeing this?" | Tap → verify event with evidenceId and statementType |
| `cost_per_wear_changed` | Result | Slider drag ends | Drag → verify event with newValue and costPerWear |
| `worth_it_answered` | Result | Tap yes/not sure/no | Tap → verify event with answer and costPerWear |
| `doubt_resolved_yes` | Decision | Tap "Yes" | Tap → verify event |
| `doubt_resolved_partly` | Decision | Tap "Partly" | Tap → verify event |
| `doubt_resolved_no` | Decision | Tap "No" | Tap → verify event |
| `inner_circle_shared` | Share | Share action completed | Share → verify event with shareMethod |
| `inner_circle_vote_received` | Voting | Vote POST succeeds | Vote → verify event with response |
| `owner_returned_after_vote` | Share | Tap "Return to my decision" | Tap → verify event with voteCount |
| `buy_clicked` | Decision | Tap "Buy this" | Tap → verify event |
| `kept_for_later` | Decision | Tap "Keep for later" | Tap → verify event |
| `removed_from_wishlist` | Decision | Tap "Not right for me" | Tap → verify event |

**Target:** 17 of 17 events fire correctly with accurate metadata.

---

## 11. Edge Case Handling

Verify handling of the critical 25 edge cases from [edge-cases.md](file:///d:/Grad%20Project/Docs/edge-cases.md), including the 5 Stitch AI integration cases (§14).

### Must-verify before demo:

| # | Edge Case | Test Method | Expected Result |
|---|---|---|---|
| 1.1 | API timeout → fallback | Set 50ms timeout | Fallback serves |
| 1.2 | Malformed JSON → fallback | Mock invalid response | Fallback serves, no crash |
| 1.6 | Missing API key → fallback | Remove key | Fallback serves immediately (no 3s wait) |
| 2.1 | No verification data → platform protection | Check weakest product | ≥3 platform items render |
| 3.3 | Price zero → safe display | Set a product price to 0 | "Price unavailable" shown |
| 4.1 | Submit without required fields | Tap disabled CTA | Button stays disabled, no API call |
| 4.2 | Invalid product ID in URL | Navigate to `/check/fake-id` | "Product not found" + back link |
| 4.5 | Rapid double-tap | Tap CTA quickly twice | Single API call, single check created |
| 5.1 | Expired share link | Visit expired token URL | "Link has expired" message |
| 5.3 | Zero votes → waiting state | Open owner view before votes | "Waiting for responses…" |
| 5.8 | Web Share API unsupported | Test on desktop Firefox | Native share button hidden |
| 6.1 | localStorage unavailable | Open in private mode (if localStorage blocked) | App works without progress persistence |
| 6.3 | All products removed | Remove all 6 products | Empty state with reset option |
| 7.3 | iOS safe area | Test on iPhone with notch | Content not hidden behind notch/home indicator |
| 7.6 | Offline during assessment | Disconnect network, submit context | "Connection lost" error, no infinite spinner |

---

## 12. Demo Script Verification

Run the exact demo script from the spec. Time it.

### Script steps:

| Step | Action | Expected | Time |
|---|---|---|---|
| 1 | Open live URL | Wishlist loads with 6 products, header visible | 0:00–0:05 |
| 2 | Tap discounted sneakers "Check if it's right for me" | Context form loads with sneakers info | 0:05–0:10 |
| 3 | Select "Everyday" | Reference band: "20–50+ times" | 0:10–0:12 |
| 4 | Keep default expected wears | Cost per wear updates | 0:12–0:15 |
| 5 | Select "Can I trust this listing?" | Hesitation selected | 0:15–0:18 |
| 6 | Tap "Generate my Match Check" | Loading spinner → Match Check renders | 0:18–0:25 |
| 7 | Verify trust block | Brand-authorised ✓, verified purchases ✓, style code match ✓ | 0:25–0:35 |
| 8 | Tap "Continue to my decision" | Decision page loads | 0:35–0:38 |
| 9 | Select "Yes" → "Buy this" | Confirmation screen | 0:38–0:42 |
| 10 | Back to wishlist | Progress: "1 checked · 1 resolved" | 0:42–0:45 |
| 11 | Tap lehenga "Check if it's right for me" | Context form loads with lehenga info | 0:45–0:50 |
| 12 | Select "Wedding or event" | Reference band: "2–6 times" | 0:50–0:52 |
| 13 | Set slider to 6 wears | Cost per wear: ₹8,999 ÷ 6 = ₹1,500/wear | 0:52–0:55 |
| 14 | Select "Will I actually wear it?" | Hesitation selected | 0:55–0:58 |
| 15 | Tap "Generate my Match Check" | Assessment renders with considerations | 0:58–1:05 |
| 16 | Open evidence drawer on one consideration | Evidence source visible | 1:05–1:15 |
| 17 | Adjust cost-per-wear explorer slider | Value updates without regenerating | 1:15–1:20 |
| 18 | "Would this feel worth it?" → "Not sure" | Response recorded | 1:20–1:25 |
| 19 | Continue → "Ask my Inner Circle" | Share card generates | 1:25–1:30 |
| 20 | Share link (copy or WhatsApp) | Link shared | 1:30–1:35 |
| 21 | Friend opens link, votes "Only if sizing checks out" | Vote submitted | 1:35–1:45 |
| 22 | Owner sees vote → "Return to my decision" | Vote visible, navigates back | 1:45–1:50 |
| 23 | Resolve via size-chart evidence → "Buy this" | Flow completes | 1:50–2:00 |

**Target:** Complete in **under 2 minutes.**

---

## 13. Guardrail Metrics (Production Readiness Indicators)

These are not pass/fail for the prototype but should be measured and reported for the deck.

### 13.1 Consideration Distribution

| | |
|---|---|
| **What it measures** | Are considerations distributed fairly across products, or do some products get flagged disproportionately? |
| **Method** | Across all user tests + calibration: count considerations per product. |
| **Watch for** | One product receiving considerations in 90%+ of checks while another gets 0%. This suggests seed data imbalance, not AI bias — but it's worth reporting. |
| **Report** | Bar chart: considerations per product across all checks. |

### 13.2 Item Removal Rate

| | |
|---|---|
| **What it measures** | How many users choose "Not right for me — remove"? |
| **Method** | Count `removed_from_wishlist` events ÷ total final decisions. |
| **Watch for** | Removal rate >40% suggests the tool is discouraging purchases rather than enabling informed decisions. Removal rate <5% suggests the tool isn't surfacing enough considerations. |
| **Target range** | 10–30% is healthy for a tool that honestly assesses suitability. |

### 13.3 Evidence Drawer Engagement

| | |
|---|---|
| **What it measures** | Do users actually check the evidence behind statements? |
| **Method** | `evidence_opened` events ÷ total statements rendered (match_reasons + considerations). |
| **Watch for** | <5% means users either trust the statements blindly (not ideal) or don't notice the drawer links. >50% means the statements themselves aren't clear enough and users need to verify everything (friction). |
| **Target range** | 15–40% is healthy engagement. |

### 13.4 Inner Circle Share Rate

| | |
|---|---|
| **What it measures** | Among users who are still unsure after the Match Check, how many use Inner Circle? |
| **Method** | `inner_circle_shared` events ÷ (`doubt_resolved_partly` + `doubt_resolved_no`) events. |
| **Watch for** | <10% means the share flow is too hidden or too effortful. >80% is great for engagement but might suggest the Match Check alone isn't resolving enough doubt. |

### 13.5 Time to Decision

| | |
|---|---|
| **What it measures** | How long from `match_check_started` to a final decision event? |
| **Method** | Timestamp difference between `match_check_started` and the first of `buy_clicked` / `kept_for_later` / `removed_from_wishlist`. |
| **Target** | <3 minutes per product for a prototype. Longer suggests friction; shorter suggests shallow engagement. |

---

## 14. Evaluation Report Template

After all tests are complete, compile results into a single report using this structure:

```markdown
# Myntra Match Check — Evaluation Report
Date: [DATE]
Evaluator: [NAME]
Build version: [COMMIT HASH or DEPLOY URL]

## Executive Summary
[2–3 sentences: did the prototype pass? Key highlights and concerns.]

## Prototype Test Bar (5 Users)
| Criterion                          | Target    | Result    | Status |
|------------------------------------|-----------|-----------|--------|
| Unassisted completion              | 4 of 5    | X of 5    | ✅/❌  |
| Reduced need to leave Myntra       | 3 of 5    | X of 5    | ✅/❌  |
| Clearer decision                   | 3 of 5    | X of 5    | ✅/❌  |
| No perceived seller attack         | 0 of 5    | X of 5    | ✅/❌  |
| End-to-end friend vote             | ≥1        | X         | ✅/❌  |

## Doubt Resolution Rate
[Table from §2]

## AI Quality
[Calibration results from §3.1]
[Relevance review from §3.2]
[Seller-protection compliance from §3.3]

## Feature Verification
| Feature                     | Tests | Passed | Status |
|-----------------------------|-------|--------|--------|
| Trust block                 | 5     | X      | ✅/❌  |
| Cost per wear               | 6     | X      | ✅/❌  |
| Evidence drawer             | 4     | X      | ✅/❌  |
| Inner Circle                | 8     | X      | ✅/❌  |
| Event tracking              | 17    | X      | ✅/❌  |
| Edge case handling          | 15    | X      | ✅/❌  |

## Performance
[Lighthouse scores and response times from §9.2]

## Demo Script
Total time: [X:XX]  Target: <2:00  Status: ✅/❌

## Guardrail Metrics
[Charts and distributions from §13]

## Risks & Recommendations
[Key concerns, failure patterns, and suggested fixes for production]

## Appendix
- Calibration raw data: calibration.json
- User test recordings: [links]
- Event logs: [export from /api/events]
```

---

## Evaluation Execution Order

Run evaluations in this sequence to catch blockers early:

| Order | Evaluation | Blocking? | Time |
|---|---|---|---|
| 0 | **Stitch AI integration audit** (see below) | Yes — must pass before any feature eval | 20 min |
| 1 | §9.3 Build health (0 errors) | Yes — nothing else works if build fails | 5 min |
| 2 | §3.1 Calibration metrics (automated) | Yes — AI quality gates demo | 10 min |
| 3 | §9.1 Fallback behavior | Yes — demo must never break | 10 min |
| 4 | §12 Demo script dry run (solo) | Yes — rehearsal before users | 5 min |
| 5 | §4 Trust block accuracy | Partial | 10 min |
| 6 | §5 Cost-per-wear calculator | Partial | 10 min |
| 7 | §6 Evidence drawer | Partial | 10 min |
| 8 | §7 Inner Circle flow | Partial | 15 min |
| 9 | §10 Event tracking completeness | No | 15 min |
| 10 | §8 UX & design (solo check) | No | 15 min |
| 11 | §11 Edge case handling | No | 20 min |
| 12 | §1 Prototype test bar (5 users) | — Final gate — | 60 min |
| 13 | §13 Guardrail metrics (from test data) | No | 15 min |
| 14 | §14 Compile evaluation report | — | 30 min |

### Stitch AI Integration Audit (Step 0)

Run this **immediately after the Stitch AI frontend is uploaded and integrated**, before any other evaluation.

| Check | Method | Pass Criteria |
|---|---|---|
| All 6 screens exist | Navigate each route: `/`, `/check/[id]`, `/check/[id]/result`, `/decision/[id]`, `/share/[token]`, `/confirm` | All 6 load without 404 |
| Components accept data props | Pass seeded product data to each component | Dynamic data renders (no hardcoded product names/prices) |
| API routes connected | Submit the context form, verify POST to `/api/assess` | Request sent, response received, Match Check renders |
| Share flow end-to-end | Create a share, open the share URL | Voting page loads with correct product data |
| Styling consistency | Visual spot-check across all screens | Consistent color palette, typography, and spacing |
| No console errors | Open every screen, check console | 0 errors |

If any check fails, fix integration issues before proceeding to feature evaluations.

**Total evaluation time: ~4 hours** (including Stitch AI audit and user tests).
