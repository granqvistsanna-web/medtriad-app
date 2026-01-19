/**
 * Validation Utilities
 *
 * Defensive value clamping for error-free state handling.
 * All functions handle NaN, Infinity, and invalid inputs safely.
 */

/**
 * Clamp a number to a range, handling NaN and Infinity
 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp tier number to valid range 1-6
 */
export function clampTier(tier: number): number {
  return clamp(Math.floor(tier), 1, 6);
}

/**
 * Clamp progress to 0-1 range for progress bars
 */
export function clampProgress(progress: number): number {
  return clamp(progress, 0, 1);
}

/**
 * Parse value as integer with fallback for invalid input
 */
export function safeInt(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
}
