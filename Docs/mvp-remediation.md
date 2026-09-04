# Match Check — MVP remediation spec

**Context:** the app is deployed and publicly reachable at
`https://myntra-match-check-rho.vercel.app/`. It is not broken. This document
lists what to change in the existing codebase.

**Do not rebuild on another platform.** Every defect below is a prompt or
component problem that would reproduce identically on Lovable, v0 or anywhere
else. Rebuilding costs a day and forfeits a working deliverable.

**Estimated total: ~2 hours for P0, ~1 hour for P1.**

> Keep the current deployment live throughout. If you branch, only switch the
> submission link once the new version is tested and green.

---

## P0 — Do these first. Each one is a scoring risk.

### P0-1. Remove the numeric match score and the "Strong Match" verdict

**Where:** Diagnostic Detail screen, top ring showing `86` / `Strong Match`.

**Why:** A per-item numeric score is exactly the opaque AI recommendation the
product was designed not to be. On a two-sided marketplace it is also an
item-level ranking signal, which is the seller-neutrality problem in its purest
form — a listing scoring 42 has been publicly rated by the platform. It is the
most quotable element on the screen and the easiest thing for a reviewer to
attack.

**Change to:** remove the ring and the verdict entirely. Keep only a quiet
context line where the ring was:

```
Checked for: Wedding Gala · 4 expected wears
```

**Acceptance:** no number, grade, score, badge or adjective anywhere on the
screen describes the item as a whole.

---

### P0-2. Restore "Things to consider" and "What remains unclear"

**Where:** Diagnostic Detail screen. Currently shows "Why it works" and nothing
else, with the lower half of the screen empty.

**Why:** This is the product. The entire argument is that positives and
considerations appear at equal weight, which is what makes the positives
believable. Right now the app demonstrates none of that. This is the single
highest-value fix in the build.

**Required structure, in this order:**

```
Trust & Verification          (already present)
Why it could work for you     (rename from "Why it works")
Things to consider
What remains unclear
Cost per wear
Hesitation check
```

**"Things to consider"** — up to three items, identical type size, font weight,
background and icon treatment to "Why it could work for you". The only
difference is a neutral circle-outline icon in place of the check. Each item is
phrased conditionally:

```
If low-maintenance matters to you, note this is dry clean only.
If you are between sizes, a reviewer reports this style runs narrow.
At 4 expected wears, this comes to ₹2,250 per wear.
```

If the model returns an empty considerations array, render nothing for the
section rather than a filler line. An empty section is a valid outcome.

**"What remains unclear"** — up to two items, muted grey, question-mark icon:

```
There isn't consistent evidence about how the fabric performs after repeated wear.
Available reviews don't clearly address long-term durability.
```

**Acceptance:** screenshot the screen, convert to greyscale. "Why it could work
for you" and "Things to consider" must be indistinguishable in visual weight.
If one reads as reassurance and the other as warning, it has failed.

---

### P0-3. Delete the "GREAT VALUE" badge

**Where:** Realistic Lifespan Wears screen, next to True Cost Per Wear.

**Why:** The spec states explicitly that a cost-per-wear amount is never labelled
good or bad. The user supplied the wear count, so the badge is the app
congratulating the user on their own input and then using it as a persuasion
device. It converts the module from a reflection tool into a nudge, and it is
the first thing that undercuts the de-influencing narrative the whole deck rests
on.

**Change to:** delete the badge. No replacement. The number stands alone and the
hesitation question does the work.

**Acceptance:** no badge, colour, emoji or adjective evaluates the cost-per-wear
figure anywhere in the app.

---

### P0-4. Rename "True Cost Per Wear" to "Cost per wear"

**Why:** "True" asserts authority over a number the user invented thirty seconds
earlier. It is a small word doing a lot of unearned work, and it is the kind of
thing a sharp reviewer picks on.

**Also fix the sub-label:** `₹190 / planned wear` → `₹190 per wear at 10 wears`.
Make the dependency on the user's own input explicit rather than implied.

---

### P0-5. Strip the feature promises from the hesitation options

**Where:** "What's holding you back?" — the descriptive text under each option.

**Why:** Two of these describe capabilities the app does not have, and one
breaks a stated rule.

| Current text | Problem |
|---|---|
| "Compare fabric durability, brand premium, and resale value against similar marketplace sets." | References competing marketplaces. Breaks seller-protection rule 10. |
| "Scan your synced wardrobe to generate restyling combinations with bottoms and dupattas you own." | Describes wardrobe recognition, which is explicitly out of scope and does not exist. |
| "Evaluate bust and waist stretch tolerance based on reviews from customers with matching profiles." | Implies body-profile matching that does not exist. |
| "Verify verified buyer photos, colour bleeding risk, and real embroidery stitch density." | "Colour bleeding risk" is a product-defect claim. Breaks rule 2. |

**Change to:** bare labels only, no descriptions.

```
Is it worth the price?
Will it fit?
Can I trust this listing?
Will I actually wear it?
Is it right for the occasion?
```

This also resolves most of the clutter on that screen. Four options with three
lines of prose each is why it feels dense.

**Acceptance:** no text in the app describes a capability that is not built.

---

### P0-6. Remove traffic-light colour semantics

**Where:** Trust & Verification block (all green ticks), the score ring (green),
and by implication whatever colour the considerations section inherits.

**Why:** Two reasons, and both are in the brief. Colour-blind readability is an
explicit deck guideline and applies to the artefact too. More importantly, if
verification is green then considerations will land as amber or red, which makes
them read as warnings about the product — the exact seller-devaluation failure
the whole design avoids.

**Change to:** neutral icon treatment throughout. Icons in the same near-white
or grey as the body text. Reserve colour for the single primary action button
only.

**Acceptance:** greyscale the screen. Nothing loses meaning.

---

## P1 — Do these after P0 if time allows.

### P1-1. Fix the dead navigation

Bottom nav (Discover, Check, Closet, Bag) and top nav (Discovery Hub,
notifications, profile) all point at `#`. A reviewer will click them.

**Options, in order of preference:**
1. Render inactive items as visibly disabled (reduced opacity, no tap feedback)
2. Point every one at the wishlist route so nothing appears broken
3. Remove the nav entirely — this is a focused prototype, not a full app

If "Discovery Hub" links to your Part 1 discovery engine, wire it up properly
and mention it on the MVP slide. Same stack end to end is a good story.

---

### P1-2. Add the "Why am I seeing this?" evidence drawer

Currently the trust block asserts and nothing is checkable. The drill-down is
what separates this from a chatbot, and it is the direct answer to the finding
that this segment treats reviews as due diligence rather than reassurance.

**Minimum viable version:** a link under each statement opening a bottom sheet:

```
SIZE CHART      Runs narrow; brand advises half a size up.
REVIEWER        Verified purchase: sized up half a size, fit was comfortable.
YOUR INPUT      You said you usually take M.
```

If time is short, ship it on the considerations section only. That is where
checkability matters most.

---

### P1-3. Add the progress state

Header currently reads "Saved Items (6)". Add:

```
2 of 6 checked · 1 resolved
```

Small, but it is what makes this a bounded session with a completion state
rather than another surface to browse. That framing is a differentiator.

---

### P1-4. Settle the naming

Currently in use: "Match Studio", "Diagnostic Detail", "AI Match", "Match
Check". Pick **Match Check** and use it in every header, title and label.
"Diagnostic" in particular reads clinical and implies a verdict on the item.

---

## P2 — Only if everything above is done.

### P2-1. Real brand names on the trust product

The sneakers are a real brand at a steep discount, and they are the trust item.
If any generated line implies that a discounted listing of a real brand warrants
scrutiny, that is an implied counterfeit claim about an identifiable company on
a mock Myntra page.

**Safest fix (~15 min):** rename all six brands to invented ones, keep
everything else.

**If not renaming:** manually verify that product's output contains no
consideration mentioning the discount, authenticity, seller, or "first copy",
and that its trust block is purely affirmative. Check this by hand before
submitting regardless of which route you take.

---

### P2-2. Discount display

Strikethrough MRP on the lehenga and sneakers is fine — it is the existing
Myntra context, not your intervention. Worth one line on the solution slide:
your feature adds no monetary incentive, it resolves the doubt the discount
itself creates.

---

## Verification checklist before submission

- [ ] No numeric score, grade, or overall verdict anywhere
- [ ] "Things to consider" and "What remains unclear" render, at equal weight to positives
- [ ] Greyscale test passes on the result screen
- [ ] No badge or adjective evaluates the cost-per-wear number
- [ ] No text describes an unbuilt capability
- [ ] No reference to any competing marketplace
- [ ] Considerations phrased conditionally, never as verdicts
- [ ] Trust block affirmative only; no hedged or "limited data" state on any product
- [ ] Nav links either work or are visibly disabled
- [ ] One consistent product name throughout
- [ ] Illustrative-data disclosure visible on every screen
- [ ] Full flow tested on a real phone, in a private window, on mobile data
- [ ] App still loads if the model API times out (cached fallback path)

---

## What is deliberately NOT changing

- The deployment platform. It works, it is public, it is fast enough.
- The product set, images and prices.
- The three-question context flow.
- The Inner Circle mechanic.

Fix the six P0 items and the app demonstrates the argument the deck makes. That
is the bar. Everything past P1 is optional with 26 hours on the clock.
