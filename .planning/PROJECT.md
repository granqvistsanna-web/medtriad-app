# MedTriads

## What This Is

A timed multiple-choice quiz app that transforms medical triad memorization into an engaging, game-like experience. Users see three clinical findings and must identify the corresponding condition before time runs out. Built with React Native/Expo for iOS, targeting App Store release.

## Core Value

Users can quickly test and reinforce their knowledge of medical triads through satisfying, game-like quiz sessions that make repetition feel rewarding rather than tedious.

## Requirements

### Validated

- ✓ Expo/React Native project structure — existing
- ✓ File-based routing with expo-router — existing
- ✓ Theme system (light/dark mode) — existing
- ✓ Haptic feedback infrastructure — existing
- ✓ Animation support (react-native-reanimated) — existing

### Active

- [ ] Home screen with Start Quiz button, streak indicator, high score display
- [ ] Quiz screen with timer, findings card, four answer buttons
- [ ] Results screen with score, correct count, streak, play again option
- [ ] 12-second countdown timer with visual feedback (color changes)
- [ ] Scoring system: base points, speed bonus, combo multiplier
- [ ] Immediate answer feedback (green/red) with auto-advance
- [ ] 10 questions per round
- [ ] Distractor selection algorithm (prefer same category)
- [ ] Local persistence: high score, streak, total quizzes, last played date
- [ ] 30-50 triads covering major medical systems
- [ ] Sound effects for correct/incorrect/combo/perfect round
- [ ] Animations: points float up, combo pulse, timer acceleration, score count-up

### Out of Scope

- Category filtering / selection — defer to v2
- Study / library mode — defer to v2
- Reverse quiz mode (condition → findings) — defer to v2
- User accounts and cloud sync — defer to v2
- Leaderboards — defer to v2
- Achievements / badges — defer to v2
- Daily challenges — defer to v2
- iPad / Mac support — iOS iPhone only for MVP
- Android — iOS first, Android later
- Monetization (ads, premium) — defer post-launch

## Context

**Origin:** Boyfriend is a doctor, suggested the app idea. He can validate triad accuracy.

**Domain:** Medical education. Triads are fundamental diagnostic patterns tested in USMLE, COMLEX, and clinical practice. Current study methods are passive (flashcards, textbooks).

**Target users:** Medical students, nursing students, PAs, clinicians seeking quick refreshers.

**Content:** User will research and compile 30-50 triads for MVP across categories: Cardiology, Neurology, GI, Pulmonology, Endocrinology, Rheumatology, Infectious Disease, MSK, Other.

**Existing codebase:** Expo SDK 54 starter template with TypeScript, expo-router, react-native-reanimated, expo-haptics. Template code will be replaced with app screens.

## Constraints

- **Platform:** iOS 16+ (iPhone only for MVP) — PRD specifies iOS-first, Expo supports this
- **Tech stack:** React Native/Expo — existing codebase, cross-platform capability preserved for future
- **Storage:** AsyncStorage/expo-secure-store for local persistence — no backend for MVP
- **Content:** 30-50 triads minimum — user researching these

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native over SwiftUI | Existing Expo codebase, cross-platform future potential | — Pending |
| No backend for MVP | Simplify scope, local-only is sufficient for quiz app | — Pending |
| iOS-first (no Android MVP) | Focus resources, match PRD scope | — Pending |
| 12-second timer | PRD spec, balances challenge vs frustration | — Pending |
| 10 questions per round | PRD spec, ~2 minute sessions | — Pending |

---
*Last updated: 2026-01-17 after initialization*
