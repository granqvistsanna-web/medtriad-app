# Requirements: MedTriads v3.0

**Defined:** 2026-01-21
**Core Value:** Users can quickly test and reinforce their knowledge of medical triads through satisfying, game-like quiz sessions

## v3.0 Requirements

Requirements for v3.0 Engagement & Polish milestone. Each maps to roadmap phases.

### Data Foundation

- [x] **DATA-01**: App tracks per-triad performance (correct/incorrect count, last seen date)
- [x] **DATA-02**: App tracks response time for each answer
- [x] **DATA-03**: Storage schema supports new fields without breaking existing user data

### Adaptive Difficulty

- [ ] **ADPT-01**: Quiz mode prioritizes questions from user's weak categories
- [ ] **ADPT-02**: Quiz mode weights "tricky-marked" questions higher for selection
- [ ] **ADPT-03**: App classifies each triad as easy/medium/hard based on user's historical performance
- [ ] **ADPT-04**: Quiz difficulty adapts based on user's tier (higher tiers see harder questions)
- [ ] **ADPT-05**: Difficulty classification requires minimum 3 attempts before categorizing

### Spaced Repetition

- [ ] **SR-01**: Home screen shows "review due" indicator when triads need review
- [ ] **SR-02**: User can enter Review Mode to practice due triads
- [ ] **SR-03**: Review Mode is untimed (no countdown timer)
- [ ] **SR-04**: SM-2 algorithm schedules increasing intervals for mastered triads
- [ ] **SR-05**: Review intervals are capped at 14 days maximum to prevent content exhaustion
- [ ] **SR-06**: "Tricky-marked" triads have shorter review intervals
- [ ] **SR-07**: User can see how many triads are due for review

### Daily Challenges

- [ ] **DAILY-01**: Home screen shows daily challenge card
- [ ] **DAILY-02**: Daily challenge questions are the same for all users each day (date-seeded)
- [ ] **DAILY-03**: Completing daily challenge counts toward existing streak
- [ ] **DAILY-04**: User earns streak freeze (1 available per week)
- [ ] **DAILY-05**: App celebrates streak milestones (7, 30, 100 days)
- [ ] **DAILY-06**: Daily challenges have type variants (speed round, category focus, full quiz)
- [ ] **DAILY-07**: User can only complete one daily challenge per day

### Tech Debt

- [ ] **DEBT-01**: Audit codebase for unused code and remove it
- [ ] **DEBT-02**: Audit codebase for code style inconsistencies and fix them
- [ ] **DEBT-03**: Review component structure for opportunities to consolidate
- [ ] **DEBT-04**: Ensure all services follow consistent patterns

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTIF-01**: User receives push notification when triads are due for review
- **NOTIF-02**: User can configure notification preferences

### Advanced Challenges

- **ADV-01**: Weekly challenges with leaderboard
- **ADV-02**: Challenge friends via deep link
- **ADV-03**: Achievement badges for challenge completion

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Deep link challenge URLs | App not live on App Store yet |
| Push notifications | Keep first version simple; add after validating core features |
| Self-rating (Again/Hard/Good/Easy) | Binary correct/incorrect is sufficient for 45 triads |
| FSRS algorithm | Overkill for small content pool; SM-2 is sufficient |
| Mid-quiz difficulty adjustment | Feels unfair; adjust between sessions only |
| Separate challenge streak | Creates cognitive overhead; integrate with existing streak |
| Leaderboards | No backend; defer to future |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 27 | Complete |
| DATA-02 | Phase 27 | Complete |
| DATA-03 | Phase 27 | Complete |
| ADPT-01 | Phase 28 | Pending |
| ADPT-02 | Phase 28 | Pending |
| ADPT-03 | Phase 28 | Pending |
| ADPT-04 | Phase 28 | Pending |
| ADPT-05 | Phase 28 | Pending |
| SR-01 | Phase 29 | Pending |
| SR-02 | Phase 29 | Pending |
| SR-03 | Phase 29 | Pending |
| SR-04 | Phase 29 | Pending |
| SR-05 | Phase 29 | Pending |
| SR-06 | Phase 29 | Pending |
| SR-07 | Phase 29 | Pending |
| DAILY-01 | Phase 30 | Pending |
| DAILY-02 | Phase 30 | Pending |
| DAILY-03 | Phase 30 | Pending |
| DAILY-04 | Phase 30 | Pending |
| DAILY-05 | Phase 30 | Pending |
| DAILY-06 | Phase 30 | Pending |
| DAILY-07 | Phase 30 | Pending |
| DEBT-01 | Phase 31 | Pending |
| DEBT-02 | Phase 31 | Pending |
| DEBT-03 | Phase 31 | Pending |
| DEBT-04 | Phase 31 | Pending |

**Coverage:**
- v3.0 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after initial definition*
