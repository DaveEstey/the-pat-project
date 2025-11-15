// Performance optimization utilities for the room-based shooter game

export const PerformanceConfig = {
  // Rendering settings
  rendering: {
    targetFPS: 60,
    maxParticles: 100,
    shadowQuality: 'medium', // low, medium, high
    antialiasing: false,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
  },

  // Memory management
  memory: {
    maxProjectilePool: 50,
    maxEnemyPool: 20,
    maxItemPool: 30,
    gcInterval: 30000 // 30 seconds
  },

  // Update frequencies (ms)
  updates: {
    enemyAI: 16, // ~60fps
    projectiles: 16,
    particles: 33, // ~30fps
    ui: 100 // ~10fps
  }
};

export const PerformanceManager = {
  // Dispose of Three.js objects properly
  disposeObject: (object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => {
          if (material.map) material.map.dispose();
          material.dispose();
        });
      } else {
        if (object.material.map) object.material.map.dispose();
        object.material.dispose();
      }
    }
    if (object.children) {
      object.children.forEach(child => PerformanceManager.disposeObject(child));
    }
  },

  // Throttle function calls for performance
  throttle: (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;

    return function (...args) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  },

  // Object pool for memory efficiency
  createPool: (createFn, resetFn, initialSize = 10) => {
    const pool = [];
    const active = new Set();

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      pool.push(createFn());
    }

    return {
      acquire() {
        const obj = pool.pop() || createFn();
        active.add(obj);
        return obj;
      },

      release(obj) {
        if (active.has(obj)) {
          active.delete(obj);
          resetFn(obj);
          pool.push(obj);
        }
      },

      clear() {
        pool.length = 0;
        active.clear();
      },

      getStats() {
        return {
          poolSize: pool.length,
          activeCount: active.size
        };
      }
    };
  },

  // Batch DOM updates for performance
  batchUpdates: (updates) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  },

  // Monitor performance (development only)
  startMonitoring: () => {
    if (process.env.NODE_ENV !== 'development') return;

    let frameCount = 0;
    let lastTime = performance.now();

    const monitor = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 5000) { // Every 5 seconds
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        if (fps < 45) {
          console.warn(`Performance Warning: FPS dropped to ${fps}`);
        }
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(monitor);
    };

    monitor();
  }
};