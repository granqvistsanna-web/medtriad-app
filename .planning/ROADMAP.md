# Roadmap: MedTriads

## Overview

MedTriads is built in seven phases that mirror the natural development order of a quiz app: data models first, then core quiz mechanics, followed by complete screen flow, game mechanics (scoring and timer), feedback systems, navigation with study mode, and finally polish (animations and sounds). Each phase delivers a testable capability, building toward the complete game-like quiz experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Data Foundation** - Triads data model, JSON content, question generation
- [x] **Phase 2: Quiz Core** - Basic quiz flow with questions, answers, and progression
- [x] **Phase 3: Screen Flow** - Home screen with stats, results screen with summary
- [x] **Phase 4: Game Mechanics** - Scoring system, timer with color transitions
- [x] **Phase 5: Feedback & Persistence** - Answer feedback, haptics, data persistence
- [ ] **Phase 6: Navigation & Study Mode** - Bottom tab bar, Library screen, Progress screen
- [ ] **Phase 7: Polish** - Animations, sound effects, final refinements

## Phase Details

### Phase 1: Data Foundation
**Goal**: App has structured triad data and can generate valid quiz questions
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Triads JSON file exists with 30-50 medical triads organized by category
  2. Each triad has condition name, three findings, and category
  3. Question generator produces 4 answer options with same-category distractors preferred
  4. No duplicate distractors appear in a single question's options
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md - TypeScript types, triads JSON data (35-45 triads), shuffle utility
- [x] 01-02-PLAN.md - Question generator with same-category distractor preference

### Phase 2: Quiz Core
**Goal**: User can play through a complete 10-question quiz round
**Depends on**: Phase 1
**Requirements**: QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, QUIZ-06, TIME-01
**Success Criteria** (what must be TRUE):
  1. User sees three clinical findings displayed for each question
  2. User sees four tappable answer options for each question
  3. User sees progress indicator showing question X of 10
  4. User sees current score and combo display (values can be static for now)
  5. Tapping an answer advances to the next question
  6. After question 10, quiz ends (navigation to results can be placeholder)
  7. Timer ring displays counting down from 12 seconds
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md - Quiz state types, useQuizReducer hook, useCountdownTimer hook
- [x] 02-02-PLAN.md - Quiz navigation routes, complete quiz screen, temporary start button

### Phase 3: Screen Flow
**Goal**: Complete navigation flow between Home, Quiz, and Results screens
**Depends on**: Phase 2
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, RESU-01, RESU-02, RESU-03, RESU-04, RESU-05, RESU-06
**Success Criteria** (what must be TRUE):
  1. Home screen shows app logo and title
  2. User can tap Start Quiz to navigate to quiz screen
  3. Home screen displays streak, high score, and total quizzes (can be 0 initially)
  4. Results screen shows final score, correct count (X/10), and best streak
  5. Results screen shows "New High Score" badge when applicable
  6. User can tap Play Again to start new quiz round
  7. User can tap Home to return to home screen
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md - Home screen with branding, stats display, and Start Quiz button
- [x] 03-02-PLAN.md - Results screen with score, stats, badge, and navigation buttons

### Phase 4: Game Mechanics
**Goal**: Scoring and timer systems create engaging gameplay pressure
**Depends on**: Phase 3
**Requirements**: SCOR-01, SCOR-02, SCOR-03, SCOR-04, TIME-02, TIME-03
**Success Criteria** (what must be TRUE):
  1. User earns 100 base points for each correct answer
  2. User earns speed bonus (0-50 points) based on remaining time
  3. Combo multiplier increases every 3 correct answers in a row (1x to 2x to 3x)
  4. User earns +500 bonus for perfect 10/10 round
  5. Timer ring changes color: blue normally, yellow under 5 seconds, red under 3 seconds
  6. Timer expiration counts as incorrect answer and auto-advances
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md - Scoring service, reducer extension, speed bonus and combo tier logic
- [x] 04-02-PLAN.md - Timer color transitions, floating points, combo pulse, cancel button

### Phase 5: Feedback & Persistence
**Goal**: User receives clear feedback on answers and progress persists across sessions
**Depends on**: Phase 4
**Requirements**: FEED-01, FEED-02, FEED-03, FEED-04, DATA-04, DATA-05, DATA-06
**Success Criteria** (what must be TRUE):
  1. Correct answer button shows green highlight immediately
  2. Incorrect answer button shows red highlight and correct answer is revealed
  3. Brief pause (1.5 seconds) occurs after answer, then auto-advances
  4. Haptic feedback fires on answer (light for correct, medium for incorrect)
  5. High score persists and displays correctly after app restart
  6. Daily streak persists and increments correctly on consecutive days
  7. Total quizzes completed persists and increments after each round
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Visual answer feedback (faded state, thick borders, 1.5s delay)
- [x] 05-02-PLAN.md — Haptic feedback refinement (consistent Light style)
- [x] 05-03-PLAN.md — Data persistence (high score, daily streak, total quizzes)

### Phase 6: Navigation & Study Mode
**Goal**: Users can navigate between app sections, study triads, customize settings, and share the app
**Depends on**: Phase 5
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, LIB-01, LIB-02, PROG-01, PROG-02, SETT-01, SETT-02, SETT-03, SHAR-01
**Success Criteria** (what must be TRUE):
  1. Bottom tab bar shows 4 icons (Home, Library, Progress, Settings)
  2. Tab bar uses minimal iOS-style design matching app aesthetic
  3. Library screen displays all triads grouped by category
  4. User can tap a triad to view condition name and all three findings
  5. Progress screen shows detailed stats (accuracy, category breakdown)
  6. Progress screen shows quiz history with recent rounds
  7. Settings screen allows toggling sounds on/off
  8. Settings screen allows toggling haptics on/off
  9. User can share app via iOS share sheet from Settings or Home
  10. Navigation feels instant with no loading states between tabs
**Plans**: 4 plans

Plans:
- [ ] 06-01-PLAN.md — Tab bar navigation structure (4 tabs with icons)
- [ ] 06-02-PLAN.md — Library screen with triad browsing (accordion categories)
- [ ] 06-03-PLAN.md — Progress screen with stats and history
- [ ] 06-04-PLAN.md — Settings screen with toggles and share

### Phase 7: Polish
**Goal**: Animations and sounds create satisfying, game-like experience
**Depends on**: Phase 6
**Requirements**: ANIM-03, ANIM-04, ANIM-05, FEED-05
**Success Criteria** (what must be TRUE):
  1. Timer ring accelerates visually in final 3 seconds
  2. Answer buttons scale slightly on press
  3. Results screen score counts up from zero with animation
  4. Sound effects play for correct, incorrect, combo increase, and perfect round
**Plans**: TBD

Plans:
- [ ] 07-01: Timer and button animations
- [ ] 07-02: Results animations and sound effects

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation | 2/2 | Complete | 2026-01-17 |
| 2. Quiz Core | 2/2 | Complete | 2026-01-18 |
| 3. Screen Flow | 2/2 | Complete | 2026-01-18 |
| 4. Game Mechanics | 2/2 | Complete | 2026-01-18 |
| 5. Feedback & Persistence | 3/3 | Complete | 2026-01-18 |
| 6. Navigation & Study Mode | 0/4 | Not started | - |
| 7. Polish | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-17*
*Last updated: 2026-01-18 (Phase 6 plans created)*
