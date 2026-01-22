# Phase 29: Spaced Repetition - Research

**Researched:** 2026-01-22
**Domain:** SM-2 spaced repetition algorithm for medical triads review
**Confidence:** HIGH

## Summary

Spaced repetition for MedTriads requires implementing the SM-2 algorithm to schedule triads for review at optimal intervals. The key challenge is adapting a 0-5 quality grade algorithm to work with binary correct/incorrect answers, while respecting the 14-day maximum interval constraint to prevent content exhaustion in a 45-item pool.

The existing infrastructure from Phase 27 (per-triad tracking with `lastSeenAt`, `correctCount`, `incorrectCount`) provides most of the data foundation. The main additions needed are: (1) new scheduling fields in `TriadPerformance` for SM-2 state (interval, repetition count, ease factor), (2) a `spaced-repetition.ts` service for algorithm logic and due-date calculations, and (3) Review Mode UI that reuses Study Mode's untimed pattern.

**Key findings:**
- SM-2 algorithm maps binary correct/incorrect to quality grades 4 (correct) and 1 (incorrect)
- Tricky-marked items should have a 0.5x interval multiplier for more frequent review (SR-06)
- Review Mode should mirror Study Mode UX (untimed, explanation after answer, mark as tricky)
- Content exhaustion prevention: 14-day cap on intervals means all 45 triads cycle through every 2 weeks minimum

**Primary recommendation:** Extend `TriadPerformance` type with SM-2 fields, create `spaced-repetition.ts` service for scheduling logic, and implement Review Mode by cloning Study Mode patterns with due-triad filtering.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| None required | - | SM-2 algorithm | Algorithm is ~40 lines, no library needed |
| AsyncStorage | ^1.23.1 | Data persistence | Already used for all app data |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | If needed | Date arithmetic | Only if native Date math becomes complex |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom SM-2 | `supermemo` npm package | Package adds dependency for simple algorithm; custom is more transparent |
| SM-2 | FSRS | FSRS is designed for 10,000+ cards; SM-2 is sufficient for 45 triads (per prior research) |
| Custom SM-2 | Leitner system | SM-2 has better retention research; Leitner is simpler but less optimal |

**Installation:**
```bash
# No new dependencies required
# All functionality implemented with existing stack
```

## Architecture Patterns

### Recommended Project Structure
```
medtriad/
├── services/
│   ├── spaced-repetition.ts      # NEW: SM-2 algorithm and due date logic
│   └── triad-performance-storage.ts  # EXTEND: Add SM-2 fields
├── types/
│   ├── triad-performance.ts      # EXTEND: Add SM-2 scheduling fields
│   └── review-state.ts           # NEW: Review mode state (clone of study-state)
├── hooks/
│   └── use-review-reducer.ts     # NEW: Clone of use-study-reducer
├── app/
│   └── quiz/
│       ├── review.tsx            # NEW: Review Mode screen
│       └── review-results.tsx    # NEW: Review results screen
└── components/
    └── home/
        └── ReviewDueBadge.tsx    # NEW: "12 triads due" indicator
```

### Pattern 1: SM-2 Algorithm with Binary Quality Mapping

**What:** Adapt the SM-2 algorithm's 0-5 quality scale to work with binary correct/incorrect responses

**When to use:** Every time a review answer is recorded

**How it works:**
- Correct answer maps to quality grade 4 (neutral ease factor adjustment)
- Incorrect answer maps to quality grade 1 (resets repetition, maintains ease factor)
- Quality grade 4 chosen because EF adjustment is 0 at q=4, preserving current difficulty

**Example:**
```typescript
// Source: https://super-memory.com/english/ol/sm2.htm
// Source: https://github.com/cnnrhill/sm-2

interface SM2Item {
  interval: number;      // Days until next review
  repetition: number;    // Count of successful recalls in a row
  efactor: number;       // Ease factor (min 1.3, initial 2.5)
}

interface SM2Result {
  interval: number;
  repetition: number;
  efactor: number;
  nextReviewDate: string; // ISO date string
}

/**
 * SM-2 algorithm implementation
 * Binary quality mapping: correct = 4, incorrect = 1
 */
function sm2(item: SM2Item, isCorrect: boolean): SM2Result {
  // Map binary to quality grade
  // Correct: q=4 (preserves efactor, advances interval)
  // Incorrect: q=1 (resets repetition, preserves efactor)
  const quality = isCorrect ? 4 : 1;

  let { interval, repetition, efactor } = item;

  // Calculate new ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  const newEfactor = Math.max(
    1.3,
    efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality >= 3) {
    // Correct response - advance interval
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition += 1;
  } else {
    // Incorrect response - reset to beginning
    repetition = 0;
    interval = 1;
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    repetition,
    efactor: newEfactor,
    nextReviewDate: nextReview.toISOString(),
  };
}
```

### Pattern 2: 14-Day Interval Cap (Content Exhaustion Prevention)

**What:** Cap the maximum review interval at 14 days regardless of SM-2 calculation

**When to use:** After SM-2 calculates interval, before storing

**Why:** With 45 triads, standard SM-2 would eventually schedule items months apart, leaving users with nothing to review. 14-day cap ensures all content cycles within 2 weeks. (SR-05)

**Example:**
```typescript
const MAX_REVIEW_INTERVAL_DAYS = 14;

function sm2WithCap(item: SM2Item, isCorrect: boolean): SM2Result {
  const result = sm2(item, isCorrect);

  // Apply 14-day cap (SR-05)
  if (result.interval > MAX_REVIEW_INTERVAL_DAYS) {
    result.interval = MAX_REVIEW_INTERVAL_DAYS;

    // Recalculate next review date with capped interval
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + result.interval);
    result.nextReviewDate = nextReview.toISOString();
  }

  return result;
}
```

### Pattern 3: Tricky-Marked Items Shorter Intervals (SR-06)

**What:** Apply 0.5x multiplier to intervals for tricky-marked triads

**When to use:** When calculating intervals for triads in the tricky questions list

**Why:** Users mark items as "tricky" because they struggle with them. Shorter intervals reinforce learning. (SR-06)

**Example:**
```typescript
const TRICKY_INTERVAL_MULTIPLIER = 0.5;

function calculateIntervalForTriad(
  item: SM2Item,
  isCorrect: boolean,
  isTricky: boolean
): SM2Result {
  const result = sm2WithCap(item, isCorrect);

  // SR-06: Tricky items get shorter intervals
  if (isTricky && result.interval > 1) {
    result.interval = Math.max(1, Math.round(result.interval * TRICKY_INTERVAL_MULTIPLIER));

    // Recalculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + result.interval);
    result.nextReviewDate = nextReview.toISOString();
  }

  return result;
}
```

### Pattern 4: Due Triads Query

**What:** Get all triads where `nextReviewDate <= now`

**When to use:** Home screen badge calculation (SR-01, SR-07), Review Mode entry (SR-02)

**Example:**
```typescript
/**
 * Get triads that are due for review
 * Returns triads where nextReviewDate is in the past or today
 */
async function getDueTriads(): Promise<Triad[]> {
  const performanceRecord = await loadTriadPerformance();
  const allTriads = getAllTriads();
  const now = new Date();

  const dueTriads = allTriads.filter(triad => {
    const performance = performanceRecord[triad.id];

    // Never seen = due for first review
    if (!performance || !performance.nextReviewDate) {
      return false; // OR true if you want to include never-seen triads
    }

    const nextReview = new Date(performance.nextReviewDate);
    return nextReview <= now;
  });

  return dueTriads;
}

/**
 * Get count of due triads for home screen badge (SR-07)
 */
async function getDueTriadCount(): Promise<number> {
  const dueTriads = await getDueTriads();
  return dueTriads.length;
}
```

### Pattern 5: Review Mode Screen (Clone of Study Mode)

**What:** Untimed quiz mode showing only due triads

**When to use:** User taps "Review" from home screen (SR-02)

**Key differences from Study Mode:**
- Questions sourced from due triads only (not random selection)
- Recording answer updates SM-2 scheduling fields
- If no triads due, show "All caught up!" message

**Example flow:**
```typescript
// In app/quiz/review.tsx
export default function ReviewScreen() {
  const [state, dispatch] = useReviewReducer();

  // Load due triads on mount
  useEffect(() => {
    async function loadDueTriads() {
      const dueTriads = await getDueTriads();

      if (dueTriads.length === 0) {
        // Show "all caught up" state
        dispatch({ type: 'NO_REVIEWS_DUE' });
        return;
      }

      // Generate questions from due triads
      const questions = dueTriads.map(triad => generateQuestion(triad));
      dispatch({ type: 'START_REVIEW', questions });
    }

    loadDueTriads();
  }, []);

  // Rest mirrors Study Mode: untimed, explanations, tricky marking
}
```

### Anti-Patterns to Avoid

- **Self-rating (Again/Hard/Good/Easy):** Out of scope per requirements. Binary correct/incorrect is sufficient for 45 triads.
- **Mid-quiz interval updates:** Record answers, but only persist SM-2 updates after session completes. Prevents partial-session data corruption.
- **Including never-seen triads in review:** Review Mode is for items with prior history. Use Quiz Mode for first exposure.
- **Strict "due today" logic:** Allow small buffer (e.g., due within past 24 hours) to prevent items getting stuck if user misses a day.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SM-2 implementation | Complex scheduling library | Simple ~40 line algorithm | Algorithm is well-documented, no edge cases for small datasets |
| Review Mode UI | New component library | Clone Study Mode patterns | Study Mode already has untimed flow, explanations, tricky marking |
| Due date storage | Separate scheduling table | Extend existing TriadPerformance | Keeps all triad data in one place, simpler queries |
| Tricky item lookup | Re-fetch on each check | Use Set from loadTrickyQuestions | Already have efficient lookup pattern from Phase 28 |

**Key insight:** Review Mode is essentially Study Mode with different question sourcing (due triads vs random). Reuse Study Mode's reducer, components, and UX patterns.

## Common Pitfalls

### Pitfall 1: Not Initializing SM-2 Fields for New Triads

**What goes wrong:** First review of a triad fails because `interval`, `repetition`, `efactor` are undefined

**Why it happens:** Existing `TriadPerformance` only has `correctCount`, `incorrectCount`, `lastSeenAt`, `avgResponseTimeMs`, `responseCount`

**How to avoid:** Initialize SM-2 fields to defaults when recording first review answer

**Warning signs:**
- NaN calculations in SM-2 algorithm
- `undefined * 2.5` errors
- Triads stuck at "never reviewed" despite being answered

**Prevention strategy:**
```typescript
// Default SM-2 values for new items
const DEFAULT_SM2: SM2Item = {
  interval: 0,       // Not yet scheduled
  repetition: 0,     // No successful recalls yet
  efactor: 2.5,      // Standard initial ease factor
};

// When recording answer, ensure SM-2 fields exist
const currentSM2: SM2Item = {
  interval: performance?.interval ?? DEFAULT_SM2.interval,
  repetition: performance?.repetition ?? DEFAULT_SM2.repetition,
  efactor: performance?.efactor ?? DEFAULT_SM2.efactor,
};
```

### Pitfall 2: Calculating Due Date from Wrong Reference Point

**What goes wrong:** Next review date calculated from "now" instead of scheduled review date, causing interval drift

**Why it happens:** User reviews item 2 days late; next interval should be from TODAY (when reviewed), not from when it was due

**How to avoid:** Always calculate next review from current date when answer is recorded

**Warning signs:**
- Intervals getting progressively longer than expected
- Items reviewed late seem to "skip ahead"

**Prevention strategy:**
```typescript
// CORRECT: Calculate from today (when reviewed)
const nextReview = new Date();
nextReview.setDate(nextReview.getDate() + newInterval);

// WRONG: Calculate from scheduled date
// const scheduled = new Date(item.nextReviewDate);
// scheduled.setDate(scheduled.getDate() + newInterval);
```

### Pitfall 3: Review Count vs Due Count Confusion

**What goes wrong:** Home screen shows "45 triads due" when user has only answered 5 triads ever

**Why it happens:** Including never-seen triads in due count

**How to avoid:** A triad is only "due for review" if it has been seen before AND its nextReviewDate is past

**Warning signs:**
- Due count equals total triad count
- New users see huge review numbers
- Users confused why "review" shows fresh content

**Prevention strategy:**
```typescript
// Triad must have been seen AND have a past due date
const isDue = (performance: TriadPerformance | null): boolean => {
  if (!performance) return false;                    // Never seen
  if (!performance.nextReviewDate) return false;    // No schedule yet

  const nextReview = new Date(performance.nextReviewDate);
  return nextReview <= new Date();
};
```

### Pitfall 4: Ease Factor Going Below 1.3

**What goes wrong:** After many incorrect answers, ease factor becomes very small (e.g., 0.5), causing 0-day intervals

**Why it happens:** Not enforcing SM-2's minimum ease factor of 1.3

**How to avoid:** Always clamp ease factor to minimum 1.3 after calculation

**Warning signs:**
- Intervals of 0 days
- Items appearing every single session regardless of correctness
- Ease factor values below 1.3 in storage

**Prevention strategy:**
```typescript
const newEfactor = Math.max(
  1.3, // SM-2 minimum
  efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
);
```

### Pitfall 5: Review Mode with Zero Due Triads

**What goes wrong:** User taps "Review" but app crashes or shows empty screen because no triads are due

**Why it happens:** Not handling the "nothing to review" edge case

**How to avoid:** Check due count before entering Review Mode; show friendly "all caught up" message

**Warning signs:**
- Empty question array causing index errors
- Crash when accessing `questions[0]`
- User confusion about what to do

**Prevention strategy:**
```typescript
// On home screen, disable Review button when count is 0
<ActionButton
  label="REVIEW"
  disabled={dueCount === 0}
  onPress={() => router.push('/quiz/review')}
/>

// In Review screen, handle empty state
if (dueTriads.length === 0) {
  return <AllCaughtUpScreen />;
}
```

## Code Examples

Verified patterns from research and codebase analysis:

### Extended TriadPerformance Type

```typescript
// medtriad/types/triad-performance.ts (EXTEND)

/**
 * Performance data for a single triad
 * Extended with SM-2 scheduling fields for spaced repetition
 */
export interface TriadPerformance {
  /** Number of times answered correctly */
  correctCount: number;

  /** Number of times answered incorrectly (including timeouts) */
  incorrectCount: number;

  /** ISO date string of when this triad was last answered */
  lastSeenAt: string;

  /** Average response time in milliseconds (rolling average) */
  avgResponseTimeMs: number;

  /** Number of responses used to calculate avgResponseTimeMs */
  responseCount: number;

  // === NEW SM-2 fields ===

  /** Days between reviews (SM-2 interval) */
  interval: number;

  /** Count of consecutive correct reviews (SM-2 repetition) */
  repetition: number;

  /** Ease factor for interval calculation (min 1.3, default 2.5) */
  efactor: number;

  /** ISO date string of next scheduled review date */
  nextReviewDate: string | null;
}
```

### Spaced Repetition Service

```typescript
// medtriad/services/spaced-repetition.ts (NEW)

import { loadTriadPerformance, saveTriadPerformance } from '@/services/triad-performance-storage';
import { loadTrickyQuestions } from '@/services/study-storage';
import { getAllTriads } from '@/services/triads';
import { Triad } from '@/types/triad';
import { TriadPerformance } from '@/types/triad-performance';

// Constants
const MAX_REVIEW_INTERVAL_DAYS = 14;      // SR-05
const TRICKY_INTERVAL_MULTIPLIER = 0.5;   // SR-06
const MIN_EASE_FACTOR = 1.3;              // SM-2 minimum
const DEFAULT_EASE_FACTOR = 2.5;          // SM-2 default

/**
 * SM-2 algorithm result
 */
interface SM2Result {
  interval: number;
  repetition: number;
  efactor: number;
  nextReviewDate: string;
}

/**
 * Calculate SM-2 scheduling from binary correct/incorrect
 * Source: https://super-memory.com/english/ol/sm2.htm
 *
 * Binary quality mapping:
 * - Correct: quality = 4 (neutral EF adjustment, advances interval)
 * - Incorrect: quality = 1 (resets repetition, preserves EF)
 */
export function calculateSM2(
  interval: number,
  repetition: number,
  efactor: number,
  isCorrect: boolean,
  isTricky: boolean
): SM2Result {
  // Map binary to SM-2 quality grade
  const quality = isCorrect ? 4 : 1;

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  const newEfactor = Math.max(
    MIN_EASE_FACTOR,
    efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let newInterval: number;
  let newRepetition: number;

  if (quality >= 3) {
    // Correct response - advance interval
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * efactor);
    }
    newRepetition = repetition + 1;
  } else {
    // Incorrect response - reset to beginning
    newRepetition = 0;
    newInterval = 1;
  }

  // SR-05: Apply 14-day cap
  if (newInterval > MAX_REVIEW_INTERVAL_DAYS) {
    newInterval = MAX_REVIEW_INTERVAL_DAYS;
  }

  // SR-06: Tricky items get shorter intervals
  if (isTricky && newInterval > 1) {
    newInterval = Math.max(1, Math.round(newInterval * TRICKY_INTERVAL_MULTIPLIER));
  }

  // Calculate next review date from today
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    interval: newInterval,
    repetition: newRepetition,
    efactor: newEfactor,
    nextReviewDate: nextReview.toISOString(),
  };
}

/**
 * Get all triads that are due for review (SR-02)
 * Returns triads where nextReviewDate is in the past or today
 */
export async function getDueTriads(): Promise<Triad[]> {
  const performanceRecord = await loadTriadPerformance();
  const allTriads = getAllTriads();
  const now = new Date();

  return allTriads.filter(triad => {
    const performance = performanceRecord[triad.id];

    // Never seen = not due for review (use Quiz Mode for first exposure)
    if (!performance) return false;

    // No scheduled date = not due
    if (!performance.nextReviewDate) return false;

    // Check if due date has passed
    const nextReview = new Date(performance.nextReviewDate);
    return nextReview <= now;
  });
}

/**
 * Get count of triads due for review (SR-07)
 */
export async function getDueTriadCount(): Promise<number> {
  const dueTriads = await getDueTriads();
  return dueTriads.length;
}

/**
 * Record a review answer and update SM-2 scheduling
 * Called after each answer in Review Mode
 */
export async function recordReviewAnswer(
  triadId: string,
  isCorrect: boolean
): Promise<void> {
  try {
    const record = await loadTriadPerformance();
    const trickyQuestions = await loadTrickyQuestions();
    const trickyIds = new Set(trickyQuestions.map(q => q.triadId));

    // Get existing performance or defaults
    const existing = record[triadId] ?? {
      correctCount: 0,
      incorrectCount: 0,
      lastSeenAt: '',
      avgResponseTimeMs: 0,
      responseCount: 0,
      interval: 0,
      repetition: 0,
      efactor: DEFAULT_EASE_FACTOR,
      nextReviewDate: null,
    };

    // Calculate new SM-2 values
    const sm2Result = calculateSM2(
      existing.interval,
      existing.repetition,
      existing.efactor,
      isCorrect,
      trickyIds.has(triadId)
    );

    // Update performance record
    const updated: TriadPerformance = {
      ...existing,
      correctCount: isCorrect ? existing.correctCount + 1 : existing.correctCount,
      incorrectCount: isCorrect ? existing.incorrectCount : existing.incorrectCount + 1,
      lastSeenAt: new Date().toISOString(),
      // SM-2 updates
      interval: sm2Result.interval,
      repetition: sm2Result.repetition,
      efactor: sm2Result.efactor,
      nextReviewDate: sm2Result.nextReviewDate,
      // Keep response time unchanged (Review Mode is untimed)
      avgResponseTimeMs: existing.avgResponseTimeMs,
      responseCount: existing.responseCount,
    };

    record[triadId] = updated;
    await saveTriadPerformance(record);
  } catch (error) {
    console.error('Failed to record review answer:', error);
  }
}
```

### Home Screen Review Badge

```typescript
// medtriad/components/home/ReviewDueBadge.tsx (NEW)

import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Refresh } from '@solar-icons/react-native/Bold';
import { Text, Badge, Icon } from '@/components/primitives';
import { theme, Spacing, Radius } from '@/constants/theme';

type ReviewDueBadgeProps = {
  dueCount: number;
};

export function ReviewDueBadge({ dueCount }: ReviewDueBadgeProps) {
  const router = useRouter();

  if (dueCount === 0) {
    return null; // SR-01: Only show when triads need review
  }

  return (
    <Pressable
      onPress={() => router.push('/quiz/review')}
      style={styles.container}
    >
      <View style={styles.content}>
        <Icon icon={Refresh} size="md" color={theme.colors.brand.primary} />
        <View style={styles.textContainer}>
          <Text variant="label" weight="bold" color="primary">
            {dueCount} triad{dueCount !== 1 ? 's' : ''} due
          </Text>
          <Text variant="footnote" color="secondary">
            Tap to review
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.brand.primary,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.brand.primaryDark,
    backgroundColor: theme.colors.surface.brand,
    padding: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed intervals (1/7/30 days) | SM-2 with dynamic ease factor | 1987 (SM-2 published) | Better retention with fewer reviews |
| 0-5 self-rating | Binary correct/incorrect (with quality mapping) | Modern apps (Anki alternatives) | Reduces user decision fatigue |
| Unlimited intervals | Capped intervals (14 days for small decks) | Recognition for small content pools | Prevents content exhaustion |
| Separate "hard" items tracking | Integrated tricky multiplier | Modern SRS implementations | Single system, less complexity |

**Deprecated/outdated:**
- Leitner box system - SM-2 has better retention research
- FSRS for small decks - Overkill for 45 items
- User self-rating (Again/Hard/Good/Easy) - Binary is sufficient for medical triads
- Push notifications for due items - Out of scope, start simple

## Open Questions

Things that couldn't be fully resolved:

1. **What triggers first review scheduling?**
   - What we know: Quiz Mode records answers without SM-2 scheduling
   - What's unclear: Should first Quiz Mode answer schedule a review? Or only after explicit Review Mode?
   - Recommendation: First Quiz Mode answer sets `nextReviewDate` to 1 day from now, enabling immediate entry into review cycle

2. **Should Review Mode include items seen today in Quiz Mode?**
   - What we know: SM-2 schedules next review based on interval
   - What's unclear: If user plays Quiz then Review same day, will same triads appear?
   - Recommendation: Filter out triads where `lastSeenAt` is today (same calendar day) to prevent repetition

3. **Optimal tricky multiplier value**
   - What we know: Tricky items should have shorter intervals (SR-06)
   - What's unclear: Is 0.5x the right multiplier? Could be 0.7x or 0.3x
   - Recommendation: Start with 0.5x (halving interval), tune based on user feedback

4. **Review session length**
   - What we know: Due count could be 0-45 triads
   - What's unclear: Should Review Mode show ALL due triads or cap at e.g., 20?
   - Recommendation: Show all due triads; sessions are self-paced and user can exit anytime

## Sources

### Primary (HIGH confidence)
- [SM-2 Algorithm Official Documentation](https://super-memory.com/english/ol/sm2.htm) - Original algorithm specification
- [GitHub cnnrhill/sm-2](https://github.com/cnnrhill/sm-2) - ES6 implementation with detailed explanation
- [GitHub VienDinhCom/supermemo](https://github.com/VienDinhCom/supermemo) - TypeScript API reference
- Existing MedTriads codebase:
  - `medtriad/types/triad-performance.ts` - Current type structure
  - `medtriad/services/triad-performance-storage.ts` - Storage patterns
  - `medtriad/app/quiz/study.tsx` - Untimed mode patterns to reuse
  - `medtriad/hooks/use-study-reducer.ts` - Reducer patterns to clone

### Secondary (MEDIUM confidence)
- [SM-2 Algorithm Explained (Tegaru)](https://tegaru.app/en/blog/sm2-algorithm-explained) - Quality mapping explanation
- [Anki SM-2 Documentation (RemNote)](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm) - Modern adaptations
- `.planning/research/SUMMARY.md` - Prior research establishing SM-2 over FSRS decision

### Tertiary (LOW confidence)
- [A Better Spaced Repetition Algorithm SM2+](https://www.blueraja.com/blog/477/a-better-spaced-repetition-learning-algorithm-sm2) - Alternative approach (not adopted)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, algorithm is well-documented
- Architecture: HIGH - Extends existing patterns, clones Study Mode
- Pitfalls: HIGH - Common edge cases documented in SM-2 literature
- Binary quality mapping: MEDIUM - Standard approach, but MedTriads-specific tuning may be needed

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable algorithm domain)
