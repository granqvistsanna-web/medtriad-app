# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-21)

**Core value:** Users can quickly test and reinforce their knowledge of medical triads through satisfying, game-like quiz sessions
**Current focus:** v3.0 Engagement & Polish — Adaptive difficulty, spaced repetition, daily challenges, tech debt cleanup

## Current Position

Phase: 29 - Spaced Repetition
Plan: 4 of 4
Status: Phase complete
Last activity: 2026-01-22 — Completed 29-04-PLAN.md (Quiz Integration)

### Progress

```
Phase 27: Data Foundation     [█] Complete (1/1 plans)
Phase 28: Adaptive Difficulty [██] Complete (2/2 plans)
Phase 29: Spaced Repetition   [████] Complete (4/4 plans)
Phase 30: Daily Challenges    [ ] Ready
Phase 31: Tech Debt Cleanup   [ ] Blocked (needs 27-30)
```

## Milestones

| Milestone | Phases | Status | Shipped |
|-----------|--------|--------|---------|
| v1.0 MVP | 1-8 | Shipped | 2026-01-18 |
| v2.0 Polish & Progression | 9-20 | Shipped | 2026-01-20 |
| v2.1 Design System, Study Mode & App Store | 21-26 | Shipped | 2026-01-21 |
| v3.0 Engagement & Polish | 27-31 | Active | — |

## Performance Metrics

**v1.0 Summary:**
- Total plans completed: 18
- Phases: 8

**v2.0 Summary:**
- Plans completed: 28
- Phases completed: 12 (9-20)
- Requirements: 38 total, 38 complete

**v2.1 Summary:**
- Plans completed: 18
- Phases: 6 (21-26)
- Requirements: 37 total, 37 complete

**v3.0 Progress:**
- Phases: 3/5 complete (27, 28, 29)
- Plans: 8 complete (27-01, 28-01, 28-02, 29-01, 29-02, 29-03, 29-04)
- Requirements: 24/26 complete

**Cumulative:**
- Total phases: 29 complete, 2 in progress (30, 31)
- Total plans: 73 complete
- Total lines: ~126,000 TypeScript

## Accumulated Context

### Decisions

| Decision | Phase | Rationale |
|----------|-------|-----------|
| Response time via (questionTime - timeRemaining) | 27-01 | Simpler than timestamp diff, timeRemaining already in action |
| Study mode records 0ms response time | 27-01 | Untimed mode - 0ms clearly distinguishes from timed answers |
| Timeout = full questionTime as response | 27-01 | Represents slowest possible response, useful for difficulty |
| Fire-and-forget storage pattern | 27-01 | Non-critical data shouldn't block quiz flow on failures |
| Multiplicative weight stacking | 28-01 | Weak 2x + tricky 3x = 6x creates stronger prioritization |
| Tier 1-2 no difficulty adjustment | 28-01 | Beginners get even distribution - avoids overwhelming |
| Jest for testing infrastructure | 28-01 | Needed test infrastructure for this phase and future phases |
| Async with sync fallback for quiz init | 28-02 | Quiz always starts even if adaptive selection fails |
| Binary quality mapping (correct=4, incorrect=1) | 29-01 | Simpler than 0-5 scale for binary quiz results |
| 14-day max review interval | 29-01 | Prevents content exhaustion with 45-item dataset |
| Tricky multiplier only when interval > 1 | 29-01 | First review always gets interval=1, can't go lower |
| Variable question count in Review Mode | 29-02 | Based on due triads count, not fixed like Study Mode's 10 |
| "All Caught Up!" empty state | 29-02 | Shows when no triads are due for review |
| Show disabled Review button when dueCount is 0 | 29-03 | Keeps feature discoverable even when no triads are due |
| Two entry points to Review Mode | 29-03 | Badge for prominence + button for discoverability |
| Review button in separate row | 29-03 | Three buttons in one row would be cramped |
| Quiz/Study Mode sets nextReviewDate to tomorrow | 29-04 | Bootstrap triads into review cycle after initial exposure |
| Subsequent Quiz/Study answers preserve SM-2 schedule | 29-04 | Quiz Mode is for practice, Review Mode manages progression |
| Only Review Mode runs SM-2 algorithm | 29-04 | Clear separation: initialization vs progression logic |

See also: PROJECT.md Key Decisions table for architectural decisions.

### Research Insights (v3.0)

From research/SUMMARY.md:
- **Per-triad tracking is foundation** - All features depend on this data layer
- **SM-2 over FSRS** - For 45 items, simpler algorithm is sufficient
- **Content exhaustion risk** - Cap review intervals at 14 days
- **Integrate daily challenges with existing streak** - Single engagement loop
- **Adaptive affects SELECTION, not presentation** - Tier timers handle difficulty

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-01-22 07:52:09 UTC
Stopped at: Completed 29-04-PLAN.md
Resume file: None

---
*Updated: 2026-01-22 — Completed Phase 29 (Spaced Repetition)*
