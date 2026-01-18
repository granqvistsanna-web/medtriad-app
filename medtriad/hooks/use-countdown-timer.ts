import { useEffect, useRef } from 'react';

/**
 * Hook that manages a countdown timer interval
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

  useEffect(() => {
    // Start interval when running
    if (isRunning) {
      intervalRef.current = setInterval(onTick, 1000);
    } else {
      // Clear interval when not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onTick]);
}
