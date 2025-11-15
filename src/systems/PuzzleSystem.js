import * as THREE from 'three';
import { GameUtils } from '../utils/gameUtils.js';

export class PuzzleSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.activePuzzles = new Map();
    this.puzzleElements = new Map();
    this.listeners = {};

    // Puzzle state
    this.currentPuzzle = null;
    this.puzzleTimer = 0;
    this.puzzleTimeLimit = 30000; // 30 seconds default
    this.puzzleHints = [];
  }

  // Initialize puzzle for current room
  initializePuzzle(puzzleConfig) {
    if (!puzzleConfig || this.currentPuzzle) return;

    this.currentPuzzle = {
      id: `puzzle_${Date.now()}`,
      type: puzzleConfig.type,
      config: puzzleConfig,
      state: 'active',
      startTime: Date.now(),
      timeLimit: puzzleConfig.timeLimit || this.puzzleTimeLimit,
      completed: false,
      elements: [],
      progress: 0,
      maxProgress: puzzleConfig.maxProgress || 1
    };

    // Create puzzle elements based on type
    this.createPuzzleElements(this.currentPuzzle);

    // Start puzzle timer
    this.startPuzzleTimer();

    // Emit puzzle started event
    this.gameEngine.emit('puzzleStarted', {
      puzzle: this.currentPuzzle,
      timeLimit: this.currentPuzzle.timeLimit
    });

    return this.currentPuzzle;
  }

  createPuzzleElements(puzzle) {
    const scene = this.gameEngine.getScene();
    if (!scene) return;

    switch (puzzle.type) {
      case 'switch_sequence':
        this.createSwitchSequencePuzzle(puzzle);
        break;
      case 'terrain_modifier':
        this.createTerrainModifierPuzzle(puzzle);
        break;
      case 'door_mechanism':
        this.createDoorMechanismPuzzle(puzzle);
        break;
      case 'path_selector':
        this.createPathSelectorPuzzle(puzzle);
        break;
      default:
        console.warn('Unknown puzzle type:', puzzle.type);
    }
  }

  createSwitchSequencePuzzle(puzzle) {
    const config = puzzle.config;
    const sequence = config.sequence || [1, 3, 2, 4];
    const switchPositions = config.positions || [
      { x: -3, y: 1, z: -8 },
      { x: -1, y: 1, z: -8 },
      { x: 1, y: 1, z: -8 },
      { x: 3, y: 1, z: -8 }
    ];

    puzzle.targetSequence = sequence;
    puzzle.currentSequence = [];
    puzzle.maxProgress = sequence.length;

    // Create switch objects
    switchPositions.forEach((pos, index) => {
      const switchObj = this.createSwitchObject(index + 1, pos);
      puzzle.elements.push({
        id: index + 1,
        type: 'switch',
        mesh: switchObj,
        position: pos,
        activated: false,
        canActivate: true
      });

      this.gameEngine.getScene().add(switchObj);
    });
  }

  createSwitchObject(id, position) {
    const group = new THREE.Group();

    // Switch base
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.3, 8);
    const baseMaterial = new THREE.MeshLambertMaterial({
      color: 0x444444,
      emissive: 0x222222
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, -0.15, 0);
    group.add(base);

    // Switch button
    const buttonGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
    const buttonMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      emissive: 0x00aa00,
      emissiveIntensity: 0.8
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(0, 0.1, 0);
    button.userData = { switchId: id, type: 'puzzle_switch' };
    group.add(button);

    // Switch number display
    const loader = new THREE.FontLoader();
    // Note: In production, you'd load an actual font file
    // For now, create a simple text representation with a plane
    const textGeometry = new THREE.PlaneGeometry(0.5, 0.3);
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(id.toString(), 32, 20);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 0.5, 0);
    textMesh.lookAt(0, 0, 1); // Face the player
    group.add(textMesh);

    group.position.set(position.x, position.y, position.z);
    group.userData = { switchId: id, type: 'puzzle_switch' };

    return group;
  }

  createTerrainModifierPuzzle(puzzle) {
    const config = puzzle.config;
    const targetPositions = config.targets || [
      { x: 0, y: 0, z: -10 },
      { x: 2, y: 0, z: -8 },
      { x: -2, y: 0, z: -6 }
    ];

    puzzle.targetPositions = targetPositions;
    puzzle.modifiedPositions = [];
    puzzle.maxProgress = targetPositions.length;

    // Create target markers
    targetPositions.forEach((pos, index) => {
      const marker = this.createTargetMarker(index, pos);
      puzzle.elements.push({
        id: index,
        type: 'terrain_target',
        mesh: marker,
        position: pos,
        modified: false
      });

      this.gameEngine.getScene().add(marker);
    });
  }

  createTargetMarker(id, position) {
    const group = new THREE.Group();

    // Target ring
    const ringGeometry = new THREE.RingGeometry(0.8, 1.0, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2; // Lay flat
    group.add(ring);

    // Center indicator
    const centerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.set(0, 0.25, 0);
    group.add(center);

    group.position.set(position.x, position.y, position.z);
    group.userData = { targetId: id, type: 'terrain_target' };

    return group;
  }

  createDoorMechanismPuzzle(puzzle) {
    const config = puzzle.config;
    const doorPosition = config.doorPosition || { x: 0, y: 2, z: -12 };
    const keyPositions = config.keyPositions || [
      { x: -4, y: 1, z: -10 },
      { x: 4, y: 1, z: -10 }
    ];

    puzzle.requiredKeys = keyPositions.length;
    puzzle.collectedKeys = 0;
    puzzle.maxProgress = puzzle.requiredKeys;

    // Create door
    const door = this.createDoorObject(doorPosition);
    puzzle.elements.push({
      id: 'door',
      type: 'door',
      mesh: door,
      position: doorPosition,
      locked: true
    });
    this.gameEngine.getScene().add(door);

    // Create keys
    keyPositions.forEach((pos, index) => {
      const key = this.createKeyObject(index, pos);
      puzzle.elements.push({
        id: `key_${index}`,
        type: 'key',
        mesh: key,
        position: pos,
        collected: false
      });
      this.gameEngine.getScene().add(key);
    });
  }

  createDoorObject(position) {
    const group = new THREE.Group();

    // Door frame
    const frameGeometry = new THREE.BoxGeometry(3, 4, 0.2);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    group.add(frame);

    // Door panels
    const leftPanelGeometry = new THREE.BoxGeometry(1.4, 3.8, 0.15);
    const rightPanelGeometry = new THREE.BoxGeometry(1.4, 3.8, 0.15);
    const panelMaterial = new THREE.MeshLambertMaterial({
      color: 0x654321,
      emissive: 0x220000 // Slightly red to indicate locked
    });

    const leftPanel = new THREE.Mesh(leftPanelGeometry, panelMaterial);
    const rightPanel = new THREE.Mesh(rightPanelGeometry, panelMaterial);

    leftPanel.position.set(-0.75, 0, 0.1);
    rightPanel.position.set(0.75, 0, 0.1);

    group.add(leftPanel);
    group.add(rightPanel);

    // Lock indicator
    const lockGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.2);
    const lockMaterial = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      emissive: 0x440000
    });
    const lock = new THREE.Mesh(lockGeometry, lockMaterial);
    lock.position.set(0, 0, 0.2);
    group.add(lock);

    group.position.set(position.x, position.y, position.z);
    group.userData = { type: 'puzzle_door', locked: true };

    return group;
  }

  createKeyObject(id, position) {
    const group = new THREE.Group();

    // Key shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const keyMaterial = new THREE.MeshLambertMaterial({
      color: 0xffd700,
      emissive: 0x332200
    });
    const shaft = new THREE.Mesh(shaftGeometry, keyMaterial);
    shaft.rotation.z = Math.PI / 2;
    group.add(shaft);

    // Key head
    const headGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 8);
    const head = new THREE.Mesh(headGeometry, keyMaterial);
    head.position.set(-0.5, 0, 0);
    head.rotation.z = Math.PI / 2;
    group.add(head);

    // Floating animation
    group.userData = {
      type: 'puzzle_key',
      keyId: id,
      startY: position.y,
      floatOffset: Math.random() * Math.PI * 2
    };

    group.position.set(position.x, position.y, position.z);

    return group;
  }

  createPathSelectorPuzzle(puzzle) {
    const config = puzzle.config;
    const paths = config.paths || [
      { id: 'left', position: { x: -3, y: 0, z: -15 }, correct: false },
      { id: 'center', position: { x: 0, y: 0, z: -15 }, correct: true },
      { id: 'right', position: { x: 3, y: 0, z: -15 }, correct: false }
    ];

    puzzle.paths = paths;
    puzzle.selectedPath = null;
    puzzle.maxProgress = 1;

    // Create path indicators
    paths.forEach((path, index) => {
      const indicator = this.createPathIndicator(path, index);
      puzzle.elements.push({
        id: path.id,
        type: 'path_indicator',
        mesh: indicator,
        position: path.position,
        correct: path.correct,
        selected: false
      });
      this.gameEngine.getScene().add(indicator);
    });
  }

  createPathIndicator(path, index) {
    const group = new THREE.Group();

    // Arrow pointing forward
    const arrowGeometry = new THREE.ConeGeometry(0.5, 2, 6);
    const arrowMaterial = new THREE.MeshLambertMaterial({
      color: path.correct ? 0x00ff00 : 0xff4444,
      transparent: true,
      opacity: 0.8
    });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.rotation.x = Math.PI / 2; // Point forward
    arrow.position.set(0, 1, -1);
    group.add(arrow);

    // Base platform
    const baseGeometry = new THREE.CylinderGeometry(0.8, 1.0, 0.2, 8);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    group.add(base);

    group.position.set(path.position.x, path.position.y, path.position.z);
    group.userData = {
      type: 'path_selector',
      pathId: path.id,
      correct: path.correct
    };

    return group;
  }

  // Handle player interaction with puzzle elements
  handleInteraction(screenX, screenY, camera) {
    if (!this.currentPuzzle || this.currentPuzzle.completed) return false;

    // Raycast from screen position to find puzzle elements
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Convert screen coordinates to normalized device coordinates
    const canvas = this.gameEngine.renderer?.domElement;
    if (!canvas) return false;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((screenX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((screenY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check intersection with puzzle elements
    const puzzleObjects = this.currentPuzzle.elements.map(el => el.mesh);
    const intersects = raycaster.intersectObjects(puzzleObjects, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const userData = clickedObject.userData || clickedObject.parent?.userData;

      if (userData) {
        return this.handlePuzzleElementClick(userData, clickedObject);
      }
    }

    return false;
  }

  handlePuzzleElementClick(userData, object) {
    if (!this.currentPuzzle) return false;

    switch (userData.type) {
      case 'puzzle_switch':
        return this.handleSwitchClick(userData.switchId);
      case 'terrain_target':
        return this.handleTerrainTargetClick(userData.targetId);
      case 'puzzle_key':
        return this.handleKeyCollection(userData.keyId);
      case 'path_selector':
        return this.handlePathSelection(userData.pathId, userData.correct);
      default:
        return false;
    }
  }

  handleSwitchClick(switchId) {
    if (this.currentPuzzle.type !== 'switch_sequence') return false;

    // Add to current sequence
    this.currentPuzzle.currentSequence.push(switchId);

    // Update switch visual state
    const switchElement = this.currentPuzzle.elements.find(el => el.id === switchId);
    if (switchElement) {
      switchElement.activated = true;
      // Change switch color to indicate activation
      const button = switchElement.mesh.children.find(child => child.userData?.switchId === switchId);
      if (button && button.material) {
        button.material.color.setHex(0xff6600);
        button.material.emissive.setHex(0x331100);
      }
    }

    // Check if sequence is complete
    const targetSequence = this.currentPuzzle.targetSequence;
    const currentSequence = this.currentPuzzle.currentSequence;

    if (currentSequence.length >= targetSequence.length) {
      // Check if sequence matches
      const isCorrect = targetSequence.every((val, index) => val === currentSequence[index]);

      if (isCorrect) {
        this.completePuzzle();
      } else {
        // Reset sequence
        this.resetSwitchSequence();
      }
    }

    // Update progress
    this.currentPuzzle.progress = currentSequence.length;

    return true;
  }

  handleTerrainTargetClick(targetId) {
    if (this.currentPuzzle.type !== 'terrain_modifier') return false;

    const targetElement = this.currentPuzzle.elements.find(el => el.id === targetId);
    if (targetElement && !targetElement.modified) {
      targetElement.modified = true;
      this.currentPuzzle.modifiedPositions.push(targetId);

      // Change target visual state
      const ring = targetElement.mesh.children[0];
      if (ring && ring.material) {
        ring.material.color.setHex(0x00ff00);
        ring.material.emissive.setHex(0x002200);
      }

      // Update progress
      this.currentPuzzle.progress = this.currentPuzzle.modifiedPositions.length;

      // Check if all targets are modified
      if (this.currentPuzzle.progress >= this.currentPuzzle.maxProgress) {
        this.completePuzzle();
      }

      return true;
    }

    return false;
  }

  handleKeyCollection(keyId) {
    if (this.currentPuzzle.type !== 'door_mechanism') return false;

    const keyElement = this.currentPuzzle.elements.find(el => el.id === `key_${keyId}`);
    if (keyElement && !keyElement.collected) {
      keyElement.collected = true;
      this.currentPuzzle.collectedKeys++;

      // Hide key mesh
      keyElement.mesh.visible = false;

      // Update progress
      this.currentPuzzle.progress = this.currentPuzzle.collectedKeys;

      // Check if all keys are collected
      if (this.currentPuzzle.collectedKeys >= this.currentPuzzle.requiredKeys) {
        this.unlockDoor();
        this.completePuzzle();
      }

      return true;
    }

    return false;
  }

  handlePathSelection(pathId, isCorrect) {
    if (this.currentPuzzle.type !== 'path_selector') return false;

    this.currentPuzzle.selectedPath = pathId;
    this.currentPuzzle.progress = 1;

    // Update visual feedback
    this.currentPuzzle.elements.forEach(el => {
      if (el.id === pathId) {
        el.selected = true;
        // Highlight selected path
        const arrow = el.mesh.children[0];
        if (arrow && arrow.material) {
          arrow.material.opacity = 1.0;
          arrow.material.emissive.setHex(isCorrect ? 0x002200 : 0x220000);
        }
      }
    });

    if (isCorrect) {
      this.completePuzzle();
    } else {
      // Wrong path selected - give feedback but don't fail immediately
      setTimeout(() => {
        this.resetPathSelection();
      }, 1000);
    }

    return true;
  }

  resetSwitchSequence() {
    if (this.currentPuzzle.type !== 'switch_sequence') return;

    // Reset sequence data
    this.currentPuzzle.currentSequence = [];
    this.currentPuzzle.progress = 0;

    // Reset switch visuals
    this.currentPuzzle.elements.forEach(el => {
      if (el.type === 'switch') {
        el.activated = false;
        const button = el.mesh.children.find(child => child.userData?.switchId === el.id);
        if (button && button.material) {
          button.material.color.setHex(0x00ff00);
          button.material.emissive.setHex(0x002200);
        }
      }
    });
  }

  resetPathSelection() {
    if (this.currentPuzzle.type !== 'path_selector') return;

    // Reset selection data
    this.currentPuzzle.selectedPath = null;
    this.currentPuzzle.progress = 0;

    // Reset path visuals
    this.currentPuzzle.elements.forEach(el => {
      if (el.type === 'path_indicator') {
        el.selected = false;
        const arrow = el.mesh.children[0];
        if (arrow && arrow.material) {
          arrow.material.opacity = 0.8;
          arrow.material.emissive.setHex(0x000000);
        }
      }
    });
  }

  unlockDoor() {
    const doorElement = this.currentPuzzle.elements.find(el => el.id === 'door');
    if (doorElement) {
      doorElement.locked = false;

      // Change door color to indicate unlocked
      const lock = doorElement.mesh.children[3]; // Lock is the 4th child
      if (lock && lock.material) {
        lock.material.color.setHex(0x00ff00);
        lock.material.emissive.setHex(0x002200);
      }

      // Animate door opening
      this.animateDoorOpening(doorElement.mesh);
    }
  }

  animateDoorOpening(doorMesh) {
    const leftPanel = doorMesh.children[1];
    const rightPanel = doorMesh.children[2];

    const startTime = Date.now();
    const duration = 2000; // 2 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) return;

      // Move panels apart
      const openDistance = progress * 1.5;
      leftPanel.position.x = -0.75 - openDistance;
      rightPanel.position.x = 0.75 + openDistance;

      requestAnimationFrame(animate);
    };

    animate();
  }

  startPuzzleTimer() {
    if (!this.currentPuzzle) return;

    const startTime = Date.now();

    const updateTimer = () => {
      if (!this.currentPuzzle || this.currentPuzzle.completed) return;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, this.currentPuzzle.timeLimit - elapsed);

      this.currentPuzzle.timeRemaining = remaining;

      // Emit timer update
      this.gameEngine.emit('puzzleTimerUpdate', {
        timeRemaining: remaining,
        timeLimit: this.currentPuzzle.timeLimit,
        progress: this.currentPuzzle.progress,
        maxProgress: this.currentPuzzle.maxProgress
      });

      if (remaining <= 0) {
        this.failPuzzle();
      } else {
        setTimeout(updateTimer, 100);
      }
    };

    updateTimer();
  }

  completePuzzle() {
    if (!this.currentPuzzle || this.currentPuzzle.completed) return;

    this.currentPuzzle.completed = true;
    this.currentPuzzle.state = 'completed';

    // Emit completion event
    this.gameEngine.emit('puzzleCompleted', {
      puzzle: this.currentPuzzle,
      timeUsed: Date.now() - this.currentPuzzle.startTime,
      timeLimit: this.currentPuzzle.timeLimit
    });

    // Clean up after delay
    setTimeout(() => {
      this.cleanupPuzzle();
    }, 2000);
  }

  failPuzzle() {
    if (!this.currentPuzzle || this.currentPuzzle.completed) return;

    this.currentPuzzle.completed = true;
    this.currentPuzzle.state = 'failed';

    // Emit failure event (but no damage as per spec)
    this.gameEngine.emit('puzzleFailed', {
      puzzle: this.currentPuzzle,
      reason: 'timeout'
    });

    // Reset and try again or move on
    setTimeout(() => {
      this.cleanupPuzzle();
    }, 1000);
  }

  cleanupPuzzle() {
    if (!this.currentPuzzle) return;

    // Remove puzzle elements from scene
    this.currentPuzzle.elements.forEach(element => {
      if (element.mesh && element.mesh.parent) {
        element.mesh.parent.remove(element.mesh);
      }
    });

    // Clear puzzle state
    this.currentPuzzle = null;
  }

  // Update system - handle animations and interactions
  update(deltaTime) {
    if (!this.currentPuzzle) return;

    // Update floating key animations
    if (this.currentPuzzle.type === 'door_mechanism') {
      this.currentPuzzle.elements.forEach(element => {
        if (element.type === 'key' && !element.collected) {
          const mesh = element.mesh;
          const userData = mesh.userData;

          // Floating animation
          const time = Date.now() * 0.001;
          mesh.position.y = userData.startY + Math.sin(time * 2 + userData.floatOffset) * 0.3;
          mesh.rotation.y += deltaTime * 2; // Rotate
        }
      });
    }

    // Update path indicator animations
    if (this.currentPuzzle.type === 'path_selector') {
      this.currentPuzzle.elements.forEach(element => {
        if (element.type === 'path_indicator') {
          const arrow = element.mesh.children[0];
          if (arrow && !element.selected) {
            // Gentle pulsing animation
            const time = Date.now() * 0.001;
            const pulse = 0.8 + Math.sin(time * 3) * 0.1;
            arrow.material.opacity = pulse;
          }
        }
      });
    }
  }

  // Clean up system
  cleanup() {
    this.cleanupPuzzle();
    this.activePuzzles.clear();
    this.puzzleElements.clear();
  }
}