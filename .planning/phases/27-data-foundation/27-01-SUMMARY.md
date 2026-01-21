---
phase: 27-data-foundation
plan: 01
subsystem: database
tags: [asyncstorage, performance-tracking, data-layer, analytics]

# Dependency graph
requires:
  - phase: 23-study-mode
    provides: Study mode quiz flow
  - phase: 09-stats-persistence
    provides: AsyncStorage patterns for stats
provides:
  - Per-triad performance tracking (correctCount, incorrectCount, lastSeenAt)
  - Response time recording with rolling averages
  - Triad performance storage service with CRUD operations
affects: [28-adaptive-difficulty, 29-spaced-repetition, 30-daily-challenges]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rolling average calculation for response times"
    - "Fire-and-forget async storage pattern for non-critical data"
    - "Triad-level granular performance tracking"

key-files:
  created:
    - medtriad/types/triad-performance.ts
    - medtriad/services/triad-performance-storage.ts
  modified:
    - medtriad/types/quiz-state.ts
    - medtriad/hooks/use-quiz-reducer.ts
    - medtriad/app/quiz/index.tsx
    - medtriad/app/quiz/study.tsx

key-decisions:
  - "Response time calculation: (questionTime - timeRemaining) * 1000 for simplicity (already have timeRemaining in action)"
  - "Study mode records 0ms response time (untimed mode, may track actual elapsed time in future)"
  - "Timeout answers recorded with full questionTime as response time (slowest possible)"
  - "Fire-and-forget storage pattern to prevent blocking quiz flow on storage failures"

patterns-established:
  - "Per-triad metrics pattern: Each triad gets individual performance record"
  - "Rolling average pattern: avgResponseTimeMs updated incrementally without storing all samples"
  - "Atomic recording: Each answer triggers immediate storage update"

# Metrics
duration: 3min
completed: 2026-01-21
---

# Phase 27 Plan 01: Data Foundation Summary

**Per-triad performance tracking with response times, correct/incorrect counts, and last-seen timestamps - foundation for adaptive difficulty, spaced repetition, and daily challenges**

## Performance

- **Duration:** 3min
- **Started:** 2026-01-21T20:28:58Z
- **Completed:** 2026-01-21T20:32:20Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Created TriadPerformance type system with correctCount, incorrectCount, lastSeenAt, avgResponseTimeMs, responseCount
- Implemented triad-performance-storage service following existing AsyncStorage patterns from stats-storage.ts
- Integrated performance tracking into Quiz Mode (with accurate response times) and Study Mode (with 0ms placeholder)
- Response time tracking added to quiz reducer with proper handling of timeouts
- All tracking runs fire-and-forget to prevent blocking quiz flow

## Task Commits

Each task was committed atomically:

1. **Task 1: Create triad performance types and storage service** - `1fa94cd` (feat)
2. **Task 2: Track response time in quiz reducer** - `5164916` (feat)
3. **Task 3: Integrate triad performance tracking into quiz flows** - `16b3a3b` (feat)

## Files Created/Modified
- `medtriad/types/triad-performance.ts` - Type definitions for per-triad performance data
- `medtriad/services/triad-performance-storage.ts` - AsyncStorage CRUD for triad performance (load, save, record, get)
- `medtriad/types/quiz-state.ts` - Added questionStartedAt and lastResponseTimeMs fields
- `medtriad/hooks/use-quiz-reducer.ts` - Response time calculation in SELECT_ANSWER, timeout handling in TICK_TIMER
- `medtriad/app/quiz/index.tsx` - recordTriadAnswer calls in handleAnswerSelect and timeout useEffect
- `medtriad/app/quiz/study.tsx` - recordTriadAnswer call in handleAnswerSelect with 0ms response time

## Decisions Made

**1. Response time calculation method**
- Used `(questionTime - timeRemaining) * 1000` instead of timestamp difference
- Rationale: timeRemaining already available in SELECT_ANSWER action, simpler than Date.now() - questionStartedAt
- questionStartedAt kept in state for future use (could track pause time, interruptions, etc.)

**2. Study mode response time = 0ms**
- Study mode is untimed, so 0ms indicates "not timed"
- Future phases can decide whether to track actual elapsed time in study mode
- Keeps data clean: 0ms clearly distinguishes untimed from timed answers

**3. Timeout handling = full questionTime**
- Timeouts recorded with responseTimeMs = questionTime * 1000 (e.g., 15000ms for 15s timer)
- Represents "slowest possible response" for this question
- Useful signal for adaptive difficulty: repeatedly timing out = too hard

**4. Fire-and-forget storage pattern**
- All recordTriadAnswer calls use `.catch(console.error)` without await
- Prevents storage failures from blocking quiz flow
- Non-critical data: quiz continues even if performance tracking fails

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed existing patterns cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Foundation complete for v3.0 engagement features:**

Ready for Phase 28 (Adaptive Difficulty):
- Per-triad correctCount and incorrectCount available for difficulty assessment
- Historical data accumulates with each quiz/study session

Ready for Phase 29 (Spaced Repetition):
- lastSeenAt timestamps enable interval calculations
- correctCount/incorrectCount enable SM-2 easiness factor

Ready for Phase 30 (Daily Challenges):
- Performance data available for selecting challenging triads
- avgResponseTimeMs can identify "tricky" items (high response time despite correct answers)

**Data accumulation:**
- Performance data begins accumulating immediately
- More historical data = better adaptive algorithms
- Early users build richer performance profiles for v3.0 features

**No blockers.**

---
*Phase: 27-data-foundation*
*Completed: 2026-01-21*
