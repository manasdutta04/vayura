'use client';

import { useEffect } from 'react';

/**
 * Component to suppress Next.js error overlay
 * Must be client component to access window
 */
export function SuppressOverlay() {
  useEffect(() => {
    // Disable Next.js error overlay
    if (typeof window !== 'undefined') {
      // Remove any existing overlay
      const removeOverlay = () => {
        const overlay = document.querySelector('nextjs-portal');
        if (overlay) {
          overlay.remove();
        }
      };

      // Remove on mount
      removeOverlay();

      // Watch for overlay additions
      const observer = new MutationObserver(() => {
        removeOverlay();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return null;
}
