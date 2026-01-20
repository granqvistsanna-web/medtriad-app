# Phase 24: Category Mastery - Research

**Researched:** 2026-01-20
**Domain:** AsyncStorage persistence, data aggregation, React Native UI components
**Confidence:** HIGH

## Summary

Category Mastery tracks user performance per medical category (cardiology, neurology, etc.), enabling users to identify their strengths and weaknesses across the 10 medical domains. The implementation follows established patterns from existing stats-storage.ts and study-storage.ts services.

The current codebase already has a placeholder `CategoryMastery` component on the Home screen (passing empty `{}` for data) and a `CATEGORY_COLORS` token system for visual differentiation. The triads.json data contains 45 triads distributed across 10 categories (4-6 triads per category). Implementation requires: (1) tracking correct/incorrect counts per category during quiz answer events, (2) persisting this data in AsyncStorage, (3) exposing the data through a hook, and (4) connecting it to the existing CategoryMastery component.

**Primary recommendation:** Add `categoryMastery: Record<TriadCategory, { correct: number; total: number }>` to StoredStats and update it in `updateAfterQuiz`. Modify the existing CategoryMastery component to display real data from useStats hook.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-native-async-storage/async-storage | ^2.2.0 | Local persistence | Already used for stats, follows established patterns |
| react-native-reanimated | ~4.1.1 | Progress bar animations | Already used in CategoryMastery card animations |
| react-native-svg | 15.12.1 | Optional: Progress rings | Already used in ProgressRing component |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @solar-icons/react-native | ^1.0.1 | Category icons (optional) | Visual enhancement for category cards |

### No Additional Dependencies Needed
Category Mastery can be implemented entirely with existing project dependencies.

**Installation:**
```bash
# No new packages required
```

## Architecture Patterns

### Recommended Project Structure
```
medtriad/
├── services/
│   └── stats-storage.ts      # MODIFY: Add categoryMastery to StoredStats
├── hooks/
│   └── useStats.ts           # MODIFY: Expose categoryMastery data
├── components/
│   └── home/
│       └── CategoryMastery.tsx  # MODIFY: Connect to real data
└── app/
    └── quiz/
        └── index.tsx         # MODIFY: Pass category with answer events
```

### Pattern 1: Extend StoredStats Interface
**What:** Add categoryMastery tracking to existing stats structure
**When to use:** Follow existing pattern - single stats object in AsyncStorage
**Example:**
```typescript
// services/stats-storage.ts - EXTEND existing interface
export interface StoredStats {
  // ... existing fields
  totalAnswered: number;
  totalCorrect: number;
  // ...

  // NEW: Category mastery tracking
  categoryMastery: Record<TriadCategory, { correct: number; total: number }>;
}

// Default value (all categories start at 0/0)
const DEFAULT_CATEGORY_MASTERY: Record<TriadCategory, { correct: number; total: number }> = {
  cardiology: { correct: 0, total: 0 },
  neurology: { correct: 0, total: 0 },
  endocrine: { correct: 0, total: 0 },
  pulmonary: { correct: 0, total: 0 },
  gastroenterology: { correct: 0, total: 0 },
  infectious: { correct: 0, total: 0 },
  hematology: { correct: 0, total: 0 },
  rheumatology: { correct: 0, total: 0 },
  renal: { correct: 0, total: 0 },
  obstetrics: { correct: 0, total: 0 },
};

const DEFAULT_STATS: StoredStats = {
  // ... existing defaults
  categoryMastery: DEFAULT_CATEGORY_MASTERY,
};
```

### Pattern 2: Track During Answer Selection
**What:** Update category stats when user answers each question
**When to use:** Real-time tracking during quiz flow
**Example:**
```typescript
// NEW function in stats-storage.ts
export async function updateCategoryMastery(
  category: TriadCategory,
  isCorrect: boolean
): Promise<void> {
  const stats = await loadStats();
  const current = stats.categoryMastery[category] ?? { correct: 0, total: 0 };

  const updated: StoredStats = {
    ...stats,
    categoryMastery: {
      ...stats.categoryMastery,
      [category]: {
        correct: current.correct + (isCorrect ? 1 : 0),
        total: current.total + 1,
      },
    },
  };

  await saveStats(updated);
}
```

### Pattern 3: Calculate Mastery Percentage
**What:** Derive percentage from correct/total ratio
**When to use:** Display on category cards
**Example:**
```typescript
// Helper function for display
export function getCategoryMasteryPercent(
  mastery: { correct: number; total: number }
): number {
  if (mastery.total === 0) return 0;
  return Math.round((mastery.correct / mastery.total) * 100);
}
```

### Pattern 4: Expose via useStats Hook
**What:** Add categoryMastery to existing useStats return value
**When to use:** Home screen consumes via hook
**Example:**
```typescript
// hooks/useStats.ts - ADD to return object
export function useStats(): StatsData {
  // ... existing implementation

  // NEW: Category mastery data
  const categoryMastery = stats?.categoryMastery ?? DEFAULT_CATEGORY_MASTERY;

  return {
    // ... existing fields
    categoryMastery,
  };
}
```

### Anti-Patterns to Avoid
- **Separate AsyncStorage key:** Don't create `@medtriad_category_mastery` - extend existing stats object for atomic updates
- **Batch updates at quiz end:** Track per-answer, not at quiz completion, for accurate real-time data
- **Store percentages:** Store raw counts (correct/total), calculate percentages on display for precision
- **Hard-code category list:** Use TriadCategory type for type safety

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Progress bar animation | Custom animation | CategoryMastery already has animated progress bar | Consistency, already implemented |
| Category colors | Inline colors | CATEGORY_COLORS from tokens/category-colors.ts | Design system compliance |
| Data persistence | Custom storage | Extend existing stats-storage.ts patterns | Established error handling, migration support |
| Category labels | Hardcoded strings | CATEGORY_LABELS from tokens/category-colors.ts | Centralized, translatable |

**Key insight:** The CategoryMastery component already exists with visual design - only needs data connection. Most work is backend (storage), not UI.

## Common Pitfalls

### Pitfall 1: AsyncStorage Race Conditions
**What goes wrong:** Multiple rapid answer selections cause inconsistent counts
**Why it happens:** AsyncStorage is async, concurrent updates can interleave
**How to avoid:**
- Option A: Queue updates, debounce writes
- Option B: Track in memory during quiz, batch save at end
- Option C: Accept minor inconsistency for MVP (low impact for < 10 answers/quiz)
**Warning signs:** Total counts don't match expected (totalAnswered vs sum of category totals)
**Recommendation:** Option B - track in quiz state, save batch at end for consistency

### Pitfall 2: Migration of Existing Stats
**What goes wrong:** Existing users have stats without categoryMastery field
**Why it happens:** New field added to StoredStats
**How to avoid:** Use spread with defaults in loadStats
```typescript
return { ...DEFAULT_STATS, ...JSON.parse(json) };
```
**Warning signs:** Crash when accessing categoryMastery on existing user

### Pitfall 3: Question Category Access During Quiz
**What goes wrong:** Can't track category because answer handler doesn't know the triad
**Why it happens:** handleAnswerSelect only receives option, not full question context
**How to avoid:** Current quiz already has `currentQuestion.triad.category` in scope
**Warning signs:** Need to refactor reducer to pass category

### Pitfall 4: Displaying Zero-Progress Categories
**What goes wrong:** UI shows 0% for never-attempted categories, looks broken
**Why it happens:** User hasn't encountered certain categories yet
**How to avoid:** Two options:
- Show "Not started" instead of 0%
- Only show categories with > 0 attempts
**Recommendation:** Show all 10 categories with 0% as valid state (matches home screen grid design)

### Pitfall 5: Category Distribution Imbalance
**What goes wrong:** Quiz randomly selects questions, some categories rarely appear
**Why it happens:** Random selection from 45 triads doesn't guarantee distribution
**How to avoid:** This is acceptable for MVP - users will see variety over time
**Warning signs:** User complains about always getting same categories
**Note:** Not in scope for this phase - randomization is existing behavior

## Code Examples

Verified patterns from existing codebase:

### StoredStats Extension
```typescript
// services/stats-storage.ts - ADD to interface and defaults
import { TriadCategory } from '@/types/triad';

export interface CategoryMasteryData {
  correct: number;
  total: number;
}

export interface StoredStats {
  // ... existing fields (keep all)
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

  // NEW
  categoryMastery: Record<TriadCategory, CategoryMasteryData>;
}

// Add to DEFAULT_STATS
const DEFAULT_STATS: StoredStats = {
  // ... existing defaults
  categoryMastery: {
    cardiology: { correct: 0, total: 0 },
    neurology: { correct: 0, total: 0 },
    endocrine: { correct: 0, total: 0 },
    pulmonary: { correct: 0, total: 0 },
    gastroenterology: { correct: 0, total: 0 },
    infectious: { correct: 0, total: 0 },
    hematology: { correct: 0, total: 0 },
    rheumatology: { correct: 0, total: 0 },
    renal: { correct: 0, total: 0 },
    obstetrics: { correct: 0, total: 0 },
  },
};
```

### Update Category Mastery After Quiz
```typescript
// services/stats-storage.ts - Modify updateAfterQuiz
export async function updateAfterQuiz(
  correctCount: number,
  totalQuestions: number,
  maxStreak: number,
  score: number,
  categoryResults?: Record<TriadCategory, { correct: number; total: number }> // NEW param
): Promise<StoredStats> {
  const currentStats = await loadStats();

  // Merge category results if provided
  const mergedCategoryMastery = categoryResults
    ? Object.entries(categoryResults).reduce(
        (acc, [category, { correct, total }]) => {
          const current = currentStats.categoryMastery[category as TriadCategory];
          return {
            ...acc,
            [category]: {
              correct: current.correct + correct,
              total: current.total + total,
            },
          };
        },
        { ...currentStats.categoryMastery }
      )
    : currentStats.categoryMastery;

  const updatedStats: StoredStats = {
    // ... existing update logic
    categoryMastery: mergedCategoryMastery,
  };

  await saveStats(updatedStats);
  return updatedStats;
}
```

### Quiz Screen - Track Category Results
```typescript
// app/quiz/index.tsx - ADD tracking
const categoryResultsRef = useRef<Record<string, { correct: number; total: number }>>({});

const handleAnswerSelect = async (option: QuizOption) => {
  // ... existing logic

  // Track category result
  const category = currentQuestion.triad.category;
  const current = categoryResultsRef.current[category] ?? { correct: 0, total: 0 };
  categoryResultsRef.current[category] = {
    correct: current.correct + (option.isCorrect ? 1 : 0),
    total: current.total + 1,
  };

  // ... existing logic
};

// In quiz completion (around line 100)
await recordQuizResult(
  correctCountRef.current,
  QUESTION_COUNT,
  maxComboRef.current,
  score,
  categoryResultsRef.current // NEW: Pass category results
);
```

### useStats Hook Extension
```typescript
// hooks/useStats.ts - ADD to interface and return

export interface StatsData {
  // ... existing fields
  categoryMastery: Record<TriadCategory, { correct: number; total: number }>;
  getCategoryPercent: (category: TriadCategory) => number;
}

export function useStats(): StatsData {
  // ... existing implementation

  const categoryMastery = stats?.categoryMastery ?? DEFAULT_CATEGORY_MASTERY;

  const getCategoryPercent = useCallback((category: TriadCategory): number => {
    const data = categoryMastery[category];
    if (data.total === 0) return 0;
    return Math.round((data.correct / data.total) * 100);
  }, [categoryMastery]);

  return {
    // ... existing
    categoryMastery,
    getCategoryPercent,
  };
}
```

### CategoryMastery Component - Connect to Real Data
```typescript
// components/home/CategoryMastery.tsx - Connect to useStats
// Currently receives categoryMastery={{}} from Home screen

// Home screen update (app/(tabs)/index.tsx):
const { categoryMastery, getCategoryPercent } = useStats();

<CategoryMastery
  categoryMastery={Object.fromEntries(
    Object.entries(categoryMastery).map(([cat, data]) => [
      cat,
      data.total === 0 ? 0 : Math.round((data.correct / data.total) * 100)
    ])
  )}
  onCategoryPress={(category) => router.push('/(tabs)/progress')}
  delay={Durations.stagger * 3}
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No category tracking | Per-category correct/total | This phase | Enables targeted study |
| Global accuracy only | Category-level accuracy | This phase | Identify weak areas |

**Deprecated/outdated:**
- None for this phase - all approaches are net new features

## Open Questions

Things that couldn't be fully resolved:

1. **Display All vs. Some Categories**
   - What we know: 10 categories exist, current UI shows 4 in a 2x2 grid
   - What's unclear: Should we show all 10, or keep showing 4 (perhaps top/bottom performers)?
   - Recommendation: Keep 4-card grid for MVP, but make them the user's weakest categories to encourage practice. Or show "See all" link to Progress screen.

2. **Category Card Press Action**
   - What we know: Current code navigates to Progress screen
   - What's unclear: Should it filter Library by category? Start category-specific quiz?
   - Recommendation: Keep Progress navigation for MVP. Future: filter Library by category.

3. **Reset Behavior**
   - What we know: clearStats() exists for reset
   - What's unclear: Should clearStats also reset categoryMastery?
   - Recommendation: Yes - categoryMastery is part of StoredStats, will be cleared with existing pattern.

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `services/stats-storage.ts` (AsyncStorage patterns)
- Existing codebase: `components/home/CategoryMastery.tsx` (UI already built)
- Existing codebase: `constants/tokens/category-colors.ts` (10 categories defined)
- Existing codebase: `data/triads.json` (45 triads with category distribution)
- Existing codebase: `app/quiz/index.tsx` (answer handling, has triad.category access)

### Secondary (MEDIUM confidence)
- Study-storage.ts patterns for toggle/tracking (similar pattern)

### Tertiary (LOW confidence)
- None - all recommendations based on existing codebase patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed
- Architecture: HIGH - Extends existing patterns directly
- Data model: HIGH - Simple addition to existing StoredStats
- Pitfalls: HIGH - Derived from codebase analysis
- UI: HIGH - Component already exists, just needs data

**Research date:** 2026-01-20
**Valid until:** No expiration - based on stable project architecture

## Appendix: Category Distribution in Triads

For reference, the 45 triads are distributed as:
- cardiology: 5 triads
- neurology: 6 triads
- endocrine: 5 triads
- pulmonary: 4 triads
- gastroenterology: 5 triads
- infectious: 4 triads
- hematology: 4 triads
- rheumatology: 4 triads
- renal: 4 triads
- obstetrics: 4 triads

This relatively even distribution means users will naturally encounter all categories with moderate play volume.
