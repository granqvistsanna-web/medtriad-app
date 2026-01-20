# Requirements: MedTriads v2.1

**Defined:** 2026-01-20
**Core Value:** Users can quickly test and reinforce their knowledge of medical triads through satisfying, game-like quiz sessions

## v2.1 Requirements

### Design System

- [ ] **DS-01**: Token file with colors, typography, spacing, radius, shadows, motion values
- [ ] **DS-02**: Theme layer mapping semantic tokens (surface, text, brand, success, warning, danger)
- [ ] **DS-03**: Icon wrapper component using Solar Icons with standardized sizes (16, 20, 24)
- [ ] **DS-04**: Text primitive component using typography tokens
- [ ] **DS-05**: Surface primitive component using color and shadow tokens
- [ ] **DS-06**: Button component with all states (default, pressed, disabled, loading)
- [ ] **DS-07**: Badge component for status indicators
- [ ] **DS-08**: Tag component for labels and categories
- [ ] **DS-09**: Card component with consistent styling
- [ ] **DS-10**: All existing screens updated to use design tokens only
- [ ] **DS-11**: All existing icons replaced with Solar Icons via wrapper
- [ ] **DS-12**: DESIGN_SYSTEM.md documentation with tokens, rules, examples

### Study Mode

- [ ] **SM-01**: Study Mode entry point visible on Home screen
- [ ] **SM-02**: Untimed quiz flow with no countdown timer
- [ ] **SM-03**: Calm visual tone distinguishing from timed mode
- [ ] **SM-04**: Immediate feedback with explanation shown after each answer
- [ ] **SM-05**: Progress indicator showing questions completed
- [ ] **SM-06**: "Mark as tricky" button to flag questions for review
- [ ] **SM-07**: Per-topic session summary stored locally
- [ ] **SM-08**: Tricky questions list accessible from Library or Progress

### Challenge

- [ ] **CH-01**: "Challenge a Friend" button on Results screen
- [ ] **CH-02**: Styled share card showing score with competitive messaging
- [ ] **CH-03**: System share sheet integration for sharing

### Category Mastery

- [ ] **CM-01**: Track correct/incorrect answers per medical category
- [ ] **CM-02**: Category mastery data persisted locally
- [ ] **CM-03**: Category mastery cards displayed on Home screen
- [ ] **CM-04**: Visual progress indicator per category (progress bar or percentage)

### App Store

- [ ] **AS-01**: App icon at all required sizes including 1024x1024
- [ ] **AS-02**: Screenshots for required iPhone device sizes
- [ ] **AS-03**: Privacy policy URL prepared
- [ ] **AS-04**: App Privacy questionnaire answers documented
- [ ] **AS-05**: App Store description and keywords finalized
- [ ] **AS-06**: Category and age rating determined
- [ ] **AS-07**: Bundle ID and versioning finalized
- [ ] **AS-08**: Release checklist (no placeholders, no debug menus, crash-free)
- [ ] **AS-09**: PRIVACY_SUMMARY.md documenting data practices
- [ ] **AS-10**: SCREENSHOT_PLAN.md listing screens and device sizes

## v3.0 Requirements

Deferred to future release.

### Adaptive Learning

- **AL-01**: Adaptive difficulty based on user performance
- **AL-02**: Spaced repetition prompts for review
- **AL-03**: Personalized question selection

### Advanced Challenge

- **AC-01**: Deep link challenge URLs (medtriad://challenge/<payload>)
- **AC-02**: Challenge persistence and history
- **AC-03**: Universal link fallback for web

## Out of Scope

| Feature | Reason |
|---------|--------|
| Deep link challenges | App not live on App Store yet |
| Challenge tracking/history | Simple share card sufficient for v2.1 |
| User accounts | No backend |
| Cloud sync | No backend |
| Leaderboards | No backend |
| Reverse quiz mode | Defer to v3.0 |
| Daily challenges | Defer to v3.0 |
| iPad/Mac support | iPhone only |
| Android | iOS first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DS-01 | Phase 21 | Pending |
| DS-02 | Phase 21 | Pending |
| DS-03 | Phase 21 | Pending |
| DS-04 | Phase 21 | Pending |
| DS-05 | Phase 21 | Pending |
| DS-06 | Phase 21 | Pending |
| DS-07 | Phase 21 | Pending |
| DS-08 | Phase 21 | Pending |
| DS-09 | Phase 21 | Pending |
| DS-10 | Phase 22 | Pending |
| DS-11 | Phase 22 | Pending |
| DS-12 | Phase 22 | Pending |
| SM-01 | Phase 23 | Pending |
| SM-02 | Phase 23 | Pending |
| SM-03 | Phase 23 | Pending |
| SM-04 | Phase 23 | Pending |
| SM-05 | Phase 23 | Pending |
| SM-06 | Phase 23 | Pending |
| SM-07 | Phase 23 | Pending |
| SM-08 | Phase 23 | Pending |
| CM-01 | Phase 24 | Pending |
| CM-02 | Phase 24 | Pending |
| CM-03 | Phase 24 | Pending |
| CM-04 | Phase 24 | Pending |
| CH-01 | Phase 25 | Pending |
| CH-02 | Phase 25 | Pending |
| CH-03 | Phase 25 | Pending |
| AS-01 | Phase 26 | Pending |
| AS-02 | Phase 26 | Pending |
| AS-03 | Phase 26 | Pending |
| AS-04 | Phase 26 | Pending |
| AS-05 | Phase 26 | Pending |
| AS-06 | Phase 26 | Pending |
| AS-07 | Phase 26 | Pending |
| AS-08 | Phase 26 | Pending |
| AS-09 | Phase 26 | Pending |
| AS-10 | Phase 26 | Pending |

**Coverage:**
- v2.1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0

---
*Requirements defined: 2026-01-20*
*Last updated: 2026-01-20 after initial definition*
