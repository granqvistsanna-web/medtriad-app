# Roadmap: MedTriads v2.1

**Created:** 2026-01-20
**Phases:** 6 (Phases 21-26)
**Requirements:** 37

## Milestones

- v1.0 MVP - Phases 1-8 (shipped 2026-01-18)
- v2.0 Polish & Progression - Phases 9-20 (shipped 2026-01-20)
- v2.1 Design System, Study Mode & App Store - Phases 21-26 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-8) - SHIPPED 2026-01-18</summary>

See archived roadmap for details.

</details>

<details>
<summary>v2.0 Polish & Progression (Phases 9-20) - SHIPPED 2026-01-20</summary>

See archived roadmap for details.

</details>

### v2.1 Design System, Study Mode & App Store

**Milestone Goal:** Establish a consistent design system, add a relaxed Study Mode for learning, enable social sharing via Challenge, track category mastery, and prepare for App Store submission.

---

## Phase 21: Design System Foundation

**Goal:** Establish the token-based design system with reusable primitives that all future UI work builds upon.

**Depends on:** v2.0 complete

**Requirements:**
- DS-01: Token file with colors, typography, spacing, radius, shadows, motion values
- DS-02: Theme layer mapping semantic tokens
- DS-03: Icon wrapper component using Solar Icons
- DS-04: Text primitive component
- DS-05: Surface primitive component
- DS-06: Button component with all states
- DS-07: Badge component
- DS-08: Tag component
- DS-09: Card component

**Success Criteria:**
- [x] All design tokens are defined in a single source of truth file
- [x] Primitive components (Text, Surface, Button, Badge, Tag, Card) render consistently using tokens
- [x] Icon wrapper displays Solar Icons at standardized sizes (16, 20, 24)
- [x] Button shows correct visual states (default, pressed, disabled, loading)
- [x] New components can be built using only primitives and tokens (no hardcoded values)

**Plans:** 4 plans

Plans:
- [x] 21-01-PLAN.md — Install dependencies and create three-layer token system
- [x] 21-02-PLAN.md — Font loading, Icon wrapper, Surface primitive
- [x] 21-03-PLAN.md — Text primitive and Button with loading state
- [x] 21-04-PLAN.md — Badge, Tag, and Card primitives

---

## Phase 22: Design System Application

**Goal:** Migrate all existing screens and icons to use the new design system, ensuring visual consistency across the app.

**Depends on:** Phase 21

**Requirements:**
- DS-10: All existing screens updated to use design tokens only
- DS-11: All existing icons replaced with Solar Icons via wrapper
- DS-12: DESIGN_SYSTEM.md documentation

**Success Criteria:**
- [x] Every screen uses design tokens exclusively (no hardcoded colors, spacing, or typography)
- [x] All icons throughout the app are Solar Icons rendered via the Icon wrapper
- [x] DESIGN_SYSTEM.md documents all tokens, component APIs, and usage examples
- [x] Visual regression check passes (app looks consistent and polished)

**Plans:** 5 plans

Plans:
- [x] 22-01-PLAN.md — Add missing tokens and migrate tab bar icons to Solar Icons
- [x] 22-02-PLAN.md — Migrate simple screens (Settings, Onboarding, Modal)
- [x] 22-03-PLAN.md — Migrate medium screens (Home, Library, Progress)
- [x] 22-04-PLAN.md — Migrate complex screen (Quiz and Results)
- [x] 22-05-PLAN.md — DESIGN_SYSTEM.md documentation and cleanup

---

## Phase 23: Study Mode

**Goal:** Users can practice medical triads in a relaxed, untimed mode with explanations and the ability to flag tricky questions.

**Depends on:** Phase 22

**Requirements:**
- SM-01: Study Mode entry point visible on Home screen
- SM-02: Untimed quiz flow with no countdown timer
- SM-03: Calm visual tone distinguishing from timed mode
- SM-04: Immediate feedback with explanation shown after each answer
- SM-05: Progress indicator showing questions completed
- SM-06: "Mark as tricky" button to flag questions for review
- SM-07: Per-topic session summary stored locally
- SM-08: Tricky questions list accessible from Library or Progress

**Success Criteria:**
- [x] User can tap Study Mode button on Home and start an untimed quiz session
- [x] User sees explanation text after answering each question (correct or incorrect)
- [x] User can mark any question as "tricky" during the session
- [x] User can view their tricky questions list from Library or Progress screen
- [x] Study Mode has a visually calm, distinct appearance from timed quiz mode

**Plans:** 3 plans

Plans:
- [x] 23-01-PLAN.md — Types, reducer, and storage service foundation
- [x] 23-02-PLAN.md — Study screen and components (ExplanationCard, TrickyButton, StudyHeader)
- [x] 23-03-PLAN.md — Results screen, tricky list, and entry point wiring

---

## Phase 24: Category Mastery

**Goal:** Users can see their progress per medical category, helping them identify strengths and weaknesses.

**Depends on:** Phase 22

**Requirements:**
- CM-01: Track correct/incorrect answers per medical category
- CM-02: Category mastery data persisted locally
- CM-03: Category mastery cards displayed on Home screen
- CM-04: Visual progress indicator per category

**Success Criteria:**
- [ ] Each quiz answer updates the corresponding category's correct/incorrect count
- [ ] Category mastery data persists across app restarts
- [ ] Home screen displays category mastery cards showing progress for each category
- [ ] Each category card shows a visual progress indicator (bar or percentage)

**Plans:** 2 plans

Plans:
- [ ] 24-01-PLAN.md — Add categoryMastery to stats storage and useStats hook
- [ ] 24-02-PLAN.md — Track categories in quiz and connect Home screen to real data

---

## Phase 25: Challenge

**Goal:** Users can challenge friends by sharing their quiz results with a styled share card.

**Depends on:** Phase 22

**Requirements:**
- CH-01: "Challenge a Friend" button on Results screen
- CH-02: Styled share card showing score with competitive messaging
- CH-03: System share sheet integration

**Success Criteria:**
- [ ] Results screen shows "Challenge a Friend" button after completing a quiz
- [ ] Tapping the button generates a visually styled share card with score and competitive text
- [ ] System share sheet opens allowing sharing via Messages, social apps, etc.

**Plans:** TBD

---

## Phase 26: App Store Preparation

**Goal:** All assets, metadata, and documentation are ready for App Store submission.

**Depends on:** Phases 21-25

**Requirements:**
- AS-01: App icon at all required sizes
- AS-02: Screenshots for required iPhone device sizes
- AS-03: Privacy policy URL prepared
- AS-04: App Privacy questionnaire answers documented
- AS-05: App Store description and keywords finalized
- AS-06: Category and age rating determined
- AS-07: Bundle ID and versioning finalized
- AS-08: Release checklist completed
- AS-09: PRIVACY_SUMMARY.md documenting data practices
- AS-10: SCREENSHOT_PLAN.md listing screens and device sizes

**Success Criteria:**
- [ ] App icon displays correctly at all sizes (including 1024x1024 for App Store)
- [ ] Screenshots exist for all required iPhone sizes and show key app features
- [ ] Privacy policy is accessible via URL and PRIVACY_SUMMARY.md documents all data practices
- [ ] App Store Connect metadata (description, keywords, category, age rating) is finalized
- [ ] Release checklist confirms: no placeholders, no debug menus, crash-free startup

**Plans:** TBD

---

## Progress

**Execution Order:** 21 -> 22 -> 23 -> 24 -> 25 -> 26

Note: Phases 23 and 24 can run in parallel after Phase 22 completes (both depend on design system but not each other).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 21. Design System Foundation | 4/4 | ✓ Complete | 2026-01-20 |
| 22. Design System Application | 5/5 | ✓ Complete | 2026-01-20 |
| 23. Study Mode | 3/3 | ✓ Complete | 2026-01-20 |
| 24. Category Mastery | 0/2 | Planned | - |
| 25. Challenge | 0/TBD | Not started | - |
| 26. App Store Preparation | 0/TBD | Not started | - |

## Coverage

| Category | Requirements | Phase |
|----------|--------------|-------|
| Design System Foundation | DS-01, DS-02, DS-03, DS-04, DS-05, DS-06, DS-07, DS-08, DS-09 | 21 |
| Design System Application | DS-10, DS-11, DS-12 | 22 |
| Study Mode | SM-01, SM-02, SM-03, SM-04, SM-05, SM-06, SM-07, SM-08 | 23 |
| Category Mastery | CM-01, CM-02, CM-03, CM-04 | 24 |
| Challenge | CH-01, CH-02, CH-03 | 25 |
| App Store | AS-01, AS-02, AS-03, AS-04, AS-05, AS-06, AS-07, AS-08, AS-09, AS-10 | 26 |

**Total:** 37 requirements mapped to 6 phases
**Unmapped:** 0

---
*Roadmap created: 2026-01-20*
*Phase 21 planned: 2026-01-20*
*Phase 21 complete: 2026-01-20*
*Phase 22 planned: 2026-01-20*
*Phase 22 complete: 2026-01-20*
*Phase 23 planned: 2026-01-20*
*Phase 23 complete: 2026-01-20*
*Phase 24 planned: 2026-01-20*
