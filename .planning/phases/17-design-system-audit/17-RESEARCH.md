# Phase 17: Design System Audit - Research

**Researched:** 2026-01-19
**Domain:** Design system documentation and component audit
**Confidence:** HIGH

## Summary

This research analyzed the current state of DESIGN-SYSTEM.md documentation and audited all components for hardcoded values versus design token usage. The codebase is well-structured with a comprehensive theme.ts providing tokens for colors, spacing, typography, radius, shadows, animation timing, and mascot sizes. However, there are several hardcoded values scattered throughout components, and the card styling is inconsistent between components (soft shadows vs hard borders).

The primary issue is that the Button component uses a distinctive "hard border/shadow" style (animated borderBottomWidth with primaryDark border) that isn't replicated across card components. Per CONTEXT.md decisions, ALL cards should be aligned to this Duolingo-inspired hard border treatment for a bold, playful feel.

**Primary recommendation:** Align all card components to the Button's hard border/shadow style, fix hardcoded values, and enhance DESIGN-SYSTEM.md with complete token coverage including a "common mistakes" antipattern section.

## Current State Analysis

### DESIGN-SYSTEM.md Coverage

The existing documentation covers:
- Color palette (Primary, Backgrounds, Text, Borders, Semantic, Timer States)
- Spacing scale (8pt grid)
- Typography styles (10 variants)
- Border radius scale (6 sizes)
- Shadows (3 levels)
- Mascot sizes (4 sizes)
- Animation durations (6 tokens)
- Spring presets (4 easings)
- Timing easings (3 variants)
- Motion principles and patterns

**Missing from documentation:**
- Icons section (SF Symbols usage patterns)
- Complete animation patterns (shake, glow, tier-up)
- Card styling patterns (current vs target)
- Common mistakes / antipatterns section
- Hardcoded values to avoid

### theme.ts Token Organization

| Category | Tokens | Status |
|----------|--------|--------|
| Colors (tealPalette) | 19 tokens | Complete |
| Typography | 10 variants | Complete |
| Spacing | 8 sizes | Complete |
| Shadows | 3 levels | Complete |
| Radius | 6 sizes | Complete |
| MascotSizes | 4 sizes | Complete |
| Durations | 6 tokens | Complete |
| Easings | 7 presets | Complete |
| Fonts | 4 families | Complete |

**Observation:** theme.ts is well-organized but lacks a shared CardStyle constant for the hard border treatment.

## Components Audit

### Button.tsx - Reference Style (Target for Cards)
**Hard border/shadow style features:**
- `borderBottomColor: colors.primaryDark`
- `borderBottomWidth: 3` (animated to 1 on press)
- `...shadow` (Shadows.light.md)
- `borderRadius: Radius.xl` (24px)
- Animated depth compression on press

### Cards Currently Using SOFT Style (Need Hard Border Treatment)

| Component | Current Style | Issues |
|-----------|---------------|--------|
| HeroCard | LinearGradient + soft shadow + 1px border | No hard border, uses gradient background |
| StatsGrid cards | backgroundSecondary + Shadows.light.sm | No border at all |
| StatsCard (home) | backgroundCard + border + Shadows.light.sm | Soft, no hard bottom border |
| Card.tsx | backgroundCard + border + shadow | Soft style |
| TriadCard | backgroundCard + border + Shadows.light.sm | Soft style |
| progress/StatsCard | backgroundSecondary + Shadows.light.sm | No border |
| CategorySection | backgroundSecondary only | No border, no shadow |
| Settings sections | backgroundCard + border | Soft style |

### Components with Hardcoded Values

| Component | Hardcoded Values | Should Use |
|-----------|------------------|------------|
| HeroCard | `'#F0F2F4'`, `'#F8F9FA'` in gradient | Colors.light tokens |
| HeroCard | `rgba(0, 0, 0, 0.06)` border | Colors.light.border |
| HeroCard | `'#FFEDD5'`, `'#C2410C'` (streak pill) | New tokens or inline constants |
| HeroCard | `'#CCFBF1'`, `'#0F766E'` (accuracy pill) | New tokens or inline constants |
| HeroCard | `fontSize: 24`, `fontSize: 15`, `fontSize: 13`, `fontSize: 11` | Typography tokens |
| HeroCard | `paddingHorizontal: 10`, `paddingHorizontal: 16`, `paddingVertical: 10` | Spacing tokens |
| HeroCard | `gap: 6`, `borderRadius: 12`, `borderRadius: 24` | Spacing/Radius tokens |
| StatsGrid | `fontSize: 28`, `lineHeight: 34` | Typography.heading or new token |
| TierSection | `fontSize: 14`, `marginTop: 6`, `width: 100` | Typography/Spacing tokens |
| TierBadge | `'#5DD4CC'`, `'#3BA99C'` | Colors.light tokens |
| TriadCard | `'#FEF08A'` highlight | New token or inline |
| FilterChips | All CATEGORY_COLORS (20+ colors) | Keep as domain-specific |
| FilterChips | `'#FFFFFF'`, `paddingHorizontal: 6`, `paddingVertical: 2`, `minWidth: 20` | Tokens |
| SearchBar | `height: 52`, `fontSize: 16` | Tokens |
| FindingsCard | `fontSize: 11`, `fontSize: 14`, `fontSize: 12`, `gap: 6`, `paddingVertical: 6`, `paddingHorizontal: 10`, `width: 22`, `height: 22` | Tokens |
| AnswerCard | `borderLeftWidth: 5`, `height: 58`, `borderRadius: 14`, `fontSize: 17` | Tokens |
| ShareCard | `width: 360`, `height: 450`, `'#FFFFFF'`, `fontSize: 56`, `width: 160`, `height: 160` | Keep fixed for capture |
| HighScoreBadge | `'#FACC15'` gold | New token |
| TierUpCelebration | `fontSize: 32` | Typography token |
| ProgressRing | `marginTop: 4` | Spacing token |
| quiz/index | `width: 40`, `height: 40`, `gap: 10` | Spacing tokens |
| results | `fontSize: 56`, `height: 40`, `maxWidth: 400` | Tokens |
| library screen | `rgba(0,0,0,0.06)` border, `width: 80`, `height: 80`, `borderRadius: 40` | Tokens |

### Components Using Tokens Correctly

The following components properly use design tokens:
- HomeHeader.tsx
- ToggleRow.tsx
- SettingsRow.tsx
- QuizHistoryList.tsx
- TierProgressBar.tsx
- PaginationDots.tsx
- Button.tsx (primary/secondary variants)

## Card Style Alignment Strategy

### Current Button Style (Reference)
```typescript
// Primary button
{
  backgroundColor: colors.primary,
  borderBottomColor: colors.primaryDark,
  borderBottomWidth: 3, // animated to 1 on press
  ...shadow, // Shadows.light.md
  borderRadius: Radius.xl, // 24
}

// Secondary button
{
  backgroundColor: colors.backgroundCard,
  borderWidth: 2,
  borderColor: colors.primary,
  borderBottomColor: colors.borderStrong,
  borderBottomWidth: 4,
}
```

### Proposed Card Hard Border Style
```typescript
// Add to theme.ts or create shared constant
const CardStyle = {
  backgroundColor: colors.backgroundCard,
  borderWidth: 2,
  borderColor: colors.border,
  borderBottomWidth: 4,
  borderBottomColor: colors.borderStrong,
  borderRadius: Radius.lg,
  ...Shadows.light.sm,
};
```

### Components to Update

1. **HeroCard** - Replace gradient with solid background + hard borders
2. **StatsGrid cards** - Add hard border treatment
3. **Card.tsx** - Add hard border option
4. **TriadCard** - Add hard border treatment
5. **progress/StatsCard** - Add hard border treatment
6. **CategorySection header** - Add hard border treatment
7. **Settings sections** - Add hard border treatment

## Documentation Enhancement

### New Sections for DESIGN-SYSTEM.md

1. **Icons**
   - SF Symbols usage
   - Icon sizes (14, 16, 18, 20, 22, 32)
   - When to use which icon

2. **Card Styling**
   - Hard border treatment pattern
   - When to use hard vs soft
   - Animation on press

3. **Common Mistakes**
   - Hardcoded colors (use Colors.light.*)
   - Magic numbers (use Spacing.*, Radius.*)
   - Custom font sizes (use Typography.*)
   - Missing border-bottom depth on cards
   - Using inline hex colors

4. **Animation Patterns**
   - Shake animation (incorrect answer)
   - Pop animation (correct answer)
   - Glow animation (streak/tier-up)
   - Entry animations

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom colors | Inline hex values | Colors.light.* | Consistency, maintainability |
| Spacing | Magic numbers | Spacing.* | 8pt grid system |
| Typography | Custom fontSize/fontWeight | Typography.* | Visual hierarchy |
| Shadows | Custom shadowColor/offset | Shadows.light.* | Consistent depth |
| Springs | Custom damping/stiffness | Easings.* | Consistent motion feel |
| Card styling | Inconsistent borders | CardStyle constant | Unified Duolingo feel |

## Common Pitfalls

### Pitfall 1: Hardcoded Colors
**What goes wrong:** Using inline hex colors like `'#F0F2F4'` instead of `colors.backgroundSecondary`
**Why it happens:** Quick fixes, copying from designs without checking tokens
**How to avoid:** Always search theme.ts before using any color value
**Warning signs:** Any `'#'` in component StyleSheet that isn't in a domain-specific constant

### Pitfall 2: Inconsistent Card Depths
**What goes wrong:** Some cards have hard borders, others soft shadows
**Why it happens:** Different developers, different phases, no shared pattern
**How to avoid:** Use shared CardStyle constant for all card-like containers
**Warning signs:** Mixed visual style across screens

### Pitfall 3: Typography Magic Numbers
**What goes wrong:** Using `fontSize: 14` instead of `Typography.caption`
**Why it happens:** Tweaking for specific spacing, not checking existing tokens
**How to avoid:** Check Typography scale, extend if truly needed
**Warning signs:** font-related properties not using spread operator

### Pitfall 4: Missing Press Feedback Depth
**What goes wrong:** Cards scale but don't compress like buttons
**Why it happens:** Not applying borderBottomWidth animation pattern
**How to avoid:** Copy Button's borderBottom animation pattern
**Warning signs:** Cards feel flat compared to buttons

## Code Patterns

### Hard Border Card Pattern
```typescript
// Source: Button.tsx pattern applied to cards
const borderBottom = useSharedValue(4);

const animatedStyle = useAnimatedStyle(() => ({
  borderBottomWidth: borderBottom.value,
}));

const handlePressIn = () => {
  borderBottom.value = withSpring(2, Easings.press);
};

const handlePressOut = () => {
  borderBottom.value = withSpring(4, Easings.press);
};

<AnimatedPressable style={[
  {
    backgroundColor: colors.backgroundCard,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomColor: colors.borderStrong,
    borderRadius: Radius.lg,
    ...Shadows.light.sm,
  },
  animatedStyle,
]}>
```

### Replacing Hardcoded Values Pattern
```typescript
// Before
paddingHorizontal: 16,
gap: 6,

// After
paddingHorizontal: Spacing.base,
gap: Spacing.xs,
```

## Open Questions

1. **Domain-specific colors (CATEGORY_COLORS):** Keep as inline constants or add to theme.ts?
   - Recommendation: Keep in FilterChips.tsx as domain-specific, but document in DESIGN-SYSTEM.md

2. **ShareCard fixed dimensions:** Should these use tokens?
   - Recommendation: Keep hardcoded (360x450) as these are capture-specific and shouldn't change

3. **Named shadow tokens vs CardStyle constant:**
   - Claude's discretion per CONTEXT.md
   - Recommendation: Create CardStyle constant in theme.ts that composes existing tokens

## Task Breakdown Guidance

Based on this research, the planner should structure tasks as:

1. **Task 1:** Enhance DESIGN-SYSTEM.md
   - Add Icons section
   - Add Card Styling section
   - Add Common Mistakes section
   - Update Animation section

2. **Task 2:** Add CardStyle constant to theme.ts
   - Create CardStyle with hard border pattern
   - Keep backward compatible (don't change existing tokens)

3. **Task 3:** Audit and fix HeroCard
   - Replace gradient with solid background
   - Add hard border treatment
   - Replace hardcoded values with tokens

4. **Task 4:** Audit and fix home components
   - StatsGrid cards
   - StatsCard
   - TierSection/TierBadge hardcoded values

5. **Task 5:** Audit and fix library components
   - TriadCard
   - CategorySection
   - SearchBar hardcoded values

6. **Task 6:** Audit and fix remaining components
   - progress/StatsCard
   - Settings sections
   - Quiz components (FindingsCard, AnswerCard)
   - Results components

## Sources

### Primary (HIGH confidence)
- `/medtriad/constants/theme.ts` - Full design token analysis
- `/medtriad/constants/DESIGN-SYSTEM.md` - Current documentation state
- All component files audited directly

### Secondary (HIGH confidence)
- CONTEXT.md - User decisions on style alignment
- Button.tsx - Reference implementation for hard border style

## Metadata

**Confidence breakdown:**
- Current state analysis: HIGH - Direct code inspection
- Hardcoded values audit: HIGH - Exhaustive component review
- Style alignment strategy: HIGH - Clear reference in Button.tsx
- Documentation gaps: HIGH - Direct comparison with phase requirements

**Research date:** 2026-01-19
**Valid until:** N/A (codebase-specific research)
