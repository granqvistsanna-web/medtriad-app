# Roadmap: MedTriads v3.0

**Milestone:** v3.0 Engagement & Polish
**Created:** 2026-01-21
**Phases:** 5 (27-31)
**Requirements:** 26 total

## Overview

This milestone makes the quiz experience smarter and more engaging. Users get adaptive difficulty that learns their weak spots, spaced repetition prompts that bring back triads at optimal intervals, and daily challenges that reward consistent practice. The foundation is per-triad performance tracking, which enables all three learning features. Cleanup phase at the end addresses accumulated technical debt.

## Phases

### Phase 27: Data Foundation

**Goal:** App tracks individual triad performance to enable intelligent features

**Dependencies:** None (foundation phase)

**Requirements:**
- DATA-01: App tracks per-triad performance (correct/incorrect count, last seen date)
- DATA-02: App tracks response time for each answer
- DATA-03: Storage schema supports new fields without breaking existing user data

**Success Criteria:**
1. After answering a question, user's performance on that specific triad is recorded
2. User's historical accuracy per triad persists across app restarts
3. Existing user data (streaks, high scores, tier) remains intact after update
4. Response time for each answer is captured and stored

**Research flags:** None - AsyncStorage patterns already established in codebase

**Plans:** 1 plan
Plans:
- [x] 27-01-PLAN.md — Per-triad performance tracking types, storage service, and quiz integration

---

### Phase 28: Adaptive Difficulty

**Goal:** Quiz mode intelligently selects questions based on user's performance history

**Dependencies:** Phase 27 (requires per-triad tracking data)

**Requirements:**
- ADPT-01: Quiz mode prioritizes questions from user's weak categories
- ADPT-02: Quiz mode weights "tricky-marked" questions higher for selection
- ADPT-03: App classifies each triad as easy/medium/hard based on user's historical performance
- ADPT-04: Quiz difficulty adapts based on user's tier (higher tiers see harder questions)
- ADPT-05: Difficulty classification requires minimum 3 attempts before categorizing

**Success Criteria:**
1. User with poor Cardiology accuracy sees more Cardiology questions in Quiz Mode
2. Triads marked as "tricky" appear more frequently in quiz sessions
3. After 3+ attempts on a triad, user can see its difficulty classification (if exposed in UI)
4. Higher-tier users receive proportionally more "hard" triads than lower-tier users
5. New triads (fewer than 3 attempts) are distributed evenly regardless of difficulty

**Research flags:** None - Weighted random selection is well-documented

---

### Phase 29: Spaced Repetition

**Goal:** Users can review triads at optimal intervals for long-term retention

**Dependencies:** Phase 27 (requires per-triad tracking for scheduling)

**Requirements:**
- SR-01: Home screen shows "review due" indicator when triads need review
- SR-02: User can enter Review Mode to practice due triads
- SR-03: Review Mode is untimed (no countdown timer)
- SR-04: SM-2 algorithm schedules increasing intervals for mastered triads
- SR-05: Review intervals are capped at 14 days maximum to prevent content exhaustion
- SR-06: "Tricky-marked" triads have shorter review intervals
- SR-07: User can see how many triads are due for review

**Success Criteria:**
1. User sees badge/indicator on home screen when triads are due for review
2. User can tap to enter Review Mode and practice only due triads
3. Review Mode has no timer - user can take as long as needed per question
4. Correctly answered triads appear less frequently over time (increasing intervals)
5. Triads marked as "tricky" come up for review more often than mastered ones
6. User can see the count of triads currently due (e.g., "12 triads due")

**Research flags:** SM-2 edge cases, quality score mapping, review session UX

---

### Phase 30: Daily Challenges

**Goal:** Users have a compelling daily habit loop with special challenge content

**Dependencies:** Phase 27 (requires per-triad tracking), integrates with existing streak system

**Requirements:**
- DAILY-01: Home screen shows daily challenge card
- DAILY-02: Daily challenge questions are the same for all users each day (date-seeded)
- DAILY-03: Completing daily challenge counts toward existing streak
- DAILY-04: User earns streak freeze (1 available per week)
- DAILY-05: App celebrates streak milestones (7, 30, 100 days)
- DAILY-06: Daily challenges have type variants (speed round, category focus, full quiz)
- DAILY-07: User can only complete one daily challenge per day

**Success Criteria:**
1. User sees prominent daily challenge card on home screen
2. User completing daily challenge sees their streak increment
3. User with a streak freeze can miss one day without losing streak
4. User reaching 7, 30, or 100 day streak sees celebration animation
5. User sees different challenge types on different days (speed, category, full)
6. User who already completed today's challenge cannot play it again until tomorrow
7. Two users opening the app on the same day see the same challenge questions

**Research flags:** None - Streak mechanics well-documented from Duolingo studies

---

### Phase 31: Tech Debt Cleanup

**Goal:** Codebase is clean, consistent, and maintainable

**Dependencies:** Phases 27-30 (clean up after features are complete)

**Requirements:**
- DEBT-01: Audit codebase for unused code and remove it
- DEBT-02: Audit codebase for code style inconsistencies and fix them
- DEBT-03: Review component structure for opportunities to consolidate
- DEBT-04: Ensure all services follow consistent patterns

**Success Criteria:**
1. No unused exports, dead code paths, or orphaned components remain
2. Code style is consistent across all files (naming, formatting, patterns)
3. Similar components are consolidated (no duplicate implementations)
4. All service files follow the same structural pattern

**Research flags:** None - Standard code quality work

---

## Progress

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 27 | Data Foundation | DATA-01, DATA-02, DATA-03 | Complete |
| 28 | Adaptive Difficulty | ADPT-01, ADPT-02, ADPT-03, ADPT-04, ADPT-05 | Pending |
| 29 | Spaced Repetition | SR-01, SR-02, SR-03, SR-04, SR-05, SR-06, SR-07 | Pending |
| 30 | Daily Challenges | DAILY-01, DAILY-02, DAILY-03, DAILY-04, DAILY-05, DAILY-06, DAILY-07 | Pending |
| 31 | Tech Debt Cleanup | DEBT-01, DEBT-02, DEBT-03, DEBT-04 | Pending |

## Coverage

| Category | Requirements | Phase |
|----------|--------------|-------|
| Data Foundation | DATA-01, DATA-02, DATA-03 | 27 |
| Adaptive Difficulty | ADPT-01, ADPT-02, ADPT-03, ADPT-04, ADPT-05 | 28 |
| Spaced Repetition | SR-01, SR-02, SR-03, SR-04, SR-05, SR-06, SR-07 | 29 |
| Daily Challenges | DAILY-01, DAILY-02, DAILY-03, DAILY-04, DAILY-05, DAILY-06, DAILY-07 | 30 |
| Tech Debt | DEBT-01, DEBT-02, DEBT-03, DEBT-04 | 31 |

**Total:** 26/26 requirements mapped

---
*Roadmap created: 2026-01-21*
