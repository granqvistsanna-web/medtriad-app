# Phase 17: Design System Audit - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance DESIGN-SYSTEM.md documentation and audit all components for alignment with design tokens. Fix hardcoded values and align visual style to a consistent Duolingo-inspired aesthetic with hard borders/shadows.

</domain>

<decisions>
## Implementation Decisions

### Documentation scope
- Reference-only documentation (token names and values, quick lookup)
- Text-only format (no screenshots/mockups)
- Cover all token categories: Colors, Spacing, Radius, Typography, Icons, Animation, Timing
- Include "common mistakes" section with antipatterns to avoid

### Audit approach
- Full sweep of every component for hardcoded values
- Fix issues directly (no separate report phase)
- Align all cards to button style: hard borders/shadows everywhere
- Apply hard border treatment to ALL cards (HeroCard, stat cards, library cards, settings sections)

### Token organization
- Light reorganization of theme.ts (group related tokens without breaking changes)
- Ensure good color contrast throughout
- No code comments when fixing issues — just clean fixes

### Style alignment
- Duolingo-inspired visual design as north star
- Match button style (hard borders/shadows) across all card elements
- Bold, playful feel over soft/gentle

### Claude's Discretion
- DESIGN-SYSTEM.md file location
- Whether to create named shadow tokens vs shared CardStyle constant
- How to integrate Duolingo-inspired values (separate section vs blended)
- Specific antipatterns to document beyond hardcoded colors and magic numbers

</decisions>

<specifics>
## Specific Ideas

- "Duolingo-inspired visual design" — bold, playful, hard edges
- Buttons have hard border/shadow, HeroCard is soft — align everything to button style
- Contrast should be good throughout

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-design-system-audit*
*Context gathered: 2026-01-19*
