# Phase 1: Data Foundation - Research

**Researched:** 2026-01-17
**Domain:** TypeScript data modeling, JSON loading in Expo, quiz question generation
**Confidence:** HIGH

## Summary

This phase establishes the data foundation for the MedTriad quiz app. The research covers three main areas: (1) structuring triad data as TypeScript interfaces with JSON storage, (2) loading local JSON files in Expo SDK 54, and (3) implementing a distractor selection algorithm that prefers same-category conditions.

The approach is straightforward and well-supported by the existing Expo/TypeScript ecosystem. JSON imports work out of the box with Expo's base tsconfig (which includes `resolveJsonModule: true`). The data model should use TypeScript interfaces with `as const` assertions for immutability. The distractor selection algorithm should use Fisher-Yates shuffle combined with category-preference filtering.

**Primary recommendation:** Store triads in a `data/triads.json` file, define TypeScript interfaces in `types/`, create a `services/question-generator.ts` that handles distractor selection with same-category preference.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.9.2 | Static typing for data models | Already in project |
| Expo SDK | ~54.0.31 | React Native framework | Already in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | JSON loading is built-in |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Local JSON | expo-file-system | Only needed for runtime file read/write; static data should use imports |
| Local JSON | SQLite/AsyncStorage | Overkill for 30-50 static triads; adds complexity |
| Manual shuffle | lodash.shuffle | Unnecessary dependency; Fisher-Yates is trivial to implement |

**Installation:**
```bash
# No additional packages needed - all capabilities are built-in
```

## Architecture Patterns

### Recommended Project Structure

```
medtriad/
  data/
    triads.json          # Static triad data
  types/
    index.ts             # Type exports
    triad.ts             # Triad-related types
    question.ts          # Question/quiz types
  services/
    question-generator.ts # Question generation logic
    triads.ts            # Triad data loading/access
  utils/
    shuffle.ts           # Fisher-Yates shuffle utility
```

### Pattern 1: Type-Safe JSON Data with Const Assertion

**What:** Define TypeScript interfaces for data shape, then use `as const` or explicit typing when importing JSON to get full type safety.

**When to use:** Static data files that won't change at runtime.

**Example:**
```typescript
// types/triad.ts
export interface Triad {
  id: string;
  condition: string;
  findings: [string, string, string]; // Tuple for exactly 3 findings
  category: TriadCategory;
}

export type TriadCategory =
  | 'cardiology'
  | 'neurology'
  | 'endocrine'
  | 'pulmonary'
  | 'gastroenterology'
  | 'infectious'
  | 'hematology'
  | 'rheumatology';

// data/triads.json structure
{
  "triads": [
    {
      "id": "becks-triad",
      "condition": "Cardiac Tamponade",
      "findings": ["Hypotension", "Muffled heart sounds", "Jugular venous distention"],
      "category": "cardiology"
    }
  ]
}

// services/triads.ts
import triadsData from '@/data/triads.json';
import { Triad, TriadCategory } from '@/types/triad';

// Type assertion for imported JSON
const triads: Triad[] = triadsData.triads as Triad[];

export function getAllTriads(): Triad[] {
  return triads;
}

export function getTriadsByCategory(category: TriadCategory): Triad[] {
  return triads.filter(t => t.category === category);
}
```

### Pattern 2: Service Layer for Question Generation

**What:** Encapsulate question generation logic in a dedicated service that handles distractor selection.

**When to use:** When business logic needs to be reusable and testable.

**Example:**
```typescript
// types/question.ts
import { Triad } from './triad';

export interface QuizQuestion {
  id: string;
  triad: Triad;           // The correct answer's triad
  displayFindings: string; // Formatted findings string
  options: QuizOption[];   // 4 options including correct answer
}

export interface QuizOption {
  id: string;
  condition: string;
  isCorrect: boolean;
}

// services/question-generator.ts
import { Triad, TriadCategory } from '@/types/triad';
import { QuizQuestion, QuizOption } from '@/types/question';
import { getAllTriads, getTriadsByCategory } from './triads';
import { shuffle } from '@/utils/shuffle';

export function generateQuestion(correctTriad: Triad): QuizQuestion {
  const distractors = selectDistractors(correctTriad, 3);

  const options: QuizOption[] = shuffle([
    { id: correctTriad.id, condition: correctTriad.condition, isCorrect: true },
    ...distractors.map(d => ({
      id: d.id,
      condition: d.condition,
      isCorrect: false,
    })),
  ]);

  return {
    id: `q-${correctTriad.id}-${Date.now()}`,
    triad: correctTriad,
    displayFindings: correctTriad.findings.join(', '),
    options,
  };
}
```

### Pattern 3: Category-Preferring Distractor Selection

**What:** Select distractors that prefer same-category conditions but fall back to other categories if needed.

**When to use:** When generating plausible wrong answers for medical triads.

**Example:**
```typescript
// services/question-generator.ts (continued)

function selectDistractors(
  correctTriad: Triad,
  count: number
): Triad[] {
  const allTriads = getAllTriads();

  // Get same-category triads (excluding correct answer)
  const sameCategory = allTriads.filter(
    t => t.category === correctTriad.category && t.id !== correctTriad.id
  );

  // Get other-category triads
  const otherCategory = allTriads.filter(
    t => t.category !== correctTriad.category
  );

  const distractors: Triad[] = [];
  const usedIds = new Set<string>([correctTriad.id]);

  // Prefer same-category first
  const shuffledSame = shuffle([...sameCategory]);
  for (const triad of shuffledSame) {
    if (distractors.length >= count) break;
    if (!usedIds.has(triad.id)) {
      distractors.push(triad);
      usedIds.add(triad.id);
    }
  }

  // Fill remaining with other categories
  const shuffledOther = shuffle([...otherCategory]);
  for (const triad of shuffledOther) {
    if (distractors.length >= count) break;
    if (!usedIds.has(triad.id)) {
      distractors.push(triad);
      usedIds.add(triad.id);
    }
  }

  return distractors;
}
```

### Anti-Patterns to Avoid

- **Storing data in component state:** Triads are static; don't re-fetch or re-parse on every render.
- **Using `any` type for JSON imports:** Always define interfaces and use type assertions.
- **Using `Math.random()` for shuffling directly:** Use Fisher-Yates to ensure unbiased shuffling.
- **Mutating the original triads array:** Always work with copies when shuffling.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Array shuffling | Custom shuffle | Fisher-Yates algorithm | Proven unbiased O(n) algorithm |
| Type-safe JSON | Manual validation | TypeScript interfaces + assertions | Compile-time safety |
| Path aliases | Relative imports | `@/*` alias (already configured) | Cleaner imports, easier refactoring |

**Key insight:** The data layer for this app is simple enough that no external libraries are needed. TypeScript's built-in type system and Expo's JSON import support handle everything.

## Common Pitfalls

### Pitfall 1: JSON Import Type Inference

**What goes wrong:** TypeScript infers JSON imports as `{ triads: { id: string; condition: string; ... }[] }` with wide string types instead of literal types.

**Why it happens:** JSON imports are inferred, not explicitly typed.

**How to avoid:** Cast imported JSON to your defined interface types:
```typescript
import data from './triads.json';
import { Triad } from '@/types/triad';

// Cast to typed array
const triads: Triad[] = data.triads as Triad[];
```

**Warning signs:** TypeScript not catching invalid category values or missing fields.

### Pitfall 2: Biased Random Selection

**What goes wrong:** Using `array.sort(() => Math.random() - 0.5)` produces biased results.

**Why it happens:** This "shuffle" doesn't give equal probability to all permutations.

**How to avoid:** Use Fisher-Yates algorithm:
```typescript
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

**Warning signs:** Some options appearing more frequently than others in testing.

### Pitfall 3: Duplicate Distractors in Same Question

**What goes wrong:** Same condition appears twice in answer options.

**Why it happens:** Not tracking which triads have already been selected.

**How to avoid:** Use a Set to track used IDs:
```typescript
const usedIds = new Set<string>([correctTriad.id]);
for (const triad of shuffledPool) {
  if (!usedIds.has(triad.id)) {
    distractors.push(triad);
    usedIds.add(triad.id);
  }
}
```

**Warning signs:** Same answer appearing multiple times in options array.

### Pitfall 4: Mutating Original Data

**What goes wrong:** Shuffling the original triads array affects subsequent calls.

**Why it happens:** Arrays are passed by reference in JavaScript.

**How to avoid:** Always spread into a new array before shuffling:
```typescript
const shuffledCopy = shuffle([...originalArray]);
```

**Warning signs:** Different results when calling the same function with same inputs at different times.

### Pitfall 5: Insufficient Triads per Category

**What goes wrong:** Some categories have fewer than 4 triads, making same-category distractors impossible.

**Why it happens:** Data design doesn't account for minimum category sizes.

**How to avoid:** Ensure each category has at least 4-5 triads, OR implement graceful fallback to other categories (which is recommended anyway).

**Warning signs:** Unable to generate 3 distractors for certain triads.

## Code Examples

Verified patterns from official sources:

### Fisher-Yates Shuffle Implementation

```typescript
// Source: https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
// utils/shuffle.ts

/**
 * Fisher-Yates shuffle algorithm - produces unbiased permutations in O(n) time
 * Returns a NEW shuffled array (does not mutate input)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]; // Create copy
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

### JSON Import with Type Safety

```typescript
// Source: Expo tsconfig.base includes resolveJsonModule: true
// https://github.com/expo/expo/blob/main/packages/expo/tsconfig.base.json

// data/triads.json
{
  "triads": [
    {
      "id": "becks-triad",
      "condition": "Cardiac Tamponade",
      "findings": ["Hypotension", "Muffled heart sounds", "Jugular venous distention"],
      "category": "cardiology"
    }
  ]
}

// services/triads.ts
import triadsData from '@/data/triads.json';
import { Triad } from '@/types/triad';

// Type-safe access to imported JSON
const triads = triadsData.triads as Triad[];

export function getAllTriads(): Triad[] {
  return triads;
}
```

### Complete Triad Type Definitions

```typescript
// types/triad.ts

/**
 * Medical triad categories - expand as needed
 */
export type TriadCategory =
  | 'cardiology'
  | 'neurology'
  | 'endocrine'
  | 'pulmonary'
  | 'gastroenterology'
  | 'infectious'
  | 'hematology'
  | 'rheumatology'
  | 'renal'
  | 'obstetrics';

/**
 * A medical triad - a condition characterized by three clinical findings
 */
export interface Triad {
  /** Unique identifier for the triad (e.g., "becks-triad") */
  id: string;

  /** The medical condition name (e.g., "Cardiac Tamponade") */
  condition: string;

  /** Exactly three clinical findings - use tuple type for enforcement */
  findings: [string, string, string];

  /** Category for grouping and distractor selection */
  category: TriadCategory;
}

/**
 * Container type matching the JSON structure
 */
export interface TriadsData {
  triads: Triad[];
}
```

### Complete Question Generator Service

```typescript
// services/question-generator.ts
import { Triad, TriadCategory } from '@/types/triad';
import { QuizQuestion, QuizOption } from '@/types/question';
import { getAllTriads } from './triads';
import { shuffle } from '@/utils/shuffle';

/**
 * Generate a quiz question for the given triad
 * Selects distractors preferring same-category conditions
 */
export function generateQuestion(correctTriad: Triad): QuizQuestion {
  const distractors = selectDistractors(correctTriad, 3);

  const options: QuizOption[] = shuffle([
    {
      id: correctTriad.id,
      condition: correctTriad.condition,
      isCorrect: true
    },
    ...distractors.map(d => ({
      id: d.id,
      condition: d.condition,
      isCorrect: false,
    })),
  ]);

  return {
    id: `q-${correctTriad.id}-${Date.now()}`,
    triad: correctTriad,
    displayFindings: formatFindings(correctTriad.findings),
    options,
  };
}

/**
 * Generate multiple questions avoiding duplicate triads
 */
export function generateQuestionSet(count: number): QuizQuestion[] {
  const allTriads = shuffle(getAllTriads());
  const selectedTriads = allTriads.slice(0, Math.min(count, allTriads.length));
  return selectedTriads.map(generateQuestion);
}

/**
 * Select distractors with same-category preference
 * Ensures no duplicates within the returned set
 */
function selectDistractors(correctTriad: Triad, count: number): Triad[] {
  const allTriads = getAllTriads();

  // Partition into same-category and other-category
  const sameCategory = allTriads.filter(
    t => t.category === correctTriad.category && t.id !== correctTriad.id
  );
  const otherCategory = allTriads.filter(
    t => t.category !== correctTriad.category
  );

  const distractors: Triad[] = [];
  const usedIds = new Set<string>([correctTriad.id]);

  // First: try same-category distractors
  const shuffledSame = shuffle(sameCategory);
  for (const triad of shuffledSame) {
    if (distractors.length >= count) break;
    if (!usedIds.has(triad.id)) {
      distractors.push(triad);
      usedIds.add(triad.id);
    }
  }

  // Then: fill with other-category if needed
  const shuffledOther = shuffle(otherCategory);
  for (const triad of shuffledOther) {
    if (distractors.length >= count) break;
    if (!usedIds.has(triad.id)) {
      distractors.push(triad);
      usedIds.add(triad.id);
    }
  }

  return distractors;
}

/**
 * Format findings array for display
 */
function formatFindings(findings: [string, string, string]): string {
  return findings.join(' + ');
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `require()` for JSON | ES module `import` | TypeScript 2.9+ / 2018 | Cleaner syntax, better tree-shaking |
| `resolveJsonModule` manual | Expo base tsconfig includes it | Expo SDK 50+ | Works out of box |
| Class-based services | Function-based modules | React hooks era / 2019+ | Simpler, easier to test |

**Deprecated/outdated:**
- `require()` syntax: Still works but `import` is preferred for consistency
- `react-native-fs` for static data: Only needed for runtime file operations, not bundled assets

## Open Questions

Things that couldn't be fully resolved:

1. **Exact number of triads per category**
   - What we know: Need at least 4 per category ideally for same-category distractors
   - What's unclear: Exact distribution across categories in final data set
   - Recommendation: Start with balanced distribution (4-6 per category), adjust based on available medical triads

2. **Medical accuracy of triad data**
   - What we know: Triads are well-documented in medical literature
   - What's unclear: Which specific triads to include for the app's educational goals
   - Recommendation: Use established medical triads from reputable sources; defer to medical content review

## Sources

### Primary (HIGH confidence)
- [Expo tsconfig.base.json on GitHub](https://github.com/expo/expo/blob/main/packages/expo/tsconfig.base.json) - Confirmed `resolveJsonModule: true`
- [Expo TypeScript Guide](https://docs.expo.dev/guides/typescript/) - TypeScript configuration
- [FreeCodeCamp Fisher-Yates](https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/) - Shuffle algorithm implementation

### Secondary (MEDIUM confidence)
- [GeeksforGeeks React Native JSON loading](https://www.geeksforgeeks.org/react-native/how-to-fetch-data-from-a-local-json-file-in-react-native/) - JSON import methods
- [TypeScript Best Practices 2025](https://dev.to/mitu_mariam/typescript-best-practices-in-2025-57hb) - Type safety patterns
- [React Native Project Structure 2025](https://medium.com/@md.alishanali/scalable-and-modular-react-native-expo-folder-structure-2025-606abc0bf7d6) - Folder organization

### Tertiary (LOW confidence)
- [Medical Triads Reference](https://iem-student.org/2020/06/12/triads-in-medicine/) - Medical content examples (needs medical review)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Expo/TypeScript well-documented, no external dependencies needed
- Architecture: HIGH - Standard patterns, confirmed with official docs
- Pitfalls: HIGH - Well-known issues with clear solutions

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable tech stack)
