# Phase 16: Quiz Mode UX - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Improve the quiz screen's visual hierarchy and ensure no-scroll layout. All content must fit on screen without scrolling. Remove text-based feedback ("Correct!"/"Incorrect!") in favor of button color changes. This is about how the existing quiz presents information, not adding new quiz features.

</domain>

<decisions>
## Implementation Decisions

### Answer Feedback Style
- Correct answer: green fill only (no checkmark icon)
- Wrong answer: red fill + subtle horizontal shake (2-3 oscillations)
- When wrong: also reveal correct answer in green
- Auto-advance delay: 1.2 seconds after feedback shows

### Layout Constraints
- When space is tight on smaller screens, reduce spacing first (keep all elements)
- Minimum tap target: 48pt for answer buttons
- Timer and score stay prominent at top (do not shrink)
- Larger screens scale up content (bigger text and buttons, not just more padding)

### Visual Hierarchy
- "IDENTIFY THE TRIAD" label: small caps, muted/secondary text color
- Symptoms card: background contrast (different background color, no border or shadow)
- Question count ("3 of 10") visible near timer/score in top area

### Claude's Discretion
- Exact shake animation parameters
- Specific spacing values that work across device sizes
- How to implement content scaling for larger screens
- Exact background color for symptoms card contrast

</decisions>

<specifics>
## Specific Ideas

No specific references — open to standard approaches that match existing design system.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-quiz-mode-ux*
*Context gathered: 2026-01-19*
