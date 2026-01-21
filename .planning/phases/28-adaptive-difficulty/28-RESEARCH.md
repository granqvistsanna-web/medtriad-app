# Phase 28: Adaptive Difficulty - Research

**Researched:** 2026-01-21
**Domain:** Weighted random selection and adaptive quiz difficulty
**Confidence:** HIGH

## Summary

Adaptive difficulty in quiz applications is a well-established pattern that adjusts question selection based on user performance history. The standard approach combines weighted random selection algorithms with performance-based difficulty classification.

**Key findings:**
- Current quiz selection in `question-generator.ts` uses simple random shuffle - needs replacement with weighted selection
- Phase 27 provides complete performance tracking foundation (correctCount, incorrectCount, avgResponseTimeMs per triad)
- Tricky questions stored separately in `study-storage.ts` with `@medtriad_tricky_questions` key
- Tier system already exists with 6 tiers (Student to Chief) that control timer difficulty
- 10 medical categories exist in the dataset (cardiology, neurology, etc.)
- Cumulative weight method is the standard algorithm for efficient weighted random selection
- Accuracy-based difficulty classification (easy: >85%, medium: 51-84%, hard: <50%) is industry standard

**Primary recommendation:** Implement adaptive selection as a new function in `question-generator.ts` that wraps existing `generateQuestion()` with weighted triad selection based on category weakness, tricky marks, and difficulty classification.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| None required | - | Weighted selection | Algorithm is ~20 lines, no library needed for this use case |
| AsyncStorage | ^1.23.1 | Data access | Already used throughout app for persistence |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Chance.js | Latest | Weighted random | ONLY if complex probability scenarios emerge - overkill for this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom implementation | Chance.js library | Custom is simpler for single use case; library adds 5KB+ for one feature |
| Cumulative weights | Alias method (Walker's method) | Alias method is O(1) selection vs O(n) but requires O(n) setup - not worth it for 10-question quiz sets |

**Installation:**
```bash
# No new dependencies required
# All functionality implemented with existing stack
```

## Architecture Patterns

### Recommended Project Structure
```
medtriad/services/
├── question-generator.ts    # Add adaptiveQuestionSelection() here
├── triads.ts                # Existing - no changes needed
├── triad-performance-storage.ts  # Existing - data source
└── study-storage.ts         # Existing - tricky questions data source
```

### Pattern 1: Weighted Random Selection (Cumulative Weights Method)

**What:** Algorithm that selects items with probability proportional to their weights

**When to use:** Selecting questions where some triads should appear more frequently than others

**How it works:**
1. Calculate cumulative weights: `[3, 7, 1]` becomes `[3, 10, 11]`
2. Generate random number between 0 and total weight (11)
3. Find first cumulative weight >= random number using linear search

**Example:**
```typescript
// Source: https://trekhleb.medium.com/weighted-random-in-javascript-4748ab3a1500
function weightedRandom<T>(items: T[], weights: number[]): T {
  // Calculate cumulative weights
  const cumulativeWeights: number[] = [];
  weights.reduce((sum, weight, i) => {
    const cumulative = sum + weight;
    cumulativeWeights[i] = cumulative;
    return cumulative;
  }, 0);

  // Get random number between 0 and total weight
  const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];

  // Find first cumulative weight >= random
  const index = cumulativeWeights.findIndex(w => w >= random);
  return items[index];
}
```

**Complexity:** O(n) for selection, O(n) for setup - acceptable for small datasets (< 100 items per selection)

### Pattern 2: Performance-Based Difficulty Classification

**What:** Classify each triad as easy/medium/hard based on user's historical accuracy

**When to use:** After user has 3+ attempts on a triad (minimum statistical significance)

**Classification thresholds (industry standard):**
```typescript
// Source: https://www.washington.edu/assessment/scanning-scoring/scoring/reports/item-analysis/
function classifyDifficulty(correctCount: number, incorrectCount: number): 'easy' | 'medium' | 'hard' | 'new' {
  const totalAttempts = correctCount + incorrectCount;

  // Minimum 3 attempts required (ADPT-05)
  if (totalAttempts < 3) return 'new';

  const accuracy = correctCount / totalAttempts;

  if (accuracy >= 0.85) return 'easy';
  if (accuracy >= 0.51) return 'medium';
  return 'hard';
}
```

**Why these thresholds:** Educational testing research (ScorePak) defines 85%+ as easy, 51-84% as moderate, ≤50% as hard

### Pattern 3: Multi-Factor Weight Calculation

**What:** Combine multiple signals (category weakness, tricky marks, difficulty, tier) into a single weight

**When to use:** When adaptive selection needs to balance multiple priorities

**Example:**
```typescript
function calculateTriadWeight(
  triad: Triad,
  performance: TriadPerformance | null,
  trickyQuestionIds: Set<string>,
  weakCategories: Set<TriadCategory>,
  userTier: number
): number {
  let weight = 1.0; // Base weight

  // ADPT-01: Prioritize weak categories (2x weight)
  if (weakCategories.has(triad.category)) {
    weight *= 2.0;
  }

  // ADPT-02: Prioritize tricky-marked questions (3x weight)
  if (trickyQuestionIds.has(triad.id)) {
    weight *= 3.0;
  }

  // ADPT-04: Tier-based difficulty filtering
  if (performance && performance.correctCount + performance.incorrectCount >= 3) {
    const difficulty = classifyDifficulty(performance.correctCount, performance.incorrectCount);

    // Higher tiers see more hard questions
    if (userTier >= 5 && difficulty === 'hard') {
      weight *= 1.5;
    } else if (userTier >= 3 && difficulty === 'medium') {
      weight *= 1.2;
    } else if (userTier <= 2 && difficulty === 'easy') {
      weight *= 1.2;
    }
  }

  return weight;
}
```

### Pattern 4: Category Weakness Detection

**What:** Identify categories where user has below-average accuracy

**When to use:** Before generating quiz to prioritize weak areas (ADPT-01)

**Example:**
```typescript
// Use existing categoryMastery from stats-storage.ts
function getWeakCategories(
  categoryMastery: Record<TriadCategory, CategoryMasteryData>
): Set<TriadCategory> {
  const weakCategories = new Set<TriadCategory>();

  // Calculate overall accuracy
  let totalCorrect = 0;
  let totalAttempts = 0;
  Object.values(categoryMastery).forEach(({ correct, total }) => {
    totalCorrect += correct;
    totalAttempts += total;
  });

  if (totalAttempts === 0) return weakCategories; // No data yet

  const overallAccuracy = totalCorrect / totalAttempts;

  // Mark categories below overall accuracy as weak
  Object.entries(categoryMastery).forEach(([category, { correct, total }]) => {
    if (total === 0) return; // Skip categories with no data

    const categoryAccuracy = correct / total;
    if (categoryAccuracy < overallAccuracy) {
      weakCategories.add(category as TriadCategory);
    }
  });

  return weakCategories;
}
```

### Anti-Patterns to Avoid

- **Mid-quiz difficulty adjustment:** Don't change difficulty during a quiz session - feels unfair and confusing (explicitly out of scope per requirements)
- **Visible manipulation:** Don't expose adaptive selection to users - research shows players game the system if aware (source: Andrew Rollings & Ernest Adams)
- **Over-weighting tricky questions:** 3x multiplier is maximum - higher values create repetitive experience
- **Premature classification:** Never classify difficulty with < 3 attempts - insufficient data leads to wrong classifications

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Weighted random library | Custom npm package | Inline cumulative weights algorithm | Algorithm is ~15 lines; library adds dependency overhead for single use case |
| Performance data storage | New storage service | Existing `triad-performance-storage.ts` | Phase 27 already provides all needed data (correctCount, incorrectCount, avgResponseTimeMs) |
| Category tracking | New category stats | Existing `categoryMastery` in `stats-storage.ts` | Already tracks correct/total per category since Phase 24 |
| Tricky question tracking | New storage key | Existing `study-storage.ts` functions | `loadTrickyQuestions()` already returns array of TrickyQuestion objects |

**Key insight:** Phase 27 and earlier phases built 90% of the foundation - this phase is primarily about selection logic, not new data infrastructure

## Common Pitfalls

### Pitfall 1: Forgetting to Handle New Users

**What goes wrong:** New users have no performance data, causing weighted selection to fail or produce all-zero weights

**Why it happens:** Empty performance record means all triads have null performance, no category mastery data exists

**How to avoid:** Fallback to uniform random selection when no performance data exists

**Warning signs:**
- `loadTriadPerformance()` returns empty object `{}`
- All category mastery entries have `total: 0`
- Weighted selection returns undefined or always picks same triad

**Prevention strategy:**
```typescript
const performanceRecord = await loadTriadPerformance();
const hasPerformanceData = Object.keys(performanceRecord).length > 0;

if (!hasPerformanceData) {
  // Fall back to random selection for new users
  return generateQuestionSet(count); // Existing function
}

// Proceed with weighted selection
```

### Pitfall 2: Division by Zero in Difficulty Classification

**What goes wrong:** Calculating `correctCount / totalAttempts` when both are 0 produces NaN, breaking difficulty classification

**Why it happens:** Checking individual triad performance before verifying any attempts exist

**How to avoid:** Always check `totalAttempts > 0` before calculating accuracy percentage

**Warning signs:**
- Difficulty classification returns `NaN`
- TypeScript shows "possibly undefined" errors on accuracy calculation
- Questions classified as "new" when they should have difficulty levels

**Prevention strategy:**
```typescript
function classifyDifficulty(correctCount: number, incorrectCount: number): 'easy' | 'medium' | 'hard' | 'new' {
  const totalAttempts = correctCount + incorrectCount;

  // Guard clause - MUST come first
  if (totalAttempts < 3) return 'new';

  // Now safe to divide
  const accuracy = correctCount / totalAttempts;
  // ... rest of classification
}
```

### Pitfall 3: All-Zero Weights Edge Case

**What goes wrong:** All triads get weight 0, making cumulative weights array `[0, 0, 0, ...]`, causing random selection to fail

**Why it happens:** Overly aggressive filtering (e.g., requiring ALL conditions to be true instead of ANY)

**How to avoid:** Ensure base weight is always > 0, use multiplication not replacement for weight adjustments

**Warning signs:**
- Cumulative weights array is all zeros
- `Math.random() * totalWeight` produces 0
- `findIndex(w => w >= random)` returns -1

**Prevention strategy:**
```typescript
function calculateTriadWeight(...): number {
  let weight = 1.0; // Base weight NEVER 0

  // Multiply to adjust, don't replace
  if (condition1) weight *= 2.0;
  if (condition2) weight *= 3.0;

  return weight; // Minimum possible value is 1.0
}
```

### Pitfall 4: Duplicate Questions in Quiz Set

**What goes wrong:** Weighted selection picks the same triad multiple times in a 10-question quiz

**Why it happens:** Not tracking already-selected triads when calling weighted selection in a loop

**How to avoid:** Remove selected triads from the pool before next selection, or use "sample without replacement" pattern

**Warning signs:**
- User sees identical question multiple times in same quiz
- `questions` array has duplicate triad IDs
- Test fails: `new Set(questions.map(q => q.triad.id)).size !== questions.length`

**Prevention strategy:**
```typescript
function generateAdaptiveQuestionSet(count: number, ...): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const usedTriadIds = new Set<string>();
  const availableTriads = getAllTriads();

  while (questions.length < count && questions.length < availableTriads.length) {
    // Filter out already-used triads
    const remainingTriads = availableTriads.filter(t => !usedTriadIds.has(t.id));

    // Select from remaining pool
    const selected = weightedRandomTriad(remainingTriads, ...);

    usedTriadIds.add(selected.id);
    questions.push(generateQuestion(selected));
  }

  return questions;
}
```

### Pitfall 5: Not Preserving Existing Random Selection UX

**What goes wrong:** Adaptive selection changes quiz feel too dramatically, making patterns too obvious to users

**Why it happens:** Using weights that are too extreme (e.g., 100x for tricky questions)

**How to avoid:** Keep weight multipliers modest (2-3x range), test that quiz still feels varied

**Warning signs:**
- Users notice they see same categories repeatedly
- Quiz feels "too easy" or "too hard" without gradual progression
- User reports: "Why do I keep getting cardiology questions?"

**Prevention strategy:**
- Weight multipliers: 2x for weak categories, 3x for tricky marks, 1.2-1.5x for tier difficulty
- Test with real data: Generate 10 quizzes and verify category distribution isn't too skewed
- Maintain randomness: Even highly-weighted items shouldn't appear every time

## Code Examples

Verified patterns from research and codebase analysis:

### Adaptive Question Set Generation

```typescript
// New function to add to medtriad/services/question-generator.ts
import { loadTriadPerformance } from '@/services/triad-performance-storage';
import { loadTrickyQuestions } from '@/services/study-storage';
import { loadStats } from '@/services/stats-storage';
import { getTierForPoints } from '@/services/mastery';

/**
 * Generate adaptive quiz question set based on user performance
 * Falls back to random selection for new users with no performance data
 */
export async function generateAdaptiveQuestionSet(count: number): Promise<QuizQuestion[]> {
  // Load user data
  const stats = await loadStats();
  const performanceRecord = await loadTriadPerformance();
  const trickyQuestions = await loadTrickyQuestions();

  // Check if user has performance data
  const hasPerformanceData = Object.keys(performanceRecord).length > 0;

  // New users: fall back to random selection
  if (!hasPerformanceData) {
    return generateQuestionSet(count); // Existing random selection
  }

  // Build lookup sets for efficient checking
  const trickyQuestionIds = new Set(trickyQuestions.map(q => q.triadId));
  const weakCategories = getWeakCategories(stats.categoryMastery);
  const userTier = getTierForPoints(stats.totalPoints).tier;

  // Get all triads and calculate weights
  const allTriads = getAllTriads();
  const triadWeights = allTriads.map(triad =>
    calculateTriadWeight(
      triad,
      performanceRecord[triad.id] ?? null,
      trickyQuestionIds,
      weakCategories,
      userTier
    )
  );

  // Select triads without replacement
  const questions: QuizQuestion[] = [];
  const usedIndices = new Set<number>();

  while (questions.length < count && usedIndices.size < allTriads.length) {
    // Filter to remaining triads
    const remainingTriads: Triad[] = [];
    const remainingWeights: number[] = [];

    allTriads.forEach((triad, index) => {
      if (!usedIndices.has(index)) {
        remainingTriads.push(triad);
        remainingWeights.push(triadWeights[index]);
      }
    });

    // Weighted random selection
    const selected = weightedRandom(remainingTriads, remainingWeights);
    const selectedIndex = allTriads.findIndex(t => t.id === selected.id);

    usedIndices.add(selectedIndex);
    questions.push(generateQuestion(selected));
  }

  return questions;
}

/**
 * Weighted random selection using cumulative weights method
 * Source: https://trekhleb.medium.com/weighted-random-in-javascript-4748ab3a1500
 */
function weightedRandom<T>(items: T[], weights: number[]): T {
  // Calculate cumulative weights
  const cumulativeWeights: number[] = [];
  weights.reduce((sum, weight, i) => {
    const cumulative = sum + weight;
    cumulativeWeights[i] = cumulative;
    return cumulative;
  }, 0);

  // Get random number between 0 and total weight
  const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];

  // Find first cumulative weight >= random
  const index = cumulativeWeights.findIndex(w => w >= random);
  return items[index];
}

/**
 * Calculate weight for a triad based on multiple factors
 * ADPT-01: Weak categories get 2x weight
 * ADPT-02: Tricky questions get 3x weight
 * ADPT-04: Tier-based difficulty weighting
 */
function calculateTriadWeight(
  triad: Triad,
  performance: TriadPerformance | null,
  trickyQuestionIds: Set<string>,
  weakCategories: Set<TriadCategory>,
  userTier: number
): number {
  let weight = 1.0; // Base weight

  // ADPT-01: Prioritize weak categories
  if (weakCategories.has(triad.category)) {
    weight *= 2.0;
  }

  // ADPT-02: Prioritize tricky-marked questions
  if (trickyQuestionIds.has(triad.id)) {
    weight *= 3.0;
  }

  // ADPT-04: Tier-based difficulty adjustment
  if (performance) {
    const totalAttempts = performance.correctCount + performance.incorrectCount;

    // ADPT-05: Only classify with 3+ attempts
    if (totalAttempts >= 3) {
      const difficulty = classifyDifficulty(performance.correctCount, performance.incorrectCount);

      // Higher tiers see more hard questions
      if (userTier >= 5 && difficulty === 'hard') {
        weight *= 1.5;
      } else if (userTier >= 3 && difficulty === 'medium') {
        weight *= 1.2;
      } else if (userTier <= 2 && difficulty === 'easy') {
        weight *= 1.2;
      }
    }
  }

  return weight;
}

/**
 * Classify triad difficulty based on user's historical performance
 * ADPT-03: easy/medium/hard classification
 * ADPT-05: Requires minimum 3 attempts
 * Source: https://www.washington.edu/assessment/scanning-scoring/scoring/reports/item-analysis/
 */
function classifyDifficulty(
  correctCount: number,
  incorrectCount: number
): 'easy' | 'medium' | 'hard' | 'new' {
  const totalAttempts = correctCount + incorrectCount;

  // ADPT-05: Minimum 3 attempts required
  if (totalAttempts < 3) return 'new';

  const accuracy = correctCount / totalAttempts;

  // Standard thresholds from educational testing research
  if (accuracy >= 0.85) return 'easy';  // 85%+ accuracy
  if (accuracy >= 0.51) return 'medium'; // 51-84% accuracy
  return 'hard'; // ≤50% accuracy
}

/**
 * Identify categories where user has below-average accuracy
 * ADPT-01: Weak category detection
 */
function getWeakCategories(
  categoryMastery: Record<TriadCategory, CategoryMasteryData>
): Set<TriadCategory> {
  const weakCategories = new Set<TriadCategory>();

  // Calculate overall accuracy
  let totalCorrect = 0;
  let totalAttempts = 0;
  Object.values(categoryMastery).forEach(({ correct, total }) => {
    totalCorrect += correct;
    totalAttempts += total;
  });

  if (totalAttempts === 0) return weakCategories; // No data yet

  const overallAccuracy = totalCorrect / totalAttempts;

  // Mark categories below overall accuracy as weak
  Object.entries(categoryMastery).forEach(([category, { correct, total }]) => {
    if (total === 0) return; // Skip categories with no data

    const categoryAccuracy = correct / total;
    if (categoryAccuracy < overallAccuracy) {
      weakCategories.add(category as TriadCategory);
    }
  });

  return weakCategories;
}
```

### Integration Point

```typescript
// In medtriad/app/quiz/index.tsx, replace line 74:

// BEFORE (random selection):
const generatedQuestions = generateQuestionSet(QUESTION_COUNT);

// AFTER (adaptive selection):
const generatedQuestions = await generateAdaptiveQuestionSet(QUESTION_COUNT);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Random shuffle | Weighted random with performance data | 2020s adaptive learning trend | Personalized difficulty, better engagement |
| Fixed difficulty thresholds | Per-user difficulty classification | Research published 2023-2024 | Same question can be "easy" for one user, "hard" for another |
| Mid-quiz adjustment | Between-session adjustment only | Gaming research (Rollings & Adams) | Avoids player exploitation, maintains fairness perception |
| All-or-nothing weak categories | Weighted probability | Modern adaptive systems | Maintains variety while prioritizing weak areas |

**Deprecated/outdated:**
- Fixed question pools per difficulty level - modern systems use dynamic per-user classification
- Visible difficulty indicators during selection - research shows this reduces engagement
- Linear difficulty progression - adaptive systems maintain flow state better than forced progression

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal weight multipliers for this specific app**
   - What we know: Research suggests 2-3x range for adaptive systems
   - What's unclear: Whether MedTriad's medical education context needs different tuning
   - Recommendation: Start with 2x weak categories, 3x tricky marks, 1.2-1.5x tier difficulty; collect user feedback in Phase 30 (Daily Challenges) to tune

2. **Minimum attempts threshold (3) validation**
   - What we know: ADPT-05 requires 3 attempts; educational testing uses similar thresholds
   - What's unclear: Whether medical triads need higher threshold due to complexity
   - Recommendation: Start with 3 attempts as specified; monitor if classifications stabilize or fluctuate wildly

3. **New user cold start experience**
   - What we know: Fall back to random selection works but doesn't provide adaptive benefits
   - What's unclear: How many quizzes before adaptive selection becomes effective
   - Recommendation: Accept random selection for first 1-2 quizzes; after 10+ answered questions, adaptive signals should emerge

4. **Tier difficulty weighting interaction with tier timers**
   - What we know: Tier system already reduces time (15s → 8s), AND this phase adds difficulty weighting
   - What's unclear: Whether combined effect makes higher tiers too punishing
   - Recommendation: Conservative tier difficulty weights (1.2-1.5x) since timer already provides difficulty scaling; user testing will reveal if adjustment needed

## Sources

### Primary (HIGH confidence)
- Codebase analysis:
  - `medtriad/app/quiz/index.tsx` - Current quiz selection at line 74
  - `medtriad/services/question-generator.ts` - Existing `generateQuestionSet()` function
  - `medtriad/services/triad-performance-storage.ts` - Phase 27 performance data
  - `medtriad/services/study-storage.ts` - Tricky question storage
  - `medtriad/services/stats-storage.ts` - Category mastery tracking
  - `medtriad/services/mastery.ts` - 6-tier system (Student to Chief)
  - `medtriad/types/triad.ts` - 10 medical categories defined
- Phase 27 completion docs:
  - `.planning/phases/27-data-foundation/27-01-SUMMARY.md`
  - `.planning/phases/27-data-foundation/27-VERIFICATION.md`

### Secondary (MEDIUM confidence)
- [Weighted Random in JavaScript](https://trekhleb.medium.com/weighted-random-in-javascript-4748ab3a1500) - Cumulative weights algorithm
- [Weighted Random algorithm in JavaScript - DEV Community](https://dev.to/trekhleb/weighted-random-algorithm-in-javascript-1pdc) - Implementation patterns
- [Understanding Item Analyses – Institutional Assessment & Evaluation](https://www.washington.edu/assessment/scanning-scoring/scoring/reports/item-analysis/) - Difficulty classification thresholds (85%/51% standards)
- [What Is Adaptive Quiz Difficulty Scaling?](https://www.quizcat.ai/blog/what-is-adaptive-quiz-difficulty-scaling) - Industry best practices
- [Adaptive Quiz Plugin](https://learningspaces.learningpool.com/mod/book/tool/print/index.php?id=15838) - Minimum attempts requirements

### Tertiary (LOW confidence)
- [Dynamic game difficulty balancing - Wikipedia](https://en.wikipedia.org/wiki/Dynamic_game_difficulty_balancing) - General DDA patterns (not quiz-specific)
- [Adaptive Difficulty: The Future of Inclusive and Engaging Games - Wayline](https://www.wayline.io/blog/adaptive-difficulty-future-inclusive-engaging-games) - Transparency best practices
- Game design literature (Andrew Rollings & Ernest Adams) cited in multiple sources - avoid mid-quiz adjustment, hide adaptive mechanisms

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies needed, all data infrastructure exists from Phase 27
- Architecture: HIGH - Weighted random selection is well-documented algorithm with clear implementation patterns
- Pitfalls: MEDIUM - Common edge cases identified from research, but MedTriad-specific tuning may reveal additional issues

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable domain, established patterns)
