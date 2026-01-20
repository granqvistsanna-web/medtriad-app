# Phase 23: Study Mode - Research

**Researched:** 2026-01-20
**Domain:** React Native quiz flow, AsyncStorage persistence, visual theming
**Confidence:** HIGH

## Summary

Study Mode is a relaxed, untimed quiz variant that emphasizes learning over gamification. The implementation leverages existing quiz infrastructure (question generator, answer cards, findings card) while removing time pressure and adding educational features like immediate explanations and a "mark as tricky" flagging system.

The current codebase provides a solid foundation: the quiz flow already has a reducer-based state machine, reusable components (FindingsCard, AnswerCard), and AsyncStorage patterns for persistence. Study Mode can reuse ~80% of this infrastructure with modifications for untimed flow and explanation display.

**Primary recommendation:** Create a new `/quiz/study` route that shares components with timed quiz but uses a modified reducer without timer logic, adds explanation display after answer selection, and stores tricky questions in a new AsyncStorage key.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | ~6.0.21 | File-based routing | Already handles quiz flow, add `/quiz/study` route |
| @react-native-async-storage/async-storage | ^2.2.0 | Local persistence | Already used for stats, history, settings |
| react-native-reanimated | ~4.1.1 | Animations | Already used for card transitions |
| @shopify/flash-list | 2.0.2 | Virtualized lists | Already used in Library, use for tricky questions list |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @solar-icons/react-native | ^1.0.1 | Icons | Bookmark/flag icon for "mark as tricky" |
| expo-haptics | ~15.0.8 | Haptic feedback | Light tap on mark as tricky |

### No Additional Dependencies Needed
Study Mode can be implemented entirely with existing project dependencies. No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
medtriad/
├── app/
│   └── quiz/
│       ├── index.tsx          # Existing timed quiz
│       ├── study.tsx          # NEW: Study mode quiz screen
│       └── results.tsx        # Existing results (reuse for study summary)
├── components/
│   └── quiz/
│       ├── AnswerCard.tsx     # Reuse with explanation support
│       ├── FindingsCard.tsx   # Reuse unchanged
│       ├── ExplanationCard.tsx # NEW: Shows explanation after answer
│       ├── TrickyButton.tsx   # NEW: "Mark as tricky" toggle button
│       └── StudyProgress.tsx  # NEW: Simple progress indicator
├── hooks/
│   └── use-study-reducer.ts   # NEW: Study mode state (no timer)
├── services/
│   └── study-storage.ts       # NEW: Tricky questions persistence
└── types/
    └── study-state.ts         # NEW: Study mode types
```

### Pattern 1: Modified State Machine (No Timer)
**What:** Fork the quiz reducer to remove timer logic
**When to use:** Study Mode needs the same question flow without time pressure
**Example:**
```typescript
// types/study-state.ts
export type StudyStatus = 'idle' | 'playing' | 'answered' | 'completed';

export interface StudyState {
  status: StudyStatus;
  questions: QuizQuestion[];
  currentIndex: number;
  correctCount: number;
  selectedOptionId: string | null;
  showExplanation: boolean;
  trickyQuestionIds: Set<string>; // In-session tracking
}

export type StudyAction =
  | { type: 'START_STUDY'; questions: QuizQuestion[] }
  | { type: 'SELECT_ANSWER'; optionId: string; isCorrect: boolean }
  | { type: 'TOGGLE_TRICKY'; triadId: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET' };
```

### Pattern 2: Explanation Display After Answer
**What:** Show explanation card below answer options after selection
**When to use:** Immediate feedback is core to study mode
**Example:**
```typescript
// Trigger explanation visibility in reducer
case 'SELECT_ANSWER': {
  return {
    ...state,
    status: 'answered',
    selectedOptionId: action.optionId,
    showExplanation: true,
    correctCount: action.isCorrect
      ? state.correctCount + 1
      : state.correctCount,
  };
}
```

### Pattern 3: Tricky Questions Storage
**What:** Persist flagged questions in AsyncStorage with timestamp
**When to use:** User wants to review difficult questions later
**Example:**
```typescript
// services/study-storage.ts
const TRICKY_KEY = '@medtriad_tricky_questions';

export interface TrickyQuestion {
  triadId: string;
  markedAt: string; // ISO date
  category: TriadCategory;
}

export async function loadTrickyQuestions(): Promise<TrickyQuestion[]> {
  const json = await AsyncStorage.getItem(TRICKY_KEY);
  return json ? JSON.parse(json) : [];
}

export async function toggleTrickyQuestion(
  triadId: string,
  category: TriadCategory
): Promise<boolean> {
  const current = await loadTrickyQuestions();
  const exists = current.some(q => q.triadId === triadId);

  if (exists) {
    const updated = current.filter(q => q.triadId !== triadId);
    await AsyncStorage.setItem(TRICKY_KEY, JSON.stringify(updated));
    return false; // Removed
  } else {
    const updated = [...current, {
      triadId,
      markedAt: new Date().toISOString(),
      category
    }];
    await AsyncStorage.setItem(TRICKY_KEY, JSON.stringify(updated));
    return true; // Added
  }
}
```

### Pattern 4: Calm Visual Tone
**What:** Use muted colors and remove urgency indicators
**When to use:** Distinguishing study mode from timed quiz visually
**Example:**
```typescript
// Use existing semantic tokens for calm appearance
const studyColors = {
  // Use blue (calm, trustworthy) instead of brand wine
  accent: theme.colors.blue.main,        // #5BA9A2 - muted teal
  accentLight: theme.colors.blue.light,  // #E8F4F3
  accentDark: theme.colors.blue.dark,    // #4A908A

  // Keep surfaces neutral
  surface: theme.colors.surface.primary,
  card: theme.colors.surface.card,
};
```

### Anti-Patterns to Avoid
- **Duplicating entire quiz screen:** Instead, extract shared components and create focused Study screen
- **Adding timer then disabling it:** Create dedicated study reducer without timer logic at all
- **Inline AsyncStorage calls:** Use service functions for consistent error handling
- **Storing full triad objects:** Store only triadId references, lookup triads when displaying

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Progress indicator | Custom stepper | Simple `X of Y` Text like existing quiz header | Consistency, already proven pattern |
| Tricky list display | Custom list | FlashList (already in project) | Performance for 50+ items |
| Answer animations | New animation system | Existing AnswerCard states + reanimated | Consistency with timed mode |
| Explanation styling | New card component | Card primitive with custom content | Design system compliance |
| Route navigation | Custom navigation | expo-router with typed params | Already handles quiz flow patterns |

**Key insight:** Study Mode shares 80% of timed quiz infrastructure. The difference is behavioral (no timer, show explanations) not structural.

## Common Pitfalls

### Pitfall 1: Timer Logic Contamination
**What goes wrong:** Copy-pasting quiz reducer and trying to "disable" timer
**Why it happens:** Seems faster than creating new reducer
**How to avoid:** Create dedicated `use-study-reducer.ts` without any timer references
**Warning signs:** `TICK_TIMER` action in study reducer, `timeRemaining` in study state

### Pitfall 2: Explanation Data Source
**What goes wrong:** Triads don't have explanation field, leading to empty explanations
**Why it happens:** Assuming all data is available
**How to avoid:** For MVP, use condition name + findings as "explanation" (educational reference). Add real explanations in future phase.
**Warning signs:** `undefined` explanation fields, blank explanation cards

### Pitfall 3: Tricky Questions Race Conditions
**What goes wrong:** Rapid toggle creates inconsistent state
**Why it happens:** AsyncStorage is async, multiple toggles interleave
**How to avoid:** Use optimistic UI with local state, sync to storage debounced
**Warning signs:** Toggle state doesn't match stored state, visual flicker

### Pitfall 4: Entry Point Confusion
**What goes wrong:** Users can't find Study Mode or it's unclear how it differs
**Why it happens:** Poor visual hierarchy or unclear labeling
**How to avoid:**
  - Repurpose existing "STUDY" ActionButton on Home (currently goes to Library)
  - Use distinct icon (Book for Study) vs (Bolt for Challenge)
  - Add calm blue accent to distinguish from wine-colored timed quiz
**Warning signs:** User testing shows confusion, analytics show low Study Mode engagement

### Pitfall 5: Session Summary State Loss
**What goes wrong:** Navigating away before summary loses session data
**Why it happens:** State only in memory, not persisted
**How to avoid:** Save study session results to AsyncStorage before navigation
**Warning signs:** Summary screen shows wrong data, empty results after back navigation

## Code Examples

Verified patterns from official sources and existing codebase:

### Study Mode Entry Point (Home Screen Modification)
```typescript
// app/(tabs)/index.tsx - ActionButtons update
<ActionButtons
  onStudy={() => router.push('/quiz/study')}  // Changed from '/library'
  onChallenge={() => router.push('/quiz')}
  delay={Durations.stagger * 2.5}
/>
```

### Study Mode Screen Structure
```typescript
// app/quiz/study.tsx
export default function StudyScreen() {
  const [state, dispatch] = useStudyReducer();
  const router = useRouter();

  // No timer hook - key difference from timed quiz

  const handleAnswerSelect = (option: QuizOption) => {
    triggerHaptic();
    dispatch({
      type: 'SELECT_ANSWER',
      optionId: option.id,
      isCorrect: option.isCorrect,
    });
    // Explanation shown automatically via state.showExplanation
  };

  const handleContinue = () => {
    if (currentIndex >= questions.length - 1) {
      // Save session and navigate to summary
      router.replace('/quiz/study-results');
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header without timer - just progress */}
      <StudyHeader
        currentIndex={currentIndex}
        total={questions.length}
      />

      {/* Same findings card */}
      <FindingsCard findings={currentQuestion.triad.findings} />

      {/* Answer cards */}
      {currentQuestion.options.map((option) => (
        <AnswerCard
          key={option.id}
          condition={option.condition}
          state={getAnswerState(option)}
          onPress={() => handleAnswerSelect(option)}
          disabled={status === 'answered'}
        />
      ))}

      {/* Explanation - shown after answer */}
      {status === 'answered' && (
        <ExplanationCard triad={currentQuestion.triad} />
      )}

      {/* Tricky button + Continue */}
      {status === 'answered' && (
        <View style={styles.footer}>
          <TrickyButton
            isMarked={trickyIds.has(currentQuestion.triad.id)}
            onToggle={() => dispatch({
              type: 'TOGGLE_TRICKY',
              triadId: currentQuestion.triad.id
            })}
          />
          <Button label="Continue" onPress={handleContinue} />
        </View>
      )}
    </View>
  );
}
```

### Explanation Card Component
```typescript
// components/quiz/ExplanationCard.tsx
import { Card, Text } from '@/components/primitives';
import { theme, Spacing } from '@/constants/theme';
import { Triad } from '@/types';

type ExplanationCardProps = {
  triad: Triad;
};

export function ExplanationCard({ triad }: ExplanationCardProps) {
  return (
    <Card style={styles.card}>
      <Text variant="tiny" color={theme.colors.blue.text} style={styles.label}>
        {triad.category.toUpperCase()}
      </Text>
      <Text variant="heading" color="primary" weight="semibold">
        {triad.condition}
      </Text>
      <Text variant="body" color="secondary">
        Classic triad: {triad.findings.join(', ')}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.blue.light,
    borderColor: theme.colors.blue.main,
    borderBottomColor: theme.colors.blue.dark,
  },
  label: {
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
});
```

### Tricky Button Component
```typescript
// components/quiz/TrickyButton.tsx
import { Pressable, StyleSheet } from 'react-native';
import { Bookmark, BookmarkSquare } from '@solar-icons/react-native/Bold';
import { Text, Icon } from '@/components/primitives';
import { theme, Spacing, Radius } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

type TrickyButtonProps = {
  isMarked: boolean;
  onToggle: () => void;
};

export function TrickyButton({ isMarked, onToggle }: TrickyButtonProps) {
  const { triggerHaptic } = useHaptics();

  const handlePress = () => {
    triggerHaptic();
    onToggle();
  };

  return (
    <Pressable onPress={handlePress} style={styles.button}>
      <Icon
        icon={isMarked ? BookmarkSquare : Bookmark}
        size="sm"
        color={isMarked ? theme.colors.warning.main : theme.colors.text.secondary}
      />
      <Text
        variant="footnote"
        color={isMarked ? theme.colors.warning.text : 'secondary'}
        weight="medium"
      >
        {isMarked ? 'Marked as tricky' : 'Mark as tricky'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
});
```

### Tricky Questions List (Library/Progress Integration)
```typescript
// New section in progress.tsx or library.tsx
import { loadTrickyQuestions, TrickyQuestion } from '@/services/study-storage';
import { getAllTriads } from '@/services/triads';

function TrickyQuestionsSection() {
  const [tricky, setTriky] = useState<TrickyQuestion[]>([]);

  useEffect(() => {
    loadTrickyQuestions().then(setTriky);
  }, []);

  const triads = getAllTriads();
  const trickyTriads = tricky
    .map(t => triads.find(triad => triad.id === t.triadId))
    .filter(Boolean);

  if (trickyTriads.length === 0) return null;

  return (
    <View>
      <Text variant="heading">Tricky Questions</Text>
      <FlashList
        data={trickyTriads}
        renderItem={({ item }) => <TriadCard triad={item} />}
        estimatedItemSize={140}
      />
    </View>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Timer-based quizzes only | Study + Timed modes | This phase | Supports different learning styles |
| No question flagging | Tricky questions list | This phase | Enables spaced repetition potential |
| Explanations after quiz | Immediate explanation | This phase | Better learning feedback loop |

**Deprecated/outdated:**
- None for this phase - all approaches are net new features

## Open Questions

Things that couldn't be fully resolved:

1. **Explanation Content Source**
   - What we know: Triads have condition, findings, category - no explanation field
   - What's unclear: Should explanations be added to triads.json or generated at runtime?
   - Recommendation: For MVP, use formatted condition + findings as explanation. Plan future phase to add real explanations.

2. **Study Mode Question Count**
   - What we know: Timed mode uses 10 questions (QUESTION_COUNT)
   - What's unclear: Should Study Mode use same count, allow user selection, or be unlimited?
   - Recommendation: Start with same 10-question sessions for consistency. Consider category-specific sessions later.

3. **Tricky Questions Limit**
   - What we know: Quiz history is limited to 50 entries
   - What's unclear: Should tricky questions have a limit? FIFO or manual management?
   - Recommendation: No limit initially (triads dataset is ~45 items). Add management UI if needed.

4. **Per-Topic Session Summary**
   - What we know: Requirement SM-07 mentions "per-topic session summary stored locally"
   - What's unclear: What defines a "topic"? Category? Individual session?
   - Recommendation: Store session summary with category breakdown. Accessible from Progress screen.

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `app/quiz/index.tsx`, `hooks/use-quiz-reducer.ts`, `services/stats-storage.ts`
- Design system tokens: `constants/theme.ts`, `constants/tokens/colors.ts`
- Component primitives: `components/primitives/Button.tsx`, `components/primitives/Card.tsx`

### Secondary (MEDIUM confidence)
- AsyncStorage patterns from existing `stats-storage.ts` and `settings-storage.ts`
- FlashList usage from `app/(tabs)/library.tsx`

### Tertiary (LOW confidence)
- None - all recommendations based on existing codebase patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project
- Architecture: HIGH - Based on existing quiz flow patterns
- Pitfalls: HIGH - Derived from codebase analysis
- Explanation content: MEDIUM - Requires data decision

**Research date:** 2026-01-20
**Valid until:** No expiration - based on stable project architecture
