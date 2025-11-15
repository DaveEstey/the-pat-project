import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * SecretRoomManager - Manages hidden secret rooms with special rewards
 * Unlocked by completing puzzles or finding hidden triggers
 */
export function SecretRoomManager({
  gameEngine,
  secretRoomConfig,
  isUnlocked,
  onEnterSecretRoom,
  onExitSecretRoom,
  playerPosition
}) {
  const [doorState, setDoorState] = useState('locked'); // 'locked', 'unlocking', 'open'
  const [showPrompt, setShowPrompt] = useState(false);
  const doorRef = useRef(null);
  const portalRef = useRef(null);
  const rewardMeshRef = useRef(null);

  // Create secret door/portal visual
  useEffect(() => {
    if (!gameEngine || !gameEngine.getScene || !secretRoomConfig) return;

    const scene = gameEngine.getScene();

    // Create door frame
    const doorGroup = new THREE.Group();

    // Door frame (glowing outline)
    const frameGeometry = new THREE.BoxGeometry(2.5, 3.5, 0.1);
    const frameMaterial = new THREE.MeshLambertMaterial({
      color: isUnlocked ? 0x00ff00 : 0x888888,
      emissive: isUnlocked ? 0x00ff00 : 0x444444,
      emissiveIntensity: isUnlocked ? 0.6 : 0.2,
      transparent: true,
      opacity: 0.8
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    doorGroup.add(frame);

    // Inner portal (swirling effect placeholder)
    if (isUnlocked) {
      const portalGeometry = new THREE.PlaneGeometry(2, 3);
      const portalMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const portal = new THREE.Mesh(portalGeometry, portalMaterial);
      portal.position.z = 0.05;
      doorGroup.add(portal);
      portalRef.current = portal;

      // Pulsing animation for portal
      let time = 0;
      const pulseInterval = setInterval(() => {
        if (!portalRef.current) {
          clearInterval(pulseInterval);
          return;
        }

        time += 0.05;
        const opacity = 0.3 + Math.sin(time * 3) * 0.2;
        portalMaterial.opacity = opacity;
      }, 50);
    }

    // Position door at configured location
    doorGroup.position.set(
      secretRoomConfig.doorPosition.x,
      secretRoomConfig.doorPosition.y,
      secretRoomConfig.doorPosition.z
    );

    // Make door face player
    if (secretRoomConfig.doorRotation) {
      doorGroup.rotation.y = secretRoomConfig.doorRotation;
    }

    // Add lock indicator if locked
    if (!isUnlocked) {
      const lockGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const lockMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
      });
      const lock = new THREE.Mesh(lockGeometry, lockMaterial);
      lock.position.y = 0;
      lock.position.z = 0.15;
      doorGroup.add(lock);
    }

    scene.add(doorGroup);
    doorRef.current = doorGroup;

    return () => {
      if (doorRef.current && scene) {
        scene.remove(doorRef.current);
      }
    };
  }, [gameEngine, secretRoomConfig, isUnlocked]);

  // Update door appearance when unlocked
  useEffect(() => {
    if (isUnlocked && doorState === 'locked') {
      setDoorState('unlocking');

      // Play unlock animation
      setTimeout(() => {
        setDoorState('open');
      }, 1000);
    }
  }, [isUnlocked, doorState]);

  // Check player distance to door for interaction prompt
  useEffect(() => {
    if (!doorRef.current || !playerPosition || doorState !== 'open') {
      setShowPrompt(false);
      return;
    }

    const doorPosition = doorRef.current.position;
    const distance = Math.sqrt(
      Math.pow(playerPosition.x - doorPosition.x, 2) +
      Math.pow(playerPosition.z - doorPosition.z, 2)
    );

    // Show prompt if player is within 3 units
    if (distance < 3) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [playerPosition, doorState]);

  // Create reward items inside secret room
  useEffect(() => {
    if (!gameEngine || !gameEngine.getScene || !secretRoomConfig || !secretRoomConfig.rewards) return;

    const scene = gameEngine.getScene();
    const rewardMeshes = [];

    secretRoomConfig.rewards.forEach((reward, index) => {
      // Create visual representation of reward
      let rewardMesh;

      switch (reward.type) {
        case 'weapon':
          // Weapon pickup visualization
          const weaponGeometry = new THREE.BoxGeometry(0.5, 0.2, 1);
          const weaponMaterial = new THREE.MeshLambertMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5
          });
          rewardMesh = new THREE.Mesh(weaponGeometry, weaponMaterial);
          break;

        case 'health':
          // Health pack visualization
          const healthGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
          const healthMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
          });
          rewardMesh = new THREE.Mesh(healthGeometry, healthMaterial);
          break;

        case 'points':
          // Points orb visualization
          const pointsGeometry = new THREE.SphereGeometry(0.3, 16, 16);
          const pointsMaterial = new THREE.MeshLambertMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.7
          });
          rewardMesh = new THREE.Mesh(pointsGeometry, pointsMaterial);
          break;

        default:
          // Generic reward
          const defaultGeometry = new THREE.OctahedronGeometry(0.3);
          const defaultMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.6
          });
          rewardMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
      }

      // Position reward in secret room
      rewardMesh.position.set(
        secretRoomConfig.roomCenter.x + (index * 1.5 - 1.5),
        secretRoomConfig.roomCenter.y + 1,
        secretRoomConfig.roomCenter.z
      );

      // Add floating animation
      rewardMesh.userData.floatOffset = index * Math.PI * 0.5;
      rewardMesh.userData.isReward = true;
      rewardMesh.userData.rewardData = reward;

      scene.add(rewardMesh);
      rewardMeshes.push(rewardMesh);
    });

    rewardMeshRef.current = rewardMeshes;

    // Floating animation
    let time = 0;
    const floatInterval = setInterval(() => {
      if (!rewardMeshRef.current || rewardMeshRef.current.length === 0) {
        clearInterval(floatInterval);
        return;
      }

      time += 0.05;
      rewardMeshRef.current.forEach(mesh => {
        const offset = mesh.userData.floatOffset || 0;
        mesh.position.y = secretRoomConfig.roomCenter.y + 1 + Math.sin(time * 2 + offset) * 0.2;
        mesh.rotation.y += 0.02;
      });
    }, 50);

    return () => {
      clearInterval(floatInterval);
      if (rewardMeshRef.current && scene) {
        rewardMeshRef.current.forEach(mesh => scene.remove(mesh));
      }
    };
  }, [gameEngine, secretRoomConfig]);

  // Handle entering secret room
  const handleEnterRoom = () => {
    if (doorState === 'open' && onEnterSecretRoom) {
      onEnterSecretRoom(secretRoomConfig);
    }
  };

  return (
    <>
      {/* Interaction prompt */}
      {showPrompt && doorState === 'open' && (
        <div
          style={{
            position: 'fixed',
            bottom: '150px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 255, 0, 0.9)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '20px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'pulse 1s ease-in-out infinite',
            cursor: 'pointer'
          }}
          onClick={handleEnterRoom}
        >
          🌟 Press ENTER to enter Secret Room! 🌟
        </div>
      )}

      {/* Unlock notification */}
      {doorState === 'unlocking' && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 255, 0, 0.95)',
            color: 'white',
            padding: '32px 48px',
            borderRadius: '16px',
            fontSize: '32px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}
        >
          🎉 Secret Room Unlocked! 🎉
          <div style={{ fontSize: '18px', marginTop: '12px', opacity: 0.9 }}>
            {secretRoomConfig?.description || 'Hidden rewards await!'}
          </div>
        </div>
      )}
    </>
  );
}

export default SecretRoomManager;
