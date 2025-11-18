import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { EnemyStats } from '../../types/enemies.js';
import { EnemyAISystem } from '../../systems/EnemyAISystem.js';
import { getWeaponUpgradeSystem } from '../../systems/WeaponUpgradeSystem.js';
import { BossIntroSequence } from './BossIntroSequence.jsx';

// Helper function to get points for enemy type
function getPointsForEnemyType(enemyType) {
  const stats = EnemyStats[enemyType] || EnemyStats['basic_shooter'];
  return stats.points || 100; // Default to 100 points
}

// Helper function to get currency reward for enemy type
function getCurrencyForEnemyType(enemyType) {
  const currencyTable = {
    'basic': 10,
    'basic_shooter': 10,
    'armored': 25,
    'ninja': 20,
    'bomber': 30,
    'fast_debuffer': 15,
    'boss': 100
  };
  return currencyTable[enemyType] || 10; // Default to 10 currency
}

// Helper function to get boss name based on level
function getBossName(levelNumber, roomIndex) {
  const bossNames = {
    3: 'THE UNDERGROUND GUARDIAN',
    6: 'HAUNTED PHANTOM LORD',
    9: 'TEMPLE ANCIENT ONE',
    12: 'THE ULTIMATE ADVERSARY'
  };
  return bossNames[levelNumber] || 'BOSS THREAT';
}

// Helper function to get boss subtitle
function getBossSubtitle(levelNumber, roomIndex) {
  const bossSubtitles = {
    3: 'Defender of the Fortress Depths',
    6: 'Master of Dark Spirits',
    9: 'Keeper of Sacred Knowledge',
    12: 'Final Test of Skill and Courage'
  };
  return bossSubtitles[levelNumber] || 'Prepare for battle';
}

// Enhanced enemy mesh creation with detailed visuals
function createEnhancedEnemyMesh(enemy) {
  const group = new THREE.Group();
  group.userData = { enemyId: enemy.id };

  switch (enemy.type) {
    case 'basic':
      // Basic Shooter - Simple humanoid soldier (SMALLER HITBOX)
      {
        // Body - reduced to 50% width for tighter hitbox
        const bodyGeometry = new THREE.BoxGeometry(0.5, 1.6, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({
          color: 0xff4444,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        group.add(body);

        // Head - reduced size
        const headGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.4);
        const headMaterial = new THREE.MeshLambertMaterial({
          color: 0xff6666,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.7;
        group.add(head);

        // Weapon - simple box (marked as non-hittable)
        const weaponGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.1);
        const weaponMaterial = new THREE.MeshLambertMaterial({
          color: 0x333333,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weapon.position.set(0.4, 1.0, 0);
        weapon.rotation.z = -Math.PI / 6;
        weapon.userData.isDebug = true; // Mark as non-hittable
        group.add(weapon);
      }
      break;

    case 'armored':
      // Armored Enemy - Bulky with armor plating (REDUCED HITBOX)
      {
        // Main body - reduced width by ~40%
        const bodyGeometry = new THREE.BoxGeometry(0.8, 2.0, 0.6);
        const bodyMaterial = new THREE.MeshLambertMaterial({
          color: 0x666666,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        group.add(body);

        // Armor plating - reduced width
        const armorGeometry = new THREE.BoxGeometry(0.9, 0.4, 0.7);
        const armorMaterial = new THREE.MeshLambertMaterial({
          color: 0x888888,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const chestArmor = new THREE.Mesh(armorGeometry, armorMaterial);
        chestArmor.position.y = 1.3;
        group.add(chestArmor);

        // Helmet - angular design
        const helmetGeometry = new THREE.BoxGeometry(0.6, 0.7, 0.6);
        const helmetMaterial = new THREE.MeshLambertMaterial({
          color: 0x444444,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = 2.2;
        group.add(helmet);

        // Heavy weapon (marked as non-hittable)
        const weaponGeometry = new THREE.BoxGeometry(0.3, 1.0, 0.15);
        const weaponMaterial = new THREE.MeshLambertMaterial({
          color: 0x222222,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weapon.position.set(0.6, 1.2, 0);
        weapon.rotation.z = -Math.PI / 4;
        weapon.userData.isDebug = true; // Mark as non-hittable
        group.add(weapon);
      }
      break;

    case 'ninja':
      // Ninja - Sleek and agile looking
      {
        // Sleek body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.4, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({
          color: 0x2222aa,
          transparent: true,
          opacity: enemy.spawning ? 0 : 0.8 // Slightly transparent for stealth
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.7;
        group.add(body);

        // Ninja mask/head
        const headGeometry = new THREE.SphereGeometry(0.35, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({
          color: 0x111199,
          transparent: true,
          opacity: enemy.spawning ? 0 : 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        group.add(head);

        // Twin blades
        const bladeGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.05);
        const bladeMaterial = new THREE.MeshLambertMaterial({
          color: 0xaaaaaa,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const blade1 = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade1.position.set(0.5, 1.2, 0.2);
        const blade2 = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade2.position.set(0.5, 1.2, -0.2);
        group.add(blade1);
        group.add(blade2);
      }
      break;

    case 'bomb_thrower':
      // Bomb Thrower - Bulky with explosive equipment
      {
        // Body
        const bodyGeometry = new THREE.BoxGeometry(1.2, 1.8, 0.8);
        const bodyMaterial = new THREE.MeshLambertMaterial({
          color: 0xdd8800,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        group.add(body);

        // Head with goggles
        const headGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const headMaterial = new THREE.MeshLambertMaterial({
          color: 0xffaa22,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.9;
        group.add(head);

        // Backpack with bombs
        const backpackGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.6);
        const backpackMaterial = new THREE.MeshLambertMaterial({
          color: 0x994400,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
        backpack.position.set(0, 1.0, -0.7);
        group.add(backpack);

        // Grenades on belt
        for (let i = 0; i < 3; i++) {
          const grenadeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
          const grenadeMaterial = new THREE.MeshLambertMaterial({
            color: 0x444444,
            transparent: true,
            opacity: enemy.spawning ? 0 : 1.0
          });
          const grenade = new THREE.Mesh(grenadeGeometry, grenadeMaterial);
          grenade.position.set(-0.4 + (i * 0.4), 0.5, 0.45);
          group.add(grenade);
        }
      }
      break;

    case 'fast_debuffer':
      // Fast Debuffer - Sleek, energy-based appearance
      {
        // Streamlined body
        const bodyGeometry = new THREE.ConeGeometry(0.4, 1.4, 6);
        const bodyMaterial = new THREE.MeshLambertMaterial({
          color: 0x00cc88,
          transparent: true,
          opacity: enemy.spawning ? 0 : 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.7;
        group.add(body);

        // Energy core (glowing sphere)
        const coreGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const coreMaterial = new THREE.MeshLambertMaterial({
          color: 0x00ffaa,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0,
          emissive: 0x004444 // Glowing effect
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 1.0;
        group.add(core);

        // Energy field rings
        for (let i = 0; i < 2; i++) {
          const ringGeometry = new THREE.TorusGeometry(0.6 + (i * 0.2), 0.05, 8, 16);
          const ringMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: enemy.spawning ? 0 : 0.3,
            emissive: 0x002222
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.position.y = 1.0 + (i * 0.1);
          ring.rotation.x = Math.PI / 2;
          group.add(ring);
        }
      }
      break;

    case 'boss':
      // Boss - Large, intimidating multi-part design
      {
        // Main body - imposing size
        const bodyGeometry = new THREE.BoxGeometry(2.0, 2.8, 1.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({
          color: 0xaa0066,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.4;
        group.add(body);

        // Boss head/crown
        const headGeometry = new THREE.ConeGeometry(0.8, 1.0, 8);
        const headMaterial = new THREE.MeshLambertMaterial({
          color: 0xff0088,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0,
          emissive: 0x330022
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.3;
        group.add(head);

        // Shoulder armor
        const shoulderGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
        const shoulderMaterial = new THREE.MeshLambertMaterial({
          color: 0x880044,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(-1.3, 2.2, 0);
        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.position.set(1.3, 2.2, 0);
        group.add(leftShoulder);
        group.add(rightShoulder);

        // Power core
        const coreGeometry = new THREE.SphereGeometry(0.4, 12, 12);
        const coreMaterial = new THREE.MeshLambertMaterial({
          color: 0xff4488,
          transparent: true,
          opacity: enemy.spawning ? 0 : 0.8,
          emissive: 0x440022
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 1.8;
        group.add(core);

        // Weapon systems
        const weaponGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const weaponMaterial = new THREE.MeshLambertMaterial({
          color: 0x333333,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const leftWeapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        leftWeapon.position.set(-1.5, 1.5, 0.7);
        leftWeapon.rotation.x = Math.PI / 6;
        const rightWeapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        rightWeapon.position.set(1.5, 1.5, 0.7);
        rightWeapon.rotation.x = Math.PI / 6;
        group.add(leftWeapon);
        group.add(rightWeapon);
      }
      break;

    default:
      // Fallback design
      {
        const bodyGeometry = new THREE.BoxGeometry(1.2, 2.0, 0.8);
        const bodyMaterial = new THREE.MeshLambertMaterial({
          color: 0xff0000,
          transparent: true,
          opacity: enemy.spawning ? 0 : 1.0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        group.add(body);
      }
  }

  return group;
}

// Enemy behavior animation system
function animateEnemyBehavior(mesh, enemy, time) {
  if (!mesh || !enemy) return;

  const deltaTime = time - (enemy.lastAnimationTime || 0);
  enemy.lastAnimationTime = time;

  switch (enemy.type) {
    case 'basic':
      // Basic enemies have subtle bobbing motion
      mesh.position.y = enemy.originalPosition.y + Math.sin(time * 0.001) * 0.1;
      break;

    case 'armored':
      // Armored enemies are heavier - slower, smaller movements
      mesh.position.y = enemy.originalPosition.y + Math.sin(time * 0.0005) * 0.05;
      break;

    case 'ninja':
      // Ninja has quick, stealthy movements and slight transparency flicker
      mesh.position.y = enemy.originalPosition.y + Math.sin(time * 0.003) * 0.15;
      mesh.position.x = enemy.originalPosition.x + Math.sin(time * 0.002) * 0.1;

      // Stealth flickering effect
      if (enemy.stealth) {
        const opacity = 0.6 + Math.sin(time * 0.005) * 0.2;
        mesh.traverse((child) => {
          if (child.material) {
            child.material.opacity = opacity;
          }
        });
      }
      break;

    case 'bomb_thrower':
      // Bomb throwers have steady, mechanical movement
      mesh.position.y = enemy.originalPosition.y + Math.sin(time * 0.0008) * 0.08;
      // Rotate slightly as if scanning for targets
      mesh.rotation.y = Math.sin(time * 0.001) * 0.2;
      break;

    case 'fast_debuffer':
      // Fast debuffer has rapid, erratic energy-based movement
      mesh.position.y = enemy.originalPosition.y + Math.sin(time * 0.006) * 0.2;
      mesh.position.x = enemy.originalPosition.x + Math.sin(time * 0.004) * 0.15;

      // Energy core pulsing effect
      mesh.traverse((child) => {
        if (child.material && child.material.emissive) {
          const intensity = 0.3 + Math.sin(time * 0.008) * 0.2;
          child.material.emissive.setScalar(intensity * 0.1);
        }
      });
      break;

    case 'boss':
      // Boss has imposing, slow movements with intimidating presence
      mesh.position.y = enemy.originalPosition.y + Math.sin(time * 0.0003) * 0.1;
      // Slow rotation to show dominance
      mesh.rotation.y = Math.sin(time * 0.0005) * 0.1;

      // Power core pulsing
      mesh.traverse((child) => {
        if (child.material && child.material.emissive) {
          const intensity = 0.5 + Math.sin(time * 0.002) * 0.3;
          child.material.emissive.setScalar(intensity * 0.1);
        }
      });
      break;

    default:
      // Default subtle animation
      mesh.position.y = enemy.originalPosition.y + Math.sin(time * 0.001) * 0.05;
  }
}

// Unified Room Manager - Single source of truth for enemy state
export function UnifiedRoomManager({ gameEngine, onRoomComplete, roomIndex = 0, levelNumber = 1, roomConfig, isPaused = false }) {
  const [enemies, setEnemies] = useState([]);
  const [roomState, setRoomState] = useState('spawning');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [bossIntroActive, setBossIntroActive] = useState(false);
  const [bossIntroData, setBossIntroData] = useState(null);
  const meshRefsRef = useRef(new Map()); // Track Three.js meshes for each enemy
  const aiTimerRef = useRef(null); // Timer for enemy AI updates
  const currentRoomRef = useRef({ roomIndex, levelNumber }); // Track current room
  const lastSpawnIdRef = useRef(null); // Track last spawn cycle to prevent duplicates
  const isSpawningRef = useRef(false); // Track if spawning is in progress
  const enemyShootTimesRef = useRef(new Map()); // Track real-time enemy shoot times
  const enemyCountRef = useRef(0); // Track enemy count with ref for reliable access
  const spawnLockRef = useRef(false); // Global spawn lock to prevent any duplicate spawning
  const currentSpawnIdRef = useRef(null); // Track current spawn ID to prevent duplicates
  const spawnTimeoutsRef = useRef([]); // Track spawn timeouts for cleanup
  const aiSystemRef = useRef(new EnemyAISystem()); // Enemy AI movement system
  const lastAIUpdateRef = useRef(0); // Track last AI update time
  const bossSpawnedRef = useRef(false); // Track if boss intro already shown
  
  // Spawn enemies with staggered timing and AI behavior
  const spawnEnemies = useCallback(() => {
    // IMMEDIATE FIRST CHECK: Block if enemies already exist
    if (enemies.length > 0) {
      return;
    }
    
    
    // STRONGER Protection checks with multiple fail-safes
    const globalSpawnKey = `spawn_lock_L${levelNumber}R${roomIndex}`;
    const globalSpawnInProgress = `spawning_L${levelNumber}R${roomIndex}`;

    if (window[globalSpawnKey] || window[globalSpawnInProgress] || spawnLockRef.current ||
        enemies.length > 0 || enemyCountRef.current > 0 || isSpawningRef.current) {
      return;
    }

    // Set MULTIPLE protection flags
    window[globalSpawnKey] = true;
    window[globalSpawnInProgress] = true;
    spawnLockRef.current = true;
    isSpawningRef.current = true;

    const roomId = Date.now();
    lastSpawnIdRef.current = roomId;
    currentSpawnIdRef.current = roomId; // Track current spawn ID

    // Clear any existing spawn timeouts
    spawnTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    spawnTimeoutsRef.current = [];

    // Initialize cover points for AI system
    if (aiSystemRef.current && aiSystemRef.current.initializeCoverPoints) {
      aiSystemRef.current.initializeCoverPoints({
        minX: -20,
        maxX: 20,
        minZ: -30,
        maxZ: 30
      });
    }
    
    // Generate enemy templates from room configuration
    const enemyTemplates = [];
    
    if (roomConfig && roomConfig.enemyLayout) {
      
      roomConfig.enemyLayout.forEach((enemyConfig, index) => {
        // Calculate spawn delay with initial breathing room
        // Improved timing for tactical gameplay instead of chaotic
        const initialDelay = 3000; // 3 second breathing room before first enemy (was 2s)
        const staggerDelay = 3000; // 3 seconds between each enemy (was 2s)
        const baseSpawnDelay = initialDelay + (index * staggerDelay);

        // Boss enemies get longer delay for dramatic entrance
        const bossDelayBonus = (enemyConfig.type === 'boss' || enemyConfig.isBoss) ? 2000 : 0;
        const spawnDelay = baseSpawnDelay + bossDelayBonus;

        // Get stats for this enemy type from the enhanced EnemyStats
        const statsKey = enemyConfig.type === 'basic' ? 'basic_shooter' : enemyConfig.type;
        const enemyStats = EnemyStats[statsKey] || EnemyStats.basic_shooter;

        // Calculate shoot interval based on enemy fire rate (lower = faster)
        const dynamicShootInterval = Math.max(1000, Math.round(enemyStats.fireRate * 1000));

        const enemy = {
          id: `enemy_${roomId}_${index + 1}`,
          health: enemyConfig.health || enemyStats.health,
          maxHealth: enemyConfig.health || enemyStats.health,
          position: { ...enemyConfig.position },
          type: enemyConfig.type,
          spawnDelay: spawnDelay,
          shootInterval: enemyConfig.shootInterval || dynamicShootInterval,
          lastShotTime: 0,
          damage: enemyStats.damage,
          speed: enemyStats.speed,
          accuracy: enemyStats.accuracy,
          points: enemyStats.points,
          // Special properties
          armor: enemyStats.armor || 0,
          stealth: enemyStats.stealth || false,
          areaEffect: enemyStats.areaEffect || false,
          debuffType: enemyStats.debuffType || null,
          multiPhase: enemyStats.multiPhase || false,
          isBoss: enemyConfig.isBoss || (enemyConfig.type === 'boss'),
          // Behavior state
          behaviorState: 'idle',
          lastBehaviorChange: 0,
          movementOffset: Math.random() * Math.PI * 2, // For varied movement patterns
        };
        
        enemyTemplates.push(enemy);
      });
    } else {
      // Fallback to basic enemies if no configuration provided
      // Enemies moved further back (z: -25 to -35) to give player time to deflect bullets
      enemyTemplates.push(
        {
          id: `enemy_${roomId}_1`,
          health: 50,
          maxHealth: 50,
          position: { x: -3, y: 0, z: -28 }, // Further back for bullet deflection gameplay
          type: 'basic',
          spawnDelay: 0,
          shootInterval: 3000,
          lastShotTime: 0,
          damage: 15
        },
        {
          id: `enemy_${roomId}_2`,
          health: 50,
          maxHealth: 50,
          position: { x: 3, y: 0, z: -28 }, // Further back for bullet deflection gameplay
          type: 'basic',
          spawnDelay: 1500,
          shootInterval: 2500,
          lastShotTime: 0,
          damage: 15
        },
        {
          id: `enemy_${roomId}_3`,
          health: 75,
          maxHealth: 75,
          position: { x: 0, y: 1.5, z: -32 }, // Further back and higher
          type: 'armored',
          spawnDelay: 3000,
          shootInterval: 4000,
          lastShotTime: 0,
          damage: 25
        }
      );
    }
    
    setRoomState('spawning');

    // Check for boss enemies and trigger intro sequence
    const bossEnemy = enemyTemplates.find(e => e.isBoss || e.type === 'boss');
    const hasBossInRoom = bossEnemy !== undefined;

    if (hasBossInRoom && !bossSpawnedRef.current) {
      // Mark boss as seen to prevent duplicate intros
      bossSpawnedRef.current = true;

      // Prepare boss data for intro sequence
      const bossData = {
        name: getBossName(levelNumber, roomIndex),
        category: 'BOSS ENCOUNTER',
        subtitle: getBossSubtitle(levelNumber, roomIndex),
        health: bossEnemy.health,
        maxHealth: bossEnemy.maxHealth || bossEnemy.health,
        position: bossEnemy.position
      };

      // Trigger boss intro sequence
      setBossIntroData(bossData);
      setBossIntroActive(true);

      // Delay enemy spawning until boss intro completes (5 seconds total)
      setTimeout(() => {
        setBossIntroActive(false);
        startEnemySpawning();
      }, 5000);
    } else {
      // No boss, start spawning immediately
      startEnemySpawning();
    }

    function startEnemySpawning() {
      // Immediate fix: Set room to active quickly so enemies can shoot
      setTimeout(() => {
        setRoomState('active');
      }, 500); // Set active after 500ms

      // Failsafe: Ensure room becomes active after all spawning delays complete
      const maxSpawnDelay = Math.max(...enemyTemplates.map(e => e.spawnDelay));
      setTimeout(() => {
        // Failsafe: ensure room becomes active after spawn delays
        setRoomState('active');
        // Mark spawning as complete and clear ALL locks
        isSpawningRef.current = false;
        spawnLockRef.current = false;
        window[globalSpawnKey] = false;
        window[globalSpawnInProgress] = false;
      }, maxSpawnDelay + 2000); // Add 2 seconds buffer after longest spawn delay

      spawnEnemiesNow();
    }

    function spawnEnemiesNow() {
    
    // Spawn enemies one by one with delays - use more reliable timing approach
    enemyTemplates.forEach((enemyTemplate, index) => {
      const spawnTimeout = setTimeout(() => {
        // Additional check: ensure we're still in the same spawn cycle
        if (currentSpawnIdRef.current !== roomId) {
          return;
        }

        setEnemies(currentEnemies => {
          // Check if this enemy already exists or if we have too many enemies
          const existingEnemy = currentEnemies.find(e => e.id === enemyTemplate.id);
          if (existingEnemy) {
            return currentEnemies;
          }

          // Remove any duplicate enemies with same position (safety check)
          const positionKey = `${enemyTemplate.position.x}_${enemyTemplate.position.y}_${enemyTemplate.position.z}`;
          const enemyAtPosition = currentEnemies.find(e => {
            const eKey = `${e.position.x}_${e.position.y}_${e.position.z}`;
            return eKey === positionKey;
          });

          if (enemyAtPosition) {
            return currentEnemies;
          }

          // Safety check: prevent spawning too many enemies (max 10 per room)
          if (currentEnemies.length >= 10) {
            return currentEnemies;
          }
          
          // Add enemy with spawning animation state
          const currentTime = Date.now();
          const newEnemy = {
            ...enemyTemplate,
            spawning: true, // Flag for spawn animation
            spawnTime: currentTime,
            // Add LONG delay before enemy can shoot (5-7 seconds after spawn for story dialogue)
            lastShotTime: currentTime + (5000 + Math.random() * 2000), // 5-7 second delay
            spawnCycleId: roomId // Track which spawn cycle this enemy belongs to
          };
          
          const updatedEnemies = [...currentEnemies, newEnemy];
          // Update enemy count ref immediately
          enemyCountRef.current = updatedEnemies.length;

          // Create spawn warning flash at enemy position (500ms before full spawn)
          if (gameEngine && gameEngine.getScene) {
            const scene = gameEngine.getScene();
            const warningGeometry = new THREE.RingGeometry(0.5, 1.5, 32);
            const warningMaterial = new THREE.MeshBasicMaterial({
              color: 0xff0000,
              transparent: true,
              opacity: 0.8,
              side: THREE.DoubleSide
            });
            const warningRing = new THREE.Mesh(warningGeometry, warningMaterial);
            warningRing.position.set(
              newEnemy.position.x,
              0.1, // Just above ground
              newEnemy.position.z
            );
            warningRing.rotation.x = -Math.PI / 2; // Lay flat on ground
            scene.add(warningRing);

            // Animate warning ring (pulse effect)
            let pulseTime = 0;
            const pulseInterval = setInterval(() => {
              pulseTime += 50;
              const scale = 1 + Math.sin(pulseTime * 0.01) * 0.3;
              warningRing.scale.set(scale, scale, 1);
              warningMaterial.opacity = 0.8 - (pulseTime / 500) * 0.3;

              if (pulseTime >= 500) {
                clearInterval(pulseInterval);
                scene.remove(warningRing);
              }
            }, 50);
          }

          // Fade in enemy over 500ms (smoother spawn animation)
          setTimeout(() => {
            setEnemies(currentEnemies =>
              currentEnemies.map(e =>
                e.id === newEnemy.id ? { ...e, spawning: false } : e
              )
            );
          }, 500); // Changed from 100ms to 500ms for smoother fade

          // Additional fallback in case first one fails
          setTimeout(() => {
            setEnemies(currentEnemies =>
              currentEnemies.map(e =>
                e.id === newEnemy.id ? { ...e, spawning: false } : e
              )
            );
          }, 1000);
          
          // Set room to active when first enemy spawns
          if (updatedEnemies.length === 1) {
            setRoomState('active');
          } else {
          }
          
          return updatedEnemies;
        });
      }, enemyTemplate.spawnDelay);

      // Track timeout for cleanup
      spawnTimeoutsRef.current.push(spawnTimeout);
    });
    } // End spawnEnemiesNow
  }, []); // Remove enemies dependency to prevent re-spawning when enemies change
  
  // Handle room transitions and spawning - consolidated logic
  useEffect(() => {
    const hasRoomChanged = currentRoomRef.current.roomIndex !== roomIndex || 
                          currentRoomRef.current.levelNumber !== levelNumber;
    
    
    if (hasRoomChanged && hasInitialized) {
      
      // Special handling for level restart (when room index goes backwards)
      const isLevelRestart = roomIndex < currentRoomRef.current.roomIndex;
      if (isLevelRestart) {

        // Force complete reset of all state
        setHasInitialized(false); // Force re-initialization
        setRoomState('spawning');
        setEnemies([]);
        enemyCountRef.current = 0;
        isSpawningRef.current = false;
        spawnLockRef.current = false;
        bossSpawnedRef.current = false; // Reset boss intro flag
        lastSpawnIdRef.current = null;
        enemyShootTimesRef.current.clear();
        // Clear spawn timeouts for level restart
        spawnTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        spawnTimeoutsRef.current = [];
        // Clear ALL possible nuclear window flags for this level
        for (let r = 0; r < 10; r++) {
          delete window[`spawn_lock_L${levelNumber}R${r}`];
        }
        
        // Clear all meshes aggressively
        if (gameEngine && gameEngine.getScene) {
          const scene = gameEngine.getScene();
          meshRefsRef.current.forEach((meshData, enemyId) => {
            scene.remove(meshData.enemyMesh);
            scene.remove(meshData.healthBarGroup);
          });
        }
        meshRefsRef.current.clear();
        
        // Update room tracking
        currentRoomRef.current = { roomIndex, levelNumber };
        
        // Instead of relying on useEffect, directly trigger spawning after cleanup
        setTimeout(() => {
          spawnEnemies();
        }, 100);
        
        return; // Exit early
      }
      
      // Normal room transition (not restart)
      // Clear current room
      setEnemies([]);
      enemyCountRef.current = 0; // Reset enemy count ref
      setRoomState('spawning');
      // Reset spawning flag for new room
      isSpawningRef.current = false;
      spawnLockRef.current = false; // Reset global spawn lock
      bossSpawnedRef.current = false; // Reset boss intro flag for new room
      // Clear nuclear window flag for new room
      const oldGlobalSpawnKey = `spawn_lock_L${currentRoomRef.current.levelNumber}R${currentRoomRef.current.roomIndex}`;
      delete window[oldGlobalSpawnKey];
      // Clear enemy shoot times for new room
      enemyShootTimesRef.current.clear();
      // Clear spawn timeouts for new room
      spawnTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      spawnTimeoutsRef.current = [];
      
      // Clear existing meshes
      meshRefsRef.current.forEach((meshData, enemyId) => {
        if (gameEngine && gameEngine.getScene) {
          const scene = gameEngine.getScene();
          scene.remove(meshData.enemyMesh);
          scene.remove(meshData.healthBarGroup);
        }
      });
      meshRefsRef.current.clear();
      
      // Update current room tracking
      currentRoomRef.current = { roomIndex, levelNumber };
      
      // Trigger spawning directly - no more dual triggers
      setTimeout(() => {
        spawnEnemies();
      }, 100);
    } else if (!hasInitialized) {
      // First initialization - update room tracking without spawning here
      currentRoomRef.current = { roomIndex, levelNumber };
    }
  }, [roomIndex, levelNumber, hasInitialized, gameEngine]); // Remove spawnEnemies to prevent re-spawning
  
  // Handle enemy damage - ONLY method that modifies enemy health
  const damageEnemy = useCallback((enemyId, damage) => {
    let enemyDied = false;
    let enemyPosition = null;
    let enemyType = null;
    let pointsToAward = 0;
    let currencyToAward = 0;

    setEnemies(currentEnemies => {
      const updatedEnemies = currentEnemies.map(enemy => {
        if (enemy.id === enemyId && enemy.health > 0) {
          const newHealth = Math.max(0, enemy.health - damage);

          // Notify AI system about damage (for cover seeking)
          if (aiSystemRef.current && newHealth > 0) {
            aiSystemRef.current.notifyEnemyDamaged(enemyId);
          }

          if (newHealth === 0 && enemy.health > 0) {
            enemyDied = true;
            enemyPosition = { ...enemy.position };
            enemyType = enemy.type;
            pointsToAward = getPointsForEnemyType(enemy.type);
            currencyToAward = getCurrencyForEnemyType(enemy.type);

            // Drop items on death
            spawnEnemyDrops(enemy);
          }

          return {
            ...enemy,
            health: newHealth,
            isAlive: newHealth > 0
          };
        }
        return enemy;
      });

      const aliveEnemies = updatedEnemies.filter(enemy => enemy.health > 0);
      return updatedEnemies;
    });

    // Award points and currency AFTER state update completes to avoid infinite loop
    if (enemyDied && pointsToAward > 0 && window.gameContext?.addScore) {
      setTimeout(() => {
        window.gameContext.addScore(pointsToAward);
      }, 0);
    }

    // Award currency for killing enemy
    if (enemyDied && currencyToAward > 0) {
      setTimeout(() => {
        const upgradeSystem = getWeaponUpgradeSystem();
        upgradeSystem.addCurrency(currencyToAward);
      }, 0);
    }

    return enemyDied;
  }, []);

  // Spawn item drops when enemy dies
  const spawnEnemyDrops = useCallback((enemy) => {
    if (!gameEngine || !gameEngine.getScene) return;

    const scene = gameEngine.getScene();
    const dropChance = Math.random();

    // Different drop rates based on enemy type
    let itemDropped = null;

    switch (enemy.type) {
      case 'basic':
      case 'basic_shooter':
        // 15% chance to drop health or coins (reduced from 50%)
        if (dropChance < 0.08) {
          itemDropped = createDroppedItem('health', 'small', enemy.position, 25);
        } else if (dropChance < 0.15) {
          itemDropped = createDroppedItem('coin', null, enemy.position, 3);
        }
        break;

      case 'armored':
        // 30% chance for ammo or health (reduced from 70%)
        if (dropChance < 0.15) {
          itemDropped = createDroppedItem('ammo', 'shotgun', enemy.position, 5);
        } else if (dropChance < 0.3) {
          itemDropped = createDroppedItem('health', 'small', enemy.position, 25);
        }
        break;

      case 'ninja':
        // 20% chance for drops (reduced from 60%)
        if (dropChance < 0.1) {
          itemDropped = createDroppedItem('powerup', 'speed', enemy.position, 1);
        } else if (dropChance < 0.2) {
          itemDropped = createDroppedItem('coin', null, enemy.position, 5);
        }
        break;

      case 'bomb_thrower':
        // 40% chance to drop bomb ammo (reduced from 80%)
        if (dropChance < 0.4) {
          itemDropped = createDroppedItem('ammo', 'bomb', enemy.position, 2);
        }
        break;

      case 'fast_debuffer':
        // 25% chance for powerups (reduced from 50%)
        if (dropChance < 0.25) {
          const powerups = ['speed', 'accuracy', 'damage'];
          const randomPowerup = powerups[Math.floor(Math.random() * powerups.length)];
          itemDropped = createDroppedItem('powerup', randomPowerup, enemy.position, 1);
        }
        break;

      case 'boss':
        // Bosses always drop large health and upgrade
        createDroppedItem('health', 'large', { x: enemy.position.x - 2, y: enemy.position.y, z: enemy.position.z }, 50);
        createDroppedItem('upgrade', 'enhanced_grip', { x: enemy.position.x + 2, y: enemy.position.y, z: enemy.position.z }, 1);
        createDroppedItem('coin', null, { x: enemy.position.x, y: enemy.position.y + 1, z: enemy.position.z }, 10);
        break;
    }

    // Helper function to create dropped item mesh
    function createDroppedItem(type, subType, position, value) {
      let geometry, material;

      switch (type) {
        case 'health':
          if (subType === 'large') {
            geometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
            material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
          } else {
            geometry = new THREE.SphereGeometry(0.3, 8, 6);
            material = new THREE.MeshLambertMaterial({ color: 0x44ff44 });
          }
          break;

        case 'ammo':
          geometry = new THREE.BoxGeometry(0.4, 0.2, 0.6);
          if (subType === 'shotgun') {
            material = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
          } else if (subType === 'bomb') {
            material = new THREE.MeshLambertMaterial({ color: 0x884444 });
          } else {
            material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
          }
          break;

        case 'powerup':
          geometry = new THREE.OctahedronGeometry(0.4, 0);
          if (subType === 'speed') {
            material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
          } else if (subType === 'damage') {
            material = new THREE.MeshLambertMaterial({ color: 0xff0044 });
          } else if (subType === 'accuracy') {
            material = new THREE.MeshLambertMaterial({ color: 0x4400ff });
          } else {
            material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
          }
          break;

        case 'coin':
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
          material = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
          break;

        case 'upgrade':
          geometry = new THREE.TetrahedronGeometry(0.5);
          material = new THREE.MeshLambertMaterial({ color: 0xff44ff });
          break;

        default:
          geometry = new THREE.SphereGeometry(0.3, 8, 6);
          material = new THREE.MeshLambertMaterial({ color: 0xffffff });
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position.x, position.y + 0.5, position.z);
      mesh.userData = {
        isItem: true,
        itemType: type,
        itemSubType: subType,
        itemValue: value,
        spawnTime: Date.now()
      };

      // Add glow effect
      const glowGeometry = geometry.clone();
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: material.color,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.scale.setScalar(1.2);
      mesh.add(glow);

      scene.add(mesh);

      // Animate item appearance
      mesh.scale.set(0.1, 0.1, 0.1);
      const animateSpawn = () => {
        if (mesh.scale.x < 1) {
          mesh.scale.addScalar(0.05);
          requestAnimationFrame(animateSpawn);
        }
      };
      animateSpawn();

      // Store reference for cleanup
      if (!window.droppedItems) {
        window.droppedItems = [];
      }
      window.droppedItems.push(mesh);
      return mesh;
    }
  }, [gameEngine]);

  // Enemy AI system - handles shooting at player and movement
  const updateEnemyAI = useCallback(() => {
    const currentTime = Date.now();

    // Update AI movement system (runs every frame for smooth movement)
    const deltaTime = currentTime - lastAIUpdateRef.current;
    if (lastAIUpdateRef.current > 0 && deltaTime > 0) {
      // Get player position (camera position approximation)
      const playerPos = { x: 0, y: 0, z: 0 }; // Default, can be updated with actual player position

      // Update enemy AI movement
      aiSystemRef.current.updateEnemyAI(enemies, deltaTime, playerPos);
    }
    lastAIUpdateRef.current = currentTime;

    setEnemies(currentEnemies => {
      // Remove duplicate enemies by ID (safety check)
      const uniqueEnemies = currentEnemies.reduce((acc, enemy) => {
        const existing = acc.find(e => e.id === enemy.id);
        if (!existing) {
          acc.push(enemy);
        } else {
          // Log duplicate found and keep the one with more recent data
        }
        return acc;
      }, []);

      // If we had duplicates, use the clean array and update enemy count
      const cleanEnemies = uniqueEnemies.length !== currentEnemies.length ? uniqueEnemies : currentEnemies;

      // Update enemy count ref immediately if we cleaned duplicates
      if (uniqueEnemies.length !== currentEnemies.length) {
        enemyCountRef.current = uniqueEnemies.length;
      }

      const aliveEnemies = cleanEnemies.filter(e => e.health > 0);
      const activeEnemies = aliveEnemies.filter(e => !e.spawning && roomState === 'active');

      return cleanEnemies.map(enemy => {
        // Only active, non-spawning, alive enemies can shoot
        if (enemy.health <= 0 || enemy.spawning || roomState !== 'active') {
          return enemy;
        }

        // Fix negative timer issue: Use consistent time tracking
        const realLastShotTime = enemyShootTimesRef.current.get(enemy.id) || enemy.lastShotTime || 0;
        const timeSinceLastShot = currentTime - realLastShotTime;
        const minimumInterval = Math.max(1000, enemy.shootInterval || 2000); // At least 1 second, default 2 seconds

        // Send warning 1.5 seconds before shooting
        const warningTime = 1500; // 1.5 seconds warning
        const shouldWarn = timeSinceLastShot >= (minimumInterval - warningTime) &&
                          timeSinceLastShot < minimumInterval &&
                          !enemy.warningShown;

        if (shouldWarn && gameEngine && gameEngine.getCamera) {
          // Project enemy position to screen coordinates for warning indicator
          const vector = new THREE.Vector3(enemy.position.x, enemy.position.y, enemy.position.z);
          const camera = gameEngine.getCamera();
          vector.project(camera);

          const canvas = document.querySelector('canvas');
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const screenX = ((vector.x + 1) / 2) * rect.width + rect.left;
            const screenY = ((-vector.y + 1) / 2) * rect.height + rect.top;

            // Dispatch warning event (deferred to avoid setState during render)
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('enemyAboutToShoot', {
                detail: {
                  enemyId: enemy.id,
                  position: { x: screenX, y: screenY },
                  timeUntilShot: minimumInterval - timeSinceLastShot
                }
              }));
            }, 0);

            // Mark warning as shown
            return {
              ...enemy,
              warningShown: true
            };
          }
        }

        // Only shoot if enough time has passed AND we haven't shot recently
        if (timeSinceLastShot >= minimumInterval && timeSinceLastShot >= 0) {
          // Immediately update both ref and return updated enemy state
          enemyShootTimesRef.current.set(enemy.id, currentTime);

          // Fire projectile at player instead of instant damage
          if (window.projectileSystem && window.projectileSystem.fireProjectile) {
            // Create simplified enemy object for projectile system
            const enemyForProjectile = {
              type: enemy.type,
              stats: {
                damage: enemy.damage
              }
            };

            const enemyPosition = new THREE.Vector3(enemy.position.x, enemy.position.y, enemy.position.z);
            window.projectileSystem.fireProjectile(enemyForProjectile, enemy.damage, enemyPosition);
          } else if (window.gameContext?.damagePlayer) {
            // Fallback to direct damage if projectile system not available
            window.gameContext.damagePlayer(enemy.damage);
          }

          // Add visual shooting effect
          const meshData = meshRefsRef.current.get(enemy.id);
          if (meshData?.enemyMesh) {
            // Flash enemy yellow when shooting
            const originalColors = new Map();

            // Store original colors and flash yellow
            meshData.enemyMesh.traverse((child) => {
              if (child.material && child.material.color) {
                originalColors.set(child, child.material.color.getHex());
                child.material.color.setHex(0xffff00); // Flash yellow
              }
            });

            setTimeout(() => {
              // Restore original colors
              meshData.enemyMesh.traverse((child) => {
                if (child.material && originalColors.has(child)) {
                  child.material.color.setHex(originalColors.get(child));
                }
              });
            }, 200);
          }

          // Create muzzle flash effect
          createMuzzleFlash(enemy);

          // Update enemy's last shot time for next shot

          return {
            ...enemy,
            lastShotTime: currentTime, // Sync both tracking methods
            warningShown: false // Reset warning flag for next shot
          };
        }

        // Animate enemy behavior regardless of shooting
        const meshData = meshRefsRef.current.get(enemy.id);
        if (meshData?.enemyMesh && enemy.originalPosition) {
          animateEnemyBehavior(meshData.enemyMesh, enemy, currentTime);
        }

        return enemy;
      });
    });
  }, [roomState]);
  
  // Manage AI timer - restart when updateEnemyAI changes due to roomState updates
  useEffect(() => {
    // Clear existing timer
    if (aiTimerRef.current) {
      clearInterval(aiTimerRef.current);
      aiTimerRef.current = null;
    }

    // Only start timer if we have enemies, component hasn't unmounted, and game is not paused
    if (enemies.length > 0 && !isPaused) {
      aiTimerRef.current = setInterval(updateEnemyAI, 100);
    }

    return () => {
      if (aiTimerRef.current) {
        clearInterval(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, [updateEnemyAI, enemies.length, roomState, isPaused]);
  
  // Create visual muzzle flash effect
  const createMuzzleFlash = useCallback((enemy) => {
    if (!gameEngine?.getScene) return;
    
    const scene = gameEngine.getScene();
    
    // Create simple muzzle flash
    const flashGeometry = new THREE.SphereGeometry(0.3);
    const flashMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      transparent: true,
      opacity: 0.8
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    
    // Position flash at enemy position (slightly forward)
    flash.position.set(
      enemy.position.x, 
      enemy.position.y, 
      enemy.position.z + 0.5
    );
    
    scene.add(flash);
    
    // Animate flash
    let opacity = 0.8;
    const fadeFlash = () => {
      opacity -= 0.05;
      if (opacity > 0) {
        flashMaterial.opacity = opacity;
        flash.scale.multiplyScalar(1.1);
        requestAnimationFrame(fadeFlash);
      } else {
        scene.remove(flash);
        flashGeometry.dispose();
        flashMaterial.dispose();
      }
    };
    
    requestAnimationFrame(fadeFlash);
  }, [gameEngine]);
  
  // Create Three.js mesh for enemy with spawn animation
  const createEnemyMesh = useCallback((enemy) => {
    if (!gameEngine || !gameEngine.getScene) {
      console.error('Cannot create enemy mesh: gameEngine or scene not available');
      return null;
    }
    
    
    // Create enemy mesh with enhanced type-specific appearance
    const mesh = createEnhancedEnemyMesh(enemy);
    
    // Set position
    mesh.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { enemyId: enemy.id };

    // Store original position for animations
    enemy.originalPosition = {
      x: enemy.position.x,
      y: enemy.position.y,
      z: enemy.position.z
    };
    
    // Apply spawn animation if enemy is spawning
    if (enemy.spawning) {
      // Start small and invisible
      mesh.scale.set(0.1, 0.1, 0.1);

      // Set opacity to 0 for all materials in the group
      mesh.traverse((child) => {
        if (child.material) {
          child.material.opacity = 0;
        }
      });
      
      // Animate spawn
      const startTime = Date.now();
      const animateDuration = 800; // 0.8 second spawn animation
      
      const animateSpawn = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animateDuration, 1);
        
        // Smooth easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // Scale animation (pop in)
        const scale = 0.1 + (0.9 * easeOut);
        mesh.scale.set(scale, scale, scale);
        
        // Fade in
        mesh.traverse((child) => {
          if (child.material) {
            child.material.opacity = easeOut;
          }
        });
        
        // Bounce effect at the end
        if (progress > 0.8) {
          const bounceProgress = (progress - 0.8) / 0.2;
          const bounce = 1 + Math.sin(bounceProgress * Math.PI * 2) * 0.1;
          mesh.scale.setY(scale * bounce);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateSpawn);
        } else {
          // Animation complete
          mesh.scale.set(1, 1, 1);
          mesh.traverse((child) => {
            if (child.material) {
              child.material.opacity = 1;
              child.material.transparent = false;
            }
          });
          
          // Remove spawning flag
          setEnemies(currentEnemies => 
            currentEnemies.map(e => 
              e.id === enemy.id ? { ...e, spawning: false } : e
            )
          );
        }
      };
      
      // Start animation on next frame
      requestAnimationFrame(animateSpawn);
    }
    
    
    // Create health bar group
    const healthBarGroup = new THREE.Group();
    
    // Health bar background - make more visible
    const bgGeometry = new THREE.PlaneGeometry(2.0, 0.3);
    const bgMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      transparent: true, 
      opacity: 0.9
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    background.position.set(0, 0, 0.01);
    healthBarGroup.add(background);
    
    // Health bar foreground - bright green
    const fgGeometry = new THREE.PlaneGeometry(2.0, 0.25);
    const fgMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 1.0
    });
    const foreground = new THREE.Mesh(fgGeometry, fgMaterial);
    foreground.position.set(0, 0, 0.02);
    healthBarGroup.add(foreground);
    
    // Position health bar above enemy
    healthBarGroup.position.set(enemy.position.x, enemy.position.y + 1.5, enemy.position.z);

    // Add all objects to scene
    const scene = gameEngine.getScene();
    scene.add(mesh);
    scene.add(healthBarGroup);
    
    // Store mesh references
    const meshData = {
      enemyMesh: mesh,
      healthBarGroup: healthBarGroup,
      healthBarForeground: foreground
    };
    
    meshRefsRef.current.set(enemy.id, meshData);

    return meshData;
  }, [gameEngine]);
  
  // Update enemy visuals
  const updateEnemyVisuals = useCallback((enemy) => {
    const meshData = meshRefsRef.current.get(enemy.id);
    if (!meshData) return;
    
    const healthPercent = Math.max(0, enemy.health / enemy.maxHealth);
    
    // Update health bar
    meshData.healthBarForeground.scale.x = healthPercent;
    meshData.healthBarForeground.position.x = -(1.0 * (1 - healthPercent)) / 2;
    
    // Update health bar color
    if (healthPercent > 0.6) {
      meshData.healthBarForeground.material.color.setHex(0x00ff00); // Green
    } else if (healthPercent > 0.3) {
      meshData.healthBarForeground.material.color.setHex(0xffff00); // Yellow
    } else {
      meshData.healthBarForeground.material.color.setHex(0xff0000); // Red
    }
    
    // Update enemy color based on health
    const enemyColor = healthPercent > 0.5 ?
      (enemy.type === 'armored' ? 0x444444 : 0xff4444) :
      0xff8844; // Orange when damaged

    // Update colors for all materials in the group
    meshData.enemyMesh.traverse((child) => {
      if (child.material && child.material.color) {
        child.material.color.setHex(enemyColor);
      }
    });
    
  }, []);
  
  // Remove enemy mesh from scene
  const removeEnemyMesh = useCallback((enemyId) => {
    const meshData = meshRefsRef.current.get(enemyId);
    if (meshData && gameEngine && gameEngine.getScene) {
      const scene = gameEngine.getScene();
      scene.remove(meshData.enemyMesh);
      scene.remove(meshData.healthBarGroup);
      meshRefsRef.current.delete(enemyId);
    }
  }, [gameEngine]);
  
  // Handle enemy spawning and updates
  useEffect(() => {
    enemies.forEach(enemy => {
      const hasMesh = meshRefsRef.current.has(enemy.id);

      if (enemy.health > 0 && !hasMesh) {
        // Create mesh for new enemy
        createEnemyMesh(enemy);
      } else if (enemy.health > 0 && hasMesh) {
        // Update existing enemy visuals
        updateEnemyVisuals(enemy);

        // Sync mesh position with AI-controlled enemy position
        const meshData = meshRefsRef.current.get(enemy.id);
        if (meshData && meshData.enemyMesh) {
          meshData.enemyMesh.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
          meshData.healthBarGroup.position.set(enemy.position.x, enemy.position.y + 1.5, enemy.position.z);
        }
      } else if (enemy.health <= 0 && hasMesh) {
        // Remove dead enemy mesh immediately with visual effect
        // Clean up enemy shoot time tracking
        enemyShootTimesRef.current.delete(enemy.id);
        const meshData = meshRefsRef.current.get(enemy.id);
        if (meshData) {
          // Immediate visual feedback - make mesh fade/disappear
          meshData.enemyMesh.visible = false;
          meshData.healthBarGroup.visible = false;
          
          // Remove from scene after short delay
          setTimeout(() => removeEnemyMesh(enemy.id), 300);
        }
      }
    });
  }, [enemies, createEnemyMesh, updateEnemyVisuals, removeEnemyMesh]);
  
  // Check room completion and trigger auto-scroll
  useEffect(() => {
    // Skip completion check if room is already cleared or not active
    if (roomState === 'cleared' || roomState === 'complete') {
      return;
    }

    // Clean duplicate enemies before checking completion (same logic as AI system)
    const uniqueEnemies = enemies.reduce((acc, enemy) => {
      const existing = acc.find(e => e.id === enemy.id);
      if (!existing) {
        acc.push(enemy);
      }
      return acc;
    }, []);

    // Update enemy count ref if we found duplicates
    if (uniqueEnemies.length !== enemies.length) {
      enemyCountRef.current = uniqueEnemies.length;
    }

    const cleanEnemies = uniqueEnemies;
    const aliveEnemies = cleanEnemies.filter(e => e.health > 0);

    // Define expected total enemies for this room from configuration
    // Use enemyLayout length if available, otherwise fall back to enemyCount, then default to 3
    const expectedEnemyCount = roomConfig && roomConfig.enemyLayout
      ? roomConfig.enemyLayout.length
      : (roomConfig && roomConfig.enemyCount ? roomConfig.enemyCount : 3);

    // Room is only complete when:
    // 1. All expected enemies have been spawned (cleanEnemies.length >= expectedEnemyCount)
    // 2. All spawned enemies are dead (aliveEnemies.length === 0)
    // 3. Room is in active state
    const allEnemiesSpawned = cleanEnemies.length >= expectedEnemyCount;
    const allEnemiesDefeated = aliveEnemies.length === 0;
    const roomIsActive = roomState === 'active';

    // Only log completion checks when close to completing
    if (roomIsActive && aliveEnemies.length <= 1) {
    }

    if (allEnemiesSpawned && allEnemiesDefeated && roomIsActive) {
      setRoomState('cleared');

      // Enable movement immediately since room is cleared
      const gameEngine = window.gameEngine || window.engineRef?.current;
      if (gameEngine) {
        if (gameEngine.resumeMovement) {
          gameEngine.resumeMovement();
        }
        if (gameEngine.isMoving !== undefined) {
          gameEngine.isMoving = true;
        }
      }

      // Brief delay before triggering room completion for visual feedback
      setTimeout(() => {
        if (onRoomComplete) {
          onRoomComplete('cleared');
        }

        // Also trigger any global room completion handlers
        if (window.levelManager && window.levelManager.handleRoomCleared) {
          window.levelManager.handleRoomCleared();
        }
      }, 1500);
    }
  }, [enemies, roomState, onRoomComplete, roomConfig]);
  
  // Initialize room and start AI system - only once per component instance
  useEffect(() => {
    
    if (gameEngine && !hasInitialized) {
      
      // Clear any existing enemies first
      setEnemies([]);
      enemyCountRef.current = 0; // Reset enemy count ref
      
      // Clear existing meshes
      meshRefsRef.current.forEach((meshData, enemyId) => {
        if (gameEngine.getScene) {
          const scene = gameEngine.getScene();
          scene.remove(meshData.enemyMesh);
          scene.remove(meshData.healthBarGroup);
        }
      });
      meshRefsRef.current.clear();
      
      // Mark as initialized FIRST to prevent re-running
      setHasInitialized(true);
      
      // Reset spawning flag to ensure clean initialization
      isSpawningRef.current = false;
      spawnLockRef.current = false; // Reset global spawn lock
      // Clear ALL possible nuclear window flags for clean initialization
      for (let l = 0; l < 20; l++) {
        for (let r = 0; r < 10; r++) {
          delete window[`spawn_lock_L${l}R${r}`];
        }
      }
      // Clear enemy shoot times for clean initialization
      enemyShootTimesRef.current.clear();
      
      // Spawn enemies directly for initialization - no more shouldSpawn trigger
      setTimeout(() => {
        spawnEnemies();
      }, 100);
      
      // AI timer is now managed by useEffect that responds to roomState changes
      
      // Debug scene contents after spawning - removed excessive logging
    }
  }, [gameEngine]); // Only depend on gameEngine to prevent re-spawning
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      
      // Clear AI timer
      if (aiTimerRef.current) {
        clearInterval(aiTimerRef.current);
        aiTimerRef.current = null;
      }

      // Clear all spawn timeouts
      spawnTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      spawnTimeoutsRef.current = [];
      
      // Remove all enemy meshes when component unmounts
      meshRefsRef.current.forEach((meshData, enemyId) => {
        if (gameEngine && gameEngine.getScene) {
          const scene = gameEngine.getScene();
          scene.remove(meshData.enemyMesh);
          scene.remove(meshData.healthBarGroup);
        }
      });
      meshRefsRef.current.clear();
      
    };
  }, [gameEngine]);
  
  // Expose enemy data and damage function to global scope for combat system
  useEffect(() => {
    window.unifiedEnemySystem = {
      enemies: enemies,
      damageEnemy: damageEnemy,
      roomState: roomState
    };
  }, [enemies, damageEnemy, roomState]);

  // Handle boss intro completion
  const handleBossIntroComplete = useCallback(() => {
    setBossIntroActive(false);
    setBossIntroData(null);
  }, []);

  return (
    <>
      {/* Boss Introduction Sequence */}
      {bossIntroActive && bossIntroData && gameEngine && gameEngine.getCamera && (
        <BossIntroSequence
          gameEngine={gameEngine}
          bossData={bossIntroData}
          onIntroComplete={handleBossIntroComplete}
          playerCamera={gameEngine.getCamera()}
        />
      )}
    </>
  );
}

export default UnifiedRoomManager;