# Phase 11: Level System - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users progress through 6 named tiers (Student → Chief) based on games played. Each tier has a name and progress toward the next tier is trackable. Tier-based mascot images are Phase 14. Hero screen display is Phase 12.

</domain>

<decisions>
## Implementation Decisions

### Tier Colors
- No distinct colors per tier — use existing app accent color throughout
- All tiers share the same visual style, differentiated only by name

### Progress Display
- Progress bar (no percentage or numbers)
- Thin line style (~4-6px height), understated and subtle
- Bar fills based on games played toward next tier threshold
- At max tier (Chief): bar stays filled at 100%

### Where Tiers Appear
- **Results screen:** Show current tier name after quiz
- **Progress screen:** Tier name + progress bar at top as header section
- **Home screen:** Phase 12 handles this
- **Settings/Library:** No tier display

### Claude's Discretion
- Exact progress bar color (likely teal accent)
- Progress bar animation on fill
- Tier name typography and placement details
- How tier info integrates with existing Progress screen layout

</decisions>

<specifics>
## Specific Ideas

- Keep it minimal — thin progress bar with no numbers feels cleaner
- Tier system should feel like natural progression, not gamification overload

</specifics>

<deferred>
## Deferred Ideas

- Different mascot images per tier — Phase 14
- Tier-up celebration animation — Phase 14
- Tier badge on Home hero — Phase 12
- Tier accent colors — user explicitly declined

</deferred>

---

*Phase: 11-level-system*
*Context gathered: 2026-01-19*
