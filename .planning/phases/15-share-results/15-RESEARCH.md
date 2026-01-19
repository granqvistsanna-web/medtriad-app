# Phase 15: Share Results - Research

**Researched:** 2026-01-19
**Domain:** View capture, iOS share sheet, share card design
**Confidence:** HIGH

## Summary

This phase implements sharing quiz results as an image card via the iOS share sheet. The technical approach combines `react-native-view-shot` for capturing a styled React Native view as an image file, and `expo-sharing` for triggering the native iOS share sheet.

The share card will feature the dedicated `tri-share.png` mascot as the hero element, with score and correct count displayed prominently, a performance-based headline, and subtle MedTriads branding at the bottom. The design follows a playful, game-like aesthetic inspired by Wordle's share cards.

**Primary recommendation:** Use `react-native-view-shot` with `captureRef()` to capture a hidden/offscreen View component styled as the share card, then pass the resulting temp file URI to `expo-sharing`'s `shareAsync()` to open the native share sheet.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-view-shot | 4.0.3 | Capture View as image | Expo-recommended, bundled in Expo Go, stable API |
| expo-sharing | (SDK 54) | Native share sheet | Official Expo package, cross-platform, simple API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-linear-gradient | 15.0.8 | Background gradients | Already in project, works with view-shot |
| react-native-svg | 15.12.1 | Fallback gradients | If expo-linear-gradient has capture issues |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-view-shot | expo-screen-capture | expo-screen-capture captures whole screen, not specific views |
| expo-sharing | react-native-share | react-native-share has more features but requires config plugin, expo-sharing is simpler |

**Installation:**
```bash
npx expo install react-native-view-shot expo-sharing
```

## Architecture Patterns

### Recommended Component Structure
```
components/
  share/
    ShareCard.tsx         # The visual card component (what gets captured)
    useShareCard.ts       # Hook for capture + share logic
    ShareButton.tsx       # Button component for Results screen
```

### Pattern 1: Hidden Capture View
**What:** Render the share card offscreen (position absolute, off-viewport) so it exists in the view hierarchy for capture but is invisible to the user.
**When to use:** When the share card design differs from what's displayed on screen.
**Example:**
```typescript
// Source: https://github.com/gre/react-native-view-shot
import { captureRef } from 'react-native-view-shot';
import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';

function ResultsScreen() {
  const shareCardRef = useRef<View>(null);

  const handleShare = async () => {
    const uri = await captureRef(shareCardRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    await Sharing.shareAsync(uri);
  };

  return (
    <>
      {/* Visible UI */}
      <View style={styles.content}>...</View>

      {/* Hidden share card for capture */}
      <View
        ref={shareCardRef}
        collapsable={false}
        style={styles.hiddenCard}
      >
        <ShareCard score={score} correctCount={correctCount} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hiddenCard: {
    position: 'absolute',
    left: -9999, // Off-screen
  },
});
```

### Pattern 2: Share Card with Fixed Dimensions
**What:** Give the share card explicit pixel dimensions for consistent output across devices.
**When to use:** Always - share cards need predictable sizing.
**Example:**
```typescript
// Share card dimensions - optimized for social sharing
// 1080x1350 = 4:5 aspect ratio, good for Instagram and general sharing
const SHARE_CARD_WIDTH = 1080;
const SHARE_CARD_HEIGHT = 1350;

// Scale for device pixel ratio
import { PixelRatio } from 'react-native';
const pixelRatio = PixelRatio.get();
const scaledWidth = SHARE_CARD_WIDTH / pixelRatio;
const scaledHeight = SHARE_CARD_HEIGHT / pixelRatio;
```

### Pattern 3: Capture Hook
**What:** Encapsulate capture + share logic in a reusable hook.
**When to use:** To keep components clean and logic testable.
**Example:**
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/sharing/
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useRef, useCallback, useState } from 'react';
import { View } from 'react-native';

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

      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  }, [isSharing]);

  return { cardRef, share, isSharing };
}
```

### Anti-Patterns to Avoid
- **Capturing without collapsable={false}:** On Android, views may be optimized away. Always set `collapsable={false}` on the capture target.
- **Transparent backgrounds:** Can cause visual artifacts. Always use an opaque background color.
- **Async image loading during capture:** Images must be fully loaded before capture. Use static requires, not network images.
- **Capturing during animations:** Wait for animations to complete before capturing.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| View to image | Canvas drawing API | react-native-view-shot | Handles pixel ratio, formats, platform differences |
| Share sheet | Custom share UI | expo-sharing | Native sheet handles app selection, permissions |
| Image scaling | Manual pixel math | PixelRatio.get() | Accounts for device density correctly |
| Headline selection | Complex conditionals | Simple percentage thresholds | Keep logic maintainable |

**Key insight:** The capture-to-share pipeline is well-solved by these libraries. Custom implementations add complexity without benefit.

## Common Pitfalls

### Pitfall 1: Blank Image Capture on Android
**What goes wrong:** `captureRef` returns a URI but the image is blank/white.
**Why it happens:** View was collapsed/optimized away by React Native on Android.
**How to avoid:** Set `collapsable={false}` on the View being captured and all parent Views that might be affected.
**Warning signs:** Works on iOS but not Android; image file exists but shows blank.

### Pitfall 2: Missing Images in Capture
**What goes wrong:** Text captures but Image components are blank.
**Why it happens:** Images haven't finished loading when capture runs.
**How to avoid:** Use static `require()` for images, not network URLs. If network images needed, wait for `onLoad` callback.
**Warning signs:** Inconsistent results - sometimes image appears, sometimes not.

### Pitfall 3: Incorrect Dimensions Due to Pixel Ratio
**What goes wrong:** Share card appears smaller/larger than intended on different devices.
**Why it happens:** Not accounting for device pixel density.
**How to avoid:** Divide target pixel dimensions by `PixelRatio.get()` when setting View dimensions.
**Warning signs:** Card looks different sizes when shared from different devices.

### Pitfall 4: Share Sheet Unavailable
**What goes wrong:** `shareAsync` throws or does nothing.
**Why it happens:** Sharing may not be available on all platforms/configurations.
**How to avoid:** Always check `Sharing.isAvailableAsync()` before attempting to share.
**Warning signs:** Works in dev but fails in production or on certain devices.

### Pitfall 5: Gradient Capture Issues
**What goes wrong:** LinearGradient backgrounds render incorrectly or blank in capture.
**Why it happens:** Some native rendering doesn't translate to bitmap capture.
**How to avoid:** Test capture early. If issues occur, use solid backgrounds or react-native-svg gradients.
**Warning signs:** Card looks fine on screen but gradient missing/wrong in shared image.

## Code Examples

Verified patterns from official sources:

### Basic Capture and Share
```typescript
// Source: https://docs.expo.dev/tutorial/screenshot/
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const onShare = async () => {
  try {
    const localUri = await captureRef(imageRef, {
      height: 440,
      quality: 1,
    });

    await Sharing.shareAsync(localUri);
  } catch (e) {
    console.log(e);
  }
};
```

### Share Card Component Structure
```typescript
// ShareCard.tsx - the visual component to capture
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ShareCardProps = {
  score: number;
  correctCount: number;
  totalQuestions: number;
};

// Static require for reliable capture
const triShare = require('@/assets/images/tri-share.png');

export function ShareCard({ score, correctCount, totalQuestions }: ShareCardProps) {
  const headline = getHeadline(correctCount, totalQuestions);

  return (
    <View style={styles.card} collapsable={false}>
      {/* Background - solid or gradient */}
      <LinearGradient
        colors={['#E6FAF8', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <Image source={triShare} style={styles.mascot} />
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.correct}>{correctCount}/{totalQuestions} correct</Text>

      {/* Branding */}
      <View style={styles.brandingBar}>
        <Text style={styles.brandingText}>MedTriads</Text>
      </View>
    </View>
  );
}

function getHeadline(correct: number, total: number): string {
  const accuracy = (correct / total) * 100;
  if (accuracy === 100) return 'Perfect!';
  if (accuracy >= 90) return 'Incredible!';
  if (accuracy >= 70) return 'Great job!';
  if (accuracy >= 50) return 'Good effort!';
  return 'Keep practicing!';
}
```

### Share Button with Loading State
```typescript
// Using existing Button component style
import { Button } from '@/components/ui/Button';

function ShareButton({ onPress, isSharing }: { onPress: () => void; isSharing: boolean }) {
  return (
    <Button
      label={isSharing ? 'Sharing...' : 'Share'}
      onPress={onPress}
      disabled={isSharing}
      variant="secondary"
      icon="square.and.arrow.up" // SF Symbol for share
    />
  );
}
```

### Complete Integration Example
```typescript
// Results screen integration
import { useShareCard } from '@/hooks/useShareCard';
import { ShareCard } from '@/components/share/ShareCard';

export default function ResultsScreen() {
  const { cardRef, share, isSharing } = useShareCard();

  return (
    <SafeAreaView style={styles.container}>
      {/* Visible results UI */}
      <View style={styles.content}>
        {/* ... existing results content ... */}
      </View>

      {/* Action buttons */}
      <View style={styles.buttons}>
        <Button label="Play Again" onPress={handlePlayAgain} />
        <Button label="Share" onPress={share} variant="secondary" disabled={isSharing} />
        <Button label="Home" variant="secondary" onPress={handleHome} />
      </View>

      {/* Hidden share card - positioned off-screen */}
      <View style={styles.offscreen}>
        <View ref={cardRef} collapsable={false}>
          <ShareCard
            score={score}
            correctCount={correctCount}
            totalQuestions={QUESTION_COUNT}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
});
```

## Share Card Design Recommendations

Based on CONTEXT.md decisions and social media best practices:

### Aspect Ratio
**Recommendation:** 4:5 (1080x1350 pixels) or square 1:1 (1080x1080 pixels)
- 4:5 is optimal for Instagram feed
- 1:1 is most universally compatible
- Both work well in iOS share sheet preview

### Layout (Mascot as Hero)
```
+------------------------+
|                        |
|      [Headline]        |   <- "Perfect!" or "Great job!"
|                        |
|     +----------+       |
|     |  Mascot  |       |   <- tri-share.png, centered
|     | (share)  |       |
|     +----------+       |
|                        |
|        [Score]         |   <- Large bold number, e.g., "850"
|                        |
|    [Correct Count]     |   <- "8/10 correct"
|                        |
+------------------------+
|      MedTriads         |   <- Bottom branding bar
+------------------------+
```

### Colors (per CONTEXT.md)
- Background: White or subtle teal gradient (`#E6FAF8` to `#FFFFFF`)
- Teal accents: Use sparingly (branding bar border, perhaps)
- Score: Primary teal (`#4ECDC4`) or dark text (`#2D3436`)
- Branding bar: Subtle, light background with teal text

### Typography
- Headline: Bold, 24-28pt, dark
- Score: Extra bold, 48-56pt (like results screen)
- Correct count: Regular, 16-18pt, muted
- Branding: Medium, 14pt, teal

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual canvas | react-native-view-shot | 2020+ | Standard for RN capture |
| Custom share | expo-sharing | Expo SDK | Native share sheet integration |
| Network images | Static requires | Always | Reliable capture |

**Current best practice:** The react-native-view-shot + expo-sharing combination is the standard approach for Expo apps. No newer alternatives have emerged that offer significant advantages.

## Open Questions

Things that couldn't be fully resolved:

1. **Gradient capture on Android**
   - What we know: expo-linear-gradient generally works with view-shot
   - What's unclear: Whether current project's gradient usage will capture correctly
   - Recommendation: Test early; have solid background fallback ready

2. **Exact card dimensions**
   - What we know: 4:5 or 1:1 are safe ratios
   - What's unclear: What looks best with mascot-centric layout
   - Recommendation: Start with 1080x1350, adjust based on visual testing

3. **Share button animation timing**
   - What we know: Results screen has staggered entry animations
   - What's unclear: When share button should become enabled
   - Recommendation: Enable after main content animations complete (~800ms)

## Sources

### Primary (HIGH confidence)
- [Expo Sharing Documentation](https://docs.expo.dev/versions/latest/sdk/sharing/) - API reference
- [Expo captureRef Documentation](https://docs.expo.dev/versions/latest/sdk/captureRef/) - API reference
- [Expo Screenshot Tutorial](https://docs.expo.dev/tutorial/screenshot/) - Complete implementation guide
- [react-native-view-shot GitHub](https://github.com/gre/react-native-view-shot) - Full API, options, examples

### Secondary (MEDIUM confidence)
- [Social Media Image Sizes 2025](https://buffer.com/resources/social-media-image-sizes/) - Dimension recommendations
- [react-native-view-shot npm](https://www.npmjs.com/package/react-native-view-shot) - Version info, basic usage

### Tertiary (LOW confidence)
- GitHub Issues for view-shot - Pitfall discovery, workarounds for edge cases

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Expo packages, well-documented
- Architecture: HIGH - Established patterns, official tutorials
- Pitfalls: MEDIUM - Based on GitHub issues, may not affect this project
- Design recommendations: MEDIUM - Based on context decisions + web search

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - stable libraries)
