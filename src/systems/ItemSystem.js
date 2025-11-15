import * as THREE from 'three';
import { GameUtils } from '../utils/gameUtils.js';

export class ItemSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.items = [];
    this.itemSpawns = [];
    this.totalTime = 0;
    
    // Listen to position updates from game engine
    this.gameEngine.on('positionUpdate', this.checkItemCollection.bind(this));
  }

  // Configure item spawns for a level
  setItemConfiguration(levelItems) {
    this.itemSpawns = levelItems.map(item => ({
      ...item,
      collected: false
    }));
    
    // Reset items for new level
    this.items = [];
    this.spawnItems();
  }

  // Spawn all items for the level
  spawnItems() {
    this.itemSpawns.forEach((itemSpawn, index) => {
      const item = this.createItem(itemSpawn);
      this.items.push(item);
      this.gameEngine.getScene().add(item.mesh);
    });
  }

  // Create individual item
  createItem(itemData) {
    const itemPosition = GameUtils.ensureVector3(itemData.position);
    
    const item = {
      id: Math.random().toString(36).substr(2, 9),
      type: itemData.type,
      subType: itemData.subType || 'basic',
      position: itemPosition,
      value: itemData.value || 1,
      collected: false,
      mesh: this.createItemMesh(itemData.type, itemPosition, itemData.subType),
      rotationSpeed: Math.random() * 2 + 1,
      bobHeight: 0.5,
      bobSpeed: Math.random() * 2 + 2
    };

    return item;
  }

  // Create 3D mesh for item
  createItemMesh(type, position, subType = 'basic') {
    let geometry, material;
    
    const meshPosition = GameUtils.ensureVector3(position);
    
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
        switch (subType) {
          case 'shotgun':
            material = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
            break;
          case 'rapidfire':
            material = new THREE.MeshLambertMaterial({ color: 0xff4400 });
            break;
          case 'bomb':
            material = new THREE.MeshLambertMaterial({ color: 0x884444 });
            break;
          default:
            material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        }
        break;
        
      case 'powerup':
        geometry = new THREE.OctahedronGeometry(0.4, 0);
        switch (subType) {
          case 'speed':
            material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
            break;
          case 'damage':
            material = new THREE.MeshLambertMaterial({ color: 0xff0044 });
            break;
          case 'accuracy':
            material = new THREE.MeshLambertMaterial({ color: 0x4400ff });
            break;
          default:
            material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        }
        break;
        
      case 'key_item':
        geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 6);
        material = new THREE.MeshLambertMaterial({ 
          color: 0xffd700,
          emissive: 0x443300
        });
        break;
        
      case 'upgrade':
        geometry = new THREE.TetrahedronGeometry(0.5);
        material = new THREE.MeshLambertMaterial({ 
          color: 0xff44ff,
          emissive: 0x220022
        });
        break;
        
      case 'coin':
        geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
        material = new THREE.MeshLambertMaterial({ 
          color: 0xffdd00,
          emissive: 0x332200
        });
        break;
        
      default:
        geometry = new THREE.SphereGeometry(0.3, 8, 6);
        material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(meshPosition);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
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
    mesh.glowEffect = glow;

    return mesh;
  }

  // Check if player is close enough to collect items
  checkItemCollection({ position, progress }) {
    const playerPos = GameUtils.ensureVector3(position);
    const collectionRadius = 2.0;
    
    this.items.forEach(item => {
      if (item.collected) return;
      
      const distance = item.position.distanceTo(playerPos);
      if (distance <= collectionRadius) {
        this.collectItem(item);
      }
    });
  }

  // Collect an item
  collectItem(item) {
    item.collected = true;
    
    // Apply item effect
    this.applyItemEffect(item);
    
    // Create collection effect
    this.createCollectionEffect(item.position);
    
    // Remove from scene
    this.gameEngine.getScene().remove(item.mesh);
    
    // Emit collection event
    this.gameEngine.emit('itemCollected', {
      item,
      type: item.type,
      subType: item.subType,
      value: item.value
    });
  }

  // Apply the effect of collecting an item
  applyItemEffect(item) {
    const effect = {
      type: item.type,
      subType: item.subType,
      value: item.value
    };

    switch (item.type) {
      case 'health':
        effect.healthRestore = item.subType === 'large' ? 50 : 25;
        break;
        
      case 'ammo':
        effect.ammo = {
          [item.subType]: item.value
        };
        break;
        
      case 'powerup':
        effect.duration = 30000; // 30 seconds
        switch (item.subType) {
          case 'speed':
            effect.speedMultiplier = 1.25;
            break;
          case 'damage':
            effect.damageMultiplier = 1.5;
            break;
          case 'accuracy':
            effect.accuracyBonus = 0.2;
            break;
        }
        break;
        
      case 'key_item':
        effect.unlocks = item.unlocks || [];
        break;
        
      case 'upgrade':
        effect.permanent = true;
        effect.upgradeType = item.subType;
        break;
        
      case 'coin':
        effect.points = item.value * 10;
        break;
    }

    // Emit effect for game systems to handle
    this.gameEngine.emit('itemEffect', effect);
  }

  // Create visual effect when item is collected
  createCollectionEffect(position) {
    // Create sparkle effect
    const sparkleGeometry = new THREE.SphereGeometry(0.1, 6, 4);
    const sparkleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff88,
      transparent: true,
      opacity: 1.0
    });

    for (let i = 0; i < 8; i++) {
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial.clone());
      
      const angle = (i / 8) * Math.PI * 2;
      const radius = Math.random() * 1.5 + 0.5;
      
      sparkle.position.copy(position);
      sparkle.position.x += Math.cos(angle) * radius;
      sparkle.position.y += Math.sin(angle) * radius;
      sparkle.position.z += (Math.random() - 0.5) * 1;
      
      this.gameEngine.getScene().add(sparkle);
      
      // Animate sparkle
      const startTime = Date.now();
      const duration = 500;
      
      const animateSparkle = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
          this.gameEngine.getScene().remove(sparkle);
          return;
        }
        
        sparkle.material.opacity = 1 - progress;
        sparkle.position.y += 0.02;
        sparkle.scale.setScalar(1 + progress * 2);
        
        requestAnimationFrame(animateSparkle);
      };
      
      setTimeout(() => animateSparkle(), i * 50);
    }
  }

  // Update items (rotation, bobbing animation)
  update(deltaTime, totalTime) {
    this.totalTime = totalTime;
    
    this.items.forEach(item => {
      if (item.collected) return;
      
      // Rotate item
      item.mesh.rotation.y += item.rotationSpeed * deltaTime;
      
      // Bob up and down
      const bobOffset = Math.sin(totalTime * item.bobSpeed) * item.bobHeight;
      item.mesh.position.y = item.position.y + bobOffset;
      
      // Pulse glow effect
      if (item.mesh.glowEffect) {
        const glowPulse = (Math.sin(totalTime * 4) + 1) / 2; // 0 to 1
        item.mesh.glowEffect.material.opacity = 0.2 + glowPulse * 0.3;
      }
    });
  }

  // Force collect item at screen position (for shooting items)
  collectItemAtPosition(screenX, screenY, camera) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Convert screen coordinates to normalized device coordinates
    mouse.x = (screenX / window.innerWidth) * 2 - 1;
    mouse.y = -(screenY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Get item meshes
    const itemMeshes = this.items
      .filter(item => !item.collected)
      .map(item => item.mesh);
    
    const intersects = raycaster.intersectObjects(itemMeshes);
    
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const item = this.items.find(i => i.mesh === hitMesh);
      
      if (item && !item.collected) {
        this.collectItem(item);
        return true;
      }
    }
    
    return false;
  }

  // Get all items
  getItems() {
    return this.items.filter(item => !item.collected);
  }

  // Clear all items
  clearAllItems() {
    this.items.forEach(item => {
      this.gameEngine.getScene().remove(item.mesh);
    });
    this.items = [];
    this.itemSpawns = [];
  }

  // Check if specific item type exists
  hasItemType(type, subType = null) {
    return this.items.some(item => 
      !item.collected && 
      item.type === type && 
      (subType === null || item.subType === subType)
    );
  }

  // Get nearest item of specific type
  getNearestItem(position, type = null, maxDistance = 10) {
    const pos = GameUtils.ensureVector3(position);
    let nearest = null;
    let nearestDistance = maxDistance;
    
    this.items.forEach(item => {
      if (item.collected) return;
      if (type && item.type !== type) return;
      
      const distance = item.position.distanceTo(pos);
      if (distance < nearestDistance) {
        nearest = item;
        nearestDistance = distance;
      }
    });
    
    return nearest;
  }
}