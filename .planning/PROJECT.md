# MedTriads

## What This Is

A polished, progression-driven medical triad quiz app with 6-tier leveling, evolving mascot, and satisfying game-like feedback. Users see three clinical findings and must identify the corresponding condition before time runs out. Features scoring with speed bonuses and combo multipliers, tier-up celebrations, shareable result cards, new user onboarding, and a library for studying triads. Built with React Native/Expo for iOS.

## Core Value

Users can quickly test and reinforce their knowledge of medical triads through satisfying, game-like quiz sessions that make repetition feel rewarding rather than tedious.

## Requirements

### Validated

**v1.0 — MVP**
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

**v2.0 — Polish & Progression**
- ✓ Visual polish: All screens match Home visual language (8pt grid, card styles) — v2.0
- ✓ 6-tier progression system (Student → Chief) based on games played — v2.0
- ✓ TierProgressBar and TierBadge components — v2.0
- ✓ Tier-up celebrations with confetti and mascot transition — v2.0
- ✓ New user onboarding (3-page tutorial, only shows for gamesPlayed = 0) — v2.0
- ✓ Evolving mascot images per tier (6 unique images) — v2.0
- ✓ Share quiz results as styled image card — v2.0
- ✓ Quiz visual hierarchy (elevated symptoms, cleaner feedback) — v2.0
- ✓ Design system audit (CardStyle, consistent tokens) — v2.0
- ✓ Developer tools (__DEV__ only) for testing tier-ups and onboarding — v2.0
- ✓ Error boundaries and defensive validation — v2.0
- ✓ FlashList virtualization for Library — v2.0
- ✓ Image preloading for instant mascot display — v2.0

**v2.1 — Design System, Study Mode & App Store**
- ✓ Tokenized design system (colors, typography, spacing, radius, shadows, motion) — v2.1
- ✓ 7 UI primitives (Icon, Text, Surface, Button, Badge, Tag, Card) — v2.1
- ✓ Solar Icons via wrapper component with standardized sizes (16, 20, 24) — v2.1
- ✓ All screens migrated to design tokens exclusively — v2.1
- ✓ DESIGN_SYSTEM.md documentation (741 lines) — v2.1
- ✓ Study Mode with untimed quiz flow and calm blue theme — v2.1
- ✓ Explanations shown after each answer in Study Mode — v2.1
- ✓ "Mark as tricky" feature with list on Progress screen — v2.1
- ✓ Category mastery tracking per medical category — v2.1
- ✓ Category mastery cards displayed on Home screen — v2.1
- ✓ Challenge feature with competitive share cards — v2.1
- ✓ App Store configuration (app.json, eas.json) — v2.1
- ✓ Privacy policy and App Privacy questionnaire documented — v2.1
- ✓ App Store metadata (description, keywords, category, age rating) — v2.1
- ✓ Screenshot plan and release checklist created — v2.1

### Active

**v3.0 — Engagement & Polish**

**Goal:** Make the quiz experience smarter and more engaging with adaptive difficulty, spaced repetition, and daily challenges, while cleaning up accumulated technical debt.

**Target features:**
- [ ] Adaptive difficulty algorithm based on user performance
- [ ] Spaced repetition prompts for review at optimal intervals
- [ ] Daily challenges with streak rewards and special UI
- [ ] Technical debt cleanup (code quality, unused code, consistency)

### Out of Scope

- Deep link challenge URLs — app not live yet, defer until post-launch
- Challenge tracking/persistence — simple share card is enough for v2.1
- Reverse quiz mode (condition → findings) — consider for future
- User accounts and cloud sync — no backend
- Leaderboards — no backend
- Achievements / badges — level system covers progression adequately
- iPad / Mac support — iOS iPhone only
- Android — iOS first, Android later
- Monetization (ads, premium) — defer post-launch
- Animated mascots (Rive) — static images work well, v2.0 validated

## Context

**Current State (v2.1 shipped):**
- 124,012 lines of TypeScript across 26 phases (3 milestones)
- 45 medical triads across 10 categories
- Tech stack: Expo SDK 54, React Native, expo-router, react-native-reanimated, expo-audio, expo-image, @shopify/flash-list, react-native-view-shot, expo-sharing, @solar-icons/react-native
- 7 UI primitives with 3-layer design token architecture
- Study Mode with explanations and tricky question marking
- Category mastery tracking per medical category
- Challenge feature with competitive share cards
- App Store ready: privacy policy, metadata, screenshots documented
- **Ready for App Store submission** (user action: capture screenshots, host privacy policy, submit)

**Design System:**
- 3-layer token architecture: raw tokens → semantic theme → components
- 7 primitives: Icon, Text, Surface, Button, Badge, Tag, Card
- Solar Icons for unified iconography (21 files use Solar Icons)
- All screens use design tokens exclusively
- DESIGN_SYSTEM.md documentation (741 lines)

**Origin:** Boyfriend is a doctor, suggested the app idea. He can validate triad accuracy.

**Domain:** Medical education. Triads are fundamental diagnostic patterns tested in USMLE, COMLEX, and clinical practice.

**Target users:** Medical students, nursing students, PAs, clinicians seeking quick refreshers.

## Constraints

- **Platform:** iOS 16+ (iPhone only) — preparing for App Store submission
- **Tech stack:** React Native/Expo — cross-platform capability preserved for future
- **Storage:** AsyncStorage for local persistence — no backend
- **Content:** 45 triads across 10 medical categories
- **Design:** Figma is authoritative — no creative deviations without approval
- **Icons:** Solar Icons only via wrapper component — no mixed icon sets
- **Tokens:** All styles via design tokens — no hardcoded values

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
| 6 game-based tiers | Simpler than question-based mastery, more tangible | ✓ Good — engaging progression |
| Static mascot images | Rive animations added complexity, static works well | ✓ Good — reduced scope |
| FlashList for Library | 45+ items needs virtualization | ✓ Good — smooth scrolling |
| expo-image for mascot | Native caching, preloading support | ✓ Good — instant display |
| Error boundaries | Prevents crashes from reaching user | ✓ Good — graceful failures |
| __DEV__ dev tools | Test tier-ups without playing 200 games | ✓ Good — faster testing |

---
*Last updated: 2026-01-21 after v3.0 milestone started*
