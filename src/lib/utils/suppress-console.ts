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
  
  // Suppress console.error completely (no filtering)
  console.error = () => {};

  // Expose original methods for debugging if needed
  (window as any).__originalConsole = originalConsole;
  
  // Suppress unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
  });
  
  // Suppress general errors
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    const suppressPatterns = [
      'Could not establish connection',
      'Receiving end does not exist',
      'runtime.lastError',
      'Failed to load resource',
      'API Test Recorder',
      'Interceptors',
    ];
    
    if (suppressPatterns.some(pattern => message.includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

export {};
