/**
 * Survival Mode System
 * Endless waves with progressive difficulty
 */

let survivalSystemInstance = null;

export function initializeSurvivalMode(gameEngine) {
  if (survivalSystemInstance) {
    return survivalSystemInstance;
  }
  survivalSystemInstance = new SurvivalModeSystem(gameEngine);
  return survivalSystemInstance;
}

export function getSurvivalMode() {
  return survivalSystemInstance;
}

export class SurvivalModeSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.isActive = false;
    this.currentWave = 0;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;
    this.waveInProgress = false;
    this.timeBetweenWaves = 15000; // 15 seconds
    this.nextWaveTime = 0;
    this.totalScore = 0;
    this.startTime = 0;
    this.survivalTime = 0;
    this.highestWave = 0;
  }

  /**
   * Start survival mode
   */
  start() {
    this.isActive = true;
    this.currentWave = 0;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;
    this.waveInProgress = false;
    this.totalScore = 0;
    this.startTime = Date.now();
    this.survivalTime = 0;

    this.startNextWave();

    window.dispatchEvent(new CustomEvent('survivalModeStarted'));
    console.log('[SurvivalMode] Started');
  }

  /**
   * Start next wave
   */
  startNextWave() {
    if (!this.isActive) return;

    this.currentWave++;
    this.waveInProgress = true;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;

    const waveConfig = this.getWaveConfig(this.currentWave);

    window.dispatchEvent(new CustomEvent('survivalWaveStarted', {
      detail: {
        wave: this.currentWave,
        enemyCount: waveConfig.enemyCount,
        difficulty: waveConfig.difficulty
      }
    }));

    // Spawn enemies for this wave
    this.spawnWaveEnemies(waveConfig);

    console.log(`[SurvivalMode] Wave ${this.currentWave} started: ${waveConfig.enemyCount} enemies`);
  }

  /**
   * Get wave configuration
   */
  getWaveConfig(waveNumber) {
    const baseEnemies = 5;
    const enemyIncrease = Math.floor(waveNumber * 1.5);
    const enemyCount = baseEnemies + enemyIncrease;

    const healthMultiplier = 1 + (waveNumber * 0.1);
    const damageMultiplier = 1 + (waveNumber * 0.08);
    const speedMultiplier = Math.min(1.5, 1 + (waveNumber * 0.05));

    // Determine enemy composition
    const enemyTypes = this.getEnemyComposition(waveNumber);

    // Special events every 5 waves
    const isBossWave = waveNumber % 5 === 0;
    const isEliteWave = waveNumber % 3 === 0;

    return {
      waveNumber,
      enemyCount,
      healthMultiplier,
      damageMultiplier,
      speedMultiplier,
      enemyTypes,
      isBossWave,
      isEliteWave,
      difficulty: this.calculateDifficulty(waveNumber)
    };
  }

  /**
   * Get enemy composition for wave
   */
  getEnemyComposition(waveNumber) {
    const compositions = [];

    // Early waves (1-5): Basic enemies
    if (waveNumber <= 5) {
      compositions.push({ type: 'basic', weight: 0.7 });
      compositions.push({ type: 'armored', weight: 0.3 });
    }
    // Mid waves (6-15): Mixed composition
    else if (waveNumber <= 15) {
      compositions.push({ type: 'basic', weight: 0.4 });
      compositions.push({ type: 'armored', weight: 0.3 });
      compositions.push({ type: 'ninja', weight: 0.2 });
      compositions.push({ type: 'bomber', weight: 0.1 });
    }
    // Late waves (16+): All enemy types
    else {
      compositions.push({ type: 'basic', weight: 0.25 });
      compositions.push({ type: 'armored', weight: 0.25 });
      compositions.push({ type: 'ninja', weight: 0.2 });
      compositions.push({ type: 'bomber', weight: 0.15 });
      compositions.push({ type: 'fast', weight: 0.15 });
    }

    return compositions;
  }

  /**
   * Calculate difficulty rating
   */
  calculateDifficulty(waveNumber) {
    if (waveNumber <= 5) return 'Easy';
    if (waveNumber <= 10) return 'Medium';
    if (waveNumber <= 20) return 'Hard';
    if (waveNumber <= 30) return 'Extreme';
    return 'Nightmare';
  }

  /**
   * Spawn enemies for wave
   */
  spawnWaveEnemies(waveConfig) {
    // This would integrate with your enemy spawn system
    window.dispatchEvent(new CustomEvent('spawnSurvivalEnemies', {
      detail: waveConfig
    }));

    this.enemiesSpawned = waveConfig.enemyCount;
  }

  /**
   * Register enemy kill
   */
  registerKill(scoreValue) {
    if (!this.isActive || !this.waveInProgress) return;

    this.enemiesKilled++;
    this.totalScore += scoreValue;

    // Check if wave complete
    if (this.enemiesKilled >= this.enemiesSpawned) {
      this.completeWave();
    }
  }

  /**
   * Complete current wave
   */
  completeWave() {
    this.waveInProgress = false;
    this.nextWaveTime = Date.now() + this.timeBetweenWaves;

    if (this.currentWave > this.highestWave) {
      this.highestWave = this.currentWave;
      this.saveHighScore();
    }

    window.dispatchEvent(new CustomEvent('survivalWaveComplete', {
      detail: {
        wave: this.currentWave,
        score: this.totalScore,
        nextWaveIn: this.timeBetweenWaves / 1000
      }
    }));

    console.log(`[SurvivalMode] Wave ${this.currentWave} complete`);

    // Auto-start next wave after delay
    setTimeout(() => {
      if (this.isActive) {
        this.startNextWave();
      }
    }, this.timeBetweenWaves);
  }

  /**
   * Update survival mode
   */
  update(deltaTime) {
    if (!this.isActive) return;

    this.survivalTime = Date.now() - this.startTime;

    // Check for timeout between waves
    if (!this.waveInProgress && Date.now() >= this.nextWaveTime) {
      // Auto-start handled by setTimeout
    }
  }

  /**
   * End survival mode
   */
  end(reason = 'player_death') {
    if (!this.isActive) return;

    this.isActive = false;
    const finalTime = Date.now() - this.startTime;

    const results = {
      wave: this.currentWave,
      score: this.totalScore,
      time: finalTime,
      reason
    };

    window.dispatchEvent(new CustomEvent('survivalModeEnded', {
      detail: results
    }));

    console.log('[SurvivalMode] Ended -', results);

    // Save high score if needed
    this.saveHighScore();

    return results;
  }

  /**
   * Get current wave info
   */
  getCurrentWaveInfo() {
    return {
      wave: this.currentWave,
      enemiesRemaining: this.enemiesSpawned - this.enemiesKilled,
      totalEnemies: this.enemiesSpawned,
      waveInProgress: this.waveInProgress,
      score: this.totalScore,
      timeToNextWave: Math.max(0, this.nextWaveTime - Date.now())
    };
  }

  /**
   * Get survival statistics
   */
  getStats() {
    return {
      currentWave: this.currentWave,
      highestWave: this.highestWave,
      totalScore: this.totalScore,
      survivalTime: this.survivalTime,
      enemiesKilled: this.enemiesKilled
    };
  }

  /**
   * Save high score
   */
  saveHighScore() {
    try {
      const saved = localStorage.getItem('survivalHighScores') || '{}';
      const scores = JSON.parse(saved);

      if (!scores.highestWave || this.currentWave > scores.highestWave) {
        scores.highestWave = this.currentWave;
        scores.highestWaveScore = this.totalScore;
        scores.date = Date.now();
      }

      if (!scores.highScore || this.totalScore > scores.highScore) {
        scores.highScore = this.totalScore;
        scores.highScoreWave = this.currentWave;
      }

      localStorage.setItem('survivalHighScores', JSON.stringify(scores));
    } catch (error) {
      console.error('[SurvivalMode] Failed to save high score:', error);
    }
  }

  /**
   * Get high scores
   */
  getHighScores() {
    try {
      const saved = localStorage.getItem('survivalHighScores');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  /**
   * Check if active
   */
  isActivated() {
    return this.isActive;
  }
}
