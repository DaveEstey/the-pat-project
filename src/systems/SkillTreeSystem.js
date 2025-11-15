/**
 * Skill Tree System
 * Three skill trees: Combat, Survival, Utility
 * Unlock skills with skill points earned from leveling up
 */

export const SkillTree = {
  COMBAT: 'combat',
  SURVIVAL: 'survival',
  UTILITY: 'utility'
};

export const SkillTier = {
  BASIC: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  MASTER: 4,
  ULTIMATE: 5
};

class SkillTreeSystem {
  constructor() {
    this.skillPoints = 0;
    this.unlockedSkills = new Set();
    this.activeSkills = new Map(); // skillId -> level
    this.skills = new Map(); // skillId -> skill data

    this.initializeSkillTrees();
    this.loadFromStorage();

    console.log('[SkillTreeSystem] Initialized with', this.skillPoints, 'skill points');
  }

  /**
   * Initialize all skill trees
   */
  initializeSkillTrees() {
    // COMBAT TREE
    this.addSkill({
      id: 'combat_damage_1',
      name: 'Sharpshooter I',
      description: '+10% weapon damage',
      tree: SkillTree.COMBAT,
      tier: SkillTier.BASIC,
      maxLevel: 3,
      cost: 1,
      prerequisites: [],
      effects: {
        damageMultiplier: 0.1
      }
    });

    this.addSkill({
      id: 'combat_damage_2',
      name: 'Sharpshooter II',
      description: '+15% weapon damage',
      tree: SkillTree.COMBAT,
      tier: SkillTier.INTERMEDIATE,
      maxLevel: 3,
      cost: 2,
      prerequisites: ['combat_damage_1'],
      effects: {
        damageMultiplier: 0.15
      }
    });

    this.addSkill({
      id: 'combat_crit',
      name: 'Critical Strike',
      description: '+20% critical hit chance',
      tree: SkillTree.COMBAT,
      tier: SkillTier.BASIC,
      maxLevel: 5,
      cost: 1,
      prerequisites: [],
      effects: {
        critChance: 0.20
      }
    });

    this.addSkill({
      id: 'combat_crit_damage',
      name: 'Deadly Precision',
      description: 'Critical hits deal 50% more damage',
      tree: SkillTree.COMBAT,
      tier: SkillTier.INTERMEDIATE,
      maxLevel: 1,
      cost: 2,
      prerequisites: ['combat_crit'],
      effects: {
        critDamageMultiplier: 0.5
      }
    });

    this.addSkill({
      id: 'combat_reload',
      name: 'Quick Reload',
      description: '-20% reload time',
      tree: SkillTree.COMBAT,
      tier: SkillTier.BASIC,
      maxLevel: 3,
      cost: 1,
      prerequisites: [],
      effects: {
        reloadSpeedBonus: 0.20
      }
    });

    this.addSkill({
      id: 'combat_magazine',
      name: 'Extended Mags',
      description: '+30% magazine capacity',
      tree: SkillTree.COMBAT,
      tier: SkillTier.INTERMEDIATE,
      maxLevel: 2,
      cost: 2,
      prerequisites: ['combat_reload'],
      effects: {
        magazineBonus: 0.30
      }
    });

    this.addSkill({
      id: 'combat_headshot',
      name: 'Headhunter',
      description: '+50% headshot damage',
      tree: SkillTree.COMBAT,
      tier: SkillTier.ADVANCED,
      maxLevel: 1,
      cost: 3,
      prerequisites: ['combat_damage_2', 'combat_crit_damage'],
      effects: {
        headshotMultiplier: 0.5
      }
    });

    this.addSkill({
      id: 'combat_ultimate',
      name: 'Bullet Time',
      description: 'Slow time for 3 seconds after a kill streak',
      tree: SkillTree.COMBAT,
      tier: SkillTier.ULTIMATE,
      maxLevel: 1,
      cost: 5,
      prerequisites: ['combat_headshot'],
      effects: {
        bulletTimeOnStreak: true,
        bulletTimeDuration: 3000
      }
    });

    // SURVIVAL TREE
    this.addSkill({
      id: 'survival_health_1',
      name: 'Vitality I',
      description: '+20 max health',
      tree: SkillTree.SURVIVAL,
      tier: SkillTier.BASIC,
      maxLevel: 5,
      cost: 1,
      prerequisites: [],
      effects: {
        maxHealthBonus: 20
      }
    });

    this.addSkill({
      id: 'survival_health_2',
      name: 'Vitality II',
      description: '+30 max health',
      tree: SkillTree.SURVIVAL,
      tier: SkillTier.INTERMEDIATE,
      maxLevel: 3,
      cost: 2,
      prerequisites: ['survival_health_1'],
      effects: {
        maxHealthBonus: 30
      }
    });

    this.addSkill({
      id: 'survival_regen',
      name: 'Regeneration',
      description: 'Regenerate 1 HP per second',
      tree: SkillTree.SURVIVAL,
      tier: SkillTier.BASIC,
      maxLevel: 3,
      cost: 1,
      prerequisites: [],
      effects: {
        healthRegenPerSecond: 1
      }
    });

    this.addSkill({
      id: 'survival_armor',
      name: 'Armor Plating',
      description: '-10% damage taken',
      tree: SkillTree.SURVIVAL,
      tier: SkillTier.INTERMEDIATE,
      maxLevel: 5,
      cost: 2,
      prerequisites: ['survival_health_1'],
      effects: {
        damageReduction: 0.10
      }
    });

    this.addSkill({
      id: 'survival_dodge',
      name: 'Evasion',
      description: '-30% dodge roll cooldown',
      tree: SkillTree.SURVIVAL,
      tier: SkillTier.BASIC,
      maxLevel: 2,
      cost: 1,
      prerequisites: [],
      effects: {
        dodgeCooldownReduction: 0.30
      }
    });

    this.addSkill({
      id: 'survival_dodge_distance',
      name: 'Long Dive',
      description: '+40% dodge distance',
      tree: SkillTree.SURVIVAL,
      tier: SkillTier.INTERMEDIATE,
      maxLevel: 1,
      cost: 2,
      prerequisites: ['survival_dodge'],
      effects: {
        dodgeDistanceBonus: 0.40
      }
    });

    this.addSkill({
      id: 'survival_last_stand',
      name: 'Last Stand',
      description: 'Survive lethal damage once per level with 1 HP',
      tree: SkillTree.SURVIVAL,
      tier: SkillTier.ADVANCED,
      maxLevel: 1,
      cost: 3,
      prerequisites: ['survival_health_2', 'survival_armor'],
      effects: {
        lastStandActive: true
      }
    });

    this.addSkill({
      id: 'survival_ultimate',
      name: 'Phoenix',
      description: 'Revive with full health after death (once per game)',
      tree: SkillTree.SURVIVAL,
      tier: SkillTier.ULTIMATE,
      maxLevel: 1,
      cost: 5,
      prerequisites: ['survival_last_stand'],
      effects: {
        phoenixRevive: true
      }
    });

    // UTILITY TREE
    this.addSkill({
      id: 'utility_currency',
      name: 'Scavenger',
      description: '+20% currency gained',
      tree: SkillTree.UTILITY,
      tier: SkillTier.BASIC,
      maxLevel: 5,
      cost: 1,
      prerequisites: [],
      effects: {
        currencyBonus: 0.20
      }
    });

    this.addSkill({
      id: 'utility_ammo',
      name: 'Ammo Cache',
      description: '+30% ammo drops',
      tree: SkillTree.UTILITY,
      tier: SkillTier.BASIC,
      maxLevel: 3,
      cost: 1,
      prerequisites: [],
      effects: {
        ammoDropBonus: 0.30
      }
    });

    this.addSkill({
      id: 'utility_movement',
      name: 'Sprint',
      description: '+15% movement speed',
      tree: SkillTree.UTILITY,
      tier: SkillTier.BASIC,
      maxLevel: 3,
      cost: 1,
      prerequisites: [],
      effects: {
        movementSpeedBonus: 0.15
      }
    });

    this.addSkill({
      id: 'utility_grapple',
      name: 'Enhanced Grapple',
      description: '-50% grapple cooldown',
      tree: SkillTree.UTILITY,
      tier: SkillTier.INTERMEDIATE,
      maxLevel: 1,
      cost: 2,
      prerequisites: ['utility_movement'],
      effects: {
        grappleCooldownReduction: 0.50
      }
    });

    this.addSkill({
      id: 'utility_xp',
      name: 'Fast Learner',
      description: '+25% XP gained',
      tree: SkillTree.UTILITY,
      tier: SkillTier.INTERMEDIATE,
      maxLevel: 3,
      cost: 2,
      prerequisites: ['utility_currency'],
      effects: {
        xpBonus: 0.25
      }
    });

    this.addSkill({
      id: 'utility_scanner',
      name: 'Tactical Scanner',
      description: 'Reveal enemies on minimap',
      tree: SkillTree.UTILITY,
      tier: SkillTier.ADVANCED,
      maxLevel: 1,
      cost: 3,
      prerequisites: ['utility_xp'],
      effects: {
        enemyScannerActive: true
      }
    });

    this.addSkill({
      id: 'utility_treasure',
      name: 'Treasure Hunter',
      description: 'Reveal secrets and collectibles',
      tree: SkillTree.UTILITY,
      tier: SkillTier.ADVANCED,
      maxLevel: 1,
      cost: 3,
      prerequisites: ['utility_scanner'],
      effects: {
        treasureRadar: true
      }
    });

    this.addSkill({
      id: 'utility_ultimate',
      name: 'Mastermind',
      description: 'Double skill points gained from levels',
      tree: SkillTree.UTILITY,
      tier: SkillTier.ULTIMATE,
      maxLevel: 1,
      cost: 5,
      prerequisites: ['utility_treasure'],
      effects: {
        doubleSkillPoints: true
      }
    });

    console.log(`[SkillTreeSystem] Loaded ${this.skills.size} skills`);
  }

  /**
   * Add skill to skill tree
   */
  addSkill(skillData) {
    this.skills.set(skillData.id, {
      ...skillData,
      currentLevel: 0
    });
  }

  /**
   * Check if skill can be unlocked
   */
  canUnlockSkill(skillId) {
    const skill = this.skills.get(skillId);
    if (!skill) return { canUnlock: false, reason: 'Skill not found' };

    // Check if already max level
    const currentLevel = this.activeSkills.get(skillId) || 0;
    if (currentLevel >= skill.maxLevel) {
      return { canUnlock: false, reason: 'Max level reached' };
    }

    // Check skill points
    if (this.skillPoints < skill.cost) {
      return { canUnlock: false, reason: 'Insufficient skill points' };
    }

    // Check prerequisites
    for (const prereqId of skill.prerequisites) {
      if (!this.unlockedSkills.has(prereqId)) {
        const prereqSkill = this.skills.get(prereqId);
        return {
          canUnlock: false,
          reason: `Requires: ${prereqSkill?.name || prereqId}`
        };
      }
    }

    return { canUnlock: true };
  }

  /**
   * Unlock skill
   */
  unlockSkill(skillId) {
    const canUnlock = this.canUnlockSkill(skillId);
    if (!canUnlock.canUnlock) {
      console.warn(`[SkillTreeSystem] Cannot unlock ${skillId}:`, canUnlock.reason);
      return false;
    }

    const skill = this.skills.get(skillId);
    const currentLevel = this.activeSkills.get(skillId) || 0;

    // Spend skill points
    this.skillPoints -= skill.cost;

    // Increase skill level
    const newLevel = currentLevel + 1;
    this.activeSkills.set(skillId, newLevel);
    this.unlockedSkills.add(skillId);

    // Update skill data
    skill.currentLevel = newLevel;

    // Emit skill unlocked event
    window.dispatchEvent(new CustomEvent('skillUnlocked', {
      detail: {
        skillId,
        skillName: skill.name,
        level: newLevel,
        maxLevel: skill.maxLevel,
        effects: skill.effects
      }
    }));

    this.saveToStorage();

    console.log(`[SkillTreeSystem] Unlocked ${skill.name} (Level ${newLevel}/${skill.maxLevel})`);

    return true;
  }

  /**
   * Get active effects from all unlocked skills
   */
  getActiveEffects() {
    const effects = {
      damageMultiplier: 1.0,
      critChance: 0,
      critDamageMultiplier: 1.0,
      reloadSpeedBonus: 0,
      magazineBonus: 0,
      headshotMultiplier: 1.0,
      maxHealthBonus: 0,
      healthRegenPerSecond: 0,
      damageReduction: 0,
      dodgeCooldownReduction: 0,
      dodgeDistanceBonus: 0,
      currencyBonus: 0,
      ammoDropBonus: 0,
      movementSpeedBonus: 0,
      grappleCooldownReduction: 0,
      xpBonus: 0,
      bulletTimeOnStreak: false,
      lastStandActive: false,
      phoenixRevive: false,
      enemyScannerActive: false,
      treasureRadar: false,
      doubleSkillPoints: false
    };

    // Accumulate effects from all unlocked skills
    this.unlockedSkills.forEach(skillId => {
      const skill = this.skills.get(skillId);
      const level = this.activeSkills.get(skillId) || 1;

      Object.entries(skill.effects).forEach(([key, value]) => {
        if (typeof value === 'number') {
          effects[key] += value * level;
        } else if (typeof value === 'boolean') {
          effects[key] = value;
        }
      });
    });

    return effects;
  }

  /**
   * Award skill points
   */
  awardSkillPoints(amount) {
    this.skillPoints += amount;

    window.dispatchEvent(new CustomEvent('skillPointsAwarded', {
      detail: {
        amount,
        total: this.skillPoints
      }
    }));

    this.saveToStorage();

    console.log(`[SkillTreeSystem] +${amount} skill points. Total: ${this.skillPoints}`);
  }

  /**
   * Get skill data
   */
  getSkill(skillId) {
    return this.skills.get(skillId);
  }

  /**
   * Get all skills in a tree
   */
  getSkillsByTree(tree) {
    return Array.from(this.skills.values()).filter(s => s.tree === tree);
  }

  /**
   * Get skills by tier
   */
  getSkillsByTier(tree, tier) {
    return this.getSkillsByTree(tree).filter(s => s.tier === tier);
  }

  /**
   * Reset skill tree (refund all points)
   */
  resetSkillTree(tree = null) {
    let refundedPoints = 0;

    if (tree) {
      // Reset specific tree
      const treeSkills = this.getSkillsByTree(tree);
      treeSkills.forEach(skill => {
        const level = this.activeSkills.get(skill.id) || 0;
        refundedPoints += skill.cost * level;
        this.activeSkills.delete(skill.id);
        this.unlockedSkills.delete(skill.id);
        skill.currentLevel = 0;
      });
    } else {
      // Reset all trees
      this.activeSkills.forEach((level, skillId) => {
        const skill = this.skills.get(skillId);
        refundedPoints += skill.cost * level;
        skill.currentLevel = 0;
      });
      this.activeSkills.clear();
      this.unlockedSkills.clear();
    }

    this.skillPoints += refundedPoints;

    this.saveToStorage();

    console.log(`[SkillTreeSystem] Reset ${tree || 'all trees'}. Refunded ${refundedPoints} skill points`);

    window.dispatchEvent(new CustomEvent('skillTreeReset', {
      detail: { tree, refundedPoints }
    }));
  }

  /**
   * Save to localStorage
   */
  saveToStorage() {
    const saveData = {
      skillPoints: this.skillPoints,
      unlockedSkills: Array.from(this.unlockedSkills),
      activeSkills: Array.from(this.activeSkills.entries()),
      lastSaved: Date.now()
    };

    try {
      localStorage.setItem('skillTreeSystem', JSON.stringify(saveData));
    } catch (error) {
      console.error('[SkillTreeSystem] Failed to save:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const savedData = localStorage.getItem('skillTreeSystem');
      if (savedData) {
        const data = JSON.parse(savedData);

        this.skillPoints = data.skillPoints || 0;
        this.unlockedSkills = new Set(data.unlockedSkills || []);
        this.activeSkills = new Map(data.activeSkills || []);

        // Update skill current levels
        this.activeSkills.forEach((level, skillId) => {
          const skill = this.skills.get(skillId);
          if (skill) {
            skill.currentLevel = level;
          }
        });

        console.log('[SkillTreeSystem] Loaded from storage');
      }
    } catch (error) {
      console.error('[SkillTreeSystem] Failed to load:', error);
    }
  }

  /**
   * Export skill tree data
   */
  exportData() {
    return {
      skillPoints: this.skillPoints,
      unlockedSkills: Array.from(this.unlockedSkills),
      activeSkills: Array.from(this.activeSkills.entries())
    };
  }

  /**
   * Import skill tree data
   */
  importData(data) {
    if (data.skillPoints !== undefined) this.skillPoints = data.skillPoints;
    if (data.unlockedSkills) this.unlockedSkills = new Set(data.unlockedSkills);
    if (data.activeSkills) this.activeSkills = new Map(data.activeSkills);

    this.saveToStorage();

    console.log('[SkillTreeSystem] Imported skill tree data');
  }

  /**
   * Clean up
   */
  cleanup() {
    this.saveToStorage();
    console.log('[SkillTreeSystem] Cleaned up');
  }
}

// Singleton instance
let skillTreeSystemInstance = null;

export function initializeSkillTreeSystem() {
  if (skillTreeSystemInstance) {
    console.warn('[SkillTreeSystem] Already initialized');
    return skillTreeSystemInstance;
  }

  skillTreeSystemInstance = new SkillTreeSystem();
  return skillTreeSystemInstance;
}

export function getSkillTreeSystem() {
  if (!skillTreeSystemInstance) {
    console.warn('[SkillTreeSystem] Not initialized, creating new instance');
    return initializeSkillTreeSystem();
  }
  return skillTreeSystemInstance;
}

export default SkillTreeSystem;
