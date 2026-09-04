---
name: Neutral Fashion Intelligence
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#9A9A9F'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#ab888b'
  outline-variant: '#5b4042'
  surface-tint: '#ffb2ba'
  primary: '#ffb2ba'
  on-primary: '#670021'
  primary-container: '#ff4f74'
  on-primary-container: '#5a001c'
  inverse-primary: '#bd0043'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  primary-fixed: '#ffd9dc'
  primary-fixed-dim: '#ffb2ba'
  on-primary-fixed: '#400011'
  on-primary-fixed-variant: '#910031'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  headline-xl:
    fontFamily: plusJakartaSans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: plusJakartaSans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: plusJakartaSans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.005em
  title-sm:
    fontFamily: plusJakartaSans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-strong:
    fontFamily: inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  caption:
    fontFamily: inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  caption-medium:
    fontFamily: inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 4px
  space-xs: 8px
  space-sm: 12px
  space-md: 16px
  space-lg: 20px
  space-xl: 24px
  space-2xl: 32px
  space-3xl: 48px
  gutter-mobile: 16px
  gutter-desktop: 24px
  touch-target-min: 44px
---

## Brand & Style

This design system delivers a calm, objective, and analytical environment for fashion e-commerce decision-making. Rejecting the aggressive urgency, gamified badges, and synthetic countdowns endemic to consumer retail, the interface operates with the restraint and precision of an archival tool or high-end bespoke atelier dossier. 

The aesthetic is grounded in **Technical Minimalism** fused with **Editorial Restraint**. It speaks to discerning shoppers seeking substance over hype: weave density, silhouette geometry, fabric breathability, seam finishes, and context suitability. 

### Core Principles
- **Total Neutrality:** Information is displayed dispassionately. The system never nudges, cajoles, or warns with emotive chromatic signifiers.
- **Evidence-Led Parity:** Supportive observations and cautionary variables share identical visual hierarchy, weight, and neutral palette. A prospective fit mismatch is presented with the same dignified typography and tone as a durable double-weave hem.
- **Singular Focus:** Coral (`#FF3E6C`) is deployed with mathematical discipline, strictly limited to the terminal affirmative action (primary CTA) on any given view.

## Colors

The system employs a strict greyscale information architecture punctuated by a solitary functional accent.

### Surfaces and Structure
- **Base Background (`#0D0D0F`):** Deep near-black foundational canvas that recedes into the background to prioritize photographic garments and analytical copy.
- **Surface Layer 1 (`#1A1A1D`):** Elevated cards, module backgrounds, and decision containers.
- **Surface Layer 2 / Hover (`#222226`):** Secondary interactive plates, segmented controls, and micro-interactive surfaces.
- **Borders & Dividers (`#26262B`):** Architectural boundary lines providing structural clarity without visual distraction.
- **Border Focus / Hover (`#3D3D45`):** Explicit tactile feedback for keyboard navigation and input boundaries.

### Monochromatic Text & Semantics
- **Primary Text (`#F2F2F2`):** High-clarity off-white for structural headings, key attributes, and decisive body statements.
- **Secondary Text (`#9A9A9F`):** Balanced mid-grey for technical annotations, contextual dimensions, and comparative observations.
- **Tertiary / Subdued (`#66666B`):** Structural metadata, inactive cues, and hairline guides.

### Accent Discipline
- **Primary Action Coral (`#FF3E6C`):** Strictly restricted to the single primary CTA button per screen (e.g., "Add to Bag", "Proceed to Measurement"). It must never appear on tags, badges, notifications, error borders, icons, or typography.

### Elimination of Semantic Chromatics
Red, amber, and green are entirely prohibited. There are no "warning" states or "success" badges. Considerations—whether validating or cautionary—are rendered in `#F2F2F2` and `#9A9A9F` over `#1A1A1D`.

## Typography

The type system blends the structural refinement of Plus Jakarta Sans for titles with the analytical legibility of Inter for body metrics and editorial assessments.

### Hierarchy & Scale
- **Headlines (20px–24px Bold):** Reserved for module headers, section titles, and product classifications. Kept compact to avoid marketing sensationalism.
- **Body Text (15px–16px Regular):** Optimized for reading garment notes, material compositions, and structural drape properties. Line length must not exceed 68 characters.
- **Captions (13px Regular & Medium):** Used for neutral annotations, specifications (e.g., GSM weight, weave structure), and metadata.
- **Labels (11px Uppercase):** High-density categorical descriptors (e.g., "FABRIC COMPOSITION", "CARE INDEX") set with slight letter tracking for instantaneous scanning.

## Layout & Spacing

The spatial model relies on strict visual discipline with generous breathing room to counteract decision fatigue.

### Grid Framework
- **Mobile (Base):** Single-column layout with a 16px lateral gutter and a minimum 44px vertical touch rhythm.
- **Tablet / Desktop:** 8-to-12 column fluid layout constrained to a maximum content width of 1140px to ensure focused evaluation. Lateral gutters expand to 24px.
- **Split Analysis Layout:** On viewports wider than 1024px, the viewport divides evenly: high-fidelity product imagery on the left, decision-support analysis modules on the right.

### Rhythm & Density
Spacing follows a strict 4px/8px modular base. Content clusters use `space-xs` (8px) and `space-sm` (12px), while distinct decision modules are segmented by `space-xl` (24px) or `space-2xl` (32px). Every interactive target enforces `touch-target-min: 44px` regardless of the element's visual boundary.

## Elevation & Depth

Elevation is achieved purely through chromatic layering and architectural borders rather than heavy drop shadows, reinforcing the flat, physical dossier feel.

### Surface Tiers
1. **Tier 0 (Foundation - `#0D0D0F`):** Canvas backdrop.
2. **Tier 1 (Surface Cards - `#1A1A1D`):** Decision containers, specification breakdowns, and comparison decks. Encased with a 1px solid border (`#26262B`).
3. **Tier 2 (Inlaid Elements - `#222226`):** Chip backgrounds, data tables, and input wells within cards.
4. **Tier 3 (Floating Overlays / Sheets - `#1A1A1D`):** Modals and bottom sheets, bordered with `#3D3D45` and elevated with an ultra-subtle ambient shadow: `0 8px 32px rgba(0, 0, 0, 0.6)`. No colored glow is permitted.

## Shapes

The geometric signature uses a consistent 14px radius on containers, providing an approachable yet structured frame for garments.

### Radius Assignments
- **Elevated Cards & Containers:** Exactly 14px (`0.875rem`).
- **Primary & Secondary Buttons:** 10px to 12px, providing distinct interaction clarity inside 14px containers.
- **Filter Chips & Interactive Pills:** 8px or fully rounded (pill) depending on category distinction.
- **Form Inputs & Interactive Fields:** 10px with a 1px inner border.

## Components

### Buttons
- **Primary Action CTA:** Solid Coral `#FF3E6C`, text `#FFFFFF` in 15px Bold (`plusJakartaSans`). Minimum height 48px (exceeding the 44px touch mandate). Flat surface, zero drop shadow. Used only once per primary view.
- **Secondary / Actionless Buttons:** Background `#222226`, border 1px solid `#26262B`, text `#F2F2F2`. Hover state shifts border to `#3D3D45`.
- **Ghost / Tertiary Buttons:** Transparent fill, borderless, text `#9A9A9F` with hover transitioning to `#F2F2F2`.

### Cards & Decision Containers
Constructed with `#1A1A1D` fill, 14px border-radius, and 1px solid `#26262B` border. Content within must be cushioned with 16px (mobile) to 20px (desktop) internal padding.

### Supportive & Cautionary Considerations (The Parity Standard)
- Both supportive and cautionary notes use identical background (`#1A1A1D`), identical border (`#26262B`), and identical typography hierarchy.
- **Supportive Note:** 
  - Icon: A minimal greyscale outline checkmark or neutral bullet in `#9A9A9F`.
  - Header: 15px Bold `#F2F2F2` (e.g., "Breathable Open Weave").
  - Description: 13px Regular `#9A9A9F` detailing the functional benefit.
- **Cautionary Note:**
  - Icon: A minimal greyscale outline circle-i or neutral dash in `#9A9A9F`. (No amber/red triangles or exclamation points).
  - Header: 15px Bold `#F2F2F2` (e.g., "Dry Clean Mandatory").
  - Description: 13px Regular `#9A9A9F` detailing the technical trade-off.

### Chips & Attribute Selectors
- **Unselected:** Background `#1A1A1D`, border 1px solid `#26262B`, text `#9A9A9F`.
- **Selected:** Background `#222226`, border 1px solid `#F2F2F2`, text `#F2F2F2`. No colored badge fills.

### Form Inputs & Selectors
- Height 48px. Background `#141416`, border 1px solid `#26262B`, text `#F2F2F2`, placeholder `#66666B`.
- Focused state: Border `#9A9A9F`. Never colored.

### Strict Omissions
The component library strictly excludes:
- Timer ribbons and "Only 2 left" countdown indicators.
- Rating star clusters, score rings, or percentage match wheels.
- Discount/sale callout pills, cross-out promo price styling, or urgent badges.