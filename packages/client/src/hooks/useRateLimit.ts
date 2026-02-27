import { useRef, useState } from "react";

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000; // 1 minute

// Custom hook to manage rate limiting for API requests. It tracks the timestamps of recent requests and determines
// if the user is currently rate limited based on the defined limits.
// The hook provides a checkLimit function that should be called before making an API request.
// It returns true if the request is allowed
export function useRateLimit() {
  const timestamps = useRef<number[]>([]);
  const [isLimited, setIsLimited] = useState(false);

  const checkLimit = (): boolean => {
    const now = Date.now();
    timestamps.current = timestamps.current.filter(
      (t) => now - t < WINDOW_MS
    );

    if (timestamps.current.length >= MAX_REQUESTS) {
      setIsLimited(true);
      return false;
    }

    timestamps.current.push(now);
    setIsLimited(false);
    return true;
  };

  return { checkLimit, isLimited };
}
