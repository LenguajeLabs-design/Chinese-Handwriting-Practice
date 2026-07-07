import { useEffect, useRef } from "react";
import type { Character } from "@/lib/store";

const HANZI_DATA_CDN = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest";

/**
 * Pre-warms the service worker cache with hanzi-writer character data
 * for the given list of characters. Runs in the background when online,
 * so the characters are available offline (e.g. on a plane) after
 * the user has opened the app once with connectivity.
 */
export function useOfflinePrecache(characters: Character[]) {
  const cachedSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!navigator.onLine) return;

    const newChars = characters
      .map((c) => c.char)
      .filter((ch) => !cachedSetRef.current.has(ch));

    if (newChars.length === 0) return;

    // Stagger fetches so we don't hammer the CDN all at once
    let i = 0;
    const interval = setInterval(() => {
      if (i >= newChars.length) {
        clearInterval(interval);
        return;
      }
      const char = newChars[i];
      fetch(`${HANZI_DATA_CDN}/${encodeURIComponent(char)}.json`)
        .then(() => {
          cachedSetRef.current.add(char);
        })
        .catch(() => {
          // Silently ignore — user may be offline already
        });
      i++;
    }, 50); // 50ms apart = full deck cached in ~500ms

    return () => clearInterval(interval);
  }, [characters]);
}
