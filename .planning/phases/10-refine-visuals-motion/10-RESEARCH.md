# Phase 10: Refine Visuals & Motion - Research

**Researched:** 2026-01-18
**Domain:** React Native animation, visual polish, design systems
**Confidence:** HIGH

## Summary

Phase 10 focuses on elevating visual quality through consistent spacing, refined colors/typography, and polished motion. Research shows the codebase already has a well-structured design system in `theme.ts` with an 8pt-based spacing scale, comprehensive color palette, and animation duration constants. React Native Reanimated 4.1.1 is already installed and actively used throughout the app with established patterns.

The current implementation has good foundational animations (FadeInUp with staggered delays, button/card scale effects, mascot breathing), but several high-impact moments lack motion polish: timer transitions, combo multiplier reveals, results score count-up, and tier-up celebrations. The primary opportunity is adding "settle" motion to make interactions feel weighted and physical, plus ensuring all motion uses spring/easing (no linear).

**Primary recommendation:** Focus on high-impact motion moments (results score reveal, combo badge pulse, timer state changes) rather than scattered effects. Use existing Durations constants and springify() pattern established in the codebase.

## Current State Analysis

### Spacing System - EXISTS (8pt grid)
```typescript
// From theme.ts - Already implements 8pt base grid
export const Spacing = {
  xs: 4,    // 0.5x
  sm: 8,    // 1x (base)
  md: 12,   // 1.5x
  base: 16, // 2x
  lg: 24,   // 3x
  xl: 32,   // 4x
  xxl: 48,  // 6x
  xxxl: 64, // 8x
} as const;
```
**Assessment:** Complete. The 8pt grid is already defined and used consistently. No changes needed to the spacing scale.

### Color Palette - EXISTS (comprehensive)
```typescript
// From theme.ts - Teal-centric light mode
const tealPalette = {
  primary: '#4ECDC4',
  primaryDark: '#3BA99C',
  primaryLight: '#E6FAF8',
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundCard: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',
  textInverse: '#FFFFFF',
  border: '#DFE6E9',
  borderStrong: '#B2BEC3',
  pressed: '#E6FAF8',
  success: '#00B894',
  successBg: '#D4F5ED',
  error: '#E17055',
  errorBg: '#FFEAEA',
  timerNormal: '#4ECDC4',
  timerWarning: '#FDCB6E',
  timerDanger: '#E17055',
} as const;
```
**Assessment:** Complete. Colors are well-organized with semantic naming. Timer states have dedicated colors. May want to document the palette formally.

### Typography Hierarchy - EXISTS (comprehensive)
```typescript
// From theme.ts - 8 defined typography styles
display: { fontSize: 64, fontWeight: '700', lineHeight: 64, letterSpacing: -2 },
title: { fontSize: 32, fontWeight: '700', lineHeight: 38, letterSpacing: -0.5 },
titleLarge: { fontSize: 28, fontWeight: '600', lineHeight: 34, letterSpacing: -0.3 },
heading: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
body: { fontSize: 18, fontWeight: '500', lineHeight: 26 },
label: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
stat: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
caption: { fontSize: 15, fontWeight: '400', lineHeight: 20 },
footnote: { fontSize: 13, fontWeight: '400', lineHeight: 18, letterSpacing: 0.3 },
tiny: { fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 0.5 },
```
**Assessment:** Complete. Typography scale is well-defined with appropriate line heights.

### Animation Durations - EXISTS (basic)
```typescript
export const Durations = {
  fast: 150,
  normal: 300,
  slow: 500,
  stagger: 50,
} as const;
```
**Assessment:** Adequate. May want to add `slower: 800` for count-up animations.

### Existing Micro-Interactions

| Component | Animation Type | Implementation |
|-----------|----------------|----------------|
| Button | Scale on press | withSpring(0.98) / withSpring(1) on press in/out |
| Card | Scale on press | withSpring(0.98) / withSpring(1) |
| AnswerCard | Scale + shake | withSpring(0.95) on press, withSequence shake on incorrect |
| TriMascot | Breathing + float | withRepeat scale pulse, float Y offset by mood |
| ScoreDisplay | Combo badge pulse | withSequence scale 1.15 -> 1.0 on combo increase |
| TimerBar | Width + pulse | withTiming for bar, withRepeat for low time pulse |
| ProgressRing | Animated SVG stroke | useAnimatedProps with withTiming |
| MasteryBar | Animated fill width | withTiming easing out cubic |
| HighScoreBadge | ZoomIn.springify | Entry animation only |
| FloatingPoints | Translate + fade | withTiming for float up and fade |
| TriadItem | Accordion height + chevron | withTiming for expand/collapse |

### Gaps Identified

1. **No easing constants** - Components define easings inline
2. **Inconsistent spring configs** - Each component has its own damping/stiffness values
3. **Missing high-impact animations:**
   - Timer bar color transitions (currently instant)
   - Combo multiplier "pop" effect (current pulse is subtle)
   - Results score needs more dramatic count-up with easing
   - No tier-up/level-up celebration moment
   - No idle breathing on mascot (already implemented, but could be enhanced)
4. **No page transitions** - Quiz flow uses default Stack animations
5. **CancelButton has no press state** - Uses plain TouchableOpacity

## Standard Stack

The project already has the right libraries installed:

### Core
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react-native-reanimated | ~4.1.1 | All animations | Installed, heavily used |
| react-native-gesture-handler | ~2.28.0 | Gestures | Installed |
| react-native-confetti-cannon | ^1.5.2 | Celebration effects | Installed, used in results |
| use-count-up | ^3.0.1 | Score count animation | Installed, used in results |
| react-native-svg | 15.12.1 | SVG animations (rings) | Installed |
| expo-linear-gradient | ~15.0.8 | Gradient backgrounds | Installed |

### No Additional Libraries Needed
The existing stack is sufficient. Do NOT add new animation libraries.

## Architecture Patterns

### Recommended: Centralized Animation Config in theme.ts

Add to `theme.ts`:
```typescript
// Animation easings (standardize across app)
export const Easings = {
  // For scale/position - natural spring
  spring: { damping: 15, stiffness: 400 },
  springBouncy: { damping: 12, stiffness: 300 },
  springGentle: { damping: 20, stiffness: 200 },

  // For opacity/color - timing with easing
  easeOut: Easing.out(Easing.cubic),
  easeInOut: Easing.inOut(Easing.cubic),

  // For progress bars
  progressFill: Easing.out(Easing.cubic),
} as const;

// Animation duration additions
export const Durations = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,    // ADD: For score count-ups
  stagger: 50,
  staggerMedium: 80, // ADD: For celebratory staggers
} as const;
```

### Established Entry Animation Pattern
Already used consistently in the codebase:
```typescript
// Standard entry animation (from STATE.md decisions)
entering={FadeInUp.delay(N * Durations.stagger).duration(Durations.normal).springify()}
```

### Established Press Animation Pattern
Already used in Button.tsx and Card.tsx:
```typescript
const scale = useSharedValue(1);

const handlePressIn = () => {
  if (!disabled) {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  }
};

const handlePressOut = () => {
  scale.value = withSpring(1, { damping: 15, stiffness: 400 });
};
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Count-up numbers | Manual setInterval | use-count-up library | Already installed, handles easing |
| Confetti | Custom particles | react-native-confetti-cannon | Already installed |
| Spring physics | Manual physics calculations | withSpring() | Built into Reanimated |
| Page transitions | Custom transition components | expo-router Stack animation options | Native integration |
| Circular progress | Manual arc drawing | ProgressRing component | Already exists |

## Common Pitfalls

### Pitfall 1: Linear Motion
**What goes wrong:** Animations feel robotic and unnatural
**Why it happens:** Using withTiming() without easing, or constant velocity
**How to avoid:** Always use:
- `withSpring()` for position/scale changes
- `withTiming(value, { easing: Easing.out(Easing.cubic) })` for opacity/color
- Never use `duration` only - always pair with easing

### Pitfall 2: Competing Spring Configs
**What goes wrong:** Different components feel disconnected, animation language inconsistent
**Why it happens:** Each component defines its own spring parameters
**How to avoid:** Define spring presets in theme.ts:
```typescript
// Use: withSpring(value, Easings.spring)
// Not: withSpring(value, { damping: 15, stiffness: 400 })
```

### Pitfall 3: Simultaneous Animations Without Stagger
**What goes wrong:** Everything animates at once, overwhelming and chaotic
**Why it happens:** All elements use same delay or no delay
**How to avoid:** Use staggered delays (already established pattern):
```typescript
// Good: Staggered reveals
elements.map((_, i) => FadeInUp.delay(i * Durations.stagger))
// Bad: All at once
elements.map(() => FadeIn)
```

### Pitfall 4: Forgetting worklet Directive
**What goes wrong:** Animation callback runs on JS thread, causes jank
**Why it happens:** Custom animation logic without 'worklet' directive
**How to avoid:** Mark all animation callbacks:
```typescript
const callback = () => {
  'worklet';
  // animation logic
};
```

### Pitfall 5: Over-animating
**What goes wrong:** App feels busy, distracting from content
**Why it happens:** Adding animation to every element
**How to avoid:** Follow motion principles from requirements:
- Prioritize high-impact moments
- Motion should feel soft, weighted, physical
- Nothing snaps - everything settles

## High-Impact Motion Targets (Prioritized)

### Priority 1: Results Screen
**Current:** Score count-up with use-count-up, staggered FadeInUp entries
**Missing:**
- Score number should scale/settle after count-up completes
- Stats row could have more dramatic stagger
- Mastery badge needs entrance flourish
**Implementation approach:** Add completion callback to CountUp, trigger scale animation

### Priority 2: Quiz Combo Multiplier
**Current:** Badge pulses (scale 1.15 -> 1.0) when combo increases
**Missing:**
- More dramatic "pop" effect
- Could add brief glow/highlight
**Implementation approach:** Enhance withSequence to include slight overshoot

### Priority 3: Timer State Transitions
**Current:** Color changes are instant, bar width animates
**Missing:**
- Smooth color interpolation between states
- Number could pulse more dramatically at warning/danger
**Implementation approach:** Use interpolateColor for bar fill

### Priority 4: Tier-Up Moment
**Current:** Not implemented
**Missing:**
- When user levels up, needs celebratory moment
- Could trigger confetti + mascot animation + badge
**Implementation approach:** Track level changes in results screen, trigger celebration sequence

### Priority 5: Answer Card States
**Current:** Has shake on incorrect, scale on press
**Missing:**
- Correct answer could have subtle "pop" + glow
- Could add brief shadow lift on tap
**Implementation approach:** Enhance correct state with scale + shadow animation

### Priority 6: Button Depth
**Current:** Has scale animation, has borderBottomWidth for depth
**Missing:**
- Border could animate on press (compress the "depth")
**Implementation approach:** Animate borderBottomWidth in addition to scale

### Priority 7: Page Transitions
**Current:** Default Stack transitions
**Missing:**
- Quiz entry could slide up more dramatically
- Results could have custom entrance
**Implementation approach:** Configure Stack.Screen animation options

## Code Examples

### Example 1: Standardized Spring Config
```typescript
// In theme.ts
import { Easing } from 'react-native-reanimated';

export const Easings = {
  spring: { damping: 15, stiffness: 400 },
  springBouncy: { damping: 12, stiffness: 300 },
} as const;

// Usage in component
import { Easings } from '@/constants/theme';
scale.value = withSpring(0.98, Easings.spring);
```

### Example 2: Color Interpolation for Timer
```typescript
// In TimerBar.tsx
import { interpolateColor } from 'react-native-reanimated';

const barAnimatedStyle = useAnimatedStyle(() => {
  const backgroundColor = interpolateColor(
    progress, // 0-1
    [0, 0.2, 0.33, 1],
    [colors.error, colors.timerWarning, colors.primary, colors.primary]
  );
  return {
    width: `${barWidth.value * 100}%`,
    backgroundColor,
  };
});
```

### Example 3: Combo Pop Effect
```typescript
// Enhanced combo pulse
useEffect(() => {
  if (combo > previousCombo.current) {
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 300 }),  // Overshoot
      withSpring(1.0, { damping: 12, stiffness: 200 }) // Settle
    );
  }
  previousCombo.current = combo;
}, [combo]);
```

### Example 4: Score Settle After Count
```typescript
// In Results screen
const scoreScale = useSharedValue(0.8);

// After CountUp completes (use isCounting prop)
useEffect(() => {
  const timer = setTimeout(() => {
    scoreScale.value = withSequence(
      withSpring(1.05, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
  }, 1100); // After 1s count-up
  return () => clearTimeout(timer);
}, []);
```

### Example 5: Tier-Up Celebration
```typescript
// Track level changes
const previousLevel = useRef(level);
const [showTierUp, setShowTierUp] = useState(false);

useEffect(() => {
  if (level > previousLevel.current) {
    setShowTierUp(true);
    // Also trigger confetti
    confettiRef.current?.start();
  }
  previousLevel.current = level;
}, [level]);

{showTierUp && (
  <Animated.View
    entering={ZoomIn.springify().damping(8)}
    style={styles.tierUpBadge}
  >
    <Text>Level Up! Now at {tierName}</Text>
  </Animated.View>
)}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Inline spring configs | Centralized Easings constant | Consistency |
| Linear withTiming | Always use easing | Natural feel |
| FadeIn only | FadeInUp.springify() | Depth, direction |
| Instant state changes | Interpolated transitions | Smooth flow |

## Open Questions

1. **Timer bar height during warning/danger states**
   - What we know: Currently 6px height
   - What's unclear: Should it pulse in height as well as color?
   - Recommendation: Keep height constant, focus on color + number pulse

2. **Mascot idle animation scope**
   - What we know: Already has breathing animation
   - What's unclear: Should there be occasional blinks or other idle behaviors?
   - Recommendation: Breathing is sufficient, more would be distracting

## Sources

### Primary (HIGH confidence)
- `/medtriad/constants/theme.ts` - Existing design system
- `/medtriad/components/ui/Button.tsx` - Established animation pattern
- `/medtriad/components/quiz/AnswerCard.tsx` - Shake + scale patterns
- `/medtriad/app/quiz/results.tsx` - Count-up and confetti usage
- `/medtriad/components/home/TriMascot.tsx` - Breathing animation pattern

### Secondary (MEDIUM confidence)
- [React Native Reanimated - Entering/Exiting Animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/)
- [React Native Reanimated - withSpring](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/)
- [React Native Reanimated - Customizing Animations](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/customizing-animation/)

## Metadata

**Confidence breakdown:**
- Spacing/Color/Typography: HIGH - Direct code inspection
- Animation patterns: HIGH - Direct code inspection + official docs
- Motion priorities: HIGH - Based on requirements + existing gaps
- Spring configs: MEDIUM - Best practices may vary by preference

**Research date:** 2026-01-18
**Valid until:** 30 days (stable libraries, established patterns)
