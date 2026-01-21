# Phase 7: Polish - Research

**Researched:** 2026-01-18
**Domain:** Animations, sound effects, visual feedback polish
**Confidence:** HIGH

## Summary

This phase adds polish to existing functionality through four discrete features: timer urgency visuals (ANIM-03), button press feedback (ANIM-04), results score count-up (ANIM-05), and sound effects (FEED-05). The codebase already has substantial animation infrastructure using react-native-reanimated ~4.1.1 and expo-haptics ~15.0.8.

The AnswerCard component already implements button press scale animation with withSpring. The TimerRing component uses SVG Circle with threshold-based color changes. The results screen uses staggered FadeInUp animations. Sound effects require adding expo-audio for playback with settings-storage integration for the user preference toggle.

Per user decisions: subtle/minimal sounds (soft clicks and chimes), no timer sounds (visual urgency only), no sound on perfect round (confetti visual is celebration), and confetti burst for 10/10 perfect rounds.

**Primary recommendation:** Extend existing implementations rather than rebuilding. Add expo-audio for sounds, use-count-up for score animation, react-native-confetti-cannon for perfect round celebration. Enhance TimerRing with pulse/shake effects using existing reanimated patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | All animations (scale, pulse, shake) | Already installed, used throughout app |
| expo-audio | ~1.1 | Sound effect playback | Newer Expo audio API, simpler than expo-av |
| use-count-up | ^3.0 | Score count-up animation | Lightweight, React Native compatible, declarative |
| react-native-confetti-cannon | ^1.5 | Perfect round confetti burst | Simple API, Expo compatible, uses RN Animated |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-av | ~15.0 | Alternative audio if expo-audio has issues | Fallback only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-audio | expo-av | expo-av is older, more complex API; expo-audio is simpler for sound effects |
| use-count-up | Custom reanimated | use-count-up is 3KB, handles timing/easing, less code to maintain |
| react-native-confetti-cannon | react-native-fast-confetti | fast-confetti requires Skia (adds ~3MB), overkill for single burst |
| react-native-confetti-cannon | lottie-react-native | Lottie adds larger dependency, less control over confetti params |

**Installation:**
```bash
cd medtriad
npx expo install expo-audio
npm install use-count-up react-native-confetti-cannon
```

## Architecture Patterns

### Existing File Structure (Extend This)
```
medtriad/
├── components/quiz/
│   ├── AnswerCard.tsx          # Has withSpring scale (0.98) - enhance to be more visible
│   └── TimerRing.tsx           # Has color thresholds - add pulse/shake for urgency
├── components/results/
│   └── HighScoreBadge.tsx      # Static - add scale bounce animation
├── services/
│   └── settings-storage.ts     # Has soundEnabled toggle - use for sound gating
├── hooks/
│   └── useSettings.ts          # Need to create or check if exists
└── app/quiz/
    ├── index.tsx               # Has handleAnswerSelect - add sound triggers
    └── results.tsx             # Has score display - add count-up, confetti
```

### New Files to Create
```
medtriad/
├── hooks/
│   └── useSoundEffects.ts      # Sound loading + playback with settings check
└── assets/
    └── sounds/
        ├── correct.mp3         # Soft positive chime (~0.3s)
        ├── incorrect.mp3       # Subtle low tone (~0.3s)
        └── combo.mp3           # Brief celebratory ding (~0.2s)
```

### Pattern 1: Sound Effects Service with Settings Integration
**What:** Hook that preloads sounds and gates playback based on settings
**When to use:** All sound effect triggers
**Example:**
```typescript
// Source: expo-audio docs + settings-storage.ts pattern
import { useAudioPlayer } from 'expo-audio';
import { useSettings } from '@/hooks/useSettings';

export function useSoundEffects() {
  const { settings } = useSettings();

  const correctPlayer = useAudioPlayer(require('@/assets/sounds/correct.mp3'));
  const incorrectPlayer = useAudioPlayer(require('@/assets/sounds/incorrect.mp3'));
  const comboPlayer = useAudioPlayer(require('@/assets/sounds/combo.mp3'));

  const playSound = (type: 'correct' | 'incorrect' | 'combo') => {
    if (!settings.soundEnabled) return;

    const player = {
      correct: correctPlayer,
      incorrect: incorrectPlayer,
      combo: comboPlayer,
    }[type];

    // Reset to start for replay capability
    player.seekTo(0);
    player.play();
  };

  return { playSound };
}
```

### Pattern 2: Timer Urgency Animation (Pulse + Shake)
**What:** Visual urgency in final 3 seconds via scale pulse and subtle shake
**When to use:** TimerRing when seconds <= 3
**Example:**
```typescript
// Source: react-native-reanimated docs
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

// In TimerRing component
const pulseScale = useSharedValue(1);
const shakeX = useSharedValue(0);

useEffect(() => {
  if (seconds <= 3 && seconds > 0) {
    // Pulse: scale up and down repeatedly
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) })
      ),
      -1, // Infinite while condition holds
      false
    );

    // Subtle shake at <= 2 seconds
    if (seconds <= 2) {
      shakeX.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 50 }),
          withTiming(2, { duration: 50 }),
          withTiming(0, { duration: 50 })
        ),
        -1,
        false
      );
    }
  } else {
    // Reset when not in danger zone
    pulseScale.value = withTiming(1, { duration: 100 });
    shakeX.value = withTiming(0, { duration: 100 });
  }
}, [seconds]);

const urgencyStyle = useAnimatedStyle(() => ({
  transform: [
    { scale: pulseScale.value },
    { translateX: shakeX.value },
  ],
}));
```

### Pattern 3: Button Press Scale Animation
**What:** Visible scale-down on press with spring bounce
**When to use:** Answer button press (already implemented, enhance visibility)
**Example:**
```typescript
// Source: existing AnswerCard.tsx + withSpring docs
// Current: scale to 0.98 - subtle
// Enhanced: scale to 0.95 - more visible

const handlePressIn = () => {
  if (!disabled && state === 'default') {
    scale.value = withSpring(0.95, {
      damping: 12,      // Slightly less damping = more bounce
      stiffness: 300,   // Responsive feel
    });
  }
};

const handlePressOut = () => {
  scale.value = withSpring(1, {
    damping: 10,        // Bouncy return
    stiffness: 300,
  });
};
```

### Pattern 4: Score Count-Up Animation
**What:** Animate score from 0 to final value over ~1 second
**When to use:** Results screen score display
**Example:**
```typescript
// Source: use-count-up docs
import { Text } from 'react-native';
import { CountUp } from 'use-count-up';

// In results.tsx score display
<Text style={[styles.score, { color: colors.primary }]}>
  <CountUp
    isCounting
    start={0}
    end={score}
    duration={1}
    thousandsSeparator=","
  />
</Text>
```

### Pattern 5: Confetti Burst for Perfect Round
**What:** Confetti cannon on 10/10 perfect round
**When to use:** Results screen when isPerfect === true
**Example:**
```typescript
// Source: react-native-confetti-cannon docs
import ConfettiCannon from 'react-native-confetti-cannon';
import { useRef, useEffect } from 'react';

// In results.tsx
const confettiRef = useRef<any>(null);

useEffect(() => {
  if (isPerfect) {
    // Slight delay to let screen render first
    const timeout = setTimeout(() => {
      confettiRef.current?.start();
    }, 300);
    return () => clearTimeout(timeout);
  }
}, [isPerfect]);

// In render, at the end (fullscreen overlay)
{isPerfect && (
  <ConfettiCannon
    ref={confettiRef}
    count={150}
    origin={{ x: width / 2, y: 0 }}
    fallSpeed={3000}
    fadeOut
    autoStart={false}
    colors={['#3B82F6', '#22C55E', '#FACC15', '#F97316', '#EC4899']}
  />
)}
```

### Pattern 6: High Score Badge Scale Bounce
**What:** Badge pops in with spring scale effect
**When to use:** HighScoreBadge appearance
**Example:**
```typescript
// Source: reanimated entering animation
import Animated, { ZoomIn } from 'react-native-reanimated';

// Replace View with Animated.View in HighScoreBadge
<Animated.View
  entering={ZoomIn.springify().damping(12)}
  style={[styles.badge, ...]}
>
```

### Anti-Patterns to Avoid
- **Playing sounds without checking settings:** Always gate with `settings.soundEnabled`
- **Creating new AudioPlayer on each call:** Preload once in hook, reuse players
- **Animating SVG stroke directly:** Use container transform for urgency (Reanimated + SVG stroke dashoffset is complex)
- **Blocking UI for sound loading:** expo-audio preloads automatically, no await needed for play
- **Heavy confetti count:** 150-200 particles is sufficient, more causes frame drops

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number count-up animation | Custom timer + text update | use-count-up | Handles timing, easing, formatting edge cases |
| Confetti particles | Custom particle system | react-native-confetti-cannon | Physics, colors, fade handled; Expo compatible |
| Sound preloading | Manual Audio.Sound.loadAsync | expo-audio useAudioPlayer | Auto cleanup, simpler API, preload option |
| Spring physics for buttons | Manual withTiming curves | withSpring | Natural feel, handles interrupts properly |

**Key insight:** This phase is about polish, not core functionality. Use established libraries to avoid reinventing complex animation/audio systems.

## Common Pitfalls

### Pitfall 1: Sound Not Playing on First Tap
**What goes wrong:** First sound trigger is silent or delayed
**Why it happens:** Audio not preloaded before playback requested
**How to avoid:** Use expo-audio's useAudioPlayer which preloads on hook initialization; consider `downloadFirst: true` option
**Warning signs:** First tap silent, subsequent taps work

### Pitfall 2: Timer Pulse Animation Memory Leak
**What goes wrong:** Animation continues after component unmount or timer reset
**Why it happens:** withRepeat(-1) runs forever, not cancelled on condition change
**How to avoid:** Use cancelAnimation() from reanimated when resetting, or let the conditional useEffect handle re-triggering
**Warning signs:** Animations stack up, performance degrades

### Pitfall 3: Confetti Renders Under Content
**What goes wrong:** Confetti appears behind results content
**Why it happens:** Z-index stacking context issues with absolute positioning
**How to avoid:** Render confetti LAST in the component tree (at bottom); use `pointerEvents="none"` style
**Warning signs:** Confetti visible but covered by cards/buttons

### Pitfall 4: Count-Up Shows Wrong Number Type
**What goes wrong:** Score shows "1,234.00" instead of "1,234"
**Why it happens:** use-count-up defaults may include decimals
**How to avoid:** Explicitly set `decimalPlaces={0}` or omit the prop for whole numbers
**Warning signs:** Decimal places in integer scores

### Pitfall 5: Sound Plays When Disabled in Settings
**What goes wrong:** Sound effects play even though user toggled them off
**Why it happens:** Settings loaded async, hook returns stale value; or settings not checked before play
**How to avoid:** Always check `settings.soundEnabled` inside the playSound function, not outside
**Warning signs:** User complaints after disabling sound

### Pitfall 6: Button Scale Animation Feels Unresponsive
**What goes wrong:** Press animation doesn't feel instant/satisfying
**Why it happens:** Spring physics too slow (high damping) or scale change too subtle
**How to avoid:** Use lower damping (10-12), higher stiffness (300-400), visible scale (0.95 not 0.98)
**Warning signs:** Animation feels "floaty" or imperceptible

## Code Examples

Verified patterns from official sources and existing codebase:

### Complete Sound Effects Hook
```typescript
// medtriad/hooks/useSoundEffects.ts
import { useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';
import { loadSettings } from '@/services/settings-storage';

type SoundType = 'correct' | 'incorrect' | 'combo';

export function useSoundEffects() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings().then((settings) => {
      setSoundEnabled(settings.soundEnabled);
    });
  }, []);

  // Preload all sounds
  const correctPlayer = useAudioPlayer(
    require('@/assets/sounds/correct.mp3'),
    { downloadFirst: true }
  );
  const incorrectPlayer = useAudioPlayer(
    require('@/assets/sounds/incorrect.mp3'),
    { downloadFirst: true }
  );
  const comboPlayer = useAudioPlayer(
    require('@/assets/sounds/combo.mp3'),
    { downloadFirst: true }
  );

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;

    const player = {
      correct: correctPlayer,
      incorrect: incorrectPlayer,
      combo: comboPlayer,
    }[type];

    player.seekTo(0);
    player.play();
  }, [soundEnabled, correctPlayer, incorrectPlayer, comboPlayer]);

  // Re-sync if settings change externally
  const refreshSettings = useCallback(async () => {
    const settings = await loadSettings();
    setSoundEnabled(settings.soundEnabled);
  }, []);

  return { playSound, refreshSettings };
}
```

### Timer Urgency Animation Integration
```typescript
// In TimerRing.tsx - add urgency animation
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

// Inside component
const pulseScale = useSharedValue(1);

useEffect(() => {
  if (seconds <= 3 && seconds > 0) {
    // Create accelerating pulse
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 120, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 120, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
  } else {
    // Cancel and reset
    cancelAnimation(pulseScale);
    pulseScale.value = withTiming(1, { duration: 100 });
  }

  return () => {
    cancelAnimation(pulseScale);
  };
}, [seconds]);

const pulseStyle = useAnimatedStyle(() => ({
  transform: [{ scale: pulseScale.value }],
}));

// Wrap container with animated style
return (
  <Animated.View style={[styles.container, pulseStyle]}>
    {/* existing SVG content */}
  </Animated.View>
);
```

### Results Screen with Count-Up and Confetti
```typescript
// In results.tsx - modify score display section
import { CountUp } from 'use-count-up';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useWindowDimensions } from 'react-native';

// In component
const { width } = useWindowDimensions();
const confettiRef = useRef<any>(null);

useEffect(() => {
  if (isPerfect) {
    const timeout = setTimeout(() => {
      confettiRef.current?.start();
    }, 400); // After count-up completes
    return () => clearTimeout(timeout);
  }
}, [isPerfect]);

// In render - score section
<Text style={[styles.score, { color: colors.primary }]}>
  <CountUp
    isCounting
    start={0}
    end={score}
    duration={1}
    thousandsSeparator=","
  />
</Text>

// At very end of render, before closing SafeAreaView
{isPerfect && (
  <ConfettiCannon
    ref={confettiRef}
    count={150}
    origin={{ x: width / 2, y: -10 }}
    fallSpeed={3500}
    fadeOut
    autoStart={false}
    colors={['#3B82F6', '#22C55E', '#FACC15', '#F97316', '#EC4899']}
  />
)}
```

### Sound Trigger Integration in Quiz
```typescript
// In quiz/index.tsx - add to handleAnswerSelect
import { useSoundEffects } from '@/hooks/useSoundEffects';

// In component
const { playSound } = useSoundEffects();

const handleAnswerSelect = async (option: QuizOption) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Play appropriate sound
  if (option.isCorrect) {
    playSound('correct');
    // Check for combo tier increase
    const currentTier = getComboTier(consecutiveCorrect);
    const newTier = getComboTier(consecutiveCorrect + 1);
    if (newTier > currentTier) {
      // Play combo sound slightly delayed to not overlap
      setTimeout(() => playSound('combo'), 150);
    }
  } else {
    playSound('incorrect');
  }

  dispatch({
    type: 'SELECT_ANSWER',
    // ... rest of dispatch
  });

  // ... rest of function
};
```

## Sound Asset Guidelines

### Specifications
| Sound | Duration | Style | Notes |
|-------|----------|-------|-------|
| correct.mp3 | ~300ms | Soft positive chime, single note | Not too celebratory - used 10+ times per round |
| incorrect.mp3 | ~300ms | Subtle low tone, non-harsh | Professional, not punishing |
| combo.mp3 | ~200ms | Brief ascending ding | Subtle positive reinforcement |

### Finding Free Sounds
- [ElevenLabs Sound Effects](https://elevenlabs.io/sound-effects) - Royalty-free with attribution
- [Uppbeat SFX](https://uppbeat.io/sfx/category/gaming/quiz) - Free quiz sounds
- Export from GarageBand iOS using built-in synths for custom minimal tones

### Per User Decision
- No timer sounds (visual urgency only)
- No perfect round sound (confetti is the celebration)
- Professional feel - won't annoy in repeated sessions

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-av Audio.Sound | expo-audio useAudioPlayer | Expo SDK 52+ | Simpler API, auto cleanup |
| Manual number animation | use-count-up | Stable | Less code, better timing |
| Custom confetti | react-native-confetti-cannon | Stable | Physics handled, less bugs |
| Animated API | Reanimated withSpring | RN 0.60+ | UI thread performance |

**Deprecated/outdated:**
- `expo-av` Audio class is still supported but `expo-audio` is the newer, simpler API
- React Native's built-in Animated API works but Reanimated is preferred for performance

## Open Questions

Things that couldn't be fully resolved:

1. **Exact sound files to use**
   - What we know: Need correct, incorrect, combo sounds (~300ms, subtle)
   - What's unclear: Actual .mp3 files to include
   - Recommendation: Start with ElevenLabs free tier or create in GarageBand; iterate based on feel

2. **Optimal confetti colors**
   - What we know: Should be celebratory, match app palette
   - What's unclear: Whether to use app brand colors or rainbow palette
   - Recommendation: Mix of primary blue + success green + accent colors: ['#3B82F6', '#22C55E', '#FACC15', '#F97316', '#EC4899']

3. **Timer urgency intensity**
   - What we know: Need visual urgency in final 3 seconds
   - What's unclear: Exact pulse scale (1.05? 1.1?) and whether shake is needed
   - Recommendation: Start with pulse to 1.08, add subtle shake (2px) at <=2 seconds; tune based on feel

## Sources

### Primary (HIGH confidence)
- [expo-audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/) - useAudioPlayer API, preloading
- [react-native-reanimated withSpring](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/) - Spring physics configuration
- [use-count-up GitHub](https://github.com/vydimitrov/use-count-up) - React Native usage, props
- [react-native-confetti-cannon GitHub](https://github.com/VincentCATILLON/react-native-confetti-cannon) - API, ref control
- medtriad/components/quiz/AnswerCard.tsx - Existing withSpring implementation
- medtriad/components/quiz/TimerRing.tsx - Existing threshold color pattern
- medtriad/services/settings-storage.ts - soundEnabled toggle pattern

### Secondary (MEDIUM confidence)
- [@shopify/react-native-skia Expo docs](https://docs.expo.dev/versions/latest/sdk/skia/) - Skia Expo compatibility (for fast-confetti evaluation)
- [Reanimated Animations Guide 2025](https://dev.to/erenelagz/react-native-reanimated-3-the-ultimate-guide-to-high-performance-animations-in-2025-4ae4) - Button press patterns

### Tertiary (LOW confidence)
- [ElevenLabs Sound Effects](https://elevenlabs.io/sound-effects) - Free sounds (licensing terms need verification)
- [Uppbeat SFX](https://uppbeat.io/sfx/category/gaming/quiz) - Free quiz sounds (licensing terms need verification)

## Metadata

**Confidence breakdown:**
- Sound effects: HIGH - expo-audio documented, settings integration pattern clear
- Timer urgency: HIGH - Reanimated patterns established, existing TimerRing to extend
- Button press: HIGH - Already implemented, just needs parameter tuning
- Score count-up: HIGH - use-count-up documented, simple integration
- Confetti: HIGH - react-native-confetti-cannon well-documented, Expo compatible

**Research date:** 2026-01-18
**Valid until:** 30 days (stable libraries, polish phase)
