/**
 * Mission Briefing System
 * Manages mission briefings, story context, and objectives
 */

export const MissionDifficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXTREME: 'extreme'
};

let missionBriefingSystemInstance = null;

export function initializeMissionBriefingSystem() {
  if (missionBriefingSystemInstance) {
    return missionBriefingSystemInstance;
  }
  missionBriefingSystemInstance = new MissionBriefingSystem();
  return missionBriefingSystemInstance;
}

export function getMissionBriefingSystem() {
  if (!missionBriefingSystemInstance) {
    console.warn('[MissionBriefingSystem] Not initialized, creating new instance');
    return initializeMissionBriefingSystem();
  }
  return missionBriefingSystemInstance;
}

export class MissionBriefingSystem {
  constructor() {
    this.missions = this.initializeMissions();
    this.currentMission = null;
    this.completedMissions = new Set();
    this.missionStats = new Map();

    this.loadFromStorage();

    console.log('[MissionBriefingSystem] Initialized with', this.missions.size, 'missions');
  }

  initializeMissions() {
    return new Map([
      [1, {
        id: 1,
        title: 'Urban Assault',
        location: 'Downtown City',
        difficulty: MissionDifficulty.EASY,
        briefing: 'Welcome to your first mission, Agent. The city streets have been overrun by hostile forces. Your objective is to eliminate all enemy combatants and secure the area. This is a straightforward mission - perfect for learning the ropes.',
        objectives: [
          'Eliminate all enemy forces in the city district',
          'Survive to the extraction point',
          'Collect intelligence data (optional)'
        ],
        rewards: {
          credits: 500,
          gems: 10,
          scrap: 50
        },
        estimatedTime: '5-7 minutes',
        enemyTypes: ['Basic Shooter', 'Armored Enemy'],
        tips: [
          'Use cover to avoid taking damage',
          'Aim for headshots for bonus damage',
          'Watch your ammo count'
        ],
        storyContext: 'A terrorist organization has seized control of the downtown district. Local authorities are overwhelmed. You are our best hope to restore order.'
      }],

      [2, {
        id: 2,
        title: 'Rooftop Warfare',
        location: 'City Skyline',
        difficulty: MissionDifficulty.EASY,
        briefing: 'Take the fight to the rooftops, Agent. Enemy snipers have established positions on the high-rises. Navigate the aerial battlefield and neutralize the threat before they can coordinate an attack on civilian areas.',
        objectives: [
          'Clear all rooftop positions',
          'Destroy enemy communications',
          'Rescue hostages (optional)'
        ],
        rewards: {
          credits: 750,
          gems: 15,
          scrap: 75
        },
        estimatedTime: '6-8 minutes',
        enemyTypes: ['Basic Shooter', 'Ninja', 'Bomb Thrower'],
        tips: [
          'Mind the gaps between buildings',
          'Ninjas move fast - stay alert',
          'Explosive barrels can take out multiple enemies'
        ],
        storyContext: 'Intelligence suggests the enemy is planning a major strike. Eliminate their vantage points to blind their operations.'
      }],

      [3, {
        id: 3,
        title: 'Jungle Infiltration',
        location: 'Dense Rainforest',
        difficulty: MissionDifficulty.MEDIUM,
        briefing: 'Deep in the jungle lies an enemy compound. Your mission is to infiltrate their base, gather intelligence, and eliminate the commanding officer. Expect heavy resistance and environmental hazards.',
        objectives: [
          'Infiltrate the jungle compound',
          'Locate and eliminate the commander',
          'Extract classified documents',
          'Avoid triggering alarms (optional)'
        ],
        rewards: {
          credits: 1000,
          gems: 25,
          scrap: 100
        },
        estimatedTime: '7-9 minutes',
        enemyTypes: ['Basic Shooter', 'Ninja', 'Armored Enemy', 'Fast Debuffer'],
        tips: [
          'Use the vegetation for cover',
          'Watch for traps and hazards',
          'Fast Debuffers will slow you down - eliminate them first'
        ],
        storyContext: 'The enemy has established a secret base in the rainforest. We need you to shut it down and recover their plans.'
      }],

      [4, {
        id: 4,
        title: 'Ancient Ruins',
        location: 'Jungle Ruins',
        difficulty: MissionDifficulty.MEDIUM,
        briefing: 'Ancient ruins have become an enemy stronghold. Navigate the crumbling architecture and solve ancient puzzles while fighting off hostile forces. The enemy is using these ruins to hide something valuable.',
        objectives: [
          'Explore the ancient ruins',
          'Solve the temple puzzles',
          'Defeat the guardian boss',
          'Recover the ancient artifact'
        ],
        rewards: {
          credits: 1250,
          gems: 30,
          scrap: 125
        },
        estimatedTime: '8-10 minutes',
        enemyTypes: ['Basic Shooter', 'Ninja', 'Bomb Thrower', 'Boss'],
        tips: [
          'Puzzles may require quick shooting',
          'The guardian boss has multiple phases',
          'Collect power-ups before the boss fight'
        ],
        storyContext: 'Archaeological sites have attracted the enemy. We suspect they\'re searching for ancient weapons technology.'
      }],

      [5, {
        id: 5,
        title: 'Space Station Crisis',
        location: 'Orbital Platform',
        difficulty: MissionDifficulty.HARD,
        briefing: 'A critical space station has been hijacked. Fight in zero-gravity sections, repair life support systems, and prevent the station from falling into enemy hands. This is a high-stakes mission, Agent.',
        objectives: [
          'Secure the station control room',
          'Restore life support systems',
          'Repel all enemy forces',
          'Prevent station destruction'
        ],
        rewards: {
          credits: 1500,
          gems: 40,
          scrap: 150
        },
        estimatedTime: '9-11 minutes',
        enemyTypes: ['Basic Shooter', 'Armored Enemy', 'Fast Debuffer', 'Bomb Thrower'],
        tips: [
          'Zero-gravity sections require different tactics',
          'Oxygen levels are critical',
          'Use the environment to your advantage'
        ],
        storyContext: 'Our orbital research station has been seized. If it falls, critical military satellites will be compromised.'
      }],

      [6, {
        id: 6,
        title: 'Haunted Corridors',
        location: 'Gothic Mansion',
        difficulty: MissionDifficulty.MEDIUM,
        briefing: 'An abandoned mansion harbors dark secrets. Investigate reports of hostile activity, uncover hidden passages, and confront whatever lurks in the shadows. This mission will test your nerves.',
        objectives: [
          'Investigate the mansion',
          'Find the hidden laboratory',
          'Defeat the supernatural threats',
          'Collect research notes (optional)'
        ],
        rewards: {
          credits: 1300,
          gems: 35,
          scrap: 130
        },
        estimatedTime: '8-10 minutes',
        enemyTypes: ['Ninja', 'Fast Debuffer', 'Bomb Thrower'],
        tips: [
          'Dark corridors hide enemies',
          'Use muzzle flashes to light the way',
          'Hidden paths contain valuable items'
        ],
        storyContext: 'A rogue scientist conducted illegal experiments here. The results... are still active.'
      }],

      [7, {
        id: 7,
        title: 'Western Showdown',
        location: 'Frontier Town',
        difficulty: MissionDifficulty.MEDIUM,
        briefing: 'A western town has been taken over by outlaws. Engage in classic shootouts, clear saloons and banks, and bring justice to the frontier. Fast reflexes will be essential.',
        objectives: [
          'Clear the outlaw gang from town',
          'Protect the civilians',
          'Defeat the outlaw leader',
          'Recover stolen gold (optional)'
        ],
        rewards: {
          credits: 1400,
          gems: 35,
          scrap: 140
        },
        estimatedTime: '7-9 minutes',
        enemyTypes: ['Basic Shooter', 'Armored Enemy', 'Bomb Thrower', 'Boss'],
        tips: [
          'Use destructible cover strategically',
          'Quick-draw duels require fast reflexes',
          'Explosive barrels are everywhere'
        ],
        storyContext: 'Outlaws have taken over this frontier settlement. Time to restore law and order, old-west style.'
      }],

      [8, {
        id: 8,
        title: 'High-Tech Heist',
        location: 'Corporate Skyscraper',
        difficulty: MissionDifficulty.HARD,
        briefing: 'Break into a heavily fortified corporate tower. Hack security systems, avoid detection, and steal critical data. This mission requires precision and stealth... until things go wrong.',
        objectives: [
          'Infiltrate the corporate tower',
          'Hack into the mainframe',
          'Download classified data',
          'Escape before lockdown'
        ],
        rewards: {
          credits: 1750,
          gems: 45,
          scrap: 175
        },
        estimatedTime: '9-11 minutes',
        enemyTypes: ['Basic Shooter', 'Armored Enemy', 'Fast Debuffer', 'Ninja'],
        tips: [
          'Security systems can be turned against enemies',
          'Time-sensitive objectives require speed',
          'Have an exit strategy ready'
        ],
        storyContext: 'A corrupt corporation is developing illegal weapons. We need their data to expose them.'
      }],

      [9, {
        id: 9,
        title: 'Underground Facility',
        location: 'Secret Bunker',
        difficulty: MissionDifficulty.HARD,
        briefing: 'Descend into a massive underground complex. Face waves of enemies in tight corridors, disable defense systems, and uncover the facility\'s true purpose. The deeper you go, the harder it gets.',
        objectives: [
          'Breach the underground facility',
          'Disable automated defenses',
          'Reach the core reactor',
          'Prevent meltdown'
        ],
        rewards: {
          credits: 1900,
          gems: 50,
          scrap: 190
        },
        estimatedTime: '10-12 minutes',
        enemyTypes: ['Basic Shooter', 'Armored Enemy', 'Bomb Thrower', 'Fast Debuffer'],
        tips: [
          'Tight corridors favor shotguns',
          'Watch for automated turrets',
          'Environmental hazards are lethal'
        ],
        storyContext: 'This facility shouldn\'t exist. We need to know what they\'re building down there.'
      }],

      [10, {
        id: 10,
        title: 'Final Assault',
        location: 'Enemy Headquarters',
        difficulty: MissionDifficulty.EXTREME,
        briefing: 'This is it, Agent. The enemy headquarters. All your training, all your missions, have led to this moment. Fight through their best defenses and take down their leader once and for all.',
        objectives: [
          'Storm the enemy headquarters',
          'Defeat elite guard units',
          'Confront the enemy leader',
          'End the threat permanently'
        ],
        rewards: {
          credits: 2500,
          gems: 75,
          scrap: 250
        },
        estimatedTime: '12-15 minutes',
        enemyTypes: ['Basic Shooter', 'Armored Enemy', 'Ninja', 'Bomb Thrower', 'Fast Debuffer', 'Boss'],
        tips: [
          'Use all your skills and upgrades',
          'Stock up on ammo and health',
          'The final boss has multiple phases',
          'Stay calm and focused'
        ],
        storyContext: 'The mastermind behind all these attacks awaits. End this war today, Agent. The world is counting on you.'
      }],

      [11, {
        id: 11,
        title: 'Survival Gauntlet',
        location: 'Training Arena',
        difficulty: MissionDifficulty.EXTREME,
        briefing: 'Think you\'ve mastered combat? Prove it in the survival gauntlet. Face endless waves of enemies with increasing difficulty. How long can you last?',
        objectives: [
          'Survive as many waves as possible',
          'Achieve a high score',
          'Unlock all survival achievements'
        ],
        rewards: {
          credits: 500,
          gems: 10,
          scrap: 50,
          multiplier: 'per wave'
        },
        estimatedTime: 'Variable',
        enemyTypes: ['All enemy types'],
        tips: [
          'Prioritize high-threat targets',
          'Manage resources carefully',
          'Use the arena to your advantage',
          'Combos increase score multipliers'
        ],
        storyContext: 'A training exercise turned competitive challenge. Show everyone what you\'re made of.'
      }],

      [12, {
        id: 12,
        title: 'Time Trial Challenge',
        location: 'Speed Course',
        difficulty: MissionDifficulty.HARD,
        briefing: 'Speed is everything. Complete objectives under strict time limits while maintaining accuracy. Only the fastest and most skilled agents succeed here.',
        objectives: [
          'Complete all checkpoints',
          'Maintain accuracy above 70%',
          'Beat the par time',
          'Achieve S-rank performance'
        ],
        rewards: {
          credits: 2000,
          gems: 60,
          scrap: 200
        },
        estimatedTime: 'Under 10 minutes',
        enemyTypes: ['Basic Shooter', 'Ninja', 'Fast Debuffer'],
        tips: [
          'Speed and accuracy both matter',
          'Skip optional fights when possible',
          'Use shortcuts and branching paths',
          'Don\'t sacrifice accuracy for speed'
        ],
        storyContext: 'In the field, sometimes missions are against the clock. Are you fast enough?'
      }]
    ]);
  }

  getMission(missionId) {
    return this.missions.get(missionId);
  }

  getAllMissions() {
    return Array.from(this.missions.values());
  }

  getAvailableMissions() {
    // Return missions that are unlocked
    // Mission is unlocked if previous mission is completed OR it's mission 1
    return this.getAllMissions().filter(mission => {
      if (mission.id === 1) return true;
      return this.completedMissions.has(mission.id - 1);
    });
  }

  startMission(missionId) {
    const mission = this.missions.get(missionId);
    if (!mission) {
      console.error(`[MissionBriefingSystem] Mission ${missionId} not found`);
      return null;
    }

    this.currentMission = missionId;

    // Initialize stats for this mission if not exists
    if (!this.missionStats.has(missionId)) {
      this.missionStats.set(missionId, {
        attempts: 0,
        completions: 0,
        bestTime: null,
        bestScore: 0,
        totalKills: 0,
        totalDeaths: 0
      });
    }

    const stats = this.missionStats.get(missionId);
    stats.attempts++;

    window.dispatchEvent(new CustomEvent('missionStarted', {
      detail: { missionId, mission }
    }));

    console.log(`[MissionBriefingSystem] Started mission ${missionId}: ${mission.title}`);
    return mission;
  }

  completeMission(missionId, missionData = {}) {
    const mission = this.missions.get(missionId);
    if (!mission) return;

    this.completedMissions.add(missionId);
    this.currentMission = null;

    const stats = this.missionStats.get(missionId);
    if (stats) {
      stats.completions++;

      // Update best time
      if (missionData.time && (!stats.bestTime || missionData.time < stats.bestTime)) {
        stats.bestTime = missionData.time;
      }

      // Update best score
      if (missionData.score && missionData.score > stats.bestScore) {
        stats.bestScore = missionData.score;
      }

      // Update stats
      if (missionData.kills) stats.totalKills += missionData.kills;
      if (missionData.deaths) stats.totalDeaths += missionData.deaths;
    }

    window.dispatchEvent(new CustomEvent('missionCompleted', {
      detail: { missionId, mission, stats: missionData }
    }));

    this.saveToStorage();

    console.log(`[MissionBriefingSystem] Completed mission ${missionId}: ${mission.title}`);
  }

  isMissionCompleted(missionId) {
    return this.completedMissions.has(missionId);
  }

  getMissionStats(missionId) {
    return this.missionStats.get(missionId) || null;
  }

  getAllMissionStats() {
    const stats = {
      totalMissions: this.missions.size,
      completedMissions: this.completedMissions.size,
      totalAttempts: 0,
      totalCompletions: 0,
      completionRate: 0
    };

    this.missionStats.forEach((missionStat) => {
      stats.totalAttempts += missionStat.attempts;
      stats.totalCompletions += missionStat.completions;
    });

    if (stats.totalAttempts > 0) {
      stats.completionRate = Math.round((stats.totalCompletions / stats.totalAttempts) * 100);
    }

    return stats;
  }

  resetMission(missionId) {
    this.completedMissions.delete(missionId);
    this.missionStats.delete(missionId);
    this.saveToStorage();
  }

  resetAllMissions() {
    this.completedMissions.clear();
    this.missionStats.clear();
    this.currentMission = null;
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      const data = {
        completedMissions: Array.from(this.completedMissions),
        missionStats: Array.from(this.missionStats.entries()),
        currentMission: this.currentMission
      };
      localStorage.setItem('missionBriefingData', JSON.stringify(data));
    } catch (error) {
      console.error('[MissionBriefingSystem] Failed to save:', error);
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('missionBriefingData');
      if (saved) {
        const data = JSON.parse(saved);
        this.completedMissions = new Set(data.completedMissions || []);
        this.missionStats = new Map(data.missionStats || []);
        this.currentMission = data.currentMission || null;

        console.log(`[MissionBriefingSystem] Loaded ${this.completedMissions.size} completed missions`);
      }
    } catch (error) {
      console.error('[MissionBriefingSystem] Failed to load:', error);
    }
  }
}

export default MissionBriefingSystem;
