# Requirements: MedTriads v2.0

**Defined:** 2026-01-18
**Core Value:** Users can quickly test and reinforce their knowledge of medical triads through satisfying, game-like quiz sessions

## v2.0 Requirements

Requirements for Polish & Progression release.

### UI Polish

- [x] **UIPOL-01**: Library screen matches Home screen style (spacing, colors, typography)
- [x] **UIPOL-02**: Progress screen matches Home screen style
- [x] **UIPOL-03**: Settings screen matches Home screen style
- [x] **UIPOL-04**: Quiz screen matches Home screen style

### Visual Refinement & Motion

- [x] **VISREF-01**: Consistent spacing system applied (8pt grid)
- [x] **VISREF-02**: Color palette refined and documented
- [x] **VISREF-03**: Micro-interactions added to buttons and cards
- [x] **VISREF-04**: Polished motion throughout (transitions, reveals, celebrations)

### Level System

- [x] **LEVL-01**: App has 6 named progression tiers with clear thresholds
- [x] **LEVL-02**: Each tier has visual distinction (unique color and name)
- [x] **LEVL-03**: User can see progress toward next level

### Hero Display

- [x] **HERO-01**: Home screen hero area shows current tier name and progress
- [x] **HERO-02**: Tier badge or icon visible alongside mascot

### Onboarding

- [x] **ONBD-01**: User can skip onboarding at any point
- [x] **ONBD-02**: Onboarding only shows for new users (gamesPlayed = 0)
- [x] **ONBD-03**: Onboarding has 2-3 screens explaining triads and scoring

### Mascot

- [x] **MASC-01**: Different mascot image displays for each level tier
- [x] **MASC-02**: Mascot is visible on Home screen

### Share Results

- [ ] **SHARE-01**: Results screen has share button
- [ ] **SHARE-02**: Share generates styled image card with score, tier, and mascot
- [ ] **SHARE-03**: Native iOS share sheet opens with image

## v3.0 Requirements

Deferred to future release.

### Gameplay
- **GAME-01**: Category filtering / selection for quizzes
- **GAME-02**: Reverse quiz mode (condition → findings)
- **GAME-03**: Daily challenges

### Social
- **SOCL-01**: User accounts and cloud sync
- **SOCL-02**: Leaderboards

### Platform
- **PLAT-01**: iPad / Mac support
- **PLAT-02**: Android support

## Out of Scope

| Feature | Reason |
|---------|--------|
| Achievements / badges | Level system covers progression for v2 |
| Monetization | Defer post-launch |
| OAuth / social login | Local-only for now |
| Animated mascots (Rive) | Static images sufficient, saves complexity |
| User-customizable avatars | Not aligned with medical education focus |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UIPOL-01 | Phase 9 | Complete |
| UIPOL-02 | Phase 9 | Complete |
| UIPOL-03 | Phase 9 | Complete |
| UIPOL-04 | Phase 9 | Complete |
| VISREF-01 | Phase 10 | Complete |
| VISREF-02 | Phase 10 | Complete |
| VISREF-03 | Phase 10 | Complete |
| VISREF-04 | Phase 10 | Complete |
| LEVL-01 | Phase 11 | Complete |
| LEVL-02 | Phase 11 | Complete |
| LEVL-03 | Phase 11 | Complete |
| HERO-01 | Phase 12 | Complete |
| HERO-02 | Phase 12 | Complete |
| ONBD-01 | Phase 13 | Complete |
| ONBD-02 | Phase 13 | Complete |
| ONBD-03 | Phase 13 | Complete |
| MASC-01 | Phase 14 | Pending |
| MASC-02 | Phase 14 | Pending |
| SHARE-01 | Phase 15 | Pending |
| SHARE-02 | Phase 15 | Pending |
| SHARE-03 | Phase 15 | Pending |

**Coverage:**
- v2.0 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-18*
*Last updated: 2026-01-19 after Phase 13 completion*
