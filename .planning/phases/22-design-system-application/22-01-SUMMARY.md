---
phase: 22-design-system-application
plan: 01
subsystem: design-tokens
tags: [tokens, icons, solar-icons, tab-bar, semantic-colors]
dependency-graph:
  requires:
    - 21-04 (primitive components)
  provides:
    - success.darker and danger.darker semantic tokens
    - Solar Icons in tab bar
  affects:
    - 22-02 (home screen migration)
    - Future AnswerCard migration (will use darker tokens)
tech-stack:
  added: []
  patterns:
    - Solar Icon import pattern: {IconName}Bold, {IconName}Linear
    - Tab bar uses raw Solar Icons (not Icon primitive) for color prop compatibility
key-files:
  created: []
  modified:
    - medtriad/constants/tokens/colors.ts
    - medtriad/constants/theme.ts
    - medtriad/app/(tabs)/_layout.tsx
decisions:
  - "Added success[800] instead of replacing success[700] to preserve existing text token"
  - "Tab bar uses raw Solar Icons directly (not Icon primitive) because Expo Router passes color prop"
metrics:
  duration: 3m 31s
  completed: 2026-01-20
---

# Phase 22 Plan 01: Tokens and Tab Bar Icons Summary

Added missing semantic color tokens for 3D depth effects and migrated tab bar icons from SF Symbols (IconSymbol) to Solar Icons.

## What Was Built

### 1. Color Tokens for 3D Depth (Task 1)

Added darker color variants needed for AnswerCard 3D borders:

**palette (colors.ts):**
- `success[800]`: '#16A34A' - darker green for correct answer borders
- `error[700]`: '#DC2626' - darker red for incorrect answer borders

**theme (theme.ts):**
- `theme.colors.success.darker` -> palette.success[800]
- `theme.colors.danger.darker` -> palette.error[700]

### 2. Tab Bar Solar Icons (Task 2)

Migrated all four tab bar icons from SF Symbols to Solar Icons:

| Tab | Focused (Bold) | Unfocused (Linear) |
|-----|----------------|-------------------|
| Home | HomeBold | HomeLinear |
| Library | BookBold | BookMinimalisticLinear |
| Progress | ChartSquareBold | ChartSquareLinear |
| Settings | SettingsBold | SettingsLinear |

Also migrated tab bar styling from `Colors.light` to semantic theme tokens:
- `tabBarActiveTintColor`: theme.colors.brand.primary
- `tabBarInactiveTintColor`: theme.colors.icon.muted
- `backgroundColor`: theme.colors.surface.primary
- `borderTopColor`: theme.colors.border.default

## Commits

| Commit | Description |
|--------|-------------|
| 56ade79 | feat(22-01): add success.darker and danger.darker color tokens |
| 25e1697 | feat(22-01): migrate tab bar icons to Solar Icons |

## Decisions Made

1. **success[800] vs replacing success[700]:** Added new shade (800) rather than replacing 700 because 700 is already used for success text color. Different semantic purposes require different shades.

2. **Raw Solar Icons in tab bar:** Tab bar uses Solar Icon components directly (not the Icon primitive) because Expo Router's tab bar API passes `color` prop directly to icons, which the primitive doesn't support in the same way.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] TypeScript compiles (pre-existing FlashList error unrelated to this plan)
- [x] palette.success[800] = '#16A34A' exists
- [x] palette.error[700] = '#DC2626' exists
- [x] theme.colors.success.darker accessible
- [x] theme.colors.danger.darker accessible
- [x] Tab bar imports from @solar-icons/react-native
- [x] Bold/Linear variants used for focused/unfocused states
- [x] IconSymbol import removed from _layout.tsx

## Next Plan Readiness

**22-02 (Home Screen Migration)** ready to proceed:
- Semantic tokens available including new darker variants
- Solar Icon import pattern established
- Theme semantic token access pattern demonstrated
