# Myntra Match Check — Project Context

## Project Overview

**Product:** Myntra Match Check — a mobile-first web app that helps deliberate shoppers resolve purchase hesitation *inside* Myntra, eliminating the need to leave the app to verify trust, compare value, assess fit, or seek friend opinions.

**Build target:** Mobile-first web app, publicly deployed, demo-able in under two minutes.
**Timeline:** One day.

### Development Workflow

**Frontend (Stitch AI):** All UI screens, components, layouts, and styling are built using Stitch AI — a design-to-code tool. The generated frontend code is uploaded to this project.

**Backend & Logic (Manual):** Data layer (seeded products, types), API routes, AI pipeline (Gemini integration, system prompt, evidence guard), server stores, event tracking, calibration scripts, and share/vote logic are built manually.

**Integration:** After the Stitch AI frontend is uploaded, the backend wires into the frontend — connecting API calls, data flow, state management, and event tracking to the UI components.

---

## Core Problem

Gen Z and millennial shoppers wishlist fashion items because they're interested but not confident. To resolve doubt, they leave Myntra — searching style codes for authenticity, cross-checking prices on other marketplaces, trying items in-store, or asking friends on WhatsApp. Because evidence and social validation live outside Myntra, decisions are postponed indefinitely and wishlist intent decays.

> **"The wishlist stores the item but resolves nothing."**

**Business Metric:** 30-day wishlist-to-purchase conversion (% of users who purchase at least one item within 30 days of wishlisting).

---

## Target Segment

Deliberate wishlist users (~18–34) who:
- Use the wishlist as a decision-holding area
- Compare before buying
- Care about value (not just discount depth)
- Consult friends or reviews
- Have a specific use case in mind
- Revisit saved items while staying undecided

This is a **behavioural** segment, not a demographic one.

---

## Core Hypothesis

If deliberate savers can assess personal suitability, verify listing genuineness, see realistic cost per wear, and get trusted friend validation — all from one surface inside Myntra — more will resolve hesitation and suitable items will convert within 30 days.

---

## Four Modules (Mapping to Off-App Exits)

| Off-App Exit | Module | Type |
|---|---|---|
| Searching style code to check genuineness | **Trust & Verification** | Static data (no AI) |
| Cross-checking price on other marketplaces | **Cost Per Wear** | Live calculator with slider |
| In-store try-on / "will this work for me?" | **Match Check** | AI-generated assessment |
| Screenshotting to WhatsApp for friend's verdict | **Inner Circle** | Share & vote system |

These cover the top 3 frictions from research: `value_comparison`, `fit_size`, `authenticity_trust`.

---

## Hard Constraint: Marketplace Neutrality

Myntra is two-sided — sellers are customers too. The product **must never devalue a listing**.

- Every assessment is about the **match between the item and this user's stated use** — never about the item's absolute worth.
- ❌ "This shirt has quality problems"
- ✅ "If low-maintenance matters to you, note this is dry-clean only"

### Asymmetry Rule (Trust Module)

Verification is **affirmable but never allegeable**:
- ✅ Showing brand-authorised status, verified-purchase share, matching style code — always allowed.
- ❌ Suggesting, implying, or hedging that a listing may not be genuine — never allowed.
- Where verification data is sparse → show **platform-level protection** (returns, refund guarantee, exchange policy). Never render empty, hedged, or "limited data" trust states.

---

## Screen Flow

### Screen 1 — Mock Wishlist
- 6–8 seeded items (no login), each representing a different doubt
- Product mix: dress (sizing), premium shirt (value), occasionwear (low repeat use), discounted sneakers (trust), trend top (longevity), everyday trousers (utility)
- Each card: image, name, brand, price, rating, "Saved 8 days ago"
- Primary CTA: **"Check if it's right for me"** / Secondary: Buy now
- Persistent header: `Illustrative product and review data — built for prototype testing.`
- Progress state: `3 of 8 checked · 2 resolved`

### Screen 2 — "What do you need this for?"
Three questions + one conditional:
1. **Occasion:** Everyday / College / Work / Date / Wedding or event / Travel
2. **Expected usage:** Live slider (1–30+) with honest reference band by occasion type. Cost per wear updates live.
3. **Main hesitation:** Is it worth the price? / Will it fit? / Can I trust this listing? / Will I actually wear it? / Is it right for the occasion?
4. **Conditional (if hesitation = fit):** Usual size + prior fit issues

CTA: **"Generate my Match Check"**

### Screen 3 — Match Check Results
- **A. Trust & Verification** — positive-only static data block (cheapest to build)
- **B. Why it could work for you** — max 3 positive, evidence-referenced statements
- **C. Things to consider** — max 3 conditional trade-offs ("If X matters to you…")
- **D. What remains unclear** — where evidence is thin, say so (never for verification)
- **E. Cost-per-wear explorer** — live slider, occasion reference band visible
- **F. Evidence drawer** — "Why am I seeing this?" links for every statement

### Screen 4 — Decision Checkpoint
- "Has your main doubt been resolved?" → Yes / Partly / No
- Actions: Buy this / Ask my Inner Circle / Keep for later / Not right for me — remove

### Screen 5 — Inner Circle Share
- Generates shareable card with: product image/price, intended occasion, cost per wear, one consideration, shopper's question
- Share via WhatsApp deep link, copy link, or native share
- **One item per ask**, link expires after 24 hours

### Screen 6 — Friend Voting Page
- No login, no install
- Vote: Works for you / Only if… / Not for this use / Not sure + optional comment
- Owner sees responses live → Final CTA: "Return to my decision"

---

## AI Behaviour

### Inputs
Product data (title, category, price, material, care, size chart, description, review excerpts, rating, verification fields) + user context (occasion, expected wears, hesitation, self-declared size/fit experience).

**Use seeded product data only** — no scraping Myntra.

### Structured Output Schema
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

### Seller-Protection Rules (System Prompt)
1. Assess match between item and user's stated use, never item's absolute worth
2. Never call an item bad, overpriced, fake, poor quality, or not worth buying
3. Never allege/imply/hedge about authenticity — affirm or omit
4. Phrase every concern conditionally: "If X matters to you…"
5. Every factual claim must reference a supplied evidence ID
6. Treat isolated reviews as individual reports, not established fact
7. Name contradictory/insufficient evidence explicitly (fit/fabric/usage only, never verification)
8. Equal prominence for positives and considerations
9. Never make the decision for the user
10. Never reference or recommend competitors

### Reliability Fallback
- Pre-generate one assessment per product and cache it
- On API failure: serve cached assessment, personalize cost per wear, keep trust block/sharing/voting live

---

## Data Model

```
products:     id, name, brand, category, price, imageUrl, attributes[], evidence[],
              fallbackAssessment, referenceWearBand, verification{}
checks:       id, anonymousUserId, productId, occasion, expectedWears, hesitation,
              usualSize, priorFitIssue, assessment, doubtResolved, finalDecision, createdAt
shares:       token, checkId, expiresAt
votes:        id, shareToken, response, comment, createdAt
events:       sessionId, eventName, productId, timestamp
```

No names, phone numbers, or credentials.

---

## Event Tracking

`wishlist_viewed`, `match_check_started`, `context_submitted`, `match_check_generated`, `trust_block_viewed`, `evidence_opened`, `cost_per_wear_changed`, `worth_it_answered`, `doubt_resolved_yes|partly|no`, `inner_circle_shared`, `inner_circle_vote_received`, `owner_returned_after_vote`, `buy_clicked`, `kept_for_later`, `removed_from_wishlist`

---

## Success Definition

**Primary MVP Signal — Doubt Resolution Rate:**
> Completed Match Checks answering "Yes" to "has your main doubt been resolved?" ÷ completed Match Checks

**Supporting Indicators:** completion rate, buy clicks after check, self-reported reduction in off-app searches, trust-block views (trust hesitation users), Inner Circle share rate (still-unsure users), owner return rate after vote, evidence-drawer open rate, time from start to decision.

**Prototype Test Bar (5 users):**
- 4 complete the flow unaided
- 3 say it reduced need to leave Myntra
- 3 reach a clearer decision
- 0 read it as Myntra attacking the seller
- ≥1 real friend vote lands end to end

---

## Calibration Check (Pre-Build)

Run a standalone calibration script **before** building any UI:
- 6 products × 4 context scenarios = 24 assessments
- Score: evidence validity (zero fabrications), objection rate (33–50%), boilerplate repetition (<50%), evidence_completeness variance (≥2 distinct values)

---

## Build Order

Two parallel tracks that converge at integration:

### Track A — Frontend (Stitch AI)
1. Design all screens in Stitch AI (wishlist, context, Match Check, decision, Inner Circle, voting)
2. Export generated code and upload to the project

### Track B — Backend & Logic (Manual)
1. Seeded products with evidence arrays, verification fields, and TypeScript types
2. Reference wear bands and cost-per-wear utility
3. Trust block assembly function (static, no AI)
4. AI pipeline: system prompt, schema, Gemini integration, evidence guard
5. Calibration script (6 products × 4 scenarios) — run and validate
6. Pre-generate and cache all fallback assessments
7. API routes: assess, shares, votes, events
8. Server stores: checks, shares, votes
9. Share token generation and expiry logic
10. Client-side event emitter

### Track C — Integration
1. Wire Stitch AI frontend components to API routes and data layer
2. Connect state management (localStorage, URL params, server stores)
3. Add event tracking calls to all screens
4. Mobile pass on real phone → deploy via GitHub

> **"Deploy something ugly and live early."** Working public URL is a hard deliverable; polish is compressible.

---

## Out of Scope

General shopping chatbot · live Myntra integration · cross-marketplace scraping · price-drop alerts · virtual try-on · wardrobe image recognition · algorithmic size prediction · authentication · checkout or payments · seller dashboards · push notifications

---

## Demo Script (Under 2 Minutes)

Wishlist → discounted sneakers → everyday → trust block confirms verification → doubt resolved → back to wishlist → occasionwear → wedding → 6 expected wears → Match Check → evidence drawer → cost-per-wear slider (₹417/wear) → "would this feel worth it?" → Not sure → Ask Inner Circle → friend votes "Only if sizing checks out" → return → resolve via size-chart evidence → Buy.

---

## One-Line Summary

> Verification resolves trust, cost per wear resolves value, balanced match assessment resolves fit and suitability, and Inner Circle resolves social uncertainty — every reason users left Myntra now resolves inside it, without devaluing a single seller.
