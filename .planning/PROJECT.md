# MedTriads

## What This Is

A timed multiple-choice quiz app that transforms medical triad memorization into an engaging, game-like experience. Users see three clinical findings and must identify the corresponding condition before time runs out. Features scoring with speed bonuses and combo multipliers, full progress tracking, and a library for studying triads. Built with React Native/Expo for iOS.

## Core Value

Users can quickly test and reinforce their knowledge of medical triads through satisfying, game-like quiz sessions that make repetition feel rewarding rather than tedious.

## Requirements

### Validated

- ✓ Expo/React Native project structure — v1.0
- ✓ File-based routing with expo-router — v1.0
- ✓ Theme system (light/dark mode) — v1.0
- ✓ Haptic feedback infrastructure — v1.0
- ✓ Animation support (react-native-reanimated) — v1.0
- ✓ Home screen with Start Quiz button, streak indicator, high score display — v1.0
- ✓ Quiz screen with timer, findings card, four answer buttons — v1.0
- ✓ Results screen with score, correct count, streak, play again option — v1.0
- ✓ 12-second countdown timer with visual feedback (color changes) — v1.0
- ✓ Scoring system: base points, speed bonus, combo multiplier — v1.0
- ✓ Immediate answer feedback (green/red) with auto-advance — v1.0
- ✓ 10 questions per round — v1.0
- ✓ Distractor selection algorithm (prefer same category) — v1.0
- ✓ Local persistence: high score, streak, total quizzes, last played date — v1.0
- ✓ 45 triads covering major medical systems — v1.0
- ✓ Sound effects for correct/incorrect/combo/perfect round — v1.0
- ✓ Animations: points float up, combo pulse, timer acceleration, score count-up — v1.0
- ✓ 4-tab navigation (Home, Library, Progress, Settings) — v1.0
- ✓ Library screen with category browsing and triad details — v1.0
- ✓ Progress screen with stats and quiz history — v1.0
- ✓ Settings screen with sound/haptics toggles — v1.0
- ✓ Share functionality via iOS share sheet — v1.0

### Active

**v2.0 — Polish & Progression**

- [ ] Visual polish: Library screen matches Home style
- [ ] Visual polish: Progress screen matches Home style
- [ ] Visual polish: Settings screen matches Home style
- [ ] Visual polish: Quiz screen matches Home style
- [ ] Level system: Engaging tier names (5-6 tiers)
- [ ] Level system: Visual identity per tier
- [ ] Mascot evolution: Different mascot image per level tier
- [ ] Onboarding: 2-3 screens explaining triads and scoring

### Out of Scope

- Category filtering / selection — defer to v3
- Reverse quiz mode (condition → findings) — defer to v3
- User accounts and cloud sync — defer to v3
- Leaderboards — defer to v3
- Achievements / badges — level system covers progression for v2
- Daily challenges — defer to v3
- iPad / Mac support — iOS iPhone only
- Android — iOS first, Android later
- Monetization (ads, premium) — defer post-launch

## Context

**Current State (v1.0 shipped):**
- 86,116 lines of TypeScript across 8 phases
- 45 medical triads across 10 categories
- Tech stack: Expo SDK 54, React Native, expo-router, react-native-reanimated, expo-audio
- All 44 v1 requirements satisfied
- Tech debt addressed in Phase 8 (haptics integration, orphaned exports removed)

**Origin:** Boyfriend is a doctor, suggested the app idea. He can validate triad accuracy.

**Domain:** Medical education. Triads are fundamental diagnostic patterns tested in USMLE, COMLEX, and clinical practice.

**Target users:** Medical students, nursing students, PAs, clinicians seeking quick refreshers.

## Constraints

- **Platform:** iOS 16+ (iPhone only for MVP) — PRD specifies iOS-first
- **Tech stack:** React Native/Expo — cross-platform capability preserved for future
- **Storage:** AsyncStorage for local persistence — no backend for MVP
- **Content:** 45 triads across 10 medical categories

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native over SwiftUI | Existing Expo codebase, cross-platform future potential | ✓ Good — fast development |
| No backend for MVP | Simplify scope, local-only is sufficient for quiz app | ✓ Good — shipped quickly |
| iOS-first (no Android MVP) | Focus resources, match PRD scope | ✓ Good — shipped on time |
| 12-second timer | PRD spec, balances challenge vs frustration | ✓ Good — feels right |
| 10 questions per round | PRD spec, ~2 minute sessions | ✓ Good — quick sessions |
| Tuple type for findings | Enforces exactly 3 findings at compile time | ✓ Good — type safety |
| Same-category distractors | Educational value — plausible wrong answers | ✓ Good — more challenging |
| Quadratic speed bonus | Front-loaded rewards for fast answers | ✓ Good — rewards skill |
| Combo tier at 3/6 correct | Achievable progression, not too easy | ✓ Good — engaging |
| useHaptics hook pattern | Consistent with useSoundEffects, respects settings | ✓ Good — clean integration |
| 50-entry quiz history limit | Prevents unbounded storage growth | ✓ Good — practical limit |

---
*Last updated: 2026-01-18 after v2.0 milestone start*
