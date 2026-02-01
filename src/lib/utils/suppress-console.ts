/**
 * Global console suppression utility
 * Suppresses all console output to keep the console completely clean
 * This runs immediately when the module is loaded
 */

// Suppress before window is available (for SSR/build-time logs)
const noop = () => {};

if (typeof globalThis !== 'undefined') {
  // Store originals for debugging
  const originalConsole = {
    log: globalThis.console?.log,
    warn: globalThis.console?.warn,
    error: globalThis.console?.error,
    info: globalThis.console?.info,
    debug: globalThis.console?.debug,
  };

  // Completely override all console methods
  if (globalThis.console) {
    globalThis.console.log = noop;
    globalThis.console.warn = noop;
    globalThis.console.error = noop;
    globalThis.console.info = noop;
    globalThis.console.debug = noop;
  }

  // Browser-specific suppressions
  if (typeof window !== 'undefined') {
    // Suppress unhandled rejections
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    
    // Suppress all errors
    window.addEventListener('error', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }, true);

    // Expose originals for debugging
    (window as any).__originalConsole = originalConsole;
    
    // Override WebSocket to suppress connection errors
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = class extends OriginalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        this.addEventListener('error', (e) => {
          e.stopPropagation();
          e.preventDefault();
        });
      }
    } as any;
  }
}

export {};
