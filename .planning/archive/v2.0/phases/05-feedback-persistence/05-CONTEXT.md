# Phase 5: Feedback & Persistence - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

User receives clear feedback on answers and progress persists across sessions. Covers visual answer feedback, haptic patterns, and AsyncStorage persistence for stats (high score, streak, total quizzes).

</domain>

<decisions>
## Implementation Decisions

### Answer Feedback Visuals
- Correct answer: Green border highlight (keep current style, add thick green border)
- Incorrect answer: Red border on selected + green border on correct answer simultaneously
- Non-selected answers: Fade/dim opacity during 1.5s feedback pause to focus attention
- Timeout: Just reveal correct answer with green border (no red, no punishment visual)

### Haptic Feedback
- Correct answer: Light haptic (subtle, understated confirmation)
- Incorrect answer: Light haptic (same as correct, consistent, not punishing)
- Combo tier increase: Light pulse (subtle acknowledgment of milestone)
- Timeout: No haptic (silent, visual feedback only)

### Claude's Discretion
- Exact border thickness and color values for feedback states
- Opacity level for faded non-selected answers
- Persistence data structure and migration strategy
- Streak logic edge cases (midnight timing, timezone handling)

</decisions>

<specifics>
## Specific Ideas

- Keep haptics consistent and understated — the app should feel helpful, not punishing
- Timeout treated gently (just reveal correct) vs incorrect (show what you got wrong)
- Visual hierarchy during feedback: selected answer + correct answer prominent, others fade back

</specifics>

<deferred>
## Deferred Ideas

- Navigation menu — new capability, future phase
- Share/recommend app — new capability, future phase
- Polish design — covered in Phase 6 (already in roadmap)

</deferred>

---

*Phase: 05-feedback-persistence*
*Context gathered: 2026-01-18*
