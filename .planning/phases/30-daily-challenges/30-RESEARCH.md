# Phase 30: Daily Challenges - Research

**Researched:** 2026-01-22
**Domain:** Date-seeded randomness, streak mechanics, daily completion tracking, challenge variants
**Confidence:** HIGH

## Summary

Daily challenges require three core technical capabilities: (1) deterministic date-seeded randomness to ensure all users get the same challenge questions each day, (2) daily completion tracking with AsyncStorage to prevent multiple attempts, and (3) streak freeze mechanics to reduce user anxiety about missing days.

The standard approach uses `seedrandom` library for consistent question selection across all users, stores daily completion state in AsyncStorage with date-based validation, and implements streak freezes as a consumable resource earned weekly. The existing codebase already has AsyncStorage patterns, streak tracking, and celebration animations that can be extended.

Challenge type variants (speed round, category focus, full quiz) can be implemented by modifying existing quiz parameters: questionTime for speed rounds, category filtering for category focus, and questionCount for variant quiz lengths.

**Primary recommendation:** Use seedrandom library with ISO date strings as seeds, extend existing stats-storage.ts patterns for daily completion tracking, and implement streak freeze as a simple counter with weekly refresh.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| seedrandom | 3.0.5+ | Deterministic random generation | Industry standard for seeded randomness, 3M+ weekly downloads, battle-tested |
| @types/seedrandom | 3.0.8+ | TypeScript definitions | Official DefinitelyTyped types, 112 dependent packages |
| @react-native-async-storage/async-storage | 2.2.0+ | Local persistence | Already in project, standard for React Native data storage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-confetti-cannon | 1.5.2+ | Celebration animations | Already in project for milestone celebrations |
| react-native-reanimated | 4.1.1+ | Smooth animations | Already in project for UI animations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| seedrandom | random-seed | Less popular (21K vs 3M weekly downloads), similar API |
| seedrandom | Custom PRNG (Mulberry32) | Lighter weight but requires manual implementation and testing |
| AsyncStorage | Server-side validation | More secure but requires backend (out of scope) |

**Installation:**
```bash
npm install seedrandom @types/seedrandom
```

## Architecture Patterns

### Recommended Project Structure
```
medtriad/
├── services/
│   ├── daily-challenge.ts       # Date-seeded question selection
│   ├── streak-freeze-storage.ts # Streak freeze persistence
│   └── stats-storage.ts         # Extend with daily challenge completion
├── types/
│   └── daily-challenge.ts       # Challenge types and state
└── app/
    └── challenge/
        └── index.tsx            # Daily challenge screen
```

### Pattern 1: Date-Seeded Question Selection
**What:** Use ISO date string as seed to generate identical random sequence for all users
**When to use:** Any time you need consistent "randomness" across users/sessions

**Example:**
```typescript
// Source: https://github.com/davidbau/seedrandom
import seedrandom from 'seedrandom';

function getDailyChallengeQuestions(allTriads: Triad[], date: Date, count: number): Triad[] {
  // Create seed from date (same for all users on same day)
  const seed = date.toISOString().split('T')[0]; // "2026-01-22"

  // Create seeded random generator
  const rng = seedrandom(seed);

  // Fisher-Yates shuffle with seeded RNG
  const shuffled = [...allTriads];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
```

### Pattern 2: Daily Completion Tracking
**What:** Store completion date in AsyncStorage to prevent multiple attempts same day
**When to use:** Any once-per-day feature (daily quests, daily rewards, etc.)

**Example:**
```typescript
// Source: Existing stats-storage.ts pattern
interface DailyChallengeState {
  lastCompletedDate: string | null; // ISO date string "2026-01-22"
  streakFreezeCount: number;
  lastStreakFreezeEarned: string | null; // ISO date of last weekly reset
}

async function hasDoneChallengeToday(): Promise<boolean> {
  const state = await loadDailyChallengeState();
  const today = new Date().toDateString(); // "Wed Jan 22 2026"

  if (state.lastCompletedDate === null) return false;

  const lastCompleted = new Date(state.lastCompletedDate).toDateString();
  return lastCompleted === today;
}

async function completeDailyChallenge(): Promise<void> {
  const state = await loadDailyChallengeState();
  const today = new Date();

  // Check if already completed today
  if (await hasDoneChallengeToday()) {
    throw new Error('Daily challenge already completed');
  }

  // Update completion date
  state.lastCompletedDate = today.toISOString();

  await saveDailyChallengeState(state);
}
```

### Pattern 3: Streak Freeze Mechanics
**What:** Consumable resource that prevents streak loss on missed day
**When to use:** Reducing anxiety in streak-based gamification

**Example:**
```typescript
// Source: Duolingo streak freeze pattern (https://www.orizon.co/blog/duolingos-gamification-secrets)
interface StreakFreezeState {
  available: number; // How many freezes user has
  lastEarnedDate: string | null; // Track weekly earn cycle
}

function canEarnStreakFreeze(lastEarnedDate: string | null): boolean {
  if (!lastEarnedDate) return true;

  const lastEarned = new Date(lastEarnedDate);
  const today = new Date();
  const daysSince = Math.floor((today.getTime() - lastEarned.getTime()) / (1000 * 60 * 60 * 24));

  return daysSince >= 7; // Earn one per week
}

function calculateStreakWithFreeze(
  currentStreak: number,
  lastPlayedDate: string | null,
  streakFreezeAvailable: number
): { newStreak: number; freezeUsed: boolean } {
  const today = new Date().toDateString();

  if (lastPlayedDate === today) {
    return { newStreak: currentStreak, freezeUsed: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();

  if (lastPlayedDate === yesterdayString) {
    // Consecutive day - no freeze needed
    return { newStreak: currentStreak + 1, freezeUsed: false };
  }

  // Missed a day - try to use freeze
  if (streakFreezeAvailable > 0) {
    return { newStreak: currentStreak, freezeUsed: true }; // Freeze used, streak preserved
  }

  // No freeze available - streak broken
  return { newStreak: 1, freezeUsed: false };
}
```

### Pattern 4: Challenge Type Variants
**What:** Different challenge types using same quiz engine with different parameters
**When to use:** Adding variety without building separate quiz systems

**Example:**
```typescript
// Source: Gamification quiz patterns (https://www.school-page.com/articles/making-quizzes-fun-gamification-strategies)
type ChallengeType = 'speed' | 'category' | 'full';

interface ChallengeVariant {
  type: ChallengeType;
  questionCount: number;
  questionTime: number; // seconds per question
  category?: TriadCategory;
}

function getChallengeVariantForDate(date: Date): ChallengeVariant {
  const seed = date.toISOString().split('T')[0];
  const rng = seedrandom(seed);

  // Deterministic type selection (same for all users)
  const random = rng();

  if (random < 0.33) {
    // Speed round: fewer questions, less time
    return {
      type: 'speed',
      questionCount: 5,
      questionTime: 10, // Faster than normal 15s
    };
  } else if (random < 0.66) {
    // Category focus: normal count, specific category
    const categories: TriadCategory[] = ['cardiology', 'neurology', 'pulmonary'];
    const categoryIndex = Math.floor(rng() * categories.length);
    return {
      type: 'category',
      questionCount: 10,
      questionTime: 15,
      category: categories[categoryIndex],
    };
  } else {
    // Full quiz: standard parameters
    return {
      type: 'full',
      questionCount: 10,
      questionTime: 15,
    };
  }
}
```

### Anti-Patterns to Avoid

- **Using Math.random() for daily challenges:** Non-deterministic - users would get different questions
- **Storing challenge questions in AsyncStorage:** Wastes space, can be regenerated from seed
- **Client-only validation for "once per day":** Without server, this is acceptable but easy to circumvent via app reinstall
- **Resetting streak freeze count on app update:** Persists in AsyncStorage, should survive updates
- **Using timestamp for date comparison:** Time zones cause issues - use date strings instead

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Seeded random generation | Custom PRNG implementation | seedrandom library | Correct PRNG is hard - need proper distribution, period, avoiding bias. seedrandom is battle-tested. |
| Fisher-Yates shuffle | Custom shuffle algorithm | Existing shuffle with seedrandom | Easy to introduce bias in shuffle. Math.random() can't be seeded. Need to use rng() from seedrandom. |
| Date/time handling | Custom date comparison logic | toDateString() for date-only comparisons | Time zones, daylight saving, leap seconds create edge cases. |
| Celebration animations | Custom confetti implementation | react-native-confetti-cannon (already installed) | Complex particle physics, performance optimization already solved. |
| Streak freeze UI | Custom badge/counter | Extend existing HeroCard badges | Consistent with existing streak display, less code. |

**Key insight:** Date-seeded randomness is the most critical domain knowledge - getting PRNG seeding wrong means users see different challenges or challenges change when regenerated.

## Common Pitfalls

### Pitfall 1: Timezone Handling in Date Seeds
**What goes wrong:** Using Date.toISOString() includes time, causing challenges to change mid-day for users in different timezones
**Why it happens:** ISO strings include time ("2026-01-22T15:30:00.000Z"), so users in different timezones get different date strings at the same wall-clock time
**How to avoid:** Split ISO string to get date-only: `date.toISOString().split('T')[0]` gives "2026-01-22"
**Warning signs:** User reports "challenge changed halfway through day" or "different questions than friend"

### Pitfall 2: Seed Equivalence with Short Seeds
**What goes wrong:** Seeds like "1" and "1\0" should be different but may produce same sequence
**Why it happens:** Some PRNG implementations don't properly distinguish similar short seeds
**How to avoid:** Use longer, structured seeds like ISO dates. Seedrandom docs recommend adding '\0' terminator for short seeds.
**Warning signs:** Two different dates occasionally produce identical challenge

### Pitfall 3: Streak Freeze Not Earned on Daily Challenge Completion
**What goes wrong:** User completes daily challenges all week but doesn't earn streak freeze
**Why it happens:** Forgot to check and award streak freeze when completing challenge
**How to avoid:** Every daily challenge completion should check `canEarnStreakFreeze()` and award if eligible
**Warning signs:** Users complaining "I never get streak freezes"

### Pitfall 4: Race Condition in Streak Calculation
**What goes wrong:** User completes daily challenge and quiz in quick succession - streak counts twice or gets reset
**Why it happens:** Both update streak independently without coordination
**How to avoid:** Daily challenge completion should integrate with existing streak system - update same `lastPlayedDate` field
**Warning signs:** Streak jumps by 2 or unexpectedly resets to 1

### Pitfall 5: Challenge Type Changes After Day Starts
**What goes wrong:** User sees "Speed Round" in morning, comes back at night and it's "Category Focus"
**Why it happens:** Using current timestamp instead of fixed date seed
**How to avoid:** Generate challenge variant once per date, cache it, reuse throughout day
**Warning signs:** User reports challenge changed during same day

### Pitfall 6: Celebration Fatigue
**What goes wrong:** User sees confetti/celebration every time they complete daily challenge - becomes annoying
**Why it happens:** No differentiation between routine completion and actual milestones
**How to avoid:** Only celebrate actual streak milestones (7, 30, 100 days) - not every daily completion
**Warning signs:** User disables animations or complains about excessive celebrations

## Code Examples

Verified patterns from official sources:

### Extending Existing Streak Calculation
```typescript
// Source: Existing stats-storage.ts calculateStreak()
// Extension to support streak freeze

export function calculateStreakWithFreeze(
  currentStreak: number,
  lastPlayedDate: string | null,
  streakFreezeCount: number
): { newStreak: number; isNewDay: boolean; freezeUsed: boolean } {
  const today = new Date().toDateString(); // "Sat Jan 18 2026"

  if (lastPlayedDate === null) {
    // First time playing
    return { newStreak: 1, isNewDay: true, freezeUsed: false };
  }

  if (lastPlayedDate === today) {
    // Already played today - streak unchanged
    return { newStreak: currentStreak, isNewDay: false, freezeUsed: false };
  }

  // Check if last played was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();

  if (lastPlayedDate === yesterdayString) {
    // Consecutive day - increment streak
    return { newStreak: currentStreak + 1, isNewDay: true, freezeUsed: false };
  }

  // Missed a day - check for streak freeze
  if (streakFreezeCount > 0) {
    // Use freeze to preserve streak
    return { newStreak: currentStreak, isNewDay: true, freezeUsed: true };
  }

  // Streak broken - reset to 1
  return { newStreak: 1, isNewDay: true, freezeUsed: false };
}
```

### Daily Challenge State Management
```typescript
// Source: Pattern from stats-storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_CHALLENGE_KEY = '@medtriad_daily_challenge';

interface DailyChallengeState {
  lastCompletedDate: string | null; // ISO date string
  streakFreezeCount: number;
  lastStreakFreezeEarned: string | null; // ISO date string
}

const DEFAULT_STATE: DailyChallengeState = {
  lastCompletedDate: null,
  streakFreezeCount: 0,
  lastStreakFreezeEarned: null,
};

export async function loadDailyChallengeState(): Promise<DailyChallengeState> {
  try {
    const json = await AsyncStorage.getItem(DAILY_CHALLENGE_KEY);
    if (json) {
      return { ...DEFAULT_STATE, ...JSON.parse(json) };
    }
    return DEFAULT_STATE;
  } catch (error) {
    console.error('Failed to load daily challenge state:', error);
    return DEFAULT_STATE;
  }
}

export async function saveDailyChallengeState(state: DailyChallengeState): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save daily challenge state:', error);
  }
}

export async function canPlayDailyChallengeToday(): Promise<boolean> {
  const state = await loadDailyChallengeState();
  const today = new Date().toDateString();

  if (state.lastCompletedDate === null) return true;

  const lastCompleted = new Date(state.lastCompletedDate).toDateString();
  return lastCompleted !== today;
}
```

### Seeded Random Question Selection
```typescript
// Source: https://github.com/davidbau/seedrandom
import seedrandom from 'seedrandom';
import { Triad, TriadCategory } from '@/types/triad';

/**
 * Get daily challenge questions using date-seeded randomness
 * All users get same questions on same date
 */
export function getDailyChallengeQuestions(
  allTriads: Triad[],
  date: Date,
  count: number,
  category?: TriadCategory
): Triad[] {
  // Create date-only seed (same for all timezones)
  const seed = date.toISOString().split('T')[0]; // "2026-01-22"

  // Filter by category if specified
  const pool = category
    ? allTriads.filter(t => t.category === category)
    : allTriads;

  // Seeded Fisher-Yates shuffle
  const rng = seedrandom(seed);
  const shuffled = [...pool];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * Get challenge variant type for a given date
 * Same for all users on same date
 */
export function getDailyChallengeVariant(date: Date): ChallengeVariant {
  const seed = date.toISOString().split('T')[0];
  const rng = seedrandom(seed);

  const random = rng();

  if (random < 0.33) {
    // Speed round - 33% chance
    return {
      type: 'speed',
      questionCount: 5,
      questionTime: 10,
    };
  } else if (random < 0.66) {
    // Category focus - 33% chance
    const categories: TriadCategory[] = [
      'cardiology', 'neurology', 'pulmonary', 'endocrine',
      'gastroenterology', 'infectious', 'hematology', 'rheumatology',
      'renal', 'obstetrics'
    ];
    const categoryIndex = Math.floor(rng() * categories.length);
    return {
      type: 'category',
      questionCount: 10,
      questionTime: 15,
      category: categories[categoryIndex],
    };
  } else {
    // Full quiz - 34% chance
    return {
      type: 'full',
      questionCount: 10,
      questionTime: 15,
    };
  }
}
```

### Streak Freeze Award on Weekly Completion
```typescript
// Source: Weekly cycle pattern
export function checkAndAwardStreakFreeze(state: DailyChallengeState): DailyChallengeState {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  // Check if eligible for new freeze (7 days since last award)
  if (!state.lastStreakFreezeEarned) {
    // First time - award one
    return {
      ...state,
      streakFreezeCount: state.streakFreezeCount + 1,
      lastStreakFreezeEarned: todayISO,
    };
  }

  const lastAwarded = new Date(state.lastStreakFreezeEarned);
  const daysSinceAward = Math.floor(
    (today.getTime() - lastAwarded.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceAward >= 7) {
    return {
      ...state,
      streakFreezeCount: state.streakFreezeCount + 1,
      lastStreakFreezeEarned: todayISO,
    };
  }

  return state; // No change
}
```

### Milestone Celebration Detection
```typescript
// Source: Existing tier-up celebration pattern
export function getStreakMilestone(streak: number): { isMilestone: boolean; milestone: number } {
  const milestones = [7, 30, 100];

  for (const milestone of milestones) {
    if (streak === milestone) {
      return { isMilestone: true, milestone };
    }
  }

  return { isMilestone: false, milestone: 0 };
}

// Usage: Show celebration only on exact milestone match
const { isMilestone, milestone } = getStreakMilestone(newStreak);
if (isMilestone) {
  // Trigger confetti + celebration message
  showStreakMilestoneCelebration(milestone);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side daily challenges | Client-side date-seeded | 2020+ | Removes server dependency, works offline, no distribution costs |
| Punishment for missed days | Streak freeze mechanics | 2022 (Duolingo) | Reduces anxiety, improves retention, more ethical design |
| Fixed challenge type | Rotating challenge variants | 2023+ | Increases variety, maintains engagement over time |
| Push notifications for streaks | In-app streak visibility + freezes | 2024+ | Less intrusive, user-controlled engagement |

**Deprecated/outdated:**
- Server-based challenge distribution: Requires backend, adds latency, costs money
- Harsh streak resets without freezes: Research shows this demotivates users and increases churn
- Single challenge type: Users report boredom after 2-3 weeks of same format

## Open Questions

Things that couldn't be fully resolved:

1. **Streak Freeze Limit**
   - What we know: Duolingo allows multiple freezes to accumulate
   - What's unclear: Should we cap at 1 (simpler) or allow accumulation (more forgiving)?
   - Recommendation: Start with cap of 1, can increase based on user feedback

2. **Challenge Variant Distribution**
   - What we know: 33/33/34% split across three types
   - What's unclear: Is this the optimal distribution for engagement?
   - Recommendation: Start with equal distribution, can adjust based on completion rates

3. **Streak Freeze Earn Rate**
   - What we know: One per week is common pattern
   - What's unclear: Should completing 7 consecutive daily challenges also award one?
   - Recommendation: Time-based (one per week) is simpler and less exploitable

4. **Milestone Celebration Intensity**
   - What we know: 7, 30, 100 are standard milestones
   - What's unclear: Should celebration intensity scale with milestone (bigger confetti for 100)?
   - Recommendation: Same celebration for all milestones - keeps implementation simple

## Sources

### Primary (HIGH confidence)
- [seedrandom GitHub](https://github.com/davidbau/seedrandom) - Official repository with API documentation
- [@types/seedrandom npm](https://www.npmjs.com/package/@types/seedrandom) - TypeScript definitions (version 3.0.8)
- [@react-native-async-storage/async-storage GitHub](https://github.com/react-native-async-storage/async-storage) - Official AsyncStorage docs
- Existing codebase: stats-storage.ts calculateStreak() pattern, shuffle.ts Fisher-Yates implementation

### Secondary (MEDIUM confidence)
- [Duolingo's Gamification Secrets](https://www.orizon.co/blog/duolingos-gamification-secrets) - Streak freeze mechanics and psychology
- [Streaks for Gamification in Mobile Apps](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps) - Best practices for streak implementation
- [Daily Challenge Implementation Without Server](https://www.noveltech.dev/daily-challenge-no-download) - Date-seeded approach validation
- [Fisher-Yates Shuffle](https://github.com/robbiespeed/seeded-shuffle) - Seeded shuffle implementation patterns
- [Add Daily Streak Feature](https://www.enacton.com/blog/daily-streak-feature/) - Implementation guide for daily tracking

### Tertiary (LOW confidence)
- [Making Quizzes Fun: Gamification Strategies](https://www.school-page.com/articles/making-quizzes-fun-gamification-strategies) - Challenge variant ideas (timed rounds)
- [React Native Fiesta](https://github.com/mateoguzmana/react-native-fiesta) - Alternative celebration library (not needed - confetti-cannon already installed)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - seedrandom is industry standard, AsyncStorage already in project
- Architecture: HIGH - Patterns verified against existing codebase (stats-storage.ts, shuffle.ts)
- Pitfalls: HIGH - Timezone issues and seed equivalence documented in seedrandom docs
- Challenge variants: MEDIUM - WebSearch-based, but pattern is straightforward modification of existing quiz
- Streak freeze psychology: MEDIUM - Duolingo studies referenced but not primary research

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable domain, well-established libraries)
