import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

/**
 * Interactive Puzzle - Shootable targets that must be hit in sequence
 *
 * Types:
 * - switch_sequence: Hit numbered switches in correct order
 * - timed_targets: Hit all targets before time runs out
 * - color_match: Hit targets matching the displayed color
 */

export function InteractivePuzzle({
  gameEngine,
  type = 'switch_sequence',
  onComplete,
  onFail,
  timeLimit = 30000 // 30 seconds
}) {
  const [puzzleState, setPuzzleState] = useState('active');
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const targetsRef = useRef([]);
  const startTimeRef = useRef(Date.now());
  const sequenceRef = useRef([]);
  const currentIndexRef = useRef(0);
  const puzzleStateRef = useRef('active'); // Track state in ref to avoid stale closures
  const timerIntervalRef = useRef(null); // Track interval for cleanup

  // Initialize puzzle
  useEffect(() => {
    if (!gameEngine || !gameEngine.getScene) return;

    // Emit puzzle started event
    window.dispatchEvent(new CustomEvent('puzzleStarted', {
      detail: { type, timeLimit }
    }));

    // Generate puzzle based on type
    switch (type) {
      case 'switch_sequence':
        createSwitchSequence();
        break;
      case 'timed_targets':
        createTimedTargets();
        break;
      case 'color_match':
        createColorMatch();
        break;
      default:
        createSwitchSequence();
    }

    // Start timer
    timerIntervalRef.current = setInterval(() => {
      // Check ref instead of state to avoid stale closure
      if (puzzleStateRef.current !== 'active') {
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0 && puzzleStateRef.current === 'active') {
        handlePuzzleFail();
      }
    }, 100);

    // Listen for puzzle target hits
    const handlePuzzleHit = (event) => {
      if (puzzleState !== 'active') return;
      checkTargetHit(event.detail);
    };

    window.addEventListener('puzzleTargetHit', handlePuzzleHit);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      window.removeEventListener('puzzleTargetHit', handlePuzzleHit);
      cleanup();
    };
  }, [gameEngine, type]);

  const createSwitchSequence = useCallback(() => {
    const scene = gameEngine.getScene();
    const sequence = [1, 3, 2, 4]; // Correct sequence

    // Position switches closer to camera and spread out horizontally
    const positions = [
      { x: -6, y: 2, z: -8 },   // Far left
      { x: -2, y: 2, z: -8 },   // Mid left
      { x: 2, y: 2, z: -8 },    // Mid right
      { x: 6, y: 2, z: -8 }     // Far right
    ];

    sequenceRef.current = sequence;
    currentIndexRef.current = 0;

    positions.forEach((pos, index) => {
      const switchId = index + 1;
      const target = createSwitchTarget(switchId, pos);
      targetsRef.current.push(target);
      scene.add(target.group);
    });

  }, [gameEngine]);

  const createTimedTargets = useCallback(() => {
    const scene = gameEngine.getScene();
    const targetCount = 6;
    const positions = [];

    // Generate random positions
    for (let i = 0; i < targetCount; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 3 + 0.5,
        z: -10 - Math.random() * 5
      });
    }

    positions.forEach((pos, index) => {
      const target = createSimpleTarget(index + 1, pos);
      targetsRef.current.push(target);
      scene.add(target.group);
    });

  }, [gameEngine]);

  const createColorMatch = useCallback(() => {
    const scene = gameEngine.getScene();
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    const targetColor = colors[Math.floor(Math.random() * colors.length)];

    sequenceRef.current = [targetColor];

    const positions = [
      { x: -3, y: 1.5, z: -12 },
      { x: -1, y: 1.5, z: -12 },
      { x: 1, y: 1.5, z: -12 },
      { x: 3, y: 1.5, z: -12 }
    ];

    positions.forEach((pos, index) => {
      const color = colors[index];
      const target = createColorTarget(color, pos);
      targetsRef.current.push(target);
      scene.add(target.group);
    });

  }, [gameEngine]);

  function createSwitchTarget(id, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    // Base - larger and darker
    const baseGeometry = new THREE.CylinderGeometry(0.8, 0.9, 0.5, 16);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.25;
    group.add(base);

    // Button - larger and glowing
    const buttonGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const buttonMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.y = 0.15;
    button.userData = {
      isPuzzleTarget: true,
      targetId: id,
      targetType: 'switch'
    };
    group.add(button);

    // Glowing outer ring
    const ringGeometry = new THREE.TorusGeometry(0.6, 0.1, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.15;
    group.add(ring);

    // Number label - larger sphere
    const labelGeometry = new THREE.SphereGeometry(0.3);
    const labelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: false
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.y = 0.9;
    group.add(label);

    // Add pulsing animation to ring
    const startTime = Date.now();
    const animate = () => {
      if (ring.parent) {
        const elapsed = (Date.now() - startTime) / 1000;
        ring.scale.set(1 + Math.sin(elapsed * 2) * 0.1, 1, 1 + Math.sin(elapsed * 2) * 0.1);
        ringMaterial.opacity = 0.4 + Math.sin(elapsed * 3) * 0.2;
        requestAnimationFrame(animate);
      }
    };
    animate();

    return {
      group,
      id,
      activated: false,
      button,
      buttonMaterial
    };
  }

  function createSimpleTarget(id, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    const geometry = new THREE.SphereGeometry(0.4);
    const material = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      emissive: 0x440000
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.userData = {
      isPuzzleTarget: true,
      targetId: id,
      targetType: 'simple'
    };
    group.add(sphere);

    return {
      group,
      id,
      activated: false,
      sphere,
      material
    };
  }

  function createColorTarget(color, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.2);
    const material = new THREE.MeshLambertMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3
    });
    const box = new THREE.Mesh(geometry, material);
    box.userData = {
      isPuzzleTarget: true,
      targetId: color,
      targetType: 'color',
      color: color
    };
    group.add(box);

    return {
      group,
      id: color,
      color,
      activated: false,
      box,
      material
    };
  }

  const checkTargetHit = useCallback((hitData) => {
    const { targetId, targetType } = hitData;

    if (type === 'switch_sequence') {
      // Check if correct switch in sequence
      const expectedId = sequenceRef.current[currentIndexRef.current];
      if (targetId === expectedId) {
        // Correct!
        activateTarget(targetId);
        currentIndexRef.current++;
        const newProgress = currentIndexRef.current / sequenceRef.current.length;
        setProgress(newProgress);

        // Emit progress event
        window.dispatchEvent(new CustomEvent('puzzleProgress', {
          detail: { progress: newProgress }
        }));

        if (currentIndexRef.current >= sequenceRef.current.length) {
          handlePuzzleComplete();
        }
      } else {
        // Wrong switch - reset
        resetPuzzle();
      }
    } else if (type === 'timed_targets') {
      // Any target hit counts
      activateTarget(targetId);
      const activeCount = targetsRef.current.filter(t => t.activated).length;
      const newProgress = activeCount / targetsRef.current.length;
      setProgress(newProgress);

      // Emit progress event
      window.dispatchEvent(new CustomEvent('puzzleProgress', {
        detail: { progress: newProgress }
      }));

      if (activeCount >= targetsRef.current.length) {
        handlePuzzleComplete();
      }
    } else if (type === 'color_match') {
      // Check if correct color
      const targetColor = sequenceRef.current[0];
      if (targetId === targetColor) {
        activateTarget(targetId);
        handlePuzzleComplete();
      } else {
      }
    }
  }, [type]);

  const activateTarget = useCallback((targetId) => {
    const target = targetsRef.current.find(t => t.id === targetId);
    if (!target || target.activated) return;

    target.activated = true;

    // Change appearance to show activated
    if (target.buttonMaterial) {
      target.buttonMaterial.color.setHex(0x0000ff);
      target.buttonMaterial.emissive.setHex(0x0000ff);
    } else if (target.material) {
      target.material.emissive.setHex(0xffffff);
      target.material.emissiveIntensity = 0.8;
    }

  }, []);

  const resetPuzzle = useCallback(() => {
    currentIndexRef.current = 0;
    setProgress(0);

    targetsRef.current.forEach(target => {
      target.activated = false;
      if (target.buttonMaterial) {
        target.buttonMaterial.color.setHex(0x00ff00);
        target.buttonMaterial.emissive.setHex(0x004400);
      } else if (target.material) {
        target.material.emissive.setHex(target.color || 0xff0000);
        target.material.emissiveIntensity = 0.3;
      }
    });
  }, []);

  const handlePuzzleComplete = useCallback(() => {
    // Update both state and ref
    setPuzzleState('completed');
    puzzleStateRef.current = 'completed';

    // Clear timer immediately
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Bonus points for time remaining
    const timeBonus = Math.floor(timeRemaining / 100);

    // Emit completion event
    window.dispatchEvent(new CustomEvent('puzzleCompleted', {
      detail: { timeRemaining, bonusPoints: timeBonus }
    }));

    if (onComplete) {
      onComplete({
        success: true,
        timeRemaining,
        bonusPoints: timeBonus
      });
    }
  }, [timeRemaining, onComplete]);

  const handlePuzzleFail = useCallback(() => {
    // Update both state and ref
    setPuzzleState('failed');
    puzzleStateRef.current = 'failed';

    // Clear timer immediately to prevent infinite loop
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Emit fail event
    window.dispatchEvent(new CustomEvent('puzzleFailed', {
      detail: { reason: 'timeout' }
    }));

    if (onFail) {
      onFail({
        success: false,
        reason: 'timeout'
      });
    }
  }, [onFail]);

  const cleanup = useCallback(() => {
    const scene = gameEngine?.getScene();
    if (!scene) return;

    targetsRef.current.forEach(target => {
      if (target.group && target.group.parent) {
        scene.remove(target.group);
      }
    });
    targetsRef.current = [];
  }, [gameEngine]);

  return null; // This component just manages 3D objects, no UI
}

export default InteractivePuzzle;
