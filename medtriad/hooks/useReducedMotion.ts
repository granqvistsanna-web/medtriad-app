import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook to detect user's reduced motion preference.
 * Returns true if the user prefers reduced motion (accessibility setting).
 *
 * When reduced motion is enabled, animations should:
 * - Use simple opacity fades instead of scale/spring animations
 * - Skip confetti and particle effects
 * - Use instant or very short duration transitions
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check initial value
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });

    // Subscribe to changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setReduceMotion(enabled);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
