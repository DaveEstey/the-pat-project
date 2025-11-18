/**
 * Logger Utility
 * Provides conditional logging based on environment
 * Development: All logs enabled
 * Production: Only errors logged
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log general information (dev only)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (dev only)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (always logged)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log debug information (dev only, with [DEBUG] prefix)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log info with [INFO] prefix (dev only)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Group console logs (dev only)
   */
  group: (label, callback) => {
    if (isDevelopment) {
      console.group(label);
      if (callback) callback();
      console.groupEnd();
    } else if (callback) {
      callback();
    }
  },

  /**
   * Log table (dev only)
   */
  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Performance timing (dev only)
   */
  time: (label) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
};

// Default export
export default logger;
