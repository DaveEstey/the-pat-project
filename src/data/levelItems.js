// Level item configurations
export const LevelItems = {
  level1: [
    {
      type: 'health',
      subType: 'small',
      position: { x: 5, y: 1, z: -25 },
      value: 25
    },
    {
      type: 'ammo',
      subType: 'shotgun',
      position: { x: -3, y: 0.5, z: -45 },
      value: 8
    },
    {
      type: 'coin',
      position: { x: 8, y: 2, z: -65 },
      value: 5
    },
    {
      type: 'powerup',
      subType: 'damage',
      position: { x: -6, y: 1.5, z: -85 },
      value: 1
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: 0, y: 0.8, z: -110 },
      value: 50
    },
    {
      type: 'ammo',
      subType: 'rapidfire',
      position: { x: 10, y: 1, z: -130 },
      value: 30
    }
  ],

  level2: [
    {
      type: 'health',
      subType: 'small',
      position: { x: -4, y: 1, z: -20 },
      value: 25
    },
    {
      type: 'coin',
      position: { x: 6, y: 0.5, z: -35 },
      value: 3
    },
    {
      type: 'ammo',
      subType: 'shotgun',
      position: { x: -8, y: 2, z: -50 },
      value: 10
    },
    {
      type: 'powerup',
      subType: 'speed',
      position: { x: 12, y: 1.5, z: -70 },
      value: 1
    },
    {
      type: 'coin',
      position: { x: -2, y: 0.8, z: -85 },
      value: 7
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: 5, y: 1, z: -105 },
      value: 50
    },
    {
      type: 'ammo',
      subType: 'bomb',
      position: { x: -10, y: 2.5, z: -125 },
      value: 2
    },
    {
      type: 'upgrade',
      subType: 'enhanced_grip',
      position: { x: 0, y: 3, z: -140 },
      value: 1
    }
  ],

  level3: [
    {
      type: 'powerup',
      subType: 'accuracy',
      position: { x: -7, y: 1, z: -15 },
      value: 1
    },
    {
      type: 'coin',
      position: { x: 4, y: 0.5, z: -30 },
      value: 4
    },
    {
      type: 'health',
      subType: 'small',
      position: { x: 9, y: 2, z: -55 },
      value: 25
    },
    {
      type: 'ammo',
      subType: 'rapidfire',
      position: { x: -5, y: 1.5, z: -75 },
      value: 40
    },
    {
      type: 'coin',
      position: { x: 11, y: 0.8, z: -95 },
      value: 6
    },
    {
      type: 'powerup',
      subType: 'damage',
      position: { x: -8, y: 2.5, z: -115 },
      value: 1
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: 2, y: 1, z: -135 },
      value: 50
    },
    {
      type: 'key_item',
      subType: 'glider',
      position: { x: -3, y: 4, z: -150 },
      value: 1,
      unlocks: ['aerial_path_level4']
    }
  ],

  level4: [
    {
      type: 'health',
      subType: 'small',
      position: { x: -6, y: 1, z: -25 },
      value: 25
    },
    {
      type: 'ammo',
      subType: 'bomb',
      position: { x: 8, y: 2, z: -45 },
      value: 3
    },
    {
      type: 'powerup',
      subType: 'speed',
      position: { x: -10, y: 1.5, z: -65 },
      value: 1
    },
    {
      type: 'coin',
      position: { x: 5, y: 0.8, z: -85 },
      value: 8
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: 0, y: 1, z: -105 },
      value: 50
    },
    {
      type: 'upgrade',
      subType: 'reinforced_armor',
      position: { x: -4, y: 3, z: -120 },
      value: 1
    },
    {
      type: 'ammo',
      subType: 'shotgun',
      position: { x: 12, y: 1.5, z: -140 },
      value: 12
    }
  ],

  level5: [
    {
      type: 'coin',
      position: { x: 3, y: 0.5, z: -10 },
      value: 2
    },
    {
      type: 'powerup',
      subType: 'accuracy',
      position: { x: -9, y: 2, z: -30 },
      value: 1
    },
    {
      type: 'health',
      subType: 'small',
      position: { x: 7, y: 1, z: -50 },
      value: 25
    },
    {
      type: 'ammo',
      subType: 'rapidfire',
      position: { x: -2, y: 1.5, z: -70 },
      value: 35
    },
    {
      type: 'coin',
      position: { x: 10, y: 0.8, z: -90 },
      value: 5
    },
    {
      type: 'key_item',
      subType: 'scuba_gear',
      position: { x: -8, y: 2.5, z: -110 },
      value: 1,
      unlocks: ['underwater_path_level6']
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: 4, y: 1, z: -130 },
      value: 50
    },
    {
      type: 'powerup',
      subType: 'damage',
      position: { x: -6, y: 3, z: -150 },
      value: 1
    },
    {
      type: 'ammo',
      subType: 'bomb',
      position: { x: 12, y: 1.5, z: -170 },
      value: 4
    }
  ],

  level6: [
    {
      type: 'health',
      subType: 'small',
      position: { x: -5, y: 1, z: -20 },
      value: 25
    },
    {
      type: 'coin',
      position: { x: 6, y: 2, z: -40 },
      value: 6
    },
    {
      type: 'ammo',
      subType: 'shotgun',
      position: { x: -8, y: 1.5, z: -60 },
      value: 10
    },
    {
      type: 'powerup',
      subType: 'speed',
      position: { x: 4, y: 3, z: -80 },
      value: 1
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: 0, y: 1, z: -100 },
      value: 50
    },
    {
      type: 'upgrade',
      subType: 'eagle_eye',
      position: { x: -7, y: 4, z: -120 },
      value: 1
    },
    {
      type: 'coin',
      position: { x: 9, y: 0.8, z: -140 },
      value: 7
    }
  ],

  level7: [
    {
      type: 'ammo',
      subType: 'bomb',
      position: { x: -4, y: 1, z: -15 },
      value: 3
    },
    {
      type: 'powerup',
      subType: 'damage',
      position: { x: 7, y: 2, z: -35 },
      value: 1
    },
    {
      type: 'health',
      subType: 'small',
      position: { x: -9, y: 1.5, z: -55 },
      value: 25
    },
    {
      type: 'coin',
      position: { x: 5, y: 0.8, z: -75 },
      value: 8
    },
    {
      type: 'ammo',
      subType: 'rapidfire',
      position: { x: -2, y: 2.5, z: -95 },
      value: 40
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: 8, y: 1, z: -115 },
      value: 50
    },
    {
      type: 'key_item',
      subType: 'night_vision',
      position: { x: -6, y: 3, z: -135 },
      value: 1,
      unlocks: ['secret_path_level8']
    }
  ],

  level8: [
    {
      type: 'coin',
      position: { x: 3, y: 0.5, z: -12 },
      value: 4
    },
    {
      type: 'health',
      subType: 'small',
      position: { x: -7, y: 2, z: -32 },
      value: 25
    },
    {
      type: 'powerup',
      subType: 'accuracy',
      position: { x: 6, y: 1.5, z: -52 },
      value: 1
    },
    {
      type: 'ammo',
      subType: 'shotgun',
      position: { x: -10, y: 3, z: -72 },
      value: 12
    },
    {
      type: 'coin',
      position: { x: 4, y: 0.8, z: -92 },
      value: 9
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: -3, y: 1, z: -112 },
      value: 50
    },
    {
      type: 'powerup',
      subType: 'speed',
      position: { x: 11, y: 2.5, z: -132 },
      value: 1
    },
    {
      type: 'ammo',
      subType: 'bomb',
      position: { x: -8, y: 4, z: -152 },
      value: 5
    }
  ],

  level9: [
    {
      type: 'health',
      subType: 'small',
      position: { x: -6, y: 1, z: -18 },
      value: 25
    },
    {
      type: 'powerup',
      subType: 'damage',
      position: { x: 8, y: 3, z: -38 },
      value: 1
    },
    {
      type: 'ammo',
      subType: 'rapidfire',
      position: { x: -4, y: 2, z: -58 },
      value: 45
    },
    {
      type: 'coin',
      position: { x: 10, y: 0.8, z: -78 },
      value: 10
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: 0, y: 1, z: -98 },
      value: 50
    },
    {
      type: 'upgrade',
      subType: 'enhanced_grip',
      position: { x: -9, y: 4, z: -118 },
      value: 1
    },
    {
      type: 'powerup',
      subType: 'accuracy',
      position: { x: 6, y: 2.5, z: -138 },
      value: 1
    },
    {
      type: 'key_item',
      subType: 'magnetic_boots',
      position: { x: -5, y: 5, z: -158 },
      value: 1,
      unlocks: ['metal_path_level10']
    }
  ],

  level10: [
    {
      type: 'powerup',
      subType: 'speed',
      position: { x: 5, y: 2, z: -20 },
      value: 1
    },
    {
      type: 'ammo',
      subType: 'bomb',
      position: { x: -7, y: 1.5, z: -40 },
      value: 4
    },
    {
      type: 'health',
      subType: 'small',
      position: { x: 9, y: 3, z: -60 },
      value: 25
    },
    {
      type: 'coin',
      position: { x: -3, y: 0.8, z: -80 },
      value: 11
    },
    {
      type: 'ammo',
      subType: 'shotgun',
      position: { x: 12, y: 2.5, z: -100 },
      value: 15
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: -8, y: 1, z: -120 },
      value: 50
    },
    {
      type: 'powerup',
      subType: 'damage',
      position: { x: 4, y: 4, z: -140 },
      value: 1
    },
    {
      type: 'upgrade',
      subType: 'reinforced_armor',
      position: { x: -10, y: 5, z: -160 },
      value: 1
    }
  ],

  level11: [
    {
      type: 'health',
      subType: 'large',
      position: { x: 0, y: 1, z: -25 },
      value: 50
    },
    {
      type: 'ammo',
      subType: 'rapidfire',
      position: { x: -6, y: 2, z: -45 },
      value: 50
    },
    {
      type: 'powerup',
      subType: 'accuracy',
      position: { x: 8, y: 3, z: -65 },
      value: 1
    },
    {
      type: 'coin',
      position: { x: -4, y: 0.8, z: -85 },
      value: 12
    },
    {
      type: 'ammo',
      subType: 'bomb',
      position: { x: 10, y: 4, z: -105 },
      value: 6
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: -7, y: 1, z: -125 },
      value: 50
    },
    {
      type: 'powerup',
      subType: 'speed',
      position: { x: 5, y: 2.5, z: -145 },
      value: 1
    },
    {
      type: 'powerup',
      subType: 'damage',
      position: { x: -9, y: 5, z: -165 },
      value: 1
    }
  ],

  level12: [
    {
      type: 'health',
      subType: 'large',
      position: { x: -5, y: 1, z: -15 },
      value: 50
    },
    {
      type: 'health',
      subType: 'large',
      position: { x: 5, y: 1, z: -35 },
      value: 50
    },
    {
      type: 'ammo',
      subType: 'shotgun',
      position: { x: -8, y: 2, z: -55 },
      value: 20
    },
    {
      type: 'ammo',
      subType: 'rapidfire',
      position: { x: 8, y: 2, z: -75 },
      value: 60
    },
    {
      type: 'ammo',
      subType: 'bomb',
      position: { x: 0, y: 3, z: -95 },
      value: 8
    },
    {
      type: 'powerup',
      subType: 'damage',
      position: { x: -10, y: 4, z: -115 },
      value: 1
    },
    {
      type: 'powerup',
      subType: 'accuracy',
      position: { x: 10, y: 4, z: -135 },
      value: 1
    },
    {
      type: 'powerup',
      subType: 'speed',
      position: { x: 0, y: 5, z: -155 },
      value: 1
    },
    {
      type: 'coin',
      position: { x: -6, y: 0.8, z: -175 },
      value: 15
    },
    {
      type: 'coin',
      position: { x: 6, y: 0.8, z: -195 },
      value: 15
    }
  ]
};

// Item type definitions with descriptions
export const ItemTypes = {
  HEALTH: {
    SMALL: { name: 'Health Pack', description: 'Restores 25 HP', color: 0x44ff44 },
    LARGE: { name: 'Large Health Pack', description: 'Restores 50 HP', color: 0x00ff00 }
  },
  
  AMMO: {
    SHOTGUN: { name: 'Shotgun Shells', description: 'Shotgun ammunition', color: 0xffaa00 },
    RAPIDFIRE: { name: 'Rapid Fire Ammo', description: 'High-capacity magazine', color: 0xff4400 },
    BOMB: { name: 'Bomb Pack', description: 'Explosive ammunition', color: 0x884444 }
  },
  
  POWERUP: {
    SPEED: { name: 'Speed Boost', description: '25% faster movement and reload', color: 0x00ffff },
    DAMAGE: { name: 'Damage Boost', description: '50% increased damage', color: 0xff0044 },
    ACCURACY: { name: 'Precision Boost', description: 'Improved accuracy and larger weak spots', color: 0x4400ff }
  },
  
  KEY_ITEM: {
    GLIDER: { name: 'Glider', description: 'Access to aerial paths', color: 0xffd700 },
    SCUBA_GEAR: { name: 'Scuba Gear', description: 'Access to underwater routes', color: 0x0088ff },
    NIGHT_VISION: { name: 'Night Vision', description: 'See hidden enemies and switches', color: 0x44ff88 },
    MAGNETIC_BOOTS: { name: 'Magnetic Boots', description: 'Walk on metal surfaces', color: 0x888888 }
  },
  
  UPGRADE: {
    ENHANCED_GRIP: { name: 'Enhanced Grip', description: 'Permanent 10% faster reload', color: 0xff44ff },
    REINFORCED_ARMOR: { name: 'Reinforced Armor', description: 'Permanent 5% damage reduction', color: 0x888888 },
    EAGLE_EYE: { name: 'Eagle Eye', description: 'Permanent larger weak spot hitboxes', color: 0xffff44 }
  },
  
  COIN: {
    name: 'Coin',
    description: 'Collectible currency for score',
    color: 0xffdd00
  }
};

// Helper function to get item config for a level
export function getLevelItems(levelNumber) {
  const levelKey = `level${levelNumber}`;
  return LevelItems[levelKey] || LevelItems.level1; // Default to level 1 if not found
}

// Helper function to get item type info
export function getItemTypeInfo(type, subType = null) {
  const typeCategory = ItemTypes[type.toUpperCase()];
  
  if (!typeCategory) {
    return { name: 'Unknown Item', description: '', color: 0xffffff };
  }
  
  if (subType && typeCategory[subType.toUpperCase()]) {
    return typeCategory[subType.toUpperCase()];
  }
  
  // Return the category info if it has name/description directly
  if (typeCategory.name) {
    return typeCategory;
  }
  
  // Return first item in category if no subType specified
  const firstKey = Object.keys(typeCategory)[0];
  return typeCategory[firstKey] || { name: 'Unknown Item', description: '', color: 0xffffff };
}

// Helper function to validate item configuration
export function validateItemConfig(items) {
  if (!Array.isArray(items)) {
    console.error('Item configuration must be an array');
    return false;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (!item.type) {
      console.error(`Missing item type at index ${i}`);
      return false;
    }
    
    if (!item.position || typeof item.position.x !== 'number' ||
        typeof item.position.y !== 'number' || typeof item.position.z !== 'number') {
      console.error(`Invalid position at item ${i}`);
      return false;
    }
    
    if (typeof item.value !== 'number' || item.value <= 0) {
      console.error(`Invalid value at item ${i}: ${item.value}`);
      return false;
    }
  }
  
  return true;
}

export default LevelItems;