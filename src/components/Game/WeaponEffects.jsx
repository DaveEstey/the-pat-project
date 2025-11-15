import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Weapon Effects - Enhanced muzzle flash and weapon-specific visual effects
 */
export function WeaponEffects({ gameEngine }) {
  const muzzleFlashRef = useRef(null);
  const weaponTrailsRef = useRef([]);

  useEffect(() => {
    if (!gameEngine || !gameEngine.getScene) return;

    const handleWeaponFire = (event) => {
      const { weapon, position } = event.detail || {};

      // Create muzzle flash based on weapon type
      createMuzzleFlash(weapon || 'pistol', position);

      // Create weapon-specific trail effects
      createWeaponTrail(weapon || 'pistol', position);
    };

    window.addEventListener('weaponFired', handleWeaponFire);

    return () => {
      window.removeEventListener('weaponFired', handleWeaponFire);
      cleanup();
    };
  }, [gameEngine]);

  const createMuzzleFlash = (weaponType, position) => {
    if (!gameEngine || !gameEngine.getScene) return;

    const scene = gameEngine.getScene();
    const camera = gameEngine.getCamera();
    if (!camera) return;

    // Create flash based on weapon type
    let flashSize, flashColor, flashDuration;

    switch (weaponType) {
      case 'pistol':
        flashSize = 0.15; // Reduced from 0.3
        flashColor = 0xffaa44;
        flashDuration = 60; // Reduced from 80
        break;
      case 'shotgun':
        flashSize = 0.25; // Reduced from 0.6
        flashColor = 0xff8844;
        flashDuration = 80; // Reduced from 120
        break;
      case 'rapidfire':
        flashSize = 0.1; // Reduced from 0.2
        flashColor = 0xffcc66;
        flashDuration = 40; // Reduced from 50
        break;
      case 'grappling':
        flashSize = 0.2; // Reduced from 0.4
        flashColor = 0x00ffff;
        flashDuration = 100; // Reduced from 150
        break;
      default:
        flashSize = 0.15;
        flashColor = 0xffaa44;
        flashDuration = 60;
    }

    // Create flash geometry
    const flashGeometry = new THREE.SphereGeometry(flashSize, 8, 6);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: flashColor,
      transparent: true,
      opacity: 0.5 // Reduced from 0.9
    });

    const flash = new THREE.Mesh(flashGeometry, flashMaterial);

    // Position flash in front of camera (weapon position)
    const flashPosition = new THREE.Vector3(0.3, -0.2, -1);
    camera.localToWorld(flashPosition);
    flash.position.copy(flashPosition);

    scene.add(flash);

    // Animate flash
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / flashDuration;

      if (progress >= 1) {
        scene.remove(flash);
        flashGeometry.dispose();
        flashMaterial.dispose();
        return;
      }

      // Fade out and scale up
      flashMaterial.opacity = 0.5 * (1 - progress);
      flash.scale.setScalar(1 + progress * 1.5);

      requestAnimationFrame(animate);
    };

    animate();

    // Add light flash (reduced intensity)
    const flashLight = new THREE.PointLight(flashColor, 1.5, 8); // Reduced from 3, 10
    flashLight.position.copy(flashPosition);
    scene.add(flashLight);

    setTimeout(() => {
      scene.remove(flashLight);
    }, flashDuration);
  };

  const createWeaponTrail = (weaponType, position) => {
    if (!gameEngine || !gameEngine.getScene) return;
    if (weaponType !== 'rapidfire' && weaponType !== 'grappling') return;

    const scene = gameEngine.getScene();
    const camera = gameEngine.getCamera();
    if (!camera) return;

    // Rapidfire: Create tracer line
    if (weaponType === 'rapidfire') {
      const start = camera.position.clone();
      const direction = new THREE.Vector3(0, 0, -1);
      camera.getWorldDirection(direction);
      const end = start.clone().add(direction.multiplyScalar(50));

      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const material = new THREE.LineBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });

      const tracer = new THREE.Line(geometry, material);
      scene.add(tracer);

      // Fade out tracer
      const startTime = Date.now();
      const duration = 100;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          scene.remove(tracer);
          geometry.dispose();
          material.dispose();
          return;
        }

        material.opacity = 0.6 * (1 - progress);
        requestAnimationFrame(animate);
      };

      animate();
    }

    // Grappling: Create hook line effect
    if (weaponType === 'grappling') {
      const start = camera.position.clone();
      const direction = new THREE.Vector3(0, 0, -1);
      camera.getWorldDirection(direction);
      const end = start.clone().add(direction.multiplyScalar(30));

      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
        linewidth: 3
      });

      const hook = new THREE.Line(geometry, material);
      scene.add(hook);

      // Fade out hook
      setTimeout(() => {
        scene.remove(hook);
        geometry.dispose();
        material.dispose();
      }, 300);
    }
  };

  const cleanup = () => {
    if (!gameEngine || !gameEngine.getScene) return;

    // Clean up any remaining effects
    weaponTrailsRef.current.forEach(trail => {
      if (trail.parent) {
        gameEngine.getScene().remove(trail);
      }
    });
    weaponTrailsRef.current = [];
  };

  return null; // No UI, just 3D effects
}

export default WeaponEffects;
