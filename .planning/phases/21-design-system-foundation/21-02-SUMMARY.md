---
phase: 21-design-system-foundation
plan: 02
subsystem: ui
tags: [figtree, font-loading, solar-icons, icon-primitive, surface-primitive, react-native]

# Dependency graph
requires:
  - phase: 21-01
    provides: Token architecture, Figtree package, Solar Icons package
provides:
  - Figtree font loading with splash screen integration
  - Icon primitive for standardized Solar Icons rendering
  - Surface primitive for themed containers with shadows
affects: [21-03, all-ui-components]

# Tech tracking
tech-stack:
  added: []
  patterns: [font-loading-with-splash, icon-component-wrapper, themed-surface-primitive]

key-files:
  created:
    - medtriad/components/primitives/Icon.tsx
    - medtriad/components/primitives/Surface.tsx
    - medtriad/components/primitives/index.ts
  modified:
    - medtriad/app/_layout.tsx

key-decisions:
  - "Icon API uses component pass-through: icon={HomeIcon} instead of name='home' for type safety and tree-shaking"
  - "Surface variants mirror theme.colors.surface keys for direct mapping"
  - "Font loading integrated with existing splash screen flow (stats + images + fonts)"

patterns-established:
  - "Primitive components consume theme tokens exclusively (no hardcoded values)"
  - "Icon sizes standardized to sm/md/lg (16/20/24px)"
  - "Surface elevations use theme.shadows directly"

# Metrics
duration: 2min
completed: 2026-01-20
---

# Phase 21 Plan 02: Font Loading and Primitives Summary

**Figtree font loading with splash screen integration, Icon wrapper for Solar Icons, and Surface primitive for themed containers**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-20T08:21:20Z
- **Completed:** 2026-01-20T08:23:08Z
- **Tasks:** 2/2
- **Files created:** 3
- **Files modified:** 1

## Accomplishments

- Integrated Figtree font loading into root layout with all 5 weights (Regular, Medium, SemiBold, Bold, ExtraBold)
- Prevented FOUT (flash of unstyled text) by keeping splash screen visible until fonts load
- Created Icon primitive component wrapping Solar Icons with standardized sizes (sm=16, md=20, lg=24)
- Created Surface primitive component with 5 variants and 4 elevation levels consuming theme tokens
- Established primitives/ directory structure for design system components

## Task Commits

Each task was committed atomically:

1. **Task 1: Set up Figtree font loading** - `a57ce5f` (feat)
2. **Task 2: Create Icon and Surface primitives** - `108aff5` (feat)

## Files Created/Modified

**Created:**
- `medtriad/components/primitives/Icon.tsx` - Solar Icons wrapper with sm/md/lg sizes, accepts icon component prop
- `medtriad/components/primitives/Surface.tsx` - Themed container with variant and elevation props
- `medtriad/components/primitives/index.ts` - Barrel export for clean imports

**Modified:**
- `medtriad/app/_layout.tsx` - Added Figtree font loading with useFonts hook, integrated with splash screen

## Decisions Made

1. **Icon API design:** Uses component pass-through (`icon={HomeIcon}`) rather than string name lookup (`name="home"`) - enables TypeScript type safety and optimal tree-shaking
2. **Font loading integration:** Fonts load alongside existing stats/images preload, all three must complete before hiding splash
3. **Surface variant naming:** Matches theme.colors.surface keys exactly (primary, secondary, card, brand, brandSubtle) for intuitive mapping

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing TypeScript error in library.tsx (FlashList estimatedItemSize prop) - unrelated to primitive changes, not fixed as out of scope

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 21-03:**
- Font loading operational for Text primitive
- Icon wrapper available for Button icons
- Surface primitive ready for Card composition

**Foundation complete for:**
- Text primitive (fonts loaded, typography tokens ready)
- Button primitive (Icon available, Surface for container)
- Badge/Tag primitives (Icon + Surface + theme tokens)
- Card component (Surface with elevation)

## Success Criteria Status

- [x] DS-03 COMPLETE: Icon wrapper component using Solar Icons with standardized sizes (16, 20, 24)
- [x] DS-05 COMPLETE: Surface primitive component using color and shadow tokens
- [x] Figtree fonts load correctly without FOUT

---
*Phase: 21-design-system-foundation*
*Completed: 2026-01-20*
