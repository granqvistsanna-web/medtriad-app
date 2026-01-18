# Requirements: MedTriads

**Defined:** 2026-01-17
**Core Value:** Users can quickly test and reinforce their knowledge of medical triads through satisfying, game-like quiz sessions

## v1 Requirements

### Home Screen

- [x] **HOME-01**: User sees app logo and title
- [x] **HOME-02**: User can tap "Start Quiz" button to begin a round
- [x] **HOME-03**: User sees current daily streak with flame icon
- [x] **HOME-04**: User sees their high score
- [x] **HOME-05**: User sees total quizzes completed

### Quiz Flow

- [x] **QUIZ-01**: User sees three clinical findings displayed prominently
- [x] **QUIZ-02**: User sees four multiple-choice answer options
- [x] **QUIZ-03**: User sees progress indicator (question X of 10)
- [x] **QUIZ-04**: User sees current score and combo multiplier
- [x] **QUIZ-05**: User can tap an answer to submit their choice
- [x] **QUIZ-06**: After 10 questions, user is taken to results screen

### Timer

- [x] **TIME-01**: User sees 12-second countdown timer as circular ring
- [x] **TIME-02**: Timer ring changes color: blue -> yellow (< 5s) -> red (< 3s)
- [x] **TIME-03**: If timer expires, question counts as incorrect and auto-advances

### Scoring

- [x] **SCOR-01**: User earns 100 base points for correct answers
- [x] **SCOR-02**: User earns 0-50 speed bonus points (faster = more)
- [x] **SCOR-03**: User earns combo multiplier (1x -> 2x -> 3x) every 3 correct in a row
- [x] **SCOR-04**: User earns +500 bonus for perfect round (10/10)

### Feedback

- [x] **FEED-01**: Correct answer shows green highlight immediately
- [x] **FEED-02**: Incorrect answer shows red highlight and reveals correct answer
- [x] **FEED-03**: Brief pause (1.5s) after answer, then auto-advance
- [x] **FEED-04**: Haptic feedback on correct (light) and incorrect (medium)
- [ ] **FEED-05**: Sound effects for correct, incorrect, combo, and perfect round

### Animations

- [x] **ANIM-01**: Points float upward and fade when earned
- [x] **ANIM-02**: Combo multiplier pulses when it increases
- [ ] **ANIM-03**: Timer ring accelerates visually in final 3 seconds
- [ ] **ANIM-04**: Answer buttons scale slightly on press
- [ ] **ANIM-05**: Results score counts up from zero

### Results Screen

- [x] **RESU-01**: User sees final score with animated count-up
- [x] **RESU-02**: User sees questions correct (X/10)
- [x] **RESU-03**: User sees best streak achieved this round
- [x] **RESU-04**: User sees "New High Score" badge if applicable
- [x] **RESU-05**: User can tap "Play Again" to start new round
- [x] **RESU-06**: User can tap "Home" to return to home screen

### Data & Persistence

- [x] **DATA-01**: App loads triads from local JSON file (30-50 triads)
- [x] **DATA-02**: Distractors prefer same-category conditions
- [x] **DATA-03**: No duplicate distractors within a round
- [x] **DATA-04**: High score persists across sessions
- [x] **DATA-05**: Daily streak persists and calculates correctly
- [x] **DATA-06**: Total quizzes completed persists

### Navigation

- [ ] **NAV-01**: Bottom tab bar shows Home, Library, Progress icons
- [ ] **NAV-02**: Tab bar uses minimal iOS-style design (monochrome icons)
- [ ] **NAV-03**: Active tab is visually highlighted
- [ ] **NAV-04**: Navigation between tabs feels instant

### Library (Study Mode)

- [ ] **LIB-01**: User can browse all triads grouped by medical category
- [ ] **LIB-02**: User can tap a triad to view condition and all three findings

### Progress Screen

- [ ] **PROG-01**: User sees detailed stats (accuracy, total correct, category breakdown)
- [ ] **PROG-02**: User sees quiz history with recent rounds

### Settings

- [ ] **SETT-01**: User can toggle sound effects on/off
- [ ] **SETT-02**: User can toggle haptic feedback on/off
- [ ] **SETT-03**: Settings persist across app sessions

### Share

- [ ] **SHAR-01**: User can share app via iOS share sheet

## v2 Requirements

### Category Selection

- **CATS-01**: User can filter triads by medical category
- **CATS-02**: User can see category-specific statistics

### Study Mode

- **STUD-01**: User can browse all triads in library view
- **STUD-02**: User can see explanation for each triad
- **STUD-03**: User can mark triads as "learned" or "needs review"

### Additional Quiz Modes

- **MODE-01**: Reverse mode (condition -> select findings)
- **MODE-02**: Complete the triad (two findings -> select third)

### Social & Engagement

- **SOCL-01**: User accounts with cloud sync
- **SOCL-02**: Leaderboards
- **SOCL-03**: Achievements / badges
- **SOCL-04**: Daily challenges

### Platform Expansion

- **PLAT-01**: Android support
- **PLAT-02**: iPad support
- **PLAT-03**: Mac support

## Out of Scope

| Feature | Reason |
|---------|--------|
| Monetization (ads, premium) | Focus on user value first, monetize post-launch |
| Backend/cloud sync | Local-only sufficient for MVP quiz app |
| User accounts | Adds complexity, not needed for core value |
| Leaderboards | Requires backend infrastructure |
| Web version | Mobile-first, iOS priority |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOME-01 | Phase 3 | Complete |
| HOME-02 | Phase 3 | Complete |
| HOME-03 | Phase 3 | Complete |
| HOME-04 | Phase 3 | Complete |
| HOME-05 | Phase 3 | Complete |
| QUIZ-01 | Phase 2 | Complete |
| QUIZ-02 | Phase 2 | Complete |
| QUIZ-03 | Phase 2 | Complete |
| QUIZ-04 | Phase 2 | Complete |
| QUIZ-05 | Phase 2 | Complete |
| QUIZ-06 | Phase 2 | Complete |
| TIME-01 | Phase 2 | Complete |
| TIME-02 | Phase 4 | Complete |
| TIME-03 | Phase 4 | Complete |
| SCOR-01 | Phase 4 | Complete |
| SCOR-02 | Phase 4 | Complete |
| SCOR-03 | Phase 4 | Complete |
| SCOR-04 | Phase 4 | Complete |
| FEED-01 | Phase 5 | Complete |
| FEED-02 | Phase 5 | Complete |
| FEED-03 | Phase 5 | Complete |
| FEED-04 | Phase 5 | Complete |
| FEED-05 | Phase 7 | Pending |
| ANIM-01 | Phase 4 | Complete |
| ANIM-02 | Phase 4 | Complete |
| ANIM-03 | Phase 7 | Pending |
| ANIM-04 | Phase 7 | Pending |
| ANIM-05 | Phase 7 | Pending |
| NAV-01 | Phase 6 | Pending |
| NAV-02 | Phase 6 | Pending |
| NAV-03 | Phase 6 | Pending |
| NAV-04 | Phase 6 | Pending |
| LIB-01 | Phase 6 | Pending |
| LIB-02 | Phase 6 | Pending |
| PROG-01 | Phase 6 | Pending |
| PROG-02 | Phase 6 | Pending |
| SETT-01 | Phase 6 | Pending |
| SETT-02 | Phase 6 | Pending |
| SETT-03 | Phase 6 | Pending |
| SHAR-01 | Phase 6 | Pending |
| RESU-01 | Phase 3 | Complete |
| RESU-02 | Phase 3 | Complete |
| RESU-03 | Phase 3 | Complete |
| RESU-04 | Phase 3 | Complete |
| RESU-05 | Phase 3 | Complete |
| RESU-06 | Phase 3 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 5 | Complete |
| DATA-05 | Phase 5 | Complete |
| DATA-06 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0

---
*Requirements defined: 2026-01-17*
*Last updated: 2026-01-18 (Settings and Share requirements added)*
