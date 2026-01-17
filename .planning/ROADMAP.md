# Roadmap: MedTriads

## Overview

MedTriads is built in six phases that mirror the natural development order of a quiz app: data models first, then core quiz mechanics, followed by complete screen flow, game mechanics (scoring and timer), feedback systems, and finally polish (animations and sounds). Each phase delivers a testable capability, building toward the complete game-like quiz experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Data Foundation** - Triads data model, JSON content, question generation
- [ ] **Phase 2: Quiz Core** - Basic quiz flow with questions, answers, and progression
- [ ] **Phase 3: Screen Flow** - Home screen with stats, results screen with summary
- [ ] **Phase 4: Game Mechanics** - Scoring system, timer with color transitions
- [ ] **Phase 5: Feedback & Persistence** - Answer feedback, haptics, data persistence
- [ ] **Phase 6: Polish** - Animations, sound effects, final refinements

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
**Plans**: TBD

Plans:
- [ ] 02-01: Quiz screen layout and findings display
- [ ] 02-02: Answer options and tap handling
- [ ] 02-03: Progress tracking and round completion

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
**Plans**: TBD

Plans:
- [ ] 03-01: Home screen UI and navigation
- [ ] 03-02: Results screen UI and navigation
- [ ] 03-03: Quiz state management and flow integration

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
**Plans**: TBD

Plans:
- [ ] 04-01: Scoring system implementation
- [ ] 04-02: Timer with color transitions and timeout handling

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
**Plans**: TBD

Plans:
- [ ] 05-01: Visual answer feedback
- [ ] 05-02: Haptic feedback integration
- [ ] 05-03: AsyncStorage persistence layer

### Phase 6: Polish
**Goal**: Animations and sounds create satisfying, game-like experience
**Depends on**: Phase 5
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, FEED-05
**Success Criteria** (what must be TRUE):
  1. Points float upward and fade when earned
  2. Combo multiplier pulses visually when it increases
  3. Timer ring accelerates visually in final 3 seconds
  4. Answer buttons scale slightly on press
  5. Results screen score counts up from zero with animation
  6. Sound effects play for correct, incorrect, combo increase, and perfect round
**Plans**: TBD

Plans:
- [ ] 06-01: Points and combo animations
- [ ] 06-02: Timer and button animations
- [ ] 06-03: Sound effects integration

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation | 2/2 | Complete | 2026-01-17 |
| 2. Quiz Core | 0/3 | Not started | - |
| 3. Screen Flow | 0/3 | Not started | - |
| 4. Game Mechanics | 0/2 | Not started | - |
| 5. Feedback & Persistence | 0/3 | Not started | - |
| 6. Polish | 0/3 | Not started | - |

---
*Roadmap created: 2026-01-17*
*Last updated: 2026-01-17 (Phase 1 complete)*
