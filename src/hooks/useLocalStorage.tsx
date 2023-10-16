import { type Dispatch, type SetStateAction, useState, useEffect } from "react";

function useLocalStorage<S>(
  key: string,
  initVal: S
): [S, Dispatch<SetStateAction<S>>] {
  // Initialize state with initVal or from localStorage
  const [value, setValue] = useState<S>(() => {
    // Check if window is defined
    if (typeof window !== "undefined") {
      // Get stored value from localStorage
      const storedValue = window.localStorage.getItem(key);
      // Parse stored value as S or use initVal
      return storedValue ? (JSON.parse(storedValue) as S) : initVal;
    }
    // Return initVal if window is undefined
    return initVal;
  });

  // Update localStorage whenever value changes
  useEffect(() => {
    // Check if window is defined
    if (typeof window !== "undefined") {
      // Set value to localStorage as JSON string
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  // Return value and setValue as an array
  return [value, setValue];
}

export default useLocalStorage;
