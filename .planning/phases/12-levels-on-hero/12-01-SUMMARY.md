---
phase: 12-levels-on-hero
plan: 01
subsystem: ui
tags: [tier-display, hero-card, svg, animation, navigation]

# Dependency graph
requires:
  - phase: 11-level-system
    provides: TierDefinition type, useStats tier data, TierProgressBar component
provides:
  - TierBadge component (shield SVG with tier number)
  - TierSection component (badge + name + progress bar)
  - HeroCard tier integration with tap-to-navigate
affects: [12-02-mascot-tiers, 14-onboarding]

# Tech tracking
tech-stack:
  added: []
  patterns: [shield SVG badge, animated press with Easings.press, delayed progress animation]

key-files:
  created:
    - medtriad/components/home/TierBadge.tsx
    - medtriad/components/home/TierSection.tsx
  modified:
    - medtriad/components/home/HeroCard.tsx
    - medtriad/app/(tabs)/index.tsx

key-decisions:
  - "Shield badge with tier number (1-6) using react-native-svg Path"
  - "TierSection progress bar animates from 0 after 300ms delay"
  - "Progress bar width fixed at 120px (badge + name section width)"
  - "Tap tier section navigates to Progress tab"

patterns-established:
  - "SVG badge: Path with centered SvgText (textAnchor=middle)"
  - "Delayed animation on mount: setTimeout then setState triggers TierProgressBar animation"
  - "AnimatedPressable with scale 0.97 using Easings.press"

# Metrics
duration: 2min
completed: 2026-01-19
---

# Phase 12 Plan 01: Hero Tier Display Summary

**Shield badge and tier section on Home screen hero with animated progress bar and tap-to-navigate to Progress tab**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-19T09:33:12Z
- **Completed:** 2026-01-19T09:35:01Z
- **Tasks:** 3
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- Created TierBadge component with shield SVG shape and centered tier number
- Created TierSection component wrapping badge, tier name, and progress bar
- Integrated TierSection into HeroCard below mascot with entry animation
- Progress bar animates from empty to current progress after 300ms delay
- Tapping tier section navigates to Progress tab

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TierBadge component** - `292e440` (feat)
2. **Task 2: Create TierSection component** - `33604b4` (feat)
3. **Task 3: Integrate TierSection into HeroCard and Home screen** - `74fbafc` (feat)

## Files Created/Modified
- `medtriad/components/home/TierBadge.tsx` - Shield SVG badge with tier number
- `medtriad/components/home/TierSection.tsx` - Tier display wrapper with AnimatedPressable
- `medtriad/components/home/HeroCard.tsx` - Added tier props and TierSection placement
- `medtriad/app/(tabs)/index.tsx` - Pass tier data from useStats to HeroCard

## Decisions Made
- Used custom SVG Path for shield shape (not SF Symbols) for cross-platform consistency
- Progress bar width set to 120px to match badge + tier name section
- Delay of 300ms before progress animation so it happens after entry animation
- tierContainer has marginTop: Spacing.sm to separate from mascot

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Tier display is now visible on Home screen
- TierBadge and TierSection components can be reused elsewhere
- Phase 12 Plan 02 can add mascot tier variations if needed
- Phase 14 onboarding can reference the tier display

---
*Phase: 12-levels-on-hero*
*Completed: 2026-01-19*
