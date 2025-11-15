/**
 * Puzzle Hint Visual Component
 * Renders visual hints in the 3D scene (highlighting, arrows, etc.)
 */

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export function PuzzleHintVisual({ puzzleId, targets = [], scene }) {
  const [highlightedObjects, setHighlightedObjects] = useState([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!scene || targets.length === 0) return;

    // Create highlight objects for each target
    const highlights = targets.map(target => {
      // Create a pulsing glow mesh around the target
      const geometry = new THREE.SphereGeometry(target.radius || 0.5, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: target.highlightColor || 0xffff00,
        transparent: true,
        opacity: 0.3,
        wireframe: false,
        side: THREE.DoubleSide
      });

      const highlightMesh = new THREE.Mesh(geometry, material);
      highlightMesh.position.set(
        target.position.x,
        target.position.y,
        target.position.z
      );

      // Add to scene
      scene.add(highlightMesh);

      // Create outer ring for emphasis
      const ringGeometry = new THREE.RingGeometry(
        (target.radius || 0.5) * 1.2,
        (target.radius || 0.5) * 1.5,
        32
      );
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: target.highlightColor || 0xffff00,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });

      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.position.copy(highlightMesh.position);
      ringMesh.lookAt(0, ringMesh.position.y, 10); // Face camera

      scene.add(ringMesh);

      // Optional: Add number label if specified
      let textSprite = null;
      if (target.showNumbers && target.number !== undefined) {
        textSprite = createNumberSprite(target.number, target.highlightColor);
        textSprite.position.set(
          target.position.x,
          target.position.y + (target.radius || 0.5) + 0.5,
          target.position.z
        );
        scene.add(textSprite);
      }

      return {
        mesh: highlightMesh,
        ring: ringMesh,
        textSprite,
        pulseSpeed: target.pulseSpeed || 1.0,
        baseOpacity: 0.3,
        time: 0
      };
    });

    setHighlightedObjects(highlights);

    // Animate pulse effect
    let lastTime = Date.now();
    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      highlights.forEach(highlight => {
        highlight.time += deltaTime * highlight.pulseSpeed;

        // Pulsing opacity
        const pulse = Math.sin(highlight.time * Math.PI) * 0.5 + 0.5;
        highlight.mesh.material.opacity = highlight.baseOpacity + pulse * 0.4;
        highlight.ring.material.opacity = 0.3 + pulse * 0.4;

        // Pulsing scale
        const scale = 1.0 + pulse * 0.2;
        highlight.mesh.scale.setScalar(scale);
        highlight.ring.scale.setScalar(scale);

        // Rotate ring
        highlight.ring.rotation.z += deltaTime * 0.5;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      highlights.forEach(highlight => {
        scene.remove(highlight.mesh);
        scene.remove(highlight.ring);
        if (highlight.textSprite) {
          scene.remove(highlight.textSprite);
        }

        highlight.mesh.geometry.dispose();
        highlight.mesh.material.dispose();
        highlight.ring.geometry.dispose();
        highlight.ring.material.dispose();
      });

      setHighlightedObjects([]);
    };
  }, [scene, targets, puzzleId]);

  // This component only manages Three.js objects, no React rendering
  return null;
}

/**
 * Create a text sprite for number labels
 */
function createNumberSprite(number, color) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 128;

  // Draw background circle
  context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  context.beginPath();
  context.arc(64, 64, 60, 0, Math.PI * 2);
  context.fill();

  // Draw number
  context.fillStyle = '#000000';
  context.font = 'bold 72px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(number.toString(), 64, 64);

  // Create texture and sprite
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.8, 0.8, 1);

  return sprite;
}

export default PuzzleHintVisual;
