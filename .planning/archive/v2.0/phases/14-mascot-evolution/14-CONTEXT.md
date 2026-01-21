# Phase 14: Mascot Evolution - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Mascot visually evolves as user progresses through tiers. Different mascot image for each of the 6 tiers, with celebration animation on tier-up. Accessories are predefined in roadmap (None → Bandaid → Clipboard → Stethoscope → Head mirror → Gold badge).

</domain>

<decisions>
## Implementation Decisions

### Mascot visuals
- 6 distinct pre-composed PNG images (one per tier)
- User will provide all mascot images with accessories already placed
- No runtime compositing or layering needed

### Tier-up celebration
- Triggers on Results screen after game that unlocked the tier
- Confetti burst animation with rainbow/festive colors (not brand-specific)
- Prominent "Level Up!" message with new tier name (e.g., "Level Up! You're now a Resident")
- Mascot transition (scale out/in) happens during confetti burst

### Mascot placement
- Tier-specific mascot shows on Home screen only
- Other screens (Results, Quiz) continue using base mascot or current behavior
- Onboarding uses dedicated onboarding mascot (user will provide)
- Share card (Phase 15) will use special asset (user will provide) — noted for Phase 15

### Transition behavior
- Scale out old mascot, scale in new mascot (not crossfade or instant)
- Transition happens during confetti, not before or after
- Home screen shows subtle glow/shimmer on new mascot first time it's viewed after tier-up
- Catch-up celebration: If user missed tier-up (app closed), show celebration on next Home screen visit

### Claude's Discretion
- Sizing of mascot per context (keep current or adjust as appropriate)
- Exact animation timing and easing for scale transitions
- Confetti particle count, duration, and physics
- Glow effect implementation details

</decisions>

<specifics>
## Specific Ideas

- Scale out/in transition paired with confetti creates a dramatic reveal moment
- Glow on first Home visit after tier-up reinforces the achievement
- Catch-up celebration ensures users never miss their tier-up moment

</specifics>

<deferred>
## Deferred Ideas

From research paste (out of scope for Phase 14):
- XP-based progression system instead of games played — future enhancement
- Keychain persistence for cross-install recognition — future phase
- Spaced repetition algorithm integration — v3.0 Engagement
- Affective mascot states based on streak/performance — could be Phase 14 extension or separate phase
- Peer-based leaderboards — v3.0 Engagement
- Clinical scenario questions — content enhancement
- Triad relationship widgets/visualizations — content enhancement

</deferred>

---

*Phase: 14-mascot-evolution*
*Context gathered: 2026-01-19*
