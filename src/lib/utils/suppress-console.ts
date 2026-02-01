/**
 * Global console suppression utility
 * Suppresses all console.log, console.warn, console.error, console.info, console.debug
 * in production and development to keep the console clean
 */

if (typeof window !== 'undefined') {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  // Override console methods to suppress all output
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
  
  // Keep console.error but filter out known errors
  console.error = (...args: unknown[]) => {
    const message = String(args[0] || '');
    
    // Suppress specific error patterns
    const suppressPatterns = [
      'auth/configuration-not-found',
      'CONFIGURATION_NOT_FOUND',
      'API Error:',
      'Error fetching',
      'Error loading',
      'Failed to load',
      'Gemini',
      'Firebase',
      'Search error:',
      'Error in',
      'Error details:',
    ];
    
    // Only log if doesn't match suppression patterns
    if (!suppressPatterns.some(pattern => message.includes(pattern))) {
      originalConsole.error.apply(console, args);
    }
  };

  // Expose original methods for debugging if needed
  (window as any).__originalConsole = originalConsole;
}

export {};
