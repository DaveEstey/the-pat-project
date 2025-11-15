import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

/**
 * Path Selector - Allows player to choose between different paths by shooting arrows
 */
export function PathSelector({
  gameEngine,
  paths = [],
  onPathSelected,
  position = { x: 0, y: 2, z: -15 }
}) {
  const [pathsCreated, setPathsCreated] = useState(false);
  const arrowsRef = useRef([]);
  const selectedPathRef = useRef(null);

  useEffect(() => {
    if (!gameEngine || !gameEngine.getScene || pathsCreated) return;

    const scene = gameEngine.getScene();

    // Create arrow indicators for each path
    paths.forEach((path, index) => {
      const arrowData = createPathArrow(path, index, scene);
      arrowsRef.current.push(arrowData);
    });

    // Listen for arrow hits
    const handleArrowHit = (event) => {
      const { targetId } = event.detail;
      const arrow = arrowsRef.current.find(a => a.id === targetId);

      if (arrow && !selectedPathRef.current) {
        selectedPathRef.current = arrow.pathData;
        activateArrow(arrow);

        // Emit selection
        if (onPathSelected) {
          setTimeout(() => {
            onPathSelected(arrow.pathData);
          }, 1000);
        }
      }
    };

    window.addEventListener('pathArrowHit', handleArrowHit);
    setPathsCreated(true);

    return () => {
      window.removeEventListener('pathArrowHit', handleArrowHit);
      cleanup();
    };
  }, [gameEngine, paths, pathsCreated]);

  const createPathArrow = useCallback((pathData, index, scene) => {
    const group = new THREE.Group();

    // Position arrows in a fan pattern
    const totalPaths = paths.length;
    const spreadAngle = Math.PI / 4; // 45 degrees
    const angle = (index - (totalPaths - 1) / 2) * (spreadAngle / Math.max(totalPaths - 1, 1));

    const distance = 15;
    const x = position.x + Math.sin(angle) * distance;
    const y = position.y;
    const z = position.z + Math.cos(angle) * distance;

    group.position.set(x, y, z);

    // Create arrow sign
    const signGeometry = new THREE.BoxGeometry(2, 1.5, 0.2);
    const signMaterial = new THREE.MeshLambertMaterial({
      color: pathData.color || 0x00ff00,
      emissive: pathData.color || 0x00ff00,
      emissiveIntensity: 0.5
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.userData = {
      isPathArrow: true,
      targetId: `path_${index}`,
      pathData: pathData
    };
    group.add(sign);

    // Add arrow pointer
    const arrowGeometry = new THREE.ConeGeometry(0.5, 1, 3);
    const arrow = new THREE.Mesh(arrowGeometry, signMaterial);
    arrow.rotation.x = Math.PI / 2;
    arrow.position.set(0, 1.2, 0);
    group.add(arrow);

    // Add text label (simple sphere representing text)
    const labelGeometry = new THREE.SphereGeometry(0.3);
    const labelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 0, 0.2);
    group.add(label);

    // Add glow ring
    const ringGeometry = new THREE.TorusGeometry(1.2, 0.1, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: pathData.color || 0x00ff00,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.y = Math.PI / 2;
    group.add(ring);

    // Animate ring
    const startTime = Date.now();
    const animateRing = () => {
      if (ring.parent) {
        const elapsed = (Date.now() - startTime) / 1000;
        ring.scale.set(1 + Math.sin(elapsed * 2) * 0.1, 1 + Math.sin(elapsed * 2) * 0.1, 1);
        ringMaterial.opacity = 0.4 + Math.sin(elapsed * 3) * 0.2;
        requestAnimationFrame(animateRing);
      }
    };
    animateRing();

    scene.add(group);

    return {
      id: `path_${index}`,
      pathData,
      group,
      sign,
      signMaterial,
      ring,
      ringMaterial
    };
  }, [paths, position]);

  const activateArrow = useCallback((arrow) => {
    // Change color to indicate selection
    arrow.signMaterial.color.setHex(0xffff00);
    arrow.signMaterial.emissive.setHex(0xffff00);
    arrow.ringMaterial.color.setHex(0xffff00);

    // Disable other arrows
    arrowsRef.current.forEach(a => {
      if (a.id !== arrow.id) {
        a.signMaterial.opacity = 0.3;
        a.ringMaterial.opacity = 0.1;
      }
    });
  }, []);

  const cleanup = useCallback(() => {
    const scene = gameEngine?.getScene();
    if (!scene) return;

    arrowsRef.current.forEach(arrow => {
      if (arrow.group && arrow.group.parent) {
        scene.remove(arrow.group);
      }
    });
    arrowsRef.current = [];
  }, [gameEngine]);

  return null; // This component just manages 3D objects
}

export default PathSelector;
