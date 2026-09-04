# Myntra Match Check — Build Specification

**Build target:** mobile-first web app, publicly deployed, demo-able in under two minutes.
**Timeline:** one day.

---

## 1. Why this exists

### Business metric

30-day wishlist-to-purchase conversion: the percentage of users who purchase at least one item within 30 days of wishlisting it.

### Problem statement

Deliberate Gen Z and millennial shoppers save fashion items because they are interested but not yet confident. When they reconsider a saved item, they leave Myntra to resolve the doubt — searching the style code to check the item is genuine, cross-checking price on other marketplaces, trying it on in a store, or asking friends on WhatsApp. Because the evidence and the social validation both live outside Myntra, the decision is postponed indefinitely and wishlist intent decays.

**The wishlist stores the item but resolves nothing.**

### Research basis

- **AI discovery engine:** 6,985 units from Play Store and YouTube, gated to 910 wishlist-relevant, filtered to N=516 high-confidence. Top frictions: value_comparison (#1, 257 units, 54.5% of which decompose to value-confidence rather than pure price), fit_size (#2, 120 units), authenticity_trust (#3, 99 units).
- **Secondary research:** Fashion returns run 25–40% against a ~17% category average; fit and sizing drive 53–77% of fashion returns; ~43% abandon carts due to fit uncertainty. 31% of Indian consumers encountered counterfeit apparel in the last 12 months, and online platforms account for ~53% of counterfeit purchases. Bain: Gen Z is 40–45% of India's e-retail and shops 5+ platforms annually.
- **Primary research:** Every interviewee left Myntra to resolve their doubt. One described a large discount pushing him into research mode rather than checkout. Two described the wishlist tool itself failing, unprompted.
- **Trend grounding:** 88% of Gen Z social media users report having been "de-influenced" — actively choosing not to buy (Credit Karma). Customer reviews are the most trusted information source for 72% of Gen Z, with influencer content ranking seventh at 55% (Walr, March 2026). Deloitte's 2026 survey found 60%+ of Indian Gen Z and millennials focused on deliberate spending (806 India respondents). KPMG India: 63% of Gen Z rank social commerce as important to how they shop.

### Design consequence

This segment already seeks out reasons *not* to buy and trusts evidence over recommendation. So the product does not persuade. It gives an honest, evidence-referenced assessment of whether a specific item suits a specific person's stated use — inside the app, so the trip elsewhere becomes unnecessary.

### Target segment

Deliberate wishlist users, roughly 18–34, who use the wishlist as a decision-holding area, compare before buying, care about value rather than discount depth, consult friends or reviews, have a specific use case in mind, and revisit saved items while staying undecided. Behavioural, not demographic.

### Core hypothesis

If deliberate savers can assess personal suitability, verify the listing is genuine, see realistic cost per wear, and get trusted friend validation from one surface inside Myntra, more will resolve their hesitation and suitable items will convert within 30 days.

---

## 2. Hard constraint: marketplace neutrality

Myntra is two-sided. Sellers are customers. The product must never devalue a listing.

**Every assessment is about the match between the item and this user's stated use — never about the item's absolute worth.**

- "This shirt has quality problems" — forbidden.
- "If low-maintenance matters to you, note this is dry-clean only" — correct.

### The asymmetry rule (governs the trust module)

Verification is **affirmable but never allegeable.**

- Showing that a listing is brand-authorised, has a high verified-purchase share, and a matching style code — always allowed.
- Suggesting, implying or hedging that a listing may not be genuine — never allowed, in any phrasing.
- **A thin trust block must never imply suspicion.** Where verification data is sparse, show platform-level protection (returns window, refund guarantee, exchange policy), which is true of every listing. Never render an empty, hedged or "limited data" trust state — absence would read as a red flag and would differentially penalise small sellers.

---

## 3. What we are building

Four modules, each closing one documented off-app exit:

| Off-app exit found in research | Module |
|---|---|
| Searching the style code to check the item is genuine | **Trust & Verification** |
| Cross-checking price on other marketplaces | **Cost per wear** |
| In-store try-on; "will this actually work for me" | **Match Check** |
| Screenshotting to WhatsApp for a friend's verdict | **Inner Circle** |

This covers all three top frictions from the discovery engine: value_comparison, fit_size and authenticity_trust.

---

## 4. Screens

### Screen 1 — Mock wishlist

Six to eight seeded items, mobile-first, no login.

Product mix, each representing a different doubt:
1. Dress — inconsistent sizing reports
2. Premium shirt — value hesitation at the price point
3. Occasionwear (lehenga or blazer) — low expected repeat usage
4. Heavily discounted branded sneakers — user unsure whether a steep discount is trustworthy
5. Trend-led top — high styling potential, uncertain longevity
6. Everyday trousers — strong utility case

> Note on item 4: the doubt belongs to the *user*, not the product. The listing is never questioned. The module resolves the user's uncertainty by affirming verification.

Each card: image, name, brand, price, rating, "Saved 8 days ago", primary CTA **Check if it's right for me**, secondary CTA Buy now.

**Header strip, persistent:** `Illustrative product and review data — built for prototype testing.` Non-negotiable. All seeded data must be visibly labelled as illustrative.

**Progress state, top of screen:** `3 of 8 checked · 2 resolved`. Cheap to build, and it makes this a session with a completion state rather than another surface to browse.

### Screen 2 — "What do you need this for?"

Three questions, plus one conditional.

**Occasion:** Everyday / College / Work / Date / Wedding or event / Travel

**Expected usage:** "Honestly, how many times can you see yourself wearing it?" Live slider, 1 to 30+.

Alongside the slider, an honest reference band derived from the occasion type, e.g. `Wedding and event wear is typically worn 2–6 times.` Labelled as a general reference, not a prediction about this user. This is what stops cost per wear from being a bare calculator.

Cost per wear updates live as the slider moves: `₹2,499 ÷ 20 wears = ₹125 per wear`

**Main hesitation:** Is it worth the price? / Will it fit? / Can I trust this listing? / Will I actually wear it? / Is it right for the occasion?

**Conditional (only if hesitation = fit):** "What size do you usually take in this category?" and "Have you had fit problems in this category before?" (too tight / too loose / inconsistent across brands / no issues)

> Budget comfort has been removed from the earlier draft. It is redundant with cost per wear and adds a step before any value appears.

CTA: **Generate my Match Check**

### Screen 3 — Match Check

**A. Trust & Verification** — positive-only, per the asymmetry rule.

Shows, where available: brand-authorised seller status, share of reviews from verified purchases, style-code match against the brand catalogue, and applicable returns and refund protection. Where verification data is sparse, show platform-level protection only.

This is a static data block. It needs no AI, which makes it the cheapest module to build and the most reliable in a live demo.

**B. Why it could work for you** — max three positive, evidence-referenced statements.

**C. Things to consider** — max three conditional trade-offs. Always phrased "If X matters to you…". Never a verdict on the product.

Where the user's self-declared size context is relevant, this is where it appears: *"You usually take M and mentioned inconsistent sizing across brands. Reviewers here report this style running narrow, so M may be tighter than you're used to."*

**D. What remains unclear** — where review evidence is thin, say so. Never fill a gap with a guess. This applies to fit, fabric and usage evidence. It does **not** apply to verification, which follows the asymmetry rule instead.

**E. Cost-per-wear explorer** — a live slider, not a static table. Dragging updates cost per wear instantly without regenerating the assessment. The occasion reference band stays visible alongside.

| Expected wears | Cost per wear |
|---:|---:|
| 5 | ₹500 |
| 10 | ₹250 |
| 20 | ₹125 |
| 30 | ₹83 |

Never label an amount good or bad. Ask: **"Would this feel worth it at ₹125 per wear?"** → Yes / Not sure / No. This question is the mechanic; the arithmetic alone is not.

**F. Evidence drawer** — every statement carries a "Why am I seeing this?" link showing product attribute, review excerpt, size-chart data, verification source, and which user input was used. Positive statements and considerations get equal visual weight.

### Screen 4 — Decision checkpoint

**"Has your main doubt been resolved?"** → Yes / Partly / No

Then: **Buy this** / **Ask my Inner Circle** / **Keep for later** / **Not right for me — remove**

Buy leads to a prototype confirmation screen. No payment integration.

### Screen 5 — Inner Circle share

Generates a card: *"Help me decide: does this work for me?"*

Card contains: product image and price, intended occasion, cost per wear at their stated usage, one consideration, and the shopper's specific question.

> "I'm considering this for office wear at about ₹125 per wear. I'm unsure about the fit. What do you think?"

Share via WhatsApp deep link, copy link, or native share. **Cap at one item per ask** and expire the link after 24 hours — the expiry doubles as a deadline on a decision that would otherwise defer forever.

### Screen 6 — Friend voting page

No login, no install. Friends answer: **Works for you** / **Only if…** / **Not for this use** / **Not sure**, plus an optional "tell them why."

Options must evaluate the shopper-item match, never the product. No "good product" / "bad product."

Owner sees responses live: `3 Works for you · 1 Only if the sizing checks out`. Final CTA: **Return to my decision**.

---

## 5. AI behaviour

### Inputs

Product title, category, price, material and care, size chart, description, selected review excerpts, aggregate rating, verification fields, plus the user's occasion, expected wears, primary hesitation, and (where given) self-declared usual size and prior fit experience.

Use seeded product data. Do not scrape Myntra — CORS, reliability and terms-of-use problems with no upside for a prototype test.

### On personal fit context

We do not have Myntra account data, so the MVP asks the user directly. Nothing is inferred or fabricated.

**State the production path explicitly in the deck:** in production, this input comes from the user's own kept-versus-returned purchase history, which Myntra already holds and no competing marketplace can replicate. The MVP substitutes self-declared input to test the same decision loop.

### Structured output

```json
{
  "match_reasons": [
    { "statement": "string", "evidence_ids": ["string"] }
  ],
  "considerations": [
    { "condition": "string", "implication": "string", "evidence_ids": ["string"] }
  ],
  "unknowns": [
    { "statement": "string", "missing_information": "string" }
  ],
  "question_to_resolve": "string",
  "evidence_completeness": "high | medium | low"
}
```

Use schema-constrained structured output rather than parsing free text. The trust block is assembled from static fields and does not pass through the model.

### Seller-protection rules — enforce in the system prompt

1. Assess the match between item and user's stated use, never the item's absolute worth.
2. Never call an item bad, overpriced, fake, poor quality, or not worth buying.
3. Never allege, imply or hedge about authenticity. Verification is affirmed from data or omitted — never questioned.
4. Phrase every concern conditionally: "If X matters to you…"
5. Every factual claim must reference a supplied evidence ID.
6. Treat isolated reviews as individual reports, not established fact.
7. Name contradictory or insufficient evidence explicitly rather than resolving it — for fit, fabric and usage only, never for verification.
8. Give positive statements and considerations equal prominence.
9. Never make the decision for the user.
10. Never reference or recommend competing sellers or marketplaces.

### Reliability fallback

Pre-generate one assessment per seeded product and cache it. If the API fails or times out: serve the cached assessment, still personalise cost per wear, keep the trust block, sharing and voting live. **An evaluator must never hit a broken demo.**

### Calibration check — run this BEFORE building any UI

The assessment quality has to be verified before it has an interface wrapped around it. This is a standalone script, roughly 30 minutes, run once. It is not part of the app.

**Why it matters:** if the model objects to nearly every item, the tool reads as a wall and a clean verdict stops meaning anything. If it objects to almost none, it has degraded into a recommendation engine and the de-influencing grounding is lost. Either failure is invisible until you look at the spread.

#### Step 1 — Seed data first

Build the products with their populated `evidence[]` arrays. This is step 1 of the build order anyway, so nothing is wasted.

#### Step 2 — Define context scenarios

The unit under calibration is **product × context**, not product. Four scenarios:

| # | Occasion | Expected wears | Hesitation | Extra |
|---|---|---|---|---|
| A | Everyday | 25 | Is it worth the price? | — |
| B | Wedding/event | 4 | Will I actually wear it? | — |
| C | Work | 15 | Will it fit? | usualSize M, priorFitIssue = inconsistent |
| D | Date | 8 | Can I trust this listing? | — |

Six products × four scenarios = **24 assessments**.

#### Step 3 — Run the matrix

Standalone script. Loop all 24 combinations, calling the model with the **real** system prompt and the **real** schema — not a simplified version, or the calibration is meaningless. Write every response to `calibration.json` with product ID, scenario ID, and the full structured output.

#### Step 4 — Score four checks

**1. Evidence validity (most important).** For every `evidence_ids` value in every output, assert it exists in that product's evidence array. A set-membership test, fully programmatic. Any unresolved ID is a fabrication. **Target: zero failures.**

**2. Objection rate.** Count runs where `considerations` holds at least one item whose condition plausibly applies to that scenario. **Target: 8–12 of 24 (33–50%).** Roughly a third should come back with nothing material.

**3. Boilerplate repetition (likeliest failure, easiest to miss).** Group considerations by phrasing across all 24 outputs. If "if you are between sizes" appears on 20 of them, the model is hedging by default rather than reading evidence — the rate looks correct while the objections are worthless. **Target: no single consideration phrasing in more than ~50% of outputs.**

**4. `evidence_completeness` variance.** If every product returns "high," the field is decorative. Some products were seeded with thin evidence deliberately. **Target: at least two distinct values across the 24 runs.**

#### Step 5 — Tune

| Symptom | Fix |
|---|---|
| Too many objections | Instruct the model to return an empty `considerations` array when nothing material applies; cap at two; require each consideration to name its supporting evidence |
| Too few objections | Usually a seed-data problem, not a prompt problem — thin evidence gives the model nothing to work with. Enrich review excerpts on two or three products |
| Boilerplate hedging | Add explicit negative instructions against generic sizing and maintenance hedges; move the product's own evidence earlier in the prompt; lower the temperature |
| Failed evidence IDs | Tighten the schema requirement, **and** make the app drop any statement whose evidence ID does not resolve. Keep this as a permanent runtime guard so a hallucinated claim can never reach the screen |

#### Step 6 — Keep the output

Save the final calibration table. A line like *"24 assessments across 6 products and 4 contexts: 9 surfaced a material consideration, 8 returned clean, 0 unresolved evidence IDs"* belongs on the risks slide. It is the difference between a tested MVP and a demoed one.

---

## 6. Data model

```text
products
  id, name, brand, category, price, imageUrl
  attributes[], evidence[], fallbackAssessment
  referenceWearBand      // honest usage band by occasion type
  verification            // brandAuthorised, verifiedPurchaseShare,
                          // styleCode, returnsWindow, refundProtection

checks
  id, anonymousUserId, productId
  occasion, expectedWears, hesitation
  usualSize, priorFitIssue          // self-declared, optional
  assessment, doubtResolved, finalDecision, createdAt

shares
  token, checkId, expiresAt

votes
  id, shareToken, response, comment, createdAt

events
  sessionId, eventName, productId, timestamp
```

No names, phone numbers or credentials.

---

## 7. Events

`wishlist_viewed`, `match_check_started`, `context_submitted`, `match_check_generated`, `trust_block_viewed`, `evidence_opened`, `cost_per_wear_changed`, `worth_it_answered`, `doubt_resolved_yes|partly|no`, `inner_circle_shared`, `inner_circle_vote_received`, `owner_returned_after_vote`, `buy_clicked`, `kept_for_later`, `removed_from_wishlist`

---

## 8. Success definition

**Business metric:** 30-day wishlist-to-purchase conversion.

**Primary MVP signal — Doubt Resolution Rate:** completed Match Checks answering "Yes" to "has your main doubt been resolved?" ÷ completed Match Checks.

**Supporting indicators:** completion rate; buy clicks after a check; self-reported reduction in need to search elsewhere; trust-block view rate among users whose hesitation was trust; Inner Circle share rate among still-unsure users; owner return rate after a vote; evidence-drawer open rate; time from start to decision.

**Guardrails:**
- Share of items receiving a consideration — must stay inside the calibration band. Too high is noise, too low is flattery.
- Perceived unfairness to the seller.
- Unsupported claim rate.
- Item removal rate.
- In production: returns, negative reviews, seller complaints, item-level exposure shifts across sellers — with particular attention to whether trust-block coverage differentially affects smaller sellers.
- Net contribution margin, not gross conversion. Honest assessments will sometimes resolve to "no," and suppressing a purchase that would have returned is margin, not lost revenue.

**Prototype test bar (5 users):** four complete the flow unaided; three say it reduced their need to leave Myntra; three reach a clearer decision; zero read it as Myntra attacking the seller; at least one real friend vote lands end to end.

---

## 9. Out of scope

General shopping chatbot · live Myntra integration · cross-marketplace scraping · price-drop alerts · virtual try-on · wardrobe image recognition · algorithmic size prediction · authentication · checkout or payments · seller dashboards · push notifications

---

## 10. Build order

1. Seeded products with verification fields, mobile wishlist screen with the illustrative-data label.
2. Three-question context flow (plus conditional fit questions) with live cost-per-wear and the reference band.
3. Trust & Verification block — static, no AI, cheapest win. Build early.
4. Static Match Check components (three sections plus evidence drawer).
5. Pre-generate and cache all fallback assessments. **Do this before wiring the live API.**
6. Connect the model with schema-constrained structured output.
7. Cost-per-wear explorer slider and the "would this feel worth it" question.
8. Share tokens and the no-login friend voting page.
9. Progress state and events.
10. Mobile pass on a real phone, then deploy via GitHub.

**Deploy something ugly and live early.** A working public URL is a hard deliverable; polish is compressible.

---

## 11. Demo script (under two minutes)

Wishlist → select the discounted sneakers → occasion everyday → trust block confirms brand-authorised seller, verified-purchase share and style-code match → doubt resolved → back to wishlist → select the occasionwear item → wedding → six expected wears → Match Check appears → open the evidence drawer on one consideration → cost-per-wear slider shows ₹417/wear → "would this feel worth it?" → Not sure → Ask Inner Circle → friend votes "Only if the sizing checks out" → return → resolve sizing via the size-chart evidence → Buy.

---

## 12. One-line summary

Verification resolves trust, cost per wear resolves value, balanced match assessment resolves fit and suitability, and Inner Circle resolves social uncertainty — every reason users left Myntra now resolves inside it, without devaluing a single seller.
