---
phase: 17-design-system-audit
plan: 02
subsystem: ui
tags: [design-tokens, hard-border, hero-card, stats-grid]

# Dependency graph
requires:
  - phase: 17-01
    provides: CardStyle constant and DESIGN-SYSTEM.md documentation
provides:
  - HeroCard with hard border treatment (no gradient)
  - StatsGrid cards with CardStyle hard borders
  - TierSection and TierBadge using design tokens
affects: [17-03, home-screen-visual-consistency]

# Tech tracking
tech-stack:
  added: []
  patterns: [hard-border-card-pattern, design-token-adoption]

key-files:
  created: []
  modified:
    - medtriad/components/home/HeroCard.tsx
    - medtriad/components/home/StatsGrid.tsx
    - medtriad/components/home/TierSection.tsx
    - medtriad/components/home/TierBadge.tsx

key-decisions:
  - "Keep domain-specific pill colors (streak orange, accuracy teal) as hardcoded for semantic meaning"
  - "HeroCard uses backgroundSecondary for solid background instead of gradient"
  - "StatsGrid spreads CardStyle for consistent hard border treatment"

patterns-established:
  - "Remove LinearGradient, use solid background + hard borders for cards"
  - "Spread CardStyle in StyleSheet for Duolingo-inspired card treatment"

# Metrics
duration: 3min
completed: 2026-01-19
---

# Phase 17 Plan 02: Home Components Hard Border Summary

**Transformed HeroCard and StatsGrid to use Duolingo-inspired hard border aesthetic with design tokens**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-19
- **Completed:** 2026-01-19
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Removed LinearGradient dependency from HeroCard, replaced with solid background
- Added hard border treatment to HeroCard (2px sides, 4px bottom with borderStrong color)
- Replaced hardcoded colors, spacing, and typography with design tokens in HeroCard
- Applied CardStyle to StatsGrid cards for consistent hard border treatment
- Updated TierSection to use Typography.footnote and Spacing.xs tokens
- Updated TierBadge stroke to use colors.primaryDark token

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply hard border treatment to HeroCard** - `4648d41` (feat)
2. **Task 2: Apply hard border treatment to StatsGrid and tier components** - `8c0c63b` (feat)

## Files Created/Modified

- `medtriad/components/home/HeroCard.tsx` - Removed LinearGradient, added hard borders, tokenized values
- `medtriad/components/home/StatsGrid.tsx` - Applied CardStyle, used Easings.press for animations
- `medtriad/components/home/TierSection.tsx` - Replaced hardcoded typography and spacing
- `medtriad/components/home/TierBadge.tsx` - Replaced hardcoded stroke color

## Decisions Made

- Domain-specific pill colors (streak orange #FFEDD5/#C2410C, accuracy teal #CCFBF1/#0F766E) kept as hardcoded - these have semantic meaning and are intentionally different from the design system palette
- HeroCard uses backgroundSecondary (#F8F9FA) for solid background - matches the original gradient's dominant color
- StatsGrid value typography (fontSize: 28, lineHeight: 34) kept as-is - large stat display intentionally different from Typography scale

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - pre-existing TypeScript error in progress.tsx (unrelated to this plan's changes) was noted but not part of this phase's scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Home screen components now aligned to Duolingo-inspired hard border aesthetic
- Ready for 17-03 to audit and align remaining components (library, quiz, progress screens)

---
*Phase: 17-design-system-audit*
*Completed: 2026-01-19*
