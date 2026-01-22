import { useEffect, useRef } from 'react';

/**
 * Hook that manages a countdown timer interval with drift correction
 *
 * This hook uses timestamp-based timing to prevent drift from JavaScript
 * event loop delays. Instead of relying on setInterval(1000) to be accurate,
 * it tracks actual elapsed time and adjusts the next tick accordingly.
 *
 * This hook does NOT manage time state itself - it simply calls onTick
 * every second when isRunning is true. The caller is responsible for
 * managing the actual time value (e.g., via a reducer).
 *
 * IMPORTANT: The onTick callback should be wrapped in useCallback by
 * the caller to prevent unnecessary interval restarts. Using a stable
 * dispatch function (from useReducer) is ideal.
 *
 * @param isRunning - Whether the timer should be running
 * @param onTick - Callback to invoke every second while running
 *
 * @example
 * ```tsx
 * const handleTick = useCallback(() => {
 *   dispatch({ type: 'TICK_TIMER' });
 * }, []);
 *
 * useCountdownTimer(state.status === 'playing', handleTick);
 * ```
 */
export function useCountdownTimer(
  isRunning: boolean,
  onTick: () => void
): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const tickCountRef = useRef<number>(0);

  useEffect(() => {
    // Start interval when running
    if (isRunning) {
      // Record the start timestamp
      startTimeRef.current = Date.now();
      tickCountRef.current = 0;

      // Use a self-correcting interval approach
      const tick = () => {
        tickCountRef.current += 1;
        onTick();

        // Calculate how long the next interval should be to stay synchronized
        const expectedElapsedMs = tickCountRef.current * 1000;
        const actualElapsedMs = Date.now() - startTimeRef.current;
        const drift = actualElapsedMs - expectedElapsedMs;

        // Adjust next tick to compensate for drift (clamp between 0 and 2000ms)
        const nextTickDelay = Math.max(0, Math.min(2000, 1000 - drift));

        intervalRef.current = setTimeout(tick, nextTickDelay);
      };

      // Start the first tick after 1 second
      intervalRef.current = setTimeout(tick, 1000);
    } else {
      // Clear interval when not running
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      tickCountRef.current = 0;
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onTick]);
}
