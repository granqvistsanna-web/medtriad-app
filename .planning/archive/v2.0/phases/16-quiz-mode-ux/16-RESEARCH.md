# Phase 16: Quiz Mode UX - Research

**Researched:** 2026-01-19
**Domain:** React Native layout, feedback animations, responsive design
**Confidence:** HIGH

## Summary

This phase focuses on improving the quiz screen's visual hierarchy and ensuring all content fits without scrolling. The current implementation already has a solid foundation - it uses `useWindowDimensions` for height, flexbox for layout, and has a working shake animation for incorrect answers. The main changes are:

1. **Remove text feedback** - Delete the "Correct!"/"Incorrect!" text at the bottom (lines 274-290 in quiz/index.tsx)
2. **Improve symptoms card contrast** - Add distinct background color using existing `backgroundSecondary` token
3. **Add "IDENTIFY THE TRIAD" label** - Above the symptoms card with small caps styling
4. **Refine shake animation** - Current animation is timing-based; should use spring for consistency with design system
5. **Remove checkmark/X icons** - Button feedback via color fill only
6. **Dynamic spacing** - Adjust gaps based on screen height to guarantee no-scroll

**Primary recommendation:** This is a surgical refactoring phase - modify existing components rather than rebuild. The AnswerCard and FindingsCard components need targeted updates, and the main quiz screen layout needs dynamic spacing.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | (existing) | Animations | Already used throughout app |
| useWindowDimensions | (RN built-in) | Responsive layout | Already in quiz/index.tsx |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| useSafeAreaInsets | (existing) | Safe area handling | Already used for top/bottom padding |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Fixed spacing | Percentage heights | Percentage-based layouts less predictable with flexbox |
| Dynamic spacing calculation | react-native-responsive-fontsize | Overkill for this scope; manual calculation preferred |

**Installation:**
No new packages required - all tools already in use.

## Architecture Patterns

### Current Quiz Screen Structure
```
<View container height={windowHeight}>
  <View header>           // ~56px fixed
    <CancelButton />
    <Progress "X of 10" />
    <Streak + Score />
  </View>

  <View main flex={1}>
    <TimerBar />          // ~72px (mascot + bar + number)
    <FindingsCard />      // Variable, ~150-200px
    <View answersSection> // flex: 1, fills remaining
      4x <AnswerCard />   // 48px each + gaps
    </View>
    <FeedbackText />      // ~32px - TO BE REMOVED
  </View>
</View>
```

### Target Structure
```
<View container height={windowHeight}>
  <View header>           // ~56px fixed
    <CancelButton />
    <Progress "X of 10" />
    <Streak + Score />
  </View>

  <View main flex={1}>
    <TimerBar />          // ~72px
    <Text label>IDENTIFY THE TRIAD</Text>
    <FindingsCard />      // Distinct background, no border/shadow
    <View answersSection flex={1}>
      4x <AnswerCard />   // 48pt min height, dynamic spacing
    </View>
    // No feedback text - removed
  </View>
</View>
```

### Pattern 1: Dynamic Spacing Based on Screen Height
**What:** Calculate available space and distribute to gaps proportionally
**When to use:** When content must fit without scrolling across device sizes
**Example:**
```typescript
const { height } = useWindowDimensions();
const insets = useSafeAreaInsets();

// Fixed heights
const HEADER_HEIGHT = 56;
const TIMER_HEIGHT = 72;
const LABEL_HEIGHT = 20;
const FINDINGS_CARD_ESTIMATE = 180;
const ANSWER_HEIGHT = 48;
const ANSWER_COUNT = 4;

// Calculate available space
const usableHeight = height - insets.top - insets.bottom;
const fixedContent = HEADER_HEIGHT + TIMER_HEIGHT + LABEL_HEIGHT + FINDINGS_CARD_ESTIMATE + (ANSWER_HEIGHT * ANSWER_COUNT);
const availableForGaps = usableHeight - fixedContent;

// Distribute to gaps (5 gaps: after timer, after label, after findings, 3 between answers)
const baseGap = Math.max(Spacing.sm, Math.min(Spacing.md, availableForGaps / 6));
```

### Pattern 2: Spring-Based Shake Animation
**What:** Replace timing-based shake with spring for physical feel
**When to use:** Error feedback animations
**Example:**
```typescript
// Current (timing-based - to be replaced):
shakeX.value = withSequence(
  withTiming(-8, { duration: 50 }),
  withTiming(8, { duration: 50 }),
  withTiming(-6, { duration: 50 }),
  withTiming(6, { duration: 50 }),
  withTiming(0, { duration: 50 })
);

// Recommended (spring-based):
shakeX.value = withSequence(
  withSpring(-6, { damping: 3, stiffness: 500 }),
  withSpring(6, { damping: 3, stiffness: 500 }),
  withSpring(-4, { damping: 5, stiffness: 500 }),
  withSpring(0, { damping: 10, stiffness: 300 })
);
```

### Anti-Patterns to Avoid
- **ScrollView for quiz content:** Quiz must be single-screen, no scrolling
- **Fixed pixel heights on flex containers:** Use flex: 1 for expandable sections
- **Timing-based animations for physical motion:** Springs feel more natural

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shake animation | Custom oscillation math | withSequence + withSpring | Reanimated handles spring physics |
| Safe area handling | Manual inset calculation | useSafeAreaInsets | Already implemented and tested |
| Color interpolation | Manual color math | Theme tokens | Consistent design system |
| Entry animations | Manual fade/translate | FadeInUp.springify() | Reanimated layout animations |

**Key insight:** The current codebase already has the right patterns - this phase is about refinement, not rebuilding.

## Common Pitfalls

### Pitfall 1: Over-constraining Layout
**What goes wrong:** Setting fixed heights on all elements leaves no flexibility for different screen sizes
**Why it happens:** Trying to guarantee exact pixel-perfect layout
**How to avoid:** Use flex: 1 on one section (answersSection) as the "shock absorber" that expands/contracts
**Warning signs:** Content gets cut off on smaller phones, excess whitespace on larger phones

### Pitfall 2: Forgetting Safe Area on Bottom
**What goes wrong:** Answer buttons get too close to home indicator on notched phones
**Why it happens:** Only accounting for top safe area
**How to avoid:** Always apply paddingBottom: insets.bottom (already done in current implementation)
**Warning signs:** Bottom button hard to tap on iPhone X and later

### Pitfall 3: Text Feedback Removal Breaking Auto-Advance
**What goes wrong:** Removing feedback text but leaving feedbackText state causes stale state issues
**Why it happens:** State is set but never consumed
**How to avoid:** Also remove setFeedbackText calls or refactor to only set correct answer for display purposes
**Warning signs:** Console warnings about setting state on unmounted component

### Pitfall 4: Shake Animation Not Subtle Enough
**What goes wrong:** Shake is too aggressive, feels punishing
**Why it happens:** Large translateX values (8-10px)
**How to avoid:** Keep shake small (4-6px), 2-3 oscillations max, quick settle
**Warning signs:** User flinches when getting answer wrong

### Pitfall 5: Answer Auto-Advance Timing Mismatch
**What goes wrong:** Auto-advance happens before user processes feedback
**Why it happens:** ANSWER_DELAY doesn't account for shake animation duration
**How to avoid:** 1.2 seconds (per CONTEXT.md) should be sufficient - shake completes in ~200ms
**Warning signs:** User misses what the correct answer was

## Code Examples

Verified patterns from existing codebase:

### Remove Icon from AnswerCard
```typescript
// In AnswerCard.tsx - remove getIcon function and icon rendering
// Lines 130-139 and 169-177 should be removed

// Keep color-based feedback:
const getBackgroundColor = () => {
  switch (state) {
    case 'correct':
      return colors.successBg;  // Green fill
    case 'incorrect':
      return colors.errorBg;    // Red fill
    case 'revealed':
      return colors.successBg;  // Green fill for correct answer reveal
    case 'faded':
      return colors.backgroundCard;
    default:
      return colors.backgroundCard;
  }
};
```

### Background Contrast for FindingsCard
```typescript
// In FindingsCard.tsx - use backgroundSecondary instead of backgroundCard
<View
  style={[
    styles.card,
    {
      backgroundColor: colors.backgroundSecondary, // #F8F9FA - subtle contrast
      // Remove: borderColor, borderWidth, shadow
    },
  ]}
>
```

### "IDENTIFY THE TRIAD" Label
```typescript
// In quiz/index.tsx - add above FindingsCard
<Text style={[styles.identifyLabel, { color: colors.textMuted }]}>
  IDENTIFY THE TRIAD
</Text>

// Style:
identifyLabel: {
  ...Typography.tiny,           // fontSize: 11, fontWeight: 600
  textTransform: 'uppercase',
  letterSpacing: 1.5,
  textAlign: 'center',
},
```

### Update ANSWER_DELAY
```typescript
// In quiz/index.tsx - change from 1500 to 1200 per CONTEXT.md
const ANSWER_DELAY = 1200;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Text feedback | Color-only feedback | This phase | Cleaner, faster to parse |
| Bordered cards | Background contrast | This phase | Softer visual hierarchy |
| Fixed spacing | Dynamic spacing | This phase | Works on all screen sizes |

**Deprecated/outdated:**
- "Correct!"/"Incorrect!" text: Being removed in favor of visual-only feedback
- Icon indicators on answer buttons: Being removed per user decision

## Open Questions

Things that couldn't be fully resolved:

1. **Exact shade for symptoms card background**
   - What we know: Should be different from white background, no border/shadow
   - What's unclear: Whether backgroundSecondary (#F8F9FA) provides enough contrast
   - Recommendation: Start with backgroundSecondary, adjust if too subtle

2. **Larger screen scaling strategy**
   - What we know: Larger screens should scale up content (bigger text and buttons)
   - What's unclear: Exact breakpoint and scale factor
   - Recommendation: Test on iPad, consider 1.2x scale factor for height > 900px

## Sources

### Primary (HIGH confidence)
- `/medtriad/app/quiz/index.tsx` - Current quiz screen implementation
- `/medtriad/components/quiz/AnswerCard.tsx` - Answer button with existing shake
- `/medtriad/components/quiz/FindingsCard.tsx` - Symptoms display card
- `/medtriad/constants/theme.ts` - Design system tokens
- `/medtriad/constants/DESIGN-SYSTEM.md` - Motion and styling patterns

### Secondary (MEDIUM confidence)
- [React Native useWindowDimensions](https://reactnative.dev/docs/usewindowdimensions) - Official hook documentation
- [Reanimated withSequence](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/) - Animation composition
- [Responsive Design in React Native](https://dev.to/aomuiz/responsive-design-in-react-native-building-apps-for-multiple-screen-sizes-1fnf) - Community patterns

### Tertiary (LOW confidence)
- General web search on shake animation parameters - verified against existing codebase patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all tools already in use in codebase
- Architecture: HIGH - clear understanding of current implementation
- Pitfalls: HIGH - based on code review and existing patterns

**Research date:** 2026-01-19
**Valid until:** 60 days (stable, no external dependencies changing)
