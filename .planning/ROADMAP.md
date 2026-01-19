# Roadmap: MedTriads

## Milestones

- [x] **v1.0 MVP** - Phases 1-8 (shipped 2026-01-18)
- [ ] **v2.0 Polish & Progression** - Phases 9-19 (in progress)
- [ ] **v3.0 Engagement** - Future

## Phases

<details>
<summary>v1.0 MVP (Phases 1-8) - SHIPPED 2026-01-18</summary>

Phases 1-8 delivered the complete MVP: quiz gameplay with timer and scoring,
library browsing, progress tracking, settings, and all core animations/sounds.
44 requirements satisfied across 18 plans.

</details>

### v2.0 Polish & Progression (In Progress)

**Milestone Goal:** Transform MedTriads from functional MVP to polished,
progression-driven experience with consistent UI, engaging level tiers,
evolving mascot, smooth onboarding, and shareability.

- [x] **Phase 9: UI Polish** - Consistent visual style across all screens
- [x] **Phase 10: Refine Visuals & Motion** - Tighten spacing, colors, polished motion
- [x] **Phase 11: Level System** - 6 progression tiers with clear identity
- [x] **Phase 12: Levels on Hero** - Show current tier prominently on Home screen
- [x] **Phase 13: Onboarding** - New user introduction flow
- [x] **Phase 14: Mascot Evolution** - Level-specific mascot images
- [x] **Phase 15: Share Results** - Share score card after quiz
- [ ] **Phase 16: Quiz Mode UX** - Improve visual hierarchy, remove distractions, no-scroll layout
- [ ] **Phase 17: Developer Tools** - Debug onboarding and app states
- [ ] **Phase 18: Error Handling** - Graceful failures throughout the app
- [ ] **Phase 19: Performance** - Smooth, responsive experience

---

## Phase Details

### Phase 9: UI Polish

**Goal**: All screens share the Home screen's polished visual language

**Depends on**: Phase 8

**Requirements**: UIPOL-01, UIPOL-02, UIPOL-03, UIPOL-04

**Plans:** 4 plans

Plans:
- [x] 09-01-PLAN.md — Library screen polish (padding, animations)
- [x] 09-02-PLAN.md — Progress screen polish (cards, section headers, animations)
- [x] 09-03-PLAN.md — Settings screen polish (section headers, animations)
- [x] 09-04-PLAN.md — Quiz screen polish (main area padding)

**Success Criteria**:
1. Library screen uses same spacing, colors, and typography as Home
2. Progress screen uses same card styles and layout patterns as Home
3. Settings screen uses same toggle and section styling as Home
4. Quiz screen uses consistent button styles and color tokens

---

### Phase 10: Refine Visuals & Motion

**Goal**: Elevate overall visual quality with tighter details and polished motion

**Depends on**: Phase 9

**Requirements**: VISREF-01, VISREF-02, VISREF-03, VISREF-04

**Success Criteria**:

*Spacing & Layout (verified from Phase 9)*
1. Consistent spacing system applied (8pt grid) — theme.ts defines complete 8pt grid
2. Generous negative space, nothing cramped — applied during Phase 9 polish
3. Elements aligned with clear visual hierarchy — established in Phase 9

*Color & Typography*
4. Color palette refined and documented
5. Typography hierarchy clear and consistent — documented, applied in Phase 9
6. All icons match in style and weight — SF Symbols used consistently

*Motion & Micro-interactions*
7. Buttons have subtle scale/opacity on press
8. Cards lift gently on tap
9. Score and points animate with staggered reveals
10. Timer has fluid countdown animation
11. Combo multiplier pulses on increase
12. Results score counts up with easing

*Deferred to Phase 14 (Mascot Evolution)*
- Mascot idle breathing animation — already implemented, enhanced in Phase 14
- Tier-up celebration motion — requires level system from Phase 11

**Motion Principles**:
- Prioritize high-impact moments over scattered effects
- Easing on everything — no linear motion
- Staggered delays for grouped elements
- Motion should feel soft, weighted, physical
- Nothing snaps — everything settles

---

### Phase 11: Level System

**Goal**: Users progress through 6 named tiers with clear visual identity

**Depends on**: Phase 10

**Requirements**: LEVL-01, LEVL-02, LEVL-03

**Plans:** 2 plans

Plans:
- [x] 11-01-PLAN.md — Core tier logic, useStats hook, TierProgressBar component
- [x] 11-02-PLAN.md — Progress and Results screen integration

**Tier Definitions**:

| Tier | Name | Games Played |
|------|------|--------------|
| 1 | Student | 0 |
| 2 | Intern | 10 |
| 3 | Resident | 25 |
| 4 | Doctor | 50 |
| 5 | Specialist | 100 |
| 6 | Chief | 200 |

**Success Criteria**:
1. App displays 6 named progression tiers
2. Each tier has name-based visual distinction (shared accent color per CONTEXT.md)
3. User can see current tier name and progress bar toward next tier
4. Tier thresholds based on games played

---

### Phase 12: Levels on Hero

**Goal**: Current tier is prominently displayed on Home screen

**Depends on**: Phase 11

**Requirements**: HERO-01, HERO-02

**Plans:** 1 plan

Plans:
- [x] 12-01-PLAN.md — TierBadge, TierSection components, HeroCard integration

**Success Criteria**:
1. Home screen hero area shows current tier name
2. Progress bar or indicator shows progress to next tier
3. Tier badge or icon visible alongside mascot
4. Tier color reflected in hero area accent

---

### Phase 13: Onboarding

**Goal**: New users understand triads and scoring before first quiz

**Depends on**: Phase 12

**Requirements**: ONBD-01, ONBD-02, ONBD-03

**Plans:** 1 plan

Plans:
- [x] 13-01-PLAN.md — Root layout guards, onboarding screen with pagination

**Success Criteria**:
1. User with gamesPlayed = 0 sees onboarding on app launch
2. User with gamesPlayed > 0 never sees onboarding
3. Onboarding has 2-3 screens explaining triads and scoring
4. User can skip onboarding at any point via visible skip button
5. Mascot appears in onboarding screens

---

### Phase 14: Mascot Evolution

**Goal**: Mascot visually evolves as user progresses through tiers

**Depends on**: Phase 13

**Requirements**: MASC-01, MASC-02

**Plans:** 3 plans

Plans:
- [x] 14-01-PLAN.md — Tier-based mascot foundation (checkTierUp helper, TIER_IMAGES map, tier prop)
- [x] 14-02-PLAN.md — Tier-up detection and celebration (pendingTierUp storage, TierUpCelebration component)
- [x] 14-03-PLAN.md — Catch-up celebration on Home (glow effect for missed tier-ups)

**Mascot Accessories by Tier**:

| Tier | Name | Mascot Accessory |
|------|------|------------------|
| 1 | Student | None |
| 2 | Intern | Bandaid |
| 3 | Resident | Clipboard |
| 4 | Doctor | Stethoscope |
| 5 | Specialist | Head mirror |
| 6 | Chief | Gold badge |

**Success Criteria**:
1. Different mascot image displays for each tier
2. Mascot visible on Home screen reflecting current tier
3. Mascot changes immediately when user reaches new tier
4. Tier-up moment has celebration animation

---

### Phase 15: Share Results

**Goal**: Users can share their quiz results as an image card

**Depends on**: Phase 14

**Requirements**: SHARE-01, SHARE-02, SHARE-03

**Plans:** 2 plans

Plans:
- [x] 15-01-PLAN.md — Core share infrastructure (dependencies, ShareCard component, useShareCard hook)
- [x] 15-02-PLAN.md — Results screen integration (share button, hidden capture card)

**Success Criteria**:
1. Results screen has share button
2. Share generates styled image card with score, correct answers, tier
3. Mascot appears on share card
4. Share card includes subtle MedTriads branding
5. Native iOS share sheet opens with image

---

### Phase 16: Quiz Mode UX

**Goal**: Improve quiz visual hierarchy and remove distractions

**Depends on**: Phase 15

**Requirements**: QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05

**Plans:** 1 plan

Plans:
- [ ] 16-01-PLAN.md — Visual hierarchy, feedback system, layout refinements

**Success Criteria**:
1. Symptoms card visually elevated from answer options
2. "IDENTIFY THE TRIAD" label above symptoms
3. Remove "Correct!"/"Incorrect!" text feedback at bottom
4. Answer feedback via button color only
5. All content fits on screen without scrolling
6. Dynamic layout adapts to screen sizes

---

### Phase 17: Developer Tools

**Goal**: Enable efficient testing and debugging

**Depends on**: Phase 16

**Requirements**: DEV-01, DEV-02, DEV-03, DEV-04

**Success Criteria**:
1. Dev menu only accessible in DEBUG builds
2. Reset onboarding without reinstalling
3. Set user to any level for testing
4. Clear all user data with confirmation
5. Simulate error states for testing

---

### Phase 18: Error Handling

**Goal**: App never crashes, fails gracefully

**Depends on**: Phase 17

**Requirements**: ERR-01, ERR-02, ERR-03, ERR-04

**Success Criteria**:
1. All asset loads have fallbacks
2. UserDefaults access never crashes
3. Invalid state clamped to valid ranges
4. User-friendly error messages (no technical jargon)
5. App never crashes from data issues

---

### Phase 19: Performance

**Goal**: Smooth, responsive experience

**Depends on**: Phase 18

**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04

**Success Criteria**:
1. Cold launch < 1.5s to interactive
2. Quiz loads instantly (< 100ms)
3. No dropped frames during animations
4. Memory stays under 100MB
5. Smooth on oldest supported device

---

## v3.0 Engagement (Future)

Ideas parked for future development:

- [ ] Category filtering (quiz by system)
- [ ] Daily challenge mode
- [ ] Streak rewards and milestones
- [ ] Widgets for streak/progress
- [ ] Haptic & sound refinement
- [ ] Advanced animations

---

## Progress

| Phase | Milestone | Status | Completed |
|-------|-----------|--------|-----------|
| 1-8 | v1.0 | Complete | 2026-01-18 |
| 9. UI Polish | v2.0 | Complete | 2026-01-18 |
| 10. Refine Visuals & Motion | v2.0 | Complete | 2026-01-18 |
| 11. Level System | v2.0 | Complete | 2026-01-19 |
| 12. Levels on Hero | v2.0 | Complete | 2026-01-19 |
| 13. Onboarding | v2.0 | Complete | 2026-01-19 |
| 14. Mascot Evolution | v2.0 | Complete | 2026-01-19 |
| 15. Share Results | v2.0 | Complete | 2026-01-19 |
| 16. Quiz Mode UX | v2.0 | Not started | - |
| 17. Developer Tools | v2.0 | Not started | - |
| 18. Error Handling | v2.0 | Not started | - |
| 19. Performance | v2.0 | Not started | - |

---

*Created: 2026-01-18*
*Last updated: 2026-01-19 - Phase 16 planned*
*Current milestone: v2.0 Polish & Progression*
