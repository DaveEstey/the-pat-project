import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * ShootableTarget - A visible target that players can shoot
 * Used for puzzles and secret room unlocks
 */
export function ShootableTarget({
  gameEngine,
  position,
  targetId,
  color = 0x00ff00,
  size = 0.8,
  onHit,
  requiresSequence = false,
  sequenceNumber = null
}) {
  const targetRef = useRef(null);
  const [isHit, setIsHit] = useState(false);

  useEffect(() => {
    if (!gameEngine || !gameEngine.getScene) return;

    const scene = gameEngine.getScene();

    // Create target mesh
    const targetGroup = new THREE.Group();

    // Outer ring
    const outerGeometry = new THREE.TorusGeometry(size, 0.1, 16, 32);
    const outerMaterial = new THREE.MeshLambertMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5
    });
    const outerRing = new THREE.Mesh(outerGeometry, outerMaterial);
    targetGroup.add(outerRing);

    // Inner circle
    const innerGeometry = new THREE.CircleGeometry(size * 0.6, 32);
    const innerMaterial = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.3
    });
    const innerCircle = new THREE.Mesh(innerGeometry, innerMaterial);
    targetGroup.add(innerCircle);

    // Center dot
    const centerGeometry = new THREE.SphereGeometry(size * 0.2, 16, 16);
    const centerMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8
    });
    const centerDot = new THREE.Mesh(centerGeometry, centerMaterial);
    targetGroup.add(centerDot);

    // Add sequence number if needed
    if (requiresSequence && sequenceNumber !== null) {
      // Create text label (using a simple plane for now)
      const numberSize = size * 0.5;
      const numberGeometry = new THREE.PlaneGeometry(numberSize, numberSize);
      const numberMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      });
      const numberPlane = new THREE.Mesh(numberGeometry, numberMaterial);
      numberPlane.position.z = 0.1;
      targetGroup.add(numberPlane);
    }

    // Position target
    targetGroup.position.set(position.x, position.y, position.z);

    // Make target hittable
    targetGroup.userData.isTarget = true;
    targetGroup.userData.targetId = targetId;
    targetGroup.traverse((child) => {
      if (child.isMesh) {
        child.userData.isTarget = true;
        child.userData.targetId = targetId;
      }
    });

    scene.add(targetGroup);
    targetRef.current = targetGroup;

    // Pulse animation
    let time = 0;
    const pulseInterval = setInterval(() => {
      if (!targetRef.current || isHit) {
        clearInterval(pulseInterval);
        return;
      }

      time += 0.05;
      const scale = 1 + Math.sin(time * 2) * 0.1;
      targetRef.current.scale.set(scale, scale, 1);

      // Rotate slowly
      targetRef.current.rotation.z += 0.01;
    }, 16);

    return () => {
      clearInterval(pulseInterval);
      if (targetRef.current && scene) {
        scene.remove(targetRef.current);
      }
    };
  }, [gameEngine, position, targetId, color, size, isHit, requiresSequence, sequenceNumber]);

  // Listen for hits from combat system
  useEffect(() => {
    const handleTargetHit = (event) => {
      if (event.detail && event.detail.targetId === targetId && !isHit) {
        setIsHit(true);

        // Visual feedback - hit effect
        if (targetRef.current && gameEngine && gameEngine.getScene) {
          const scene = gameEngine.getScene();

          // Flash white
          targetRef.current.traverse((child) => {
            if (child.isMesh && child.material) {
              const originalColor = child.material.color.clone();
              child.material.color.setHex(0xffffff);
              child.material.emissive.setHex(0xffffff);
              child.material.emissiveIntensity = 1.0;

              setTimeout(() => {
                child.material.color.copy(originalColor);
                child.material.emissive.copy(originalColor);
                child.material.emissiveIntensity = 0.5;
              }, 100);
            }
          });

          // Explosion effect
          const particles = [];
          for (let i = 0; i < 20; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({ color: color });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            particle.position.copy(targetRef.current.position);
            const angle = (i / 20) * Math.PI * 2;
            const velocity = new THREE.Vector3(
              Math.cos(angle) * 0.1,
              Math.sin(angle) * 0.1,
              (Math.random() - 0.5) * 0.05
            );
            particle.userData.velocity = velocity;

            scene.add(particle);
            particles.push(particle);
          }

          // Animate particles
          let particleTime = 0;
          const particleInterval = setInterval(() => {
            particleTime += 0.016;

            particles.forEach(particle => {
              particle.position.add(particle.userData.velocity);
              particle.userData.velocity.y -= 0.01; // Gravity
              particle.material.opacity = Math.max(0, 1 - particleTime * 2);
            });

            if (particleTime > 1) {
              clearInterval(particleInterval);
              particles.forEach(p => scene.remove(p));
            }
          }, 16);

          // Remove target after hit
          setTimeout(() => {
            if (targetRef.current && scene) {
              scene.remove(targetRef.current);
            }
          }, 200);
        }

        // Notify puzzle system
        if (onHit) {
          onHit(targetId);
        }
      }
    };

    window.addEventListener('targetHit', handleTargetHit);

    return () => {
      window.removeEventListener('targetHit', handleTargetHit);
    };
  }, [targetId, onHit, isHit, color, gameEngine]);

  return null; // This is a 3D object, no React DOM needed
}

export default ShootableTarget;
