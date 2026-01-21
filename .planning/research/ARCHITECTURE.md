# Architecture Research: v3.0 Integration

**Domain:** Medical quiz app engagement features
**Researched:** 2026-01-21
**Confidence:** HIGH (based on existing codebase analysis + established algorithms)

## Summary

The MedTriads app has a clean, well-structured architecture that provides natural integration points for adaptive difficulty, spaced repetition, and daily challenges. The existing service layer (`question-generator.ts`, `mastery.ts`, `scoring.ts`) handles quiz logic separately from persistence (`stats-storage.ts`, `study-storage.ts`), making it straightforward to add new features without disrupting the core quiz flow.

**Key insight:** All three features share a common need - tracking per-question performance history. The existing `categoryMastery` tracking in `stats-storage.ts` provides a pattern to follow, but needs extension to track individual triad performance rather than just category aggregates.

## Data Model Changes

### Current Data Model

```typescript
// stats-storage.ts - Current StoredStats
interface StoredStats {
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  gamesPlayed: number;
  lastPlayedAt: string | null;
  highScore: number;
  dailyStreak: number;
  lastPlayedDate: string | null;
  totalPoints: number;
  pendingTierUp: { tier: number; name: string } | null;
  categoryMastery: Record<TriadCategory, CategoryMasteryData>;
  userName: string | null;
  hasCompletedOnboarding: boolean;
}
```

### New Data Entities Required

#### 1. Per-Triad Performance History (Core - All Features Need This)

```typescript
// New: triad-performance-storage.ts
interface TriadPerformance {
  triadId: string;
  category: TriadCategory;

  // Adaptive difficulty data
  attempts: number;
  correct: number;
  avgResponseTimeMs: number;
  lastAttemptDate: string;

  // Spaced repetition data (SM-2 algorithm)
  easeFactor: number;        // Default 2.5, range 1.3-2.5
  interval: number;          // Days until next review
  repetitions: number;       // Consecutive correct count
  nextReviewDate: string;    // ISO date string

  // Difficulty classification
  difficulty: 'easy' | 'medium' | 'hard' | 'unclassified';
}

interface TriadPerformanceStore {
  performances: Record<string, TriadPerformance>; // keyed by triadId
  lastUpdated: string;
}
```

#### 2. Daily Challenge State

```typescript
// New: daily-challenge-storage.ts
interface DailyChallengeState {
  // Current challenge
  challengeDate: string;           // "2026-01-21"
  challengeSeed: number;           // Deterministic randomization
  challengeType: DailyChallengeType;

  // Progress
  isCompleted: boolean;
  completedAt: string | null;
  score: number | null;

  // Streak
  dailyChallengeStreak: number;
  lastCompletedDate: string | null;
}

type DailyChallengeType =
  | 'speed-round'      // 5 questions, 8 seconds each
  | 'category-focus'   // 10 questions from one category
  | 'hard-mode'        // Only hard-classified triads
  | 'review-due'       // Triads due for spaced repetition
  | 'weakness-target'; // Lowest-accuracy category
```

#### 3. Storage Keys (AsyncStorage)

```typescript
const STORAGE_KEYS = {
  // Existing
  STATS: '@medtriad_stats',
  HISTORY: '@medtriad_quiz_history',
  SETTINGS: '@medtriad_settings',
  TRICKY: '@medtriad_tricky_questions',
  STUDY_HISTORY: '@medtriad_study_history',

  // New for v3.0
  TRIAD_PERFORMANCE: '@medtriad_triad_performance',
  DAILY_CHALLENGE: '@medtriad_daily_challenge',
};
```

### Data Migration Strategy

No breaking changes to existing data. New fields are additive:
1. `TriadPerformance` records created lazily on first answer
2. `DailyChallengeState` initialized when feature first accessed
3. Existing `categoryMastery` remains for backward compatibility

## Service Layer Changes

### Existing Services - Modifications Required

#### `question-generator.ts` - MODIFY

**Current:** Random selection with category filtering
```typescript
export function generateQuestionSet(count: number): QuizQuestion[]
export function generateQuestionSetByCategories(count: number, categories: TriadCategory[]): QuizQuestion[]
```

**New:** Add adaptive selection mode
```typescript
// Add new function, don't modify existing
export function generateAdaptiveQuestionSet(
  count: number,
  performanceData: TriadPerformanceStore,
  options: {
    targetDifficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    prioritizeWeakness?: boolean;
    includeNewTriads?: boolean; // Unclassified triads
  }
): QuizQuestion[]

export function generateSpacedRepetitionSet(
  performanceData: TriadPerformanceStore,
  maxCount: number
): QuizQuestion[]

export function generateDailyChallengeSet(
  challengeType: DailyChallengeType,
  seed: number,
  performanceData: TriadPerformanceStore
): QuizQuestion[]
```

#### `scoring.ts` - MINOR MODIFICATION

**Add:** Response time tracking for adaptive difficulty
```typescript
// Existing calculateAnswerPoints signature unchanged
// Add new utility
export function calculateResponseQuality(
  isCorrect: boolean,
  responseTimeMs: number,
  questionTimeMs: number
): number // 0-5 scale for SM-2 algorithm
```

#### `mastery.ts` - NO CHANGES

Tier system is independent of question selection. No modifications needed.

### New Services Required

#### `triad-performance.ts` (NEW)

Core service for tracking per-triad performance.

```typescript
// Storage operations
export async function loadTriadPerformance(): Promise<TriadPerformanceStore>
export async function saveTriadPerformance(store: TriadPerformanceStore): Promise<void>

// Performance tracking
export async function recordTriadAttempt(
  triadId: string,
  category: TriadCategory,
  isCorrect: boolean,
  responseTimeMs: number
): Promise<TriadPerformance>

// Adaptive difficulty
export function classifyDifficulty(performance: TriadPerformance): 'easy' | 'medium' | 'hard' | 'unclassified'
export function getTriadsByDifficulty(
  store: TriadPerformanceStore,
  difficulty: 'easy' | 'medium' | 'hard'
): string[] // triadIds

// Queries
export function getWeakestCategories(store: TriadPerformanceStore, count: number): TriadCategory[]
export function getTriadsNeedingReview(store: TriadPerformanceStore): string[]
```

#### `spaced-repetition.ts` (NEW)

SM-2 algorithm implementation.

```typescript
// Core SM-2 algorithm
export interface SM2Input {
  quality: number;      // 0-5 response quality
  repetitions: number;  // Previous consecutive correct
  easeFactor: number;   // Previous ease factor (default 2.5)
  interval: number;     // Previous interval in days
}

export interface SM2Output {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
}

export function calculateSM2(input: SM2Input): SM2Output

// Helper functions
export function isTriadDueForReview(performance: TriadPerformance): boolean
export function getDueTriadIds(store: TriadPerformanceStore): string[]
export function getReviewCount(store: TriadPerformanceStore): number
```

#### `daily-challenge.ts` (NEW)

Daily challenge generation and state management.

```typescript
// Challenge generation
export function generateDailySeed(date: Date): number
export function selectChallengeType(
  date: Date,
  performanceData: TriadPerformanceStore
): DailyChallengeType

// State management
export async function loadDailyChallengeState(): Promise<DailyChallengeState>
export async function saveDailyChallengeState(state: DailyChallengeState): Promise<void>
export async function completeDailyChallenge(score: number): Promise<DailyChallengeState>

// Queries
export function isTodaysChallengeComplete(): Promise<boolean>
export function getDailyChallengeStreak(): Promise<number>
```

## Component Integration

### Existing Components - Modifications

| Component | File | Change | Reason |
|-----------|------|--------|--------|
| `QuizScreen` | `app/quiz/index.tsx` | Add response time tracking | Adaptive difficulty needs timing data |
| `HomeScreen` | `app/(tabs)/index.tsx` | Add daily challenge entry point | Feature discovery |
| `ActionButtons` | `components/home/ActionButtons.tsx` | Add "Daily Challenge" button | Replace or augment "Challenge" |
| `HeroCard` | `components/home/HeroCard.tsx` | Show review count badge | Spaced repetition prompting |

### New Components Required

| Component | Purpose | Location |
|-----------|---------|----------|
| `DailyChallengeCard` | Shows today's challenge status/type | `components/home/` |
| `ReviewDueBadge` | "X items due for review" indicator | `components/home/` |
| `DifficultyIndicator` | Shows question difficulty during quiz | `components/quiz/` |
| `ReviewPromptBanner` | Suggests review when due items exist | `components/home/` |

### New Screens Required

| Screen | Route | Purpose |
|--------|-------|---------|
| `DailyChallengeScreen` | `app/daily-challenge/index.tsx` | Daily challenge quiz |
| `DailyChallengeResultsScreen` | `app/daily-challenge/results.tsx` | Daily challenge results |
| `ReviewScreen` | `app/review/index.tsx` | Spaced repetition review session |
| `ReviewResultsScreen` | `app/review/results.tsx` | Review session results |

### New Hooks Required

| Hook | Purpose |
|------|---------|
| `useTriadPerformance` | Load/save triad performance data |
| `useDailyChallenge` | Daily challenge state and actions |
| `useSpacedRepetition` | Due review count and review session management |
| `useAdaptiveDifficulty` | Difficulty-based question selection |

## Data Flow

### Current Quiz Flow

```
User taps "Start Quiz"
    |
    v
generateQuestionSet(10)  <-- Random selection
    |
    v
useQuizReducer manages state
    |
    v
User answers questions
    |
    v
scoring.ts calculates points
    |
    v
updateAfterQuiz() saves to AsyncStorage
    |
    v
Results screen displays score
```

### New Adaptive Quiz Flow

```
User taps "Start Quiz"
    |
    v
loadTriadPerformance()
    |
    v
generateAdaptiveQuestionSet(10, performanceData, options)
    |                                    |
    |  <-- Uses difficulty classification
    |  <-- Prioritizes weak areas
    |  <-- Includes new triads for classification
    |
    v
useQuizReducer manages state (unchanged)
    |
    v
User answers question
    |                |
    |                v
    |       recordTriadAttempt(triadId, isCorrect, responseTime)
    |                |
    |                v
    |       calculateSM2() updates review schedule
    |
    v
Results + updated difficulty classifications
```

### Spaced Repetition Flow

```
App opens / Home screen mounts
    |
    v
loadTriadPerformance()
    |
    v
getDueTriadIds() -> count of due reviews
    |
    v
Display "X items due for review" badge
    |
    v
User taps review badge
    |
    v
generateSpacedRepetitionSet(performanceData, maxCount)
    |
    v
Review session (untimed, no scoring pressure)
    |
    v
Each answer updates SM-2 scheduling
    |
    v
Review complete -> back to home
```

### Daily Challenge Flow

```
Home screen mounts
    |
    v
loadDailyChallengeState()
    |
    +--> Challenge already completed today
    |         |
    |         v
    |    Show "Completed" badge
    |
    +--> Challenge not yet done
              |
              v
         generateDailySeed(today)
              |
              v
         selectChallengeType(today, performanceData)
              |
              v
         Display challenge card with type info
              |
              v
         User taps to start
              |
              v
         generateDailyChallengeSet(type, seed, performanceData)
              |
              v
         Special quiz mode (type-specific rules)
              |
              v
         completeDailyChallenge(score)
              |
              v
         Results + streak update
```

## Suggested Build Order

### Phase 1: Per-Triad Performance Tracking (Foundation)

**Why first:** All three features depend on knowing per-triad performance history. This is the foundational data layer.

1. Create `triad-performance-storage.ts` with load/save
2. Create `useTriadPerformance` hook
3. Modify `QuizScreen` to record response time
4. Modify `updateAfterQuiz` to call `recordTriadAttempt`
5. Add difficulty classification algorithm

**Deliverable:** Invisible to user, but all quiz answers now tracked per-triad.

### Phase 2: Adaptive Difficulty

**Why second:** Builds directly on Phase 1 data. Simplest user-facing feature - modifies existing flow rather than adding new screens.

1. Create difficulty classification logic in `triad-performance.ts`
2. Add `generateAdaptiveQuestionSet` to `question-generator.ts`
3. Add settings toggle for adaptive mode
4. Modify quiz start to use adaptive selection when enabled
5. (Optional) Add difficulty indicator to quiz UI

**Deliverable:** Quizzes feel more appropriately challenging.

### Phase 3: Spaced Repetition

**Why third:** Requires new screens but builds on Phase 1/2 infrastructure.

1. Create `spaced-repetition.ts` with SM-2 algorithm
2. Integrate SM-2 into `recordTriadAttempt`
3. Add `ReviewDueBadge` to home screen
4. Create `app/review/` screens
5. Create review-specific UI (untimed, no scoring)

**Deliverable:** "Items due for review" badge and dedicated review mode.

### Phase 4: Daily Challenges

**Why last:** Most complex feature. Requires all prior infrastructure plus new game modes.

1. Create `daily-challenge.ts` service
2. Create `daily-challenge-storage.ts`
3. Add `DailyChallengeCard` to home screen
4. Create `app/daily-challenge/` screens
5. Implement challenge type variants
6. Add daily challenge streak tracking

**Deliverable:** Full daily challenge system with variety.

## Risk Areas

### High Risk: AsyncStorage Performance

**Concern:** Loading per-triad performance data on every quiz start could be slow with ~100+ triads.

**Mitigation:**
- Keep performance data in memory after first load
- Use context provider to share across screens
- Lazy-write with debouncing (batch updates every 5 seconds)
- Consider chunked storage if data grows large

### Medium Risk: SM-2 Algorithm Complexity

**Concern:** SM-2 has edge cases (quality 0-2 resets repetitions, ease factor floor of 1.3).

**Mitigation:**
- Use well-tested implementation from [cnnrhill/sm-2](https://github.com/cnnrhill/sm-2) as reference
- Write comprehensive unit tests for SM-2 function
- Default to conservative intervals on edge cases

### Medium Risk: Daily Challenge Determinism

**Concern:** Challenge must be same for all users on same day (for fairness) but also personalized.

**Mitigation:**
- Use date-based seed for challenge type and triad selection order
- Personalization only affects which triads from user's "hard" pool
- If user has no "hard" triads, fall back to random selection with same seed

### Low Risk: Data Migration

**Concern:** Existing users have no per-triad data.

**Mitigation:**
- All new data is additive
- Triads start as "unclassified" until attempted
- Graceful degradation: if no performance data, use random selection

### Low Risk: Quiz Reducer Modifications

**Concern:** `useQuizReducer` is well-tested; changes could introduce bugs.

**Mitigation:**
- Response time tracking added outside reducer (in QuizScreen)
- Reducer state unchanged
- Post-answer recording is a side effect, not state mutation

## Technical Recommendations

### 1. Use Context for Performance Data

```typescript
// New: TriadPerformanceContext.tsx
const TriadPerformanceContext = createContext<TriadPerformanceStore | null>(null);

export function TriadPerformanceProvider({ children }) {
  const [store, setStore] = useState<TriadPerformanceStore | null>(null);

  useEffect(() => {
    loadTriadPerformance().then(setStore);
  }, []);

  // Debounced save on changes
  useEffect(() => {
    if (store) {
      const timeout = setTimeout(() => saveTriadPerformance(store), 5000);
      return () => clearTimeout(timeout);
    }
  }, [store]);

  return (
    <TriadPerformanceContext.Provider value={{ store, setStore }}>
      {children}
    </TriadPerformanceContext.Provider>
  );
}
```

### 2. Response Time Tracking Pattern

```typescript
// In QuizScreen, add ref for timing
const questionStartTime = useRef<number>(Date.now());

// Reset on question change
useEffect(() => {
  if (status === 'playing') {
    questionStartTime.current = Date.now();
  }
}, [currentIndex, status]);

// Calculate on answer
const handleAnswerSelect = (option: QuizOption) => {
  const responseTimeMs = Date.now() - questionStartTime.current;
  // ... existing logic
  recordTriadAttempt(
    currentQuestion.triad.id,
    currentQuestion.triad.category,
    option.isCorrect,
    responseTimeMs
  );
};
```

### 3. SM-2 Quality Score Mapping

```typescript
// Map quiz performance to SM-2 quality (0-5)
function calculateQuality(
  isCorrect: boolean,
  responseTimeMs: number,
  questionTimeMs: number
): number {
  if (!isCorrect) {
    // Incorrect: 0-2 based on how close they were
    // For now, simple: incorrect = 1
    return 1;
  }

  // Correct: 3-5 based on speed
  const timeRatio = responseTimeMs / questionTimeMs;
  if (timeRatio < 0.3) return 5;  // Very fast
  if (timeRatio < 0.5) return 4;  // Fast
  return 3;                        // Correct but slow
}
```

## Sources

- [SM-2 Algorithm Implementation (GitHub)](https://github.com/cnnrhill/sm-2)
- [Anki SM-2 Documentation](https://faqs.ankiweb.net/what-spaced-repetition-algorithm)
- [Adaptive Quiz Difficulty Scaling (QuizCat)](https://www.quizcat.ai/blog/what-is-adaptive-quiz-difficulty-scaling)
- [Item Response Theory for Adaptive Testing](https://www.cogn-iq.org/learn/theory/item-response-theory/)
- [Codecademy Smart Practice Algorithm](https://www.codecademy.com/resources/blog/behind-the-build-smart-practice/)
- [Daily Challenge Implementation Patterns](https://starloopstudios.com/which-mobile-game-features-keep-players-coming-back/)
