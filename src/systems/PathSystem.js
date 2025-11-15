/**
 * Path System
 * Manages branching paths and route selection in levels
 */

import * as THREE from 'three';

// Path types
export const PathTypes = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
  UP: 'up',
  DOWN: 'down'
};

// Singleton instance
let pathSystemInstance = null;

/**
 * Initialize the Path System
 * @param {Object} gameEngine - Game engine instance
 * @returns {PathSystem}
 */
export function initializePathSystem(gameEngine) {
  if (pathSystemInstance) {
    console.warn('[PathSystem] Already initialized, returning existing instance');
    return pathSystemInstance;
  }

  pathSystemInstance = new PathSystem(gameEngine);
  console.log('[PathSystem] Initialized');
  return pathSystemInstance;
}

/**
 * Get the Path System instance
 * @returns {PathSystem}
 */
export function getPathSystem() {
  if (!pathSystemInstance) {
    console.error('[PathSystem] Not initialized! Call initializePathSystem() first');
    return null;
  }
  return pathSystemInstance;
}

export class PathSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.activePathChoices = new Map(); // id -> path choice data
    this.pathIndicators = new Map(); // id -> Three.js mesh
    this.selectedPath = null;
    this.pathHistory = []; // Track player's path choices throughout level
    this.isChoosingPath = false;
    this.choiceTimer = null;
    this.currentChoiceId = null;

    console.log('[PathSystem] System initialized');
  }

  /**
   * Create a path choice point
   * @param {Object} config - Path choice configuration
   * @returns {Object} Path choice data
   */
  createPathChoice(config) {
    const choiceId = `path_${Date.now()}_${Math.random()}`;

    const pathChoice = {
      id: choiceId,
      position: { ...config.position },
      paths: config.paths || [], // Array of path options
      timeLimit: config.timeLimit || 10000, // 10 seconds default
      autoSelect: config.autoSelect || 'center', // Default if time runs out
      active: false,
      selected: null,
      startTime: null
    };

    // Validate paths
    if (pathChoice.paths.length < 2) {
      console.error('[PathSystem] Path choice needs at least 2 paths');
      return null;
    }

    this.activePathChoices.set(choiceId, pathChoice);
    this.createPathIndicators(pathChoice);

    console.log(`[PathSystem] Created path choice with ${pathChoice.paths.length} options at`, config.position);
    return pathChoice;
  }

  /**
   * Create visual indicators for path choices
   */
  createPathIndicators(pathChoice) {
    const indicatorGroup = new THREE.Group();
    indicatorGroup.position.set(
      pathChoice.position.x,
      pathChoice.position.y + 2,
      pathChoice.position.z
    );

    pathChoice.paths.forEach((path, index) => {
      // Create arrow indicator for each path
      const arrowGeometry = this.createArrowGeometry();
      const arrowMaterial = new THREE.MeshBasicMaterial({
        color: this.getPathColor(path.type),
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });

      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

      // Position arrows based on path type
      const offset = this.getPathOffset(path.type, index, pathChoice.paths.length);
      arrow.position.set(offset.x, offset.y, offset.z);

      // Rotate arrow to point in path direction
      const rotation = this.getPathRotation(path.type);
      arrow.rotation.set(rotation.x, rotation.y, rotation.z);

      arrow.userData.pathType = path.type;
      arrow.userData.pathIndex = index;
      arrow.userData.choiceId = pathChoice.id;

      indicatorGroup.add(arrow);

      // Create text label
      if (path.label) {
        const textSprite = this.createTextSprite(path.label, path.description);
        textSprite.position.set(offset.x, offset.y + 1, offset.z);
        indicatorGroup.add(textSprite);
      }
    });

    this.pathIndicators.set(pathChoice.id, indicatorGroup);
    this.gameEngine.getScene().add(indicatorGroup);
  }

  /**
   * Create arrow geometry
   */
  createArrowGeometry() {
    const shape = new THREE.Shape();

    // Arrow head
    shape.moveTo(0, 1);
    shape.lineTo(-0.5, 0.5);
    shape.lineTo(-0.2, 0.5);
    shape.lineTo(-0.2, -0.5);
    shape.lineTo(0.2, -0.5);
    shape.lineTo(0.2, 0.5);
    shape.lineTo(0.5, 0.5);
    shape.lineTo(0, 1);

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: false
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  /**
   * Get color for path type
   */
  getPathColor(pathType) {
    const colors = {
      [PathTypes.LEFT]: 0x3498db,    // Blue
      [PathTypes.RIGHT]: 0xe74c3c,   // Red
      [PathTypes.CENTER]: 0x2ecc71,  // Green
      [PathTypes.UP]: 0xf39c12,      // Orange
      [PathTypes.DOWN]: 0x9b59b6     // Purple
    };
    return colors[pathType] || 0xffffff;
  }

  /**
   * Get offset position for path indicator
   */
  getPathOffset(pathType, index, totalPaths) {
    const spacing = 3;
    const offsets = {
      [PathTypes.LEFT]: { x: -spacing, y: 0, z: 0 },
      [PathTypes.RIGHT]: { x: spacing, y: 0, z: 0 },
      [PathTypes.CENTER]: { x: 0, y: 0, z: 0 },
      [PathTypes.UP]: { x: 0, y: spacing, z: 0 },
      [PathTypes.DOWN]: { x: 0, y: -spacing, z: 0 }
    };

    // If we have a predefined offset, use it
    if (offsets[pathType]) {
      return offsets[pathType];
    }

    // Otherwise, distribute evenly
    const angle = (index / totalPaths) * Math.PI * 2;
    return {
      x: Math.cos(angle) * spacing,
      y: 0,
      z: Math.sin(angle) * spacing
    };
  }

  /**
   * Get rotation for arrow based on path type
   */
  getPathRotation(pathType) {
    const rotations = {
      [PathTypes.LEFT]: { x: 0, y: Math.PI / 2, z: 0 },
      [PathTypes.RIGHT]: { x: 0, y: -Math.PI / 2, z: 0 },
      [PathTypes.CENTER]: { x: 0, y: 0, z: 0 },
      [PathTypes.UP]: { x: -Math.PI / 2, y: 0, z: 0 },
      [PathTypes.DOWN]: { x: Math.PI / 2, y: 0, z: 0 }
    };
    return rotations[pathType] || { x: 0, y: 0, z: 0 };
  }

  /**
   * Create text sprite for path label
   */
  createTextSprite(label, description) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;

    // Background
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Label text
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.fillText(label, canvas.width / 2, 80);

    // Description text
    if (description) {
      context.font = '32px Arial';
      context.fillStyle = '#cccccc';
      this.wrapText(context, description, canvas.width / 2, 140, canvas.width - 40, 40);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 2, 1);

    return sprite;
  }

  /**
   * Wrap text for canvas
   */
  wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let yOffset = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y + yOffset);
        line = words[n] + ' ';
        yOffset += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y + yOffset);
  }

  /**
   * Activate a path choice (player reached decision point)
   */
  activatePathChoice(choiceId) {
    const pathChoice = this.activePathChoices.get(choiceId);
    if (!pathChoice) {
      console.error('[PathSystem] Path choice not found:', choiceId);
      return false;
    }

    if (pathChoice.active) {
      return false; // Already active
    }

    pathChoice.active = true;
    pathChoice.startTime = Date.now();
    this.isChoosingPath = true;
    this.currentChoiceId = choiceId;

    // Start countdown timer
    this.choiceTimer = setTimeout(() => {
      this.selectPath(choiceId, pathChoice.autoSelect);
    }, pathChoice.timeLimit);

    // Emit event for UI
    window.dispatchEvent(new CustomEvent('pathChoiceActivated', {
      detail: {
        choiceId,
        paths: pathChoice.paths,
        timeLimit: pathChoice.timeLimit
      }
    }));

    console.log('[PathSystem] Path choice activated:', choiceId);
    return true;
  }

  /**
   * Select a path
   */
  selectPath(choiceId, pathType) {
    const pathChoice = this.activePathChoices.get(choiceId);
    if (!pathChoice || !pathChoice.active) {
      return false;
    }

    // Find the path by type
    const selectedPath = pathChoice.paths.find(p => p.type === pathType);
    if (!selectedPath) {
      console.error('[PathSystem] Invalid path type:', pathType);
      return false;
    }

    pathChoice.selected = selectedPath;
    pathChoice.active = false;
    this.isChoosingPath = false;
    this.selectedPath = selectedPath;

    // Clear timer
    if (this.choiceTimer) {
      clearTimeout(this.choiceTimer);
      this.choiceTimer = null;
    }

    // Record path history
    this.pathHistory.push({
      choiceId,
      pathType,
      timestamp: Date.now()
    });

    // Hide indicators
    const indicators = this.pathIndicators.get(choiceId);
    if (indicators) {
      indicators.visible = false;
    }

    // Emit selection event
    window.dispatchEvent(new CustomEvent('pathSelected', {
      detail: {
        choiceId,
        path: selectedPath,
        pathType
      }
    }));

    console.log('[PathSystem] Path selected:', pathType, selectedPath);
    return true;
  }

  /**
   * Get current path choice status
   */
  getCurrentChoice() {
    if (!this.currentChoiceId) return null;

    const pathChoice = this.activePathChoices.get(this.currentChoiceId);
    if (!pathChoice || !pathChoice.active) return null;

    const timeRemaining = pathChoice.timeLimit - (Date.now() - pathChoice.startTime);

    return {
      choiceId: this.currentChoiceId,
      paths: pathChoice.paths,
      timeRemaining: Math.max(0, timeRemaining),
      timeLimit: pathChoice.timeLimit
    };
  }

  /**
   * Get path history
   */
  getPathHistory() {
    return [...this.pathHistory];
  }

  /**
   * Update path indicators (pulse animation)
   */
  update(deltaTime) {
    this.pathIndicators.forEach((indicatorGroup, choiceId) => {
      const pathChoice = this.activePathChoices.get(choiceId);
      if (!pathChoice || !pathChoice.active) return;

      // Pulse animation
      const pulseSpeed = 2;
      const pulseAmount = 0.2;
      const scale = 1 + Math.sin(Date.now() * 0.001 * pulseSpeed) * pulseAmount;

      indicatorGroup.children.forEach(child => {
        if (child.type === 'Mesh') {
          child.scale.set(scale, scale, scale);
        }
      });
    });
  }

  /**
   * Remove a path choice
   */
  removePathChoice(choiceId) {
    const indicators = this.pathIndicators.get(choiceId);
    if (indicators) {
      this.gameEngine.getScene().remove(indicators);
      indicators.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.pathIndicators.delete(choiceId);
    }

    this.activePathChoices.delete(choiceId);
  }

  /**
   * Clear all path choices
   */
  clearAll() {
    this.activePathChoices.forEach((_, id) => {
      this.removePathChoice(id);
    });

    if (this.choiceTimer) {
      clearTimeout(this.choiceTimer);
      this.choiceTimer = null;
    }

    this.isChoosingPath = false;
    this.currentChoiceId = null;
  }

  /**
   * Reset for new level
   */
  reset() {
    this.clearAll();
    this.pathHistory = [];
    this.selectedPath = null;
  }
}
