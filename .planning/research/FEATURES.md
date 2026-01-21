# Features Research: v3.0 Engagement

**Project:** MedTriads
**Domain:** Medical education quiz app with gamification
**Researched:** 2026-01-21
**Mode:** Features (Ecosystem)

## Summary

This research examines three engagement features for MedTriads: adaptive difficulty, spaced repetition, and daily challenges. The app already has strong foundations: tier-based difficulty scaling (timer reduction), category mastery tracking, "mark as tricky" functionality, and daily streak tracking. New features should integrate with these systems rather than duplicate them.

**Key insight:** MedTriads' existing tier system already provides a form of adaptive difficulty (timer decreases with tier). True adaptive difficulty would mean question selection based on performance, not just timing changes. Spaced repetition is the highest-value addition given the "mark as tricky" feature already exists. Daily challenges are straightforward to implement using existing infrastructure.

## Adaptive Difficulty

### How It Typically Works

Adaptive difficulty in educational quiz apps operates on a simple principle: adjust content based on performance.

**Common implementations:**

1. **Question Selection (most common):** If user answers correctly, serve harder questions. If incorrect, serve easier questions. Requires questions tagged with difficulty levels.

2. **Time Pressure (already implemented in MedTriads):** Reduce time per question as user progresses. MedTriads already does this via tier-based timers (15s -> 8s).

3. **Performance Tracking:** Systems track accuracy per topic/category and prioritize weak areas. MedTriads already has `categoryMastery` tracking.

4. **Hybrid Approaches:** BoardVitals NCLEX uses Computer Adaptive Testing (CAT) that adjusts question difficulty after each answer, recalculating user ability level continuously.

### Table Stakes

Features users expect if "adaptive difficulty" is advertised:

| Feature | Why Expected | Complexity | Existing Foundation |
|---------|--------------|------------|---------------------|
| **Prioritize weak categories** | Users expect practice on areas they struggle with | Low | `categoryMastery` already tracks correct/total per category |
| **Mix difficulty within quizzes** | Prevents frustration (too hard) or boredom (too easy) | Medium | Would need difficulty tags on triads |
| **Performance-aware question selection** | Core adaptive expectation | Medium | `generateQuestionSet` currently random |
| **Progress visibility** | Users want to see why they're getting certain questions | Low | Category mastery UI exists |

### Differentiators

Features that would set MedTriads apart:

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **"Tricky" question prioritization** | Questions marked as tricky appear more frequently in Quiz Mode | Low | `TrickyQuestion[]` storage exists, just need to weight selection |
| **Category-aware difficulty** | Different effective difficulty per category (user may be expert in cardiology, novice in neurology) | Medium | Extends existing mastery data |
| **Confidence tracking** | Track not just correct/incorrect but response time and second-guessing | High | Would need UI changes for "are you sure?" |
| **Diagnostic mode** | Pre-quiz assessment to set initial difficulty | Medium | One-time 10-question calibration |

### Anti-Features

Things to deliberately NOT build:

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Fixed difficulty levels (Easy/Medium/Hard)** | Creates friction ("which should I choose?"), fragments content | Use adaptive selection automatically |
| **Punishing difficulty spikes** | Users who answer 3 correctly shouldn't suddenly face impossible questions | Gradual transitions, not jumps |
| **Hidden algorithms** | Users shouldn't feel manipulated | Show "focusing on weak areas" messaging |
| **Over-complex ML models** | Overkill for 45 triads, hard to debug | Use simple rule-based logic: prioritize low-mastery categories + tricky questions |
| **Difficulty that affects scoring** | Creates unfair comparisons | Keep scoring consistent regardless of question difficulty |

### Recommended Approach for MedTriads

Given 45 triads (small pool) and existing mastery tracking:

1. **Lightweight adaptive selection:** Weight question pool by (a) low category mastery, (b) "tricky" flag. No need for per-question difficulty tags.
2. **Keep existing tier timer system:** This already provides progression difficulty.
3. **Surface the logic:** Show users "Focusing on Neurology (your weakest)" in quiz intro.

**Confidence: MEDIUM** - Based on patterns from UWorld, BoardVitals, MedMatrix. Simpler approaches work for small question pools.

---

## Spaced Repetition

### How It Typically Works

Spaced repetition schedules reviews at increasing intervals based on recall success. Core principle: review items just before you forget them.

**Algorithm families:**

1. **Leitner System (simplest):** 5 boxes, correct answers move cards forward (longer intervals), incorrect answers return to box 1. Intervals: 1, 2, 4, 8, 16 days.

2. **SM-2 (Anki default until 2023):** Uses "ease factor" per card, adjusts intervals based on self-reported recall quality (Again/Hard/Good/Easy).

3. **FSRS (Free Spaced Repetition Scheduler):** Modern algorithm using difficulty, stability, and retrievability. 30% more efficient than SM-2. Available in TypeScript via `ts-fsrs` or `simple-ts-fsrs`.

**For quiz apps (vs flashcard apps):** Users don't rate their own recall - the app determines correct/incorrect. This simplifies implementation (binary signal).

### Table Stakes

Features users expect from spaced repetition:

| Feature | Why Expected | Complexity | Existing Foundation |
|---------|--------------|------------|---------------------|
| **"Review due" indicator** | Users need to know when to practice | Low | Would add to home screen |
| **Prioritize forgotten items** | Wrong answers should reappear sooner | Medium | Need `lastSeen` + `correctHistory` per triad |
| **Increasing intervals for mastered items** | Correctly answered items appear less frequently | Medium | Core SRS behavior |
| **Daily review session** | Dedicated mode for spaced review | Low | Extends Study Mode |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Integrate with "tricky" marking** | Tricky items get shorter intervals automatically | Low | `TrickyQuestion[]` already exists |
| **Category-specific review** | "Review Cardiology" for targeted study | Low | Filter existing data |
| **Visual memory strength indicator** | Show how "stable" each triad is in memory | Medium | Requires per-triad tracking |
| **Smart session sizing** | "You have 12 items due" vs fixed 10 questions | Low | Count due items |
| **Forgetting curve visualization** | Show when items will be due on calendar | High | Engaging but complex UI |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Complex FSRS with 21 parameters** | Overkill for 45 items, requires training data | Use simple Leitner (5 levels) or simplified FSRS |
| **Self-rating (Again/Hard/Good/Easy)** | Adds friction, users don't like judging themselves | Binary: correct = advance, incorrect = reset |
| **Overwhelming review queues** | "147 items due" is demotivating | Cap at ~20 per session, allow dismissal |
| **Mandatory daily reviews** | Feels like homework, drives churn | Make it a positive option, not obligation |
| **Mixing SRS with timed Quiz Mode** | Confuses purpose - review is about recall, not speed | Keep Review Mode untimed (like Study Mode) |

### Recommended Approach for MedTriads

Given existing "mark as tricky" and Study Mode:

1. **Simple Leitner-inspired system:** Track per-triad: `{ lastSeen, level (1-5), correctStreak }`. Level determines interval (1, 3, 7, 14, 30 days).

2. **"Smart Review" mode:** New mode (or Study Mode enhancement) that:
   - Shows items due for review (level interval exceeded)
   - Prioritizes tricky-marked items
   - Untimed, shows explanations
   - Updates level based on correct/incorrect

3. **Home screen indicator:** "5 triads due for review" badge

4. **Data model extension:**
```typescript
interface TriadReviewData {
  triadId: string;
  level: 1 | 2 | 3 | 4 | 5;  // Leitner box
  lastReviewedAt: string;    // ISO date
  correctStreak: number;     // For bonus interval extension
}
```

**Confidence: HIGH** - Leitner system is well-documented, simple to implement, effective for small content pools.

---

## Daily Challenges

### How It Typically Works

Daily challenges create recurring engagement through time-limited, unique-per-day content.

**Common patterns:**

1. **Daily Quests (Duolingo):** Complete specific actions each day (finish 1 lesson, practice 1 skill, etc.) for rewards.

2. **Daily Challenge Question:** A special question available once per day, same for all users.

3. **Daily Streak + Goals:** Track consecutive days of activity. Duolingo users with 7+ day streaks are 2.4x more likely to return.

4. **Rotating Focus:** Different category/theme each day (Medical Monday: Cardiology, Terrible Tuesday: Tricky Questions).

### Table Stakes

Features users expect from "daily challenges":

| Feature | Why Expected | Complexity | Existing Foundation |
|---------|--------------|------------|---------------------|
| **Daily streak tracking** | Core habit loop mechanic | Already exists | `dailyStreak` in stats |
| **Streak visibility** | Users want to see and protect their streak | Already exists | Home screen shows streak |
| **"Play today" indicator** | Clear CTA for daily engagement | Low | Based on `lastPlayedDate` |
| **Streak recovery/freeze** | Missing one day shouldn't destroy long streaks | Low | Would add grace period |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Daily Triad Challenge** | One special triad per day, same for all users | Low | Deterministic selection from date |
| **Category of the Day** | "Today: Master Neurology" with bonus XP | Low | Rotate through 10 categories |
| **Weekly goals** | "Answer 50 questions this week" | Medium | Complements daily streak |
| **Streak milestones** | Celebrate 7, 30, 100, 365 day streaks | Low | Uses existing tier-up celebration UI |
| **Streak freeze (limited)** | Allow 1-2 "grace" days per month | Low | Reduces churn from broken streaks |
| **Daily leaderboard** | Compare today's performance with others | High | Requires backend |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Harsh streak resets** | All-or-nothing streaks cause rage quits | Ramp-down (partial credit) or streak freeze |
| **Excessive push notifications** | Annoying, leads to uninstalls | Max 1 reminder, user-controlled timing |
| **FOMO-driven content** | "Miss today's challenge and it's gone forever" | Make challenges repeatable or archive them |
| **Points-only rewards** | Points alone become meaningless | Tie to progression (unlock content, badges) |
| **Complex multi-step daily quests** | Too much cognitive load for quick daily habit | Keep it simple: "Complete 1 quiz" |

### Recommended Approach for MedTriads

Given existing daily streak:

1. **Enhance streak system:**
   - Add streak freeze (1 free per week, purchasable with points?)
   - Streak milestone celebrations (7, 30, 100 days)
   - Streak ramp-down instead of hard reset (miss 1 day = lose 3 days, not all)

2. **Daily Challenge Question:**
   - One deterministic triad per day (based on date hash)
   - Bonus points for correct answer
   - Shows on home screen: "Today's Challenge: [condition name hint]"
   - Tracked separately from regular quiz history

3. **Category of the Day (optional):**
   - Rotate through 10 categories over 10 days
   - Bonus multiplier for playing that category
   - "Today: Cardiology Day - 1.5x points"

**Confidence: HIGH** - Streak mechanics are well-understood, Duolingo's success is well-documented, low implementation complexity.

---

## Feature Dependencies

How new features relate to existing systems:

```
Existing Systems                    New Features
================                    ============

categoryMastery -----------------> Adaptive Difficulty
(tracks correct/total per cat)     (prioritize weak categories)

TrickyQuestion[] ----------------> Spaced Repetition
(user-marked difficult items)      (prioritize in review queue)

dailyStreak ---------------------> Daily Challenges
(consecutive day counter)          (enhance with freeze, milestones)

Study Mode ----------------------> Review Mode (SRS)
(untimed, explanations)            (same UX, different question selection)

generateQuestionSet -------------> Adaptive Selection
(random selection)                 (weighted by mastery + tricky)

tier progression ----------------> Unchanged
(points -> tier -> timer)          (orthogonal to new features)
```

### Integration Points

| New Feature | Depends On | Enhances |
|-------------|------------|----------|
| Adaptive Difficulty | `categoryMastery`, `TrickyQuestion[]` | Quiz question selection |
| Spaced Repetition | New per-triad tracking, `TrickyQuestion[]` | Study Mode (or new Review Mode) |
| Daily Challenges | `dailyStreak`, `lastPlayedDate` | Home screen, Stats |
| Daily Challenge Question | Triads data, date | Home screen |
| Streak Freeze | `dailyStreak` | Stats storage |

---

## Complexity Assessment

| Feature | Complexity | Reasoning |
|---------|------------|-----------|
| **Adaptive: Weak category prioritization** | Low | Query existing `categoryMastery`, weight `generateQuestionSet` |
| **Adaptive: Tricky question prioritization** | Low | Query existing `TrickyQuestion[]`, weight selection |
| **Adaptive: Diagnostic mode** | Medium | New flow, but uses existing quiz infrastructure |
| **SRS: Per-triad tracking** | Medium | New storage schema, migrations for existing users |
| **SRS: Leitner algorithm** | Low | Simple level+interval logic, well-documented |
| **SRS: Review Mode** | Low | Clone Study Mode UX, different question source |
| **SRS: "Due for review" badge** | Low | Count query on triad tracking data |
| **Daily: Streak freeze** | Low | Add `streakFreezes` field, modify `calculateStreak` |
| **Daily: Streak milestones** | Low | Check in `calculateStreak`, trigger celebration |
| **Daily: Challenge Question** | Low | Deterministic hash from date, one extra UI card |
| **Daily: Category of Day** | Low | Date-based rotation, bonus multiplier flag |

### Recommended Build Order

1. **Phase 1: Quick Wins (Low complexity)**
   - Streak freeze + milestones
   - Daily Challenge Question
   - Tricky question prioritization in Quiz Mode

2. **Phase 2: Core Value (Medium complexity)**
   - Per-triad SRS tracking
   - Review Mode with Leitner scheduling
   - Weak category prioritization

3. **Phase 3: Polish (If time permits)**
   - Category of the Day
   - Diagnostic calibration mode
   - Memory strength visualization

---

## Sources

### Adaptive Difficulty
- [Implementing Game-Changer Adaptive Quizzes](https://nerdbot.com/2025/08/16/implementing-game-changer-adaptive-quizzes-that-work/)
- [MedMatrix AI QBank Adaptive Learning](https://themedmatrix.com/blog/deep-dive-how-medmatrixs-ai-qbank-adapts-to-your-learning-style)
- [BoardVitals NCLEX CAT Technology](https://www.boardvitals.com/blog/boardvitals-updates-nclex-question-banks/)

### Spaced Repetition
- [Comparing Spaced Repetition Algorithms - Brainscape](https://www.brainscape.com/academy/comparing-spaced-repetition-algorithms/)
- [FSRS Algorithm Resources](https://github.com/open-spaced-repetition/awesome-fsrs)
- [Implementing FSRS in 100 Lines](https://borretti.me/article/implementing-fsrs-in-100-lines)
- [simple-ts-fsrs TypeScript Implementation](https://jsr.io/@austinshelby/simple-ts-fsrs)
- [Leitner System Ultimate Guide](https://leitner-box.com/leitner-system-ultimate-guide/)

### Daily Challenges
- [Duolingo Case Study 2025](https://www.youngurbanproject.com/duolingo-case-study/)
- [Streaks and Milestones for Gamification](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps)
- [Designing Streaks for Long-term User Growth](https://www.mindtheproduct.com/designing-streaks-for-long-term-user-growth/)
- [Master the Art of Streak Design - Yu-kai Chou](https://yukaichou.com/gamification-study/master-the-art-of-streak-design-for-short-term-engagement-and-long-term-success/)
- [The Psychology of Hot Streak Game Design](https://uxmag.medium.com/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame-3dde153f239c)
