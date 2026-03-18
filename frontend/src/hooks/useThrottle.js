import { useEffect, useRef, useState } from 'react';

/**
 * useThrottle
 * @param {any} value - value to throttle
 * @param {number} limit - time limit in ms
 * @returns throttledValue
 */
const useThrottle = (value, limit = 500) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRun = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now - lastRun.current >= limit) {
      setThrottledValue(value);
      lastRun.current = now;
    }
  }, [value, limit]);

  return throttledValue;
};

export default useThrottle;
