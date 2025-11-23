/**
 * useElapsedTimer
 * Tracks elapsed seconds for an active workout session.
 */
import { useEffect, useRef, useState } from 'react';

interface UseElapsedTimerOptions {
  /** Whether the timer should tick while the session is active */
  isActive: boolean;
}

interface UseElapsedTimerResult {
  /** Elapsed time in seconds */
  elapsedSeconds: number;
}

export const useElapsedTimer = (
  startTime: number | null | undefined,
  options: UseElapsedTimerOptions,
): UseElapsedTimerResult => {
  const { isActive } = options;
  const persistedStartTime = useRef<number | null>(startTime ?? null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (!persistedStartTime.current) {
      return 0;
    }

    const initialElapsed = Math.max(Math.floor((Date.now() - persistedStartTime.current) / 1000), 0);

    return initialElapsed;
  });

  useEffect(() => {
    if (startTime) {
      persistedStartTime.current = startTime;
    }
  }, [startTime]);

  useEffect(() => {
    if (!isActive || !persistedStartTime.current) {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.max(Math.floor((now - (persistedStartTime.current ?? now)) / 1000), 0);
      setElapsedSeconds(elapsed);
    };

    calculateElapsed();
    const intervalId = setInterval(calculateElapsed, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, startTime]);

  return { elapsedSeconds };
};
