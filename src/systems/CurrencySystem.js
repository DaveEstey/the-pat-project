/**
 * Currency System
 * Manages player currency (credits/coins) for upgrades and purchases
 * Persistent storage via localStorage
 */

export const CurrencyType = {
  CREDITS: 'credits',        // Main currency from kills/completion
  GEMS: 'gems',              // Premium currency from achievements
  SCRAP: 'scrap'             // Salvage from destructibles
};

export const CurrencySource = {
  ENEMY_KILL: 'enemy_kill',
  LEVEL_COMPLETE: 'level_complete',
  BOSS_DEFEAT: 'boss_defeat',
  ACHIEVEMENT: 'achievement',
  PUZZLE_SOLVE: 'puzzle_solve',
  SECRET_FOUND: 'secret_found',
  DESTRUCTIBLE: 'destructible',
  PICKUP: 'pickup'
};

class CurrencySystem {
  constructor() {
    this.currencies = {
      [CurrencyType.CREDITS]: 0,
      [CurrencyType.GEMS]: 0,
      [CurrencyType.SCRAP]: 0
    };

    this.earningMultiplier = 1.0;
    this.lifetimeEarnings = {
      [CurrencyType.CREDITS]: 0,
      [CurrencyType.GEMS]: 0,
      [CurrencyType.SCRAP]: 0
    };

    this.transactionHistory = [];
    this.maxHistoryLength = 100;

    this.loadFromStorage();

    console.log('[CurrencySystem] Initialized with:', this.currencies);
  }

  /**
   * Add currency
   */
  addCurrency(type, amount, source = CurrencySource.ENEMY_KILL) {
    if (!this.currencies.hasOwnProperty(type)) {
      console.error(`[CurrencySystem] Invalid currency type: ${type}`);
      return false;
    }

    // Apply multiplier
    const finalAmount = Math.floor(amount * this.earningMultiplier);

    this.currencies[type] += finalAmount;
    this.lifetimeEarnings[type] += finalAmount;

    // Record transaction
    this.recordTransaction({
      type: 'earn',
      currency: type,
      amount: finalAmount,
      source,
      timestamp: Date.now()
    });

    // Emit currency earned event
    window.dispatchEvent(new CustomEvent('currencyEarned', {
      detail: {
        currencyType: type,
        amount: finalAmount,
        total: this.currencies[type],
        source
      }
    }));

    this.saveToStorage();

    console.log(`[CurrencySystem] +${finalAmount} ${type} from ${source}. Total: ${this.currencies[type]}`);

    return true;
  }

  /**
   * Spend currency
   */
  spendCurrency(type, amount, purpose = 'upgrade') {
    if (!this.currencies.hasOwnProperty(type)) {
      console.error(`[CurrencySystem] Invalid currency type: ${type}`);
      return false;
    }

    if (this.currencies[type] < amount) {
      console.warn(`[CurrencySystem] Insufficient ${type}. Have: ${this.currencies[type]}, Need: ${amount}`);

      // Emit insufficient currency event
      window.dispatchEvent(new CustomEvent('currencyInsufficient', {
        detail: {
          currencyType: type,
          required: amount,
          current: this.currencies[type],
          shortfall: amount - this.currencies[type]
        }
      }));

      return false;
    }

    this.currencies[type] -= amount;

    // Record transaction
    this.recordTransaction({
      type: 'spend',
      currency: type,
      amount,
      purpose,
      timestamp: Date.now()
    });

    // Emit currency spent event
    window.dispatchEvent(new CustomEvent('currencySpent', {
      detail: {
        currencyType: type,
        amount,
        remaining: this.currencies[type],
        purpose
      }
    }));

    this.saveToStorage();

    console.log(`[CurrencySystem] -${amount} ${type} for ${purpose}. Remaining: ${this.currencies[type]}`);

    return true;
  }

  /**
   * Check if player can afford purchase
   */
  canAfford(type, amount) {
    return this.currencies[type] >= amount;
  }

  /**
   * Get currency balance
   */
  getBalance(type) {
    return this.currencies[type] || 0;
  }

  /**
   * Get all balances
   */
  getAllBalances() {
    return { ...this.currencies };
  }

  /**
   * Get lifetime earnings
   */
  getLifetimeEarnings(type) {
    return this.lifetimeEarnings[type] || 0;
  }

  /**
   * Set earning multiplier (from perks, NG+, etc.)
   */
  setEarningMultiplier(multiplier) {
    this.earningMultiplier = Math.max(0.1, multiplier);
    console.log(`[CurrencySystem] Earning multiplier set to ${this.earningMultiplier}x`);
  }

  /**
   * Award currency based on enemy kill
   */
  awardEnemyKill(enemyType, multiplier = 1.0) {
    const baseRewards = {
      'basic_shooter': 10,
      'armored_enemy': 20,
      'ninja': 15,
      'bomb_thrower': 18,
      'fast_debuffer': 12,
      'boss': 500
    };

    const baseAmount = baseRewards[enemyType] || 10;
    const amount = Math.floor(baseAmount * multiplier);

    this.addCurrency(CurrencyType.CREDITS, amount, CurrencySource.ENEMY_KILL);

    // Chance for scrap drop
    if (Math.random() < 0.3) {
      this.addCurrency(CurrencyType.SCRAP, Math.floor(amount * 0.2), CurrencySource.ENEMY_KILL);
    }
  }

  /**
   * Award currency for level completion
   */
  awardLevelCompletion(levelNumber, performance = 1.0) {
    const baseAmount = 100 + (levelNumber * 50);
    const amount = Math.floor(baseAmount * performance);

    this.addCurrency(CurrencyType.CREDITS, amount, CurrencySource.LEVEL_COMPLETE);

    // Bonus gems for excellent performance
    if (performance >= 1.5) {
      this.addCurrency(CurrencyType.GEMS, 5, CurrencySource.LEVEL_COMPLETE);
    }
  }

  /**
   * Award currency for boss defeat
   */
  awardBossDefeat(bossType, levelNumber) {
    const baseAmount = 500;
    const levelBonus = levelNumber * 100;
    const total = baseAmount + levelBonus;

    this.addCurrency(CurrencyType.CREDITS, total, CurrencySource.BOSS_DEFEAT);
    this.addCurrency(CurrencyType.GEMS, 10, CurrencySource.BOSS_DEFEAT);
  }

  /**
   * Award currency for achievement
   */
  awardAchievement(achievementPoints) {
    this.addCurrency(CurrencyType.GEMS, achievementPoints, CurrencySource.ACHIEVEMENT);
  }

  /**
   * Award currency for puzzle completion
   */
  awardPuzzleSolve(difficulty, timeBonus = 1.0) {
    const baseAmounts = {
      easy: 25,
      medium: 50,
      hard: 100
    };

    const amount = Math.floor((baseAmounts[difficulty] || 25) * timeBonus);
    this.addCurrency(CurrencyType.CREDITS, amount, CurrencySource.PUZZLE_SOLVE);
  }

  /**
   * Record transaction in history
   */
  recordTransaction(transaction) {
    this.transactionHistory.unshift(transaction);

    // Limit history length
    if (this.transactionHistory.length > this.maxHistoryLength) {
      this.transactionHistory = this.transactionHistory.slice(0, this.maxHistoryLength);
    }
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(limit = 10) {
    return this.transactionHistory.slice(0, limit);
  }

  /**
   * Get spending by category
   */
  getSpendingByCategory() {
    const spending = {};

    this.transactionHistory
      .filter(t => t.type === 'spend')
      .forEach(t => {
        if (!spending[t.purpose]) {
          spending[t.purpose] = 0;
        }
        spending[t.purpose] += t.amount;
      });

    return spending;
  }

  /**
   * Save to localStorage
   */
  saveToStorage() {
    const saveData = {
      currencies: this.currencies,
      lifetimeEarnings: this.lifetimeEarnings,
      transactionHistory: this.transactionHistory,
      lastSaved: Date.now()
    };

    try {
      localStorage.setItem('currencySystem', JSON.stringify(saveData));
    } catch (error) {
      console.error('[CurrencySystem] Failed to save:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const savedData = localStorage.getItem('currencySystem');
      if (savedData) {
        const data = JSON.parse(savedData);

        this.currencies = data.currencies || this.currencies;
        this.lifetimeEarnings = data.lifetimeEarnings || this.lifetimeEarnings;
        this.transactionHistory = data.transactionHistory || this.transactionHistory;

        console.log('[CurrencySystem] Loaded from storage:', this.currencies);
      }
    } catch (error) {
      console.error('[CurrencySystem] Failed to load:', error);
    }
  }

  /**
   * Reset all currency (for new game)
   */
  resetCurrency() {
    this.currencies = {
      [CurrencyType.CREDITS]: 0,
      [CurrencyType.GEMS]: 0,
      [CurrencyType.SCRAP]: 0
    };

    this.transactionHistory = [];

    this.saveToStorage();

    console.log('[CurrencySystem] Currency reset');
  }

  /**
   * Debug: Add currency for testing
   */
  debugAddCurrency(type, amount) {
    if (!this.currencies.hasOwnProperty(type)) {
      console.error(`[CurrencySystem] Invalid currency type: ${type}`);
      return;
    }

    this.currencies[type] += amount;
    this.saveToStorage();

    console.log(`[CurrencySystem] DEBUG: Added ${amount} ${type}. Total: ${this.currencies[type]}`);
  }

  /**
   * Export currency data
   */
  exportData() {
    return {
      currencies: { ...this.currencies },
      lifetimeEarnings: { ...this.lifetimeEarnings },
      transactionHistory: [...this.transactionHistory],
      earningMultiplier: this.earningMultiplier
    };
  }

  /**
   * Import currency data
   */
  importData(data) {
    if (data.currencies) this.currencies = { ...data.currencies };
    if (data.lifetimeEarnings) this.lifetimeEarnings = { ...data.lifetimeEarnings };
    if (data.transactionHistory) this.transactionHistory = [...data.transactionHistory];
    if (data.earningMultiplier) this.earningMultiplier = data.earningMultiplier;

    this.saveToStorage();

    console.log('[CurrencySystem] Imported currency data');
  }

  /**
   * Clean up
   */
  cleanup() {
    this.saveToStorage();
    console.log('[CurrencySystem] Cleaned up');
  }
}

// Singleton instance
let currencySystemInstance = null;

export function initializeCurrencySystem() {
  if (currencySystemInstance) {
    console.warn('[CurrencySystem] Already initialized');
    return currencySystemInstance;
  }

  currencySystemInstance = new CurrencySystem();
  return currencySystemInstance;
}

export function getCurrencySystem() {
  if (!currencySystemInstance) {
    console.warn('[CurrencySystem] Not initialized, creating new instance');
    return initializeCurrencySystem();
  }
  return currencySystemInstance;
}

export default CurrencySystem;
