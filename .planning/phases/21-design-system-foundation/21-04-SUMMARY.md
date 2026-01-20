---
phase: 21-design-system-foundation
plan: 04
subsystem: ui
tags: [badge-primitive, tag-primitive, card-primitive, duolingo-style, 3d-depth, semantic-tokens]

# Dependency graph
requires:
  - phase: 21-03
    provides: Text primitive, Button primitive, Icon primitive
provides:
  - Badge primitive with 7 variants for status indicators
  - Tag primitive with 5 variants for category labels
  - Card primitive with 3 variants and press animation
  - Complete design system primitive set (7 components)
affects: [22-home-migration, all-components-using-primitives]

# Tech tracking
tech-stack:
  added: []
  patterns: [badge-with-3d-depth, flat-tag-design, card-press-animation, semantic-color-tokens]

key-files:
  created:
    - medtriad/components/primitives/Badge.tsx
    - medtriad/components/primitives/Tag.tsx
    - medtriad/components/primitives/Card.tsx
  modified:
    - medtriad/components/primitives/index.ts

key-decisions:
  - "Badge has 3D depth (borderBottomWidth: 3), Tag is flat - visual hierarchy distinction"
  - "Badge/Tag icon accepts Solar Icon component (same pattern as Button)"
  - "Card press animation only when interactive (onPress provided) and has 3D depth"
  - "All components use semantic color tokens - no hardcoded color values"

patterns-established:
  - "Badge for status indicators with 3D depth"
  - "Tag for labels/categories - flat design"
  - "Card animated on press with scale + border reduction"
  - "Elevated variant uses shadow only, no animation"

# Metrics
duration: 2min
completed: 2026-01-20
---

# Phase 21 Plan 04: Badge, Tag, and Card Primitives Summary

**Badge with 7 variants, Tag with 5 variants, Card with 3 variants and press animation - design system foundation complete**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-20T08:27:39Z
- **Completed:** 2026-01-20T08:29:22Z
- **Tasks:** 3/3
- **Files created:** 3
- **Files modified:** 1

## Accomplishments

- Created Badge primitive with 7 variants (default, success, warning, danger, brand, gold, streak)
- Badge has Duolingo-style 3D depth with borderBottomWidth: 3
- Badge uses semantic tokens from theme.colors (gold, streak, success, etc.)
- Created Tag primitive with 5 variants (default, brand, success, info, purple)
- Tag is flat (no 3D depth) - visually distinct from Badge
- Tag supports optional onPress (makes tappable) and onRemove (shows X button)
- Created Card primitive with 3 variants (default, elevated, outlined)
- Card has Duolingo-style 3D press animation (scale + border reduction)
- Elevated variant uses shadow only without press animation
- Updated primitives index to export all 7 components
- Design system foundation is complete with Icon, Surface, Text, Button, Badge, Tag, Card

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Badge component** - `ea85a84` (feat)
2. **Task 2: Create Tag component** - `49fa648` (feat)
3. **Task 3: Create Card primitive and update exports** - `e6728ad` (feat)

## Files Created/Modified

**Created:**
- `medtriad/components/primitives/Badge.tsx` - Status indicator with 7 variants and 3D depth
- `medtriad/components/primitives/Tag.tsx` - Label component with 5 variants, flat design
- `medtriad/components/primitives/Card.tsx` - Container with press animation and 3 variants

**Modified:**
- `medtriad/components/primitives/index.ts` - Added exports for Badge, Tag, Card

## Decisions Made

1. **Badge has 3D depth, Tag is flat:** Visual hierarchy distinction - badges are status indicators (more prominent), tags are labels (subtle)
2. **Icon component pattern:** Badge/Tag accept Solar Icon component as prop (consistent with Button pattern)
3. **Card animation conditional:** Only animates when interactive AND has 3D depth (elevated variant has no animation)
4. **Semantic tokens throughout:** All color values come from theme.colors semantic tokens - gold, streak, success, warning, etc.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing TypeScript error in library.tsx (FlashList estimatedItemSize prop) - unrelated to primitive changes, not fixed as out of scope

## User Setup Required

None - no external service configuration required.

## Design System Foundation Complete

All 7 primitives are now available:

| Primitive | Purpose | Variants |
|-----------|---------|----------|
| Icon | Icon wrapper with standard sizes | sm, md, lg |
| Surface | Background containers | primary, secondary, card, brand, subtle |
| Text | Typography | 10 variants (display, title, heading, body, etc.) |
| Button | Interactive buttons | primary, secondary, outline, ghost |
| Badge | Status indicators | default, success, warning, danger, brand, gold, streak |
| Tag | Labels/categories | default, brand, success, info, purple |
| Card | Content containers | default, elevated, outlined |

**Import pattern:**
```typescript
import { Icon, Surface, Text, Button, Badge, Tag, Card } from '@/components/primitives';
```

## Success Criteria Status

- [x] DS-07 COMPLETE: Badge component for status indicators
- [x] DS-08 COMPLETE: Tag component for labels and categories
- [x] DS-09 COMPLETE: Card component with consistent styling
- [x] All primitives use design tokens exclusively
- [x] Design system foundation is complete

---
*Phase: 21-design-system-foundation*
*Completed: 2026-01-20*
