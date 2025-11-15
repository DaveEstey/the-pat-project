import React, { useEffect } from 'react';

// Bridge component to make projectile system available globally
export function ProjectileSystemBridge({ projectileSystem }) {
  useEffect(() => {
    if (projectileSystem) {
      // Make projectile system globally available
      window.projectileSystem = projectileSystem;

      return () => {
        // Clean up global reference on unmount
        delete window.projectileSystem;
      };
    } else {
      console.warn('ProjectileSystemBridge: No projectile system provided');
    }
  }, [projectileSystem]);
  
  // This is an invisible bridge component
  return null;
}

export default ProjectileSystemBridge;