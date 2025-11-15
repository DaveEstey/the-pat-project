/**
 * Tutorial Manager Component
 * Handles tutorial triggers and integration with gameplay
 */

import { useEffect, useRef } from 'react';
import { initializeTutorialSystem, getTutorialSystem, TutorialSteps } from '../../systems/TutorialSystem.js';

export function TutorialManager({
  gameState,
  playerStats,
  currentLevel,
  isPaused
}) {
  const tutorialSystemRef = useRef(null);
  const triggeredStepsRef = useRef(new Set());
  const shotCountRef = useRef(0);
  const weaponSwitchCountRef = useRef(0);
  const killCountRef = useRef(0);

  // Initialize tutorial system
  useEffect(() => {
    if (!tutorialSystemRef.current) {
      initializeTutorialSystem();
      tutorialSystemRef.current = getTutorialSystem();
      console.log('[TutorialManager] Tutorial system initialized');
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Show initial tutorial on first level start
  useEffect(() => {
    if (!tutorialSystemRef.current || isPaused) return;

    if (currentLevel === 1 && gameState === 'playing') {
      // Show movement tutorial first
      setTimeout(() => {
        tutorialSystemRef.current.showTutorial(TutorialSteps.MOVEMENT);
        triggeredStepsRef.current.add(TutorialSteps.MOVEMENT);
      }, 1000);

      // Show aiming tutorial after movement
      setTimeout(() => {
        tutorialSystemRef.current.showTutorial(TutorialSteps.AIMING);
        triggeredStepsRef.current.add(TutorialSteps.AIMING);
      }, 7000);

      // Show shooting tutorial after aiming
      setTimeout(() => {
        tutorialSystemRef.current.showTutorial(TutorialSteps.SHOOTING);
        triggeredStepsRef.current.add(TutorialSteps.SHOOTING);
      }, 12000);
    }
  }, [currentLevel, gameState, isPaused]);

  // Listen for weapon fire events
  useEffect(() => {
    const handleWeaponFire = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      shotCountRef.current++;

      // Show reloading tutorial after several shots
      if (shotCountRef.current === 10 && !triggeredStepsRef.current.has(TutorialSteps.RELOADING)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.RELOADING);
        triggeredStepsRef.current.add(TutorialSteps.RELOADING);
      }

      // Update shooting tutorial progress
      tutorialSystemRef.current.updateProgress(TutorialSteps.SHOOTING, {
        shots: shotCountRef.current
      });
    };

    window.addEventListener('weaponFired', handleWeaponFire);
    return () => window.removeEventListener('weaponFired', handleWeaponFire);
  }, [isPaused]);

  // Listen for weapon switch events
  useEffect(() => {
    const handleWeaponSwitch = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      weaponSwitchCountRef.current++;

      // Show weapon switch tutorial on first switch
      if (weaponSwitchCountRef.current === 1 && !triggeredStepsRef.current.has(TutorialSteps.WEAPON_SWITCH)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.WEAPON_SWITCH);
        triggeredStepsRef.current.add(TutorialSteps.WEAPON_SWITCH);
      }
    };

    window.addEventListener('weaponSwitched', handleWeaponSwitch);
    return () => window.removeEventListener('weaponSwitched', handleWeaponSwitch);
  }, [isPaused]);

  // Listen for enemy kill events
  useEffect(() => {
    const handleEnemyKilled = (event) => {
      if (!tutorialSystemRef.current || isPaused) return;

      killCountRef.current++;

      // Show enemy types tutorial on first kill
      if (killCountRef.current === 1 && !triggeredStepsRef.current.has(TutorialSteps.ENEMY_TYPES)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.ENEMY_TYPES);
        triggeredStepsRef.current.add(TutorialSteps.ENEMY_TYPES);
      }

      // Show combo tutorial after several kills
      if (killCountRef.current === 5 && !triggeredStepsRef.current.has(TutorialSteps.COMBOS)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.COMBOS);
        triggeredStepsRef.current.add(TutorialSteps.COMBOS);
      }
    };

    window.addEventListener('enemyKilled', handleEnemyKilled);
    return () => window.removeEventListener('enemyKilled', handleEnemyKilled);
  }, [isPaused]);

  // Listen for weak point hits
  useEffect(() => {
    const handleWeakPointHit = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      if (!triggeredStepsRef.current.has(TutorialSteps.WEAK_POINTS)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.WEAK_POINTS);
        triggeredStepsRef.current.add(TutorialSteps.WEAK_POINTS);
      }
    };

    window.addEventListener('weakPointHit', handleWeakPointHit);
    return () => window.removeEventListener('weakPointHit', handleWeakPointHit);
  }, [isPaused]);

  // Listen for dodge roll events
  useEffect(() => {
    const handleDodgeRoll = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      if (!triggeredStepsRef.current.has(TutorialSteps.DODGE_ROLL)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.DODGE_ROLL);
        triggeredStepsRef.current.add(TutorialSteps.DODGE_ROLL);
      }
    };

    window.addEventListener('dodgeRollUsed', handleDodgeRoll);
    return () => window.removeEventListener('dodgeRollUsed', handleDodgeRoll);
  }, [isPaused]);

  // Listen for puzzle events
  useEffect(() => {
    const handlePuzzleStarted = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      if (!triggeredStepsRef.current.has(TutorialSteps.PUZZLE_INTRO)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.PUZZLE_INTRO);
        triggeredStepsRef.current.add(TutorialSteps.PUZZLE_INTRO);
      }
    };

    window.addEventListener('puzzleStarted', handlePuzzleStarted);
    return () => window.removeEventListener('puzzleStarted', handlePuzzleStarted);
  }, [isPaused]);

  // Listen for collectible pickups
  useEffect(() => {
    const handleItemCollected = (event) => {
      if (!tutorialSystemRef.current || isPaused) return;

      const { itemType } = event.detail || {};

      // Show collectibles tutorial
      if (!triggeredStepsRef.current.has(TutorialSteps.COLLECTIBLES)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.COLLECTIBLES);
        triggeredStepsRef.current.add(TutorialSteps.COLLECTIBLES);
      }

      // Show power-ups tutorial
      if (itemType === 'powerup' && !triggeredStepsRef.current.has(TutorialSteps.POWER_UPS)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.POWER_UPS);
        triggeredStepsRef.current.add(TutorialSteps.POWER_UPS);
      }
    };

    window.addEventListener('itemCollected', handleItemCollected);
    return () => window.removeEventListener('itemCollected', handleItemCollected);
  }, [isPaused]);

  // Listen for currency earned
  useEffect(() => {
    const handleCurrencyEarned = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      if (!triggeredStepsRef.current.has(TutorialSteps.CURRENCY)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.CURRENCY);
        triggeredStepsRef.current.add(TutorialSteps.CURRENCY);
      }
    };

    window.addEventListener('currencyEarned', handleCurrencyEarned);
    return () => window.removeEventListener('currencyEarned', handleCurrencyEarned);
  }, [isPaused]);

  // Listen for cover usage
  useEffect(() => {
    const handleCoverUsed = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      if (!triggeredStepsRef.current.has(TutorialSteps.COVER_SYSTEM)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.COVER_SYSTEM);
        triggeredStepsRef.current.add(TutorialSteps.COVER_SYSTEM);
      }
    };

    window.addEventListener('coverUsed', handleCoverUsed);
    return () => window.removeEventListener('coverUsed', handleCoverUsed);
  }, [isPaused]);

  // Listen for branching path encounters
  useEffect(() => {
    const handleBranchingPath = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      if (!triggeredStepsRef.current.has(TutorialSteps.BRANCHING_PATHS)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.BRANCHING_PATHS);
        triggeredStepsRef.current.add(TutorialSteps.BRANCHING_PATHS);
      }
    };

    window.addEventListener('branchingPathEncountered', handleBranchingPath);
    return () => window.removeEventListener('branchingPathEncountered', handleBranchingPath);
  }, [isPaused]);

  // Listen for hazard encounters
  useEffect(() => {
    const handleHazardEncounter = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      if (!triggeredStepsRef.current.has(TutorialSteps.HAZARDS)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.HAZARDS);
        triggeredStepsRef.current.add(TutorialSteps.HAZARDS);
      }
    };

    window.addEventListener('hazardEncountered', handleHazardEncounter);
    return () => window.removeEventListener('hazardEncountered', handleHazardEncounter);
  }, [isPaused]);

  // Listen for destructible encounters
  useEffect(() => {
    const handleDestructibleDestroyed = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      if (!triggeredStepsRef.current.has(TutorialSteps.DESTRUCTIBLES)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.DESTRUCTIBLES);
        triggeredStepsRef.current.add(TutorialSteps.DESTRUCTIBLES);
      }
    };

    window.addEventListener('destructibleDestroyed', handleDestructibleDestroyed);
    return () => window.removeEventListener('destructibleDestroyed', handleDestructibleDestroyed);
  }, [isPaused]);

  // Listen for alt-fire usage
  useEffect(() => {
    const handleAltFire = () => {
      if (!tutorialSystemRef.current || isPaused) return;

      if (!triggeredStepsRef.current.has(TutorialSteps.SPECIAL_WEAPONS)) {
        tutorialSystemRef.current.showTutorial(TutorialSteps.SPECIAL_WEAPONS);
        triggeredStepsRef.current.add(TutorialSteps.SPECIAL_WEAPONS);
      }
    };

    window.addEventListener('altFireUsed', handleAltFire);
    return () => window.removeEventListener('altFireUsed', handleAltFire);
  }, [isPaused]);

  // Listen for ESC key to skip tutorials
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && tutorialSystemRef.current) {
        tutorialSystemRef.current.skipCurrentTutorial();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // This component doesn't render anything, it just manages tutorial logic
  return null;
}

export default TutorialManager;
