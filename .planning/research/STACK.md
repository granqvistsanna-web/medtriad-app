# Stack Research: v2.0 Polish & Progression

**Project:** MedTriads
**Researched:** 2026-01-18
**Focus:** Onboarding, level systems, mascot images, UI polish

## Executive Summary

The existing stack (Expo SDK 54, react-native-reanimated 4.1.1, expo-image 3.0.11, AsyncStorage 2.2.0) already provides everything needed for v2.0. **No new libraries required.** The focus should be on leveraging existing capabilities more fully.

---

## Recommended Stack Additions

### Onboarding Flow

**No new libraries needed.**

| Component | Existing Solution | Why |
|-----------|-------------------|-----|
| First-launch detection | AsyncStorage | Already using it for settings/stats |
| Screen pagination | react-native-pager-view OR custom | Already in Expo Go, or use ScrollView with pagingEnabled |
| Animations | react-native-reanimated | Already installed (v4.1.1) |

**Recommendation: Use ScrollView with pagingEnabled + reanimated**

Why avoid react-native-pager-view for this use case:
- Onboarding is 2-3 static screens, not a complex carousel
- ScrollView with `pagingEnabled={true}` and `horizontal={true}` is simpler
- Already have reanimated for enter/exit animations
- Zero additional dependencies

**First-launch pattern (using existing AsyncStorage):**
```typescript
// services/onboarding-storage.ts
const ONBOARDING_KEY = '@medtriad_onboarding_complete';

export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}
```

**Sources:**
- [Expo AsyncStorage docs](https://docs.expo.dev/versions/latest/sdk/async-storage/)
- [Expo ViewPager docs](https://docs.expo.dev/versions/latest/sdk/view-pager/)

---

### Level/Progression System

**No new libraries needed.**

| Component | Existing Solution | Why |
|-----------|-------------------|-----|
| State storage | AsyncStorage | Already storing stats |
| Level calculation | Pure functions | Already have mastery.ts |
| UI updates | React state + reanimated | Standard pattern |

**Current mastery.ts analysis:**

The existing system has:
- 10 levels (0-10) with 10 questions per level
- Level titles from "Beginner" to "Grandmaster"
- Progress tracking functions

**Recommended v2.0 changes (code, not libraries):**

1. **Consolidate to 5-6 tiers** instead of 11 levels:
   ```typescript
   // Example tier structure
   const TIERS = [
     { name: 'Novice', minQuestions: 0, mascot: 'neutral' },
     { name: 'Student', minQuestions: 20, mascot: 'student' },
     { name: 'Practitioner', minQuestions: 50, mascot: 'practitioner' },
     { name: 'Specialist', minQuestions: 100, mascot: 'specialist' },
     { name: 'Master', minQuestions: 200, mascot: 'master' },
     { name: 'Grandmaster', minQuestions: 500, mascot: 'supermaster' },
   ];
   ```

2. **Track XP/points separately from questions answered** (optional):
   - Could add `totalXP` to StoredStats
   - Award variable XP based on difficulty, streak, speed

**Storage pattern (extends existing):**
```typescript
// Extend StoredStats interface
interface StoredStats {
  // ... existing fields
  currentTier: number;  // 0-5 index
  totalXP: number;      // Optional: for more granular progression
}
```

**Sources:**
- Existing codebase: `/medtriad/services/mastery.ts`
- Existing codebase: `/medtriad/services/stats-storage.ts`

---

### Mascot Image System

**No new libraries needed.**

| Component | Existing Solution | Why |
|-----------|-------------------|-----|
| Image display | expo-image | Already installed (v3.0.11) |
| Asset bundling | Metro bundler | Standard Expo pattern |
| Transitions | expo-image transition prop | Built-in cross-dissolve |

**Current mascot assets:**
```
assets/images/
  tri-neutral.png
  tri-success.png
  tri-master.png
  tri-supermaster.png
```

**Recommended pattern for tier-based mascots:**

1. **Static import map** (best for small asset sets):
   ```typescript
   // constants/mascots.ts
   export const MASCOT_IMAGES = {
     novice: require('@/assets/images/tri-neutral.png'),
     student: require('@/assets/images/tri-student.png'),
     practitioner: require('@/assets/images/tri-practitioner.png'),
     specialist: require('@/assets/images/tri-specialist.png'),
     master: require('@/assets/images/tri-master.png'),
     grandmaster: require('@/assets/images/tri-supermaster.png'),
   } as const;

   export type MascotTier = keyof typeof MASCOT_IMAGES;
   ```

2. **Use expo-image for display:**
   ```tsx
   import { Image } from 'expo-image';
   import { MASCOT_IMAGES } from '@/constants/mascots';

   <Image
     source={MASCOT_IMAGES[currentTier]}
     style={{ width: 112, height: 112 }}
     contentFit="contain"
     transition={300}
   />
   ```

**Why expo-image over React Native Image:**
- Already installed and used in the project
- Built-in transition animations (no flicker on source change)
- Memory/disk caching
- Better performance with SDWebImage/Glide backends

**Asset preparation notes:**
- Provide @2x and @3x versions for crisp display
- Use PNG for mascots (transparency support)
- Keep files reasonably sized (<100KB each)

**Sources:**
- [Expo Image documentation](https://docs.expo.dev/versions/latest/sdk/image/)
- Existing codebase: `/medtriad/assets/images/`

---

### UI Polish Patterns

**No new libraries needed.**

| Component | Existing Solution | Why |
|-----------|-------------------|-----|
| Animations | react-native-reanimated 4.1.1 | Already installed, powerful |
| Haptics | expo-haptics | Already installed |
| Gradients | expo-linear-gradient | Already installed |
| Shadows | theme.ts Shadows | Already defined |

**Reanimated entering/exiting animations (already available):**

```tsx
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';

// Screen enter animation
<Animated.View entering={FadeIn.duration(300)}>

// List item stagger
<Animated.View entering={FadeIn.delay(index * 50)}>

// Card appear
<Animated.View entering={SlideInRight.springify().damping(15)}>
```

**Available animations (no additional libraries):**
- Fade: FadeIn, FadeOut, FadeInRight, FadeInDown, etc.
- Slide: SlideInLeft, SlideInRight, SlideInUp, SlideInDown
- Zoom: ZoomIn, ZoomOut
- Bounce: BounceIn, BounceOut
- Flip: FlipInXUp, FlipInYLeft, etc.

**Modifiers:**
- `.duration(ms)` - animation length
- `.delay(ms)` - delay before start
- `.springify()` - spring physics
- `.damping(value)` - spring damping

**Polish patterns to implement:**

1. **Screen transitions:** Use entering/exiting on main content
2. **List item stagger:** `entering={FadeIn.delay(index * 50)}`
3. **Button press feedback:** Scale animation + haptics (already have useHaptics)
4. **Progress bar animation:** Interpolate width with reanimated
5. **Mascot evolution:** Cross-dissolve via expo-image transition prop

**Existing theme system is solid:**
- Typography scale defined
- Spacing scale (8px base)
- Shadows defined
- Border radius scale
- Colors defined

**Sources:**
- [Reanimated entering/exiting docs](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/)
- Existing codebase: `/medtriad/constants/theme.ts`

---

## Not Recommended

### Libraries to Avoid

| Library | Why Avoid |
|---------|-----------|
| react-native-onboarding-swiper | Overkill for 2-3 screens; adds dependency for simple use case |
| react-native-app-intro-slider | Same reason; ScrollView + reanimated is simpler |
| redux / zustand / jotai | AsyncStorage + React state is sufficient for this app's scale |
| styled-components / emotion | Already have solid theme.ts; StyleSheet is fine |
| react-native-fast-image | expo-image is equivalent and already installed |
| lottie-react-native | Nice but unnecessary; reanimated handles needed animations |

### Patterns to Avoid

| Pattern | Why Avoid | Do Instead |
|---------|-----------|------------|
| Dynamic require paths | Metro can't resolve at build time | Use static import map |
| Multiple image libraries | Inconsistent API, bundle bloat | Stick with expo-image |
| Over-engineered state | This is a quiz app, not a social network | Keep using AsyncStorage |
| Complex onboarding library | Maintenance burden for simple feature | Build with ScrollView + reanimated |

---

## Version Compatibility Matrix

| Package | Current Version | Notes |
|---------|-----------------|-------|
| expo | ~54.0.31 | SDK 54 stable |
| react-native-reanimated | ~4.1.1 | v4 with new Babel plugin location |
| expo-image | ~3.0.11 | Full feature set available |
| @react-native-async-storage/async-storage | ^2.2.0 | Latest, works with SDK 54 |
| expo-haptics | ~15.0.8 | No changes needed |
| expo-linear-gradient | ~15.0.8 | No changes needed |

**Babel configuration note (Expo SDK 54):**
The Babel plugin moved from `react-native-reanimated/plugin` to `react-native-worklets/plugin`. Verify babel.config.js uses the correct plugin if animations stop working.

---

## Summary

### Key Takeaways for Roadmap

1. **Zero new dependencies required.** The existing stack handles all v2.0 features.

2. **Onboarding:** Build with ScrollView (pagingEnabled) + reanimated animations + AsyncStorage for first-launch flag. ~2-3 screens, simple.

3. **Level system:** Extend existing mastery.ts to use 5-6 tiers instead of 10 levels. Pure TypeScript refactor.

4. **Mascot images:** Create static import map, use expo-image with transition prop. Add 2-4 new PNG assets.

5. **UI polish:** Leverage reanimated entering/exiting animations throughout. Focus areas:
   - Screen enter animations
   - List item stagger
   - Progress bar animations
   - Button feedback (already have haptics hook)

6. **Risk areas:**
   - Reanimated v4 Babel plugin location (verify babel.config.js)
   - Blurhash placeholder sizing with contentFit (minor visual issue, use thumbhash or solid color instead)

### Implementation Order Suggestion

1. First: Mascot image system (quick win, visual impact)
2. Second: Level/tier refactor (enables progression UI)
3. Third: UI polish passes (animations throughout)
4. Fourth: Onboarding flow (depends on mascots and polished UI to showcase)

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| No new libraries needed | HIGH | Verified existing package.json has all required capabilities |
| AsyncStorage for first-launch | HIGH | Standard pattern, already using AsyncStorage |
| expo-image for mascots | HIGH | Already in project, verified docs |
| reanimated entering/exiting | HIGH | Official documentation verified |
| Reanimated v4 Babel plugin | MEDIUM | Known migration issue, need to verify babel.config.js |
| ScrollView vs pager-view | MEDIUM | Both work; ScrollView simpler for 2-3 screens |
