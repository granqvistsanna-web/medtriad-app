# Pitfalls Research: v2.0 Polish & Progression

**Project:** MedTriads
**Researched:** 2026-01-18
**Focus:** Onboarding, level systems, mascot evolution, UI polish
**Confidence:** MEDIUM (WebSearch verified against existing codebase patterns)

---

## Onboarding Pitfalls

### Critical: Failing to Persist Onboarding Completion State

**What goes wrong:** Onboarding shows every app launch instead of just once.

**Why it happens:** Developers forget to save completion state to AsyncStorage, or the state is saved but not checked before showing onboarding.

**Warning signs:**
- Onboarding screen appears in navigation stack without conditional logic
- No `hasCompletedOnboarding` flag in storage schema
- Onboarding routes not gated by state check

**Prevention:**
```typescript
// In app/_layout.tsx or equivalent
const hasOnboarded = await AsyncStorage.getItem('@onboarding_complete');
if (!hasOnboarded) {
  // Show onboarding
}
```
- Save completion state immediately when user finishes or skips
- Test by killing and relaunching app after completing onboarding
- Consider migration for existing users (they should NOT see onboarding)

**Phase impact:** Address in onboarding phase. Existing user migration is essential.

**Sources:** [React Native Onboarding Tutorial](https://blog.openreplay.com/setting-up-onboarding-screens-in-react-native/), [Expo Store Data Docs](https://docs.expo.dev/develop/user-interface/store-data/)

---

### Critical: Showing Onboarding to Existing Users After Update

**What goes wrong:** After app update, existing users (who have already been using the app) see onboarding meant for new users.

**Why it happens:** Onboarding flag doesn't exist for users who installed before onboarding was added. The check `!hasOnboarded` returns true because the key was never set.

**Warning signs:**
- No migration logic for existing users
- Only checking for onboarding flag, not checking if user has existing data

**Prevention:**
```typescript
// Check for existing user data, not just onboarding flag
const hasOnboarded = await AsyncStorage.getItem('@onboarding_complete');
const existingStats = await loadStats();

// Skip onboarding if user has played before (existing user)
if (hasOnboarded || existingStats.gamesPlayed > 0) {
  // Skip onboarding
}
```
- Use `gamesPlayed > 0` or `totalAnswered > 0` as proxy for "existing user"
- Mark existing users as onboarded during first launch after update

**Phase impact:** Critical to address when implementing onboarding. Must test with simulated existing user data.

---

### Moderate: Onboarding Content Overload

**What goes wrong:** Users skip or abandon onboarding because it's too long or information-dense.

**Why it happens:** Desire to explain everything upfront. Each feature team wants their feature mentioned.

**Warning signs:**
- More than 3-4 onboarding screens
- Dense text paragraphs on screens
- No skip option
- Time to complete exceeds 60 seconds

**Prevention:**
- Keep to 2-3 screens maximum (PROJECT.md specifies 2-3)
- One concept per screen
- Large visuals, minimal text
- Always provide skip option
- Focus on "what makes this app special" not "how to use buttons"

**Phase impact:** Design onboarding content carefully. Test with real users for drop-off.

**Sources:** [NN/g Mobile App Onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/), [Clutch Survey on Onboarding](https://www.smartlook.com/blog/mobile-app-onboarding/)

---

### Moderate: Onboarding Explains Features Users Don't Care About Yet

**What goes wrong:** New users don't understand or value feature explanations because they haven't experienced the problem yet.

**Why it happens:** Explaining scoring system before user has taken a quiz means nothing to them.

**Warning signs:**
- Onboarding explains combo multipliers, speed bonuses
- Details about level system before user has earned any XP
- Feature-focused rather than value-focused content

**Prevention:**
- Focus onboarding on value proposition: "Learn medical triads through quick quizzes"
- Explain mechanics contextually (tooltip on first combo, not during onboarding)
- Let users discover features through use

**Phase impact:** Consider progressive disclosure - brief onboarding upfront, contextual hints during play.

---

### Minor: Onboarding Visual Style Mismatch

**What goes wrong:** Onboarding screens feel disconnected from rest of app, creating jarring transition.

**Why it happens:** Onboarding designed separately, different designer, or using third-party library with default styling.

**Warning signs:**
- Different color palette in onboarding
- Different typography or spacing
- Onboarding images don't match app's visual language

**Prevention:**
- Use same theme tokens (Colors, Typography, Spacing from theme.ts)
- Feature the mascot (Tri) in onboarding screens
- Test transition from final onboarding screen to home screen

**Phase impact:** Build onboarding with existing design system, not third-party library defaults.

---

## Level System Pitfalls

### Critical: Meaningless Progression That Doesn't Motivate

**What goes wrong:** Users level up but don't feel accomplished. Levels feel like arbitrary numbers.

**Why it happens:** Levels unlock nothing, have no visual identity, and thresholds are too easy or too hard.

**Warning signs:**
- All levels look the same (just a number change)
- Level names are generic (Level 1, Level 2, etc.)
- No celebration on level-up
- Levels unlock nothing tangible

**Prevention:**
- Each tier has distinct visual identity (PROJECT.md specifies this)
- Engaging tier names (current: Beginner -> Grandmaster is good)
- Level-up celebration animation and haptic
- Mascot evolves with level (planned feature)
- Consider what each level unlocks (even if just bragging rights)

**Phase impact:** Visual identity per tier is in scope. Ensure celebration moments are memorable.

**Sources:** [Gamification Mistakes](https://www.talentlms.com/blog/common-gamification-mistakes-avoid/), [RevenueCat Gamification Guide](https://www.revenuecat.com/blog/growth/gamification-in-apps-complete-guide/)

---

### Critical: Existing User Level Calculation Confusion

**What goes wrong:** After adding level system, existing users don't understand their level or feel cheated.

**Why it happens:** User has 500 questions answered, suddenly shows as "Level 10" without context of what happened.

**Warning signs:**
- No communication to existing users about new system
- Level appears without explanation
- Users don't know what they did to earn current level

**Prevention:**
- Show level-up celebration on first launch after update (if user earned levels)
- Consider "You've already mastered X questions! You're a [Level Name]!" message
- Ensure existing progress is honored, not reset

**Phase impact:** Migration UX is important. Consider showing accumulated progress proudly.

---

### Moderate: Progression Curve Too Fast or Too Slow

**What goes wrong:** Users max out too quickly (no more goals) or feel stuck (can't see progress).

**Why it happens:** Poor XP curve design, not accounting for typical usage patterns.

**Warning signs:**
- Current system: 10 questions per level, max at 100 questions total
- At 10 questions/quiz, users max out in 10 sessions
- Power users hit max in one sitting

**Prevention:**
- Current curve may be too fast for engaged users
- Consider: Does max level at 100 questions provide enough runway?
- If adding more tiers, ensure late tiers require meaningful effort
- Early levels should feel quick (motivation), later levels slower (aspiration)

**Phase impact:** Review current mastery.ts curve. PROJECT.md mentions 5-6 tiers - reconcile with current 11 levels (0-10).

**Sources:** [Game Developer XP Thresholds](https://www.gamedeveloper.com/design/quantitative-design---how-to-define-xp-thresholds-)

---

### Moderate: Gamification Disconnected from Core Value

**What goes wrong:** Users focus on earning points/levels rather than learning medical triads.

**Why it happens:** Gamification mechanics become the goal rather than supporting the learning goal.

**Warning signs:**
- Users gaming the system (answering randomly to farm XP)
- Level progress not correlated with actual knowledge
- XP earned regardless of correct/incorrect answers

**Prevention:**
- Current system counts total answered, not total correct - consider implications
- Ensure XP rewards align with learning (correct answers should be more valuable)
- Level should feel earned through mastery, not grinding

**Phase impact:** Evaluate if current "questions answered" metric is the right progression basis. Consider weighting correct answers.

---

### Minor: Too Many Competing Systems

**What goes wrong:** Users overwhelmed by points, streaks, levels, badges, leaderboards.

**Why it happens:** Each feature added independently without holistic view.

**Warning signs:**
- Home screen shows: score, streak, level, accuracy, games played
- User doesn't know what to focus on
- Different mechanics compete for attention

**Prevention:**
- MedTriads currently has: high score, daily streak, mastery level, accuracy
- This is reasonable if hierarchy is clear
- Primary metric should be obvious (level? streak?)
- Secondary metrics support but don't compete

**Phase impact:** When adding level system prominence, ensure visual hierarchy is clear.

**Sources:** [Trio Gamification Role](https://trio.dev/the-role-of-gamification-in-mobile-apps/)

---

## Mascot Pitfalls

### Critical: Mascot Evolution Not Tied to Meaningful Milestones

**What goes wrong:** Mascot changes but users don't notice or care.

**Why it happens:** Evolution happens at arbitrary points, without celebration, or changes are too subtle.

**Warning signs:**
- Mascot changes without user being told
- Visual differences between evolutions too subtle
- No celebration moment when mascot evolves

**Prevention:**
- Tie evolution to level tiers (current: level 7 = Master, level 10 = Supermaster)
- Make visual differences obvious (not just color tweaks)
- Celebrate evolution with animation, sound, message
- Consider showing "Tri evolved!" moment on level-up

**Phase impact:** When expanding mascot tiers, ensure each evolution is visually distinct and celebrated.

---

### Moderate: Mascot Overload in Interface

**What goes wrong:** Mascot appears everywhere, feels gimmicky rather than endearing.

**Why it happens:** Desire to maximize mascot "value" by showing it constantly.

**Warning signs:**
- Mascot on every screen
- Mascot animations distract from primary task (quiz)
- Mascot commentary on every action

**Prevention:**
- Mascot has a "home" (home screen hero card)
- Appear at key moments: home, results, level-up
- During quiz: minimal or no mascot (focus on questions)
- Less is more - preserve specialness

**Phase impact:** Current placement (home screen) is appropriate. Be selective about adding more.

**Sources:** [Broworks Mascots in UI/UX](https://www.broworks.net/blog/mascots-and-memes-in-ui-ux-elements-of-personalized-design)

---

### Moderate: Mascot Asset Management Complexity

**What goes wrong:** Multiple mascot variants create asset management headache, inconsistent quality, bloated app size.

**Why it happens:** Each tier needs different mascot, each mood needs variant, combinations explode.

**Warning signs:**
- Current: 4 mascot images (neutral, happy, master, supermaster)
- Expanding to 5-6 tiers with moods = many more assets
- Different image sizes, qualities, formats

**Prevention:**
- Plan asset matrix before creating art
- Consistent dimensions and format
- Consider: Do all tiers need all moods? Or can moods be overlay effects?
- Audit bundle size impact

**Phase impact:** Plan mascot asset strategy before commissioning art. Matrix of tier x mood.

---

### Minor: Mascot Animation Performance

**What goes wrong:** Mascot animations cause frame drops, especially on older devices.

**Why it happens:** Complex animations, running continuously, not optimized.

**Warning signs:**
- Multiple simultaneous animations (breathe, float, glow in current TriMascot)
- Animations run even when not visible
- Using layout-affecting properties

**Prevention:**
- Current implementation uses transform (good) and opacity (good)
- Avoid animating layout properties (width, height, margin)
- Use `animate` prop to disable when not needed (already implemented)
- Test on older iPhone models

**Phase impact:** Current animation approach is sound. Maintain discipline when adding new animations.

**Sources:** [Reanimated Performance Docs](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/)

---

## UI Polish Pitfalls

### Critical: Inconsistent Component Styling Across Screens

**What goes wrong:** Each screen looks slightly different - different spacing, different card styles, different button variants.

**Why it happens:** Screens built at different times, by different people, or copy-paste with modifications.

**Warning signs:**
- PROJECT.md lists: Library, Progress, Settings screens need to match Home style
- Buttons have different padding or colors on different screens
- Cards have different border radius or shadows

**Prevention:**
- Audit all screens against design system tokens (Colors, Typography, Spacing, Radius, Shadows)
- Create shared components (Card, Button already exist)
- Don't inline styles - use StyleSheet.create with theme tokens
- Create visual inventory showing every screen side-by-side

**Phase impact:** This is the core of v2.0 polish. Systematic audit before changes.

**Sources:** [UI Consistency Principles](https://www.figma.com/resource-library/consistency-in-design/)

---

### Critical: Polish Breaks Functionality

**What goes wrong:** Visual changes inadvertently break interactions, animations, or layout.

**Why it happens:** CSS/style changes have unintended side effects. Not testing after visual changes.

**Warning signs:**
- Changing padding breaks touch targets
- Changing container styles breaks child layout
- Animation timing changes feel wrong

**Prevention:**
- Test every interaction after visual changes
- Keep style changes atomic - one component at a time
- Verify on multiple screen sizes
- Check both light mode (and dark mode if supported)

**Phase impact:** Test rigorously after each polish phase. Don't batch too many changes.

---

### Moderate: Platform-Specific UI Inconsistencies

**What goes wrong:** App looks good on one device, broken on another.

**Why it happens:** Testing only on simulator or single device size. iOS version differences.

**Warning signs:**
- Only testing on iPhone 15 Pro
- Not testing on SE (small screen)
- Not testing on older iOS versions

**Prevention:**
- Test on small (SE), medium (regular), large (Pro Max) screens
- Verify safe area handling
- Check on iOS 16, 17, and 18
- Current constraint: iOS 16+ iPhone only - but test range within that

**Phase impact:** Build device testing matrix for polish validation.

**Sources:** [React Native Platform Guidelines](https://www.infoq.com/articles/ios-android-react-native-design-patterns/)

---

### Moderate: Over-Polishing at Expense of Consistency

**What goes wrong:** Individual screens get unique styling that breaks system coherence.

**Why it happens:** Designer wants each screen to feel "special" or solves local problems without system thinking.

**Warning signs:**
- Home screen has card style A, Progress screen has card style B
- Custom one-off components instead of reusable ones
- Design debt accumulates

**Prevention:**
- If a screen needs something different, extend the design system, don't bypass it
- Every style decision should be: "Is this a new token, or should I use existing?"
- Document exceptions with rationale

**Phase impact:** Polish should unify, not diversify. Add tokens to theme.ts if needed.

---

### Minor: Animation Polish Overdone

**What goes wrong:** Too many animations make app feel sluggish or distracting.

**Why it happens:** Animations are fun to add, each seems small, cumulative effect is overwhelming.

**Warning signs:**
- Everything bounces, fades, slides
- User has to wait for animations to complete
- Animations on routine actions (not just celebrations)

**Prevention:**
- Reserve animation for meaningful moments: success, level-up, combo
- Keep routine interactions snappy (< 200ms)
- Test with animations disabled to ensure app is still usable
- Provide settings toggle for reduced motion (accessibility)

**Phase impact:** Current animations are purposeful. Maintain restraint when adding more.

---

## Cross-Cutting Pitfalls

### Critical: State Schema Migration Missing

**What goes wrong:** New features require new stored data, but existing users have old schema.

**Why it happens:** Adding new fields to StoredStats without migration logic.

**Warning signs:**
- Current StoredStats has defined fields
- New level system might need new fields
- Onboarding completion flag is new data

**Prevention:**
```typescript
// When loading stats, merge with defaults
const loaded = await loadStats();
return { ...DEFAULT_STATS, ...loaded };
```
- Current loadStats() already does this (good)
- Ensure DEFAULT_STATS includes all new fields
- Test with empty storage, partial storage, full storage

**Phase impact:** Every new feature should update DEFAULT_STATS and test migration.

**Sources:** [Expo AsyncStorage Docs](https://docs.expo.dev/versions/latest/sdk/async-storage/)

---

### Critical: Not Testing Update Path

**What goes wrong:** Fresh installs work fine, but updates from v1 to v2 break things.

**Why it happens:** Development always uses fresh installs. Real users have existing data.

**Warning signs:**
- Never testing with pre-existing AsyncStorage data
- Not simulating "existing user" scenarios
- Only testing happy path (new user flow)

**Prevention:**
- Create test data representing v1 user state
- Load this data before testing v2 features
- Test: existing user sees level correctly, doesn't see onboarding, mascot reflects progress

**Phase impact:** Create "migration testing" checklist for each feature.

---

### Moderate: Feature Flag Absence

**What goes wrong:** Shipping broken feature to all users with no way to disable.

**Why it happens:** No feature flag infrastructure, shipping all-or-nothing.

**Warning signs:**
- No way to roll back specific features
- No way to A/B test
- Bug in new feature affects all users

**Prevention:**
- Simple feature flags via AsyncStorage or config
- Not essential for v2.0 but valuable if issues arise
- At minimum, have "kill switch" strategy

**Phase impact:** Consider simple feature flag approach if scope expands.

---

### Moderate: Scope Creep During Polish

**What goes wrong:** "Polish" becomes "redesign" becomes "rebuild."

**Why it happens:** While polishing, notice other things that could be better. Each leads to another.

**Warning signs:**
- Polish phase timeline expanding
- "While we're here, let's also..." conversations
- Original screens become unrecognizable

**Prevention:**
- Clear definition of "done" for each screen
- Polish means: applying existing tokens, fixing inconsistencies
- Polish does not mean: new layouts, new components, new features
- Log "nice to have" items for future, don't do now

**Phase impact:** Define polish scope precisely. Resist scope creep.

---

### Minor: Bundle Size Growth

**What goes wrong:** New mascot images, animations, and features increase app size significantly.

**Why it happens:** Each asset seems small, but they accumulate.

**Warning signs:**
- Multiple mascot PNG files at high resolution
- Unused assets not cleaned up
- Not optimizing images

**Prevention:**
- Audit bundle size before and after changes
- Compress mascot images appropriately
- Consider vector formats if applicable
- Remove unused assets

**Phase impact:** Track bundle size as part of acceptance criteria.

---

## Reanimated-Specific Pitfalls

### Moderate: Shared Value Access on JS Thread

**What goes wrong:** Animations stutter or app hangs when reading shared values incorrectly.

**Why it happens:** Accessing `.value` property on JS thread instead of in worklet.

**Warning signs:**
- Using `sharedValue.value` in regular React code
- Not using `useAnimatedStyle` for style updates
- Mixing JS thread and UI thread logic

**Prevention:**
- Current TriMascot implementation is correct (uses useAnimatedStyle)
- Always access shared values in worklets or animated styles
- Review any new animation code for this pattern

**Phase impact:** Code review animation implementations for this anti-pattern.

**Sources:** [Reanimated Performance Guide](https://dev.to/erenelagz/react-native-reanimated-3-the-ultimate-guide-to-high-performance-animations-in-2025-4ae4)

---

### Moderate: New Architecture Performance Regression

**What goes wrong:** Animations that worked smoothly break after enabling New Architecture.

**Why it happens:** React Native's New Architecture has different performance characteristics with Reanimated.

**Warning signs:**
- Expo SDK 53+ enables New Architecture by default
- Animations jitter or drop frames
- Especially visible in scrolling scenarios

**Prevention:**
- Current Expo SDK 54 may be affected
- Test animations thoroughly
- If issues arise, check Reanimated version compatibility
- Some issues require React Native 0.81+ fixes

**Phase impact:** Monitor animation performance. Have fallback plan if New Architecture causes issues.

**Sources:** [Reanimated Performance Docs](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/)

---

## Summary

### Top 5 Pitfalls to Prevent in v2.0

| Priority | Pitfall | Prevention | Phase |
|----------|---------|------------|-------|
| 1 | Existing users see onboarding after update | Check for existing data, not just flag | Onboarding |
| 2 | Inconsistent UI across screens | Systematic audit against theme tokens | Polish |
| 3 | Level system feels meaningless | Distinct visual identity, celebration moments | Level System |
| 4 | Mascot evolution not celebrated | Tie to milestones, show evolution moment | Mascot |
| 5 | Breaking functionality during polish | Atomic changes, test every interaction | All phases |

### Phase-Specific Warnings

| Phase | Critical Pitfalls to Watch |
|-------|---------------------------|
| Onboarding | Existing user migration, completion state persistence |
| Level System | Meaningful progression, curve balancing |
| Mascot | Asset management, evolution celebration |
| UI Polish | Cross-screen consistency, not breaking functionality |

### Testing Checklist for Each Feature

- [ ] Fresh install works
- [ ] Update from v1 works (simulate existing user)
- [ ] Multiple device sizes tested
- [ ] Animations perform well
- [ ] State persists across app restart
- [ ] Theme tokens used consistently

### Key Sources

- [NN/g Mobile App Onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/) - Onboarding best practices
- [RevenueCat Gamification Guide](https://www.revenuecat.com/blog/growth/gamification-in-apps-complete-guide/) - Level system design
- [Reanimated Performance Docs](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/) - Animation pitfalls
- [Expo Store Data Docs](https://docs.expo.dev/develop/user-interface/store-data/) - Persistence patterns
- [Figma Design Consistency](https://www.figma.com/resource-library/consistency-in-design/) - UI polish principles
