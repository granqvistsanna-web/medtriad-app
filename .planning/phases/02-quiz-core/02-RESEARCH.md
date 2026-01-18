# Phase 2: Quiz Core - Research

**Researched:** 2026-01-18
**Domain:** Quiz state management, countdown timer, navigation, haptic feedback
**Confidence:** HIGH

## Summary

This phase implements the core quiz gameplay: displaying questions with findings, presenting answer options, managing the countdown timer, tracking progress, and navigating through a 10-question round. The research covers five main areas: (1) quiz state management using `useReducer` as a lightweight state machine, (2) countdown timer implementation with proper cleanup, (3) expo-router navigation patterns for quiz flow, (4) haptic feedback for answer interactions, and (5) integrating existing Phase 1 components.

Phase 1 has already delivered the essential building blocks: `QuizQuestion` types, `generateQuestionSet()` service, and presentation components (`FindingsCard`, `AnswerCard`, `TimerRing`, `ScoreDisplay`, `ProgressIndicator`). The remaining work is wiring these together with quiz state logic and navigation.

The approach uses React's built-in `useReducer` hook rather than an external state management library. For a single-screen quiz with 10 questions, `useReducer` provides the right abstraction for modeling quiz state transitions without adding dependencies. The project already has `react-native-reanimated` for animations and `expo-haptics` for feedback.

**Primary recommendation:** Build a `useQuizReducer` custom hook that manages quiz state transitions (idle -> playing -> answered -> next -> completed), integrate it with a quiz screen that uses existing components, and add a modal-based quiz flow that prevents back-navigation during gameplay.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React useReducer | Built-in | Quiz state management | State machine pattern for transitions, no added dependency |
| expo-router | ~6.0.21 | Quiz screen navigation | Already in project, file-based routing |
| expo-haptics | ~15.0.8 | Touch feedback on answers | Already in project |
| react-native-reanimated | ~4.1.1 | Timer animation | Already in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-svg | 15.12.1 | Timer ring display | Already in project, used by TimerRing component |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useReducer | Zustand | Zustand adds simplicity for complex global state, but quiz is single-screen local state - useReducer is sufficient |
| useReducer | XState | XState provides formal state machines but adds ~30KB for 4-state quiz flow |
| Custom timer | react-native-countdown-circle-timer | Library already exists, but TimerRing component was built in Phase 1 |

**Installation:**
```bash
# No additional packages needed - all capabilities are built-in or already installed
```

## Architecture Patterns

### Recommended Project Structure

```
medtriad/
  app/
    _layout.tsx                 # Root stack with quiz modal route
    (tabs)/
      _layout.tsx              # Tab navigator
      index.tsx                # Home/start screen
    quiz/
      _layout.tsx              # Quiz stack (prevents back navigation)
      index.tsx                # Quiz gameplay screen
      results.tsx              # Results screen (placeholder for Phase 2)
  hooks/
    use-quiz-reducer.ts        # Quiz state machine hook
    use-countdown-timer.ts     # Timer hook with cleanup
  types/
    quiz-state.ts              # Quiz state types
```

### Pattern 1: useReducer as State Machine

**What:** Model quiz state as explicit states with transitions, not scattered useState calls.

**When to use:** When component has multiple related states with defined transitions.

**Example:**
```typescript
// types/quiz-state.ts
export type QuizStatus = 'idle' | 'playing' | 'answered' | 'completed';

export interface QuizState {
  status: QuizStatus;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  combo: number;
  timeRemaining: number;
  selectedOptionId: string | null;
}

export type QuizAction =
  | { type: 'START_QUIZ'; questions: QuizQuestion[] }
  | { type: 'SELECT_ANSWER'; optionId: string; isCorrect: boolean }
  | { type: 'TICK_TIMER' }
  | { type: 'TIME_EXPIRED' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET' };

// hooks/use-quiz-reducer.ts
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...initialState,
        status: 'playing',
        questions: action.questions,
      };
    case 'SELECT_ANSWER':
      if (state.status !== 'playing') return state;
      return {
        ...state,
        status: 'answered',
        selectedOptionId: action.optionId,
        score: action.isCorrect ? state.score + (100 * state.combo) : state.score,
        combo: action.isCorrect ? state.combo + 1 : 1,
      };
    case 'NEXT_QUESTION':
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, status: 'completed' };
      }
      return {
        ...state,
        status: 'playing',
        currentIndex: nextIndex,
        timeRemaining: QUESTION_TIME,
        selectedOptionId: null,
      };
    case 'TICK_TIMER':
      if (state.status !== 'playing') return state;
      const newTime = state.timeRemaining - 1;
      if (newTime <= 0) {
        return { ...state, status: 'answered', timeRemaining: 0, combo: 1 };
      }
      return { ...state, timeRemaining: newTime };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useQuizReducer() {
  return useReducer(quizReducer, initialState);
}
```

### Pattern 2: Timer Hook with Proper Cleanup

**What:** Encapsulate setInterval logic with useRef for ID storage and useEffect for cleanup.

**When to use:** Any component that needs a countdown timer.

**Example:**
```typescript
// hooks/use-countdown-timer.ts
import { useEffect, useRef, useCallback } from 'react';

export function useCountdownTimer(
  isRunning: boolean,
  onTick: () => void,
  onComplete?: () => void,
  timeRemaining?: number
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        onTick();
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [isRunning, onTick, clearTimer]);

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining !== undefined && timeRemaining <= 0 && onComplete) {
      onComplete();
    }
  }, [timeRemaining, onComplete]);
}
```

### Pattern 3: Quiz Modal Navigation

**What:** Use expo-router's modal presentation to create a quiz flow that discourages accidental back navigation.

**When to use:** Full-screen flows that should not be interrupted (quizzes, forms, onboarding).

**Example:**
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="quiz"
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
          gestureEnabled: false, // Prevent swipe to dismiss
        }}
      />
    </Stack>
  );
}

// app/quiz/_layout.tsx
import { Stack } from 'expo-router';

export default function QuizLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
```

### Pattern 4: Haptic Feedback on Answer Selection

**What:** Use expo-haptics to provide tactile feedback when user selects an answer.

**When to use:** Interactive elements that benefit from physical feedback (buttons, selections).

**Example:**
```typescript
import * as Haptics from 'expo-haptics';

const handleAnswerSelect = async (option: QuizOption) => {
  // Trigger haptic immediately
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  // Then update state
  dispatch({ type: 'SELECT_ANSWER', optionId: option.id, isCorrect: option.isCorrect });

  // Additional feedback after reveal
  if (option.isCorrect) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};
```

### Anti-Patterns to Avoid

- **Multiple useState for related quiz state:** Use useReducer to keep quiz state coherent
- **setInterval without cleanup:** Always clear in useEffect return function
- **Checking isCorrect in component logic:** Put scoring logic in reducer, not component
- **Using router.back() during quiz:** Disable gestures and control navigation explicitly
- **Calling haptics after async state update:** Trigger haptics immediately for responsive feel

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Quiz state management | Multiple useState | useReducer with state machine | Prevents impossible states, centralizes logic |
| Timer display | Custom SVG animation | Existing TimerRing component | Already built in Phase 1 |
| Answer cards | Custom Pressable styles | Existing AnswerCard component | Already has states, animations |
| Findings display | Custom layout | Existing FindingsCard component | Already has numbered layout |
| Navigation stack reset | Custom history management | expo-router with modal + replace | Built-in patterns work |

**Key insight:** Phase 1 delivered most presentation components. Phase 2 is primarily about connecting them with state logic and navigation, not building new UI.

## Common Pitfalls

### Pitfall 1: Timer Drift on Inactive Tabs

**What goes wrong:** Timer runs fast or slow when user switches apps/tabs.

**Why it happens:** Browser/mobile OS throttles setInterval for background tabs.

**How to avoid:** For a 12-second quiz timer, simple setInterval is acceptable. Timer drift over 12 seconds is negligible. If needed later, use timestamp comparison instead of fixed decrement.

**Warning signs:** Timer shows incorrect time after app comes back to foreground.

### Pitfall 2: State Updates After Unmount

**What goes wrong:** "Can't perform a React state update on an unmounted component" warning.

**Why it happens:** Timer callback fires after quiz screen navigates away.

**How to avoid:** Clear interval in useEffect cleanup. Check component mount status if using async callbacks.
```typescript
useEffect(() => {
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, []);
```

**Warning signs:** Console warnings about state updates on unmounted components.

### Pitfall 3: Stale Closure in Timer Callback

**What goes wrong:** Timer uses old state values, increments wrong.

**Why it happens:** Closure captures initial state, not current state.

**How to avoid:** Use useCallback with proper dependencies, or use dispatch (stable reference):
```typescript
// Bad - closure captures old state
setInterval(() => {
  setTime(time - 1); // 'time' is stale
}, 1000);

// Good - functional update
setInterval(() => {
  setTime(prev => prev - 1);
}, 1000);

// Best - dispatch is stable
setInterval(() => {
  dispatch({ type: 'TICK_TIMER' });
}, 1000);
```

**Warning signs:** Timer decrements once then stops, or decrements erratically.

### Pitfall 4: Double Navigation Calls

**What goes wrong:** Tapping quickly navigates to results twice, or pushes duplicate screens.

**Why it happens:** No debounce on navigation, rapid taps call router.push() multiple times.

**How to avoid:** Use state to track if navigation is pending, or use `router.replace()` for final navigation:
```typescript
const [isNavigating, setIsNavigating] = useState(false);

const goToResults = () => {
  if (isNavigating) return;
  setIsNavigating(true);
  router.replace('/quiz/results');
};
```

**Warning signs:** Results screen appears multiple times in stack, or strange back behavior.

### Pitfall 5: Forgetting to Reset Quiz State

**What goes wrong:** Starting a new quiz shows old questions/score.

**Why it happens:** Quiz state persists across navigation.

**How to avoid:** Reset state when component mounts or when starting new quiz:
```typescript
useEffect(() => {
  const questions = generateQuestionSet(10);
  dispatch({ type: 'START_QUIZ', questions });

  return () => {
    dispatch({ type: 'RESET' });
  };
}, []);
```

**Warning signs:** Previous quiz data appearing in new quiz round.

## Code Examples

Verified patterns from official sources and existing codebase:

### Complete Quiz Screen Structure

```typescript
// app/quiz/index.tsx
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

import { FindingsCard } from '@/components/quiz/FindingsCard';
import { AnswerCard } from '@/components/quiz/AnswerCard';
import { TimerRing } from '@/components/quiz/TimerRing';
import { ScoreDisplay } from '@/components/quiz/ScoreDisplay';
import { ProgressIndicator } from '@/components/quiz/ProgressIndicator';
import { useQuizReducer } from '@/hooks/use-quiz-reducer';
import { useCountdownTimer } from '@/hooks/use-countdown-timer';
import { generateQuestionSet } from '@/services/question-generator';
import { QuizOption } from '@/types';
import { Spacing } from '@/constants/theme';

const QUESTION_COUNT = 10;
const QUESTION_TIME = 12;
const ANSWER_DELAY = 1500; // ms before advancing to next question

export default function QuizScreen() {
  const router = useRouter();
  const [state, dispatch] = useQuizReducer();

  // Initialize quiz on mount
  useEffect(() => {
    const questions = generateQuestionSet(QUESTION_COUNT);
    dispatch({ type: 'START_QUIZ', questions });
  }, []);

  // Timer logic
  const handleTick = useCallback(() => {
    dispatch({ type: 'TICK_TIMER' });
  }, []);

  useCountdownTimer(
    state.status === 'playing',
    handleTick,
    undefined,
    state.timeRemaining
  );

  // Auto-advance after answer
  useEffect(() => {
    if (state.status === 'answered') {
      const timeout = setTimeout(() => {
        if (state.currentIndex >= state.questions.length - 1) {
          router.replace('/quiz/results');
        } else {
          dispatch({ type: 'NEXT_QUESTION' });
        }
      }, ANSWER_DELAY);
      return () => clearTimeout(timeout);
    }
  }, [state.status, state.currentIndex]);

  const handleAnswerSelect = async (option: QuizOption) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({
      type: 'SELECT_ANSWER',
      optionId: option.id,
      isCorrect: option.isCorrect
    });

    if (option.isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const currentQuestion = state.questions[state.currentIndex];
  if (!currentQuestion) return null;

  const getAnswerState = (option: QuizOption) => {
    if (state.status !== 'answered') return 'default';
    if (option.id === state.selectedOptionId) {
      return option.isCorrect ? 'correct' : 'incorrect';
    }
    if (option.isCorrect) return 'revealed';
    return 'default';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressIndicator
          current={state.currentIndex + 1}
          total={QUESTION_COUNT}
        />
        <TimerRing
          seconds={state.timeRemaining}
          totalSeconds={QUESTION_TIME}
        />
        <ScoreDisplay
          score={state.score}
          combo={state.combo}
        />
      </View>

      <View style={styles.content}>
        <FindingsCard findings={currentQuestion.triad.findings} />

        <View style={styles.answers}>
          {currentQuestion.options.map((option) => (
            <AnswerCard
              key={option.id}
              condition={option.condition}
              onPress={() => handleAnswerSelect(option)}
              state={getAnswerState(option)}
              disabled={state.status === 'answered'}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  answers: {
    gap: Spacing.md,
  },
});
```

### Starting Quiz from Home Screen

```typescript
// Usage in home screen
import { Link } from 'expo-router';
import { Button } from '@/components/ui/Button';

<Link href="/quiz" asChild>
  <Button title="Start Quiz" />
</Link>

// Or imperatively
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/quiz');
```

### Timer Hook Implementation

```typescript
// hooks/use-countdown-timer.ts
import { useEffect, useRef, useCallback } from 'react';

export function useCountdownTimer(
  isRunning: boolean,
  onTick: () => void
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(onTick, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onTick]);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for all state | useReducer for local, Zustand for global | 2023+ | Less boilerplate for simple state |
| Class components with setState | Hooks with useReducer | React 16.8 / 2019 | Simpler state machine patterns |
| expo-router v3 navigate() | v4 navigate() = push() | March 2025 | Use push() or replace() explicitly |
| Multiple useState | Single useReducer | Best practice | Prevents impossible states |

**Deprecated/outdated:**
- `router.reset()` does not exist in expo-router - use underlying React Navigation CommonActions if needed
- expo/router repository archived March 2025, now part of main expo/expo repository

## Open Questions

Things that couldn't be fully resolved:

1. **Exact auto-advance timing after answer**
   - What we know: Need delay to show correct/incorrect before advancing
   - What's unclear: Optimal delay (1000ms, 1500ms, 2000ms?)
   - Recommendation: Start with 1500ms, adjust based on testing

2. **Score persistence between quiz rounds**
   - What we know: Phase 2 scope says "values can be static for now"
   - What's unclear: Whether to implement high score tracking in Phase 2
   - Recommendation: Track score in state, persist to AsyncStorage in later phase

3. **Timer behavior when answered quickly**
   - What we know: Timer should stop when answer selected
   - What's unclear: Should remaining time factor into score?
   - Recommendation: For MVP, just stop timer; bonus points for speed in later phase

## Sources

### Primary (HIGH confidence)
- [Expo Router Modals Documentation](https://docs.expo.dev/router/advanced/modals/) - Modal navigation patterns
- [Expo Router Navigation Documentation](https://docs.expo.dev/router/basics/navigation/) - Navigation methods and parameters
- [Expo Haptics Documentation](https://docs.expo.dev/versions/latest/sdk/haptics/) - Haptic feedback API
- [React useReducer Documentation](https://react.dev/reference/react/useReducer) - State machine pattern
- [React Native Timers Documentation](https://reactnative.dev/docs/timers) - setInterval usage

### Secondary (MEDIUM confidence)
- [Expo Router Navigation Layouts](https://docs.expo.dev/router/basics/layout/) - Stack and Tab layouts
- [Zustand GitHub](https://github.com/pmndrs/zustand) - Alternative state management (not needed for MVP)
- [State Machine with useReducer](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/) - Pattern documentation

### Tertiary (LOW confidence)
- [React State Management 2025](https://www.developerway.com/posts/react-state-management-2025) - Ecosystem overview
- [expo-router reset discussion](https://github.com/expo/router/discussions/495) - Stack reset workarounds

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using built-in React hooks and existing project dependencies
- Architecture: HIGH - Patterns verified with official Expo and React documentation
- Pitfalls: HIGH - Well-documented React and timer issues with clear solutions

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - stable tech stack, expo-router may have updates)
