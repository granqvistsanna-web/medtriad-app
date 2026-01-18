# Roadmap: MedTriads

## Milestones

- [x] **v1.0 MVP** - Phases 1-8 (shipped 2026-01-18)
- [ ] **v2.0 Polish & Progression** - Phases 9-15 (in progress)
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
- [ ] **Phase 10: Refine Visuals** - Tighten spacing, colors, micro-interactions
- [ ] **Phase 11: Level System** - 6 progression tiers with clear identity
- [ ] **Phase 12: Levels on Hero** - Show current tier prominently on Home screen
- [ ] **Phase 13: Onboarding** - New user introduction flow
- [ ] **Phase 14: Mascot Evolution** - Level-specific mascot images
- [ ] **Phase 15: Share Results** - Share score card after quiz

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

### Phase 10: Refine Visuals

**Goal**: Elevate overall visual quality with tighter details

**Depends on**: Phase 9

**Requirements**: VISREF-01, VISREF-02, VISREF-03

**Success Criteria**:
1. Consistent spacing system applied (8pt grid)
2. Color palette refined and documented
3. Micro-interactions added to buttons and cards
4. Typography hierarchy clear and consistent
5. All icons match in style and weight

---

### Phase 11: Level System

**Goal**: Users progress through 6 named tiers with clear visual identity

**Depends on**: Phase 10

**Requirements**: LEVL-01, LEVL-02, LEVL-03

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
2. Each tier has a distinct accent color
3. User can see current tier name and progress percentage toward next tier
4. Tier thresholds based on games played

---

### Phase 12: Levels on Hero

**Goal**: Current tier is prominently displayed on Home screen

**Depends on**: Phase 11

**Requirements**: HERO-01, HERO-02

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

**Success Criteria**:
1. Results screen has share button
2. Share generates styled image card with score, correct answers, tier
3. Mascot appears on share card
4. Share card includes subtle MedTriads branding
5. Native iOS share sheet opens with image

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
| 10. Refine Visuals | v2.0 | Not started | - |
| 11. Level System | v2.0 | Not started | - |
| 12. Levels on Hero | v2.0 | Not started | - |
| 13. Onboarding | v2.0 | Not started | - |
| 14. Mascot Evolution | v2.0 | Not started | - |
| 15. Share Results | v2.0 | Not started | - |

---

*Created: 2026-01-18*
*Last updated: 2026-01-18 after Phase 9 completion*
*Current milestone: v2.0 Polish & Progression*
