# Myntra Match Check — Build Specification v2

**Status:** deployed and publicly reachable at `https://myntra-match-check-rho.vercel.app/`
**Deadline:** 5 September, 3:59:00 PM IST. Submit by 1:00 PM.
**This document supersedes v1.** It is the single source of truth for the build.

> **Do not rebuild on another platform.** Every defect in section 5 is a prompt
> or component problem that reproduces identically on Lovable, v0 or anywhere
> else. Keep the current deployment live throughout.

---

## 0. Work queue

Ordered. Do not reorder — each tier closes a gap between what the deck claims
and what the MVP demonstrates.

| # | Work | Section | Why it matters |
|---|---|---|---|
| 1 | Six P0 remediation items | §5 | The result screen currently does not demonstrate the core argument |
| 2 | Inner Circle, end to end | §6 | One of three modules; currently the biggest spec-to-build gap |
| 3 | Run calibration for real | §9 | Produces a measured claim for the risks slide |
| 4 | Completion screen | §7 | The session framing; the differentiating demo moment |
| 5 | P1 items | §5 | Evidence drawer, nav, progress state, naming |
| 6 | 3–5 real users through the flow | §13 | A line no design polish substitutes for |
| 7 | P2 items | §5 | Brand naming, discount framing |

---

## 1. Why this exists

### Business metric

30-day wishlist-to-purchase conversion: the percentage of users who purchase at
least one item within 30 days of wishlisting it.

### Problem statement

Deliberate Gen Z and millennial shoppers save fashion items because they are
interested but not yet confident. When they reconsider a saved item, they leave
Myntra to resolve the doubt — searching the style code to check the item is
genuine, cross-checking price on other marketplaces, trying it on in a store, or
asking friends on WhatsApp. Because the evidence and the social validation both
live outside Myntra, the decision is postponed indefinitely and wishlist intent
decays.

**The wishlist stores the item but resolves nothing.**

### Research basis

- **AI discovery engine:** 6,985 units from Play Store and YouTube, gated to 910 wishlist-relevant, filtered to N=516 high-confidence. Top frictions: value_comparison (#1, 257 units, 54.5% decomposing to value-confidence rather than pure price), fit_size (#2, 120 units), authenticity_trust (#3, 99 units).
- **Secondary research:** Fashion returns run 25–40% against a ~17% category average; fit and sizing drive 53–77% of fashion returns; ~43% abandon carts due to fit uncertainty. 31% of Indian consumers encountered counterfeit apparel in the last 12 months; online platforms account for ~53% of counterfeit purchases. Bain: Gen Z is 40–45% of India's e-retail and shops 5+ platforms annually.
- **Primary research:** Every interviewee left Myntra to resolve their doubt. One described a large discount pushing him into research mode rather than checkout. Two described the wishlist tool itself failing, unprompted.
- **Trend grounding:** 88% of Gen Z social media users report having been "de-influenced" (Credit Karma). Customer reviews are the most trusted information source for 72% of Gen Z; influencer content ranks seventh at 55% (Walr, March 2026). Deloitte 2026: 60%+ of Indian Gen Z and millennials focused on deliberate spending (806 India respondents). KPMG India: 63% of Gen Z rank social commerce as important.

### Design consequence

This segment already seeks out reasons *not* to buy and trusts evidence over
recommendation. The product does not persuade. It gives an honest,
evidence-referenced assessment of whether a specific item suits a specific
person's stated use — inside the app, so the trip elsewhere becomes unnecessary.

### Target segment

Deliberate wishlist users, roughly 18–34, who use the wishlist as a
decision-holding area, compare before buying, care about value rather than
discount depth, consult friends or reviews, have a specific use case in mind,
and revisit saved items while staying undecided. **Behavioural, not
demographic.**

### Core hypothesis

If deliberate savers can assess personal suitability, verify the listing is
genuine, see realistic cost per wear, and get trusted friend validation from one
surface inside Myntra, more will resolve their hesitation and suitable items
will convert within 30 days.

---

## 2. Hard constraint: marketplace neutrality

Myntra is two-sided. Sellers are customers. The product must never devalue a
listing.

**Every assessment is about the match between the item and this user's stated
use — never about the item's absolute worth.**

- "This shirt has quality problems" — forbidden.
- "If low-maintenance matters to you, note this is dry-clean only" — correct.

### The asymmetry rule (governs the trust module)

Verification is **affirmable but never allegeable.**

- Showing brand-authorised status, verified-purchase share, and a matching style code — always allowed.
- Suggesting, implying or hedging that a listing may not be genuine — never allowed, in any phrasing.
- **A thin trust block must never imply suspicion.** Where verification data is sparse, show platform-level protection (returns window, refund guarantee, exchange policy), true of every listing. Never render an empty, hedged or "limited data" trust state — absence reads as a red flag and differentially penalises small sellers.

### Corollary: no item-level scoring

No numeric score, grade, star-verdict, or overall adjective may describe an item
as a whole. A platform publishing a per-item score is publishing a seller
ranking. See P0-1.

---

## 3. What we are building

Four modules, each closing one documented off-app exit:

| Off-app exit found in research | Module |
|---|---|
| Searching the style code to check the item is genuine | **Trust & Verification** |
| Cross-checking price on other marketplaces | **Cost per wear** |
| In-store try-on; "will this actually work for me" | **Match Check** |
| Screenshotting to WhatsApp for a friend's verdict | **Inner Circle** |

Covers all three top frictions from the discovery engine: value_comparison,
fit_size, authenticity_trust.

---

## 4. Screens

### Screen 1 — Wishlist

Six seeded items, mobile-first, no login.

Each card: image, brand, name, price, rating, "Saved N days ago", primary CTA
**Check if it's right for me**.

**Persistent header strip:** `Illustrative product and review data — built for
prototype testing.` Non-negotiable, on every screen.

**Progress state:** `2 of 6 checked · 1 resolved` with a slim progress bar. See
P1-3.

### Screen 2 — Context ("What do you need this for?")

Three questions, plus one conditional.

**Occasion:** Everyday / College / Work / Date / Wedding or event / Travel

**Expected usage:** "Honestly, how many times can you see yourself wearing it?"
Live slider, 1 to 30+, with an honest reference band derived from occasion type
(e.g. `Wedding and occasion wear is typically worn 2–6 times.`), labelled as a
general reference, not a prediction about this user.

Cost per wear updates live: `₹1,899 ÷ 10 wears = ₹190 per wear`

**Main hesitation:** bare labels only, no descriptive sub-text (see P0-5):
Is it worth the price? / Will it fit? / Can I trust this listing? / Will I
actually wear it? / Is it right for the occasion?

**Conditional (only if hesitation = fit):** "What size do you usually take in
this category?" and "Have you had fit problems in this category before?"

### Screen 3 — Match Check result

**Required section order. All six must render.**

```
1. Context line          Checked for: Wedding Gala · 4 expected wears
2. Trust & Verification
3. Why it could work for you
4. Things to consider
5. What remains unclear
6. Cost per wear
7. Hesitation check
```

Sections 3 and 4 must be visually identical in type size, weight, background and
spacing. Only the icon differs. See P0-2.

Every statement in sections 3 and 4 carries a **"Why am I seeing this?"** link
opening the evidence drawer (P1-2).

### Screen 4 — Decision checkpoint

**"Has your main doubt been resolved?"** → Yes / Partly / No

Then: **Buy this** / **Ask my Inner Circle** / **Keep for later** /
**Not right for me — remove**

### Screen 5 — Inner Circle share

See §6.

### Screen 6 — Friend voting page

See §6.

### Screen 7 — Responses view

See §6.

### Screen 8 — Completion

See §7.

---

## 5. Remediation — defects in the deployed build

Estimated ~2h for P0, ~1h for P1.

### P0-1. Remove the numeric match score and "Strong Match" verdict

**Where:** result screen, ring showing `86` / `Strong Match`.

**Why:** a per-item numeric score is exactly the opaque AI recommendation this
product was designed not to be. On a two-sided marketplace it is an item-level
ranking signal — a listing scoring 42 has been publicly rated by the platform.
It is the most quotable element on the screen and directly contradicts the
seller-neutrality claim in the deck.

**Change to:** delete the ring and verdict. Replace with a quiet context line:

```
Checked for: Wedding Gala · 4 expected wears
```

**Acceptance:** no number, grade, score, badge or adjective describes the item as
a whole, anywhere in the app.

### P0-2. Restore "Things to consider" and "What remains unclear"

**Where:** result screen. Currently shows only "Why it works", with the lower
half of the screen empty.

**Why:** this is the product. The whole argument is that positives and
considerations appear at equal weight, which is what makes the positives
believable. The deployed app currently demonstrates none of it. Highest-value
fix in the build.

**"Things to consider"** — up to three items, identical type size, weight,
background and icon treatment to "Why it could work for you". Only the icon
differs (neutral circle-outline, not a warning triangle). Each phrased
conditionally:

```
If low-maintenance matters to you, note this is dry clean only.
If you are between sizes, a reviewer reports this style runs narrow.
At 4 expected wears, this comes to ₹2,250 per wear.
```

If the model returns an empty considerations array, render nothing for the
section. An empty section is a valid, expected outcome — never fill it.

**"What remains unclear"** — up to two items, muted grey, question-mark icon:

```
There isn't consistent evidence about how the fabric performs after repeated wear.
Available reviews don't clearly address long-term durability.
```

**Acceptance:** screenshot the result screen and desaturate it. "Why it could
work for you" and "Things to consider" must be indistinguishable in visual
weight. If one reads as reassurance and the other as warning, it has failed.

Also rename "Why it works" → **"Why it could work for you"**. The current
phrasing asserts; the required phrasing is conditional on this user.

### P0-3. Delete the "GREAT VALUE" badge

**Where:** cost-per-wear module.

**Why:** the spec states a cost-per-wear amount is never labelled good or bad.
The user supplied the wear count, so the badge is the app congratulating the
user on their own input and using it as persuasion. It converts a reflection
tool into a nudge and undercuts the de-influencing narrative the deck rests on.

**Change to:** delete. No replacement. The number stands alone; the hesitation
question does the work.

**Acceptance:** no badge, colour, emoji or adjective evaluates the cost-per-wear
figure anywhere.

### P0-4. Rename "True Cost Per Wear"

**Why:** "True" asserts authority over a number the user invented thirty seconds
earlier.

**Change to:** `Cost per wear`. Sub-label `₹190 / planned wear` becomes
`₹190 per wear at 10 wears` — make the dependency on the user's own input
explicit.

### P0-5. Strip feature promises from the hesitation options

**Where:** "What's holding you back?" descriptive sub-text.

| Current text | Problem |
|---|---|
| "Compare … against similar marketplace sets." | References competing marketplaces. Breaks rule 10. |
| "Scan your synced wardrobe to generate restyling combinations…" | Describes wardrobe recognition — out of scope, does not exist. |
| "Evaluate bust and waist stretch tolerance based on reviews from customers with matching profiles." | Implies body-profile matching that does not exist. |
| "Verify … colour bleeding risk, and real embroidery stitch density." | "Colour bleeding risk" is a product-defect claim. Breaks rule 2. |

**Change to:** bare labels, no descriptions. This also resolves most of that
screen's clutter — four options with three lines of prose each is why it feels
dense.

**Acceptance:** no text in the app describes a capability that is not built.

### P0-6. Remove traffic-light colour semantics

**Where:** trust block (all green ticks), score ring (green), and whatever
colour considerations inherit.

**Why:** colour-blind readability is an explicit brief requirement. More
importantly, if verification is green then considerations land as amber or red,
making them read as warnings about the product — the exact seller-devaluation
failure the design avoids.

**Change to:** neutral icon treatment throughout, in the same near-white or grey
as body text. Reserve colour for the single primary action button.

**Acceptance:** greyscale the screen. Nothing loses meaning.

---

### P1-1. Fix dead navigation

Bottom nav (Discover, Check, Closet, Bag) and top nav all point at `#`. A
reviewer will click them.

In order of preference: render inactive items visibly disabled; or point them at
the wishlist route; or remove the nav entirely.

If "Discovery Hub" links to the Part 1 discovery engine, wire it up properly and
mention it on the MVP slide — same stack end to end is a good story.

### P1-2. Evidence drawer

Currently the trust block asserts and nothing is checkable. The drill-down is
what separates this from a chatbot, and it is the direct answer to the finding
that this segment treats reviews as due diligence rather than reassurance.

Bottom sheet, opened by "Why am I seeing this?":

```
SIZE CHART      Runs narrow; brand advises half a size up.
REVIEWER        Verified purchase: sized up half a size, fit was comfortable.
YOUR INPUT      You said you usually take M.
```

If time is short, ship on the considerations section only — that is where
checkability matters most.

### P1-3. Progress state

Header reads "Saved Items (6)". Add `2 of 6 checked · 1 resolved`. Small, but it
is what makes this a bounded session rather than another surface to browse.

### P1-4. Settle the naming

Currently in use: "Match Studio", "Diagnostic Detail", "AI Match", "Match
Check". Pick **Match Check** and use it in every header, title and label.
"Diagnostic" reads clinical and implies a verdict on the item.

---

### P2-1. Real brand names on the trust product

The sneakers are a real brand at a steep discount and are the trust item. If any
generated line implies a discounted listing of a real brand warrants scrutiny,
that is an implied counterfeit claim about an identifiable company.

**Safest fix (~15 min):** rename all six brands to invented ones, keep
everything else.

**If not renaming:** manually verify that product's output contains no
consideration mentioning the discount, authenticity, seller, or "first copy",
and that its trust block is purely affirmative. Do this check regardless of
which route you take.

### P2-2. Discount display

Strikethrough MRP is fine — it is the existing Myntra context, not your
intervention. Worth one line on the solution slide: the feature adds no monetary
incentive, it resolves the doubt the discount itself creates.

---

## 6. Inner Circle — end-to-end specification

Currently the largest gap between spec and build. One of three modules and one
of the three exits in the problem statement. A stubbed vote loop is a visible
hole in the argument.

### 6.1 Share screen (owner)

Title: **Ask people you trust**

Card preview, styled to look like something sent in a chat:
- Product image, brand, name
- Price and `₹190 per wear at 10 wears`
- Small grey label `For: Wedding Gala`
- One consideration line, verbatim from the assessment
- The shopper's question in quotes, editable

Default question text, prefilled from the user's stated hesitation:

```
I'm considering this for a wedding at about ₹190 per wear.
I'm unsure about the fit. What do you think?
```

Actions: **WhatsApp** (deep link), **Copy link**, **More** (Web Share API).

Caption: `Link expires in 24 hours. Friends don't need the app.`

**Cap at one item per ask.** Sending five items is how the ask gets ignored.

### 6.2 Share token

```
shares
  token         nanoid, 10 chars, URL-safe
  checkId
  productId
  question
  occasion
  costPerWear
  consideration        one line, copied at share time
  createdAt
  expiresAt            createdAt + 24h
```

Route: `/v/[token]`

The 24-hour expiry is not decoration. It is a deadline on a decision that would
otherwise defer forever — the same function the Instagram story poll convention
performs.

Expired token renders: `This link has expired.` plus nothing else. Never leak
the product or the question.

### 6.3 Voting page (friend)

No login, no install, no app chrome. Loads fast on mobile data.

```
[Name] is deciding on this

  [product image]
  Brand · Product name
  ₹1,899 · For: Wedding Gala · ₹190 per wear

  "I'm unsure about the fit. What do you think?"

Does this work for them?

  [ Works for you        ]
  [ Only if…             ]
  [ Not for this use     ]
  [ I'm not sure         ]

  Tell them why (optional)
  [                      ]

  [ Send my answer ]
```

**Copy rule:** every option judges whether the item suits this person's stated
use. Never product quality. No "good product" / "bad product". This is the
seller-neutrality rule applied to user-generated content, and it is the one
place where users could otherwise devalue a listing on Myntra's surface.

One vote per browser session (localStorage flag). Not security — just prevents
accidental double-submit.

### 6.4 Responses view (owner)

Title: **What your circle said**

```
3   Works for you            ████████████
1   Only if the sizing checks out   ████
0   Not for this use
0   I'm not sure
```

Plus comment cards with initials avatars.

**Live update.** Poll every 3 seconds while the screen is open, or use a
realtime listener if the store supports it. Polling is fine and simpler.

Bottom: **Return to my decision** → back to the decision checkpoint with votes
now visible inline.

### 6.5 Demo safety

The demo must work with zero friends available. **Seed two votes on the share
token at creation time** so the responses view is never empty when a reviewer
opens it, and label them clearly as sample responses. A real vote from a real
phone then lands alongside them.

Test the full loop from a second physical device, on mobile data, not just a
second browser tab.

---

## 7. Completion screen

The session framing. Currently missing, and it is the differentiating demo
moment.

Trigger: reachable any time from the wishlist header, and shown automatically
once every item has an action.

```
You closed 6 decisions

   2            3            1
   Bought       Removed      Kept for later

  [thumb] Floral Wrap Midi Dress      Bought
  [thumb] Zari Lehenga Choli          Kept for later
  [thumb] Anime Graphic Tee           Removed
  ...

  [ Back to wishlist ]
```

**Why it matters:** browsing permits deferral by design. A session has a start,
an end and a completion state, which is what a wishlist has never had. This
screen is the visual argument for the whole framing, and it is fifteen seconds
of demo no competing submission will have.

Include removals in the headline count. Closing a decision by removing an item
is a resolved decision, and the metric is per-user ("at least one item"), so
clearing dead items concentrates attention rather than costing conversion.

---

## 8. AI behaviour

### Inputs

Product title, category, price, material and care, size chart, description,
selected review excerpts, aggregate rating, verification fields, plus the user's
occasion, expected wears, primary hesitation, and (where given) self-declared
usual size and prior fit experience.

Use seeded product data. Do not scrape Myntra.

### On personal fit context

We do not have Myntra account data, so the MVP asks the user directly. Nothing
is inferred or fabricated.

**State the production path explicitly in the deck:** in production this input
comes from the user's own kept-versus-returned purchase history, which Myntra
already holds and no competing marketplace can replicate. The MVP substitutes
self-declared input to test the same decision loop.

### Structured output

```json
{
  "match_reasons":   [{ "statement": "string", "evidence_ids": ["string"] }],
  "considerations":  [{ "condition": "string", "implication": "string", "evidence_ids": ["string"] }],
  "unknowns":        [{ "statement": "string", "missing_information": "string" }],
  "question_to_resolve": "string",
  "evidence_completeness": "high | medium | low"
}
```

Schema-constrained output, not free-text parsing. The trust block is assembled
from static fields and does not pass through the model.

### Seller-protection rules — enforce in the system prompt

1. Assess the match between item and user's stated use, never the item's absolute worth.
2. Never call an item bad, overpriced, fake, poor quality, or not worth buying.
3. Never allege, imply or hedge about authenticity. Verification is affirmed from data or omitted — never questioned.
4. Phrase every concern conditionally: "If X matters to you…"
5. Every factual claim must reference a supplied evidence ID.
6. Treat an isolated review as one person's report, not established fact.
7. Name contradictory or insufficient evidence explicitly rather than resolving it — for fit, fabric and usage only, never for verification.
8. Give match_reasons and considerations equal care. Do not pad either side.
9. Never make the decision for the user. Never emit a score, grade or overall verdict.
10. Never reference or recommend competing sellers or marketplaces.

### Reliability fallback

Pre-generate one assessment per seeded product and cache it. If the API fails or
times out: serve the cached assessment, still personalise cost per wear, keep
the trust block, sharing and voting live. **A reviewer must never hit a broken
demo.**

Test this deliberately: unset the API key, reload, confirm the app still works.

---

## 9. Calibration — run it for real

Harness already written: `lib/schema.ts`, `lib/prompt.ts`, `data/products.ts`,
`calibration/run.ts`, `calibration/score.ts`.

```bash
export GEMINI_API_KEY=...
export GEMINI_MODEL=...        # check current model names first
npx tsx calibration/run.ts     # 24 assessments -> calibration.json
npx tsx calibration/score.ts   # four checks, exits 1 on failure
```

### The matrix

6 products × 4 shopper contexts = 24 runs. The unit under calibration is
**product × context**, not product.

| # | Occasion | Wears | Hesitation | Extra |
|---|---|---|---|---|
| A | Everyday | 25 | Is it worth the price? | — |
| B | Wedding/event | 4 | Will I actually wear it? | — |
| C | Work | 15 | Will it fit? | usualSize M, prior issue inconsistent |
| D | Date | 8 | Can I trust this listing? | — |

### Four checks

1. **Evidence validity.** Every `evidence_ids` value resolves against that product's evidence array. **Target: 0 failures.** Most important check.
2. **Objection rate.** Runs surfacing ≥1 consideration. **Target: 8–12 of 24 (33–50%).**
3. **Boilerplate repetition.** No single condition phrasing in more than ~50% of outputs. Likeliest failure, easiest to miss — a model hedging by default produces a correct-looking rate with worthless objections.
4. **`evidence_completeness` variance.** At least two distinct values across 24 runs.

### Tuning

| Symptom | Fix |
|---|---|
| Too many objections | Instruct empty `considerations` array when nothing material applies; cap at two; require each to name supporting evidence |
| Too few | Usually thin seed evidence, not the prompt. Enrich review excerpts on two or three products |
| Boilerplate | Explicit negative instruction naming the hedge; move EVIDENCE earlier in the prompt; lower temperature |
| Failed evidence IDs | Tighten rule 5, and keep `guardAssessment()` as a permanent runtime guard |

### The permanent runtime guard

`guardAssessment()` drops any statement whose evidence IDs do not all resolve.
**Keep it in the production API route, not just in calibration.** It means a
hallucinated claim structurally cannot render. This is the strongest single line
on the risks slide.

### Output to keep

```
"24 assessments across 6 products and 4 shopper contexts:
 N surfaced a material consideration, N returned clean,
 0 unresolved evidence references."
```

Put this on the risks slide. It converts the fabrication risk from an assertion
into a measurement, and almost nobody in the cohort will have one.

---

## 10. Data model

```text
products
  id, name, brand, category, price, imageUrl
  attributes[], evidence[], fallbackAssessment
  referenceWearBand
  verification   { brandAuthorised, verifiedPurchaseShare, styleCode,
                   returnsWindowDays, refundProtection }

checks
  id, anonymousUserId, productId
  occasion, expectedWears, hesitation
  usualSize, priorFitIssue          // self-declared, optional
  assessment, doubtResolved, finalDecision, createdAt

shares
  token, checkId, productId, question, occasion,
  costPerWear, consideration, createdAt, expiresAt

votes
  id, shareToken, response, comment, isSample, createdAt

events
  sessionId, eventName, productId, timestamp
```

No names, phone numbers or credentials.

---

## 11. Events

`wishlist_viewed`, `match_check_started`, `context_submitted`,
`match_check_generated`, `trust_block_viewed`, `evidence_opened`,
`cost_per_wear_changed`, `worth_it_answered`, `doubt_resolved_yes|partly|no`,
`inner_circle_shared`, `inner_circle_vote_received`, `owner_returned_after_vote`,
`buy_clicked`, `kept_for_later`, `removed_from_wishlist`, `session_completed`

---

## 12. Success definition

**Business metric:** 30-day wishlist-to-purchase conversion.

**Primary MVP signal — Doubt Resolution Rate:** completed Match Checks answering
"Yes" to "has your main doubt been resolved?" ÷ completed Match Checks.

**Supporting indicators:** completion rate; buy clicks after a check;
self-reported reduction in need to search elsewhere; trust-block view rate among
users whose hesitation was trust; Inner Circle share rate among still-unsure
users; owner return rate after a vote; evidence-drawer open rate; decisions
closed per session; time from start to decision.

**Guardrails:**
- Share of items receiving a consideration — must stay in the 33–50% calibration band. Too high is a wall; too low is flattery.
- Perceived unfairness to the seller.
- Unsupported claim rate (should be structurally zero given the runtime guard).
- Item removal rate.
- In production: returns, negative reviews, seller complaints, item-level exposure shifts across sellers — with particular attention to whether trust-block coverage differentially affects smaller sellers.
- **Net contribution margin, not gross conversion.** Honest assessment sometimes resolves to "no," and suppressing a purchase that would have returned is margin, not lost revenue.

---

## 13. User testing protocol

3–5 people, ~10 minutes each. Do this once P0 and §6 are done.

**Recruit:** anyone 18–34 who shops online for clothes and has a wishlist with
items older than a month. Do not brief them on the concept first.

**Script:**
1. "Here's a wishlist. Pick the item you'd be most unsure about buying." *(observe which and why)*
2. "Go ahead and use it however makes sense." *(do not guide — note where they hesitate)*
3. After the result screen: "What is this telling you?" *(tests whether the balance reads correctly)*
4. "Would you still have checked another app before buying this?" *(the core question — this is the problem statement)*
5. "Did anything here feel like Myntra criticising the product?" *(the seller-neutrality check)*
6. "Has your main doubt been resolved?" *(the primary metric, asked directly)*

**Pass bar, from the spec:**
- 4 of 5 complete the flow unaided
- 3 of 5 say it reduced their need to leave Myntra
- 3 of 5 reach a clearer decision
- 0 of 5 read it as Myntra attacking the seller
- At least one real friend vote lands end to end

**Record the actual numbers**, including failures. "3 of 5 said they'd still
have checked another app" is more credible on a slide than a clean result, and
it gives you a real next-step line.

---

## 14. Out of scope

General shopping chatbot · live Myntra integration · cross-marketplace scraping ·
price-drop alerts · virtual try-on · wardrobe image recognition · algorithmic
size prediction · authentication · checkout or payments · seller dashboards ·
push notifications · any item-level score or grade

---

## 15. Pre-submission verification

**Functional**
- [ ] Production URL loads in a private window, on mobile data, with no login
- [ ] Full flow works on a real phone
- [ ] App still works with the model API key unset (cached fallback)
- [ ] Inner Circle loop tested from a second physical device
- [ ] Nav links either work or are visibly disabled

**Content discipline**
- [ ] No numeric score, grade or overall verdict anywhere
- [ ] "Things to consider" and "What remains unclear" render
- [ ] Greyscale test passes on the result screen
- [ ] No badge or adjective evaluates the cost-per-wear number
- [ ] No text describes an unbuilt capability
- [ ] No reference to any competing marketplace
- [ ] Considerations phrased conditionally, never as verdicts
- [ ] Trust block affirmative only; no hedged state on any product
- [ ] Vote options judge the match, never product quality
- [ ] One consistent product name throughout
- [ ] Illustrative-data disclosure visible on every screen

**Evidence**
- [ ] Calibration run completed; four checks pass; numbers recorded
- [ ] User test run; actual numbers recorded including failures

---

## 16. What is deliberately NOT changing

- The deployment platform. It works, it is public, it is fast enough.
- The product set, images and prices.
- The three-question context flow.
- The four-module design.

No new features. Everything in this document closes a gap between what the deck
claims and what the MVP demonstrates.
