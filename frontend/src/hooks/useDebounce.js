import { useEffect, useState } from 'react';

/**
 * useDebounce
 * @param {any} value - value to debounce
 * @param {number} delay - delay in ms
 * @returns debouncedValue
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
