/**
 * UI Layout System
 * Defines consistent positioning zones and z-index layers for all UI components
 * Prevents overlapping and ensures proper stacking order
 */

// UI Zone Definitions - Consistent positioning across all screen sizes
export const UI_ZONES = {
  // Top row
  TOP_LEFT: 'top-4 left-4',
  TOP_CENTER: 'top-4 left-1/2 -translate-x-1/2',
  TOP_RIGHT: 'top-4 right-4',

  // Top right stack - for multiple elements that need to stack vertically
  TOP_RIGHT_STACK: 'top-4 right-4 flex flex-col gap-3 items-end',

  // Middle row
  MIDDLE_LEFT: 'top-1/2 left-4 -translate-y-1/2',
  CENTER: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  MIDDLE_RIGHT: 'top-1/2 right-4 -translate-y-1/2',

  // Middle right stack - for stacking elements vertically in middle right
  MIDDLE_RIGHT_STACK: 'top-1/2 right-4 -translate-y-1/2 flex flex-col gap-3 items-end',

  // Bottom row
  BOTTOM_LEFT: 'bottom-4 left-4',
  BOTTOM_CENTER: 'bottom-4 left-1/2 -translate-x-1/2',
  BOTTOM_RIGHT: 'bottom-4 right-4',

  // Special zones
  NOTIFICATION_STACK: 'top-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center',
  BOSS_HEALTH: 'top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4',
};

// Z-Index Layer Definitions - Ensures proper stacking order
export const Z_LAYERS = {
  BACKGROUND: 'z-0',
  GAME_WORLD: 'z-10',
  HUD_BASE: 'z-20',
  HUD_SECONDARY: 'z-25',
  NOTIFICATIONS: 'z-30',
  MODALS: 'z-40',
  TOOLTIPS: 'z-50'
};

// Responsive breakpoint helpers
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

/**
 * Hook to get current screen size category
 */
export function useScreenSize() {
  const [size, setSize] = React.useState('desktop');

  React.useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) setSize('mobile');
      else if (width < 1024) setSize('tablet');
      else setSize('desktop');
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

/**
 * Utility function to combine zone and layer classes
 */
export function getUIClasses(zone, layer = Z_LAYERS.HUD_BASE, additionalClasses = '') {
  return `absolute ${zone} ${layer} ${additionalClasses}`.trim();
}

// Import React for the hook
import React from 'react';
