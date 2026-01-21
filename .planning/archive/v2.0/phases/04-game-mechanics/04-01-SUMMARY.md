---
phase: 04-game-mechanics
plan: 01
subsystem: game-logic
tags: [scoring, combo, multiplier, speed-bonus, pure-functions]

# Dependency graph
requires:
  - phase: 02-quiz-core
    provides: Quiz reducer and state management
  - phase: 03-screen-flow
    provides: Quiz screen and results navigation
provides:
  - Scoring service with pure calculation functions
  - Speed bonus system rewarding fast answers
  - Combo tier multiplier (1x/2x/3x) progression
  - Perfect round detection for 10/10 bonus
affects: [04-game-mechanics-02, 05-persistence]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure functions for game calculations (no side effects)
    - Quadratic curve for speed bonus (front-loaded rewards)

key-files:
  created:
    - medtriad/services/scoring.ts
  modified:
    - medtriad/types/quiz-state.ts
    - medtriad/hooks/use-quiz-reducer.ts
    - medtriad/app/quiz/index.tsx

key-decisions:
  - "Quadratic speed bonus curve: 50 * (timeRemaining/totalTime)^2 rewards fast answers heavily"
  - "Combo tier at 3/6 consecutive correct: tier 1 (1x) -> tier 2 (2x) -> tier 3 (3x max)"
  - "State tracks both consecutiveCorrect (raw count) and combo (display tier)"
  - "lastPointsEarned field added for future floating points animation"

patterns-established:
  - "Scoring calculation in pure service, state transition in reducer"
  - "Combo tier derived from consecutive count using getComboTier()"

# Metrics
duration: 3min
completed: 2026-01-18
---

# Phase 4 Plan 1: Scoring System Summary

**Speed bonus with quadratic curve, 3-tier combo multiplier (1x/2x/3x), and perfect round detection using pure scoring functions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-18T09:10:00Z
- **Completed:** 2026-01-18T09:13:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Created scoring service with pure functions for all point calculations
- Implemented quadratic speed bonus (50 points max, front-loaded curve)
- Implemented combo tier multiplier progression at 3 and 6 consecutive correct
- Wired scoring to quiz screen with perfect round detection for results

## Task Commits

Each task was committed atomically:

1. **Task 1: Create scoring service with pure functions** - `b44b835` (feat)
2. **Task 2: Extend types and update reducer with scoring logic** - `ed665e3` (feat)
3. **Task 3: Wire scoring to quiz screen and add perfect round handling** - `87c2bcd` (feat)

## Files Created/Modified
- `medtriad/services/scoring.ts` - Pure scoring functions (calculateSpeedBonus, getComboTier, calculateAnswerPoints, isPerfectRound)
- `medtriad/types/quiz-state.ts` - Added consecutiveCorrect, lastPointsEarned fields; timeRemaining in SELECT_ANSWER action
- `medtriad/hooks/use-quiz-reducer.ts` - Integrated scoring calculations into state transitions
- `medtriad/app/quiz/index.tsx` - Wired scoring and isPerfect param to results navigation

## Decisions Made
- Quadratic speed bonus curve `Math.floor(50 * (ratio)^2)` for front-loaded rewards (12 points at half time vs 25 with linear)
- Combo tier thresholds at 3 and 6 consecutive correct (not 2/4 or 4/8) for achievable progression
- Keep both `consecutiveCorrect` (raw counter) and `combo` (display tier 1-3) in state for flexibility
- Added `lastPointsEarned` field now for future floating points animation (Plan 02)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Scoring system complete and ready for Plan 02 (visual feedback)
- lastPointsEarned available for floating +points animation
- isPerfect param passed to results for celebration animation
- Ready to implement combo badge animation on tier change

---
*Phase: 04-game-mechanics*
*Completed: 2026-01-18*
