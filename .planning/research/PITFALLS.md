# Pitfalls Research: v3.0 Engagement Features Risks

**Project:** MedTriads
**Features:** Adaptive Difficulty, Spaced Repetition, Daily Challenges
**Researched:** 2026-01-21
**Overall Confidence:** MEDIUM-HIGH

## Summary

Adding engagement features to MedTriads carries significant risks due to three interacting constraints: (1) a small content pool of 45 triads, (2) local-only storage that cannot sync or recover, (3) existing systems (streak, tier progression) that new features must not break. The most critical pitfalls involve content exhaustion from spaced repetition in a small pool, difficulty calibration without sufficient data, and data schema changes that corrupt existing user progress. This research identifies 16 specific pitfalls across four categories, with prevention strategies tailored to MedTriads' constraints.

---

## Adaptive Difficulty Pitfalls

### AD-1: Premature Difficulty Adjustment

**What:** System adjusts difficulty after too few data points, creating random-feeling difficulty swings.

**Why This Matters for MedTriads:** With only 45 triads and 10-question rounds, a user might complete 4-5 games before seeing all content. Adjusting difficulty after 1-2 games bases decisions on 10-20 data points spread across potentially 40+ unique triads.

**Warning Signs:**
- Users experience difficulty swings between sessions
- Same triad appears "easy" one session, "hard" the next
- Difficulty feels random rather than personalized

**Prevention:**
- Require minimum 3-5 responses per triad before assigning difficulty rating
- Use conservative defaults (medium difficulty) until data threshold met
- Track confidence level per triad: `{ triadId, correctCount, totalSeen, confidence: 'low' | 'medium' | 'high' }`

**Phase Impact:** Phase implementing adaptive difficulty must include cold-start handling and confidence thresholds.

---

### AD-2: Single-Metric Difficulty (Accuracy-Only Trap)

**What:** Using only accuracy (correct/incorrect) to determine difficulty, ignoring response time and consistency.

**Why This Matters for MedTriads:** The existing tier system already reduces timer per tier (15s -> 8s). A triad a user gets correct in 14 seconds is different from one they nail in 2 seconds. Accuracy-only metrics miss this nuance.

**Warning Signs:**
- Users feel stuck at a plateau
- High-accuracy users still struggle with time pressure
- No differentiation between "barely knew it" and "mastered it"

**Prevention:**
- Combine accuracy + response time into difficulty calculation
- Define "mastery" as correct + fast (e.g., under 5 seconds)
- Existing `timeRemaining` in quiz state already captures this data

**Phase Impact:** Design difficulty formula during research; don't retrofit after implementation.

---

### AD-3: Rubber-Banding Frustration

**What:** System constantly adjusts to keep user at ~70-80% success rate, making them feel they never improve.

**Warning Signs:**
- Users complain they "can't get ahead"
- Metrics show steady 75% accuracy over months
- No sense of mastery or progression

**Prevention:**
- Include "mastered" triads that stay easy (reward for learning)
- Use asymmetric adjustment: harder to increase difficulty, easier to decrease
- Show users their improvement over time, not just current performance

**Phase Impact:** Tie to existing tier system so users see progression via tier-ups, not difficulty labels.

---

### AD-4: Difficulty Without Transparency

**What:** Users don't understand why questions feel harder/easier, leading to distrust of the system.

**Warning Signs:**
- Users feel the app is "cheating" or "broken"
- App store reviews mention unfair difficulty
- Users try to game the system by intentionally failing

**Prevention:**
- Never show raw difficulty ratings to users
- Frame as "personalized practice" not "adaptive testing"
- Use the existing tier timer reduction as the primary visible difficulty lever

**Phase Impact:** UX design phase must address transparency without revealing algorithm details.

---

## Spaced Repetition Pitfalls

### SR-1: Content Exhaustion in Small Pool

**What:** With only 45 triads, spaced repetition quickly schedules all items for review at similar times, creating feast-or-famine review sessions.

**Why This Matters for MedTriads:** Traditional SRS like SM-2/FSRS assume hundreds or thousands of items. With 45 items that users see 10 per session, the entire pool cycles through in 4-5 games. After initial learning, all items will have similar "next review" dates.

**Warning Signs:**
- Daily review counts swing wildly (0 items one day, 30 the next)
- Users hit "nothing to review" states
- Algorithm schedules more reviews than the daily challenge can accommodate

**Prevention:**
- Use "spaced repetition light" approach: priority weighting, not strict scheduling
- Focus on "weakest triads first" rather than "due items only"
- Always have fallback to show any content rather than "come back tomorrow"
- Cap review intervals at 7-14 days max given pool size

**Phase Impact:** Research phase must validate algorithm choice against 45-item constraint. Standard SRS may not be appropriate.

---

### SR-2: Review Interval Hell

**What:** Items stuck at short intervals (1-2 days) that users keep failing, dominating review sessions.

**Warning Signs:**
- Same 5-10 triads appear every session
- Users never see certain triads because "problem" triads consume all slots
- Frustration with repetitive content

**Prevention:**
- Implement "graduated failure" - after N consecutive failures, show explanation/mnemonic, then retire temporarily
- Mix "struggling" and "comfortable" items in each session
- Limit any single triad to max 2 appearances per session

**Phase Impact:** Phase implementing SRS must include failure handling, not just standard interval calculation.

---

### SR-3: Orphaned Spaced Repetition Data

**What:** User's SRS data references triads that no longer exist after a content update.

**Why This Matters for MedTriads:** Content is bundled in the app. If triads.json is updated (adding/removing/changing triads), the SRS data in AsyncStorage may reference stale IDs.

**Warning Signs:**
- Errors when loading review sessions
- Missing triads in review queue
- Data corruption after app updates

**Prevention:**
- Validate SRS data against current triad set on app load
- Clean orphaned records silently (don't error)
- Include triad version/hash in SRS data to detect staleness

**Phase Impact:** Must implement data validation in same phase as SRS feature.

---

### SR-4: Treating Cards in Isolation

**What:** SRS schedules each triad independently, missing that related triads reinforce each other.

**Why This Matters for MedTriads:** Cardiology triads (Beck's, Virchow's, etc.) share conceptual overlap. Reviewing one cardiac triad may reinforce memory of others.

**Warning Signs:**
- Over-scheduling of related items
- Users reviewing similar content back-to-back
- Redundant reviews that don't add learning value

**Prevention:**
- Consider category-level scheduling: "reviewed cardiology recently"
- When selecting review items, spread across categories
- Existing `category` field on triads enables this

**Phase Impact:** Algorithm design must consider category relationships, not pure per-item scheduling.

---

### SR-5: Wrong Initial Ease Assumptions

**What:** All triads start with same ease factor (e.g., 2.5 in SM-2), but some triads are objectively harder than others.

**Why This Matters for MedTriads:** "Beck's Triad" (common, memorable) is fundamentally easier than "Gradenigo Syndrome" (rare, obscure). Starting both at same difficulty wastes early sessions.

**Warning Signs:**
- Users fail consistently on certain triads
- Easy triads over-scheduled early on
- Learning curve feels flat

**Prevention:**
- Pre-seed difficulty ratings based on content analysis or aggregate user data
- Track which triads have high failure rates globally (not just per-user)
- Allow difficulty to adjust faster in first few exposures

**Phase Impact:** Consider whether to ship with pre-calibrated difficulty or cold-start everyone equally.

---

## Daily Challenges Pitfalls

### DC-1: Challenge Impossible for Casual Users

**What:** Daily challenge goals achievable only by power users, alienating 80% of user base.

**Warning Signs:**
- Low completion rates on daily challenges
- Users stop attempting after failing repeatedly
- Only high-tier users complete challenges

**Prevention:**
- Scale challenge difficulty to user's tier/ability
- Provide tiered rewards (partial credit for partial completion)
- "Beginner" challenges that any user can complete with effort

**Phase Impact:** Challenge design phase must segment by user tier.

---

### DC-2: Streak Anxiety (Breaking Existing Streak System)

**What:** Adding daily challenges creates a second streak system that conflicts with existing daily login streak.

**Why This Matters for MedTriads:** MedTriads already has `dailyStreak` tracking consecutive play days. Adding a separate "challenge streak" creates cognitive overhead and potential anxiety.

**Warning Signs:**
- Users confused about which streak matters
- Anxiety about maintaining multiple streaks
- One streak cannibalizes engagement from the other

**Prevention:**
- Integrate daily challenges INTO existing streak (complete = play today)
- Single "streak" concept, multiple ways to maintain it
- Challenge completion as bonus, not requirement

**Phase Impact:** Must audit existing streak logic before adding challenges; plan integration not addition.

---

### DC-3: Post-Event Engagement Cliff

**What:** Engagement crashes after daily challenge ends, creating boom-bust patterns.

**Warning Signs:**
- Usage spikes during challenge, drops sharply after
- Users only engage when challenge is active
- No sustained engagement between challenges

**Prevention:**
- Immediate visibility of next day's challenge
- Carry-over benefits (streak bonuses, banked rewards)
- Challenge completion feeds into progression (points toward tier)

**Phase Impact:** Plan the "day after" experience in same phase as challenge design.

---

### DC-4: Notification Fatigue

**What:** Push notifications for daily challenges become annoying, leading to notification disable or app deletion.

**Warning Signs:**
- High notification opt-out rates
- Decreased engagement after notification campaign
- App uninstalls correlated with notification frequency

**Prevention:**
- Start with NO push notifications for challenges
- Let challenge visibility in-app drive engagement first
- If adding notifications: max 1/day, respect quiet hours, allow granular control

**Phase Impact:** If implementing notifications, requires separate design phase with A/B testing.

---

## Integration Pitfalls (Adding to Existing System)

### INT-1: AsyncStorage Schema Migration Failure

**What:** New features require schema changes to `StoredStats`; existing user data is corrupted or lost during upgrade.

**Why This Matters for MedTriads:** All user progress (points, tier, streak, category mastery) lives in AsyncStorage. The existing `StoredStats` interface has 12+ fields. Adding SRS and challenge data requires schema extension.

**Warning Signs:**
- Users lose progress after app update
- `loadStats()` returns `DEFAULT_STATS` for existing users
- TypeScript errors from missing fields on loaded data

**Prevention:**
- Always spread existing data: `{ ...DEFAULT_STATS, ...JSON.parse(json) }`
- Never remove fields, only add (backward compatibility)
- Add schema version field to detect and migrate old data
- Test migration with production-like data

**Current Code Already Does This Well:**
```typescript
// From stats-storage.ts line 78-79
return { ...DEFAULT_STATS, ...JSON.parse(json) };
```
This pattern handles new fields gracefully. Maintain it.

**Phase Impact:** EVERY phase adding storage must follow existing migration pattern.

---

### INT-2: Breaking Tier Timer Integration

**What:** New adaptive difficulty conflicts with existing tier-based timers (15s -> 8s progression).

**Why This Matters for MedTriads:** The mastery system already implements difficulty scaling via reduced timers per tier. Adding item-level difficulty could conflict.

**Warning Signs:**
- Two difficulty systems fighting each other
- Timer feels wrong for tier
- Confusion about what determines difficulty

**Prevention:**
- Keep tier timer as THE visible difficulty lever
- Use adaptive difficulty for question SELECTION, not question PRESENTATION
- Harder triads = appear more often in practice, not "get less time"

**Phase Impact:** Research phase must define how adaptive difficulty complements (not replaces) tier timers.

---

### INT-3: Regression in Question Generation

**What:** Changes to question selection logic break existing functionality like category filtering.

**Why This Matters for MedTriads:** The existing `generateQuestionSetByCategories()` handles category filtering for study mode. New SRS/adaptive logic must not break this.

**Warning Signs:**
- Category filter no longer works
- Study mode shows wrong triads
- Questions don't respect user preferences

**Prevention:**
- New selection logic as separate function, not modification
- Compose: `prioritySelection(adaptiveFilter(categoryFilter(allTriads)))`
- Comprehensive tests for question generation with all filter combinations

**Phase Impact:** Add tests for existing functionality BEFORE modifying question generation.

---

### INT-4: Points System Inflation

**What:** Daily challenges award extra points, inflating progression and trivializing tier-ups.

**Why This Matters for MedTriads:** Tier thresholds are fixed (300, 1000, 2500, 5000, 10000 points). If daily challenges award significant bonus points, users tier up faster than intended, reducing sense of achievement.

**Warning Signs:**
- Users reach Chief tier too quickly
- Tier-up celebrations feel unearned
- Points become meaningless

**Prevention:**
- Daily challenge rewards should be recognition (badges), not points
- Or: bonus points are small (10-50), not game-changing
- Calculate: at current rate, how fast do users tier up? Don't accelerate more than 20%

**Phase Impact:** Challenge reward design must model impact on tier progression timeline.

---

## Content Limitations Pitfalls

### CL-1: 45 Triads x 10 Questions = Content Seen in 5 Games

**What:** Users experience all content quickly, reducing novelty and engagement.

**Math:**
- 45 triads total
- 10 questions per game
- 4.5 games to see every triad once
- Active user plays 1-2 games/day = sees everything in 3-7 days

**Warning Signs:**
- Users complain of repetition after first week
- Engagement drops sharply after day 5-7
- "I've seen this before" fatigue

**Prevention:**
- Maximize variety in distractor selection (already done: same-category preference)
- Make the LEARNING the value, not novelty
- Frame app as "mastery tool" not "endless content"
- Track which triads haven't been seen and prioritize them

**Phase Impact:** Set expectations in onboarding; UX should emphasize mastery over discovery.

---

### CL-2: Statistical Significance Impossible

**What:** Adaptive algorithms require statistically significant data per item; 45 items x few users = insufficient data.

**Why This Matters for MedTriads:** IRT (Item Response Theory) typically needs 150+ responses per item for calibration. A solo user playing 2 games/day generates ~140 responses/week spread across 45 items = ~3 responses per item per week.

**Warning Signs:**
- Difficulty ratings fluctuate wildly
- Algorithm "confident" about difficulty with 5 data points
- Users with different abilities rated as similar

**Prevention:**
- Don't claim "adaptive" if you mean "responsive to last session"
- Use simpler heuristics: correct/incorrect + fast/slow = 4-bucket classification
- Reserve true adaptive algorithms for when/if user base grows large enough

**Phase Impact:** Algorithm complexity should match data availability; start simple.

---

### CL-3: Category Imbalance

**What:** Some categories have 5 triads, others have 4; spaced repetition over-weights larger categories.

**Current Distribution:**
- Cardiology: 5
- Neurology: 6
- Endocrine: 5
- Pulmonary: 4
- Gastroenterology: 5
- Infectious: 4
- Hematology: 4
- Rheumatology: 4
- Renal: 4
- Obstetrics: 4

**Warning Signs:**
- Users master small categories faster
- Large categories feel like "more work"
- Mastery percentages misleading

**Prevention:**
- Balance review sessions across categories, not just triads
- Show category mastery as percentage, not absolute count
- Weight daily challenges to include under-practiced categories

**Phase Impact:** Question selection logic must consider category balance.

---

## Pitfall Severity Summary

| Pitfall | Severity | Likelihood | Phase to Address |
|---------|----------|------------|------------------|
| SR-1: Content Exhaustion | CRITICAL | HIGH | Algorithm Design |
| INT-1: Schema Migration | CRITICAL | MEDIUM | Every Storage Phase |
| INT-2: Tier Timer Conflict | HIGH | HIGH | Adaptive Design |
| DC-2: Streak Conflict | HIGH | MEDIUM | Challenge Design |
| SR-2: Interval Hell | HIGH | MEDIUM | SRS Implementation |
| AD-1: Premature Adjustment | MEDIUM | HIGH | Adaptive Implementation |
| CL-1: Content Seen Quickly | MEDIUM | CERTAIN | UX/Onboarding |
| DC-1: Impossible Challenges | MEDIUM | MEDIUM | Challenge Design |
| INT-4: Points Inflation | MEDIUM | MEDIUM | Reward Design |
| Others | LOW-MEDIUM | VARIES | As Indicated |

---

## Recommended Mitigations by Phase

### Phase: Algorithm Research (Before Implementation)
- Validate SRS choice against 45-item constraint
- Define adaptive difficulty formula combining accuracy + time
- Model tier progression impact from challenge rewards

### Phase: Storage/Data Schema
- Add schema version field
- Plan migration path for SRS data structure
- Add triad-level performance tracking

### Phase: Adaptive Difficulty
- Implement cold-start handling with confidence thresholds
- Design selection algorithm that complements tier timers
- Add comprehensive tests for question generation

### Phase: Spaced Repetition
- Cap intervals at 14 days maximum
- Implement failure handling (not just standard SM-2)
- Add data validation against current triad set

### Phase: Daily Challenges
- Integrate with existing streak, don't add parallel streak
- Scale difficulty by user tier
- Design rewards that don't inflate point economy

---

## Sources

**Adaptive Difficulty:**
- [Dynamic Difficulty Adjustment - Wayline](https://www.wayline.io/blog/dynamic-difficulty-adjustment-participation-trophy)
- [Adaptive Difficulty in Games 2025](https://www.drozcanozturk.com/en/how-adaptive-difficulty-enhances-player-engagement-in-casual-games-2025/)

**Spaced Repetition:**
- [Content-aware Spaced Repetition](https://www.giacomoran.com/blog/content-aware-sr/)
- [FSRS vs SM-2 Issues](https://github.com/open-spaced-repetition/fsrs4anki/issues/582)
- [Spaced Repetition - Gwern](https://gwern.net/spaced-repetition)
- [Small Deck Issues - Flashcards Deluxe Forum](https://orangeorapple.com/forum/viewtopic.php?f=2&t=3940)

**Daily Challenges & Gamification:**
- [Dark Side of Gamification - Medium](https://medium.com/@jgruver/the-dark-side-of-gamification-ethical-challenges-in-ux-ui-design-576965010dba)
- [Mobile App Engagement Pitfalls - Appetiser](https://appetiser.com.au/blog/app-engagement/)
- [Mobile App Engagement Strategies - Trophy](https://trophy.so/blog/mobile-app-engagement-strategies)

**Data Migration:**
- [AsyncStorage Migration - React Native School](https://www.reactnativeschool.com/migrating-data-in-asyncstorage/)
- [Versioned Migration - LinkedIn](https://www.linkedin.com/pulse/versioned-migration-local-data-react-native-amal-jose-)

**Educational Assessment:**
- [Item Response Theory - Wikipedia](https://en.wikipedia.org/wiki/Item_response_theory)
- [IRT Item Difficulty - Assessment Systems](https://assess.com/irt-item-difficulty-parameter/)
