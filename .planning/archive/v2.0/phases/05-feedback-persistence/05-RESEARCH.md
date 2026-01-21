# Phase 5: Feedback & Persistence - Research

**Researched:** 2026-01-18
**Domain:** Visual feedback, haptics, data persistence
**Confidence:** HIGH

## Summary

This phase builds on substantial existing infrastructure. Visual answer feedback is largely implemented in `AnswerCard.tsx` with state-based styling (correct/incorrect/revealed). Haptic feedback is already integrated in `quiz/index.tsx` using `expo-haptics`. The persistence layer exists in `stats-storage.ts` with AsyncStorage patterns.

The main work involves: (1) refining visual feedback to match user decisions (fading non-selected answers, thicker borders), (2) adjusting haptic patterns to use consistent Light feedback per user preference, and (3) extending the storage layer to support daily streak calculation and high score checking.

**Primary recommendation:** Leverage existing implementations and extend rather than rebuild. Focus on streak logic (date comparison) and wiring up the `isNewHighScore` check on results screen.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-haptics | ~15.0.8 | Haptic feedback | Already installed, Expo-maintained |
| @react-native-async-storage/async-storage | ^2.2.0 | Key-value persistence | Already installed, community standard |
| react-native-reanimated | ~4.1.1 | Animated color/opacity transitions | Already used throughout app |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | N/A | Date manipulation for streaks | Optional - can use native Date API for simple cases |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AsyncStorage | expo-secure-store | More secure, but overkill for non-sensitive stats |
| date-fns | Native Date | date-fns is cleaner for date math, but adds dependency |

**Installation:**
```bash
# All libraries already installed - no additional packages needed
```

## Architecture Patterns

### Existing File Structure (Leverage This)
```
medtriad/
├── components/quiz/
│   └── AnswerCard.tsx          # Has correct/incorrect/revealed states
├── services/
│   ├── stats-storage.ts        # Has loadStats/saveStats/updateAfterQuiz
│   └── mastery.ts              # Has level calculation
├── hooks/
│   ├── useStats.ts             # Has recordQuizResult
│   └── use-quiz-reducer.ts     # Has SELECT_ANSWER action
└── app/quiz/
    ├── index.tsx               # Has handleAnswerSelect with haptics
    └── results.tsx             # Has isNewHighScore param (hardcoded)
```

### Pattern 1: State-Driven Visual Feedback (Already Implemented)
**What:** AnswerCard receives `state` prop that drives styling
**When to use:** Always - this pattern is already in place
**Example:**
```typescript
// Source: medtriad/components/quiz/AnswerCard.tsx (existing)
type AnswerState = 'default' | 'correct' | 'incorrect' | 'revealed';

const getBackgroundColor = () => {
  switch (state) {
    case 'correct': return colors.successBg;
    case 'incorrect': return colors.errorBg;
    case 'revealed': return colors.successBg;
    default: return colors.backgroundCard;
  }
};
```

### Pattern 2: Haptic Feedback Mapping
**What:** Map game events to haptic types
**When to use:** On answer selection, combo milestones
**Example:**
```typescript
// Source: expo-haptics docs
import * as Haptics from 'expo-haptics';

// Per user decision: Light haptic for all answer feedback
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// For combo tier increase (subtle pulse)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Timeout: No haptic (user decision)
```

### Pattern 3: AsyncStorage with JSON Serialization
**What:** Store stats as JSON object under single key
**When to use:** Already implemented in stats-storage.ts
**Example:**
```typescript
// Source: medtriad/services/stats-storage.ts (existing)
const STATS_KEY = '@medtriad_stats';

export async function saveStats(stats: StoredStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}
```

### Anti-Patterns to Avoid
- **Multiple AsyncStorage calls for related data:** Batch into single object, use one key
- **Blocking haptics on async operation:** Haptics are fire-and-forget, don't await unless needed
- **Complex date libraries for simple comparisons:** Native Date works for "same day" checks

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animated color transitions | Custom interpolation | `withTiming` from Reanimated | Handles color space correctly |
| Date comparison for streaks | Manual day math | `toDateString()` comparison | Handles timezone via local date |
| Stats persistence | Multiple storage keys | Single JSON object | Already implemented pattern |
| Loading states | Custom booleans | Existing `useStats().loading` | Hook already provides this |

**Key insight:** The existing codebase has most patterns established. Extend rather than rebuild.

## Common Pitfalls

### Pitfall 1: Haptic Feedback Differences iOS vs Android
**What goes wrong:** Android haptics feel stronger than iOS
**Why it happens:** Different hardware, different feedback engines
**How to avoid:** Use consistent Light style (per user decision) which feels appropriate on both platforms
**Warning signs:** User complaints about intensity differences

### Pitfall 2: Streak Reset at Midnight Timezone Issues
**What goes wrong:** Streak resets at wrong time (server midnight vs user midnight)
**Why it happens:** Storing/comparing UTC dates instead of local dates
**How to avoid:** Use `new Date().toDateString()` which produces local date string like "Sat Jan 18 2026"
**Warning signs:** Streak resets mid-day for some users

### Pitfall 3: AsyncStorage Silent Failures
**What goes wrong:** Data not persisting, no error visible to user
**Why it happens:** try/catch swallows errors with just console.error
**How to avoid:** Existing pattern is fine for non-critical stats; add error state to hook if needed
**Warning signs:** Stats reset unexpectedly

### Pitfall 4: Animation Color Interpolation Artifacts
**What goes wrong:** Weird intermediate colors during animation
**Why it happens:** RGB interpolation through unnatural paths
**How to avoid:** Use `withTiming` which handles color interpolation properly; test with actual colors
**Warning signs:** Flash of unexpected color during transition

### Pitfall 5: Stale Closure in Timer Callbacks
**What goes wrong:** Haptics fire with wrong state
**Why it happens:** Callback references stale state
**How to avoid:** Use refs for values needed in callbacks (existing pattern in quiz/index.tsx)
**Warning signs:** Incorrect feedback on answer

## Code Examples

Verified patterns from official sources and existing codebase:

### Visual Feedback - Fading Non-Selected Answers
```typescript
// Extend existing AnswerCard to dim non-selected during feedback
// Add new state: 'faded' for non-selected, non-correct answers
type AnswerState = 'default' | 'correct' | 'incorrect' | 'revealed' | 'faded';

// In quiz/index.tsx getAnswerState:
const getAnswerState = (option: QuizOption): AnswerState => {
  if (status !== 'answered') return 'default';

  if (option.id === selectedOptionId) {
    return option.isCorrect ? 'correct' : 'incorrect';
  }
  if (option.isCorrect) {
    return 'revealed';
  }
  return 'faded'; // Non-selected, non-correct answers fade
};

// In AnswerCard styles:
opacity: state === 'faded' ? 0.4 : 1,
```

### Border Thickness for Feedback States
```typescript
// Source: User decision - thicker borders for feedback
const getBorderWidth = () => {
  switch (state) {
    case 'correct':
    case 'incorrect':
    case 'revealed':
      return 3; // Thicker for feedback visibility
    default:
      return 2; // Standard
  }
};
```

### Haptic Feedback Pattern (Per User Decision)
```typescript
// Source: expo-haptics docs + user decisions
import * as Haptics from 'expo-haptics';

const handleAnswerSelect = async (option: QuizOption) => {
  // Light haptic for all answer selections (consistent, not punishing)
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  dispatch({ type: 'SELECT_ANSWER', ... });

  // No additional haptic on result - keep it understated
};

// Timeout: No haptic (user decision)
// Combo tier increase: Light pulse
const onComboIncrease = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
```

### Daily Streak Logic
```typescript
// Simple date comparison using local date strings
export interface StoredStats {
  // ... existing fields
  dailyStreak: number;
  lastPlayedDate: string | null; // Store as toDateString() format
}

export function calculateStreak(
  currentStreak: number,
  lastPlayedDate: string | null
): { newStreak: number; isNewDay: boolean } {
  const today = new Date().toDateString(); // "Sat Jan 18 2026"

  if (lastPlayedDate === null) {
    // First time playing
    return { newStreak: 1, isNewDay: true };
  }

  if (lastPlayedDate === today) {
    // Already played today
    return { newStreak: currentStreak, isNewDay: false };
  }

  // Check if yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();

  if (lastPlayedDate === yesterdayString) {
    // Consecutive day - increment streak
    return { newStreak: currentStreak + 1, isNewDay: true };
  }

  // Streak broken - reset to 1
  return { newStreak: 1, isNewDay: true };
}
```

### High Score Check
```typescript
// Add to updateAfterQuiz or create separate function
export async function checkAndUpdateHighScore(
  newScore: number
): Promise<{ isNewHighScore: boolean; previousHigh: number }> {
  const stats = await loadStats();
  const previousHigh = stats.highScore ?? 0;

  if (newScore > previousHigh) {
    await saveStats({ ...stats, highScore: newScore });
    return { isNewHighScore: true, previousHigh };
  }

  return { isNewHighScore: false, previousHigh };
}
```

### Timeout Handling (Gentle Reveal)
```typescript
// Source: User decision - timeout shows correct answer gently
// In quiz/index.tsx timeout effect:
useEffect(() => {
  if (status === 'playing' && timeRemaining === 0) {
    setFeedbackText("Time's up!");
    // NO haptic for timeout (user decision)
    dispatch({
      type: 'SELECT_ANSWER',
      optionId: '', // Empty - no answer selected
      isCorrect: false,
      timeRemaining: 0,
    });
  }
}, [status, timeRemaining, dispatch]);

// In getAnswerState, when selectedOptionId is '':
// The correct answer still gets 'revealed' state (green border)
// No answer gets 'incorrect' state (no red shown)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multiple haptic types per action | Consistent Light style | User decision | Simpler, less punishing feel |
| notificationAsync for results | impactAsync Light only | User decision | More subtle feedback |
| Complex date math with UTC | Local toDateString() comparison | Best practice | Simpler, timezone-aware |

**Deprecated/outdated:**
- Using `notificationAsync(Error)` for wrong answers - per user decision, use Light impact consistently
- Using `notificationAsync(Success)` for correct answers - same, use Light impact

## Integration Points

### Where Feedback Hooks into Quiz Reducer
- `SELECT_ANSWER` action already transitions to `answered` status
- Status change triggers visual feedback via `getAnswerState()` function
- Haptics fire in `handleAnswerSelect` before dispatch (existing pattern)

### Where Persistence Connects to Home Screen
- `useStats()` hook already loads stats on mount
- Home screen already displays `stats.bestStreak`, `stats.totalAnswered`
- Need to add: `stats.dailyStreak`, `stats.highScore`

### Results Screen High Score Check
- Currently passes `isNewHighScore: 'false'` hardcoded
- Need to: Check high score before navigation, pass actual value
- Location: `quiz/index.tsx` auto-advance effect

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal border thickness for feedback**
   - What we know: 2px current, need "thicker" per decision
   - What's unclear: Exact pixel value (3px? 4px?)
   - Recommendation: Start with 3px, adjust visually

2. **Exact opacity for faded answers**
   - What we know: Should "fade/dim" per decision
   - What's unclear: Exact opacity value
   - Recommendation: Start with 0.4 (matches existing disabled state), adjust visually

3. **Combo tier increase detection**
   - What we know: Need Light pulse on tier increase
   - What's unclear: How to detect tier change (1->2, 2->3)
   - Recommendation: Compare combo before/after in handleAnswerSelect

## Sources

### Primary (HIGH confidence)
- expo-haptics docs - API methods, ImpactFeedbackStyle values, platform notes
- medtriad/services/stats-storage.ts - Existing AsyncStorage patterns
- medtriad/components/quiz/AnswerCard.tsx - Existing state-based styling

### Secondary (MEDIUM confidence)
- [Expo Haptics Docs](https://docs.expo.dev/versions/latest/sdk/haptics/) - Official API reference
- [Reanimated withTiming](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming) - Color animation support
- [LogRocket AsyncStorage Guide](https://blog.logrocket.com/guide-react-natives-asyncstorage/) - Best practices

### Tertiary (LOW confidence)
- [Daily Streak Implementation Guide](https://tigerabrodi.blog/implementing-a-daily-streak-system-a-practical-guide) - Streak logic patterns (referenced but not fully verified)

## Metadata

**Confidence breakdown:**
- Visual feedback: HIGH - Existing code demonstrates pattern, just needs extension
- Haptics: HIGH - expo-haptics docs verified, already integrated
- Persistence: HIGH - AsyncStorage already working, just needs streak/highscore fields
- Streak logic: MEDIUM - Pattern clear but edge cases need testing

**Research date:** 2026-01-18
**Valid until:** 30 days (stable domain, existing implementations)
