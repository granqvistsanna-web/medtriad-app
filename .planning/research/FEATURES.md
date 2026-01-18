# Features Research: v2.0 Polish & Progression

**Domain:** Mobile quiz app gamification & onboarding
**Researched:** 2026-01-18
**Confidence:** MEDIUM (WebSearch verified with multiple sources)

---

## Onboarding Features

### Table Stakes

Features users expect in any modern mobile app onboarding. Missing = app feels unpolished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Skip option** | 80%+ of well-designed apps offer skip; forcing users through tutorials kills retention | Low | Always visible, never hidden |
| **Progress indicator** | Users need to know "how much longer?" - dots or progress bar | Low | 3-5 screens max means simple dots work |
| **Clear value proposition** | First screen must answer "why should I use this?" | Low | For MedTriads: "Master medical triads through game-like quizzes" |
| **Visual consistency with app** | Onboarding that looks different from app creates jarring transition | Low | Use same color scheme, typography, component style |
| **Swipeable navigation** | Mobile users expect gesture-based screen transitions | Low | Swipe left/right + tap buttons |

**Research basis:** Apps with well-structured onboarding see retention increase by up to 50%. 80% of users delete apps they don't understand how to use. ([UXCam](https://uxcam.com/blog/10-apps-with-great-user-onboarding/), [Appcues](https://www.appcues.com/blog/in-app-onboarding))

### Differentiators

Features that would set MedTriads apart in onboarding, not universally expected but high value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Interactive mini-quiz** | Let user experience core value immediately - "try answering one triad" | Medium | Duolingo does this brilliantly - show value before asking for commitment |
| **Personalized welcome** | Ask one question (e.g., "studying for boards?" vs "clinical refresher") | Medium | Tailors tone, but may be overkill for v2 with 2-3 screens |
| **Animated mascot introduction** | Mascot guides through onboarding, establishes personality | Medium | Ties into mascot evolution system; builds emotional connection early |

**Research basis:** Interactive onboarding that lets users "learn by doing" sees 5x better engagement and 80%+ completion rates vs static tours. ([Plotline](https://www.plotline.so/blog/mobile-app-onboarding-examples))

### Anti-features

Things to deliberately NOT build for v2 onboarding.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **5+ screens** | "Feature parade" overwhelms users; cognitive overload | Stick to 2-3 screens as planned |
| **Required account creation** | Kills 25%+ of users immediately; no value shown yet | MedTriads has no accounts - maintain this simplicity |
| **Permission requests upfront** | Don't ask for notifications/location before proving value | Defer any permission requests to contextual moments |
| **Unskippable video tutorials** | Disrespects user time; many learn by doing | If video wanted later, always allow skip |
| **Complex personalization quiz** | Overkill for a focused quiz app with single use case | Save personalization for v3 if adding category selection |

**Research basis:** Common onboarding mistakes include 5+ intro screens, asking for permissions before proving value, and forcing registration. ([UserGuiding](https://userguiding.com/blog/mobile-app-onboarding))

---

## Level System Features

### Table Stakes

Features users expect from any level/progression system. Missing = progression feels hollow.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Clear level indicator** | Users must always know their current level | Low | Visible on home screen, results screen |
| **Progress to next level** | "How far until I level up?" - progress bar or XP display | Low | Critical for motivation; users are 2.3x more likely to engage with visible progress |
| **Level-up celebration** | Moment of achievement must be recognized | Medium | Sound, animation, haptic - tie into existing feedback systems |
| **Meaningful progression metric** | XP/points that map to actual usage | Low | Use total quizzes, correct answers, or combo points |
| **Tier naming that implies growth** | Bronze -> Gold or Novice -> Master trajectory | Low | Names should feel aspirational |

**Research basis:** Users crave sense of growth. Level-based progression drives repeat interaction and increases session duration. Goal-gradient psychology: closer to goal = more motivated. ([CleverTap](https://clevertap.com/blog/app-gamification-examples/), [Plotline](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps))

### Differentiators

Features that would elevate MedTriads' level system above typical implementations.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Medical-themed tier names** | Reinforce domain; feel educational not generic | Low | "Intern -> Resident -> Fellow -> Attending -> Chief" or similar |
| **Unlockable content per tier** | New triads, categories, or quiz modes at higher levels | High | Defer to v3 - adds significant complexity |
| **Tier-specific visual identity** | Colors, badges, or icons that change with level | Medium | Already planned - mascot evolution ties in |
| **Milestone celebrations** | Special recognition at key thresholds (100 quizzes, 1000 correct) | Medium | Combines well with existing combo/perfect round celebrations |

**Research basis:** Apps using streaks + milestones together reduce 30-day churn by 35% vs non-gamified alternatives. Milestone celebrations maintain engagement when daily rewards lose novelty. ([Plotline](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps))

### Anti-features

Things to deliberately NOT build for v2 level system.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Leaderboards** | Explicitly out of scope for v2; adds social complexity | Focus on personal progression; leaderboards are v3 |
| **Badges/achievements parallel to levels** | Scope creep; levels ARE the achievement system for v2 | One progression system done well > two done poorly |
| **Punitive level loss** | Losing levels frustrates users; breaks trust | Levels only go up; streaks can be lost but levels persist |
| **Complex XP formulas** | Confusion about "how did I earn this?" | Simple: 1 quiz = X progress, bonus for perfect/high scores |
| **Too many tiers (10+)** | Progression feels slow; early levels feel meaningless | 5-6 tiers as planned is ideal - achievable but aspirational |
| **Pay-to-progress mechanics** | Undermines intrinsic motivation; MedTriads is educational | All progression earned through gameplay |

**Research basis:** Medical education research found badges not assigned significance when disconnected from educational goals. Extrinsic motivators can undermine intrinsic motivation if not balanced. ([PubMed](https://pubmed.ncbi.nlm.nih.gov/35637557/), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10778414/))

---

## Mascot Evolution Features

### Table Stakes

Features users expect from mascot/avatar evolution systems. Missing = evolution feels arbitrary.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Distinct visual per tier** | Each evolution must look meaningfully different | Medium | Not just color swap - shape, accessories, pose changes |
| **Evolution tied to progression** | Clear trigger: "reach level X to evolve" | Low | Direct tie to level system |
| **Evolution celebration moment** | Special fanfare when mascot changes | Medium | Sound, animation, potentially full-screen reveal |
| **Mascot visible on key screens** | Home screen at minimum; reinforces progression | Low | Already have mascot images at master/supermaster levels |
| **Consistent personality** | Same character evolving, not random different characters | Low | Single mascot that "grows up" with the user |

**Research basis:** Duolingo's Duo owl evolution from flat logo to animated character with personality is cited as gold standard. Users form emotional bonds with mascots that guide them. ([Apple Developer](https://developer.apple.com/news/?id=e2e1faj4), [LogoAI](https://www.logoai.com/blog/duolingos-logo-history-and-mascot-brand-storytelling))

### Differentiators

Features that would make MedTriads' mascot system memorable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Medical-themed evolution** | Mascot gains stethoscope, white coat, specialty items | Low | Reinforces domain; each tier adds "doctor equipment" |
| **Animated mascot (Rive/Lottie)** | Breathing, blinking, reacting to quiz performance | High | Duolingo uses Rive with 15-20 mouth shapes for lip sync |
| **Mascot reactions to answers** | Happy on correct, sad on wrong, excited on combo | High | Defer to v3 - requires significant animation work |
| **Preview of next evolution** | "At Level X, your mascot will evolve!" with silhouette | Low | Motivation hook; goal-gradient psychology |

**Research basis:** Duolingo's animated characters blink, react, and sync mouth shapes in real-time using Rive. However, this requires significant animation investment (20+ mouth shapes per character). ([Dev.to](https://dev.to/uianimation/how-duolingo-uses-rive-for-their-character-animation-and-how-you-can-build-a-similar-rive-mascot-5d19))

### Anti-features

Things to deliberately NOT build for v2 mascot system.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **User-customizable avatar** | Scope explosion; Habitica does this but it's their core mechanic | Single mascot that evolves - simpler, more focused |
| **Multiple mascot choices** | Divides development effort; delays v2 | One well-designed mascot > three mediocre ones |
| **Complex Rive animations** | High effort; Duolingo-level requires dedicated animation team | Static images with subtle CSS/Reanimated animations |
| **Mascot in quiz UI** | Distracts from timed quiz gameplay | Mascot on home/results screens only |
| **De-evolution on poor performance** | Punitive; breaks emotional bond | Mascot only evolves forward |
| **Gacha/random evolution** | Wrong genre; undermines clear progression | Deterministic evolution tied to levels |

**Research basis:** Habitica's avatar customization works because it's their core loop, not an add-on. For MedTriads, mascot evolution is supplementary to quiz gameplay. ([BluThrone](https://bluethrone.io/blog/5-app-gamification-examples-you-must-copy-today))

---

## UI Polish Features

### Table Stakes

Features users expect from a polished mobile app. Missing = app feels "unfinished."

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Consistent visual language** | Same spacing, typography, colors across all screens | Medium | v2 goal: Library/Progress/Settings match Home style |
| **Smooth transitions** | Screen changes should animate, not jump | Low | Expo Router + Reanimated already support this |
| **Loading states** | Users must know when something is loading | Low | MedTriads is local-only so minimal, but quiz start should feel responsive |
| **Touch feedback** | Buttons must respond visually + haptically | Low | Already have haptics; ensure all tappable elements have visual feedback |
| **Dark mode support** | Expected on iOS since iOS 13 | Low | Already implemented - verify consistency |

**Research basis:** Consistency is achieved through one color palette, same typography, uniform spacing. This reduces learning curves and improves satisfaction. ([SkyRye Design](https://skyryedesign.com/design/ux-ui/mobile-ui-design/))

### Differentiators

Polish features that would make MedTriads feel premium.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Micro-interactions on key actions** | Subtle animations: buttons scale on press, cards lift on select | Low | "Interfaces feel more alive" - 2025 trend |
| **Celebration confetti** | Perfect round, level-up, milestone achievements | Medium | Use sparingly; keep under 100 particles for 60fps |
| **Haptic feedback on meaningful events** | Level up, correct answer, combo achieved | Low | Already have haptic infrastructure; extend usage |
| **Sound design cohesion** | Audio feedback that matches visual style | Low | Already have sounds; ensure they feel consistent |
| **Skeleton loading states** | Shimmer animations instead of spinners | Low | Modern feel; unnecessary if data loads instantly |

**Research basis:** Motion design and animations add polish through interactive feedback, loading animations, and hover effects. Micro-interactions should guide, reassure, and delight without being intrusive. ([Pixelmatters](https://www.pixelmatters.com/insights/8-ui-design-trends-2025), [DroidsOnRoids](https://www.thedroidsonroids.com/blog/mobile-app-ui-design-guide))

### Anti-features

Things to deliberately NOT build for v2 polish.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Glassmorphism everywhere** | Trendy but can hurt readability; already have established style | Use sparingly if at all; maintain current aesthetic |
| **Heavy parallax/3D effects** | Performance concerns; can trigger motion sickness | Respect `prefers-reduced-motion`; subtle 2D animations |
| **Excessive confetti/particles** | Over 100 particles hurts mobile performance | Keep particle counts low; test on older devices |
| **Sound on every interaction** | Quickly becomes annoying | Reserve sound for meaningful moments (answers, combos, level-ups) |
| **Animation that blocks interaction** | Users waiting = users leaving | All animations should be non-blocking or skippable |
| **Redesigning working components** | If Home screen works, don't reinvent it | Polish other screens to match Home, not redesign everything |

**Research basis:** Less is more with haptics - too much vibration is annoying and numbing. Same principle applies to visual feedback. Reserve celebrations for moments that truly deserve it. ([Android Developers](https://developer.android.com/develop/ui/views/haptics/haptics-principles), [Saropa](https://saropa-contacts.medium.com/2025-guide-to-haptics-enhancing-mobile-ux-with-tactile-feedback-676dd5937774))

---

## Feature Dependencies

```
Onboarding ──────────────────────────────┐
     │                                    │
     v                                    │
Level System ◄──────────────────────────┐│
     │                                   ││
     │    (levels trigger evolution)     ││
     v                                   ││
Mascot Evolution                         ││
     │                                   ││
     │    (evolution shown in UI)        ││
     v                                   ││
UI Polish ◄─────────────────────────────┴┘
     │
     │    (polish applies to all screens including onboarding)
     v
[All screens consistent]
```

**Recommended build order:**
1. **Level System first** - Foundation for mascot evolution triggers
2. **Mascot Evolution second** - Depends on level thresholds
3. **UI Polish third** - Can reference level/mascot in polished screens
4. **Onboarding last** - Can showcase mascot, explain levels in onboarding

---

## MVP Recommendation for v2

### Must Have (Table Stakes)
1. **Onboarding:** 2-3 swipeable screens with skip option, progress dots, value proposition
2. **Level System:** 5-6 tiers with medical-themed names, clear progress indicator, level-up celebration
3. **Mascot Evolution:** Distinct static image per tier, evolution celebration, visible on home screen
4. **UI Polish:** Library/Progress/Settings screens match Home style, consistent spacing/typography

### Should Have (High-Value Differentiators)
1. **Level-up confetti celebration** - Memorable moment, ties systems together
2. **Preview of next mascot evolution** - Motivation hook
3. **Micro-interactions on buttons** - Subtle scale/opacity on press
4. **Medical-themed tier names** - "Intern -> Chief" reinforces domain

### Defer to v3
- Animated Rive mascot with reactions
- Unlockable content per tier
- User-customizable elements
- Leaderboards/social features
- Complex personalization

---

## Recommended Level Tier Structure

Based on research on naming conventions and medical domain:

| Tier | Name | XP Range | Mascot Evolution | Rationale |
|------|------|----------|------------------|-----------|
| 1 | Medical Student | 0-99 | Base mascot | Entry level; everyone starts here |
| 2 | Intern | 100-499 | +Stethoscope | First evolution reward; achievable quickly |
| 3 | Resident | 500-1499 | +White coat | Core progression tier; most time spent here |
| 4 | Fellow | 1500-3999 | +Specialty badge | Advanced; shows dedication |
| 5 | Attending | 4000-9999 | +Full regalia | Expert tier; significant achievement |
| 6 | Department Chief | 10000+ | +Crown/special | Master tier; long-term goal |

**XP calculation suggestion:** 10 XP per quiz completed + 1 XP per correct answer + 5 XP bonus for perfect round

This means:
- Tier 2 (Intern): ~10 quizzes
- Tier 3 (Resident): ~35 quizzes
- Tier 4 (Fellow): ~100 quizzes
- Tier 5 (Attending): ~300 quizzes
- Tier 6 (Chief): ~750 quizzes

---

## Summary

### Key Findings

1. **Onboarding:** Keep it short (2-3 screens), always skippable, show value immediately. The "feature parade" kills retention.

2. **Level System:** 5-6 tiers is ideal. Medical-themed names (Intern -> Chief) reinforce domain and feel aspirational. Progress visibility is critical - users are 2.3x more likely to engage when they can see progress toward goals.

3. **Mascot Evolution:** Static images with distinct visual differences per tier are sufficient for v2. Save animated Rive mascots for v3. Evolution should feel celebratory and tie directly to level progression.

4. **UI Polish:** Consistency across screens is the priority. Micro-interactions add life but should guide/reassure, not distract. Reserve celebrations (confetti, sounds) for meaningful moments.

### Success Metrics to Track

| Metric | Why It Matters |
|--------|----------------|
| Onboarding completion rate | Are users finishing or skipping? |
| Day 7/30 retention | Is progression system driving return visits? |
| Level distribution | Are users progressing or stalling? |
| Quiz completion rate | Are users finishing sessions? |

### Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Onboarding patterns | HIGH | Multiple authoritative sources agree on best practices |
| Level system mechanics | MEDIUM | Patterns clear, but optimal XP curves are app-specific |
| Mascot evolution | MEDIUM | Duolingo case study well-documented, but their scale differs |
| UI polish patterns | HIGH | 2025 design trends well-documented across sources |

---

## Sources

### Onboarding
- [UXCam - App Onboarding Guide](https://uxcam.com/blog/10-apps-with-great-user-onboarding/)
- [Appcues - Ultimate Guide to In-App Onboarding](https://www.appcues.com/blog/in-app-onboarding)
- [Appcues - Mobile Onboarding Best Practices](https://www.appcues.com/blog/mobile-onboarding-best-practices)
- [UserGuiding - Mobile App Onboarding](https://userguiding.com/blog/mobile-app-onboarding)
- [Plotline - Mobile App Onboarding Examples](https://www.plotline.so/blog/mobile-app-onboarding-examples)

### Gamification & Level Systems
- [CleverTap - App Gamification Examples](https://clevertap.com/blog/app-gamification-examples/)
- [Plotline - Streaks and Milestones](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps)
- [Storyly - Gamification Strategies](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement)
- [Adjust - Gamification Guide](https://www.adjust.com/resources/guides/app-gamification/)
- [MemberPress - Naming Membership Levels](https://memberpress.com/blog/the-ultimate-guide-to-naming-your-membership-levels-and-subscription-tiers/)

### Mascot Evolution
- [Apple Developer - Evolution of Duolingo Owl](https://developer.apple.com/news/?id=e2e1faj4)
- [Dev.to - Duolingo Character Animation with Rive](https://dev.to/uianimation/how-duolingo-uses-rive-for-their-character-animation-and-how-you-can-build-a-similar-rive-mascot-5d19)
- [LogoAI - Duolingo Mascot Brand Storytelling](https://www.logoai.com/blog/duolingos-logo-history-and-mascot-brand-storytelling)
- [BluThrone - App Gamification Examples](https://bluethrone.io/blog/5-app-gamification-examples-you-must-copy-today)

### Medical Education Gamification
- [PubMed - Benefits of Gamification in Medical Education](https://pubmed.ncbi.nlm.nih.gov/35637557/)
- [PMC - Gamification Elements in Medical Education](https://pmc.ncbi.nlm.nih.gov/articles/PMC10778414/)
- [Impetus Digital - Medical Education Gamification](https://www.impetusdigital.com/2025/03/06/medical-education-gamification/)

### UI Polish & Design Patterns
- [Pixelmatters - UI Design Trends 2025](https://www.pixelmatters.com/insights/8-ui-design-trends-2025)
- [DroidsOnRoids - Mobile App UI Design](https://www.thedroidsonroids.com/blog/mobile-app-ui-design-guide)
- [SkyRye Design - Mobile UI Design Principles](https://skyryedesign.com/design/ux-ui/mobile-ui-design/)
- [Android Developers - Haptics Principles](https://developer.android.com/develop/ui/views/haptics/haptics-principles)
- [Saropa - 2025 Guide to Haptics](https://saropa-contacts.medium.com/2025-guide-to-haptics-enhancing-mobile-ux-with-tactile-feedback-676dd5937774)
