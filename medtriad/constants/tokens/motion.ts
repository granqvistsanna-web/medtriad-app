/**
 * Motion Tokens
 *
 * Layer 1 of the design system token architecture.
 * Animation durations and spring presets for react-native-reanimated.
 */

import { Easing } from 'react-native-reanimated';

// Timing durations (milliseconds)
export const durations = {
  fast: 150,         // Quick feedback
  normal: 300,       // Standard transitions
  slow: 500,         // Deliberate animations
  slower: 800,       // Score count-ups, tier celebrations
  stagger: 50,       // Stagger delay between items
  staggerMedium: 80, // Celebratory reveals
} as const;

// Spring presets for react-native-reanimated withSpring()
export const springs = {
  // Standard press/release - snappy, controlled
  press: { damping: 15, stiffness: 400 },

  // Bouncy reveals - playful overshoot
  bouncy: { damping: 10, stiffness: 300 },

  // Gentle settles - slow, weighty landing
  gentle: { damping: 20, stiffness: 150 },

  // Pop effects - fast initial, slow settle
  pop: { damping: 8, stiffness: 400 },
} as const;

// Timing easings (for opacity, color transitions)
export const easings = {
  easeOut: Easing.out(Easing.cubic),
  easeInOut: Easing.inOut(Easing.cubic),
  easeOutBack: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

// Type helpers
export type DurationKey = keyof typeof durations;
export type SpringKey = keyof typeof springs;
export type SpringConfig = typeof springs.press;
