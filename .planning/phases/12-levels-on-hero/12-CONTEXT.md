# Phase 12: Levels on Hero - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Display current tier prominently on Home screen hero area — tier name, progress bar, badge, and accent color. This builds on the Level System from Phase 11 to make progression visible on the main screen.

</domain>

<decisions>
## Implementation Decisions

### Tier Display Placement
- Tier name appears below the mascot
- Medium label prominence — clear but not dominant, supporting info to mascot
- Container style: Claude's discretion (inline vs subtle card)
- Tapping tier area navigates to Progress tab

### Progress Visualization
- Horizontal bar style (reuse TierProgressBar from Phase 11)
- Bar only — no text showing games count or percentage
- Bar width: Claude's discretion (full width or matching tier label)
- Fill animation on Home screen appear — bar fills from empty to current progress

### Badge Design
- Yes, include a tier badge
- Shield shape
- Badge placement: Claude's discretion (next to tier name or on mascot)
- Badge displays tier number inside (1, 2, 3, etc.)

### Claude's Discretion
- Container style for tier section (inline vs subtle card)
- Progress bar width
- Badge placement (next to name vs on mascot)
- Animation timing and easing (use Phase 10 motion principles)
- Color treatment for tier accent (not discussed — Claude decides)

</decisions>

<specifics>
## Specific Ideas

- Reuse TierProgressBar component from Phase 11
- Follow Phase 10 motion principles for fill animation (soft, weighted, settles)
- Shield badge with tier number feels achievement-oriented

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-levels-on-hero*
*Context gathered: 2026-01-19*
