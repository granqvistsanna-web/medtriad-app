# Phase 4: Game Mechanics - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Scoring system and timer behavior that create engaging gameplay pressure. User earns points with combo multipliers, timer provides urgency with color transitions. Visual feedback systems and persistence are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Score display
- Position: Top corner, compact — focus stays on question, not score
- Floating points: Show total earned (e.g., "+150") floating up from tapped answer
- No breakdown shown — just single combined number for clean reading
- Points originate from the answer button that was tapped

### Combo feedback
- Position: Near score display (top corner area)
- Appearance: Claude's discretion on badge/text style
- On increase: Visual pulse animation (scale up briefly, then settle)
- No progress indicator — only current multiplier shown, increases feel like surprises
- Combo resets quietly — just returns to 1x, no drama

### Point calculations
- Speed bonus: Front-loaded curve — more bonus for very fast answers, drops quickly
- Combo multiplier caps at 3x maximum
- Perfect round bonus (+500): Shown after last question with special celebration moment before results screen

### Cancel/quit button
- Add cancel button to quiz screen (during gameplay)
- Shows confirmation dialog before exiting ("Are you sure?")
- Exits to home screen if confirmed

### Claude's Discretion
- Exact combo multiplier visual style (badge, text, etc.)
- Speed bonus curve formula (as long as front-loaded)
- Floating points animation duration and style
- Perfect round celebration design
- Cancel button position and styling

</decisions>

<specifics>
## Specific Ideas

- Floating points should feel satisfying — clear feedback that points were earned
- Combo increases should feel like small wins (the pulse)
- Perfect round moment should feel special before transitioning to results

</specifics>

<deferred>
## Deferred Ideas

- More engaging home screen — explore ways to make home screen more inviting/gamified (future phase or backlog)

</deferred>

---

*Phase: 04-game-mechanics*
*Context gathered: 2026-01-18*
