# Research Summary: v2.0 Polish & Progression

**Synthesized:** 2026-01-18
**Research Files:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## Executive Summary

MedTriads v2.0 adds onboarding, level system enhancements, mascot evolution, and UI polish. The research confirms that **no new libraries are needed** - the existing stack (Expo SDK 54, react-native-reanimated 4.1.1, expo-image 3.0.11, AsyncStorage 2.2.0) fully supports all planned features. This is primarily a **refinement release** that extends existing infrastructure rather than introducing new patterns.

The existing architecture is well-suited for these additions. The app already has a working 11-tier mastery system (0-10 levels) and level-based mascot switching. v2.0 extends rather than replaces. The key architectural insight is that onboarding uses expo-router route groups with conditional rendering, level tiers extend the existing mastery service, and mascot evolution refines existing TriMascot thresholds.

The highest risk areas are **existing user migration** (users who installed before v2.0 must not see onboarding and should see their earned level proudly) and **UI consistency** (polish means applying existing theme tokens systematically, not redesigning). Both are preventable with careful implementation and testing.

---

## Key Findings

### Stack

**Zero new dependencies required.** The existing stack handles all v2.0 features:
- Onboarding: ScrollView with `pagingEnabled` + reanimated animations + AsyncStorage for first-launch detection
- Level System: Extend existing `mastery.ts` with tier metadata (colors, mascot keys)
- Mascot Images: Static require map with expo-image (already has transition prop for smooth evolution)
- UI Polish: Leverage reanimated entering/exiting animations (FadeIn, SlideInRight, etc.) throughout

**One verification needed:** Reanimated v4 Babel plugin location changed from `react-native-reanimated/plugin` to `react-native-worklets/plugin`. Verify babel.config.js if animations break.

### Features

**Table Stakes (must have):**
- Onboarding: 2-3 swipeable screens, skip option, progress dots, value proposition
- Level System: 5-6 tiers with medical-themed names, clear progress indicator, level-up celebration
- Mascot Evolution: Distinct static image per tier, evolution celebration, visible on home screen
- UI Polish: Library/Progress/Settings screens match Home style, consistent spacing/typography

**Differentiators (should have for v2):**
- Level-up confetti celebration
- Preview of next mascot evolution ("At Level X, your mascot will evolve!")
- Micro-interactions on buttons (subtle scale on press)
- Medical-themed tier names (Intern -> Chief)

**Defer to v3:**
- Animated Rive mascot with reactions
- Unlockable content per tier
- Leaderboards/social features
- Complex personalization

### Architecture

**Integration approach is low-risk:**

| Feature | Integration Type | Risk |
|---------|-----------------|------|
| Onboarding | New route group + storage service | LOW - isolated from existing code |
| Level System | Extend existing mastery service | LOW - additive changes only |
| Mascot Evolution | Extend existing TriMascot | LOW - already has level-based logic |
| UI Polish | Apply existing theme system | LOW - visual changes only |

**New files needed (6):**
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

### Pitfalls

**Top 5 Critical Pitfalls:**

1. **Existing users see onboarding after update** - Check for existing data (`gamesPlayed > 0`), not just onboarding flag. Existing users should skip onboarding automatically.

2. **Inconsistent UI across screens** - Systematic audit against theme tokens before changes. Polish means unifying, not diversifying.

3. **Level system feels meaningless** - Each tier needs distinct visual identity (color, mascot), celebration moment on level-up.

4. **Mascot evolution not celebrated** - Show "Tri evolved!" moment with animation/sound when tier changes.

5. **Breaking functionality during polish** - Atomic style changes, test every interaction after visual changes.

**Phase-specific warnings:**
- Onboarding: Existing user migration is CRITICAL - test with simulated v1 user data
- Level System: Current curve (100 questions to max) may be too fast for engaged users
- UI Polish: Define "done" precisely to prevent scope creep

---

## Recommended Build Order

Based on dependencies and risk analysis from ARCHITECTURE.md:

### Phase 1: UI Polish Foundation
**Why first:** Establishes consistent patterns before adding new features. Low risk, high visual impact.

1. Audit theme usage across Library, Progress, Settings screens
2. Polish Library screen - apply card patterns, spacing from theme.ts
3. Polish Progress screen - apply card patterns, add section structure
4. Polish Settings screen - apply row patterns
5. Polish Quiz screen - timer, findings card consistency

**Delivers:** Consistent visual language across all screens
**Features from FEATURES.md:** UI consistency (table stakes)
**Pitfalls to avoid:** Breaking functionality, over-polishing, scope creep

### Phase 2: Level System Enhancement
**Why second:** Builds on existing mastery system, needed for mascot evolution triggers.

1. Extend `mastery.ts` - add LEVEL_TIERS constant with color, mascotKey per tier
2. Extend `useStats` - add levelTier derived value
3. Create LevelBadge component
4. Add level badge to HeroCard
5. Add level progress visualization to Progress screen
6. Implement level-up celebration animation + haptic

**Delivers:** Visual level identity, progress visibility, celebration moments
**Features from FEATURES.md:** Clear level indicator, progress to next level, level-up celebration, tier naming
**Pitfalls to avoid:** Meaningless progression, disconnected gamification

### Phase 3: Mascot Evolution
**Why third:** Depends on level tier system for mascot-to-tier mapping.

1. Define mascot-to-tier mapping in LEVEL_TIERS
2. Refine TriMascot to use tier.mascotKey instead of hardcoded thresholds
3. Implement mascot evolution celebration ("Tri evolved!")
4. Verify mascot display on Home, Results screens
5. (Optional) Add intermediate mascot assets if design available

**Delivers:** Mascot reflects progression, evolution feels rewarding
**Features from FEATURES.md:** Distinct visual per tier, evolution celebration
**Pitfalls to avoid:** Evolution not celebrated, asset management complexity

### Phase 4: Onboarding Flow
**Why last:** Can showcase polished UI and mascot. Isolated from existing screens.

1. Create `onboarding-storage.ts` with first-launch detection
2. Add existing user check (`gamesPlayed > 0` = skip onboarding)
3. Create (onboarding) route group with layout
4. Create OnboardingPage shared component
5. Create welcome.tsx ("What are triads?")
6. Create ready.tsx (mark complete + navigate to home)
7. Modify `app/_layout.tsx` for conditional routing

**Delivers:** First-run experience for new users
**Features from FEATURES.md:** Value proposition, skip option, progress dots
**Pitfalls to avoid:** Existing users see onboarding, content overload, visual mismatch

---

## Critical Decisions Needed

### 1. Level Tier Structure
Current system has 11 levels (0-10) with 10 questions per level.
FEATURES.md recommends 5-6 tiers for better spacing.
**Decision needed:** Keep 11 levels with visual groupings, OR consolidate to 5-6 tiers?

**Recommendation:** Keep 11 levels internally but group into 5-6 visual tiers:
- Tiers 0-2: Novice tier (neutral mascot)
- Tiers 3-4: Practitioner tier (neutral mascot)
- Tiers 5-6: Specialist tier (happy mascot)
- Tiers 7-8: Master tier (master mascot)
- Tiers 9-10: Grandmaster tier (supermaster mascot)

### 2. Progression Curve
At 10 questions/quiz, users max out in 10 sessions.
**Decision needed:** Is this too fast for retention?

**Recommendation:** Consider for v3. Current curve works for MVP. Can extend later with XP weighting for accuracy.

### 3. Medical-Themed vs Generic Tier Names
FEATURES.md suggests medical names (Intern -> Chief).
Current names are generic (Beginner -> Grandmaster).

**Decision needed:** Which naming convention?

**Recommendation:** Stick with current generic names for v2. Medical names add design complexity (icon assets) and may feel forced. Revisit for v3.

---

## Research Flags

### Phases Needing Additional Research During Planning
- **None** - All v2.0 features use well-documented patterns

### Standard Patterns (Skip Research)
- UI Polish - Standard theme token application
- Level System - Extends existing working code
- Mascot Evolution - Refines existing TriMascot
- Onboarding - Official expo-router pattern documented

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified existing package.json has all required capabilities |
| Features | HIGH | Multiple authoritative sources agree on best practices |
| Architecture | HIGH | Extends existing working code; expo-router patterns documented |
| Pitfalls | MEDIUM | Patterns clear, but migration testing is app-specific |

### Gaps to Address During Planning

1. **Mascot asset strategy** - How many intermediate mascot images? Current 4 or expand?
2. **Onboarding content** - Exact copy and visuals for 2-3 screens
3. **Level-up celebration** - Confetti particle count, sound design, duration
4. **Testing matrix** - Which device sizes and iOS versions to validate

---

## Sources

### From STACK.md
- [Expo AsyncStorage docs](https://docs.expo.dev/versions/latest/sdk/async-storage/)
- [Expo Image documentation](https://docs.expo.dev/versions/latest/sdk/image/)
- [Reanimated entering/exiting docs](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/)

### From FEATURES.md
- [UXCam - App Onboarding Guide](https://uxcam.com/blog/10-apps-with-great-user-onboarding/)
- [Plotline - Streaks and Milestones](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps)
- [Apple Developer - Evolution of Duolingo Owl](https://developer.apple.com/news/?id=e2e1faj4)
- [Pixelmatters - UI Design Trends 2025](https://www.pixelmatters.com/insights/8-ui-design-trends-2025)

### From ARCHITECTURE.md
- [Expo Router Introduction](https://docs.expo.dev/router/introduction/)
- [Expo Router Authentication Redirects](https://docs.expo.dev/router/advanced/authentication-rewrites/)

### From PITFALLS.md
- [NN/g Mobile App Onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/)
- [RevenueCat Gamification Guide](https://www.revenuecat.com/blog/growth/gamification-in-apps-complete-guide/)
- [Reanimated Performance Docs](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/)

---

## Ready for Requirements

Research is complete. All four research files have been synthesized:

- **STACK.md** - Confirms zero new dependencies needed
- **FEATURES.md** - Defines table stakes vs differentiators vs anti-features
- **ARCHITECTURE.md** - Maps integration points and build order
- **PITFALLS.md** - Identifies critical risks with prevention strategies

The roadmapper can proceed to create the v2.0 roadmap with confidence that:
1. The existing stack supports all planned features
2. Build order is clear (Polish -> Levels -> Mascot -> Onboarding)
3. Critical risks are identified (existing user migration, UI consistency)
4. Scope is well-defined (what to build, what to defer)
