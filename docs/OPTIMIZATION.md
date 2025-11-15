# Performance Optimization Guide

## Performance Targets

### FPS Targets
- **Desktop (High-end):** 60 FPS @ 1920x1080
- **Desktop (Mid-range):** 60 FPS @ 1280x720
- **Desktop (Low-end):** 30 FPS @ 1280x720
- **Mobile (High-end):** 60 FPS @ 1080p
- **Mobile (Mid-range):** 30 FPS @ 720p

### Memory Targets
- **Total RAM:** < 512 MB
- **VRAM:** < 256 MB
- **Heap Size:** < 200 MB
- **Texture Memory:** < 128 MB

### Load Time Targets
- **Initial Load:** < 5 seconds
- **Level Load:** < 2 seconds
- **Asset Streaming:** < 100ms per asset

---

## Current Performance Status

### Known Issues
1. ❌ No object pooling for enemies/projectiles
2. ❌ No LOD (Level of Detail) system
3. ❌ No frustum culling for off-screen enemies
4. ❌ Particle system creates many objects
5. ❌ No texture compression
6. ❌ Large bundle size (React Three Fiber + Three.js)
7. ⚠️ Some components re-render unnecessarily

### Current Optimizations
1. ✅ PixelRatio capped at 2 for high-DPI screens
2. ✅ Shadow maps at reasonable resolution (2048x2048)
3. ✅ Delta time for frame-independent movement
4. ✅ Event-driven updates (not polling)

---

## Rendering Optimization

### Three.js Renderer Settings

#### Current Configuration
```javascript
// src/systems/GameEngine.js:51-59
renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,          // EXPENSIVE - consider disabling on low-end
  alpha: false,             // GOOD - no transparency needed
  premultipliedAlpha: false, // GOOD
  stencil: false,           // GOOD - not using stencil buffer
  preserveDrawingBuffer: false, // GOOD
  failIfMajorPerformanceCaveat: false // GOOD - try anyway
});
```

#### Recommended Optimizations
```javascript
// Detect device capability first
const isLowEnd = detectLowEndDevice();

renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isLowEnd,     // Disable on low-end devices
  powerPreference: 'high-performance',
  precision: isLowEnd ? 'mediump' : 'highp'
});

// Adaptive pixel ratio
renderer.setPixelRatio(isLowEnd ? 1 : Math.min(window.devicePixelRatio, 2));
```

### Geometry Optimization

#### Use BufferGeometry Only
```javascript
// ❌ BAD - Creates extra overhead
const geometry = new THREE.BoxGeometry(1, 1, 1);

// ✅ GOOD - Direct buffer geometry
const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
```

#### Reuse Geometries
```javascript
// ❌ BAD - New geometry per enemy
enemies.forEach(enemy => {
  const geo = new THREE.BoxGeometry(1, 2, 1);
  enemy.mesh = new THREE.Mesh(geo, material);
});

// ✅ GOOD - Shared geometry
const sharedGeometry = new THREE.BoxBufferGeometry(1, 2, 1);
enemies.forEach(enemy => {
  enemy.mesh = new THREE.Mesh(sharedGeometry, material);
});
```

#### Merge Static Geometries
```javascript
// For static environment pieces
const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries([
  wall1Geometry,
  wall2Geometry,
  floor Geometry
]);

const staticEnvironment = new THREE.Mesh(mergedGeometry, material);
```

### Material Optimization

#### Reuse Materials
```javascript
// Material pool
const materials = {
  enemy_basic: new THREE.MeshLambertMaterial({ color: 0xff0000 }),
  enemy_armored: new THREE.MeshStandardMaterial({ color: 0x888888 }),
  projectile: new THREE.MeshBasicMaterial({ color: 0xff0000 })
};

// Share across instances
enemy.mesh.material = materials.enemy_basic;
```

#### Use Appropriate Material Types
```javascript
// Performance ranking (fast → slow):
// 1. MeshBasicMaterial (no lighting)
// 2. MeshLambertMaterial (simple lighting)
// 3. MeshPhongMaterial (shiny lighting)
// 4. MeshStandardMaterial (PBR - expensive)
// 5. MeshPhysicalMaterial (very expensive)

// For enemies that don't need shine:
new THREE.MeshLambertMaterial() // Use this

// Not:
new THREE.MeshStandardMaterial() // Too expensive
```

#### Texture Optimization
```javascript
// Resize textures to power of 2
// 512x512, 1024x1024, 2048x2048

// Compress textures
loader.load('texture.jpg', (texture) => {
  texture.anisotropy = 4; // Lower than max
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
});
```

### Shadow Optimization

#### Current Settings (Decent)
```javascript
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
```

#### Optimizations
```javascript
// Reduce for low-end
if (isLowEnd) {
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
}

// Or disable shadows entirely
renderer.shadowMap.enabled = !isLowEnd;

// Disable shadows on small objects
smallObject.castShadow = false;
smallObject.receiveShadow = false;
```

### Draw Call Reduction

#### Instanced Rendering
```javascript
// For multiple identical enemies
const geometry = new THREE.BoxBufferGeometry(1, 2, 1);
const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const instancedMesh = new THREE.InstancedMesh(geometry, material, 100);

// Update positions per enemy
enemies.forEach((enemy, i) => {
  const matrix = new THREE.Matrix4();
  matrix.setPosition(enemy.position);
  instancedMesh.setMatrixAt(i, matrix);
});

instancedMesh.instanceMatrix.needsUpdate = true;
```

#### Batch Static Objects
```javascript
// Combine static environment into fewer meshes
// Reduces draw calls from 100+ to 5-10
```

---

## Object Pooling

### Status: ❌ Not Implemented

### Critical Need
Object pooling prevents garbage collection pauses during intense combat.

### Enemy Pool
```javascript
class EnemyPool {
  constructor(size) {
    this.pool = [];
    this.active = [];

    // Pre-create enemies
    for (let i = 0; i < size; i++) {
      const enemy = this.createEnemy();
      enemy.active = false;
      this.pool.push(enemy);
    }
  }

  spawn(type, position) {
    const enemy = this.pool.pop() || this.createEnemy();
    enemy.reset(type, position);
    enemy.active = true;
    this.active.push(enemy);
    return enemy;
  }

  despawn(enemy) {
    enemy.active = false;
    const index = this.active.indexOf(enemy);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(enemy);
    }
  }

  update(deltaTime) {
    // Only update active enemies
    for (let i = this.active.length - 1; i >= 0; i--) {
      const enemy = this.active[i];
      enemy.update(deltaTime);

      if (enemy.isDead()) {
        this.despawn(enemy);
      }
    }
  }
}
```

### Projectile Pool
```javascript
class ProjectilePool {
  constructor(size = 100) {
    this.pool = [];
    this.active = [];

    // Pre-create projectiles
    for (let i = 0; i < size; i++) {
      const projectile = this.createProjectile();
      this.pool.push(projectile);
    }
  }

  fire(position, velocity, damage) {
    const projectile = this.pool.pop();
    if (!projectile) return null; // Pool exhausted

    projectile.reset(position, velocity, damage);
    this.active.push(projectile);
    return projectile;
  }

  // ... similar to enemy pool
}
```

### Particle Pool
```javascript
// src/systems/EnhancedParticleSystem.js needs pooling
class ParticlePool {
  constructor(maxParticles = 1000) {
    this.particles = new Array(maxParticles);
    this.nextIndex = 0;

    // Pre-create particle objects
    for (let i = 0; i < maxParticles; i++) {
      this.particles[i] = {
        active: false,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1
      };
    }
  }

  emit(position, velocity, life) {
    const particle = this.particles[this.nextIndex];
    particle.position.copy(position);
    particle.velocity.copy(velocity);
    particle.life = life;
    particle.maxLife = life;
    particle.active = true;

    this.nextIndex = (this.nextIndex + 1) % this.particles.length;
    return particle;
  }

  update(deltaTime) {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      if (!particle.active) continue;

      particle.life -= deltaTime;
      if (particle.life <= 0) {
        particle.active = false;
      } else {
        particle.position.add(
          particle.velocity.clone().multiplyScalar(deltaTime)
        );
      }
    }
  }
}
```

---

## Culling & LOD

### Frustum Culling

#### Automatic (Three.js does this)
```javascript
// Three.js automatically frustum culls
// But you can help by:

// 1. Use appropriate bounding boxes
mesh.geometry.computeBoundingBox();
mesh.geometry.computeBoundingSphere();

// 2. Manually disable rendering for far objects
if (distance > maxRenderDistance) {
  enemy.mesh.visible = false;
}
```

#### Manual Culling for AI
```javascript
// Don't update AI for off-screen enemies
function isInFrustum(position, camera) {
  // Simple distance check (cheap)
  const distance = position.distanceTo(camera.position);
  if (distance > maxDistance) return false;

  // Or use proper frustum check
  const frustum = new THREE.Frustum();
  frustum.setFromProjectionMatrix(
    new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )
  );

  return frustum.containsPoint(position);
}

// In update loop
enemies.forEach(enemy => {
  if (isInFrustum(enemy.position, camera)) {
    enemy.update(deltaTime);
  }
});
```

### Level of Detail (LOD)

#### Distance-Based LOD
```javascript
class EnemyLOD {
  constructor() {
    this.lod = new THREE.LOD();

    // High detail (close)
    const highDetail = new THREE.Mesh(detailedGeometry, material);
    this.lod.addLevel(highDetail, 0);

    // Medium detail (mid)
    const medDetail = new THREE.Mesh(simpleGeometry, material);
    this.lod.addLevel(medDetail, 20);

    // Low detail (far)
    const lowDetail = new THREE.Mesh(cubeGeometry, material);
    this.lod.addLevel(lowDetail, 50);

    scene.add(this.lod);
  }

  update(camera) {
    this.lod.update(camera);
  }
}
```

#### AI LOD
```javascript
// Reduce AI update frequency for distant enemies
const updateInterval = distance < 20 ? 0 :
                       distance < 50 ? 0.1 : 0.5;

if (enemy.timeSinceUpdate >= updateInterval) {
  enemy.updateAI();
  enemy.timeSinceUpdate = 0;
}
```

---

## React Component Optimization

### Use React.memo
```javascript
// Prevent unnecessary re-renders
const HealthBar = React.memo(({ health, maxHealth }) => {
  return (
    <div className="health-bar">
      <div style={{ width: `${(health / maxHealth) * 100}%` }} />
    </div>
  );
});

// With custom comparison
const HUD = React.memo(({ player, level }) => {
  // ... component
}, (prevProps, nextProps) => {
  // Only re-render if these changed
  return prevProps.player.health === nextProps.player.health &&
         prevProps.player.score === nextProps.player.score;
});
```

### Use useCallback and useMemo
```javascript
function GameCanvas() {
  // ❌ BAD - Creates new function every render
  const handleClick = (event) => {
    // ...
  };

  // ✅ GOOD - Memoized function
  const handleClick = useCallback((event) => {
    // ...
  }, [dependencies]);

  // ❌ BAD - Recalculates every render
  const expensiveValue = calculateExpensiveThing(data);

  // ✅ GOOD - Memoized value
  const expensiveValue = useMemo(() => {
    return calculateExpensiveThing(data);
  }, [data]);
}
```

### Avoid Context Over-Use
```javascript
// ❌ BAD - Single massive context
const GameContext = {
  player, enemies, level, ui, settings, audio, ...
};

// Every consumer re-renders when ANY value changes

// ✅ GOOD - Split contexts
const PlayerContext = { player };
const EnemyContext = { enemies };
const UIContext = { ui };

// Components only re-render when their context changes
```

### Lazy Load Components
```javascript
// Lazy load heavy components
const Settings = React.lazy(() => import('./Settings.jsx'));
const LevelSelect = React.lazy(() => import('./LevelSelect.jsx'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <Settings />
</Suspense>
```

---

## Memory Management

### Cleanup on Unmount
```javascript
useEffect(() => {
  // Setup
  const engine = new GameEngine();
  engine.initialize(canvas);

  // Cleanup
  return () => {
    // Dispose geometries
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Dispose renderer
    renderer.dispose();

    // Clear references
    engine.cleanup();
  };
}, []);
```

### Dispose Unused Assets
```javascript
// When switching levels
function cleanupLevel() {
  // Remove all enemies from scene
  enemies.forEach(enemy => {
    scene.remove(enemy.mesh);
    // Don't dispose geometry/material if pooled
  });

  // Clear arrays
  enemies.length = 0;
  projectiles.length = 0;
}
```

### Monitor Memory
```javascript
// Development tool
function logMemoryUsage() {
  if (performance.memory) {
    console.log({
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
    });
  }
}

// Call periodically
setInterval(logMemoryUsage, 5000);
```

---

## Bundle Size Optimization

### Current Bundle (Estimated)
```
three: ~600 KB
@react-three/fiber: ~100 KB
@react-three/drei: ~200 KB
react + react-dom: ~130 KB
tone.js: ~200 KB (not used yet)
Application code: ~200 KB
Total: ~1.4 MB (uncompressed)
```

### Optimizations

#### Tree Shaking
```javascript
// ❌ BAD - Imports everything
import * as THREE from 'three';

// ✅ GOOD - Import only what you need
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  BoxBufferGeometry,
  MeshLambertMaterial
} from 'three';
```

#### Code Splitting
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
          'react-vendor': ['react', 'react-dom'],
          'game-systems': [
            './src/systems/GameEngine.js',
            './src/systems/EnemyAISystem.js'
          ]
        }
      }
    }
  }
};
```

#### Lazy Load Levels
```javascript
// Don't load all 12 level configs at once
const getLevelConfig = async (levelNumber) => {
  const module = await import(`./levels/level${levelNumber}.js`);
  return module.default;
};
```

---

## Network & Loading Optimization

### Asset Loading Strategy

#### Preload Critical Assets
```javascript
const criticalAssets = [
  'player_model.glb',
  'pistol_fire.ogg',
  'ui_tilemap.png'
];

async function preloadCritical() {
  return Promise.all(
    criticalAssets.map(asset => loadAsset(asset))
  );
}
```

#### Lazy Load Non-Critical
```javascript
// Load boss assets only when needed
async function loadBossAssets(bossId) {
  const assets = await import(`./bosses/${bossId}/assets.js`);
  return assets.load();
}
```

#### Progressive Loading
```javascript
// Show game menu immediately
// Load level 1 in background
// Load other levels on demand

async function loadGameAssets() {
  // 1. Show loading screen
  // 2. Load core systems (fast)
  await loadCoreSystems();

  // 3. Show menu
  showMainMenu();

  // 4. Load Level 1 in background
  loadLevel(1).then(() => console.log('Level 1 ready'));

  // 5. Load other levels progressively
  for (let i = 2; i <= 12; i++) {
    setTimeout(() => loadLevel(i), i * 1000);
  }
}
```

---

## Platform-Specific Optimizations

### Desktop vs Mobile Detection
```javascript
function detectDevice() {
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(ua);

  // GPU detection
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

  const isLowEnd = isMobile || /Intel HD|Mali|Adreno 3/i.test(renderer);

  return { isMobile, isLowEnd };
}
```

### Adaptive Quality Settings
```javascript
const device = detectDevice();

const qualityPresets = {
  high: {
    pixelRatio: 2,
    shadows: true,
    antialiasing: true,
    particles: 1000,
    shadowMapSize: 2048
  },
  medium: {
    pixelRatio: 1.5,
    shadows: true,
    antialiasing: false,
    particles: 500,
    shadowMapSize: 1024
  },
  low: {
    pixelRatio: 1,
    shadows: false,
    antialiasing: false,
    particles: 250,
    shadowMapSize: 512
  }
};

const settings = device.isLowEnd ? qualityPresets.low :
                 device.isMobile ? qualityPresets.medium :
                 qualityPresets.high;
```

---

## Profiling & Debugging

### Chrome DevTools
1. **Performance Tab**
   - Record gameplay session
   - Look for long frames (> 16ms)
   - Identify bottlenecks (rendering, scripting, etc.)

2. **Memory Tab**
   - Take heap snapshots
   - Look for detached DOM nodes
   - Identify memory leaks

3. **Rendering Tab**
   - Enable "Paint flashing"
   - Enable "Layer borders"
   - Check for unnecessary repaints

### Three.js Stats
```javascript
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();
  // ... render
  stats.end();
}
```

### Custom Performance Monitoring
```javascript
class PerformanceMonitor {
  constructor() {
    this.frameTime = [];
    this.maxSamples = 60;
  }

  update(deltaTime) {
    this.frameTime.push(deltaTime * 1000); // ms
    if (this.frameTime.length > this.maxSamples) {
      this.frameTime.shift();
    }
  }

  getAverageFPS() {
    const avg = this.frameTime.reduce((a, b) => a + b) / this.frameTime.length;
    return Math.round(1000 / avg);
  }

  getFrameTime() {
    return this.frameTime[this.frameTime.length - 1];
  }

  isPerformanceGood() {
    return this.getAverageFPS() >= 55; // Allow 5 FPS buffer
  }
}
```

---

## Optimization Priority List

### Phase 1: Critical (Do First)
1. ✅ Implement object pooling (enemies, projectiles, particles)
2. ✅ Add frustum culling for AI updates
3. ✅ Use React.memo on UI components
4. ✅ Implement geometry/material reuse
5. ✅ Add adaptive quality settings

### Phase 2: Important
6. ✅ Implement LOD system for enemies
7. ✅ Optimize particle system with instancing
8. ✅ Add lazy loading for levels
9. ✅ Implement texture compression
10. ✅ Reduce bundle size with tree shaking

### Phase 3: Polish
11. ✅ Fine-tune shadow settings
12. ✅ Add performance monitoring UI
13. ✅ Implement progressive asset loading
14. ✅ Optimize React component re-renders
15. ✅ Add platform-specific optimizations

---

## Performance Testing Checklist

### Scenarios to Test
- [ ] Level 1 with 3 enemies (should be 60 FPS)
- [ ] Level 12 with 7 enemies (should be 45+ FPS)
- [ ] Boss fight with particles (should be 50+ FPS)
- [ ] Rapid weapon switching
- [ ] 50+ projectiles on screen
- [ ] Puzzle with many interactive objects
- [ ] Long play session (3+ levels, check for memory leaks)

### Target Metrics
- [ ] 60 FPS average on mid-range desktop
- [ ] < 20ms frame time (95th percentile)
- [ ] < 500 MB memory usage
- [ ] < 3 second level load time
- [ ] No frame drops during combat
- [ ] Smooth 30 FPS on mobile

---

## Optimization Resources

### Tools
- **Chrome DevTools** - Profiling and debugging
- **React DevTools** - Component performance
- **Three.js Inspector** - 3D scene debugging
- **Lighthouse** - Overall performance audit
- **WebPageTest** - Load time analysis

### References
- Three.js Performance Tips: https://threejs.org/docs/#manual/en/introduction/How-to-improve-performance
- React Performance: https://react.dev/learn/render-and-commit
- Web Vitals: https://web.dev/vitals/
