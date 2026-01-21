# Phase 4: Game Mechanics - Research

**Researched:** 2026-01-18
**Domain:** Scoring systems, timer animations, React Native Reanimated
**Confidence:** HIGH

## Summary

This phase implements the scoring system (base points, speed bonus, combo multiplier, perfect round bonus) and enhances the timer with color transitions. The codebase already has a solid foundation: the quiz reducer handles combo tracking, the timer hook manages countdowns, and react-native-reanimated is already integrated with established patterns.

The key work involves: (1) creating a pure scoring service for point calculations, (2) modifying the reducer to pass timing data for speed bonus, (3) implementing floating points animation from answer buttons, (4) adding combo badge pulse animation, (5) implementing timer ring color interpolation, (6) adding cancel button with confirmation dialog, and (7) creating perfect round celebration before results.

**Primary recommendation:** Add a `services/scoring.ts` with pure functions for all scoring calculations. Extend the quiz reducer to track timing for speed bonus. Use react-native-reanimated's `interpolateColor` for timer transitions and `withSequence` for pulse/floating animations.

## Standard Stack

The codebase already uses the correct libraries for this phase.

### Core (Already Installed)
| Library | Purpose | Notes |
|---------|---------|-------|
| react-native-reanimated | All animations | Already used in AnswerCard, Button |
| react-native-svg | Timer ring | Already used in TimerRing |
| expo-haptics | Feedback | Already used in quiz screen |
| expo-router | Navigation | Already used for routing |

### No Additional Dependencies Needed

All required functionality can be achieved with existing dependencies.

## Architecture Patterns

### Recommended File Structure for Phase 4

```
services/
  scoring.ts          # NEW: Pure scoring calculation functions
hooks/
  use-quiz-reducer.ts # MODIFY: Add timeAnswered for speed bonus
components/
  quiz/
    FloatingPoints.tsx  # NEW: Animated points display
    ScoreDisplay.tsx    # MODIFY: Add pulse animation for combo
    TimerRing.tsx       # MODIFY: Add color interpolation animation
    CancelButton.tsx    # NEW: Cancel quiz button with confirmation
app/
  quiz/
    index.tsx         # MODIFY: Wire up new components
    celebration.tsx   # NEW: Perfect round celebration screen (optional)
```

### Pattern 1: Pure Scoring Service

**What:** All scoring logic in pure functions, separate from React state
**When to use:** Any calculation that doesn't depend on React lifecycle
**Why:** Testable, predictable, reusable

```typescript
// services/scoring.ts
export const SCORING = {
  BASE_POINTS: 100,
  MAX_SPEED_BONUS: 50,
  PERFECT_ROUND_BONUS: 500,
  COMBO_THRESHOLD: 3,  // Correct answers to increase tier
  MAX_COMBO_TIER: 3,
} as const;

/**
 * Calculate speed bonus using front-loaded curve
 * Returns 0-50 points, heavily weighted toward fast answers
 */
export function calculateSpeedBonus(
  timeRemaining: number,
  totalTime: number
): number {
  if (timeRemaining <= 0) return 0;

  // Front-loaded curve: bonus = maxBonus * (remaining/total)^2
  // This gives 50 at full time, ~12.5 at half time, ~3 at quarter time
  const ratio = timeRemaining / totalTime;
  const bonus = Math.floor(SCORING.MAX_SPEED_BONUS * ratio * ratio);
  return bonus;
}

/**
 * Get combo multiplier tier based on consecutive correct streak
 * Tier increases every 3 correct answers
 */
export function getComboTier(consecutiveCorrect: number): number {
  if (consecutiveCorrect < SCORING.COMBO_THRESHOLD) return 1;
  if (consecutiveCorrect < SCORING.COMBO_THRESHOLD * 2) return 2;
  return SCORING.MAX_COMBO_TIER; // 3x max
}

/**
 * Calculate total points for a correct answer
 */
export function calculateAnswerPoints(
  timeRemaining: number,
  totalTime: number,
  comboTier: number
): { base: number; speedBonus: number; multiplier: number; total: number } {
  const base = SCORING.BASE_POINTS;
  const speedBonus = calculateSpeedBonus(timeRemaining, totalTime);
  const multiplier = comboTier;
  const total = (base + speedBonus) * multiplier;

  return { base, speedBonus, multiplier, total };
}

/**
 * Check if round qualifies for perfect bonus
 */
export function isPerfectRound(correctCount: number, totalQuestions: number): boolean {
  return correctCount === totalQuestions;
}
```

### Pattern 2: Reducer Extension for Timing Data

**What:** Extend SELECT_ANSWER action to include timing for speed bonus calculation
**Why:** Reducer already handles scoring; keep it centralized

```typescript
// types/quiz-state.ts - Extended action
export type QuizAction =
  | { type: 'START_QUIZ'; questions: QuizQuestion[] }
  | {
      type: 'SELECT_ANSWER';
      optionId: string;
      isCorrect: boolean;
      timeRemaining: number;  // NEW: for speed bonus
    }
  | { type: 'TICK_TIMER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET' };

// In reducer - calculate points with speed bonus
case 'SELECT_ANSWER':
  if (state.status !== 'playing') return state;

  const points = action.isCorrect
    ? calculateAnswerPoints(
        action.timeRemaining,
        QUESTION_TIME,
        getComboTier(state.consecutiveCorrect)
      )
    : { total: 0 };

  return {
    ...state,
    status: 'answered',
    selectedOptionId: action.optionId,
    score: state.score + points.total,
    consecutiveCorrect: action.isCorrect
      ? state.consecutiveCorrect + 1
      : 0,
    lastPointsEarned: points.total,  // NEW: for floating animation
  };
```

### Pattern 3: Combo Tier vs Raw Count

**What:** Track consecutive correct count, derive multiplier tier from it
**Why:** Tier increases every 3 correct (requirement SCOR-03)

Current reducer tracks `combo` starting at 1, incrementing each correct. This needs adjustment:

| Consecutive Correct | Tier | Multiplier |
|---------------------|------|------------|
| 0-2 | 1 | 1x |
| 3-5 | 2 | 2x |
| 6+ | 3 | 3x |

The reducer should track `consecutiveCorrect` (0-based count) and derive `comboTier` from it.

### Anti-Patterns to Avoid

- **Calculating scores in components:** Keep calculations in service/reducer
- **Storing derived state:** Don't store comboTier, derive from consecutiveCorrect
- **Animating with JS timers:** Use Reanimated worklets for 60fps animations
- **Hardcoding point values:** Use SCORING constants for maintainability

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color interpolation | Manual RGB math | `interpolateColor` from reanimated | Handles color spaces, gamma correction |
| Animation sequencing | setTimeout chains | `withSequence`, `withDelay` | Runs on UI thread, 60fps |
| Confirmation dialogs | Custom modal | `Alert.alert` | Native iOS feel, accessible |
| Combo multiplier logic | Complex if-else | Pure function | Testable, predictable |

## Common Pitfalls

### Pitfall 1: Animating Text backgroundColor

**What goes wrong:** `interpolateColor` on Text backgroundColor doesn't animate smoothly
**Why it happens:** Reanimated optimization path for text differs from views
**How to avoid:** Add a layout property (like `top: 0`) to force the animation path
**Warning signs:** Color jumps instead of transitions

### Pitfall 2: Floating Points Z-Index

**What goes wrong:** Floating points appear behind other elements
**Why it happens:** React Native z-index is tricky with absolute positioning
**How to avoid:** Render FloatingPoints as last child in container, use `zIndex` style
**Warning signs:** Points invisible or clipped

### Pitfall 3: Timer Re-render Performance

**What goes wrong:** Timer color changes cause full component re-render
**Why it happens:** Using derived state in component instead of animated value
**How to avoid:** Use `useDerivedValue` + `interpolateColor` in `useAnimatedStyle`
**Warning signs:** Timer feels laggy, frame drops

### Pitfall 4: Combo Increment Timing

**What goes wrong:** Combo shows new value before animation starts
**Why it happens:** State updates immediately, animation is async
**How to avoid:** Trigger animation in useEffect watching combo change
**Warning signs:** Badge jumps to new number, then pulses

### Pitfall 5: Speed Bonus Zero on Timeout

**What goes wrong:** Timeout gives speed bonus (should be 0)
**Why it happens:** timeRemaining passed when timeout fires
**How to avoid:** In TICK_TIMER when time expires, don't pass timeRemaining to scoring
**Warning signs:** User gets points when timer expires

## Code Examples

### Timer Ring Color Interpolation

```typescript
// components/quiz/TimerRing.tsx
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  interpolateColor,
} from 'react-native-reanimated';

type TimerRingProps = {
  seconds: number;
  totalSeconds: number;
};

export function TimerRing({ seconds, totalSeconds }: TimerRingProps) {
  const colors = Colors[useColorScheme() ?? 'light'];

  // Derive animated color from seconds
  // Using Animated.View wrapper for the ring stroke
  const animatedStyle = useAnimatedStyle(() => {
    // seconds: 12 -> 5 -> 3 -> 0
    // We want: blue -> yellow (at 5) -> red (at 3)
    const color = interpolateColor(
      seconds,
      [0, 3, 5, totalSeconds],
      [colors.timerDanger, colors.timerDanger, colors.timerWarning, colors.timerNormal]
    );
    return { stroke: color };
  });

  // ... rest of component
}
```

**Note:** Since react-native-svg Circle doesn't directly support Animated styles, you may need to use `Animated.createAnimatedComponent(Circle)` or pass color as prop and animate the container.

### Floating Points Animation

```typescript
// components/quiz/FloatingPoints.tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect } from 'react';

type FloatingPointsProps = {
  points: number;
  onComplete: () => void;
};

export function FloatingPoints({ points, onComplete }: FloatingPointsProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-80, { duration: 800 });
    opacity.value = withTiming(0, { duration: 800 }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.points}>+{points}</Text>
    </Animated.View>
  );
}
```

### Combo Badge Pulse Animation

```typescript
// In ScoreDisplay.tsx
import { withSequence, withTiming } from 'react-native-reanimated';

// Trigger pulse when combo tier increases
useEffect(() => {
  if (combo > previousCombo.current && combo > 1) {
    scale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(1.0, { duration: 150 })
    );
  }
  previousCombo.current = combo;
}, [combo]);
```

### Cancel Button with Confirmation

```typescript
// components/quiz/CancelButton.tsx
import { Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function CancelButton() {
  const router = useRouter();

  const handlePress = () => {
    Alert.alert(
      'Quit Quiz?',
      'Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)')
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={8}>
      <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}
```

### Speed Bonus Formula (Front-Loaded Curve)

```typescript
/**
 * Front-loaded quadratic curve for speed bonus
 *
 * Formula: bonus = maxBonus * (timeRemaining / totalTime)^2
 *
 * With 12s total time and 50 max bonus:
 * - 12s remaining: 50 points
 * - 10s remaining: 35 points
 * - 8s remaining: 22 points
 * - 6s remaining: 12 points
 * - 4s remaining: 6 points
 * - 2s remaining: 1 point
 * - 0s remaining: 0 points
 */
export function calculateSpeedBonus(
  timeRemaining: number,
  totalTime: number
): number {
  if (timeRemaining <= 0) return 0;
  const ratio = timeRemaining / totalTime;
  return Math.floor(50 * ratio * ratio);
}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `combo` as raw counter | `consecutiveCorrect` count + derived tier | Clearer semantics, matches requirements |
| Color switch via state | `interpolateColor` with animated values | Smooth 60fps transitions |
| Manual timeout chains | Reanimated `withSequence` | No JS thread blocking |

## Open Questions

1. **Perfect round celebration timing**
   - What we know: User decided on special moment before results screen
   - What's unclear: How long should celebration last? Auto-dismiss or tap to continue?
   - Recommendation: 1.5-2 second celebration with auto-advance, matching existing ANSWER_DELAY pattern

2. **Floating points position**
   - What we know: Should originate from tapped answer button
   - What's unclear: Exact positioning logic when button is near edge
   - Recommendation: Absolute position calculated from button's onLayout, with bounds checking

3. **Timer color during answered state**
   - What we know: Timer stops when answered
   - What's unclear: Should color freeze or reset for next question?
   - Recommendation: Freeze at current color during answered state, reset on NEXT_QUESTION

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `hooks/use-quiz-reducer.ts`, `hooks/use-countdown-timer.ts`
- Codebase analysis: `components/quiz/TimerRing.tsx`, `components/quiz/ScoreDisplay.tsx`
- Codebase analysis: `components/quiz/AnswerCard.tsx` (existing reanimated patterns)
- [React Native Reanimated - interpolateColor](https://docs.swmansion.com/react-native-reanimated/docs/utilities/interpolateColor/)
- [React Native Reanimated - withSequence](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/)
- [React Native Alert](https://reactnative.dev/docs/alert)

### Secondary (MEDIUM confidence)
- [Reanimated entering/exiting animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/)
- WebSearch: Speed bonus curve patterns (no authoritative source, designed based on "front-loaded" requirement)

## Metadata

**Confidence breakdown:**
- Scoring calculations: HIGH - Pure functions, well-defined requirements
- Timer color transitions: HIGH - Official reanimated docs verified
- Floating points animation: HIGH - Standard reanimated pattern
- Combo pulse animation: HIGH - Already using pattern in AnswerCard
- Cancel confirmation: HIGH - React Native Alert API is stable
- Perfect round celebration: MEDIUM - User decision, implementation details TBD

**Research date:** 2026-01-18
**Valid until:** 30 days (stable patterns, no fast-moving dependencies)
