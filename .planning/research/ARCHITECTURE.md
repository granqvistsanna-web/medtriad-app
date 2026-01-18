# Architecture Research: v2.0 Polish & Progression

**Project:** MedTriads
**Researched:** 2026-01-18
**Confidence:** HIGH (based on existing codebase analysis + official documentation)

## Executive Summary

MedTriads v2.0 adds four features that integrate cleanly with the existing architecture:
1. **Onboarding flow** - Route group with AsyncStorage first-launch detection
2. **Level system** - Extend existing mastery service + useStats hook
3. **Mascot evolution** - Extend existing TriMascot component with asset mapping
4. **UI polish** - Apply existing design system (theme.ts) consistently across screens

The existing architecture is well-suited for these additions. Key insight: the app already has mastery levels (0-10) and mascot level-switching infrastructure. v2.0 extends rather than replaces.

---

## Integration Points

### 1. Onboarding Integration

**Pattern:** Route group with conditional redirect (expo-router standard pattern)

**Existing architecture:**
```
app/
  _layout.tsx          # Root Stack with ThemeProvider
  (tabs)/              # Tab navigation (Home, Library, Progress, Settings)
  quiz/                # Quiz flow (index, results)
  modal.tsx
```

**Proposed addition:**
```
app/
  _layout.tsx          # Root Stack - ADD loading state + redirect logic
  (onboarding)/        # NEW route group
    _layout.tsx        # Onboarding stack
    welcome.tsx        # Screen 1: "What are triads?"
    scoring.tsx        # Screen 2: "How scoring works" (optional)
    ready.tsx          # Screen 3: "Ready to start!" -> mark complete
  (tabs)/              # Existing - no changes
  quiz/                # Existing - no changes
```

**First-launch detection:**

```typescript
// services/onboarding-storage.ts (NEW)
const ONBOARDING_KEY = '@medtriad_onboarding';

export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'complete';
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'complete');
}
```

**Root layout modification:**

```typescript
// app/_layout.tsx
export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    hasCompletedOnboarding().then((completed) => {
      setNeedsOnboarding(!completed);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <SplashScreen />; // Or null with expo-splash-screen
  }

  return (
    <ThemeProvider value={LightTheme}>
      <Stack>
        {needsOnboarding ? (
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="quiz" options={{ ... }} />
          </>
        )}
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
```

**Alternative: expo-router redirect pattern**

From [Expo Router authentication docs](https://docs.expo.dev/router/advanced/authentication-rewrites/), can use `<Redirect>` in a nested layout instead of conditional rendering in root:

```typescript
// app/(tabs)/_layout.tsx
export default function TabLayout() {
  const { needsOnboarding } = useOnboardingState(); // from context

  if (needsOnboarding) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Tabs>...</Tabs>;
}
```

**Recommendation:** Use the conditional Stack.Screen approach in root layout. Simpler, avoids flash of wrong screen, matches how the app already handles ThemeProvider wrapping.

**Files to create:**
- `services/onboarding-storage.ts` - Storage functions
- `app/(onboarding)/_layout.tsx` - Onboarding stack
- `app/(onboarding)/welcome.tsx` - Welcome screen
- `app/(onboarding)/ready.tsx` - Final screen (mark complete + navigate)
- `components/onboarding/OnboardingPage.tsx` - Shared page component

**Existing code to modify:**
- `app/_layout.tsx` - Add loading state and conditional routing

---

### 2. Level System Integration

**Current state (already implemented):**

The app already has a mastery level system in `services/mastery.ts`:
- 10 levels (0-10), 10 questions per level = 100 questions to max
- Level titles: Beginner, Novice, Apprentice, Student, Practitioner, Specialist, Expert, Master, Virtuoso, Legend, Grandmaster
- `useStats()` hook exposes: `masteryLevel`, `masteryProgress`, `questionsToNextLevel`, `levelTitle`

**v2.0 enhancement: Engaging tier names**

The existing 11-tier system (0-10) is actually fine. "Engaging tier names" means:
1. Possibly rename some titles to be more thematic
2. Add visual identity (colors, icons) per tier
3. Surface level more prominently in UI

**Proposed tier enhancement:**

```typescript
// services/mastery.ts - EXTEND (don't replace)

export interface LevelTier {
  level: number;
  title: string;
  color: string;        // Tier accent color
  mascotKey: MascotKey; // Which mascot image to use
  minQuestions: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 0, title: 'Beginner', color: '#B2BEC3', mascotKey: 'neutral', minQuestions: 0 },
  { level: 1, title: 'Novice', color: '#74B9FF', mascotKey: 'neutral', minQuestions: 10 },
  { level: 2, title: 'Apprentice', color: '#55EFC4', mascotKey: 'neutral', minQuestions: 20 },
  { level: 3, title: 'Student', color: '#81ECEC', mascotKey: 'neutral', minQuestions: 30 },
  { level: 4, title: 'Practitioner', color: '#FFEAA7', mascotKey: 'happy', minQuestions: 40 },
  { level: 5, title: 'Specialist', color: '#FDCB6E', mascotKey: 'happy', minQuestions: 50 },
  { level: 6, title: 'Expert', color: '#E17055', mascotKey: 'happy', minQuestions: 60 },
  { level: 7, title: 'Master', color: '#D63031', mascotKey: 'master', minQuestions: 70 },
  { level: 8, title: 'Virtuoso', color: '#A29BFE', mascotKey: 'master', minQuestions: 80 },
  { level: 9, title: 'Legend', color: '#6C5CE7', mascotKey: 'supermaster', minQuestions: 90 },
  { level: 10, title: 'Grandmaster', color: '#2D3436', mascotKey: 'supermaster', minQuestions: 100 },
];

export function getLevelTier(level: number): LevelTier {
  return LEVEL_TIERS[Math.min(level, MAX_LEVEL)];
}
```

**Where levels are displayed:**
1. **Home screen HeroCard** - Already shows mascot based on `masteryLevel`
2. **Home screen** - Add level badge/indicator near mascot
3. **Results screen** - Already shows "+10 questions toward Level X"
4. **Progress screen** - Show level prominently with progress bar
5. **Settings screen** - Optionally show current level

**Files to modify:**
- `services/mastery.ts` - Add `LevelTier` interface and `LEVEL_TIERS` constant
- `components/home/HeroCard.tsx` - Display level badge with tier color
- `app/(tabs)/progress.tsx` - Add level section with visual progress

---

### 3. Mascot Integration

**Current state (already implemented):**

`TriMascot` component in `components/home/TriMascot.tsx` already:
- Has 4 mascot images: `tri-neutral.png`, `tri-success.png`, `tri-master.png`, `tri-supermaster.png`
- Switches based on `masteryLevel` prop (>=7 = master, >=10 = supermaster)
- Supports `mood` prop for animation variations
- Has breathing, floating, rise, and glow animations via reanimated

**v2.0 enhancement: More granular mascot evolution**

Currently only 2 level thresholds (7, 10). Can expand to more:

```typescript
// components/home/TriMascot.tsx - EXTEND

export type MascotKey = 'neutral' | 'happy' | 'master' | 'supermaster';

const MASCOT_IMAGES: Record<MascotKey, any> = {
  neutral: require('@/assets/images/tri-neutral.png'),
  happy: require('@/assets/images/tri-success.png'),
  master: require('@/assets/images/tri-master.png'),
  supermaster: require('@/assets/images/tri-supermaster.png'),
};

// Optionally add more images for intermediate levels
// e.g., tri-apprentice.png, tri-expert.png

function getMascotImage(masteryLevel: number, mood: MascotMood): MascotKey {
  // Level-based selection (higher priority)
  if (masteryLevel >= 10) return 'supermaster';
  if (masteryLevel >= 7) return 'master';

  // Mood-based selection for lower levels
  if (mood === 'happy' || mood === 'streak') return 'happy';

  return 'neutral';
}
```

**Asset strategy:**

For mascot images, use static `require()` (current approach is correct):
- Static imports are resolved at compile time
- Images bundled into app binary
- No network dependency at runtime
- Better for small set of known assets

Per [Expo Assets documentation](https://docs.expo.dev/develop/user-interface/assets/), this is the recommended approach for app assets.

**Mascot display locations:**
1. **Home screen HeroCard** - Primary mascot display (already implemented)
2. **Onboarding screens** - Mascot guides user through onboarding
3. **Results screen** - Already shows mascot with mood
4. **Level up celebration** - Show new mascot when tier changes

**Files to modify:**
- `components/home/TriMascot.tsx` - Add `MascotKey` type, refine level thresholds
- `constants/theme.ts` - Already has `MascotSizes`, no changes needed

**Assets to potentially add:**
- `assets/images/tri-apprentice.png` (optional - for intermediate tier)
- `assets/images/tri-expert.png` (optional - for intermediate tier)

**Recommendation:** Keep current 4 images for v2.0. The existing neutral/happy/master/supermaster progression is sufficient. Creating more mascot art is design work that can be deferred.

---

### 4. UI Polish Integration

**Current design system:**

`constants/theme.ts` provides:
- `Colors.light` - Complete color palette (primary, backgrounds, text hierarchy, semantic colors)
- `Typography` - Text styles (display, title, heading, body, label, stat, caption, footnote, tiny)
- `Spacing` - 8px base scale (xs, sm, md, base, lg, xl, xxl, xxxl)
- `Shadows` - sm, md, lg elevation
- `Radius` - Border radius scale
- `MascotSizes` - sm, md, lg, xl
- `Durations` - Animation timing

**Current screen status:**

| Screen | Uses Design System | Polish Needed |
|--------|-------------------|---------------|
| Home | Yes - fully styled | No - reference implementation |
| Quiz | Partial | Yes - timer, findings card styling |
| Results | Yes - mostly styled | Minor - consistency check |
| Library | Partial | Yes - match Home card style |
| Progress | Partial | Yes - match Home card style |
| Settings | Partial | Yes - match Home card style |

**Polish approach:**

1. **Card consistency** - All screens should use same card pattern:
   ```typescript
   // components/ui/Card.tsx - already exists but underused
   // Apply: LinearGradient background, Radius.xl, consistent padding
   ```

2. **Header consistency** - Match HomeHeader pattern:
   ```typescript
   // All tab screens should have similar header treatment
   // Title + optional subtitle with consistent typography
   ```

3. **Spacing consistency** - Use theme Spacing everywhere:
   ```typescript
   // Replace hardcoded padding/margin with Spacing constants
   paddingHorizontal: Spacing.lg,
   gap: Spacing.md,
   ```

4. **Animation consistency** - Use FadeInUp entering animations:
   ```typescript
   // Currently used on Home screen, apply to other screens
   entering={FadeInUp.delay(n * Durations.stagger).duration(Durations.normal).springify()}
   ```

**Files to modify:**
- `app/(tabs)/library.tsx` - Apply Home screen styling patterns
- `app/(tabs)/progress.tsx` - Apply Home screen styling patterns
- `app/(tabs)/settings.tsx` - Apply Home screen styling patterns
- `app/quiz/index.tsx` - Polish quiz screen elements
- `components/library/CategorySection.tsx` - Match card styles
- `components/progress/StatsCard.tsx` - Match card styles
- `components/settings/SettingsRow.tsx` - Match row styles

---

## Data Flow

### Current Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     AsyncStorage                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ @medtriad_   │  │ @medtriad_   │  │ @medtriad_   │       │
│  │   stats      │  │   settings   │  │ quiz_history │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────────────┐
│ stats-storage.ts│ │settings-      │ │ stats-storage.ts      │
│ loadStats()     │ │storage.ts     │ │ loadQuizHistory()     │
│ updateAfterQuiz│ │ loadSettings()│ │ saveQuizHistory()     │
└────────┬────────┘ └───────┬───────┘ └───────────────────────┘
         │                  │
         ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Hooks                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ useStats()   │  │useSoundEffects│ │ useHaptics() │       │
│  │ masteryLevel │  │(reads settings)│ │(reads settings)│    │
│  │ highScore    │  └──────────────┘  └──────────────┘       │
│  │ dailyStreak  │                                            │
│  └──────┬───────┘                                            │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Components                                │
│  Home → HeroCard → TriMascot (masteryLevel)                 │
│       → StatsGrid (accuracy, streak, highScore)             │
│  Results → TriMascot (mood based on accuracy)               │
│         → Mastery badge (questions to next level)           │
└─────────────────────────────────────────────────────────────┘
```

### v2.0 Data Flow Additions

```
┌─────────────────────────────────────────────────────────────┐
│                     AsyncStorage                             │
│  ┌──────────────┐                                            │
│  │ @medtriad_   │  <-- NEW KEY                               │
│  │  onboarding  │                                            │
│  └──────┬───────┘                                            │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                 services/onboarding-storage.ts               │
│  hasCompletedOnboarding() -> boolean                         │
│  markOnboardingComplete() -> void                            │
└─────────┬────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    app/_layout.tsx                           │
│  [isLoading, needsOnboarding] state                          │
│  Conditionally renders (onboarding) or (tabs) route group   │
└─────────────────────────────────────────────────────────────┘
```

**Level system data flow (extends existing):**

```
┌─────────────────────────────────────────────────────────────┐
│                services/mastery.ts                           │
│  LEVEL_TIERS[] - NEW constant with tier metadata             │
│  getLevelTier(level) - NEW function returning tier data      │
│  (existing functions unchanged)                              │
└─────────┬────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                hooks/useStats.ts                             │
│  masteryLevel (existing)                                     │
│  levelTier -> getLevelTier(masteryLevel) - NEW derived value │
│  levelColor, levelTitle (from tier)                          │
└─────────┬────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Components                                │
│  HeroCard -> level badge with tier.color                     │
│  TriMascot -> mascot based on tier.mascotKey                 │
│  Progress screen -> level progress visualization             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### New Components

| Component | Responsibility | Location |
|-----------|---------------|----------|
| OnboardingPage | Shared layout for onboarding screens | components/onboarding/ |
| LevelBadge | Displays level with tier color | components/ui/ |
| LevelProgress | Visual level progress bar | components/home/ or components/progress/ |

### Existing Components to Extend

| Component | Extension | Reason |
|-----------|-----------|--------|
| TriMascot | More refined level thresholds | Already has level-based switching |
| HeroCard | Add LevelBadge | Already receives masteryLevel |
| useStats | Add levelTier derived value | Centralizes level logic |

### Component Communication

```
app/_layout.tsx
    │
    ├── (onboarding)/ [conditional]
    │       └── OnboardingPage
    │               └── TriMascot (neutral mood)
    │               └── Button (navigation)
    │
    └── (tabs)/ [conditional]
            ├── Home
            │       └── HomeHeader
            │       └── HeroCard
            │               └── TriMascot (level + mood based)
            │               └── LevelBadge (NEW)
            │       └── StatsGrid
            │       └── Button
            │
            ├── Library (polish only - no structural changes)
            ├── Progress (add level section)
            │       └── LevelProgress (NEW)
            │       └── StatsCard
            └── Settings (polish only)
```

---

## Suggested Build Order

Based on dependencies and risk analysis:

### Phase 1: UI Polish Foundation

**Why first:** Establishes consistent patterns before adding new features. Low risk, high visual impact.

1. **Audit theme usage** - Find hardcoded styles
2. **Polish Library screen** - Apply card patterns, spacing
3. **Polish Progress screen** - Apply card patterns, add section structure
4. **Polish Settings screen** - Apply row patterns
5. **Polish Quiz screen** - Timer, findings card consistency

**Depends on:** Nothing
**Blocks:** Nothing (can proceed in parallel with onboarding)

### Phase 2: Level System Enhancement

**Why second:** Builds on existing mastery system, needed for mascot evolution.

1. **Extend mastery.ts** - Add LEVEL_TIERS, getLevelTier()
2. **Extend useStats** - Add levelTier derived value
3. **Create LevelBadge component** - Visual level indicator
4. **Add to HeroCard** - Display level badge
5. **Add to Progress screen** - Level section with progress bar

**Depends on:** Existing mastery system (already working)
**Blocks:** Mascot evolution (needs tier mapping)

### Phase 3: Mascot Evolution

**Why third:** Depends on level tier system for mapping.

1. **Define mascot-to-tier mapping** - In mastery.ts LEVEL_TIERS
2. **Refine TriMascot thresholds** - Use tier.mascotKey
3. **Verify all mascot display locations** - Home, Results, (Onboarding)
4. **(Optional)** Add intermediate mascot assets if design available

**Depends on:** Level tier system
**Blocks:** Onboarding (needs mascot for guide)

### Phase 4: Onboarding Flow

**Why last:** Can be added without touching existing screens. Depends on mascot being finalized.

1. **Create onboarding-storage.ts** - First-launch detection
2. **Create (onboarding) route group** - Layout + screens
3. **Create OnboardingPage component** - Shared screen layout
4. **Create welcome.tsx** - "What are triads?"
5. **Create ready.tsx** - Mark complete + navigate
6. **Modify app/_layout.tsx** - Conditional routing

**Depends on:** Mascot (for onboarding guide), UI patterns (for consistency)
**Blocks:** Nothing

### Parallel Work Opportunities

- **UI Polish** can happen in parallel with **Level System**
- **Onboarding screens** design can happen while Level System is built
- **Testing** each phase independently before integration

---

## Anti-Patterns to Avoid

### 1. Onboarding State in React Context

**Don't:** Create a React Context for onboarding state
**Do:** Read from AsyncStorage once in root layout, use local state

Why: Onboarding is checked once at app launch. No need for global context. Simpler is better.

### 2. Dynamic require() for Mascot Images

**Don't:** `require(\`@/assets/images/tri-${mascotKey}.png\`)`
**Do:** Static require with lookup object

```typescript
// CORRECT
const MASCOT_IMAGES = {
  neutral: require('@/assets/images/tri-neutral.png'),
  // ...
};
const image = MASCOT_IMAGES[mascotKey];

// WRONG - dynamic require not optimized
const image = require(`@/assets/images/tri-${mascotKey}.png`);
```

Why: Metro bundler optimizes static requires. Dynamic requires may not be bundled correctly.

### 3. Level System State Duplication

**Don't:** Store calculated level in AsyncStorage
**Do:** Derive level from totalAnswered (current approach)

Why: Level is a derived value. Storing it creates sync issues. Calculate when needed.

### 4. Mixing Styling Approaches

**Don't:** Mix inline styles with theme constants
**Do:** Use theme constants consistently

```typescript
// CORRECT
style={{ paddingHorizontal: Spacing.lg, backgroundColor: colors.background }}

// WRONG - mixing
style={{ paddingHorizontal: 24, backgroundColor: colors.background }}
```

---

## Summary

### Integration Approach

| Feature | Integration Type | Risk Level |
|---------|-----------------|------------|
| Onboarding | New route group + storage service | LOW - isolated from existing code |
| Level System | Extend existing mastery service | LOW - additive changes only |
| Mascot Evolution | Extend existing TriMascot | LOW - already has level-based logic |
| UI Polish | Apply existing theme system | LOW - visual changes only |

### Key Architectural Decisions

1. **Onboarding uses route groups** (expo-router pattern) rather than custom navigation state
2. **Level tiers defined in mastery.ts** - single source of truth for progression
3. **Mascot images use static require** - bundled at compile time
4. **UI polish uses existing theme.ts** - no new design system needed

### Files Summary

**New files (6):**
- `services/onboarding-storage.ts`
- `app/(onboarding)/_layout.tsx`
- `app/(onboarding)/welcome.tsx`
- `app/(onboarding)/ready.tsx`
- `components/onboarding/OnboardingPage.tsx`
- `components/ui/LevelBadge.tsx`

**Modified files (8+):**
- `app/_layout.tsx` - Onboarding routing
- `services/mastery.ts` - Level tiers
- `hooks/useStats.ts` - Level tier derived value
- `components/home/TriMascot.tsx` - Tier-based mascot
- `components/home/HeroCard.tsx` - Level badge
- `app/(tabs)/library.tsx` - UI polish
- `app/(tabs)/progress.tsx` - UI polish + level section
- `app/(tabs)/settings.tsx` - UI polish

### Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Onboarding pattern | HIGH | Official expo-router documentation pattern |
| Level system | HIGH | Extends existing working code |
| Mascot integration | HIGH | Already implemented, just refining |
| UI polish | HIGH | Applying existing design system |

---

## Sources

- [Expo Router Introduction](https://docs.expo.dev/router/introduction/)
- [Expo Router Authentication Redirects](https://docs.expo.dev/router/advanced/authentication-rewrites/)
- [Expo Assets Documentation](https://docs.expo.dev/develop/user-interface/assets/)
- [React Native Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
- Existing codebase analysis: `services/mastery.ts`, `components/home/TriMascot.tsx`, `hooks/useStats.ts`
