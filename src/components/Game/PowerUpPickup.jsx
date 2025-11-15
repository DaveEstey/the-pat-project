import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PowerUpTypes } from '../../systems/PowerUpSystem.js';

/**
 * Power-Up Pickup - 3D collectible power-up objects
 */
export function PowerUpPickup({ type, position, onCollect, scene }) {
  const meshRef = useRef(null);
  const lightRef = useRef(null);
  const rotationRef = useRef(0);

  // Power-up visual configs
  const powerUpVisuals = {
    [PowerUpTypes.DOUBLE_DAMAGE]: {
      color: 0xff4444,
      icon: '⚔️',
      geometry: 'octahedron'
    },
    [PowerUpTypes.RAPID_FIRE]: {
      color: 0xff8800,
      icon: '🔥',
      geometry: 'cone'
    },
    [PowerUpTypes.SHIELD]: {
      color: 0x4444ff,
      icon: '🛡️',
      geometry: 'icosahedron'
    },
    [PowerUpTypes.SPEED_BOOST]: {
      color: 0xffff44,
      icon: '⚡',
      geometry: 'tetrahedron'
    },
    [PowerUpTypes.INFINITE_AMMO]: {
      color: 0x44ff44,
      icon: '∞',
      geometry: 'torus'
    },
    [PowerUpTypes.MULTI_SHOT]: {
      color: 0xff44ff,
      icon: '✦',
      geometry: 'dodecahedron'
    },
    [PowerUpTypes.CRITICAL_BOOST]: {
      color: 0xffaa00,
      icon: '★',
      geometry: 'octahedron'
    },
    [PowerUpTypes.HEALTH_REGEN]: {
      color: 0x00ff88,
      icon: '💚',
      geometry: 'sphere'
    }
  };

  useEffect(() => {
    if (!scene) return;

    const visual = powerUpVisuals[type];
    if (!visual) return;

    // Create geometry based on type
    let geometry;
    switch (visual.geometry) {
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(0.5);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.4, 0.8, 8);
        break;
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(0.5);
        break;
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(0.5);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.4, 0.15, 8, 16);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(0.5);
        break;
      case 'sphere':
      default:
        geometry = new THREE.SphereGeometry(0.5, 16, 16);
        break;
    }

    // Create material with emissive glow
    const material = new THREE.MeshStandardMaterial({
      color: visual.color,
      emissive: visual.color,
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y + 1, position.z);
    mesh.userData = {
      isPowerUp: true,
      powerUpType: type,
      onCollect: onCollect
    };
    scene.add(mesh);
    meshRef.current = mesh;

    // Create point light for glow effect
    const light = new THREE.PointLight(visual.color, 1, 5);
    light.position.copy(mesh.position);
    scene.add(light);
    lightRef.current = light;

    // Animate
    const animatePickup = () => {
      if (!meshRef.current) return;

      rotationRef.current += 0.02;
      meshRef.current.rotation.y = rotationRef.current;
      meshRef.current.rotation.x = Math.sin(rotationRef.current * 0.5) * 0.3;

      // Floating animation
      const floatOffset = Math.sin(Date.now() * 0.002) * 0.2;
      meshRef.current.position.y = position.y + 1 + floatOffset;

      // Pulse glow
      const pulseIntensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
      material.emissiveIntensity = pulseIntensity;
      if (lightRef.current) {
        lightRef.current.intensity = 1 + pulseIntensity;
      }

      requestAnimationFrame(animatePickup);
    };

    animatePickup();

    // Cleanup
    return () => {
      if (meshRef.current) {
        scene.remove(meshRef.current);
        geometry.dispose();
        material.dispose();
      }
      if (lightRef.current) {
        scene.remove(lightRef.current);
      }
    };
  }, [scene, type, position, onCollect]);

  return null; // This component only manages 3D objects
}

export default PowerUpPickup;
