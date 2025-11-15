/**
 * Advanced Puzzle System
 * Simon Says, Memory Match, and Rhythm-Based Puzzles
 */

import * as THREE from 'three';
import { getPuzzleHintSystem } from './PuzzleHintSystem.js';
import { getHintConfigForPuzzleType } from '../data/puzzleHintConfigs.js';

export const PuzzleTypes = {
  SIMON_SAYS: 'simon_says',
  MEMORY_MATCH: 'memory_match',
  RHYTHM: 'rhythm',
  SEQUENCE: 'sequence', // Existing type
  COLOR_MATCH: 'color_match',
  PATTERN_REPEAT: 'pattern_repeat'
};

let puzzleSystemInstance = null;

export function initializeAdvancedPuzzleSystem(gameEngine) {
  if (puzzleSystemInstance) {
    return puzzleSystemInstance;
  }
  puzzleSystemInstance = new AdvancedPuzzleSystem(gameEngine);
  return puzzleSystemInstance;
}

export function getAdvancedPuzzleSystem() {
  return puzzleSystemInstance;
}

export class AdvancedPuzzleSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.activePuzzles = new Map();
    this.puzzleMeshes = new Map();
    this.hintSystem = null;

    // Initialize hint system
    try {
      this.hintSystem = getPuzzleHintSystem();
    } catch (error) {
      console.warn('[AdvancedPuzzleSystem] Hint system not available');
    }
  }

  /**
   * Create Simon Says puzzle
   */
  createSimonSaysPuzzle(config) {
    const puzzleId = `simon_${Date.now()}`;

    const puzzle = {
      id: puzzleId,
      type: PuzzleTypes.SIMON_SAYS,
      position: config.position,
      sequence: [],
      playerInput: [],
      currentLevel: 1,
      maxLevel: config.maxLevel || 5,
      colors: ['red', 'blue', 'green', 'yellow'],
      state: 'showing', // 'showing' | 'waiting' | 'complete' | 'failed'
      showDelay: config.showDelay || 800,
      timeLimit: config.timeLimit || 30000
    };

    this.generateSimonSequence(puzzle);
    this.activePuzzles.set(puzzleId, puzzle);
    this.createSimonVisuals(puzzle);

    // Register with hint system
    if (this.hintSystem) {
      const hintConfig = getHintConfigForPuzzleType('simon_says');
      this.hintSystem.registerPuzzle(puzzleId, hintConfig);
      this.hintSystem.startPuzzle(puzzleId);
    }

    return puzzle;
  }

  generateSimonSequence(puzzle) {
    const colors = puzzle.colors;
    const length = puzzle.currentLevel + 2; // Start with 3, increase by 1 per level
    puzzle.sequence = [];

    for (let i = 0; i < length; i++) {
      puzzle.sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }

    puzzle.playerInput = [];
  }

  createSimonVisuals(puzzle) {
    const group = new THREE.Group();
    group.position.set(puzzle.position.x, puzzle.position.y, puzzle.position.z);

    const colorMap = {
      red: 0xff0000,
      blue: 0x0000ff,
      green: 0x00ff00,
      yellow: 0xffff00
    };

    // Create 4 colored buttons in a square
    puzzle.colors.forEach((color, index) => {
      const geometry = new THREE.BoxGeometry(1, 1, 0.2);
      const material = new THREE.MeshBasicMaterial({
        color: colorMap[color],
        opacity: 0.5,
        transparent: true
      });

      const button = new THREE.Mesh(geometry, material);

      // Position in square formation
      const angle = (index / 4) * Math.PI * 2;
      button.position.set(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
      button.userData.color = color;
      button.userData.puzzleId = puzzle.id;

      group.add(button);
    });

    this.puzzleMeshes.set(puzzle.id, group);
    this.gameEngine.getScene().add(group);
  }

  /**
   * Create Memory Match puzzle
   */
  createMemoryMatchPuzzle(config) {
    const puzzleId = `memory_${Date.now()}`;

    const puzzle = {
      id: puzzleId,
      type: PuzzleTypes.MEMORY_MATCH,
      position: config.position,
      pairs: config.pairs || 4, // Number of pairs to match
      cards: [],
      flipped: [],
      matched: [],
      state: 'playing',
      timeLimit: config.timeLimit || 60000
    };

    this.generateMemoryCards(puzzle);
    this.activePuzzles.set(puzzleId, puzzle);
    this.createMemoryVisuals(puzzle);

    return puzzle;
  }

  generateMemoryCards(puzzle) {
    const symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cards = [];

    // Create pairs
    for (let i = 0; i < puzzle.pairs; i++) {
      cards.push(symbols[i], symbols[i]);
    }

    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    puzzle.cards = cards;
  }

  createMemoryVisuals(puzzle) {
    const group = new THREE.Group();
    group.position.set(puzzle.position.x, puzzle.position.y, puzzle.position.z);

    const cols = 4;
    const rows = Math.ceil(puzzle.cards.length / cols);

    puzzle.cards.forEach((symbol, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const geometry = new THREE.BoxGeometry(0.8, 1, 0.1);
      const material = new THREE.MeshBasicMaterial({
        color: 0x888888,
        side: THREE.DoubleSide
      });

      const card = new THREE.Mesh(geometry, material);
      card.position.set(col * 1.2 - 1.5, row * 1.4 - 1, 0);
      card.userData.index = index;
      card.userData.symbol = symbol;
      card.userData.flipped = false;
      card.userData.puzzleId = puzzle.id;

      group.add(card);
    });

    this.puzzleMeshes.set(puzzle.id, group);
    this.gameEngine.getScene().add(group);
  }

  /**
   * Create Rhythm puzzle
   */
  createRhythmPuzzle(config) {
    const puzzleId = `rhythm_${Date.now()}`;

    const puzzle = {
      id: puzzleId,
      type: PuzzleTypes.RHYTHM,
      position: config.position,
      beats: config.beats || this.generateRhythmPattern(8),
      currentBeat: 0,
      bpm: config.bpm || 120,
      tolerance: config.tolerance || 200, // ms timing window
      perfectHits: 0,
      goodHits: 0,
      misses: 0,
      state: 'playing',
      lastBeatTime: 0,
      startTime: Date.now()
    };

    puzzle.beatInterval = (60 / puzzle.bpm) * 1000; // Convert BPM to milliseconds

    this.activePuzzles.set(puzzleId, puzzle);
    this.createRhythmVisuals(puzzle);

    return puzzle;
  }

  generateRhythmPattern(length) {
    const patterns = ['hit', 'hold', 'double', 'wait'];
    const beats = [];

    for (let i = 0; i < length; i++) {
      if (i % 4 === 3) {
        beats.push('wait'); // Rest beat every 4th beat
      } else {
        beats.push(patterns[Math.floor(Math.random() * (patterns.length - 1))]);
      }
    }

    return beats;
  }

  createRhythmVisuals(puzzle) {
    const group = new THREE.Group();
    group.position.set(puzzle.position.x, puzzle.position.y, puzzle.position.z);

    // Create track
    const trackGeometry = new THREE.PlaneGeometry(10, 1);
    const trackMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      side: THREE.DoubleSide
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    group.add(track);

    // Create hit zone
    const hitZoneGeometry = new THREE.PlaneGeometry(0.5, 1);
    const hitZoneMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const hitZone = new THREE.Mesh(hitZoneGeometry, hitZoneMaterial);
    hitZone.position.x = -4;
    hitZone.userData.isHitZone = true;
    group.add(hitZone);

    // Create beat indicators
    puzzle.beats.forEach((beatType, index) => {
      const beatGeometry = new THREE.CircleGeometry(0.3, 16);
      const beatMaterial = new THREE.MeshBasicMaterial({
        color: this.getBeatColor(beatType),
        side: THREE.DoubleSide
      });
      const beat = new THREE.Mesh(beatGeometry, beatMaterial);
      beat.position.set(5 + index * 1.5, 0, 0.1);
      beat.userData.beatType = beatType;
      beat.userData.beatIndex = index;
      group.add(beat);
    });

    this.puzzleMeshes.set(puzzle.id, group);
    this.gameEngine.getScene().add(group);
  }

  getBeatColor(beatType) {
    const colors = {
      hit: 0xff0000,
      hold: 0x0000ff,
      double: 0xff00ff,
      wait: 0x666666
    };
    return colors[beatType] || 0xffffff;
  }

  /**
   * Update rhythm puzzle animation
   */
  updateRhythmPuzzle(puzzle, deltaTime) {
    const group = this.puzzleMeshes.get(puzzle.id);
    if (!group) return;

    const currentTime = Date.now() - puzzle.startTime;
    const expectedBeatTime = puzzle.currentBeat * puzzle.beatInterval;

    // Move beats towards hit zone
    group.children.forEach(child => {
      if (child.userData.beatIndex !== undefined) {
        const beatIndex = child.userData.beatIndex;
        const beatTime = beatIndex * puzzle.beatInterval;
        const timeUntilBeat = beatTime - currentTime;
        const distance = (timeUntilBeat / puzzle.beatInterval) * 1.5;

        child.position.x = -4 + distance;

        // Remove if passed
        if (child.position.x < -5) {
          child.visible = false;
          if (beatIndex === puzzle.currentBeat && puzzle.beats[beatIndex] !== 'wait') {
            puzzle.misses++;
            puzzle.currentBeat++;
          }
        }
      }
    });

    // Check if puzzle complete
    if (puzzle.currentBeat >= puzzle.beats.length) {
      puzzle.state = 'complete';
      this.emitPuzzleComplete(puzzle.id);
    }
  }

  /**
   * Handle rhythm input
   */
  handleRhythmInput(puzzleId) {
    const puzzle = this.activePuzzles.get(puzzleId);
    if (!puzzle || puzzle.state !== 'playing') return false;

    const currentTime = Date.now() - puzzle.startTime;
    const expectedBeatTime = puzzle.currentBeat * puzzle.beatInterval;
    const timeDiff = Math.abs(currentTime - expectedBeatTime);

    if (timeDiff < puzzle.tolerance) {
      if (timeDiff < puzzle.tolerance / 2) {
        puzzle.perfectHits++;
      } else {
        puzzle.goodHits++;
      }
      puzzle.currentBeat++;
      return true;
    }

    return false;
  }

  /**
   * Handle Simon Says input
   */
  handleSimonInput(puzzleId, color) {
    const puzzle = this.activePuzzles.get(puzzleId);
    if (!puzzle || puzzle.state !== 'waiting') return false;

    puzzle.playerInput.push(color);

    // Check if correct
    const index = puzzle.playerInput.length - 1;
    if (puzzle.sequence[index] !== color) {
      puzzle.state = 'failed';

      // Record failed attempt with hint system
      if (this.hintSystem) {
        this.hintSystem.recordAttempt(puzzleId, false);
      }

      this.emitPuzzleFailed(puzzleId);
      return false;
    }

    // Check if sequence complete
    if (puzzle.playerInput.length === puzzle.sequence.length) {
      puzzle.currentLevel++;

      if (puzzle.currentLevel > puzzle.maxLevel) {
        puzzle.state = 'complete';

        // Record success with hint system
        if (this.hintSystem) {
          this.hintSystem.recordAttempt(puzzleId, true);
        }

        this.emitPuzzleComplete(puzzleId);
      } else {
        this.generateSimonSequence(puzzle);
        puzzle.state = 'showing';
        this.showSimonSequence(puzzle);
      }
    }

    return true;
  }

  showSimonSequence(puzzle) {
    // Visual sequence animation would be triggered here
    puzzle.state = 'showing';

    setTimeout(() => {
      puzzle.state = 'waiting';
    }, puzzle.sequence.length * puzzle.showDelay);
  }

  /**
   * Handle memory card flip
   */
  handleMemoryCardFlip(puzzleId, cardIndex) {
    const puzzle = this.activePuzzles.get(puzzleId);
    if (!puzzle || puzzle.state !== 'playing') return false;

    if (puzzle.flipped.length >= 2) return false;
    if (puzzle.flipped.includes(cardIndex)) return false;
    if (puzzle.matched.includes(cardIndex)) return false;

    puzzle.flipped.push(cardIndex);

    if (puzzle.flipped.length === 2) {
      const [first, second] = puzzle.flipped;

      if (puzzle.cards[first] === puzzle.cards[second]) {
        puzzle.matched.push(first, second);
        puzzle.flipped = [];

        if (puzzle.matched.length === puzzle.cards.length) {
          puzzle.state = 'complete';
          this.emitPuzzleComplete(puzzleId);
        }
      } else {
        setTimeout(() => {
          puzzle.flipped = [];
        }, 1000);
      }
    }

    return true;
  }

  emitPuzzleComplete(puzzleId) {
    window.dispatchEvent(new CustomEvent('advancedPuzzleComplete', {
      detail: { puzzleId }
    }));
  }

  emitPuzzleFailed(puzzleId) {
    window.dispatchEvent(new CustomEvent('advancedPuzzleFailed', {
      detail: { puzzleId }
    }));
  }

  update(deltaTime) {
    this.activePuzzles.forEach(puzzle => {
      if (puzzle.type === PuzzleTypes.RHYTHM && puzzle.state === 'playing') {
        this.updateRhythmPuzzle(puzzle, deltaTime);
      }
    });
  }

  removePuzzle(puzzleId) {
    const mesh = this.puzzleMeshes.get(puzzleId);
    if (mesh) {
      this.gameEngine.getScene().remove(mesh);
      this.puzzleMeshes.delete(puzzleId);
    }
    this.activePuzzles.delete(puzzleId);
  }
}
