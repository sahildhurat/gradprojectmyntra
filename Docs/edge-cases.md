# Myntra Match Check — Edge Cases

Comprehensive catalog of edge cases organized by system area. Each entry includes the scenario, the risk if unhandled, and the prescribed handling.

---

## 1. AI Assessment

### 1.1 Gemini API Timeout

| | |
|---|---|
| **Scenario** | Gemini API does not respond within 3 seconds. |
| **Risk** | User stares at a spinner indefinitely. Demo breaks. |
| **Handling** | Hard timeout at 3s. Serve `product.fallbackAssessment`. Set `fallback: true` in response. Cost per wear, trust block, sharing, and voting remain fully live — they don't depend on AI. User never knows the assessment was cached unless they inspect the response. |

### 1.2 Gemini API Returns Malformed JSON

| | |
|---|---|
| **Scenario** | Despite `responseSchema`, the API returns JSON that doesn't match the `Assessment` type — missing fields, wrong types, extra nesting. |
| **Risk** | Runtime crash on Screen 3. Undefined property access. |
| **Handling** | Wrap the Gemini response in a validation layer. If any required field (`match_reasons`, `considerations`, `unknowns`, `question_to_resolve`, `evidence_completeness`) is missing or wrong-typed, treat as API failure → serve fallback assessment. Log the malformed response for debugging. |

### 1.3 Gemini API Returns Empty Arrays

| | |
|---|---|
| **Scenario** | `match_reasons: []` and/or `considerations: []` — the model has nothing to say. |
| **Risk** | Screen 3 renders empty sections. User sees a hollow assessment. |
| **Handling** | **Empty `match_reasons`:** This is a real problem — it means the model found nothing positive. Show a single fallback statement: "Based on the available information, this item could suit your stated use." with no evidence IDs (honest about the gap). **Empty `considerations`:** This is valid — it means nothing material applies. The "Things to consider" section is simply absent. Do not show "No concerns found" — that reads as endorsement. **Both empty:** Serve the fallback assessment instead. |

### 1.4 All Evidence IDs Hallucinated

| | |
|---|---|
| **Scenario** | Every `evidence_ids` value in the response references an ID that doesn't exist in the product's evidence array. The evidence guard strips everything. |
| **Risk** | After filtering, `match_reasons` and `considerations` are both empty — same as §1.3 but caused by the guard, not the model. |
| **Handling** | After evidence guard runs, check if `match_reasons` is empty. If so, fall back to `product.fallbackAssessment` (which was pre-validated). Log the full original response for debugging. This is a calibration failure — if it happens in production, the prompt or model needs tuning. |

### 1.5 Partial Evidence ID Hallucination

| | |
|---|---|
| **Scenario** | A `match_reasons` item has `evidence_ids: ["ev_dress01_r1", "ev_FAKE_99"]`. One valid, one hallucinated. |
| **Risk** | Evidence guard drops the entire statement because `every()` fails. User loses a valid insight. |
| **Handling** | Current design uses `every()` — all IDs must be valid. This is the conservative choice (prevents partial-truth statements). **Alternative (consider during calibration):** Use `some()` — keep the statement if at least one ID is valid, but only show validated evidence in the drawer. Decide based on calibration results. Document which strategy is in use. |

### 1.6 Gemini API Key Missing or Invalid

| | |
|---|---|
| **Scenario** | `GEMINI_API_KEY` is unset, empty, or revoked. |
| **Risk** | Every assessment call fails. App is a fallback-only shell. |
| **Handling** | Fail fast at API route level: check for key existence before calling Gemini. If missing, skip the API call entirely and serve fallback immediately (saves the 3s timeout wait). Log a clear warning: `"GEMINI_API_KEY not configured — serving fallback assessments"`. The app must remain fully functional with fallbacks. |

### 1.7 Gemini API Rate Limited (429)

| | |
|---|---|
| **Scenario** | Multiple users hit the app simultaneously, or the calibration script exhausted the quota. |
| **Risk** | All subsequent assessment calls fail for the rate-limit window. |
| **Handling** | Treat 429 the same as a timeout — serve fallback. Do not retry (retries would extend the rate limit). In the calibration script: add a 2-second delay between calls to avoid triggering limits. |

### 1.8 Assessment Contains Seller-Violating Language

| | |
|---|---|
| **Scenario** | Despite 10 system prompt rules, the model generates "This product is overpriced" or "The quality seems questionable." |
| **Risk** | Violates marketplace neutrality. Damages seller trust. Breaks a hard constraint. |
| **Handling** | **Prevention:** System prompt rules are the primary defense. **Detection (best-effort):** Add a lightweight post-processing check on `considerations[].implication` — scan for forbidden terms: "overpriced", "bad quality", "fake", "not worth", "poor", "cheap" (in the derogatory sense), "avoid". If found, drop that specific consideration and log it. **Do not block the entire assessment** — one bad statement shouldn't void three good ones. |

### 1.9 Model Returns `evidence_completeness: "high"` for a Product with Thin Evidence

| | |
|---|---|
| **Scenario** | A product was deliberately seeded with sparse evidence (e.g., the lehenga with limited reviews), but the model claims high completeness. |
| **Risk** | The field becomes decorative. Calibration check #4 fails. User is misled about evidence quality. |
| **Handling** | Calibration catches this (target: ≥2 distinct values across 24 runs). If the model consistently over-reports, add an explicit instruction: "Products with fewer than 5 evidence items should never receive 'high' evidence_completeness." Also consider a server-side override: if `product.evidence.length < 5`, cap `evidence_completeness` at `"medium"`. |

---

## 2. Trust & Verification Block

### 2.1 Product with No Brand Authorization, No Style Code, Zero Verified Purchases

| | |
|---|---|
| **Scenario** | All three verification fields are negative/null/zero. The trust block has no affirmative items. |
| **Risk** | If only platform protection renders, it looks thin. If nothing renders, it looks like a red flag — violating the asymmetry rule. |
| **Handling** | The **platform protection floor** always renders (returnsWindow, refundProtection, exchangePolicy). These are true of every listing on Myntra. The section header stays "Buyer Protection" (not "Trust & Verification" — which would imply verification occurred). Three platform-level items is the minimum render. Never show "Limited verification data available" or similar. |

### 2.2 `verifiedPurchaseShare` Is Very Low (e.g., 0.05)

| | |
|---|---|
| **Scenario** | Only 5% of reviews are from verified purchases. Showing "5% verified purchases" could read as a warning. |
| **Risk** | Low percentage displayed as a positive item undermines confidence — the opposite of intent. Disproportionately penalizes new or small sellers. |
| **Handling** | Set a display threshold: only show verified purchase share if ≥ 50% (0.5). Below that, omit the item silently. The platform protection floor ensures the block is never empty. |

### 2.3 `styleCode` Is Present but Doesn't Match Any Known Catalogue

| | |
|---|---|
| **Scenario** | The seeded data has a `styleCode` value, but in production it might not validate against the brand's catalogue. |
| **Risk** | Showing "Style code matches brand catalogue" when it doesn't is a false affirmation. |
| **Handling** | In the MVP, all seeded data is controlled — `styleCode` is either set (and assumed valid) or `null`. For the architecture: `assembleTrustBlock()` only shows the style-code item if `styleCode !== null`. In production, this would require actual catalogue validation before setting the field. Document this in the production-path notes. |

### 2.4 Verification Data Changes After Assessment Was Generated

| | |
|---|---|
| **Scenario** | Not applicable in MVP (static seeded data), but in production: a seller's brand authorization is revoked after a trust block was rendered. |
| **Risk** | Stale trust information. |
| **Handling** | Trust block is assembled fresh on every `/api/assess` call — it reads from `product.verification` at request time, never from a cache. In production, this means it reflects the current state. In MVP, this is inherently consistent (static data). |

---

## 3. Cost Per Wear

### 3.1 User Sets Slider to 1 Wear

| | |
|---|---|
| **Scenario** | Expected wears = 1. Cost per wear = full price. |
| **Risk** | Showing "₹8,999 per wear" for the lehenga is honest but might feel like the tool is discouraging the purchase. |
| **Handling** | Display it honestly. The tool never labels a cost per wear as "high" or "bad." The mechanic is "Would this feel worth it at ₹8,999 per wear?" — let the user decide. The reference band ("Wedding wear is typically worn 2–6 times") provides context without judgment. |

### 3.2 User Sets Slider to 30+ (Maximum)

| | |
|---|---|
| **Scenario** | Expected wears ≥ 30. Cost per wear becomes very low for most items. |
| **Risk** | Everything looks like a great deal. Tool loses diagnostic power. |
| **Handling** | Cap display at 30+. Show the cost per wear at the selected value. The reference band for the occasion provides a reality check (e.g., "Date outfits are typically worn 5–15 times" while the slider is at 30). Don't force the slider back — trust the user's self-report. |

### 3.3 Product Price Is Zero or Negative (Data Error)

| | |
|---|---|
| **Scenario** | `product.price` is 0, negative, or undefined due to a seeding error. |
| **Risk** | Division: 0 ÷ N = 0. Or NaN. Display breaks. |
| **Handling** | Validate product data on import. `calculateCostPerWear` uses `Math.max(expectedWears, 1)` for the divisor — also add `Math.max(price, 0)` for the numerator. If price is 0, show "Price unavailable" instead of the calculator. This should never happen with seeded data but guards against data corruption. |

### 3.4 Screen 3 Slider Value Differs from Screen 2

| | |
|---|---|
| **Scenario** | User set 20 wears on Screen 2, but adjusts the Screen 3 slider to 5 wears. The assessment was generated with 20 wears context. |
| **Risk** | Mismatch between the assessment context and the displayed cost per wear. |
| **Handling** | This is by design. The Screen 3 slider is an **explorer** — it lets the user test scenarios without regenerating the AI assessment. The assessment text may reference "at your expected 20 wears" while the slider shows ₹ at 5 wears. This is not a bug. The assessment is about suitability; the slider is about arithmetic. They are intentionally decoupled. |

### 3.5 `originalPrice` Is Lower Than `price` (Data Error)

| | |
|---|---|
| **Scenario** | Seeded data has `originalPrice: 1999` and `price: 2499` — the "discount" is actually a price increase. |
| **Risk** | Discount badge shows a negative discount percentage. Confusing UI. |
| **Handling** | Only show discount badge if `originalPrice > price`. If `originalPrice <= price` or `originalPrice` is undefined, don't render the discount. Validate seeded data at build time. |

---

## 4. User Input & Form State

### 4.1 User Submits Context Without Selecting an Occasion

| | |
|---|---|
| **Scenario** | User skips the occasion picker and taps "Generate my Match Check." |
| **Risk** | API call with `occasion: undefined`. Reference band missing. Assessment quality degrades. |
| **Handling** | CTA is disabled until all required fields are complete. Occasion is required. Show a subtle prompt: the OccasionPicker border glows red briefly if the user taps the disabled CTA. |

### 4.2 User Navigates Directly to `/check/invalid-id`

| | |
|---|---|
| **Scenario** | User manually types a URL with a product ID that doesn't exist in seeded data. |
| **Risk** | `product` is undefined. Every downstream reference crashes. |
| **Handling** | In the page component, look up the product by ID. If not found, render a "Product not found" message with a "Back to wishlist" link. Never call the API with invalid data. |

### 4.3 User Navigates Directly to `/check/prod_dress_01/result` Without a `checkId`

| | |
|---|---|
| **Scenario** | User bookmarks or deep-links to the result page without going through the context flow. |
| **Risk** | No assessment data to render. Blank page. |
| **Handling** | If `checkId` is missing from the URL search params, redirect to `/check/{productId}` (the context form). Show a brief message: "Let's set up your Match Check first." |

### 4.4 User Navigates to `/decision/invalid-checkId`

| | |
|---|---|
| **Scenario** | Check ID doesn't exist in the store (expired, never created, or server restarted in dev). |
| **Risk** | Blank decision page. No product context. |
| **Handling** | Fetch check from store. If not found, redirect to wishlist with a message: "That check has expired. Start a new one from your wishlist." |

### 4.5 User Rapidly Taps "Generate my Match Check" Multiple Times

| | |
|---|---|
| **Scenario** | Double/triple tap sends multiple POST requests to `/api/assess`. |
| **Risk** | Multiple checks created. Multiple API calls (wastes quota). Race conditions on navigation. |
| **Handling** | Disable the CTA immediately on first tap. Show loading spinner. Use a `useRef` flag to prevent duplicate submissions. Only the first request proceeds. |

### 4.6 User Switches Occasion After Setting Expected Wears

| | |
|---|---|
| **Scenario** | User selects "Wedding" → sets slider to 4 → then changes occasion to "Everyday." The reference band says "20–50+ times" but the slider is at 4. |
| **Risk** | Disconnect between reference band and slider value. Cost per wear is technically correct but contextually misleading. |
| **Handling** | When occasion changes, reset the slider to the midpoint of the new reference band. Show a brief flash/animation on the slider to draw attention to the reset. The user can re-adjust. |

### 4.7 User Selects "Will it fit?" Then Changes Hesitation to Something Else

| | |
|---|---|
| **Scenario** | Fit questions are shown and partially filled. User then selects a different hesitation. |
| **Risk** | `usualSize` and `priorFitIssue` retain values and get sent to the API even though the user's hesitation is no longer fit-related. |
| **Handling** | Clear `usualSize` and `priorFitIssue` when hesitation changes away from "will_it_fit." Animate the fit questions sliding out. Don't send fit data in the API request if hesitation ≠ "will_it_fit." |

---

## 5. Inner Circle — Share & Vote

### 5.1 Share Link Opened After 24-Hour Expiry

| | |
|---|---|
| **Scenario** | Friend opens the share link 25 hours after it was created. |
| **Risk** | Voting on expired data. Stale product context. |
| **Handling** | Server checks `expiresAt` on every share fetch. If expired, return `{ expired: true }`. Voting page shows: "This link has expired. Ask your friend to share a new one." No voting form rendered. No product data leaked (minimal info in the expiry message). |

### 5.2 Friend Tries to Vote Twice on the Same Share

| | |
|---|---|
| **Scenario** | Friend opens the link, votes, then refreshes and tries to vote again. |
| **Risk** | Duplicate votes skew the results. |
| **Handling** | Store a vote marker in the friend's `localStorage` keyed by share token. On page load, check if already voted. If so, show the "Thank you" state directly. Server-side: also check for duplicate `voteId` (optional — localStorage is sufficient for MVP since there's no login anyway). |

### 5.3 Zero Votes Received

| | |
|---|---|
| **Scenario** | Owner shares the link, waits, but no friend votes. Owner views the results page. |
| **Risk** | Empty results look broken. |
| **Handling** | Show a waiting state: "Waiting for responses… Share the link so your friends can weigh in." Display the share actions again so the owner can re-share. Show a subtle animation (pulsing dots or similar) to indicate waiting, not failure. |

### 5.4 Many Votes Arrive Rapidly

| | |
|---|---|
| **Scenario** | 10+ friends vote within seconds (e.g., link shared in a group chat). |
| **Risk** | Polling at 5s intervals means up to 5s latency between vote and display. Also, if stored in-memory Map, concurrent writes could conflict (JS is single-threaded so this is fine for Node, but worth noting). |
| **Handling** | 5s polling interval is acceptable for MVP. Each poll returns the full vote list — idempotent by design. For the count-up animation, batch new votes since last render. In production, WebSocket/SSE would replace polling. |

### 5.5 Share Token Collision

| | |
|---|---|
| **Scenario** | Two `nanoid(12)` generations produce the same token. |
| **Risk** | One share overwrites another. Votes go to wrong check. |
| **Handling** | Statistically negligible with 12-char nanoid (~3.5 × 10²¹ possibilities). But for defense: before storing, check if token exists in `sharesStore`. If collision, regenerate. Max 3 retries, then fail with error. |

### 5.6 Owner Navigates Away and Returns After Server Restart (Dev)

| | |
|---|---|
| **Scenario** | In development, the dev server restarts (code change, crash). The in-memory store is wiped. Owner returns to `/share/{token}?owner=true`. |
| **Risk** | Share not found. Blank page. All votes lost. |
| **Handling** | Treat as expired: "This share is no longer available. Start a new check from your wishlist." In production with Vercel KV, this doesn't happen (Redis persists across deploys). Document this as a known dev-only limitation. |

### 5.7 WhatsApp Deep Link on Desktop Browser

| | |
|---|---|
| **Scenario** | User is testing on desktop. WhatsApp deep link (`wa.me`) opens WhatsApp Web or nothing. |
| **Risk** | Broken share flow in desktop testing. |
| **Handling** | `wa.me` links work on WhatsApp Web if the user is logged in. If not, WhatsApp prompts them to log in. The "Copy link" and "Native share" buttons serve as fallbacks. Prioritize copy link button visually as the universal option. |

### 5.8 Web Share API Not Supported

| | |
|---|---|
| **Scenario** | Browser doesn't support `navigator.share()` (older desktop browsers). |
| **Risk** | Native share button crashes or does nothing. |
| **Handling** | Feature-detect `navigator.share`. If unsupported, hide the native share button entirely. WhatsApp deep link + copy link are always available. |

### 5.9 Friend Opens Link on Very Old Browser

| | |
|---|---|
| **Scenario** | Share link opened in an old WebView, outdated Android browser, or IE. |
| **Risk** | Next.js JS bundle fails. Page is blank. |
| **Handling** | The voting page is a simple form — add a `<noscript>` fallback: "Please use a modern browser to vote." Keep the voting page as lightweight as possible (minimal JS). Consider Server Components for the voting page to reduce client bundle. |

---

## 6. Progress State & Local Storage

### 6.1 `localStorage` Not Available

| | |
|---|---|
| **Scenario** | Browser is in private/incognito mode with localStorage disabled, or storage quota is full. |
| **Risk** | `getSessionId()` crashes. Progress bar can't persist. Checked/resolved state is lost. |
| **Handling** | Wrap all `localStorage` access in try/catch. Fall back to in-memory state (session-only — lost on refresh). Progress bar shows "0 of 6 checked · 0 resolved" on every visit. Functional but stateless. Generate `anonymousUserId` fresh each session. |

### 6.2 User Clears Browser Data Mid-Session

| | |
|---|---|
| **Scenario** | User clears cookies/storage while using the app, then navigates back. |
| **Risk** | Progress resets to zero. Previously checked products appear unchecked. Session ID changes, breaking event continuity. |
| **Handling** | Accept gracefully. Progress resets. The app is functional from any state. Checks are stored server-side (in-memory/KV), so if the user still has a checkId URL, the result page will still work — but the progress bar won't reflect it. |

### 6.3 User Removes All Products from Wishlist

| | |
|---|---|
| **Scenario** | User selects "Not right for me — remove" for all 6 products. |
| **Risk** | Empty wishlist. No products to interact with. Dead-end screen. |
| **Handling** | Show an empty state: "You've reviewed all your saved items! 🎉" with a summary: "6 of 6 checked · X resolved." Optionally: a "Reset wishlist" button that clears localStorage and restores all products (useful for demo/testing). |

### 6.4 `anonymousUserId` Collision Across Users

| | |
|---|---|
| **Scenario** | Two users independently generate the same UUID v4. |
| **Risk** | Events are attributed to the wrong session. Progress data could theoretically conflict (but localStorage is per-device, so this doesn't affect the UI). |
| **Handling** | UUID v4 collision probability is effectively zero (1 in 5.3 × 10³⁶). No action needed. Server-side events are keyed by sessionId but are fire-and-forget — no cross-session logic depends on uniqueness. |

---

## 7. Mobile & Browser

### 7.1 Very Small Screen (< 320px Width)

| | |
|---|---|
| **Scenario** | Galaxy Fold inner screen in folded mode, or very old small-screen phones. |
| **Risk** | Text overflows. Buttons are too small. Layout breaks. |
| **Handling** | Set `min-width: 320px` on the app container. Below that, allow horizontal scroll (rare edge case). Test on 360px as the practical minimum. Use relative units (rem, %) over fixed px where possible. |

### 7.2 Landscape Orientation on Phone

| | |
|---|---|
| **Scenario** | User rotates phone to landscape while using the app. |
| **Risk** | Layout designed for portrait. Content may look awkwardly stretched or leave large whitespace. |
| **Handling** | `max-width: 430px` container is centered — works naturally in landscape. The content area stays phone-width, centered in the landscape viewport. Optionally add `orientation: landscape` media query to slightly increase padding. Not a priority for MVP. |

### 7.3 iOS Safe Area (Notch, Dynamic Island, Home Indicator)

| | |
|---|---|
| **Scenario** | iPhone with notch or Dynamic Island. Bottom home indicator overlaps fixed CTAs. |
| **Risk** | Content hidden behind the notch. Bottom CTA unreachable. |
| **Handling** | Add `viewport-fit=cover` to the viewport meta tag. Use `env(safe-area-inset-top)` for top padding and `env(safe-area-inset-bottom)` for bottom CTAs/padding. Test with iPhone 14 Pro simulator. |

### 7.4 User Has "Reduce Motion" Accessibility Setting

| | |
|---|---|
| **Scenario** | OS-level setting to reduce animations. |
| **Risk** | Animations cause discomfort. Accessibility violation. |
| **Handling** | Respect `prefers-reduced-motion` media query. When active: disable staggered card animations, slider glow, CTA pulse, and page transitions. Keep functional state changes (drawer open/close) but make them instant rather than animated. |

### 7.5 User Has Large Font / Accessibility Font Size

| | |
|---|---|
| **Scenario** | OS font scaling set to 150% or 200%. |
| **Risk** | Text overflows containers. Buttons become too tall. Layout shifts break alignment. |
| **Handling** | Use `rem` units throughout (relative to root font size, which scales with OS settings). Set container heights to `auto` or `min-height` instead of fixed `height`. Test at 200% font scale. Ensure all text is readable and no content is clipped. |

### 7.6 Offline / Intermittent Connection

| | |
|---|---|
| **Scenario** | Phone loses connectivity during the flow. |
| **Risk** | API calls fail (assess, shares, votes). Events don't send. Page navigation may break. |
| **Handling** | **Wishlist (Screen 1):** Works offline (static data). **Context submit:** Show "Connection lost. Please try again." instead of the loading spinner. Don't serve fallback here — the user hasn't waited long enough to expect a result. **Voting page:** Show "Couldn't submit your vote. Check your connection and try again." with a retry button. **Events:** `sendBeacon` fails silently — acceptable. Events are non-critical. |

### 7.7 Extremely Slow Connection (2G/3G)

| | |
|---|---|
| **Scenario** | API calls take 5–10 seconds. Images load very slowly. |
| **Risk** | User abandons. Loading states feel broken. |
| **Handling** | Product images: use `loading="lazy"` and small WebP files (<100KB). Show skeleton/placeholder while loading. Assessment: the 3s timeout triggers fallback — this is a feature, not a bug. The user gets a result fast, even if it's cached. Loading spinner shows progress messages ("Analyzing reviews…") to indicate work is happening. |

---

## 8. Assessment Content

### 8.1 Assessment Consideration Applies to Every Product Identically

| | |
|---|---|
| **Scenario** | "If you are between sizes, consider sizing up" appears in 20 of 24 calibration runs. |
| **Risk** | Boilerplate. Looks like the tool isn't actually reading evidence. Undermines trust. |
| **Handling** | Calibration check #3 catches this (target: no phrase >50%). Fix: add anti-boilerplate instruction to system prompt. "Do not use generic sizing or care hedges. Every consideration must cite specific evidence from this product." Lower temperature. Move product evidence earlier in the prompt. |

### 8.2 Assessment References a Review That Feels Like One Person's Opinion

| | |
|---|---|
| **Scenario** | "Reviewers report this runs small" — based on a single review. |
| **Risk** | Elevates one opinion to established fact. Misleads the user. |
| **Handling** | Seller-protection rule #6: "Treat isolated reviews as individual reports, not established fact." The system prompt enforces: "One reviewer mentioned…" not "Reviewers report…" Evidence drawer shows the source: "Based on 1 verified purchase review." The user can judge weight. |

### 8.3 Contradictory Evidence

| | |
|---|---|
| **Scenario** | Two reviews: one says "fits perfectly in M", another says "too tight in M, exchange for L." |
| **Risk** | Model resolves the contradiction by picking a side → misleading. Or model ignores one → incomplete. |
| **Handling** | Seller-protection rule #7: "Name contradictory evidence explicitly rather than resolving it." Expected output: "Reviews disagree on M sizing — one reports a perfect fit, another found it too tight." Evidence drawer shows both reviews. Let the user weigh the evidence. |

### 8.4 Product Has Zero Reviews

| | |
|---|---|
| **Scenario** | A seeded product has no review-type evidence items. Only product attributes and size chart. |
| **Risk** | Assessment has very thin basis. Model may hallucinate review references. |
| **Handling** | `evidence_completeness` should be `"low"`. The "What remains unclear" section should explicitly state: "No review data available for this product." Model must not invent reviews. Evidence guard catches fabricated evidence IDs. The trust block still renders (platform protection floor). |

### 8.5 User's Hesitation Doesn't Match Product's Natural Doubt

| | |
|---|---|
| **Scenario** | User selects "Can I trust this listing?" for the everyday trousers (which have strong verification data and no trust issues). |
| **Risk** | Trust block shows strong verification — but the user's stated doubt is trust. The assessment might force a trust-related consideration where none exists. |
| **Handling** | The trust block is data-driven — it shows what's true regardless of hesitation. The assessment addresses the user's hesitation honestly: if trust evidence is strong, it says so. "Based on available verification data, this listing is from a brand-authorised seller with 92% verified purchase reviews." If there's nothing to worry about, the assessment shouldn't manufacture concern. An empty `considerations` array is the correct output here. |

---

## 9. Share Card Content

### 9.1 Assessment Has No Considerations to Show on the Share Card

| | |
|---|---|
| **Scenario** | Screen 5 share card includes "one consideration" — but `considerations` array is empty. |
| **Risk** | Share card has a blank consideration field. Looks broken. |
| **Handling** | If no considerations, omit the consideration line from the share card. Show: product image + price, occasion + cost per wear, and the shopper's question. The consideration field is optional on the share card. |

### 9.2 Shopper's Question Is Very Long

| | |
|---|---|
| **Scenario** | User types a 500-character custom question in the Inner Circle prompt. |
| **Risk** | Share card layout breaks. WhatsApp message becomes too long. |
| **Handling** | Cap the question input at 200 characters. Show remaining character count. Truncate with "…" in the share card if somehow exceeded. WhatsApp messages have no practical length limit, but keep the deep link text concise. |

### 9.3 Product Image Fails to Load on the Share Card (Friend's Browser)

| | |
|---|---|
| **Scenario** | Image URL is broken or blocked by the friend's network. |
| **Risk** | Share card without a product image looks unprofessional. |
| **Handling** | Use `<img>` with an `alt` text (product name). CSS: set a background color on the image container so it doesn't collapse to zero height. Show a placeholder icon (shirt silhouette, generic fashion icon) via CSS `:before` or `onerror` handler. |

---

## 10. Event Tracking

### 10.1 `navigator.sendBeacon` Not Supported

| | |
|---|---|
| **Scenario** | Very old browsers don't support `sendBeacon`. |
| **Risk** | All analytics silently fail. |
| **Handling** | Feature-detect `sendBeacon`. Fall back to `fetch()` with `keepalive: true`. If neither is available, log to console only. Events are non-critical — they must never block the user experience. |

### 10.2 Events API Route Crashes

| | |
|---|---|
| **Scenario** | `/api/events` throws an unhandled exception. |
| **Risk** | If events are sent via `fetch` (not `sendBeacon`), the error could surface. |
| **Handling** | Events route must always return `{ ok: true }` — wrap entire handler in try/catch. Log errors server-side, never propagate to client. `sendBeacon` doesn't surface response errors anyway, but the route should still be safe. |

### 10.3 `trust_block_viewed` Fires Multiple Times

| | |
|---|---|
| **Scenario** | User scrolls past the trust block, scrolls up, scrolls back down. Intersection Observer fires repeatedly. |
| **Risk** | Inflated view counts. |
| **Handling** | Use `{ once: true }` option on the Intersection Observer, or maintain a `useRef` flag that prevents re-firing. Track only the first view. |

---

## 11. Data Integrity

### 11.1 Seeded Product Data Missing Required Fields

| | |
|---|---|
| **Scenario** | A product object is missing `evidence`, `verification`, or `referenceWearBand` due to a typo or incomplete seeding. |
| **Risk** | Runtime crash when accessing nested properties. Trust block fails. Cost per wear fails. |
| **Handling** | Add a build-time validation script (or TypeScript strict mode) that checks every product has all required fields. TypeScript interfaces catch most of this at compile time. Add a runtime guard in `products.ts`: `products.forEach(p => assert(p.evidence.length > 0))`. |

### 11.2 Evidence ID Duplicates Within a Product

| | |
|---|---|
| **Scenario** | Two evidence items in the same product have the same `id`. |
| **Risk** | Evidence drawer shows the wrong evidence for a statement. Evidence guard may pass when it shouldn't (or vice versa). |
| **Handling** | Add a build-time check: `new Set(product.evidence.map(e => e.id)).size === product.evidence.length`. Fail the build if duplicates exist. |

### 11.3 Evidence ID Format Inconsistency

| | |
|---|---|
| **Scenario** | Some IDs use `ev_dress_01_r1`, others use `ev-dress-01-r1` or `dress01_review1`. The model generates IDs using the wrong format. |
| **Risk** | Evidence guard rejects valid IDs due to format mismatch. |
| **Handling** | Enforce a single ID convention in seeded data: `ev_{productShortId}_{type}{number}`. The evidence guard does exact string matching — no fuzzy matching. Consistency in seed data is the prevention. |

---

## 12. Navigation & URL Edge Cases

### 12.1 User Hits Browser Back Button on Match Check Result

| | |
|---|---|
| **Scenario** | User is on Screen 3 (result), hits browser back. They land on Screen 2 (context form) which re-submits to the API. |
| **Risk** | Duplicate assessment generated. Wasted API call. New checkId — old one orphaned. |
| **Handling** | Use `router.replace()` instead of `router.push()` when navigating from context to result. This replaces the history entry so back goes to the wishlist, not the form. Alternatively, if the form is shown again, pre-fill it with previous values and don't auto-submit. |

### 12.2 User Opens Multiple Products in New Tabs

| | |
|---|---|
| **Scenario** | User right-clicks "Check if it's right for me" on three products and opens each in a new tab. |
| **Risk** | Each tab operates independently. Progress bar in each tab is stale (reads localStorage on mount, doesn't sync). |
| **Handling** | Acceptable for MVP. Each tab works independently. When the user returns to the wishlist tab and refreshes, all progress is reflected. For real-time sync: use `window.addEventListener('storage')` to listen for cross-tab localStorage changes — low priority for MVP. |

### 12.3 User Refreshes the Page During Loading

| | |
|---|---|
| **Scenario** | While the loading spinner is showing (AI assessment in progress), user refreshes the page. |
| **Risk** | API call is abandoned. The context form is shown again. Previous call may still complete server-side. |
| **Handling** | Form is re-rendered with default values (not pre-filled — no client-side cache of form state). User re-submits. The previous server-side call may write a check to the store, but it's orphaned — that's acceptable (24h TTL auto-cleans). |

---

## 13. Deployment & Environment

### 13.1 Vercel Cold Start on First Request

| | |
|---|---|
| **Scenario** | Serverless function hasn't been invoked recently. First `/api/assess` call takes extra time due to cold start. |
| **Risk** | Cold start (200–500ms) + Gemini API call (1–3s) could exceed the 3s timeout. |
| **Handling** | The 3s timeout should be measured from Gemini API call start, not from function invocation start. Initialize the Gemini client at module level (outside the handler) so it persists across warm invocations. If cold start + API exceeds 3s, fallback triggers — acceptable. |

### 13.2 In-Memory Store Lost on Vercel Redeployment

| | |
|---|---|
| **Scenario** | New deployment clears the in-memory store. All active shares and votes are lost. |
| **Risk** | Active share links break. Owner polls return empty. |
| **Handling** | Acceptable for prototype. Document as known limitation. For demo day: avoid redeploying while share links are active. Production fix: use Vercel KV (already in the architecture). |

### 13.3 `NEXT_PUBLIC_BASE_URL` Mismatch

| | |
|---|---|
| **Scenario** | `NEXT_PUBLIC_BASE_URL` is set to `http://localhost:3000` in production, or to the wrong Vercel URL. |
| **Risk** | Share links point to wrong URL. Friends can't vote. |
| **Handling** | In `buildShareUrl()`, fall back to `window.location.origin` if `NEXT_PUBLIC_BASE_URL` is not set. In production, always set it to the actual Vercel URL. Add a build-time warning if the env var contains "localhost" in production mode. |

---

## 14. Stitch AI Integration

### 14.1 Stitch AI Component Missing Expected Props

| | |
|---|---|
| **Scenario** | A Stitch AI-generated component (e.g., `WearSlider`) doesn't expose the `onChange` callback or `value` prop that the backend integration expects. |
| **Risk** | Integration breaks. Data can't flow from UI to API calls. |
| **Handling** | During integration (Track C), audit every Stitch AI component against the prop contracts defined in the implementation plan. If a prop is missing, add it manually. If the component structure is significantly different, create a thin wrapper component that adapts the Stitch AI component to the expected interface. |

### 14.2 Stitch AI Generates Hardcoded Data Instead of Prop-Driven Rendering

| | |
|---|---|
| **Scenario** | Stitch AI components render hardcoded product names, prices, or assessment text instead of accepting them as props. |
| **Risk** | Every product shows the same data. The app looks like a static mockup, not a functioning prototype. |
| **Handling** | Replace hardcoded values with prop references during integration. Search for literal strings matching seed data in the generated components and replace with `{props.productName}` etc. This is expected — Stitch AI works from visual designs, not data contracts. |

### 14.3 Stitch AI Uses Incompatible Styling Approach

| | |
|---|---|
| **Scenario** | Stitch AI generates inline styles, Tailwind classes, styled-components, or a different CSS approach than CSS Modules. |
| **Risk** | Style conflicts. Design tokens from `globals.css` not applied. Inconsistent look across screens. |
| **Handling** | Accept whatever styling approach Stitch AI uses — don't force a migration. Ensure `globals.css` design tokens (colors, fonts, spacing) are referenced by updating the generated CSS to use `var(--color-*)` tokens where possible. If Stitch AI uses Tailwind, keep it — configure Tailwind to use the project's color palette. Consistency matters more than methodology. |

### 14.4 Stitch AI Component File Structure Doesn't Match Architecture

| | |
|---|---|
| **Scenario** | Stitch AI exports components in a flat structure (`/components/Button.tsx`) instead of the nested structure (`/components/ui/Button.tsx`) defined in the architecture. |
| **Risk** | Import paths throughout the codebase break. Architecture diagrams no longer match reality. |
| **Handling** | Adapt the import paths to match whatever Stitch AI generated. Don't reorganize files unless it causes actual conflicts. Update the architecture doc's project structure to reflect reality. The folder structure is a convention, not a contract — the component behaviour matters more. |

### 14.5 Stitch AI Generates Extra or Missing Screens

| | |
|---|---|
| **Scenario** | Stitch AI generates screens that don't exist in the spec (e.g., a splash screen, settings page) or misses a screen (e.g., no voting page). |
| **Risk** | Missing screens block the demo flow. Extra screens add confusion. |
| **Handling** | **Missing screens:** Build them manually during integration, using the Stitch AI design language for visual consistency. **Extra screens:** Keep them if they add value (e.g., a splash screen). Remove them if they add navigation complexity that hurts the demo flow. Verify all 6 spec screens exist before proceeding to backend wiring. |

---

## Summary Matrix

| Category | Total Cases | Critical | Must-Fix for Demo |
|---|---|---|---|
| AI Assessment | 9 | §1.1, §1.4, §1.6 | §1.1, §1.2, §1.6 |
| Trust Block | 4 | §2.1 | §2.1, §2.2 |
| Cost Per Wear | 5 | §3.3 | §3.3 |
| User Input & Form | 7 | §4.2, §4.5 | §4.1, §4.2, §4.5 |
| Inner Circle | 9 | §5.1, §5.6 | §5.1, §5.3, §5.8 |
| Progress & Storage | 4 | §6.1 | §6.1, §6.3 |
| Mobile & Browser | 7 | §7.3, §7.6 | §7.3, §7.4, §7.6 |
| Assessment Content | 5 | §8.1, §8.3 | §8.1 |
| Share Card | 3 | — | §9.1 |
| Event Tracking | 3 | — | §10.2 |
| Data Integrity | 3 | §11.1 | §11.1, §11.2 |
| Navigation & URL | 3 | — | §12.1 |
| Deployment | 3 | §13.3 | §13.2, §13.3 |
| Stitch AI Integration | 5 | §14.1, §14.2 | §14.1, §14.2, §14.5 |

**Total edge cases documented: 69**
**Critical for demo: 25**

