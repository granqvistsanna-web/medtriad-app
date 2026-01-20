# Phase 22: Design System Application - Research

**Researched:** 2026-01-20
**Domain:** React Native Design System Migration
**Confidence:** HIGH (based on actual codebase analysis)

## Summary

This research provides a comprehensive inventory of the MedTriads codebase to guide migration to the new design system established in Phase 21. The codebase contains 11 screens, 45+ components, and uses a mix of legacy token patterns (Colors.light) and hardcoded values that need migration.

The design system foundation from Phase 21 provides 7 primitives (Icon, Surface, Text, Button, Badge, Tag, Card) with semantic tokens. Migration involves:
1. Replacing `<Text>` components from react-native with primitive `<Text>`
2. Replacing `IconSymbol` (SF Symbols/MaterialIcons) with primitive `<Icon>` (Solar Icons)
3. Replacing hardcoded colors with semantic tokens
4. Replacing custom card/button implementations with primitives

**Primary recommendation:** Migrate screens in order of dependency (layouts first, then tabs, then nested screens), replacing IconSymbol with Icon wrapper and react-native Text with primitive Text throughout.

## Screen Inventory

### Screens and Migration Complexity

| Screen | Path | Complexity | Notes |
|--------|------|------------|-------|
| Tab Layout | `app/(tabs)/_layout.tsx` | LOW | Tab bar icons only - needs Icon migration |
| Home | `app/(tabs)/index.tsx` | MEDIUM | Uses HeroCard, ActionButtons, HomeHeader - mostly delegates to components |
| Library | `app/(tabs)/library.tsx` | MEDIUM | SearchBar, FilterChips, TriadCard - has IconSymbol |
| Progress | `app/(tabs)/progress.tsx` | MEDIUM | StatsCard, TierProgressBar - hardcoded colors in StatsCard |
| Settings | `app/(tabs)/settings.tsx` | LOW | Simple layout, delegates to SettingsRow/ToggleRow |
| Quiz | `app/quiz/index.tsx` | HIGH | Complex state, timer, answers - IconSymbol + hardcoded colors |
| Results | `app/quiz/results.tsx` | MEDIUM | Button primitive already imported, uses Typography tokens |
| Onboarding | `app/onboarding.tsx` | LOW | Simple pager, uses Button from ui/Button |
| Modal | `app/modal.tsx` | LOW | Minimal component |
| Root Layout | `app/_layout.tsx` | LOW | Navigation setup only |
| Quiz Layout | `app/quiz/_layout.tsx` | LOW | Stack navigator only |

**Migration Order Recommendation:**
1. **Layouts first:** `_layout.tsx`, `(tabs)/_layout.tsx`, `quiz/_layout.tsx`
2. **Simple screens:** Settings, Onboarding, Modal
3. **Medium screens:** Home, Library, Progress, Results
4. **Complex screens:** Quiz

## Icon Inventory

### Current IconSymbol Usage

The app uses `IconSymbol` which wraps SF Symbols (iOS) and MaterialIcons (Android). This needs to be replaced with the new `Icon` primitive wrapping Solar Icons.

| Current SF Symbol | Used In | Solar Icon Equivalent |
|-------------------|---------|----------------------|
| `house.fill` / `house` | Tab bar | `Home` / `Home2` |
| `book.fill` / `book` | Tab bar | `Book` / `BookMinimalistic` |
| `chart.bar.fill` / `chart.bar` | Tab bar | `ChartSquare` |
| `gearshape.fill` / `gearshape` | Tab bar | `Settings` |
| `flame.fill` | Quiz, HomeHeader | `Fire` |
| `star.fill` | HomeHeader | `Star` |
| `trophy.fill` | Progress StatsCard | `Cup` |
| `percent` | Progress StatsCard | `PercentSquare` |
| `gamecontroller.fill` | Progress StatsCard | `Gamepad` |
| `play.fill` | Onboarding, ActionButtons | `Play` |
| `bolt.fill` | ActionButtons | `Bolt` |
| `magnifyingglass` | Library SearchBar | `MagnifyingGlass` |
| `xmark` | SearchBar, CancelButton | `CloseCircle` |
| `chevron.right` | AnswerCard, SettingsRow | `AltArrowRight` |
| `square.and.arrow.up` | Settings | `Share` |
| `trash` | Settings | `TrashBin` |

### Tab Bar Icon Special Case

Tab bar icons receive `color` and `focused` props from Expo Router. The new Icon primitive needs to support this pattern or use a wrapper.

**Recommendation:** Create a specialized `TabBarIcon` component that bridges between Expo Router's icon API and Solar Icons.

## Component Migration Map

### Components That Can Use Primitives Directly

| Existing Component | Replace With | Migration Notes |
|--------------------|--------------|-----------------|
| `components/ui/Button.tsx` | `primitives/Button.tsx` | Already have both - delete ui/Button |
| React Native `<Text>` | `primitives/Text.tsx` | Throughout all files |
| React Native `<View>` (backgrounds) | `primitives/Surface.tsx` | When semantic background needed |
| `IconSymbol` | `primitives/Icon.tsx` | Requires icon mapping |

### Components That Need Refactoring

| Component | Current Pattern | Migration Strategy |
|-----------|-----------------|-------------------|
| `home/HomeHeader.tsx` | Custom badges with hardcoded colors | Use `Badge` primitive |
| `home/HeroCard.tsx` | Custom button with shine animation | Keep custom button (shine effect), use Text primitive |
| `progress/StatsCard.tsx` | Hardcoded color themes per stat | Add new theme colors or use generic card + color props |
| `library/FilterChips.tsx` | 10 hardcoded category color palettes | Decision needed: keep category colors or unify |
| `quiz/AnswerCard.tsx` | Hardcoded state colors | Add success/error dark colors to palette |
| `settings/SettingsRow.tsx` | IconSymbol + Text | Use Icon + Text primitives |

### Components That Are Fine (Low Priority)

| Component | Reason |
|-----------|--------|
| `home/TriMascot.tsx` | Image-based, no token issues |
| `home/ProgressRing.tsx` | SVG-based, uses Colors.light.primary |
| `quiz/TimerBar.tsx` | Animation-focused, uses timer tokens |
| `onboarding/PaginationDots.tsx` | Simple dots, uses primary color |

## Gap Analysis: Missing Tokens

### Hardcoded Colors Found

| File | Hardcoded Value | Semantic Meaning | Action |
|------|-----------------|------------------|--------|
| `AnswerCard.tsx` | `#16A34A` | Dark green (correct bottom border) | Add `theme.colors.success.darker` |
| `AnswerCard.tsx` | `#DC2626` | Dark red (incorrect bottom border) | Add `theme.colors.danger.darker` |
| `HomeHeader.tsx` | `#E3F2FD` | Light blue badge bg | Use `theme.colors.blue.light` |
| `HomeHeader.tsx` | `#FCCAE6` | Pink streak badge bg | Add to palette or use brand |
| `StatsCard.tsx` | `#8B5CF6`, `#2DD4BF`, `#3B82F6`, `#F59E0B` | Stat card header colors | Decision: unify or add to palette |
| `FilterChips.tsx` | 10 category color sets | Category-specific colors | Decision: unify to brand or keep varied |
| `TriadCard.tsx` | `#FEF08A` | Yellow highlight | Use `theme.colors.warning.light` |
| `HighScoreBadge.tsx` | `#FACC15` | Gold star | Use `theme.colors.gold.main` |
| `TierUpCelebration.tsx` | Confetti colors | Celebration colors | Acceptable hardcoded |
| `ShareCard.tsx` | `#FFFFFF` | White background | Use `theme.colors.surface.primary` |

### Recommended Palette Additions

```typescript
// Add to palette/theme
success: {
  // existing...
  darker: '#16A34A',  // For 3D depth on success states
},
danger: {
  // existing...
  darker: '#DC2626',  // For 3D depth on error states
},
```

### Design Decision Needed: Category Colors

The `FilterChips.tsx` component has 10 unique color palettes for medical categories. Options:

1. **Unify to brand colors** (simpler, matches design system philosophy)
2. **Add all category colors to palette** (more complex, maintains variety)
3. **Keep hardcoded in FilterChips only** (pragmatic exception)

**Recommendation:** Keep category colors as a documented exception. They serve UX purpose (visual differentiation) and are localized to one component.

## Migration Patterns

### Pattern 1: Text Migration

**Before:**
```tsx
import { Text } from 'react-native';
import { Typography, Colors } from '@/constants/theme';

<Text style={[styles.title, { color: colors.text }]}>Title</Text>

const styles = StyleSheet.create({
  title: { ...Typography.title },
});
```

**After:**
```tsx
import { Text } from '@/components/primitives';

<Text variant="title" color="primary">Title</Text>
```

### Pattern 2: Icon Migration

**Before:**
```tsx
import { IconSymbol } from '@/components/ui/icon-symbol';

<IconSymbol name="flame.fill" size={16} color={colors.primary} />
```

**After:**
```tsx
import { Icon } from '@/components/primitives';
import { Fire } from '@solar-icons/react-native/Bold';

<Icon icon={Fire} size="sm" color={theme.colors.brand.primary} />
```

### Pattern 3: Badge Migration (HomeHeader)

**Before:**
```tsx
<View style={[styles.badge, styles.starBadge]}>
  <IconSymbol name="star.fill" size={16} color={colors.blueText} />
  <Text style={[styles.badgeValue, { color: colors.blueText }]}>
    {totalPoints.toLocaleString()}
  </Text>
</View>
```

**After:**
```tsx
import { Badge } from '@/components/primitives';
import { Star } from '@solar-icons/react-native/Bold';

<Badge
  label={totalPoints.toLocaleString()}
  icon={Star}
  variant="gold"
/>
```

### Pattern 4: Card Migration

**Before:**
```tsx
<View style={[styles.card, { backgroundColor: colors.backgroundCard }]}>
  {/* content */}
</View>

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderStrong,
    padding: Spacing.lg,
  },
});
```

**After:**
```tsx
import { Card } from '@/components/primitives';

<Card variant="default">
  {/* content */}
</Card>
```

### Pattern 5: Tab Bar Icons (Special Case)

The tab bar needs icons that accept `color` prop from Expo Router.

**Solution:** Create a wrapper or use inline render:

```tsx
import { Home } from '@solar-icons/react-native/Bold';

tabBarIcon: ({ color }) => <Home size={28} color={color} />
```

Or create `TabBarIcon` component:
```tsx
export function TabBarIcon({ icon: IconComponent, color }: { icon: ComponentType; color: string }) {
  return <IconComponent size={28} color={color} />;
}

// Usage
tabBarIcon: ({ color }) => <TabBarIcon icon={Home} color={color} />
```

## SF Symbol to Solar Icon Mapping

Complete mapping for all icons used in the app:

| SF Symbol | Solar Icon (Bold) | Import Path |
|-----------|------------------|-------------|
| `house.fill` | `Home` | `@solar-icons/react-native/Bold` |
| `house` | `Home2` | `@solar-icons/react-native/Linear` |
| `book.fill` | `Book` | `@solar-icons/react-native/Bold` |
| `book` | `BookMinimalistic` | `@solar-icons/react-native/Linear` |
| `chart.bar.fill` | `ChartSquare` | `@solar-icons/react-native/Bold` |
| `chart.bar` | `ChartSquare` | `@solar-icons/react-native/Linear` |
| `gearshape.fill` | `Settings` | `@solar-icons/react-native/Bold` |
| `gearshape` | `Settings` | `@solar-icons/react-native/Linear` |
| `flame.fill` | `Fire` | `@solar-icons/react-native/Bold` |
| `star.fill` | `Star` | `@solar-icons/react-native/Bold` |
| `trophy.fill` | `Cup` | `@solar-icons/react-native/Bold` |
| `percent` | `PercentSquare` | `@solar-icons/react-native/Bold` |
| `gamecontroller.fill` | `Gamepad` | `@solar-icons/react-native/Bold` |
| `play.fill` | `Play` | `@solar-icons/react-native/Bold` |
| `bolt.fill` | `Bolt` | `@solar-icons/react-native/Bold` |
| `magnifyingglass` | `MagnifyingGlass` | `@solar-icons/react-native/Bold` |
| `xmark` | `CloseCircle` | `@solar-icons/react-native/Bold` |
| `chevron.right` | `AltArrowRight` | `@solar-icons/react-native/Bold` |
| `square.and.arrow.up` | `Share` | `@solar-icons/react-native/Bold` |
| `trash` | `TrashBin` | `@solar-icons/react-native/Bold` |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Text with custom font | Custom Text component | `primitives/Text` with variant |
| Icon rendering | Custom icon wrapper | `primitives/Icon` with Solar Icons |
| Card with 3D depth | Manual border styling | `primitives/Card` |
| Badge with depth | Custom View + styles | `primitives/Badge` |
| Category labels | Custom styled views | `primitives/Tag` |
| Button with animation | Custom Pressable | `primitives/Button` |

## Common Pitfalls

### Pitfall 1: Forgetting Icon Color Props

**What goes wrong:** Solar Icons default to black if color not provided
**How to avoid:** Always pass `color` prop from theme tokens
**Warning signs:** Black icons appearing in UI

### Pitfall 2: Mixed Typography Systems

**What goes wrong:** Some Text uses primitive, some uses react-native Text with Typography
**How to avoid:** Search and replace all `<Text` imports systematically
**Warning signs:** Inconsistent font families in UI

### Pitfall 3: Tab Bar Icon Size Mismatch

**What goes wrong:** Icon primitive uses preset sizes (sm/md/lg), tab bar expects pixel value
**How to avoid:** Use raw Solar Icons directly in tab bar or create TabBarIcon wrapper
**Warning signs:** Tab bar icons too small or too large

### Pitfall 4: Color Token Path Changes

**What goes wrong:** Using `colors.primary` when should be `theme.colors.brand.primary`
**How to avoid:** Use new semantic path for new code, create migration lint rule
**Warning signs:** TypeScript errors on color access

### Pitfall 5: Hardcoded rgba() Values

**What goes wrong:** Forgetting to migrate `rgba(139, 34, 82, 0.15)` style values
**How to avoid:** Grep for `rgba(` and migrate to opacity variants or semantic tokens
**Warning signs:** Visual inconsistencies in borders/backgrounds

## Documentation Structure

The DESIGN_SYSTEM.md should be updated with:

1. **Token Reference** (already partially exists)
   - Colors (raw palette + semantic theme)
   - Typography (variants + font families)
   - Spacing
   - Radius
   - Shadows
   - Motion/Animation

2. **Primitive Components API**
   - Icon (props, sizes, usage)
   - Text (variants, colors, weights)
   - Surface (variants, elevation)
   - Button (variants, sizes, states)
   - Badge (variants, with icon)
   - Tag (variants, interactive)
   - Card (variants, press animation)

3. **Usage Examples**
   - Common patterns
   - Migration examples (before/after)
   - Tab bar icons
   - Form layouts

4. **Decision Log**
   - Why Solar Icons
   - Why semantic tokens
   - Category colors exception

## Open Questions

1. **Category Filter Colors:** Keep 10 unique colors or unify to brand?
   - **Recommendation:** Keep as documented exception

2. **StatsCard Header Colors:** Keep per-stat colors or unify?
   - **Recommendation:** Consider unifying to brand variants for consistency

3. **Tab Bar Focused/Unfocused Icons:** Solar Icons has Bold/Linear - use different weights?
   - **Recommendation:** Yes, Bold for focused, Linear for unfocused

4. **Button in ui/ vs primitives/:** Delete ui/Button.tsx?
   - **Recommendation:** Yes, migrate all usages to primitives/Button

## Sources

### Primary (HIGH confidence)
- Codebase analysis: All files in `medtriad/` directory
- Phase 21 artifacts: Primitive components in `components/primitives/`
- Theme configuration: `constants/theme.ts`, `constants/tokens/`

### Secondary (MEDIUM confidence)
- Existing DESIGN-SYSTEM.md documentation
- Solar Icons package: `@solar-icons/react-native@1.0.1`

## Metadata

**Confidence breakdown:**
- Screen inventory: HIGH - direct codebase inspection
- Icon mapping: MEDIUM - Solar Icon names may vary, verify at implementation
- Migration patterns: HIGH - based on actual code analysis
- Gap analysis: HIGH - grep results for hardcoded values

**Research date:** 2026-01-20
**Valid until:** Indefinite (codebase-specific research)
