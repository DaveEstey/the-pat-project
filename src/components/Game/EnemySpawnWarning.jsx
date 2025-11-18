import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Enemy Spawn Warning - Shows visual indicators where enemies will spawn
 * Creates glowing circles with pulsing animation to warn player
 */
export function EnemySpawnWarning({ gameEngine, spawnPositions, onWarningComplete }) {
  const warningMeshesRef = useRef([]);

  useEffect(() => {
    if (!gameEngine || !spawnPositions || spawnPositions.length === 0) return;

    const scene = gameEngine.getScene();
    if (!scene) return;

    // Create warning indicators for each spawn position
    spawnPositions.forEach((spawnData, index) => {
      const { position, delay, type } = spawnData;

      // Create warning circle on the ground
      const warningGeometry = new THREE.RingGeometry(0.3, 0.8, 32);
      const warningMaterial = new THREE.MeshBasicMaterial({
        color: type === 'boss' ? 0xff0000 : 0xffaa00, // Red for boss, orange for others
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });

      const warningMesh = new THREE.Mesh(warningGeometry, warningMaterial);
      warningMesh.position.set(position.x, 0.1, position.z); // Slightly above ground
      warningMesh.rotation.x = -Math.PI / 2; // Lay flat on ground

      // Add glow effect with emissive circle
      const glowGeometry = new THREE.CircleGeometry(0.8, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: type === 'boss' ? 0xff0000 : 0xffaa00,
        transparent: true,
        opacity: 0.3
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.set(position.x, 0.05, position.z);
      glowMesh.rotation.x = -Math.PI / 2;

      scene.add(warningMesh);
      scene.add(glowMesh);

      warningMeshesRef.current.push({ ring: warningMesh, glow: glowMesh, startTime: Date.now(), delay });

      // Animate warning pulsing
      const animateWarning = () => {
        const elapsed = Date.now() - warningMeshesRef.current.find(m => m.ring === warningMesh)?.startTime;

        if (elapsed >= delay) {
          // Warning period over, remove
          scene.remove(warningMesh);
          scene.remove(glowMesh);
          warningMeshesRef.current = warningMeshesRef.current.filter(m => m.ring !== warningMesh);
          return;
        }

        // Pulse animation
        const pulseSpeed = 3;
        const pulse = Math.sin(elapsed * pulseSpeed * 0.001) * 0.5 + 0.5;

        warningMaterial.opacity = 0.4 + pulse * 0.4;
        glowMaterial.opacity = 0.1 + pulse * 0.3;

        // Scale pulsing
        const scale = 1.0 + pulse * 0.2;
        warningMesh.scale.set(scale, scale, 1);
        glowMesh.scale.set(scale, scale, 1);

        requestAnimationFrame(animateWarning);
      };

      animateWarning();

      // Notify when warning expires
      setTimeout(() => {
        if (onWarningComplete) {
          onWarningComplete(index);
        }
      }, delay);
    });

    // Cleanup on unmount
    return () => {
      warningMeshesRef.current.forEach(({ ring, glow }) => {
        if (scene) {
          scene.remove(ring);
          scene.remove(glow);
        }
      });
      warningMeshesRef.current = [];
    };
  }, [gameEngine, spawnPositions, onWarningComplete]);

  return null; // This is a Three.js component, no React rendering
}

export default EnemySpawnWarning;
