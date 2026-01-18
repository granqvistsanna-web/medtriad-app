# Phase 3: Screen Flow - Research

**Researched:** 2026-01-18
**Domain:** Home screen UI, results screen UI, navigation flow, stats display, score count-up animation
**Confidence:** HIGH

## Summary

This phase implements the complete navigation flow between Home, Quiz, and Results screens. The research covers five main areas: (1) home screen design with stats display, (2) results screen with score summary and high score badge, (3) passing quiz results between screens, (4) animated score count-up, and (5) reusing existing components and patterns.

Phase 2 has already delivered the core quiz gameplay with working navigation routes. The quiz screen exists at `app/quiz/index.tsx` and navigates to a placeholder results screen at `app/quiz/results.tsx`. The results screen currently has basic "Results" text and working Play Again/Home buttons. The home screen at `app/(tabs)/index.tsx` has a temporary Start Quiz button but still uses the Expo template layout.

The key decisions for this phase are: (1) how to pass quiz results to the results screen (URL params vs Context), (2) where stats come from (placeholder values for now, Phase 5 handles persistence), and (3) whether to add count-up animation dependencies or hand-roll with Reanimated.

**Primary recommendation:** Pass quiz results via URL search params (score, correct count, best streak) which is the standard Expo Router pattern. Create a QuizContext to share state when needed in later phases, but for MVP, URL params are simpler. Use existing `react-native-reanimated` for count-up animation rather than adding a new dependency.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | ~6.0.21 | Screen navigation and params | Already in project, file-based routing |
| react-native-reanimated | ~4.1.1 | Score count-up animation | Already in project, no new dependency |
| expo-symbols | ~1.0.8 | SF Symbols icons (flame, trophy) | Already in project for iOS |
| @expo/vector-icons | ^15.0.3 | Fallback icons (Android/web) | Already in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-count-up | latest | Simpler count-up hook | If Reanimated approach is too complex |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| URL params | React Context | Context better for complex state sharing, but URL params simpler for read-only results |
| URL params | Global state (Zustand) | Overkill for passing results once per quiz |
| Reanimated count-up | use-count-up library | use-count-up is simpler but adds ~5KB dependency |
| SF Symbols | Emoji (flame emoji) | SF Symbols integrate better, but emoji works everywhere |

**Installation:**
```bash
# No additional packages needed - all capabilities already installed
# Optional if count-up with Reanimated proves complex:
# npm install use-count-up
```

## Architecture Patterns

### Recommended Project Structure

```
medtriad/
  app/
    _layout.tsx                 # Root stack (already configured)
    (tabs)/
      _layout.tsx              # Tab navigator (already exists)
      index.tsx                # Home screen (replace template)
    quiz/
      _layout.tsx              # Quiz stack (already exists)
      index.tsx                # Quiz gameplay (already exists)
      results.tsx              # Results screen (enhance existing)
  components/
    home/
      StatsCard.tsx            # Already exists - stats display card
    results/
      HighScoreBadge.tsx       # Already exists - new high score badge
      ScoreCountUp.tsx         # NEW - animated score display
    ui/
      Button.tsx               # Already exists - can reuse
      Card.tsx                 # Already exists - can reuse
  types/
    quiz-results.ts            # NEW - results data types
```

### Pattern 1: Passing Quiz Results via URL Search Params

**What:** Use Expo Router's search params to pass quiz results from quiz to results screen.

**When to use:** When passing serializable data between screens that only flows one direction.

**Example:**
```typescript
// In app/quiz/index.tsx - when quiz completes
import { useRouter } from 'expo-router';

const router = useRouter();

// When navigating to results
router.replace({
  pathname: '/quiz/results',
  params: {
    score: state.score.toString(),
    correctCount: correctAnswers.toString(),
    bestStreak: maxCombo.toString(),
    isNewHighScore: (state.score > previousHighScore).toString(),
  },
});

// In app/quiz/results.tsx - receiving results
import { useLocalSearchParams } from 'expo-router';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    score: string;
    correctCount: string;
    bestStreak: string;
    isNewHighScore: string;
  }>();

  const score = parseInt(params.score ?? '0', 10);
  const correctCount = parseInt(params.correctCount ?? '0', 10);
  const bestStreak = parseInt(params.bestStreak ?? '1', 10);
  const isNewHighScore = params.isNewHighScore === 'true';

  // Use these values to render results
}
```

### Pattern 2: Animated Score Count-Up with Reanimated

**What:** Use react-native-reanimated's withTiming/withSpring for smooth score animation.

**When to use:** Displaying final score with satisfying animation on results screen.

**Example:**
```typescript
// components/results/ScoreCountUp.tsx
import { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';

type ScoreCountUpProps = {
  targetScore: number;
  duration?: number;
};

export function ScoreCountUp({ targetScore, duration = 2000 }: ScoreCountUpProps) {
  const animatedScore = useSharedValue(0);

  useEffect(() => {
    animatedScore.value = withTiming(targetScore, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetScore]);

  // For displaying the number, use Reanimated text or derive
  const displayScore = useDerivedValue(() => {
    return Math.round(animatedScore.value);
  });

  // Option 1: Use AnimatedText if available
  // Option 2: Use react-native-reanimated's createAnimatedComponent

  return (
    <Animated.Text style={styles.score}>
      {/* This requires additional handling for number display */}
    </Animated.Text>
  );
}
```

**Simpler alternative with use-count-up:**
```typescript
// If Reanimated approach is complex, use-count-up is simpler
import { Text } from 'react-native';
import { useCountUp } from 'use-count-up';

export function ScoreCountUp({ targetScore, duration = 2 }: ScoreCountUpProps) {
  const { value } = useCountUp({
    isCounting: true,
    end: targetScore,
    duration,
    easing: 'easeOutCubic',
  });

  return <Text style={styles.score}>{value}</Text>;
}
```

### Pattern 3: Stats Display with Icons

**What:** Display streak, high score, and total quizzes with appropriate icons.

**When to use:** Home screen stats row.

**Example:**
```typescript
// Using existing StatsCard component
import { StatsCard } from '@/components/home/StatsCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

// In home screen
<View style={styles.statsRow}>
  <StatsCard
    value={streak}
    label="Streak"
    icon={<IconSymbol name="flame.fill" size={24} color={colors.timerWarning} />}
  />
  <StatsCard
    value={highScore}
    label="High Score"
    icon={<IconSymbol name="trophy.fill" size={24} color={colors.timerWarning} />}
  />
  <StatsCard
    value={totalQuizzes}
    label="Quizzes"
    icon={<IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />}
  />
</View>
```

### Pattern 4: Home Screen Layout

**What:** Clean home screen with app branding, stats, and start button.

**When to use:** Main entry point of the app.

**Example:**
```typescript
// app/(tabs)/index.tsx structure
export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // Placeholder stats (Phase 5 will load from AsyncStorage)
  const stats = { streak: 0, highScore: 0, totalQuizzes: 0 };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* App branding section */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>MedTriads</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Master medical triads
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatsCard value={stats.streak} label="Streak" icon={...} />
        <StatsCard value={stats.highScore} label="Best" icon={...} />
        <StatsCard value={stats.totalQuizzes} label="Played" icon={...} />
      </View>

      {/* Start button */}
      <View style={styles.footer}>
        <Button
          label="Start Quiz"
          onPress={() => router.push('/quiz')}
        />
      </View>
    </SafeAreaView>
  );
}
```

### Anti-Patterns to Avoid

- **Passing objects in URL params:** URL params serialize to strings. Pass primitives, not objects.
- **Forgetting to parse params:** useLocalSearchParams returns strings, parse to numbers.
- **Using router.push for results:** Use router.replace to prevent back button returning to quiz.
- **Hardcoding stats:** Even if placeholder, structure code for future persistence.
- **Missing type safety on params:** Use generics with useLocalSearchParams for type checking.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stats card layout | Custom View+Text | Existing StatsCard component | Already styled with theme support |
| High score badge | Custom styled text | Existing HighScoreBadge component | Already has star icon and styling |
| Primary button | Custom Pressable | Existing Button component | Has press animation, variants |
| Icon display | Text emoji | IconSymbol component | Native SF Symbols on iOS |
| Card container | Custom View | Existing Card component | Has elevation, press animation |

**Key insight:** Phase 1 and 2 have delivered reusable components. This phase is primarily about composing them into screens and wiring navigation.

## Common Pitfalls

### Pitfall 1: URL Params Not Updating on Navigate

**What goes wrong:** Results screen shows stale data from previous quiz.

**Why it happens:** useLocalSearchParams may not re-render if params change but route doesn't.

**How to avoid:** Use router.replace (not push) when navigating to results. This ensures a fresh screen instance:
```typescript
// Good - fresh screen
router.replace('/quiz/results?score=500');

// Risky - may show stale params if results already in stack
router.push('/quiz/results?score=500');
```

**Warning signs:** Results screen shows wrong score or previous quiz data.

### Pitfall 2: Type Coercion Errors with URL Params

**What goes wrong:** Score shows as "NaN" or "undefined".

**Why it happens:** URL params are always strings. Forgetting to parse or handle missing values.

**How to avoid:** Always provide defaults and parse explicitly:
```typescript
// Bad - no default handling
const score = parseInt(params.score); // NaN if undefined

// Good - safe parsing with defaults
const score = parseInt(params.score ?? '0', 10);
const isNewHighScore = params.isNewHighScore === 'true';
```

**Warning signs:** NaN displayed, undefined errors, or empty values.

### Pitfall 3: Stats Not Refreshing on Home Return

**What goes wrong:** Home screen shows old stats after completing a quiz.

**Why it happens:** Home screen component doesn't re-fetch stats when navigating back.

**How to avoid:** For Phase 3, stats are placeholder (0). In Phase 5, use useFocusEffect to reload:
```typescript
// Future pattern for Phase 5
import { useFocusEffect } from 'expo-router';

useFocusEffect(
  useCallback(() => {
    loadStatsFromStorage();
  }, [])
);
```

**Warning signs:** Stats don't update after quiz completion.

### Pitfall 4: Missing High Score Calculation

**What goes wrong:** New high score badge never shows, or shows incorrectly.

**Why it happens:** Comparing with undefined/null previous high score.

**How to avoid:** For Phase 3, pass isNewHighScore as param from quiz screen. Quiz screen should track previous high score (placeholder for now):
```typescript
// In quiz screen, before navigating to results
const isNewHighScore = finalScore > (previousHighScore ?? 0);
router.replace({
  pathname: '/quiz/results',
  params: { ...otherParams, isNewHighScore: isNewHighScore.toString() },
});
```

**Warning signs:** Badge always showing or never showing.

### Pitfall 5: Reanimated Text Animation Complexity

**What goes wrong:** Count-up animation doesn't display numbers, or crashes.

**Why it happens:** Reanimated's animated values don't directly render as text.

**How to avoid:** Option 1: Use a library like use-count-up for simpler implementation. Option 2: Use Reanimated's worklet-based text animation with proper setup:
```typescript
// Simplest approach - use-count-up
import { useCountUp } from 'use-count-up';
const { value } = useCountUp({ isCounting: true, end: targetScore });
return <Text>{value}</Text>;

// Alternative - manual state sync (less smooth)
const [displayValue, setDisplayValue] = useState(0);
useEffect(() => {
  const interval = setInterval(() => {
    setDisplayValue(prev => {
      if (prev >= targetScore) {
        clearInterval(interval);
        return targetScore;
      }
      return prev + Math.ceil((targetScore - prev) / 20);
    });
  }, 50);
  return () => clearInterval(interval);
}, [targetScore]);
```

**Warning signs:** Blank score display, animation jank, or console errors.

## Code Examples

Verified patterns from existing codebase and official documentation:

### Complete Home Screen Structure

```typescript
// app/(tabs)/index.tsx
import { SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { StatsCard } from '@/components/home/StatsCard';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // Placeholder stats - Phase 5 will load from AsyncStorage
  const stats = {
    streak: 0,
    highScore: 0,
    totalQuizzes: 0,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header/Branding */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>MedTriads</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Master medical triads
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatsCard
            value={stats.streak}
            label="Streak"
            icon={
              <IconSymbol
                name="flame.fill"
                size={24}
                color={colors.timerWarning}
              />
            }
          />
          <StatsCard
            value={stats.highScore}
            label="Best"
            icon={
              <IconSymbol
                name="trophy.fill"
                size={24}
                color={colors.timerWarning}
              />
            }
          />
          <StatsCard
            value={stats.totalQuizzes}
            label="Played"
            icon={
              <IconSymbol
                name="checkmark.circle.fill"
                size={24}
                color={colors.success}
              />
            }
          />
        </View>
      </View>

      {/* Footer with Start Button */}
      <View style={styles.footer}>
        <Button label="Start Quiz" onPress={() => router.push('/quiz')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    gap: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.title,
    fontSize: 40,
  },
  subtitle: {
    ...Typography.caption,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
```

### Complete Results Screen Structure

```typescript
// app/quiz/results.tsx
import { SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { HighScoreBadge } from '@/components/results/HighScoreBadge';
import { Colors, Typography, Spacing } from '@/constants/theme';

type ResultsParams = {
  score: string;
  correctCount: string;
  bestStreak: string;
  isNewHighScore: string;
};

export default function ResultsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const params = useLocalSearchParams<ResultsParams>();

  // Parse params with safe defaults
  const score = parseInt(params.score ?? '0', 10);
  const correctCount = parseInt(params.correctCount ?? '0', 10);
  const bestStreak = parseInt(params.bestStreak ?? '1', 10);
  const isNewHighScore = params.isNewHighScore === 'true';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* New High Score Badge */}
        {isNewHighScore && (
          <View style={styles.badgeContainer}>
            <HighScoreBadge />
          </View>
        )}

        {/* Score Display */}
        <View style={styles.scoreSection}>
          <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>
            Final Score
          </Text>
          <Text style={[styles.score, { color: colors.text }]}>
            {score.toLocaleString()}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {correctCount}/10
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Correct
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {bestStreak}x
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Best Streak
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          label="Play Again"
          onPress={() => router.replace('/quiz')}
        />
        <Button
          label="Home"
          variant="secondary"
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  badgeContainer: {
    marginBottom: Spacing.md,
  },
  scoreSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  score: {
    ...Typography.display,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  stat: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.heading,
  },
  statLabel: {
    ...Typography.footnote,
  },
  divider: {
    width: 1,
    height: 40,
  },
  buttons: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
});
```

### Modifying Quiz Screen to Pass Results

```typescript
// In app/quiz/index.tsx - add tracking and pass results

// Add state to track correct answers and max combo
const correctCountRef = useRef(0);
const maxComboRef = useRef(1);

// Update in handleAnswerSelect
const handleAnswerSelect = async (option: QuizOption) => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  if (option.isCorrect) {
    correctCountRef.current += 1;
    // Track max combo (combo increases on correct)
    const newCombo = state.combo + 1;
    if (newCombo > maxComboRef.current) {
      maxComboRef.current = newCombo;
    }
  }

  dispatch({
    type: 'SELECT_ANSWER',
    optionId: option.id,
    isCorrect: option.isCorrect,
  });

  // ... haptic feedback
};

// Update navigation to results
useEffect(() => {
  if (state.status === 'answered') {
    const timeout = setTimeout(() => {
      if (state.currentIndex >= state.questions.length - 1) {
        // Navigate with results
        router.replace({
          pathname: '/quiz/results',
          params: {
            score: state.score.toString(),
            correctCount: correctCountRef.current.toString(),
            bestStreak: maxComboRef.current.toString(),
            isNewHighScore: 'false', // Phase 5 will implement actual check
          },
        });
      } else {
        dispatch({ type: 'NEXT_QUESTION' });
      }
    }, ANSWER_DELAY);
    return () => clearTimeout(timeout);
  }
}, [state.status, state.currentIndex]);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Passing objects in navigation params | Serialize to URL params or use Context | expo-router standard | Cleaner URLs, better type safety |
| Redux for all shared state | URL params for navigation data, Context for app state | 2023+ | Less boilerplate |
| Class component lifecycle | useFocusEffect hook | React Navigation 5+ | Cleaner refresh on focus |
| Custom count-up animation | use-count-up or Reanimated | 2024+ | Simpler implementation |

**Deprecated/outdated:**
- Passing complex objects in navigation params (serialize instead)
- Using router.goBack() for quiz completion (use replace to clear stack)

## Open Questions

Things that couldn't be fully resolved:

1. **Score count-up animation implementation**
   - What we know: Reanimated can animate values, use-count-up provides simpler API
   - What's unclear: Best approach for animating text numbers with Reanimated
   - Recommendation: Start with use-count-up if Reanimated text animation is complex

2. **App logo/branding**
   - What we know: Assets folder has icon.png and splash-icon.png
   - What's unclear: Whether to use these or create text-only branding
   - Recommendation: Start with text "MedTriads" title, add logo if time permits

3. **Stats placeholder behavior**
   - What we know: Phase 5 handles persistence, Phase 3 can show 0s
   - What's unclear: Should high score persist within session (before Phase 5)?
   - Recommendation: For Phase 3, stats are always 0. Track high score in memory if easy.

## Sources

### Primary (HIGH confidence)
- [Expo Router URL Parameters Documentation](https://docs.expo.dev/router/reference/url-parameters/) - useLocalSearchParams, search params patterns
- [Expo Router Navigation Documentation](https://docs.expo.dev/router/basics/navigation/) - router.push, router.replace
- [Expo Symbols Documentation](https://docs.expo.dev/versions/latest/sdk/symbols/) - SF Symbols usage
- Existing codebase: StatsCard, HighScoreBadge, Button, Card components

### Secondary (MEDIUM confidence)
- [use-count-up GitHub](https://github.com/vydimitrov/use-count-up) - React Native count-up animation
- [React Navigation Params](https://reactnavigation.org/docs/params/) - Parameter passing patterns
- [SF Symbols App](https://developer.apple.com/sf-symbols/) - Available symbol names

### Tertiary (LOW confidence)
- WebSearch results on count-up animation patterns - various approaches
- Medium article on Expo Router data passing - community patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project dependencies only
- Architecture: HIGH - Patterns verified with existing codebase and Expo docs
- Pitfalls: HIGH - URL params and navigation are well-documented areas
- Count-up animation: MEDIUM - May need adjustment during implementation

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - stable tech stack)
