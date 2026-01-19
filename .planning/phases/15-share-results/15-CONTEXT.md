# Phase 15: Share Results - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can share their quiz results as an image card via iOS share sheet. The share card displays score and performance with mascot and branding. This phase covers the share button, card generation, and native share sheet integration.

</domain>

<decisions>
## Implementation Decisions

### Card visual design
- Mascot as center hero — the main visual element with stats around it
- Special "share" pose mascot image (not tier-based) — dedicated celebratory image
- Card shape determined by content (Claude decides optimal aspect ratio)

### Share trigger & flow
- Share button placed with action buttons (Play Again / Home) on Results screen
- Button style matches existing action buttons for consistency

### Card content
- Stats shown: score + correct count (no tier, no streak/time bonus)
- Score displayed as large bold number (no label like "points")
- Performance-based headline (dynamic text like "Perfect!" or "Great job!")

### Branding & polish
- Bottom banner with app name only ("MedTriads")
- Subtle use of teal accent color — small touches, not dominant
- Playful/game-like feel — like Wordle's share cards

### Claude's Discretion
- Card background style (gradient vs solid)
- Exact card aspect ratio based on content layout
- Correct count presentation format
- Share button timing relative to animations
- Whether to also enable sharing from Progress screen

</decisions>

<specifics>
## Specific Ideas

- "Like Wordle's share cards" — playful, game-like, shareable
- Mascot is the hero element, centered
- Keep it simple: score + correct count, no extra clutter

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-share-results*
*Context gathered: 2026-01-19*
