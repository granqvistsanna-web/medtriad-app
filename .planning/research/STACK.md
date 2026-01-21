# Stack Research: v3.0 Engagement Features

**Project:** MedTriads
**Researched:** 2026-01-21
**Scope:** Adaptive difficulty, spaced repetition, daily challenges

## Summary

The existing MedTriads stack is **sufficient for all v3.0 engagement features**. No new dependencies are required. The three core features (adaptive difficulty, spaced repetition, daily challenges) are algorithm-driven and integrate naturally with the existing AsyncStorage persistence, React state management, and service layer patterns already in place.

Spaced repetition libraries like `ts-fsrs` exist, but for a finite 45-triad quiz app, the simpler SM-2 algorithm is sufficient and can be implemented in ~50 lines of TypeScript. Adding a library would be over-engineering for this use case. Similarly, adaptive difficulty and daily challenges are pure logic implementations that leverage existing infrastructure.

## New Dependencies Required

**None.** All three features can be implemented with the existing stack.

| Feature | Why No Library Needed |
|---------|----------------------|
| Adaptive Difficulty | Pure algorithm - uses existing scoring/mastery service patterns |
| Spaced Repetition | SM-2 algorithm is ~50 lines; 45 triads don't need FSRS sophistication |
| Daily Challenges | Date logic + existing question generator + AsyncStorage |

### Libraries Considered But Not Recommended

| Library | Version | Why Not |
|---------|---------|---------|
| `ts-fsrs` | 5.2.3 | Overkill for 45-item dataset. FSRS is designed for 10,000+ card decks with complex scheduling. SM-2 is simpler, battle-tested (used by Anki/Duolingo), and sufficient for medical triads. |
| `supermemo` | 2.0.23 | Adds dependency for what is ~50 lines of code. SM-2 algorithm is well-documented and stable - no library maintenance risk. |
| `expo-notifications` | - | Already available in Expo SDK 54 if needed for review reminders, but not required for core features. Consider for future "reminder" enhancement. |

## Existing Stack Sufficient

The current architecture supports v3.0 features directly:

### For Adaptive Difficulty

| Existing Asset | How It Enables Feature |
|---------------|----------------------|
| `services/mastery.ts` | Already has tier system (Student to Chief) with timer scaling (15s down to 8s). Extend to question selection. |
| `services/stats-storage.ts` | Already tracks `categoryMastery` per category with correct/total counts. Add per-triad tracking. |
| `services/question-generator.ts` | Already supports category filtering. Extend with difficulty weighting. |
| `hooks/useStats.ts` | Already exposes `getCategoryPercent()`. Add difficulty-aware question hooks. |

### For Spaced Repetition

| Existing Asset | How It Enables Feature |
|---------------|----------------------|
| `@react-native-async-storage/async-storage` | Already handles all persistence. Add `triadReviewData` storage key. |
| `services/stats-storage.ts` | Pattern for loading/saving typed data. Add SR card state storage. |
| Question types in `types/triad.ts` | 45 triads with IDs - perfect for SR card mapping. |

### For Daily Challenges

| Existing Asset | How It Enables Feature |
|---------------|----------------------|
| `services/stats-storage.ts` | Already has `dailyStreak`, `lastPlayedDate`, `calculateStreak()`. Extend for daily challenge completion. |
| `services/question-generator.ts` | `generateQuestionSet()` already creates random 10-question rounds. |
| Seeded randomness | Use date string as seed for deterministic daily questions. |

## Integration Points

### Adaptive Difficulty Integration

```
                    +-------------------+
                    |  services/        |
                    |  adaptive.ts      |  <-- NEW SERVICE
                    +-------------------+
                           |
         +----------------+|+----------------+
         |                 v                 |
+--------+-------+  +------+------+  +-------+-------+
| mastery.ts     |  | stats-      |  | question-     |
| (tier data)    |  | storage.ts  |  | generator.ts  |
|                |  | (per-triad  |  | (weighted     |
|                |  |  accuracy)  |  |  selection)   |
+----------------+  +-------------+  +---------------+
```

**Data needed:** Per-triad accuracy (correct/total/lastSeen) stored alongside categoryMastery.

**Algorithm approach:**
- Calculate difficulty score per triad: `difficulty = 1 - (correct / total)`
- Weight question selection toward triads with higher difficulty
- Apply tier modifier: higher tiers see more difficult triads

### Spaced Repetition Integration

```
                    +-------------------+
                    |  services/        |
                    |  spaced-rep.ts    |  <-- NEW SERVICE
                    +-------------------+
                           |
         +----------------+|+----------------+
         |                 v                 |
+--------+-------+  +------+------+  +-------+-------+
| triads.ts      |  | stats-      |  | hooks/        |
| (45 items)     |  | storage.ts  |  | useReviewDue  |
|                |  | (card state)|  | .ts           |
+----------------+  +-------------+  +---------------+
```

**Data schema per triad:**
```typescript
interface TriadSRCard {
  triadId: string;
  interval: number;      // Days until next review
  repetitions: number;   // Consecutive correct recalls
  easeFactor: number;    // 1.3 - 2.5, affects interval growth
  nextReviewDate: string; // ISO date string
  lastGrade: number;     // 0-5 (SM-2 quality rating)
}
```

**SM-2 algorithm (simplified):**
```typescript
function calculateNextReview(card: TriadSRCard, grade: number): TriadSRCard {
  // Grade 0-2: Reset (incorrect)
  // Grade 3-5: Progress (correct with varying ease)

  if (grade < 3) {
    return { ...card, repetitions: 0, interval: 1 };
  }

  const newEF = Math.max(1.3, card.easeFactor + (0.1 - (5 - grade) * 0.08));
  const newInterval = card.repetitions === 0 ? 1
                    : card.repetitions === 1 ? 6
                    : Math.round(card.interval * card.easeFactor);

  return {
    ...card,
    repetitions: card.repetitions + 1,
    interval: newInterval,
    easeFactor: newEF,
    nextReviewDate: addDays(new Date(), newInterval).toISOString(),
  };
}
```

### Daily Challenge Integration

```
                    +-------------------+
                    |  services/        |
                    |  daily-          |
                    |  challenge.ts    |  <-- NEW SERVICE
                    +-------------------+
                           |
         +----------------+|+----------------+
         |                 v                 |
+--------+-------+  +------+------+  +-------+-------+
| question-      |  | stats-      |  | hooks/        |
| generator.ts   |  | storage.ts  |  | useDaily      |
| (seeded rand)  |  | (completion)|  | Challenge.ts  |
+----------------+  +-------------+  +---------------+
```

**Data schema:**
```typescript
interface DailyChallengeState {
  date: string;           // "2026-01-21"
  completed: boolean;
  score: number | null;
  questionIds: string[];  // Seeded for the day
}
```

**Seeded randomness for consistent daily questions:**
```typescript
function getDailySeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const random = mulberry32(seed); // Simple seeded PRNG
  return [...array].sort(() => random() - 0.5);
}
```

## Not Recommended

### Over-Engineering Traps

| Approach | Why Avoid |
|----------|-----------|
| Full FSRS implementation | Designed for flashcard apps with 10,000+ cards. MedTriads has 45 triads - SM-2 is perfectly adequate. |
| Backend/cloud sync | Adds complexity without clear user value. AsyncStorage is sufficient for single-device learning. |
| Complex ML-based difficulty | K-means clustering, neural networks, etc. are overkill. Simple performance-based weighting works. |
| Real-time difficulty adjustment | Mid-quiz difficulty changes feel unfair. Adjust between quiz sessions, not during. |

### Patterns to Avoid

| Pattern | Problem | Better Approach |
|---------|---------|-----------------|
| Storing review data in RAM | Lost on app close | Persist to AsyncStorage immediately |
| Complex difficulty buckets | Hard to tune, feels arbitrary | Continuous difficulty score 0-1 |
| Global SR state | Couples Study Mode to Quiz Mode | Independent SR service with clear API |
| Streak freeze as default | Reduces engagement value | Make it a reward/purchasable item |

## Technical Approach

### Phase 1: Data Foundation

Extend `StoredStats` in `stats-storage.ts`:

```typescript
interface StoredStats {
  // ... existing fields ...

  // Per-triad tracking (for adaptive difficulty)
  triadAccuracy: Record<string, { correct: number; total: number; lastSeen: string }>;

  // Spaced repetition cards
  srCards: Record<string, TriadSRCard>;

  // Daily challenge
  dailyChallenge: DailyChallengeState | null;
  dailyChallengeStreak: number;
}
```

### Phase 2: Adaptive Difficulty Service

New file: `services/adaptive.ts`

```typescript
export function getWeightedTriads(
  allTriads: Triad[],
  accuracy: Record<string, TriadAccuracy>,
  tier: number
): Triad[] {
  // Calculate weights: prioritize low-accuracy triads
  // Apply tier modifier: harder questions for higher tiers
  // Return shuffled array with weighted probability
}

export function generateAdaptiveQuestionSet(
  count: number,
  stats: StoredStats
): QuizQuestion[] {
  // Use weighted selection instead of pure random
}
```

### Phase 3: Spaced Repetition Service

New file: `services/spaced-rep.ts`

```typescript
export function initializeSRCard(triadId: string): TriadSRCard;
export function calculateNextReview(card: TriadSRCard, grade: number): TriadSRCard;
export function getTriadsDueForReview(cards: Record<string, TriadSRCard>): string[];
export function gradeToQuality(isCorrect: boolean, responseTime: number): number;
```

### Phase 4: Daily Challenge Service

New file: `services/daily-challenge.ts`

```typescript
export function getDailyChallenge(date: Date): DailyChallengeState;
export function completeDailyChallenge(score: number): Promise<void>;
export function getDailyChallengeStreak(): number;
export function canPlayDailyChallenge(): boolean;
```

### Notifications (Optional Future Enhancement)

If review reminders are desired, `expo-notifications` is already available in SDK 54:

```typescript
import * as Notifications from 'expo-notifications';

// Schedule review reminder
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Time to review!",
    body: "You have 5 triads due for review",
  },
  trigger: { hour: 9, minute: 0, repeats: true },
});
```

Note: Requires `SCHEDULE_EXACT_ALARM` permission on Android 12+.

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| No new dependencies needed | HIGH | Reviewed existing codebase - all patterns/infrastructure present |
| SM-2 over FSRS | HIGH | Standard recommendation for small datasets; used by Anki/Duolingo |
| Data schema design | MEDIUM | Proposed structure follows existing patterns; may need iteration |
| Integration points | HIGH | Clear service boundaries match existing architecture |

## Sources

### Spaced Repetition
- [ts-fsrs on GitHub](https://github.com/open-spaced-repetition/ts-fsrs) - Most actively maintained FSRS implementation
- [supermemo npm package](https://www.npmjs.com/package/supermemo) - SM-2 implementation reference
- [SM-2 Algorithm Explained](https://tegaru.app/en/blog/sm2-algorithm-explained) - Clear SM-2 walkthrough
- [cnnrhill/sm-2 on GitHub](https://github.com/cnnrhill/sm-2) - ES6 SM-2 reference implementation

### Adaptive Difficulty
- [Adaptive Difficulty in Casual Games 2025](https://www.drozcanozturk.com/en/how-adaptive-difficulty-enhances-player-engagement-in-casual-games-2025/) - Performance-based adjustment patterns
- [Dynamic Difficulty Adjustment](https://www.wayline.io/blog/dynamic-difficulty-adjustment-personalized-gaming) - Categories of adaptive systems

### Daily Challenges & Streaks
- [Streaks and Milestones for Gamification](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps) - Best practices
- [Implementing a Daily Streak System](https://tigerabrodi.blog/implementing-a-daily-streak-system-a-practical-guide) - Practical guide
- [Duolingo's Gamification Secrets](https://www.orizon.co/blog/duolingos-gamification-secrets) - Streak effectiveness data

### Expo Notifications
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/) - SDK 54 local notifications
