---
name: Chronicle Intel
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#ece7e7'
  surface-container-highest: '#e6e1e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444652'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747683'
  outline-variant: '#c3c6d6'
  surface-tint: '#385ab1'
  primary: '#001f5b'
  on-primary: '#ffffff'
  primary-container: '#003289'
  on-primary-container: '#809ffb'
  inverse-primary: '#b3c5ff'
  secondary: '#a04100'
  on-secondary: '#ffffff'
  secondary-container: '#ff8849'
  on-secondary-container: '#6b2900'
  tertiary: '#481000'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c1e01'
  on-tertiary-container: '#f5845e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#00174a'
  on-primary-fixed-variant: '#1a4197'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb693'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#7a3000'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390b00'
  on-tertiary-fixed-variant: '#7e2b0c'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e6e1e1'
  success-emerald: '#10b981'
  warning-amber: '#f59e0b'
  error-rose: '#f43f5e'
typography:
  headline-lg:
    fontFamily: Work Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  meta-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  code-table:
    fontFamily: ui-monospace
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 12px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  container-margin: 20px
---

## Brand & Style
Chronicle Intel is a sophisticated geopolitical analysis platform designed for decision-makers. The brand personality is **authoritative, analytical, and objective**, yet retains an modern, accessible edge to deliver complex data efficiently.

The design style is **Corporate Modern with a Data-Centric emphasis**. It utilizes a clean, systematic layout inspired by high-end editorial and financial reporting. Visual clarity is prioritized through a "Surface-First" approach, where information is layered using tonal containers and subtle borders rather than aggressive shadows. The aesthetic is professional and utilitarian, ensuring that the gravity of "Critical Updates" is felt through typography and color-coded status indicators rather than decorative elements.

## Colors
The palette is rooted in a deep **Intelligence Blue** (Primary), signifying trust and stability. This is balanced by a **Warm Terracotta** (Secondary) used for specific accents and data points that require attention without the alarm of a pure red.

Semantic coloring is crucial for the "Game Changer" and "Scenario" logic:
- **Emerald/Green:** Low misread risk, positive eskalasi, or stability.
- **Amber/Gold:** Medium risk, monitoring required, financial warfare triggers.
- **Rose/Red:** High critical status, territory violations, or direct conflict.

The neutral scale uses "warm grays" (Surface tiers) to keep the long-form reading experience comfortable and less clinical than pure monochrome grays.

## Typography
The system employs a three-font strategy to differentiate information hierarchy:
- **Work Sans (Headlines):** High-impact, geometric, and authoritative for titles and major headers.
- **Source Serif 4 (Body):** A highly legible serif chosen for intelligence summaries and scenario descriptions, facilitating extended reading of complex text.
- **Inter (Labels/UI):** A neutral sans-serif used for metadata, buttons, labels, and UI controls where clarity and space-efficiency are paramount.

Special attention is paid to **Meta** styles, including a monospaced "Code-Table" style used for mathematical formulas and confidence score explanations at the bottom of data cards.

## Layout & Spacing
The layout follows a **Fixed-Width Content approach** for readability, centering the primary feed in a `max-w-3xl` (approx 768px) container on larger screens. 

- **Vertical Rhythm:** Uses a 4px base unit. 24px (`lg`) is the standard spacing between major card elements, while 16px (`md`) is used for internal card padding and content grouping.
- **Horizontal Scaling:** On mobile, a 20px `container-margin` provides a generous safe area. 
- **Bento Grids:** Within cards, analysis points use a 2-column responsive grid with a 16px gutter.
- **Navigation:** A sticky top bar for context and a fixed bottom navigation bar for mobile-first utility.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Low-Contrast Outlines**.

1.  **Level 0 (Background):** `surface` color (#fcf9f8).
2.  **Level 1 (Cards):** `surface-container-lowest` (#ffffff) with a 1px `outline-variant` border and a `shadow-sm` (subtle ambient shadow).
3.  **Level 2 (Insets):** `surface-container` or `surface-container-low` used for internal sections like sentiment analysis or "Why this %" boxes, creating a recessed or "punched-in" look.

Interactive elements (Cards) use a `shadow-md` on hover to provide a tactile lift effect without using traditional skeuomorphism.

## Shapes
The shape language is **Rounded**, signifying a modern and accessible interface.
- **Main Cards:** 12px (`rounded-xl`) corner radius.
- **Secondary Containers (Bento/Insets):** 8px (`rounded-lg`) corner radius.
- **Chips & Action Icons:** Fully rounded (`rounded-full`) for a distinct pill-shaped interactive language.
- **Progress Bars:** Fully rounded ends for a smooth, data-driven feel.

## Components
- **Article Cards:** Large containers with structured headers, summaries, and expandable scenario sections. Must include a colored "Scenario Bar" on the left edge (emerald, amber, or rose) to denote risk levels.
- **Category Chips:** Pill-shaped buttons. Active state uses Primary background with On-Primary text; inactive state uses a subtle outline.
- **Bento Sentiment Boxes:** Small rounded containers with a country flag/icon, a short bold statement, and a status badge at the bottom.
- **Progress/Confidence Indicators:** Horizontal bars using a light gray track and semantic color fills. Often paired with a percentage and "Confidence Score" label.
- **Actor Profiles:** Circular initials (Primary Container) paired with a bold name and a semantic tag (e.g., "Ideological", "Pragmatic").
- **Expansion Triggers:** Text-based links with "fullscreen" or "expand" icons, placed at the bottom-right of card sections.
- **Game Changer Items:** List items with circular icon containers and semantic status badges (e.g., "Sangat Kritis").