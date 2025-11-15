import React, { useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { ComboSystem } from '../../systems/ComboSystem.js';

// Unified Combat System - Single handler for all shooting and damage
export function UnifiedCombatSystem({ gameEngine }) {
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const comboSystemRef = useRef(null);

  // Initialize combo system
  useEffect(() => {
    if (!comboSystemRef.current) {
      comboSystemRef.current = new ComboSystem();

      // Make combo system globally available
      window.comboSystem = comboSystemRef.current;

      // Listen for combo milestones and dispatch events
      comboSystemRef.current.on('milestone', (data) => {
        window.dispatchEvent(new CustomEvent('comboMilestone', { detail: data }));
      });

      comboSystemRef.current.on('break', (data) => {
      });

    }

    // Update combo system every frame to check for timeout
    const interval = setInterval(() => {
      if (comboSystemRef.current) {
        comboSystemRef.current.update();
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Handle all shooting in one place
  const handleShoot = useCallback((event) => {
    // Record shot fired for accuracy tracking
    let shotHit = false;

    // Get weapon type early for use in all hit detection
    let weaponType = 'pistol'; // Default weapon
    if (window.weaponSystem) {
      const weaponInfo = window.weaponSystem.getWeaponInfo();
      if (weaponInfo) {
        weaponType = weaponInfo.type;
      }
    }

    // Check if unified enemy system is available
    if (!window.unifiedEnemySystem) {
      // Still record the shot as a miss
      if (window.gameContext?.recordShot) {
        window.gameContext.recordShot(false);
      }
      return;
    }

    const { enemies, damageEnemy } = window.unifiedEnemySystem;
    const aliveEnemies = enemies.filter(e => e.health > 0);

    if (aliveEnemies.length === 0) {
      return;
    }

    // Get canvas and calculate mouse position
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();

    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast from camera to find hit targets
    if (gameEngine && gameEngine.getCamera) {
      const camera = gameEngine.getCamera();
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // Get all enemy meshes from the scene - ONLY the main body group (not children)
      const enemyMeshes = [];
      const enemyMeshMap = new Map(); // Track which enemies we've already added

      if (gameEngine.getScene) {
        gameEngine.getScene().traverse((object) => {
          // Only add the TOP-LEVEL enemy group, not children
          // Check if this is a Group with enemyId directly on it
          if (object.type === 'Group' && object.userData && object.userData.enemyId) {
            const enemyId = object.userData.enemyId;
            const enemy = enemies.find(e => e.id === enemyId);

            if (enemy && enemy.health > 0 && !enemyMeshMap.has(enemyId)) {
              // Add all mesh children of this group for raycasting
              object.traverse((child) => {
                if (child.isMesh && child.material) {
                  // Skip wireframes, health bars, and debug markers
                  const isDebugMesh = child.material.wireframe ||
                                     child.parent?.name === 'healthBar' ||
                                     child.userData?.isDebug;

                  if (!isDebugMesh) {
                    enemyMeshes.push(child);
                  }
                }
              });

              enemyMeshMap.set(enemyId, true);
            }
          }
        });
      }

      // Also collect item meshes and weapon pickups for shooting
      const itemMeshes = [];
      const weaponPickupMeshes = [];
      if (gameEngine.getScene) {
        gameEngine.getScene().traverse((object) => {
          if (object.userData && object.userData.isItem) {
            itemMeshes.push(object);
          }
          // Weapon pickups are Groups, so we need to add their mesh children
          if (object.userData && object.userData.type === 'weapon_pickup') {
            // Add all mesh children of the weapon pickup group
            object.traverse((child) => {
              if (child.isMesh) {
                weaponPickupMeshes.push(child);
              }
            });
          }
        });
      }

      // Also collect puzzle target meshes
      const puzzleTargetMeshes = [];
      if (gameEngine.getScene) {
        gameEngine.getScene().traverse((object) => {
          if (object.userData && object.userData.isPuzzleTarget) {
            puzzleTargetMeshes.push(object);
          }
        });
      }

      // Also collect projectile meshes for bullet deflection
      const projectileMeshes = [];
      if (gameEngine.getScene && window.enemyProjectileSystem) {
        gameEngine.getScene().traverse((object) => {
          if (object.userData && object.userData.isProjectile && object.userData.projectileId) {
            projectileMeshes.push(object);
          }
        });
      }

      // Check for intersections - prioritize weapon pickups, puzzle targets, items, projectiles, then enemies
      const weaponPickupIntersects = raycasterRef.current.intersectObjects(weaponPickupMeshes);
      const puzzleIntersects = raycasterRef.current.intersectObjects(puzzleTargetMeshes);
      const itemIntersects = raycasterRef.current.intersectObjects(itemMeshes);
      const projectileIntersects = raycasterRef.current.intersectObjects(projectileMeshes);
      const enemyIntersects = raycasterRef.current.intersectObjects(enemyMeshes);

      // Hit weapon pickup first (weapon unlock)
      if (weaponPickupIntersects.length > 0) {
        const hitPickup = weaponPickupIntersects[0].object;
        const pickupData = hitPickup.userData;

        // Unlock weapon via progression system
        if (window.weaponSystem) {
          const unlocked = window.weaponSystem.unlockWeapon(pickupData.weaponType, 'level_pickup');

          if (unlocked) {
            // Show notification via global event
            window.dispatchEvent(new CustomEvent('showNotification', {
              detail: {
                message: `🔓 Unlocked ${pickupData.weaponType.toUpperCase()}!`,
                type: 'success'
              }
            }));
          }

          // ALWAYS trigger weapon pickup collected event (even if already unlocked)

          window.dispatchEvent(new CustomEvent('weaponPickupCollected', {
            detail: {
              pickupId: pickupData.pickupId,
              weaponType: pickupData.weaponType
            }
          }));

          shotHit = true;
        }
      } else if (puzzleIntersects.length > 0) {
        const hitTarget = puzzleIntersects[0].object;
        const targetData = hitTarget.userData;

        // Trigger target hit event (for puzzles and secrets)
        window.dispatchEvent(new CustomEvent('targetHit', {
          detail: {
            targetId: targetData.targetId,
            targetType: targetData.targetType,
            color: targetData.color
          }
        }));

        // Also fire legacy event for backwards compatibility
        window.dispatchEvent(new CustomEvent('puzzleTargetHit', {
          detail: {
            targetId: targetData.targetId,
            targetType: targetData.targetType,
            color: targetData.color
          }
        }));

        // Visual feedback for hitting puzzle target
        const originalColor = hitTarget.material.color.getHex();
        hitTarget.material.color.setHex(0xffffff); // Flash white
        hitTarget.material.emissiveIntensity = 1.0;

        setTimeout(() => {
          hitTarget.material.color.setHex(originalColor);
          hitTarget.material.emissiveIntensity = 0.3;
        }, 200);

        shotHit = true;
      } else if (itemIntersects.length > 0) {
        // Hit item second (item collection by shooting)
        const hitItem = itemIntersects[0].object;
        const itemData = hitItem.userData;

        // Apply item effect
        if (itemData.itemType === 'health' && window.gameContext?.updatePlayerHealth) {
          window.gameContext.updatePlayerHealth(itemData.itemValue);
        } else if (itemData.itemType === 'coin' && window.gameContext?.addScore) {
          window.gameContext.addScore(itemData.itemValue * 10);
        } else if (itemData.itemType === 'ammo' && window.weaponSystem) {
          // Add ammo to weapon system
          window.weaponSystem.addAmmo(itemData.itemSubType, itemData.itemValue);
        } else if (itemData.itemType === 'powerup') {
          // Apply powerup effect (to be implemented)
        }

        // Create collection sparkle effect
        const sparkleCount = 8;
        for (let i = 0; i < sparkleCount; i++) {
          const sparkleGeometry = new THREE.SphereGeometry(0.1, 6, 4);
          const sparkleMaterial = new THREE.MeshBasicMaterial({
            color: hitItem.material.color,
            transparent: true,
            opacity: 1.0
          });
          const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);

          const angle = (i / sparkleCount) * Math.PI * 2;
          const radius = 0.5 + Math.random() * 0.5;

          sparkle.position.copy(hitItem.position);
          sparkle.position.x += Math.cos(angle) * radius;
          sparkle.position.y += Math.sin(angle) * radius;

          if (gameEngine && gameEngine.getScene) {
            gameEngine.getScene().add(sparkle);

            // Animate sparkle
            let opacity = 1.0;
            const animateSparkle = () => {
              opacity -= 0.05;
              if (opacity > 0) {
                sparkleMaterial.opacity = opacity;
                sparkle.position.y += 0.02;
                sparkle.scale.setScalar(1 + (1 - opacity) * 2);
                requestAnimationFrame(animateSparkle);
              } else {
                gameEngine.getScene().remove(sparkle);
                sparkleGeometry.dispose();
                sparkleMaterial.dispose();
              }
            };
            setTimeout(() => animateSparkle(), i * 30);
          }
        }

        // Remove collected item from scene
        if (gameEngine && gameEngine.getScene) {
          gameEngine.getScene().remove(hitItem);
        }

        // Remove from dropped items tracking
        if (window.droppedItems) {
          const index = window.droppedItems.indexOf(hitItem);
          if (index > -1) {
            window.droppedItems.splice(index, 1);
          }
        }

        shotHit = true;
      } else if (projectileIntersects.length > 0) {
        // Hit projectile second (bullet deflection)
        const hitProjectile = projectileIntersects[0].object;
        const projectileId = hitProjectile.userData.projectileId;

        // Deflect the projectile
        if (window.enemyProjectileSystem && window.enemyProjectileSystem.deflectProjectile) {
          window.enemyProjectileSystem.deflectProjectile(projectileId, hitProjectile.position);
          shotHit = true;

          // Visual feedback for deflection
          window.dispatchEvent(new CustomEvent('projectileDeflected', {
            detail: {
              position: hitProjectile.position.clone(),
              weaponType: weaponType
            }
          }));
        }
      } else if (enemyIntersects.length > 0) {
        // Hit the closest enemy that was actually clicked
        const hitMesh = enemyIntersects[0].object;

        // Extract enemy ID from hit object or its parents
        let enemyId = null;
        if (hitMesh.userData && hitMesh.userData.enemyId) {
          enemyId = hitMesh.userData.enemyId;
        } else if (hitMesh.parent && hitMesh.parent.userData && hitMesh.parent.userData.enemyId) {
          enemyId = hitMesh.parent.userData.enemyId;
        } else if (hitMesh.parent && hitMesh.parent.parent && hitMesh.parent.parent.userData && hitMesh.parent.parent.userData.enemyId) {
          enemyId = hitMesh.parent.parent.userData.enemyId;
        }

        if (!enemyId) {
          console.error('Could not find enemy ID for hit object:', hitMesh);
          return;
        }

        // Get weapon damage from weapon system
        let damage = 25; // Default fallback
        let shotData = null;

        if (window.weaponSystem && window.weaponSystem.canFire()) {
          // Get current weapon info instead of firing
          const weaponInfo = window.weaponSystem.getWeaponInfo();
          if (weaponInfo) {
            // weaponType already set at top of function

            // Calculate distance to target for falloff (shotgun)
            const enemy = enemies.find(e => e.id === enemyId);
            let distanceToTarget = 15; // Default mid-range
            if (enemy && enemy.mesh) {
              const cameraPos = gameEngine.getCamera().position;
              distanceToTarget = cameraPos.distanceTo(enemy.mesh.position);
            }

            // Get damage based on weapon type
            switch (weaponType) {
              case 'pistol':
                damage = 25;
                break;
              case 'shotgun':
                // Shotgun damage falloff with distance
                // Full damage (80) at 0-15 units
                // 50% damage (40) at 20 units
                // 25% damage (20) at 30+ units
                const baseDamage = 80;
                if (distanceToTarget <= 15) {
                  damage = baseDamage; // Full damage close range
                } else if (distanceToTarget <= 20) {
                  // Linear falloff 15-20 units: 100% to 50%
                  const falloffPercent = 1.0 - ((distanceToTarget - 15) / 5) * 0.5;
                  damage = Math.floor(baseDamage * falloffPercent);
                } else if (distanceToTarget <= 30) {
                  // Linear falloff 20-30 units: 50% to 25%
                  const falloffPercent = 0.5 - ((distanceToTarget - 20) / 10) * 0.25;
                  damage = Math.floor(baseDamage * falloffPercent);
                } else {
                  // Beyond 30 units: 25% damage
                  damage = Math.floor(baseDamage * 0.25);
                }
                break;
              case 'rapidfire':
                damage = 15; // Lower damage per shot, high fire rate
                break;
              case 'grappling':
                damage = 50; // Medium-high damage
                break;
              default:
                damage = 25;
            }

            // Consume ammo and update weapon state
            window.weaponSystem.consumeAmmo();

            shotData = {
              weapon: weaponType,
              damage: damage,
              ammo: weaponInfo.ammo
            };
          }
        }

        // Register combo hit
        let isCritical = false;
        if (comboSystemRef.current) {
          const comboData = comboSystemRef.current.registerHit();

          // Apply combo multiplier to damage for extra impact
          const comboDamage = Math.floor(damage * comboData.multiplier);
          if (comboDamage > damage) {
            damage = comboDamage;
            isCritical = comboData.multiplier >= 2.0; // Critical if 2x+ multiplier
          }
        }

        // Trigger hit marker event
        window.dispatchEvent(new CustomEvent('weaponHit', {
          detail: {
            damage: damage,
            position: { x: event.clientX, y: event.clientY },
            isCritical: isCritical
          }
        }));

        // Trigger weapon fired event for visual effects
        window.dispatchEvent(new CustomEvent('weaponFired', {
          detail: {
            weapon: weaponType,
            position: { x: event.clientX, y: event.clientY }
          }
        }));

        // Trigger visual effects
        const hitPosition = hitMesh.position.clone();

        // Get enemy object to pass type
        const hitEnemy = enemies.find(e => e.id === enemyId);
        const enemyType = hitEnemy ? hitEnemy.type : 'unknown';

        // Dispatch enemy damaged event
        window.dispatchEvent(new CustomEvent('enemyDamaged', {
          detail: {
            position: hitPosition,
            damage: damage,
            isCritical: isCritical,
            enemyType: enemyType
          }
        }));

        // Create muzzle flash at camera position (approximation)
        if (gameEngine && gameEngine.getCamera) {
          const camera = gameEngine.getCamera();
          const cameraPosition = camera.position.clone();
          window.dispatchEvent(new CustomEvent('weaponFired', {
            detail: {
              position: cameraPosition,
              targetPosition: hitPosition,
              weaponType: weaponType
            }
          }));
        }
        const enemyDied = damageEnemy(enemyId, damage);
        shotHit = true; // Mark shot as hit for accuracy tracking

        if (enemyDied) {

          // Dispatch enemy death event for explosion effects
          window.dispatchEvent(new CustomEvent('enemyDied', {
            detail: {
              position: hitPosition,
              enemyType: enemyType
            }
          }));
        }
        
        // Visual hit effect
        const originalColor = hitMesh.material.color.getHex();
        hitMesh.material.color.setHex(0xffffff); // Flash white
        setTimeout(() => {
          hitMesh.material.color.setHex(originalColor);
        }, 150);
        
      } else {
        // No direct hit - check if click is near any enemies for better UX
        
        // Find closest enemy to cursor position
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        if (aliveEnemies.length > 0 && gameEngine && gameEngine.getScene) {
          gameEngine.getScene().traverse((object) => {
            if (object.userData && object.userData.enemyId) {
              const enemy = enemies.find(e => e.id === object.userData.enemyId);
              if (enemy && enemy.health > 0) {
                // Project enemy position to screen
                const vector = new THREE.Vector3();
                object.getWorldPosition(vector);
                vector.project(gameEngine.getCamera());
                
                // Convert to screen space
                const screenX = (vector.x + 1) / 2;
                const screenY = (-vector.y + 1) / 2;
                
                // Calculate distance from click
                const clickX = (mouseRef.current.x + 1) / 2;
                const clickY = (-mouseRef.current.y + 1) / 2;
                const distance = Math.sqrt(
                  Math.pow(screenX - clickX, 2) + Math.pow(screenY - clickY, 2)
                );
                
                if (distance < closestDistance && distance < 0.08) { // Tighter click tolerance (8% of screen)
                  closestDistance = distance;
                  closestEnemy = enemy;
                }
              }
            }
          });
        }
        
        if (closestEnemy) {
          // Hit the closest enemy to cursor - use same damage logic as direct hit
          // Get weapon damage (same logic as direct hit)
          let damage = 25; // Default fallback
          let shotData = null;

          if (window.weaponSystem && window.weaponSystem.canFire()) {
            const weaponInfo = window.weaponSystem.getWeaponInfo();
            if (weaponInfo) {
              // weaponType already set at top of function

              switch (weaponType) {
                case 'pistol':
                  damage = 25;
                  break;
                case 'shotgun':
                  damage = 80;
                  break;
                case 'rapidfire':
                  damage = 15;
                  break;
                case 'grappling':
                  damage = 50;
                  break;
                default:
                  damage = 25;
              }

              window.weaponSystem.consumeAmmo();
              shotData = {
                weapon: weaponType,
                damage: damage,
                ammo: weaponInfo.ammo
              };
            }
          }

          // Trigger visual effects for near-miss hit
          const nearMissHitPosition = new THREE.Vector3(
            closestEnemy.position?.x || 0,
            closestEnemy.position?.y || 0,
            closestEnemy.position?.z || -5
          );
          const isCritical = damage > 50;
          const nearMissEnemyType = closestEnemy.type || 'unknown';

          // Dispatch enemy damaged event
          window.dispatchEvent(new CustomEvent('enemyDamaged', {
            detail: {
              position: nearMissHitPosition,
              damage: damage,
              isCritical: isCritical,
              enemyType: nearMissEnemyType
            }
          }));

          // Create muzzle flash at camera position
          if (gameEngine && gameEngine.getCamera) {
            const camera = gameEngine.getCamera();
            const cameraPosition = camera.position.clone();
            window.dispatchEvent(new CustomEvent('weaponFired', {
              detail: {
                position: cameraPosition,
                targetPosition: nearMissHitPosition,
                weaponType: weaponType
              }
            }));
          }
          const enemyDied = damageEnemy(closestEnemy.id, damage);
          shotHit = true; // Mark shot as hit for accuracy tracking

          if (enemyDied) {

            // Dispatch enemy death event for explosion effects
            window.dispatchEvent(new CustomEvent('enemyDied', {
              detail: {
                position: nearMissHitPosition,
                enemyType: nearMissEnemyType
              }
            }));
          }
        } else {

          // Register combo miss
          if (comboSystemRef.current) {
            comboSystemRef.current.registerMiss();
          }
        }
      }
    } else {
      console.error('Game engine or camera not available for raycasting');
    }
    
    // Record shot for accuracy tracking
    if (window.gameContext?.recordShot) {
      window.gameContext.recordShot(shotHit);
    }
  }, [gameEngine]);
  
  // Weapon switching handler
  const handleWeaponSwitch = useCallback((weaponKey) => {
    const weaponMap = {
      '1': 'pistol',
      '2': 'shotgun', 
      '3': 'rapidfire',
      '4': 'grappling'
    };
    
    const weaponName = weaponMap[weaponKey];
    if (weaponName) {
      // Could modify damage based on weapon type
    }
  }, []);
  
  // Attach event listeners
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.error('Canvas not found for combat system');
      return;
    }
    
    // Mouse click for shooting
    canvas.addEventListener('click', handleShoot);
    
    // Keyboard for weapon switching
    const handleKeyDown = (event) => {
      if (['1', '2', '3', '4'].includes(event.key)) {
        handleWeaponSwitch(event.key);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      canvas.removeEventListener('click', handleShoot);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleShoot, handleWeaponSwitch]);
  
  return null;
}

export default UnifiedCombatSystem;