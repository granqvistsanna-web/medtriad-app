# Phase 21: Design System Foundation - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish a token-based design system with reusable primitives (Text, Surface, Button, Badge, Tag, Card, Icon wrapper) that all future UI work builds upon. This phase creates the foundation — migrating existing screens to use it is Phase 22.

</domain>

<decisions>
## Implementation Decisions

### Visual language
- **Mood:** Duolingo-inspired but more mature — fun bold buttons, neutral backgrounds, generous whitespace, charm through mascot + copy rather than visual clutter
- **Corner radius:** Rounded style (8-12px range), soft and friendly
- **Shadows:** Hard bottom border/shadow style — the solid darker line on bottom edge that creates a raised/pressed effect (Duolingo-style depth)
- **Typography:** Figtree font — Bold for headings, Medium for body text. Large impactful titles with smaller detail text, overall airy and spacious feel
- **Cards:** No side accent stripes — clean edges, use other visual cues for distinction
- **Contrast:** High contrast for readability — text must be clearly legible against backgrounds
- **Color palette:**
  - Primary: Wine/berry (dark magenta) + darker variant
  - Accent pink: Light pink for backgrounds/badges
  - Achievement/XP: Yellow spectrum (cream, golden, orange-red)
  - Neutrals: Light gray, dark gray
  - Info/category: Blues (light cyan, medium blue, dark navy)
  - Secondary: Purple/lavender tones
  - No teal on interactive elements (remove from settings toggles)

### Icon system
- **Style:** Filled Solar Icons, used sparingly — in badges, nav menu, selective placements (not every card)
- **Colors:** Tonal — on colored backgrounds (e.g., light pink badge), icon is darker shade of that color; on neutral backgrounds, icon can be brand accent (wine/berry)
- **Sizes:** 16px (inline/badges), 20px (buttons), 24px (nav/prominent)

### Claude's Discretion
- Motion/timing values and easing curves
- Exact spacing scale numbers
- Icon subset selection — add from Solar Icons as needed during implementation
- Semantic color naming structure

</decisions>

<specifics>
## Specific Ideas

- "Duolingo but more mature" — reference for the overall personality
- Hard bottom border shadow style creates that characteristic raised button look
- Wine/berry as brand accent color for icons on neutral backgrounds
- Tonal icon colors that harmonize with their container background
- **Style sheet reference provided** — specific color swatches for wine, pink, yellows, grays, blues, purples
- Example icons from style sheet: flame, stethoscope, brain, book, bookmark (Solar filled)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-design-system-foundation*
*Context gathered: 2026-01-20*
