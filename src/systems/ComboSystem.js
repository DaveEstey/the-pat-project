/**
 * Combo System - Kill streak tracking with damage/score multipliers
 *
 * Features:
 * - Kill streak tracking with time windows
 * - Damage multipliers that scale with combo
 * - Score multipliers for high combos
 * - Combo breaking on taking damage
 * - Visual feedback for combo milestones
 * - Combo decay after timeout
 */

export class ComboSystem {
  constructor() {
    this.combo = 0;
    this.maxCombo = 0;
    this.lastHitTime = 0;
    this.lastKillTime = 0;
    this.comboTimeout = 5000; // 5 seconds to maintain combo (increased from 3s)
    this.multiplier = 1.0;
    this.damageMultiplier = 1.0;

    // Updated combo thresholds with damage bonuses
    this.comboThresholds = [
      { kills: 3,  scoreMultiplier: 1.25, damageBonus: 0.1,  name: 'STREAK!',       color: 0xffff00 },
      { kills: 5,  scoreMultiplier: 1.5,  damageBonus: 0.25, name: 'RAMPAGE!',      color: 0xff8800 },
      { kills: 10, scoreMultiplier: 2.0,  damageBonus: 0.5,  name: 'UNSTOPPABLE!',  color: 0xff4400 },
      { kills: 15, scoreMultiplier: 2.5,  damageBonus: 0.75, name: 'GODLIKE!',      color: 0xff0088 },
      { kills: 25, scoreMultiplier: 3.5,  damageBonus: 1.0,  name: 'LEGENDARY!',    color: 0xff00ff },
      { kills: 50, scoreMultiplier: 5.0,  damageBonus: 1.5,  name: 'UNTOUCHABLE!',  color: 0xffffff }
    ];

    this.listeners = [];

    // Stats tracking
    this.totalKills = 0;
    this.comboBroken = 0;
    this.highestComboEver = 0;

    // Upgrade options
    this.preserveOnDamage = false;
    this.partialComboLoss = false;
  }

  /**
   * Register a kill (enemy killed)
   */
  registerKill() {
    const currentTime = Date.now();
    const timeSinceLastKill = currentTime - this.lastKillTime;

    // Reset combo if too much time has passed
    if (this.lastKillTime > 0 && timeSinceLastKill > this.comboTimeout) {
      this.resetCombo();
    }

    // Increment combo and total kills
    this.combo++;
    this.totalKills++;
    this.lastKillTime = currentTime;
    this.lastHitTime = currentTime;

    // Update max combo
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // Update all-time high
    if (this.combo > this.highestComboEver) {
      this.highestComboEver = this.combo;
    }

    // Update multipliers based on combo
    this.updateMultiplier();

    // Check for milestone
    const milestone = this.checkMilestone();
    if (milestone) {
      this.notifyListeners('milestone', {
        combo: this.combo,
        scoreMultiplier: this.multiplier,
        damageMultiplier: this.damageMultiplier,
        name: milestone.name,
        color: milestone.color
      });

      // Emit event for UI
      this.emitComboEvent('comboMilestone', {
        combo: this.combo,
        name: milestone.name,
        color: milestone.color
      });
    }

    this.notifyListeners('kill', {
      combo: this.combo,
      scoreMultiplier: this.multiplier,
      damageMultiplier: this.damageMultiplier,
      timeSinceLastKill
    });

    // Emit event for UI
    this.emitComboEvent('killRegistered', {
      combo: this.combo,
      scoreMultiplier: this.multiplier,
      damageMultiplier: this.damageMultiplier
    });

    return {
      combo: this.combo,
      scoreMultiplier: this.multiplier,
      damageMultiplier: this.damageMultiplier,
      milestone: milestone
    };
  }

  /**
   * Register a hit (successful enemy damage) - for backwards compatibility
   */
  registerHit() {
    return this.registerKill();
  }

  /**
   * Register a miss (shot that didn't hit anything)
   */
  registerMiss() {
    if (this.combo > 0) {
      this.notifyListeners('break', {
        combo: this.combo,
        maxCombo: this.maxCombo
      });
    }

    this.resetCombo();
  }

  /**
   * Update multipliers based on current combo
   */
  updateMultiplier() {
    let newScoreMultiplier = 1.0;
    let newDamageBonus = 0.0;

    // Find the highest threshold we've passed
    for (let i = this.comboThresholds.length - 1; i >= 0; i--) {
      if (this.combo >= this.comboThresholds[i].kills) {
        newScoreMultiplier = this.comboThresholds[i].scoreMultiplier;
        newDamageBonus = this.comboThresholds[i].damageBonus;
        break;
      }
    }

    this.multiplier = newScoreMultiplier;
    this.damageMultiplier = 1.0 + newDamageBonus;
  }

  /**
   * Check if we've hit a combo milestone
   */
  checkMilestone() {
    for (const threshold of this.comboThresholds) {
      if (this.combo === threshold.kills) {
        return threshold;
      }
    }
    return null;
  }

  /**
   * Reset combo to zero
   */
  resetCombo() {
    if (this.combo > 0) {
      this.comboBroken++;
    }

    this.combo = 0;
    this.multiplier = 1.0;
    this.damageMultiplier = 1.0;
    this.notifyListeners('reset', {});

    // Emit event for UI
    this.emitComboEvent('comboBroken', {
      reason: 'timeout'
    });
  }

  /**
   * Called when player takes damage - may break combo
   */
  onPlayerDamaged(damage) {
    if (this.combo === 0) return;

    // Check if preserve upgrade is active
    if (this.preserveOnDamage) {
      this.emitComboEvent('comboPreserved', { combo: this.combo });
      return;
    }

    // Check if partial loss upgrade is active
    if (this.partialComboLoss) {
      const lostCombo = Math.floor(this.combo / 2);
      this.combo = Math.floor(this.combo / 2);
      this.updateMultiplier();

      this.emitComboEvent('comboPartialLoss', {
        lost: lostCombo,
        remaining: this.combo
      });
    } else {
      // Full combo break
      const brokenCombo = this.combo;
      this.combo = 0;
      this.multiplier = 1.0;
      this.damageMultiplier = 1.0;
      this.comboBroken++;

      this.emitComboEvent('comboBroken', {
        reason: 'damage',
        brokenCombo
      });
    }
  }

  /**
   * Get current combo state
   */
  getComboState() {
    const tier = this.getCurrentTier();
    return {
      combo: this.combo,
      maxCombo: this.maxCombo,
      scoreMultiplier: this.multiplier,
      damageMultiplier: this.damageMultiplier,
      isActive: this.combo > 0,
      tierName: tier ? tier.name : null,
      tierColor: tier ? tier.color : 0xffffff,
      timeRemaining: this.getRemainingTime(),
      timerProgress: this.getTimerProgress()
    };
  }

  /**
   * Get damage multiplier from combo
   */
  getDamageMultiplier() {
    return this.damageMultiplier;
  }

  /**
   * Get current tier
   */
  getCurrentTier() {
    for (let i = this.comboThresholds.length - 1; i >= 0; i--) {
      if (this.combo >= this.comboThresholds[i].kills) {
        return this.comboThresholds[i];
      }
    }
    return null;
  }

  /**
   * Get combo color based on current tier
   */
  getComboColor() {
    const tier = this.getCurrentTier();
    return tier ? tier.color : 0xffffff;
  }

  /**
   * Calculate score with combo multiplier
   */
  calculateScore(basePoints) {
    return Math.floor(basePoints * this.multiplier);
  }

  /**
   * Get combo remaining time before reset
   */
  getRemainingTime() {
    if (this.combo === 0 || this.lastHitTime === 0) {
      return 0;
    }

    const elapsed = Date.now() - this.lastHitTime;
    const remaining = Math.max(0, this.comboTimeout - elapsed);
    return remaining;
  }

  /**
   * Get combo progress percentage (0-100)
   */
  getComboProgress() {
    const remaining = this.getRemainingTime();
    return (remaining / this.comboTimeout) * 100;
  }

  /**
   * Get combo timer progress (0.0-1.0)
   */
  getTimerProgress() {
    const remaining = this.getRemainingTime();
    return remaining / this.comboTimeout;
  }

  /**
   * Update combo system (call every frame to check timeout)
   */
  update() {
    if (this.combo > 0) {
      const remaining = this.getRemainingTime();

      if (remaining <= 0) {
        this.resetCombo();
      }
    }
  }

  /**
   * Subscribe to combo events
   */
  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  /**
   * Notify all listeners of an event
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event || listener.event === '*') {
        listener.callback(data);
      }
    });
  }

  /**
   * Emit combo events for UI
   */
  emitComboEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: data
    }));
  }

  /**
   * Get next milestone info
   */
  getNextMilestone() {
    for (const threshold of this.comboThresholds) {
      if (this.combo < threshold.kills) {
        return {
          kills: threshold.kills,
          remaining: threshold.kills - this.combo,
          name: threshold.name,
          scoreMultiplier: threshold.scoreMultiplier,
          damageBonus: threshold.damageBonus
        };
      }
    }
    return null; // Already at max milestone
  }

  /**
   * Reset max combo (for new level/session)
   */
  resetMaxCombo() {
    this.maxCombo = 0;
  }

  /**
   * Get combo statistics for end-of-level summary
   */
  getStats() {
    return {
      maxCombo: this.maxCombo,
      currentCombo: this.combo,
      totalKills: this.totalKills,
      comboBroken: this.comboBroken,
      highestComboEver: this.highestComboEver,
      highestScoreMultiplier: this.maxCombo > 0
        ? this.comboThresholds.reduce((max, threshold) => {
            return this.maxCombo >= threshold.kills ? threshold.scoreMultiplier : max;
          }, 1.0)
        : 1.0,
      highestDamageMultiplier: this.maxCombo > 0
        ? this.comboThresholds.reduce((max, threshold) => {
            return this.maxCombo >= threshold.kills ? (1.0 + threshold.damageBonus) : max;
          }, 1.0)
        : 1.0
    };
  }

  /**
   * Unlock an upgrade
   */
  unlockUpgrade(upgradeType) {
    switch (upgradeType) {
      case 'preserveOnDamage':
        this.preserveOnDamage = true;
        break;
      case 'partialComboLoss':
        this.partialComboLoss = true;
        break;
      case 'longerTimeout':
        this.comboTimeout = 7500; // 7.5 seconds
        break;
      case 'higherMultipliers':
        // Increase all bonuses by 25%
        this.comboThresholds.forEach(tier => {
          tier.damageBonus *= 1.25;
          tier.scoreMultiplier *= 1.25;
        });
        break;
    }

    this.emitComboEvent('comboUpgradeUnlocked', { upgrade: upgradeType });
  }
}

// Singleton instance
let comboSystemInstance = null;

export function getComboSystem() {
  if (!comboSystemInstance) {
    comboSystemInstance = new ComboSystem();
  }
  return comboSystemInstance;
}

export default ComboSystem;
