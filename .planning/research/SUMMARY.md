# Research Summary: v3.0 Engagement Features

**Project:** MedTriads
**Domain:** Medical education quiz app with gamification
**Researched:** 2026-01-21
**Confidence:** MEDIUM-HIGH

## Executive Summary

MedTriads v3.0 engagement features (adaptive difficulty, spaced repetition, daily challenges) can be built entirely with the existing stack. No new dependencies are required. The current architecture with its service layer pattern (`mastery.ts`, `stats-storage.ts`, `question-generator.ts`) provides natural integration points. The key insight across all research is that the 45-triad content pool is both a constraint and a simplifier: standard algorithms designed for thousands of items need modification, but the small scope makes implementation straightforward.

The recommended approach is to build a shared foundation first (per-triad performance tracking), then layer features on top. Adaptive difficulty should work through question SELECTION (not timing changes, which the tier system already handles). Spaced repetition should use a lightweight priority-weighting approach rather than strict SM-2 scheduling. Daily challenges should integrate with the existing streak system rather than creating a parallel engagement loop.

The critical risk is content exhaustion. With 45 triads shown 10 per quiz, users experience all content in 4-5 games. Traditional SRS algorithms will schedule everything for review at similar times, creating feast-or-famine sessions. The mitigation is to frame the app as a mastery tool (not endless content), cap review intervals at 7-14 days, and use "weakest first" prioritization rather than strict due dates.

## Key Findings

### Stack

**No new dependencies required.** All three features are algorithm-driven and integrate with existing infrastructure.

- **AsyncStorage**: Already handles all persistence; extend with per-triad tracking and daily challenge state
- **Existing services**: `question-generator.ts` supports category filtering (extend with weighted selection); `stats-storage.ts` has migration-safe pattern already implemented
- **SM-2 over FSRS**: For 45 items, the simpler SM-2 algorithm (~50 lines) is sufficient; FSRS is designed for 10,000+ card decks

Libraries considered but rejected: `ts-fsrs` (overkill), `supermemo` (unnecessary dependency for simple algorithm), `expo-notifications` (defer to future "reminders" enhancement).

### Features

**Adaptive Difficulty:**
- Table stakes: Prioritize weak categories, performance-aware question selection
- Differentiator: Leverage existing "tricky" marking for weighted selection
- Anti-feature: Do NOT add separate Easy/Medium/Hard modes; use adaptive selection automatically
- Key insight: Tier timer system (15s -> 8s) already provides difficulty progression; adaptive should affect question SELECTION not presentation

**Spaced Repetition:**
- Table stakes: "Review due" indicator, prioritize forgotten items, increasing intervals for mastered items
- Differentiator: Integrate with existing "mark as tricky" feature
- Anti-feature: Do NOT implement full FSRS or self-rating; binary correct/incorrect is sufficient
- Key insight: Simple Leitner-inspired system (5 levels, 1/3/7/14/30 day intervals) is ideal for small pool

**Daily Challenges:**
- Table stakes: Already has daily streak tracking and visibility
- Differentiator: Daily Challenge Question (same for all users via date-seeded selection), streak milestones (7/30/100 days), streak freeze (1 per week)
- Anti-feature: Do NOT add separate challenge streak; integrate into existing streak system

### Architecture

All three features share a common need: per-triad performance history. The architecture should add a new `TriadPerformanceStore` as the foundation, then build features on top.

**New services required:**
1. `triad-performance.ts` - Core per-triad tracking (attempts, accuracy, response time, SR data)
2. `spaced-repetition.ts` - SM-2 algorithm implementation
3. `daily-challenge.ts` - Challenge generation and state management

**New storage keys:**
- `@medtriad_triad_performance` - Per-triad performance data
- `@medtriad_daily_challenge` - Daily challenge state

**Data migration strategy:** No breaking changes. New fields are additive. Existing `{ ...DEFAULT_STATS, ...JSON.parse(json) }` pattern handles backward compatibility.

### Critical Pitfalls

1. **SR-1: Content Exhaustion** (CRITICAL) - With 45 triads, standard SRS schedules everything at similar times. Prevention: Use priority weighting not strict scheduling; cap intervals at 7-14 days; always have fallback content.

2. **INT-1: Schema Migration Failure** (CRITICAL) - Storage changes could corrupt existing user data. Prevention: Maintain existing spread pattern; never remove fields; add schema version.

3. **INT-2: Tier Timer Conflict** (HIGH) - Adaptive difficulty could fight with existing tier timers. Prevention: Adaptive affects question SELECTION; tier affects PRESENTATION (time limits).

4. **DC-2: Streak Anxiety** (HIGH) - Adding challenge streak creates cognitive overhead. Prevention: Integrate challenges INTO existing streak; challenge completion counts as daily play.

5. **AD-1: Premature Adjustment** (MEDIUM) - Adjusting difficulty with too few data points. Prevention: Require 3-5 responses per triad before classifying; use confidence thresholds.

## Recommendations

### Must Do

1. **Build per-triad tracking first** - All three features depend on this data layer
2. **Use "weakest first" prioritization** - Not strict SRS scheduling for the small content pool
3. **Integrate daily challenges with existing streak** - Single engagement loop, not parallel systems
4. **Maintain storage migration pattern** - The existing `{ ...DEFAULT_STATS, ...JSON.parse(json) }` pattern is correct
5. **Cap review intervals at 7-14 days** - Prevents the "nothing to review" problem

### Should Consider

1. **Streak freeze (1 per week)** - Reduces churn from broken streaks
2. **Streak milestones (7/30/100 days)** - Reuse tier-up celebration UI
3. **Category-of-the-day bonus** - Simple engagement driver with minimal complexity
4. **"Tricky" integration with SRS** - Tricky-marked items get shorter review intervals

### Avoid

1. **FSRS or complex SRS algorithms** - Overkill for 45 items
2. **Separate difficulty modes (Easy/Medium/Hard)** - Creates choice friction
3. **Separate challenge streak** - Conflicts with existing streak
4. **Push notifications** - Start without; add later with A/B testing if needed
5. **Self-rating (Again/Hard/Good/Easy)** - Binary correct/incorrect is sufficient
6. **Mid-quiz difficulty adjustment** - Feels unfair; adjust between sessions only

## Build Order

### Phase 1: Per-Triad Performance Foundation

**Rationale:** All three features depend on per-triad performance history. Build this invisibly first.

**Delivers:**
- `triad-performance-storage.ts` with load/save
- `useTriadPerformance` hook
- Response time tracking in QuizScreen
- Automatic recording of per-triad attempts

**Addresses:** Foundation for adaptive difficulty, spaced repetition, and difficulty classification

**Avoids:** AD-1 (premature adjustment) by collecting data before using it

### Phase 2: Adaptive Difficulty

**Rationale:** Builds directly on Phase 1 data. Modifies existing quiz flow rather than adding new screens.

**Delivers:**
- Difficulty classification per triad (easy/medium/hard/unclassified)
- `generateAdaptiveQuestionSet()` function
- Weak category prioritization
- "Tricky" question weighting

**Implements:** Weighted question selection in `question-generator.ts`

**Avoids:** INT-2 (tier conflict) by affecting selection not presentation

### Phase 3: Spaced Repetition

**Rationale:** Requires new screens but builds on Phase 1/2 infrastructure.

**Delivers:**
- SM-2 algorithm in `spaced-repetition.ts`
- "Review due" badge on home screen
- Review mode screens (`app/review/`)
- Untimed review experience

**Addresses:** SRS table stakes (due indicator, prioritized reviews, increasing intervals)

**Avoids:** SR-1 (content exhaustion) by using priority weighting and capped intervals

### Phase 4: Daily Challenges

**Rationale:** Most complex feature. Requires all prior infrastructure plus new screens and challenge types.

**Delivers:**
- `daily-challenge.ts` service
- Daily challenge card on home screen
- Challenge screens (`app/daily-challenge/`)
- Challenge type variants (speed round, category focus, etc.)
- Streak freeze and milestones

**Addresses:** Daily challenge features plus enhanced streak system

**Avoids:** DC-2 (streak conflict) by integrating with existing streak

### Phase Ordering Rationale

1. **Data first, features second:** Per-triad tracking is invisible to users but enables everything else
2. **Modify before add:** Adaptive difficulty modifies existing quiz flow; new screens come later
3. **Simple to complex:** Each phase adds complexity; daily challenges with multiple types is most complex
4. **Risk mitigation:** Most critical pitfalls (schema migration, content exhaustion) are addressed in Phase 1

### Research Flags

**Phases likely needing deeper research:**
- **Phase 3 (Spaced Repetition):** SM-2 edge cases, quality score mapping, review session UX

**Phases with standard patterns:**
- **Phase 1:** AsyncStorage patterns already established in codebase
- **Phase 2:** Weighted random selection is well-documented
- **Phase 4:** Streak mechanics well-documented from Duolingo studies

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing codebase analysis confirms no new dependencies needed |
| Features | HIGH | Multiple sources agree on table stakes vs differentiators |
| Architecture | HIGH | Clear service boundaries match existing patterns |
| Pitfalls | MEDIUM-HIGH | Content exhaustion risk well-documented; specific mitigations need validation |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **SM-2 quality mapping:** Research shows correct/incorrect, but mapping response time to SM-2 quality (0-5) needs experimentation
- **Optimal interval caps:** 7-14 days suggested, but may need tuning based on user testing
- **Challenge difficulty scaling:** How to make challenges achievable for Student tier while challenging for Chief tier needs design iteration

## Open Questions

1. **Should difficulty classification be visible to users?** Research suggests transparency builds trust, but showing "hard" labels might discourage struggling users.

2. **How many review items per session?** Research suggests capping at 20, but for 45 triads this may feel arbitrary.

3. **Streak freeze economics:** Should streak freeze be free (1/week), earned (via challenge completion), or both?

4. **Daily challenge reward structure:** Points vs badges vs both? Impact on tier progression timeline needs modeling.

## Sources

### Primary (HIGH confidence)
- Existing MedTriads codebase - Architecture patterns, existing services
- SM-2 Algorithm documentation (Anki, SuperMemo) - SRS implementation
- Duolingo case studies - Streak and gamification effectiveness

### Secondary (MEDIUM confidence)
- ts-fsrs documentation - FSRS vs SM-2 comparison
- BoardVitals/MedMatrix - Medical quiz app patterns
- Leitner system guides - Simple SRS alternative

### Tertiary (LOW confidence, needs validation)
- General adaptive difficulty patterns - May not apply to 45-item pools
- IRT (Item Response Theory) - Requires more data than available

---
*Research completed: 2026-01-21*
*Ready for roadmap: yes*
