"use client";

import * as React from "react";

/**
 * Delays updating the returned value until `delayMs` milliseconds have passed
 * since the last change. Ideal for search inputs and URL/API filter syncing.
 */
export function useDebounce<T>(value: T, delayMs = 350): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
