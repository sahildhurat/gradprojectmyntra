# Stitch AI Prompt: Myntra Match Check Frontend

**Copy and paste the text below directly into Stitch AI to generate the frontend screens.**

---

Build the frontend UI for **"Myntra Match Check"**, a mobile-first premium feature that helps shoppers resolve purchase hesitation using AI insights and community validation.

### Tech Stack & Constraints
- **Framework**: React / Next.js (Functional components).
- **Styling**: Vanilla CSS (CSS Modules) using the provided design tokens. Do NOT use Tailwind CSS.
- **Design Aesthetic**: Extremely premium, mobile-first, dark mode, glassmorphism, dynamic micro-animations, vibrant gradients, and sleek typography (Inter). It must WOW the user.
- **Data**: Use hardcoded placeholder data for products, prices, and text for now. (I will wire up dynamic props later).

### Global Design Tokens
Please use these CSS variables for styling consistency:
```css
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: rgba(255, 255, 255, 0.04);
  --color-bg-glass: rgba(255, 255, 255, 0.06);
  --color-surface-elevated: rgba(255, 255, 255, 0.08);
  --color-accent-primary: #ff3f6c; /* Myntra Pink */
  --color-accent-secondary: #f5a623;
  --color-accent-green: #27ae60;
  --color-text-primary: #f0f0f0;
  --color-text-secondary: #a0a0a0;
  --color-text-muted: #666666;
  --color-border: rgba(255, 255, 255, 0.08);
  --font-family: 'Inter', sans-serif;
  --shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.2);
```

### Screens to Generate (Total 6)

**1. Wishlist Screen**
- A persistent illustrative header banner reading: *"Illustrative product and review data — built for prototype testing."* with an amber background.
- A grid of product cards showing: image, brand, name, price, rating.
- Each product card has a prominent CTA button: **"Check if it's right for me"** (use a sleek spark/AI icon).

**2. Context Flow Screen (The Setup)**
- A clean, stepped form layout.
- **Occasion Picker**: 6 selectable chips (e.g., Everyday, Work, Wedding, Date).
- **Expected Wears Slider**: A smooth slider (1-50 wears) that instantly calculates and displays **Live Cost-Per-Wear** (e.g., "₹1,899 ÷ 10 wears = ₹189/wear").
- **Hesitation Picker**: Radio cards asking "What's holding you back?" (Options: Worth the price?, Will it fit?, Can I trust this?, Will I actually wear it?).
- **Submit Button**: "Generate my Match Check" with a loading state/spinner.

**3. Match Check Result Screen (The AI Assessment)**
- **Trust Block**: A module at the top confirming seller trust (e.g., "Brand-authorised seller", "14 days return"). Use shield/check icons.
- **Why it could work (Match Reasons)**: A list of positive alignments with the user's context. Include a clickable "Why?" badge that opens an Evidence Drawer.
- **Things to consider (Considerations)**: A list of potential issues phrased conditionally (e.g., "If you have broad shoulders, consider sizing up."). Include clickable "Why?" badges.
- **Evidence Drawer**: A sleek bottom-sheet modal that slides up when "Why?" is clicked, showing the source review/data (e.g., "Verified Purchase Review: 'Runs very small across the chest'").
- **Cost-Per-Wear Explorer**: An interactive module to play with the cost-per-wear math again.
- **Decision Question**: A footer asking "Would this feel worth it?" with three chips: Yes / Not Sure / No.
- **Next Step Button**: "Continue to my decision".

**4. Decision Checkpoint Screen**
- A hero area asking: "Did that resolve your doubt?"
- Three large primary action buttons stacked vertically:
  1. **Buy this** (Primary highlight)
  2. **Ask my Inner Circle** (Secondary glow)
  3. **Not right for me** (Outline/Ghost)

**5. Inner Circle Share Screen**
- A visually rich **Share Card** summarizing the shopper's dilemma (Product image, Occasion, calculated Cost-per-wear, and the main concern/consideration).
- Large buttons to share via WhatsApp or copy a link.

**6. Inner Circle Voting Screen**
- What the friend sees when they open the link.
- Displays the **Share Card** from Screen 5.
- A **Voting Form** with options: "Works for you", "Only if...", "Not for this use", "Not sure". Include an optional text input for a comment.
- After voting, show a **Vote Results** summary with avatars/names of people who voted.

### Animation & Micro-interaction Requirements
- Use smooth CSS transitions (300ms ease) for all button hovers and chip selections.
- The Evidence Drawer should slide up smoothly from the bottom.
- When generating the Match Check, show a skeleton loading state or a sleek pulsing gradient.
- Ensure all touch targets are at least 44px for mobile accessibility.

Please generate the React components, CSS Modules, and a basic routing/layout structure tying these 6 screens together so I can preview the entire flow.
