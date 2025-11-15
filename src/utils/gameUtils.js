import * as THREE from 'three';

export const GameUtils = {
  // Ensure any position object becomes a proper Vector3
  ensureVector3(position) {
    if (position instanceof THREE.Vector3) {
      return position.clone();
    }
    
    if (typeof position === 'object' && position !== null) {
      return new THREE.Vector3(
        position.x || 0,
        position.y || 0, 
        position.z || 0
      );
    }
    
    // Default to origin if invalid
    console.warn('Invalid position provided, using origin:', position);
    return new THREE.Vector3(0, 0, 0);
  },
  
  // Create formation positions
  createFormation(basePos, count, formation) {
    const base = this.ensureVector3(basePos);
    const positions = [];
    
    for (let i = 0; i < count; i++) {
      let offset;
      switch (formation) {
        case 'line':
          offset = new THREE.Vector3((i - (count - 1) / 2) * 3, 0, 0);
          break;
        case 'circle':
          const angle = (i / count) * Math.PI * 2;
          offset = new THREE.Vector3(
            Math.cos(angle) * 5,
            0,
            Math.sin(angle) * 5
          );
          break;
        case 'triangle':
          if (i === 0) {
            offset = new THREE.Vector3(0, 0, -3); // Leader in front
          } else {
            const side = (i % 2 === 1) ? -1 : 1;
            const row = Math.floor(i / 2);
            offset = new THREE.Vector3(side * 2, 0, row * 2);
          }
          break;
        case 'column':
          offset = new THREE.Vector3(0, i * 2, 0);
          break;
        case 'scattered':
          offset = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 8
          );
          break;
        default:
          offset = new THREE.Vector3(0, 0, 0);
      }
      positions.push(base.clone().add(offset));
    }
    
    return positions;
  },

  // Calculate weapon damage based on type
  getWeaponDamage(weaponType) {
    const weaponDamage = {
      pistol: 25,
      shotgun: 60,
      rapidfire: 15,
      grappling: 30
    };
    return weaponDamage[weaponType] || 25;
  },

  // Distance calculation between two positions
  calculateDistance(pos1, pos2) {
    const p1 = this.ensureVector3(pos1);
    const p2 = this.ensureVector3(pos2);
    return p1.distanceTo(p2);
  },

  // Check if position is within bounds
  isPositionValid(position, bounds = { x: 50, y: 10, z: 200 }) {
    const pos = this.ensureVector3(position);
    return Math.abs(pos.x) <= bounds.x && 
           Math.abs(pos.y) <= bounds.y && 
           Math.abs(pos.z) <= bounds.z;
  },

  // Clamp position to bounds
  clampPosition(position, bounds = { x: 50, y: 10, z: 200 }) {
    const pos = this.ensureVector3(position);
    pos.x = Math.max(-bounds.x, Math.min(bounds.x, pos.x));
    pos.y = Math.max(-bounds.y, Math.min(bounds.y, pos.y));
    pos.z = Math.max(-bounds.z, Math.min(bounds.z, pos.z));
    return pos;
  }
};

export default GameUtils;