---
phase: 30-daily-challenges
plan: 01
subsystem: engagement
tags: [daily-challenge, streak-freeze, seedrandom, date-seeded, deterministic]

# Dependency graph
requires:
  - phase: 27-data-foundation
    provides: Per-triad tracking foundation for adaptive selection
  - phase: 29-spaced-repetition
    provides: Streak mechanics and stats-storage patterns
provides:
  - Date-seeded daily challenge generation (deterministic, same for all users)
  - Three challenge variants (speed, category, full) with different configurations
  - Once-per-day completion tracking
  - Streak freeze mechanic (earn after 7 daily challenges, auto-use to preserve streak)
  - ISO week helpers for weekly tracking
affects: [30-02, 30-03, daily-challenge-ui]

# Tech tracking
tech-stack:
  added: [seedrandom, @types/seedrandom]
  patterns: [date-seeded deterministic RNG, streak freeze as earned reward, auto-consuming streak preservation]

key-files:
  created:
    - medtriad/types/daily-challenge.ts
    - medtriad/services/daily-challenge.ts
  modified:
    - medtriad/services/stats-storage.ts

key-decisions:
  - "Date-seeded RNG ensures all users see same daily challenge"
  - "Three challenge variants: speed (5q/7s), category (10q/15s), full (10q/15s)"
  - "Streak freeze earned after 7 daily challenges in one week (max 1 available)"
  - "Streak freeze auto-consumes when any mode detects streak would break"
  - "ISO week tracking prevents duplicate streak freeze rewards"

patterns-established:
  - "Deterministic question generation: Use seedrandom with date string for consistent shuffle"
  - "Streak freeze integration: Pass optional streakFreezeCount to calculateStreak for automatic usage"
  - "Weekly tracking: ISO week string format (YYYY-Www) for reward eligibility windows"

# Metrics
duration: 4min
completed: 2026-01-22
---

# Phase 30 Plan 01: Daily Challenge Foundation Summary

**Date-seeded deterministic daily challenges with three variants (speed/category/full), once-per-day completion tracking, and streak freeze rewards earned weekly and auto-consumed to preserve streaks**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-22T08:30:47Z
- **Completed:** 2026-01-22T08:34:47Z
- **Tasks:** 3
- **Files modified:** 4 (1 created types, 1 created service, 1 modified service, 1 package files)

## Accomplishments
- Date-seeded daily challenge generation ensures all users see identical questions each day
- Three challenge variants with different configurations for variety
- Streak freeze mechanic rewards consistent engagement (7 daily challenges per week)
- Automatic streak freeze consumption integrated into existing streak calculation
- ISO week tracking prevents duplicate rewards within same week

## Task Commits

Each task was committed atomically:

1. **Task 1: Install seedrandom and create daily challenge types** - `0202145` (feat)
2. **Task 2: Create daily challenge service with date-seeded generation** - `4740df7` (feat)
3. **Task 3: Integrate streak freeze into streak calculation** - `b551b7d` (feat)

## Files Created/Modified

**Created:**
- `medtriad/types/daily-challenge.ts` - Type definitions for challenge variants, configuration, state, and streak freeze
- `medtriad/services/daily-challenge.ts` - Core service with date-seeded generation, completion tracking, and streak freeze management

**Modified:**
- `medtriad/services/stats-storage.ts` - Extended StoredStats with daily challenge fields, added ISO week helpers, integrated streak freeze into calculateStreak
- `package.json` / `package-lock.json` - Added seedrandom and @types/seedrandom dependencies

## Decisions Made

1. **Date-seeded deterministic RNG**: All users see the same daily challenge by using the date string as RNG seed
   - Rationale: Creates shared experience, enables global leaderboards, ensures fairness

2. **Three challenge variants with equal probability**:
   - Speed: 5 questions, 7 seconds each
   - Category: 10 questions, 15 seconds each, single category focus
   - Full: 10 questions, 15 seconds each, all categories
   - Rationale: Variety prevents monotony, different challenges test different skills

3. **Streak freeze as weekly reward (max 1 available)**:
   - Earned after completing 7 daily challenges in one week
   - Maximum 1 freeze available at a time
   - Rationale: Rewards consistent engagement without creating infinite safety net

4. **Automatic streak freeze consumption**:
   - Built into calculateStreak() - any mode can trigger it
   - Used when gap > 1 day (not yesterday, not today)
   - Rationale: User doesn't need to manually activate - system protects their investment

5. **ISO week string format (YYYY-Www)**:
   - Used to track which week a freeze was earned
   - Prevents duplicate rewards within same week
   - Rationale: Standard format, week-starts-Monday aligns with common calendar systems

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript compilation checks**: The project has some pre-existing TypeScript errors unrelated to daily challenges. Verified new files compile correctly in isolation. These existing errors don't block daily challenge functionality and should be addressed in phase 31 (Tech Debt Cleanup).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for UI integration:**
- All daily challenge types and services implemented
- Completion tracking and state management in place
- Streak freeze mechanics fully integrated

**Ready for next plans:**
- Plan 30-02: Daily Challenge UI implementation (can use getDailyChallengeState, generateDailyChallengeQuestions)
- Plan 30-03: Results and rewards UI (can use completeDailyChallenge, display streak freeze status)

**No blockers.**

---
*Phase: 30-daily-challenges*
*Completed: 2026-01-22*
