---
phase: 29-spaced-repetition
plan: 01
subsystem: learning-algorithms
tags: [spaced-repetition, sm-2, scheduling, review, memory]

# Dependency graph
requires:
  - phase: 27-data-foundation
    provides: "Per-triad performance tracking (TriadPerformance interface)"
  - phase: 28-adaptive-difficulty
    provides: "Test infrastructure (Jest configuration)"
provides:
  - "SM-2 spaced repetition algorithm with binary quality mapping"
  - "Review scheduling service (getDueTriads, recordReviewAnswer)"
  - "14-day interval cap for content exhaustion prevention"
  - "Tricky item interval reduction (0.5x multiplier)"
affects: [30-review-mode, daily-challenges]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SM-2 algorithm with binary quality mapping (correct=4, incorrect=1)"
    - "Fire-and-forget storage pattern for review recording"
    - "14-day interval cap to prevent content exhaustion"

key-files:
  created:
    - "medtriad/services/spaced-repetition.ts"
    - "medtriad/services/__tests__/spaced-repetition.test.ts"
  modified:
    - "medtriad/types/triad-performance.ts"
    - "medtriad/services/triad-performance-storage.ts"
    - "medtriad/services/__tests__/adaptive-selection.test.ts"

key-decisions:
  - "Binary quality mapping: correct=4, incorrect=1 (simpler than 0-5 scale)"
  - "14-day max interval prevents content exhaustion with 45-item dataset"
  - "Tricky multiplier (0.5x) only applies when interval > 1"

patterns-established:
  - "SM-2 fields in TriadPerformance: interval, repetition, efactor, nextReviewDate"
  - "Due triads query filters on: performance exists AND nextReviewDate <= now"
  - "Review recording updates SM-2 fields but not avgResponseTimeMs (untimed)"

# Metrics
duration: 5min
completed: 2026-01-22
---

# Phase 29 Plan 01: SM-2 Algorithm Summary

**SM-2 spaced repetition algorithm with binary quality mapping, 14-day interval cap, and tricky item scheduling**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-22T07:15:05Z
- **Completed:** 2026-01-22T07:19:47Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Extended TriadPerformance type with SM-2 scheduling fields (interval, repetition, efactor, nextReviewDate)
- Implemented calculateSM2 algorithm with binary quality mapping and all SM-2 constraints
- Created comprehensive test suite with 18 test cases covering all edge cases
- Applied 14-day interval cap (SR-05) to prevent content exhaustion
- Applied 0.5x tricky multiplier (SR-06) for marked items

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend TriadPerformance with SM-2 fields** - `1f87cfd` (feat)
2. **Task 2: Create spaced-repetition service** - `c0bddf5` (feat)
3. **Task 3: Comprehensive SM-2 tests** - `8942bcf` (test)

## Files Created/Modified

- `medtriad/types/triad-performance.ts` - Added SM-2 fields: interval, repetition, efactor, nextReviewDate
- `medtriad/services/spaced-repetition.ts` - SM-2 algorithm implementation with getDueTriads, recordReviewAnswer
- `medtriad/services/__tests__/spaced-repetition.test.ts` - 18 test cases covering all SM-2 edge cases
- `medtriad/services/triad-performance-storage.ts` - Initialize SM-2 defaults for new performance records
- `medtriad/services/__tests__/adaptive-selection.test.ts` - Migrated to include SM-2 fields

## Decisions Made

**Binary quality mapping (correct=4, incorrect=1):**
SM-2 traditionally uses 0-5 quality scale. We simplified to binary because:
- Quiz results are correct/incorrect (no subjective quality assessment)
- Quality=4 for correct gives neutral EF adjustment (EF stays stable)
- Quality=1 for incorrect decreases EF appropriately
- Simpler than mapping response time or confidence to 0-5 scale

**14-day maximum interval (SR-05):**
Caps review intervals at 14 days to prevent content exhaustion:
- With 45 triads, unlimited intervals would exhaust new content too quickly
- Users return frequently for short sessions
- 14-day cap ensures regular review opportunities
- Applied after EF multiplication but before tricky multiplier

**Tricky multiplier only when interval > 1:**
0.5x multiplier only applies to intervals > 1 because:
- First review always gets interval=1 (can't go lower)
- Prevents interval=0 edge case
- Ensures tricky items still get minimum 1-day spacing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Migrated existing test fixtures to include SM-2 fields**
- **Found during:** Task 1 (Type extension)
- **Issue:** TypeScript compilation failed - adaptive-selection.test.ts fixtures missing new SM-2 fields
- **Fix:** Added interval=0, repetition=0, efactor=2.5, nextReviewDate=null to 12 test fixtures and helper function
- **Files modified:** medtriad/services/__tests__/adaptive-selection.test.ts
- **Verification:** TypeScript compiles without errors, tests still pass
- **Committed in:** 1f87cfd (Task 1 commit)

**2. [Rule 2 - Missing Critical] Initialize SM-2 defaults in triad-performance-storage**
- **Found during:** Task 1 (Type extension)
- **Issue:** Existing storage functions didn't initialize new SM-2 fields, would create invalid records
- **Fix:** Added SM-2 field defaults (interval=0, repetition=0, efactor=2.5, nextReviewDate=null) in recordTriadAnswer function
- **Files modified:** medtriad/services/triad-performance-storage.ts
- **Verification:** TypeScript compiles, storage creates valid TriadPerformance records
- **Committed in:** 1f87cfd (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both missing critical)
**Impact on plan:** Both fixes essential for type safety and correctness. Type extension requires migrating all existing code that creates TriadPerformance objects. No scope creep.

## Issues Encountered

**Jest test location:**
Initial test file placed in `medtriad/__tests__/` but jest.config.js has `roots: ['<rootDir>/services']`. Moved test to `medtriad/services/__tests__/` to match configuration. All 18 tests passed immediately after move.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 30 (Review Mode UI):**
- SM-2 algorithm fully implemented and tested
- getDueTriads() query ready to power Review Mode screen
- recordReviewAnswer() ready to update scheduling from UI

**Foundation complete for:**
- Review Mode screen (show due triads, record answers)
- Daily review counts (getDueTriadCount for badges)
- Scheduling analytics (EF trends, interval distribution)

**No blockers or concerns.**

---
*Phase: 29-spaced-repetition*
*Completed: 2026-01-22*
