---
phase: 29-spaced-repetition
plan: 03
subsystem: ui
tags: [react-native, expo-router, spaced-repetition, home-screen]

# Dependency graph
requires:
  - phase: 29-01
    provides: getDueTriadCount service for fetching due triads count
provides:
  - ReviewDueBadge component showing due triads count
  - Review button in ActionButtons with badge
  - Home screen integration with Review Mode entry points
  - Due count tracking in useStats hook
affects: [29-04, review-mode, home-screen]

# Tech tracking
tech-stack:
  added: []
  patterns: [badge-on-button, disabled-state-styling, conditional-rendering]

key-files:
  created:
    - medtriad/components/home/ReviewDueBadge.tsx
  modified:
    - medtriad/components/home/ActionButtons.tsx
    - medtriad/app/(tabs)/index.tsx
    - medtriad/hooks/useStats.ts

key-decisions:
  - "Show Review button disabled when dueCount is 0 (keeps feature discoverable)"
  - "Two entry points to Review Mode: prominent badge + always-visible button"
  - "Review button in separate row below Study/Challenge for visual hierarchy"
  - "Badge positioned absolutely on Review button with brand primary color"

patterns-established:
  - "Disabled buttons shown with reduced opacity and muted colors"
  - "Badge count displayed on action buttons with absolute positioning"
  - "Due count refreshed on home screen focus via useStats refresh"

# Metrics
duration: 4m 21s
completed: 2026-01-22
---

# Phase 29 Plan 03: Home Screen Review Integration Summary

**ReviewDueBadge component and Review action button provide two-path entry to spaced repetition with live due count tracking**

## Performance

- **Duration:** 4m 21s
- **Started:** 2026-01-22T07:23:27Z
- **Completed:** 2026-01-22T07:27:48Z
- **Tasks:** 2
- **Files modified:** 4 (3 modified, 1 created)

## Accomplishments
- Created ReviewDueBadge component showing due triads with brand-colored styling
- Added Review button to ActionButtons with due count badge and disabled state
- Integrated dueCount tracking into useStats hook via getDueTriadCount
- Wired home screen with two entry points to Review Mode (/quiz/review)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ReviewDueBadge component** - `2ff2247` (feat)
2. **Task 2: Add Review button and integrate review mode on home screen** - `9957316` (feat)

## Files Created/Modified

- `medtriad/components/home/ReviewDueBadge.tsx` - Tappable badge showing due triads count with Refresh icon, hidden when count is 0
- `medtriad/components/home/ActionButtons.tsx` - Added third Review button with badge, disabled state, and two-row layout
- `medtriad/hooks/useStats.ts` - Added dueCount state and getDueTriadCount call in fetchStats
- `medtriad/app/(tabs)/index.tsx` - Added ReviewDueBadge and updated ActionButtons with review props

## Decisions Made

**1. Show disabled Review button when dueCount is 0**
- Rationale: Keeps feature discoverable even when no triads are due, rather than hiding it completely
- Implementation: Disabled button styled with opacity 0.5 and muted colors

**2. Two entry points to Review Mode**
- Rationale: ReviewDueBadge provides prominent call-to-action when triads are due; Review button always accessible for discoverability
- Implementation: Badge appears conditionally above Start Quiz button; Review button always present in ActionButtons

**3. Review button in separate row**
- Rationale: Three buttons in one row would be cramped; separate row gives Review visual prominence
- Implementation: Two-row layout in ActionButtons: [Study, Challenge] then [Review]

**4. Badge positioned on Review button**
- Rationale: Shows due count directly on the action button as visual reinforcement
- Implementation: Absolutely positioned badge with brand primary background, white text, and border matching surface color

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation proceeded smoothly following existing patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Review Mode is now fully accessible from the home screen. Users can:
- See when triads are due via ReviewDueBadge (appears when dueCount > 0)
- Tap badge to enter Review Mode immediately
- Use Review button in ActionButtons (shows due count badge, disabled when 0)
- Both paths navigate to /quiz/review

Due count automatically refreshes when home screen gains focus, ensuring users always see up-to-date review status.

Ready for next plans in Phase 29 or future home screen enhancements.

---
*Phase: 29-spaced-repetition*
*Completed: 2026-01-22*
