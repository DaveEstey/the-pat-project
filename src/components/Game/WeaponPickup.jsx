import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WeaponTypes } from '../../types/weapons.js';

/**
 * Weapon Pickup - Collectible weapon that unlocks when collected
 */
export function WeaponPickup({ gameEngine, weaponType, position, onCollected }) {
  const pickupRef = useRef(null);
  const groupRef = useRef(null);
  const isCollectedRef = useRef(false); // Prevent multiple collections

  useEffect(() => {
    if (!gameEngine || !gameEngine.getScene) return;

    // Check if pickup already exists in scene to prevent duplicates
    if (groupRef.current && groupRef.current.parent) {
      return;
    }

    const scene = gameEngine.getScene();

    // Create weapon pickup visual
    const group = new THREE.Group();

    // Base platform - MUCH LARGER and more visible
    const platformGeometry = new THREE.CylinderGeometry(2.5, 2.8, 0.5, 16);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.25;
    group.add(platform);

    // Weapon icon (different shape per weapon)
    let weaponMesh;
    switch (weaponType) {
      case WeaponTypes.SHOTGUN:
        // Shotgun representation
        const shotgunGeometry = new THREE.BoxGeometry(0.3, 0.3, 1.2);
        const shotgunMaterial = new THREE.MeshStandardMaterial({
          color: 0xff6600,
          emissive: 0xff6600,
          emissiveIntensity: 0.3
        });
        weaponMesh = new THREE.Mesh(shotgunGeometry, shotgunMaterial);
        weaponMesh.rotation.x = Math.PI / 4;
        break;

      case WeaponTypes.RAPIDFIRE:
        // Rapid fire representation
        const rapidfireGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
        const rapidfireMaterial = new THREE.MeshStandardMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.3
        });
        weaponMesh = new THREE.Mesh(rapidfireGeometry, rapidfireMaterial);
        weaponMesh.rotation.z = Math.PI / 2;
        break;

      case WeaponTypes.GRAPPLING:
        // Grappling arm representation
        const grapplingGeometry = new THREE.TorusGeometry(0.4, 0.15, 8, 12);
        const grapplingMaterial = new THREE.MeshStandardMaterial({
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 0.3
        });
        weaponMesh = new THREE.Mesh(grapplingGeometry, grapplingMaterial);
        break;

      default:
        // Default weapon representation
        const defaultGeometry = new THREE.SphereGeometry(0.4, 12, 8);
        const defaultMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 0.3
        });
        weaponMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
    }

    weaponMesh.position.y = 1.2;
    group.add(weaponMesh);

    // Glowing ring indicator - MASSIVE SIZE
    const ringGeometry = new THREE.TorusGeometry(3.5, 0.3, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.5;
    group.add(ring);

    // Add VERY BRIGHT point light
    const light = new THREE.PointLight(0x00ff00, 8, 20);
    light.position.y = 2;
    group.add(light);

    // Add WIDER vertical beam of light
    const beamGeometry = new THREE.CylinderGeometry(1.5, 1.5, 15, 16);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.y = 7.5;
    group.add(beam);

    // Position the group
    group.position.set(position.x, position.y, position.z);

    // Mark for raycasting - set userData on ALL meshes
    const pickupData = {
      type: 'weapon_pickup',
      weaponType: weaponType,
      pickupId: `weapon_${weaponType}_${Date.now()}`
    };

    group.userData = pickupData;
    weaponMesh.userData = pickupData;
    platform.userData = pickupData;
    ring.userData = pickupData;
    beam.userData = pickupData;

    // IMPORTANT: Traverse all children and set userData
    group.traverse((child) => {
      if (child.isMesh) {
        child.userData = pickupData;
      }
    });

    scene.add(group);
    groupRef.current = group;
    pickupRef.current = weaponMesh;

    // Animation loop
    const startTime = Date.now();
    const animate = () => {
      if (!pickupRef.current || !groupRef.current) return;

      const elapsed = (Date.now() - startTime) / 1000;

      // Rotate weapon
      pickupRef.current.rotation.y = elapsed;

      // Bob up and down
      weaponMesh.position.y = 1.2 + Math.sin(elapsed * 2) * 0.2;

      // Pulse ring
      ring.scale.setScalar(1 + Math.sin(elapsed * 3) * 0.1);
      ringMaterial.opacity = 0.4 + Math.sin(elapsed * 3) * 0.2;

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (groupRef.current && groupRef.current.parent) {
        scene.remove(groupRef.current);

        // Dispose geometries and materials
        group.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [gameEngine, weaponType, position]);

  // Handle collection event
  useEffect(() => {
    const handleWeaponPickup = (event) => {
      const { pickupId, weaponType: collectedWeapon } = event.detail || {};

      // Prevent multiple collections
      if (isCollectedRef.current) {
        return;
      }

      // Match by pickupId OR by weaponType (in case pickupId doesn't match)
      const isMatch = groupRef.current && (
        groupRef.current.userData.pickupId === pickupId ||
        groupRef.current.userData.weaponType === collectedWeapon
      );

      if (isMatch) {

        // Mark as collected immediately to prevent multiple collections
        isCollectedRef.current = true;

        const scene = gameEngine.getScene();
        const group = groupRef.current;

        // IMMEDIATELY make pickup non-interactive by removing userData
        group.traverse((child) => {
          if (child.userData) {
            delete child.userData.type;
            delete child.userData.pickupId;
          }
        });

        // MASSIVE COLLECTION EFFECT
        // 1. Create explosion of particles
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
          const particleGeometry = new THREE.SphereGeometry(0.3, 8, 6);
          const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 1.0
          });
          const particle = new THREE.Mesh(particleGeometry, particleMaterial);

          particle.position.copy(group.position);

          // Random direction
          const angle = (i / particleCount) * Math.PI * 2;
          const elevation = Math.random() * Math.PI - Math.PI / 2;
          const speed = 5 + Math.random() * 5;

          const velocity = {
            x: Math.cos(angle) * Math.cos(elevation) * speed,
            y: Math.sin(elevation) * speed,
            z: Math.sin(angle) * Math.cos(elevation) * speed
          };

          scene.add(particle);

          // Animate particle
          const startTime = Date.now();
          const duration = 1000;

          const animateParticle = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
              scene.remove(particle);
              particleGeometry.dispose();
              particleMaterial.dispose();
              return;
            }

            particle.position.x += velocity.x * 0.016;
            particle.position.y += velocity.y * 0.016;
            particle.position.z += velocity.z * 0.016;

            particleMaterial.opacity = 1 - progress;
            particle.scale.setScalar(1 + progress * 2);

            requestAnimationFrame(animateParticle);
          };

          setTimeout(() => animateParticle(), i * 10);
        }

        // 2. Flash effect
        const flashGeometry = new THREE.SphereGeometry(5, 16, 12);
        const flashMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 1.0
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(group.position);
        scene.add(flash);

        const flashStartTime = Date.now();
        const flashDuration = 500;

        const animateFlash = () => {
          const elapsed = Date.now() - flashStartTime;
          const progress = elapsed / flashDuration;

          if (progress >= 1) {
            scene.remove(flash);
            flashGeometry.dispose();
            flashMaterial.dispose();
            return;
          }

          flashMaterial.opacity = 1 - progress;
          flash.scale.setScalar(1 + progress * 3);

          requestAnimationFrame(animateFlash);
        };

        animateFlash();

        // 3. Weapon rises up and disappears
        const startTime = Date.now();
        const duration = 1000;

        const collectAnimation = () => {
          const elapsed = Date.now() - startTime;
          const progress = elapsed / duration;

          if (progress >= 1) {
            // Remove from scene
            if (group.parent) {
              scene.remove(group);
            }

            // Dispose geometries and materials
            group.traverse((child) => {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => mat.dispose());
                } else {
                  child.material.dispose();
                }
              }
            });

            // Clear the ref so component knows it's been collected
            groupRef.current = null;
            pickupRef.current = null;

            // Notify parent
            if (onCollected) {
              onCollected(collectedWeapon);
            }

            return;
          }

          // Rise up and fade out
          group.position.y = position.y + progress * 5;
          group.rotation.y = progress * Math.PI * 4;

          // Fade all materials
          group.traverse((child) => {
            if (child.material) {
              if (child.material.opacity !== undefined) {
                child.material.opacity = 1 - progress;
              }
            }
          });

          requestAnimationFrame(collectAnimation);
        };

        collectAnimation();
      }
    };

    window.addEventListener('weaponPickupCollected', handleWeaponPickup);

    return () => {
      window.removeEventListener('weaponPickupCollected', handleWeaponPickup);
    };
  }, [gameEngine, weaponType, position, onCollected]);

  return null; // No DOM rendering
}

export default WeaponPickup;
