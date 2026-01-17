# Requirements: MedTriads

**Defined:** 2026-01-17
**Core Value:** Users can quickly test and reinforce their knowledge of medical triads through satisfying, game-like quiz sessions

## v1 Requirements

### Home Screen

- [ ] **HOME-01**: User sees app logo and title
- [ ] **HOME-02**: User can tap "Start Quiz" button to begin a round
- [ ] **HOME-03**: User sees current daily streak with flame icon
- [ ] **HOME-04**: User sees their high score
- [ ] **HOME-05**: User sees total quizzes completed

### Quiz Flow

- [ ] **QUIZ-01**: User sees three clinical findings displayed prominently
- [ ] **QUIZ-02**: User sees four multiple-choice answer options
- [ ] **QUIZ-03**: User sees progress indicator (question X of 10)
- [ ] **QUIZ-04**: User sees current score and combo multiplier
- [ ] **QUIZ-05**: User can tap an answer to submit their choice
- [ ] **QUIZ-06**: After 10 questions, user is taken to results screen

### Timer

- [ ] **TIME-01**: User sees 12-second countdown timer as circular ring
- [ ] **TIME-02**: Timer ring changes color: blue → yellow (< 5s) → red (< 3s)
- [ ] **TIME-03**: If timer expires, question counts as incorrect and auto-advances

### Scoring

- [ ] **SCOR-01**: User earns 100 base points for correct answers
- [ ] **SCOR-02**: User earns 0-50 speed bonus points (faster = more)
- [ ] **SCOR-03**: User earns combo multiplier (1x → 2x → 3x) every 3 correct in a row
- [ ] **SCOR-04**: User earns +500 bonus for perfect round (10/10)

### Feedback

- [ ] **FEED-01**: Correct answer shows green highlight immediately
- [ ] **FEED-02**: Incorrect answer shows red highlight and reveals correct answer
- [ ] **FEED-03**: Brief pause (1.5s) after answer, then auto-advance
- [ ] **FEED-04**: Haptic feedback on correct (light) and incorrect (medium)
- [ ] **FEED-05**: Sound effects for correct, incorrect, combo, and perfect round

### Animations

- [ ] **ANIM-01**: Points float upward and fade when earned
- [ ] **ANIM-02**: Combo multiplier pulses when it increases
- [ ] **ANIM-03**: Timer ring accelerates visually in final 3 seconds
- [ ] **ANIM-04**: Answer buttons scale slightly on press
- [ ] **ANIM-05**: Results score counts up from zero

### Results Screen

- [ ] **RESU-01**: User sees final score with animated count-up
- [ ] **RESU-02**: User sees questions correct (X/10)
- [ ] **RESU-03**: User sees best streak achieved this round
- [ ] **RESU-04**: User sees "New High Score" badge if applicable
- [ ] **RESU-05**: User can tap "Play Again" to start new round
- [ ] **RESU-06**: User can tap "Home" to return to home screen

### Data & Persistence

- [ ] **DATA-01**: App loads triads from local JSON file (30-50 triads)
- [ ] **DATA-02**: Distractors prefer same-category conditions
- [ ] **DATA-03**: No duplicate distractors within a round
- [ ] **DATA-04**: High score persists across sessions
- [ ] **DATA-05**: Daily streak persists and calculates correctly
- [ ] **DATA-06**: Total quizzes completed persists

## v2 Requirements

### Category Selection

- **CATS-01**: User can filter triads by medical category
- **CATS-02**: User can see category-specific statistics

### Study Mode

- **STUD-01**: User can browse all triads in library view
- **STUD-02**: User can see explanation for each triad
- **STUD-03**: User can mark triads as "learned" or "needs review"

### Additional Quiz Modes

- **MODE-01**: Reverse mode (condition → select findings)
- **MODE-02**: Complete the triad (two findings → select third)

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
| HOME-01 | TBD | Pending |
| HOME-02 | TBD | Pending |
| HOME-03 | TBD | Pending |
| HOME-04 | TBD | Pending |
| HOME-05 | TBD | Pending |
| QUIZ-01 | TBD | Pending |
| QUIZ-02 | TBD | Pending |
| QUIZ-03 | TBD | Pending |
| QUIZ-04 | TBD | Pending |
| QUIZ-05 | TBD | Pending |
| QUIZ-06 | TBD | Pending |
| TIME-01 | TBD | Pending |
| TIME-02 | TBD | Pending |
| TIME-03 | TBD | Pending |
| SCOR-01 | TBD | Pending |
| SCOR-02 | TBD | Pending |
| SCOR-03 | TBD | Pending |
| SCOR-04 | TBD | Pending |
| FEED-01 | TBD | Pending |
| FEED-02 | TBD | Pending |
| FEED-03 | TBD | Pending |
| FEED-04 | TBD | Pending |
| FEED-05 | TBD | Pending |
| ANIM-01 | TBD | Pending |
| ANIM-02 | TBD | Pending |
| ANIM-03 | TBD | Pending |
| ANIM-04 | TBD | Pending |
| ANIM-05 | TBD | Pending |
| RESU-01 | TBD | Pending |
| RESU-02 | TBD | Pending |
| RESU-03 | TBD | Pending |
| RESU-04 | TBD | Pending |
| RESU-05 | TBD | Pending |
| RESU-06 | TBD | Pending |
| DATA-01 | TBD | Pending |
| DATA-02 | TBD | Pending |
| DATA-03 | TBD | Pending |
| DATA-04 | TBD | Pending |
| DATA-05 | TBD | Pending |
| DATA-06 | TBD | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 0
- Unmapped: 32

---
*Requirements defined: 2026-01-17*
*Last updated: 2026-01-17 after initial definition*
