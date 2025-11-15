/**
 * Time Attack System
 * Speedrun mode with par times and leaderboards
 */

let timeAttackInstance = null;

export function initializeTimeAttack() {
  if (timeAttackInstance) {
    return timeAttackInstance;
  }
  timeAttackInstance = new TimeAttackSystem();
  return timeAttackInstance;
}

export function getTimeAttack() {
  return timeAttackInstance;
}

export class TimeAttackSystem {
  constructor() {
    this.isActive = false;
    this.startTime = 0;
    this.endTime = 0;
    this.currentLevel = 1;
    this.levelStartTime = 0;
    this.levelTimes = [];
    this.parTimes = this.initializeParTimes();
    this.penalties = [];
    this.bonuses = [];
  }

  /**
   * Initialize par times for each level (in seconds)
   */
  initializeParTimes() {
    return {
      1: { gold: 120, silver: 150, bronze: 180 },
      2: { gold: 150, silver: 180, bronze: 210 },
      3: { gold: 180, silver: 210, bronze: 240 },
      4: { gold: 200, silver: 240, bronze: 280 },
      5: { gold: 220, silver: 260, bronze: 300 },
      6: { gold: 240, silver: 280, bronze: 320 },
      7: { gold: 260, silver: 300, bronze: 340 },
      8: { gold: 280, silver: 320, bronze: 360 },
      9: { gold: 300, silver: 340, bronze: 380 },
      10: { gold: 320, silver: 360, bronze: 400 },
      11: { gold: 340, silver: 380, bronze: 420 },
      12: { gold: 360, silver: 400, bronze: 440 }
    };
  }

  /**
   * Start time attack run
   */
  start(levelNumber = 1) {
    this.isActive = true;
    this.startTime = Date.now();
    this.currentLevel = levelNumber;
    this.levelStartTime = Date.now();
    this.levelTimes = [];
    this.penalties = [];
    this.bonuses = [];

    window.dispatchEvent(new CustomEvent('timeAttackStarted', {
      detail: { level: levelNumber }
    }));

    console.log('[TimeAttack] Started level', levelNumber);
  }

  /**
   * Complete a level
   */
  completeLevel() {
    if (!this.isActive) return null;

    const levelTime = Date.now() - this.levelStartTime;
    const levelSeconds = Math.floor(levelTime / 1000);

    this.levelTimes.push({
      level: this.currentLevel,
      time: levelTime,
      seconds: levelSeconds
    });

    const medal = this.calculateMedal(this.currentLevel, levelSeconds);

    window.dispatchEvent(new CustomEvent('timeAttackLevelComplete', {
      detail: {
        level: this.currentLevel,
        time: levelTime,
        medal,
        parTimes: this.parTimes[this.currentLevel]
      }
    }));

    return { time: levelTime, medal };
  }

  /**
   * Start next level
   */
  startNextLevel() {
    this.currentLevel++;
    this.levelStartTime = Date.now();
  }

  /**
   * Calculate medal for level time
   */
  calculateMedal(levelNumber, timeSeconds) {
    const par = this.parTimes[levelNumber];
    if (!par) return 'none';

    if (timeSeconds <= par.gold) return 'gold';
    if (timeSeconds <= par.silver) return 'silver';
    if (timeSeconds <= par.bronze) return 'bronze';
    return 'none';
  }

  /**
   * Add time penalty
   */
  addPenalty(seconds, reason) {
    if (!this.isActive) return;

    this.penalties.push({
      seconds,
      reason,
      timestamp: Date.now()
    });

    window.dispatchEvent(new CustomEvent('timeAttackPenalty', {
      detail: { seconds, reason }
    }));
  }

  /**
   * Add time bonus
   */
  addBonus(seconds, reason) {
    if (!this.isActive) return;

    this.bonuses.push({
      seconds,
      reason,
      timestamp: Date.now()
    });

    window.dispatchEvent(new CustomEvent('timeAttackBonus', {
      detail: { seconds, reason }
    }));
  }

  /**
   * End time attack run
   */
  end() {
    if (!this.isActive) return null;

    this.isActive = false;
    this.endTime = Date.now();

    const totalTime = this.endTime - this.startTime;
    const totalPenalties = this.penalties.reduce((sum, p) => sum + p.seconds, 0) * 1000;
    const totalBonuses = this.bonuses.reduce((sum, b) => sum + b.seconds, 0) * 1000;

    const adjustedTime = totalTime + totalPenalties - totalBonuses;

    const results = {
      totalTime: adjustedTime,
      rawTime: totalTime,
      penalties: totalPenalties,
      bonuses: totalBonuses,
      levelTimes: this.levelTimes,
      levelCount: this.levelTimes.length,
      medals: this.calculateMedals()
    };

    // Save if it's a personal best
    this.saveTime(results);

    window.dispatchEvent(new CustomEvent('timeAttackEnded', {
      detail: results
    }));

    return results;
  }

  /**
   * Calculate medals for all levels
   */
  calculateMedals() {
    const medals = { gold: 0, silver: 0, bronze: 0, none: 0 };

    this.levelTimes.forEach(lt => {
      const medal = this.calculateMedal(lt.level, lt.seconds);
      medals[medal]++;
    });

    return medals;
  }

  /**
   * Get current elapsed time
   */
  getCurrentTime() {
    if (!this.isActive) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Get current level time
   */
  getCurrentLevelTime() {
    if (!this.isActive) return 0;
    return Date.now() - this.levelStartTime;
  }

  /**
   * Format time for display
   */
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  /**
   * Get par times for level
   */
  getParTimes(levelNumber) {
    return this.parTimes[levelNumber] || null;
  }

  /**
   * Save personal best
   */
  saveTime(results) {
    try {
      const saved = localStorage.getItem('timeAttackRecords') || '{}';
      const records = JSON.parse(saved);

      const levelCount = results.levelCount;

      if (!records[levelCount] || results.totalTime < records[levelCount].time) {
        records[levelCount] = {
          time: results.totalTime,
          rawTime: results.rawTime,
          medals: results.medals,
          date: Date.now()
        };

        localStorage.setItem('timeAttackRecords', JSON.stringify(records));
        console.log(`[TimeAttack] New personal best for ${levelCount} levels!`);
        return true;
      }
    } catch (error) {
      console.error('[TimeAttack] Failed to save time:', error);
    }
    return false;
  }

  /**
   * Get personal best for level count
   */
  getPersonalBest(levelCount) {
    try {
      const saved = localStorage.getItem('timeAttackRecords');
      if (saved) {
        const records = JSON.parse(saved);
        return records[levelCount] || null;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  /**
   * Get all personal bests
   */
  getAllPersonalBests() {
    try {
      const saved = localStorage.getItem('timeAttackRecords');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      return {};
    }
    return {};
  }

  /**
   * Get leaderboard (local only for now)
   */
  getLeaderboard(levelCount = 12) {
    const pb = this.getPersonalBest(levelCount);
    if (!pb) return [];

    return [{
      rank: 1,
      player: 'You',
      time: pb.time,
      medals: pb.medals,
      date: pb.date
    }];
  }

  /**
   * Check if time attack is active
   */
  isActivated() {
    return this.isActive;
  }
}
