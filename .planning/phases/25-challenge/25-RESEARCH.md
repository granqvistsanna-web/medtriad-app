# Phase 25: Challenge - Research

**Researched:** 2026-01-20
**Domain:** Social share card generation and system share sheet integration
**Confidence:** HIGH

## Summary

This phase enhances the existing share functionality to create a "Challenge a Friend" feature with competitive messaging. The MedTriads app already has working share infrastructure:

1. **expo-sharing** (v14.0.8) - Opens native share sheet
2. **react-native-view-shot** (v4.0.3) - Captures views as images
3. **ShareCard** component - Visual card for sharing quiz results
4. **useShareCard** hook - Handles capture and share flow

The primary work is UX-focused: renaming "Share" to "Challenge a Friend", adding competitive messaging to the share card, and potentially enhancing the card's visual design for a challenge context.

**Primary recommendation:** Update the existing ShareCard component with competitive messaging variants and add a dedicated "Challenge a Friend" button to the Results screen. Leverage all existing infrastructure.

## Standard Stack

The established libraries/tools for this domain:

### Core (ALREADY INSTALLED)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-sharing | 14.0.8 | Native share sheet API | Expo's official, well-maintained |
| react-native-view-shot | 4.0.3 | Capture views as images | De facto standard, 2500+ GitHub stars |

### Supporting (ALREADY INSTALLED)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-reanimated | 4.1.1 | Button press animations | Existing in Button primitive |
| expo-image | 3.0.11 | Mascot images | ShareCard mascot display |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-sharing | react-native-share | More features but heavier; expo-sharing sufficient |
| react-native-view-shot | react-native-screenshot | View-shot is more reliable, better maintained |

**Installation:**
No new dependencies required - all libraries already installed.

## Architecture Patterns

### Existing Project Structure

```
medtriad/
├── components/
│   ├── share/
│   │   └── ShareCard.tsx       # Existing share card component
│   └── primitives/
│       └── Button.tsx          # Existing Button with icon support
├── hooks/
│   └── useShareCard.ts         # Existing capture/share hook
└── app/
    └── quiz/
        └── results.tsx         # Existing Results screen with share
```

### Pattern: Competitive Messaging Based on Score

**What:** Dynamic challenge text that varies based on performance
**When to use:** Share cards with competitive/social context
**Example:**
```typescript
// Source: Best practice from Duolingo's streak milestone feature
function getChallengeMessage(accuracy: number): string {
  if (accuracy === 100) return "Beat my perfect score!";
  if (accuracy >= 90) return "Think you can beat this?";
  if (accuracy >= 70) return "Challenge accepted?";
  if (accuracy >= 50) return "Can you do better?";
  return "Let's see what you've got!";
}
```

### Pattern: Offscreen View Capture

**What:** Render share card offscreen, capture as image
**When to use:** Generating shareable images from React components
**Example:**
```typescript
// Source: Existing implementation in results.tsx
// Hidden share card for capture
<View style={styles.offscreen}>
  <View ref={cardRef} collapsable={false}>
    <ShareCard ... />
  </View>
</View>

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
});
```

### Anti-Patterns to Avoid

- **Visible capture flicker:** Don't capture visible views - use offscreen rendering
- **Missing collapsable={false}:** Android requires this prop for view-shot to work
- **Transparent backgrounds:** Always use solid backgrounds to avoid artifacts
- **Capturing during layout:** Wait for layout to complete before capture

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image capture | Custom screenshot logic | react-native-view-shot | Handles platform differences |
| Share dialog | Custom share UI | expo-sharing + native sheet | Users expect native share experience |
| Share card design | Complex gradient/effects | Solid colors + existing design system | Reliable capture across devices |

**Key insight:** The existing implementation handles all the hard parts. This phase is primarily UX enhancement, not infrastructure.

## Common Pitfalls

### Pitfall 1: Black/Blank Image Capture on Android

**What goes wrong:** captureRef returns blank or black image
**Why it happens:** Android view flattening removes views not on screen
**How to avoid:** Always set `collapsable={false}` on captured view and its parent
**Warning signs:** Works on iOS but fails on Android

### Pitfall 2: Layout Not Complete During Capture

**What goes wrong:** Content size must not be zero error
**Why it happens:** Capturing before layout finishes
**How to avoid:** Wait for onLayout or add small timeout; existing useShareCard handles this
**Warning signs:** Intermittent failures on first render

### Pitfall 3: Image Size Mismatch

**What goes wrong:** Captured image is 2-3x larger than expected
**Why it happens:** Capture at device pixel density, not logical pixels
**How to avoid:** Use fixed dimensions on ShareCard (existing: 360x450)
**Warning signs:** Massive file sizes, blurry on downscale

### Pitfall 4: Share Sheet Not Available

**What goes wrong:** Share fails silently
**Why it happens:** Some devices/simulators don't support sharing
**How to avoid:** Check Sharing.isAvailableAsync() first (existing hook does this)
**Warning signs:** "Sharing not available" console error

### Pitfall 5: Competitive Messaging Feels Aggressive

**What goes wrong:** Users feel challenged text is too pushy
**Why it happens:** Wrong tone for the context
**How to avoid:** Use playful, encouraging language; match app's friendly tone
**Warning signs:** User feedback about tone; decline in sharing

## Code Examples

Verified patterns from existing codebase and official sources:

### Existing ShareCard Component

```typescript
// Source: medtriad/components/share/ShareCard.tsx
export function ShareCard({ score, correctCount, totalQuestions }: ShareCardProps) {
  const headline = getHeadline(correctCount, totalQuestions);

  return (
    <View style={styles.card} collapsable={false}>
      <Text variant="titleLarge" style={styles.headline}>
        {headline}
      </Text>
      <View style={styles.mascotContainer}>
        <Image source={triShare} style={styles.mascot} resizeMode="contain" />
      </View>
      <Text variant="display" color={theme.colors.brand.primary} style={styles.score}>
        {score.toLocaleString()}
      </Text>
      <Text variant="body" color="secondary" style={styles.correctCount}>
        {correctCount}/{totalQuestions} correct
      </Text>
      <View style={[styles.brandingBar, { backgroundColor: theme.colors.surface.brand }]}>
        <Text variant="label" color={theme.colors.brand.primary} weight="semibold">
          MedTriads
        </Text>
      </View>
    </View>
  );
}
```

### Existing useShareCard Hook

```typescript
// Source: medtriad/hooks/useShareCard.ts
export function useShareCard() {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async () => {
    if (!cardRef.current || isSharing) return;
    setIsSharing(true);

    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.error('Sharing not available');
        return;
      }

      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  }, [isSharing]);

  return { cardRef, share, isSharing };
}
```

### expo-sharing Options

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/sharing/
await Sharing.shareAsync(uri, {
  mimeType: 'image/png',           // Required for Android Intent routing
  dialogTitle: 'Challenge a Friend', // Android only - share dialog title
  // UTI: 'public.png',            // iOS only - Uniform Type Identifier
});
```

### Solar Icon for Challenge Button

```typescript
// Source: medtriad/constants/DESIGN-SYSTEM.md - Icon mapping
import { ShareCircle } from '@solar-icons/react-native/Bold';
// OR for a more competitive feel:
import { UsersGroupTwoRounded } from '@solar-icons/react-native/Bold';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic "Share" | Contextual "Challenge a Friend" | Duolingo 2024-2025 | Higher engagement |
| Static share text | Score-based competitive messaging | Industry trend 2024 | More personalized |
| Share only results | Share cards with branding | Standard practice | Better viral growth |

**Deprecated/outdated:**
- Sharing URLs only: Modern apps share rich visual cards
- Generic share buttons: Contextual CTAs perform better

## Open Questions

Things that couldn't be fully resolved:

1. **Icon Choice for Challenge Button**
   - What we know: ShareCircle exists and is used elsewhere; UsersGroupTwoRounded available
   - What's unclear: Which icon best communicates "challenge" intent
   - Recommendation: Use ShareCircle for consistency or test UsersGroupTwoRounded

2. **Competitive Message Tone**
   - What we know: Duolingo uses playful, encouraging language
   - What's unclear: Exact wording that fits MedTriads' educational context
   - Recommendation: Start with suggested messages, iterate based on feedback

3. **Button Placement**
   - What we know: Current "Share" is in secondary button row
   - What's unclear: Should "Challenge a Friend" be more prominent?
   - Recommendation: Keep current placement; consider A/B testing prominence

## Sources

### Primary (HIGH confidence)
- Existing codebase: `medtriad/components/share/ShareCard.tsx`, `medtriad/hooks/useShareCard.ts`, `medtriad/app/quiz/results.tsx`
- [expo-sharing documentation](https://docs.expo.dev/versions/latest/sdk/sharing/) - API reference
- [react-native-view-shot GitHub](https://github.com/gre/react-native-view-shot) - Capture options and troubleshooting

### Secondary (MEDIUM confidence)
- [Duolingo streak milestone design blog](https://blog.duolingo.com/streak-milestone-design-animation/) - Share card design inspiration
- [Duolingo gamification case study](https://trophy.so/blog/duolingo-gamification-case-study) - Social sharing patterns

### Tertiary (LOW confidence)
- WebSearch results for competitive messaging UX patterns - general industry trends

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and working
- Architecture: HIGH - Existing implementation verified in codebase
- Pitfalls: HIGH - Common issues documented in official sources
- Competitive messaging: MEDIUM - Based on Duolingo patterns, not verified in medical context

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable libraries, minor UX changes)

---

## Implementation Recommendations

Given the existing infrastructure, the implementation should focus on:

1. **Rename button:** "Share" -> "Challenge a Friend" on Results screen
2. **Add competitive messaging:** Dynamic challenge text in ShareCard based on score
3. **Update card design:** Consider adding "Challenge" header or competitive visual element
4. **Keep existing hook:** useShareCard works perfectly, no changes needed
5. **Test on both platforms:** Verify capture works on iOS and Android

**Estimated scope:** Small - primarily component updates, no new libraries or hooks needed.
