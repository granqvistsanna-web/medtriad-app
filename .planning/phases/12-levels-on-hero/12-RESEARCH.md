# Phase 12: Levels on Hero - Research

**Researched:** 2026-01-19
**Domain:** React Native UI components, tier display, navigation, SVG shapes
**Confidence:** HIGH

## Summary

This phase adds tier progression display to the Home screen hero area. The codebase has all necessary infrastructure in place:
- `useStats` hook already returns `tier`, `tierProgress`, and `nextTier`
- `TierProgressBar` component exists and can be reused directly
- `HeroCard` component contains the mascot and provides the insertion point for tier display
- SVG support via `react-native-svg` exists for creating custom shield badge
- Navigation to Progress tab is straightforward via `expo-router`

The implementation is primarily UI composition work. The HeroCard component needs modification to accept tier data and display a new `TierSection` below the mascot with tier name, progress bar, and shield badge.

**Primary recommendation:** Create a `TierBadge` component using react-native-svg for the shield shape, and a `TierSection` wrapper component. Modify HeroCard to include tier display below mascot, above content text. Use existing animation patterns (springs, stagger) and theme constants.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | Latest | Animations | Already used throughout Home screen |
| react-native-svg | Latest | Shield badge shape | Already used in ProgressRing, TimerRing |
| expo-router | Latest | Navigation to Progress tab | Already handles all app navigation |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-symbols | Latest | SF Symbols on iOS | Could use `shield.fill` as alternative to custom SVG |
| @expo/vector-icons | Latest | Material Icons fallback | Android fallback if using SF Symbols |

### No New Dependencies Needed
This phase requires no new library installations. All necessary tools exist in the codebase.

## Architecture Patterns

### Current Home Screen Structure
```
HomeScreen (app/(tabs)/index.tsx)
├── HomeHeader (greeting)
├── HeroCard (hero area) <-- MODIFY THIS
│   ├── TriMascot
│   └── Content (title, subtitle)
├── Button (Start Quiz)
└── StatsGrid (stats cards)
```

### Proposed Hero Card Structure
```
HeroCard
├── TriMascot
├── TierSection (NEW) <-- INSERT BELOW MASCOT
│   ├── TierBadge (shield with tier number)
│   ├── Text (tier name)
│   └── TierProgressBar (reused from Phase 11)
└── Content (title, subtitle)
```

### Component File Organization
```
medtriad/components/home/
├── HeroCard.tsx          # MODIFY: Add tier props, include TierSection
├── TierSection.tsx       # NEW: Wrapper for tier display elements
├── TierBadge.tsx         # NEW: Shield SVG with tier number
└── TriMascot.tsx         # No changes needed
```

### Pattern 1: Tier Data Flow
**What:** Pass tier data from useStats through HeroCard to TierSection
**When to use:** All tier display scenarios
**Example:**
```typescript
// Source: Existing pattern in index.tsx
const { tier, tierProgress, nextTier } = useStats();

<HeroCard
  // ... existing props
  tier={tier}
  tierProgress={tierProgress}
  onTierPress={() => router.push('/(tabs)/progress')}
/>
```

### Pattern 2: Pressable with Animation
**What:** Use AnimatedPressable for tap-to-navigate interactions
**When to use:** Tier section tap to Progress tab
**Example:**
```typescript
// Source: StatsGrid.tsx pattern
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const scale = useSharedValue(1);

const handlePressIn = () => {
  scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
};
```

### Pattern 3: SVG Shield Badge
**What:** Create shield shape using react-native-svg Path
**When to use:** Tier badge display
**Example:**
```typescript
// Source: Based on ProgressRing.tsx SVG usage
import Svg, { Path, Text as SvgText } from 'react-native-svg';

// Shield path (simple shield shape)
const SHIELD_PATH = 'M12 2 L22 6 L22 12 C22 17 17 21 12 22 C7 21 2 17 2 12 L2 6 Z';
```

### Pattern 4: Fill Animation on Appear
**What:** Animate progress bar from 0 to actual value when component mounts
**When to use:** Home screen tier progress bar
**Example:**
```typescript
// Source: TierProgressBar.tsx with modification
const animatedProgress = useSharedValue(0);

useEffect(() => {
  // Delay slightly then animate to actual progress
  animatedProgress.value = withDelay(
    300, // Wait for enter animation
    withSpring(progress, Easings.gentle)
  );
}, []);
```

### Anti-Patterns to Avoid
- **Duplicating tier logic:** Don't recreate tier calculations - use useStats hook
- **Hardcoding tier colors:** Use theme colors (colors.primary for all tiers per current design)
- **Nested navigation handlers:** Keep navigation at HeroCard level, not deep in TierBadge
- **Custom timing animations:** Use spring animations per Phase 10 motion principles

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Progress bar | Custom bar component | TierProgressBar | Already styled per CONTEXT (4px height, no text) |
| Tier calculations | Custom tier logic | useStats().tier | Already computes tier from gamesPlayed |
| Tab navigation | Custom navigation | router.push('/(tabs)/progress') | expo-router pattern used throughout |
| Animated press | Custom press handling | AnimatedPressable pattern | Established in StatsGrid |
| Entry animations | Custom timing | FadeInUp with springify() | Home screen pattern |

**Key insight:** Phase 11 built the tier system infrastructure. This phase only needs to consume it and display it in a new location.

## Common Pitfalls

### Pitfall 1: Forgetting to Import TierDefinition Type
**What goes wrong:** TypeScript errors when typing tier props
**Why it happens:** TierDefinition is in mastery.ts service, not a common types file
**How to avoid:** Import from '@/services/mastery'
**Warning signs:** Type errors on tier.name, tier.tier

### Pitfall 2: Progress Bar Not Animating on Home Screen
**What goes wrong:** Bar appears at final value immediately, no fill animation
**Why it happens:** TierProgressBar animates when progress prop changes, but initial mount has static value
**How to avoid:** Start with progress=0, then update after mount delay
**Warning signs:** Missing the "bar fills from empty" requirement

### Pitfall 3: Shield Badge Not Centering Text
**What goes wrong:** Tier number appears off-center in shield
**Why it happens:** SVG Text baseline differs from RN Text
**How to avoid:** Use textAnchor="middle" and adjust y coordinate with dominantBaseline
**Warning signs:** Number visually shifted up or down

### Pitfall 4: Navigation Happening on Press Instead of PressOut
**What goes wrong:** Navigation triggers before press animation completes
**Why it happens:** Using onPress instead of properly sequencing
**How to avoid:** Navigate in onPress after animation, or use slight delay
**Warning signs:** Janky feel when tapping tier area

### Pitfall 5: Animation Timing Conflicts
**What goes wrong:** Entry animation and progress fill animation compete
**Why it happens:** Both try to animate simultaneously
**How to avoid:** Delay progress animation until after entry animation settles
**Warning signs:** Progress bar appears filled during fade-in

## Code Examples

Verified patterns from official sources:

### Navigation to Tab
```typescript
// Source: app/(tabs)/index.tsx line 42
const handleStatPress = (stat: string) => {
  router.push('/(tabs)/progress');
};
```

### SVG Shape with Text
```typescript
// Source: Based on ProgressRing.tsx and TimerRing.tsx patterns
import Svg, { Path, Text as SvgText } from 'react-native-svg';

export function TierBadge({ tierNumber, size = 32 }: TierBadgeProps) {
  const colors = Colors.light;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 26">
      <Path
        d="M12 1 L22 5 L22 12 C22 18 17 22 12 24 C7 22 2 18 2 12 L2 5 Z"
        fill={colors.primary}
      />
      <SvgText
        x="12"
        y="14"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={colors.textInverse}
      >
        {tierNumber}
      </SvgText>
    </Svg>
  );
}
```

### Entry Animation with Stagger
```typescript
// Source: HeroCard.tsx line 109-111
<Animated.View
  entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
>
```

### Animated Press Feedback
```typescript
// Source: StatsGrid.tsx lines 33-44
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handlePressIn = () => {
  scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
};

const handlePressOut = () => {
  scale.value = withSpring(1, { damping: 15, stiffness: 400 });
};
```

### Spring Animation (Phase 10 Motion)
```typescript
// Source: constants/theme.ts lines 209-226
export const Easings = {
  // Bouncy reveals - playful overshoot
  bouncy: { damping: 10, stiffness: 300 },

  // Gentle settles - slow, weighty landing
  gentle: { damping: 20, stiffness: 150 },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Question-based mastery | Game-based tier system | Phase 11 | Use tier from useStats, not masteryLevel |
| Fixed timing animations | Spring physics | Phase 10 | All motion uses withSpring, never withTiming for transforms |

**Deprecated/outdated:**
- `masteryLevel`, `masteryProgress` from useStats - kept for backward compat, use `tier`, `tierProgress` instead
- `getLevelTitle()` - use `tier.name` directly

## Open Questions

Things that couldn't be fully resolved:

1. **Shield SVG exact path**
   - What we know: react-native-svg supports Path with d attribute
   - What's unclear: Exact shield shape coordinates for best visual
   - Recommendation: Start with simple shield path, refine visually

2. **SF Symbol shield vs custom SVG**
   - What we know: SF Symbol `shield.fill` exists, but needs Material Icon mapping
   - What's unclear: Whether to use SF Symbol or custom SVG for consistency
   - Recommendation: Use custom SVG for cross-platform consistency and ability to place number inside

## Sources

### Primary (HIGH confidence)
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/components/home/HeroCard.tsx` - Current hero structure
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/components/progress/TierProgressBar.tsx` - Reusable progress bar
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/hooks/useStats.ts` - Tier data hook
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/services/mastery.ts` - Tier definitions
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/constants/theme.ts` - Theme constants, Easings
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/components/home/ProgressRing.tsx` - SVG circle pattern
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/components/home/StatsGrid.tsx` - AnimatedPressable pattern

### Secondary (MEDIUM confidence)
- [SF Symbols Guide - Hacking with Swift](https://www.hackingwithswift.com/articles/237/complete-guide-to-sf-symbols) - Shield.fill symbol exists
- [SF Symbols - Apple Developer](https://developer.apple.com/sf-symbols/) - Official SF Symbols reference

### Tertiary (LOW confidence)
- None - all findings verified with codebase sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use in codebase
- Architecture: HIGH - Pattern directly follows existing Home screen structure
- Pitfalls: HIGH - Based on actual codebase patterns and requirements

**Research date:** 2026-01-19
**Valid until:** 30 days (stable domain, no fast-moving dependencies)
