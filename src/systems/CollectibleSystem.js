/**
 * Collectible System
 * Manages collectible audio logs, documents, and lore items
 */

export const CollectibleTypes = {
  AUDIO_LOG: 'audio_log',
  DOCUMENT: 'document',
  PHOTO: 'photo',
  ARTIFACT: 'artifact'
};

export const CollectibleRarity = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  LEGENDARY: 'legendary'
};

let collectibleSystemInstance = null;

export function initializeCollectibleSystem() {
  if (collectibleSystemInstance) {
    return collectibleSystemInstance;
  }
  collectibleSystemInstance = new CollectibleSystem();
  return collectibleSystemInstance;
}

export function getCollectibleSystem() {
  if (!collectibleSystemInstance) {
    console.warn('[CollectibleSystem] Not initialized, creating new instance');
    return initializeCollectibleSystem();
  }
  return collectibleSystemInstance;
}

export class CollectibleSystem {
  constructor() {
    this.collectibles = this.initializeCollectibles();
    this.collectedItems = new Set();
    this.newlyCollected = new Set(); // Items collected in current session

    this.loadFromStorage();

    console.log('[CollectibleSystem] Initialized with', this.collectibles.size, 'collectibles');
  }

  initializeCollectibles() {
    return new Map([
      // Audio Logs
      ['audio_log_001', {
        id: 'audio_log_001',
        type: CollectibleTypes.AUDIO_LOG,
        rarity: CollectibleRarity.COMMON,
        title: 'Director\'s Log - Day 1',
        description: 'First entry from the facility director',
        content: 'Day one of operations. The new facility is complete. Our research into advanced combat technology begins today. I have high hopes for what we can achieve here.',
        levelFound: 1,
        hidden: false
      }],

      ['audio_log_002', {
        id: 'audio_log_002',
        type: CollectibleTypes.AUDIO_LOG,
        rarity: CollectibleRarity.COMMON,
        title: 'Security Chief Report',
        description: 'Security concerns about the project',
        content: 'The perimeter defenses are inadequate. I\'ve requested additional security personnel three times now. If something goes wrong... no, when something goes wrong, we won\'t be ready.',
        levelFound: 2,
        hidden: false
      }],

      ['audio_log_003', {
        id: 'audio_log_003',
        type: CollectibleTypes.AUDIO_LOG,
        rarity: CollectibleRarity.UNCOMMON,
        title: 'Test Subject 7 Interview',
        description: 'Interview with an experiment volunteer',
        content: 'They said it would be safe. Just a few injections, they said. But I can feel it changing me. My reflexes are faster, my strength increased... but at what cost? I don\'t recognize myself anymore.',
        levelFound: 3,
        hidden: true
      }],

      ['audio_log_004', {
        id: 'audio_log_004',
        type: CollectibleTypes.AUDIO_LOG,
        rarity: CollectibleRarity.RARE,
        title: 'Dr. Hayes\' Warning',
        description: 'Urgent message from lead scientist',
        content: 'This is Dr. Hayes. If anyone finds this... the experiments have gone too far. The director won\'t listen. Subject 7 has escaped containment. We need to evacuate immediately. God help us all.',
        levelFound: 5,
        hidden: true
      }],

      ['audio_log_005', {
        id: 'audio_log_005',
        type: CollectibleTypes.AUDIO_LOG,
        rarity: CollectibleRarity.LEGENDARY,
        title: 'The Final Transmission',
        description: 'Last communication before the incident',
        content: 'This is emergency broadcast 7-7-Alpha. Containment has failed. I repeat, containment has failed. All personnel must evacuate. The subjects... they\'re not human anymore. If you\'re receiving this, do not come here. Just... run.',
        levelFound: 9,
        hidden: true
      }],

      // Documents
      ['doc_001', {
        id: 'doc_001',
        type: CollectibleTypes.DOCUMENT,
        rarity: CollectibleRarity.COMMON,
        title: 'Project Overview',
        description: 'Official project documentation',
        content: 'PROJECT NEXUS - CLASSIFIED\n\nObjective: Develop enhanced combat capabilities through biological augmentation.\n\nExpected Results:\n- 200% increase in physical strength\n- 150% increase in reaction time\n- Enhanced healing factor\n\nRisks: Minimal (see appendix A)',
        levelFound: 1,
        hidden: false
      }],

      ['doc_002', {
        id: 'doc_002',
        type: CollectibleTypes.DOCUMENT,
        rarity: CollectibleRarity.UNCOMMON,
        title: 'Incident Report #47',
        description: 'Laboratory accident documentation',
        content: 'INCIDENT REPORT #47\n\nDate: [REDACTED]\nLocation: Lab C-3\n\nSummary: Test subject exhibited violent behavior during routine testing. Three researchers injured, one critically. Subject was sedated and returned to containment.\n\nAction: Enhanced security protocols implemented.',
        levelFound: 4,
        hidden: false
      }],

      ['doc_003', {
        id: 'doc_003',
        type: CollectibleTypes.DOCUMENT,
        rarity: CollectibleRarity.RARE,
        title: 'Email Thread - Ethics Concerns',
        description: 'Internal communications about ethics',
        content: 'From: Dr. Sarah Chen\nTo: Director Morrison\nSubject: Ethical Concerns\n\nDirector, I must voice my concerns about the direction of Project Nexus. The test subjects are showing signs of psychological deterioration. We need to halt testing immediately.\n\n---\n\nFrom: Director Morrison\nTo: Dr. Sarah Chen\n\nDr. Chen, your concerns are noted but unfounded. The project continues as planned.',
        levelFound: 6,
        hidden: true
      }],

      ['doc_004', {
        id: 'doc_004',
        type: CollectibleTypes.DOCUMENT,
        rarity: CollectibleRarity.LEGENDARY,
        title: 'The Truth About Project Nexus',
        description: 'Classified information about the project\'s true purpose',
        content: 'EYES ONLY - LEVEL 10 CLEARANCE\n\nProject Nexus was never about creating better soldiers. It was about creating controllable weapons. The biological enhancements were designed to include neural control mechanisms.\n\nThe subjects believe they volunteered. They don\'t remember being prisoners first.\n\nIf this information leaks, initiate Protocol Omega: eliminate all evidence, including test subjects and researchers.',
        levelFound: 10,
        hidden: true
      }],

      // Photos
      ['photo_001', {
        id: 'photo_001',
        type: CollectibleTypes.PHOTO,
        rarity: CollectibleRarity.COMMON,
        title: 'Facility Opening Day',
        description: 'Photo from the facility\'s grand opening',
        content: 'A group photo of smiling scientists and military officials standing in front of the newly completed research facility. Everyone looks so hopeful. If only they knew...',
        levelFound: 1,
        hidden: false
      }],

      ['photo_002', {
        id: 'photo_002',
        type: CollectibleTypes.PHOTO,
        rarity: CollectibleRarity.UNCOMMON,
        title: 'Test Subject Profiles',
        description: 'Photos of the test subjects before enhancement',
        content: 'A series of ID photos. Young men and women, all with military backgrounds. They look strong, determined. The notes on the back list their service records. All were marked as "suitable candidates."',
        levelFound: 3,
        hidden: true
      }],

      ['photo_003', {
        id: 'photo_003',
        type: CollectibleTypes.PHOTO,
        rarity: CollectibleRarity.RARE,
        title: 'The Incident',
        description: 'Security footage still from the containment breach',
        content: 'A grainy security camera image. Lab C-3. The timestamp shows three days before evacuation. A figure stands in the center, surrounded by debris and... are those bodies? The image is too dark to see details, but you can make out glowing eyes.',
        levelFound: 7,
        hidden: true
      }],

      // Artifacts
      ['artifact_001', {
        id: 'artifact_001',
        type: CollectibleTypes.ARTIFACT,
        rarity: CollectibleRarity.UNCOMMON,
        title: 'Broken ID Badge',
        description: 'A damaged security badge',
        content: 'A cracked security badge. The photo shows a young woman with kind eyes. Name: Dr. Sarah Chen. Security Level: 7. The badge is bent and stained with something dark.',
        levelFound: 5,
        hidden: false
      }],

      ['artifact_002', {
        id: 'artifact_002',
        type: CollectibleTypes.ARTIFACT,
        rarity: CollectibleRarity.RARE,
        title: 'Experimental Serum Sample',
        description: 'A vial of the enhancement serum',
        content: 'A small vial containing a luminescent blue liquid. The label reads "NEXUS-7 PROTOTYPE - DO NOT INGEST." The liquid seems to pulse with an inner light. This is what started everything.',
        levelFound: 8,
        hidden: true
      }],

      ['artifact_003', {
        id: 'artifact_003',
        type: CollectibleTypes.ARTIFACT,
        rarity: CollectibleRarity.LEGENDARY,
        title: 'Director\'s Key Card',
        description: 'Master access key to the facility',
        content: 'A pristine black key card with gold trim. "Director Morrison - Level 10 Access - All Areas." This card could open any door in the facility. The director never made it to the evac site. Where did he go?',
        levelFound: 10,
        hidden: true
      }]
    ]);
  }

  getCollectible(collectibleId) {
    return this.collectibles.get(collectibleId);
  }

  getAllCollectibles() {
    return Array.from(this.collectibles.values());
  }

  getCollectiblesByType(type) {
    return this.getAllCollectibles().filter(c => c.type === type);
  }

  getCollectiblesByLevel(level) {
    return this.getAllCollectibles().filter(c => c.levelFound === level);
  }

  getCollectiblesByRarity(rarity) {
    return this.getAllCollectibles().filter(c => c.rarity === rarity);
  }

  collectItem(collectibleId) {
    // Validate collectibleId
    if (!collectibleId || typeof collectibleId !== 'string') {
      console.error(`[CollectibleSystem] Invalid collectibleId: ${collectibleId}`);
      return false;
    }

    // Check if already collected
    if (this.collectedItems.has(collectibleId)) {
      return false; // Already collected
    }

    // Check if collectible exists
    const collectible = this.collectibles.get(collectibleId);
    if (!collectible) {
      console.error(`[CollectibleSystem] Collectible ${collectibleId} not found`);
      return false;
    }

    this.collectedItems.add(collectibleId);
    this.newlyCollected.add(collectibleId);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('collectibleFound', {
      detail: {
        collectibleId,
        collectible,
        totalCollected: this.collectedItems.size,
        totalCollectibles: this.collectibles.size
      }
    }));

    this.saveToStorage();

    console.log(`[CollectibleSystem] Collected: ${collectible.title}`);
    return true;
  }

  isCollected(collectibleId) {
    return this.collectedItems.has(collectibleId);
  }

  isNewlyCollected(collectibleId) {
    return this.newlyCollected.has(collectibleId);
  }

  clearNewlyCollected() {
    this.newlyCollected.clear();
  }

  getCollectionStats() {
    const stats = {
      total: this.collectibles.size,
      collected: this.collectedItems.size,
      percentage: 0,
      byType: {},
      byRarity: {}
    };

    if (stats.total > 0) {
      stats.percentage = Math.round((stats.collected / stats.total) * 100);
    }

    // Count by type
    Object.values(CollectibleTypes).forEach(type => {
      const total = this.getCollectiblesByType(type).length;
      const collected = this.getCollectiblesByType(type).filter(c => this.isCollected(c.id)).length;
      stats.byType[type] = { total, collected, percentage: total > 0 ? Math.round((collected / total) * 100) : 0 };
    });

    // Count by rarity
    Object.values(CollectibleRarity).forEach(rarity => {
      const total = this.getCollectiblesByRarity(rarity).length;
      const collected = this.getCollectiblesByRarity(rarity).filter(c => this.isCollected(c.id)).length;
      stats.byRarity[rarity] = { total, collected, percentage: total > 0 ? Math.round((collected / total) * 100) : 0 };
    });

    return stats;
  }

  getCollectedItems() {
    return this.getAllCollectibles().filter(c => this.isCollected(c.id));
  }

  getUncollectedItems() {
    return this.getAllCollectibles().filter(c => !this.isCollected(c.id));
  }

  // Reset all collectibles
  resetAll() {
    this.collectedItems.clear();
    this.newlyCollected.clear();
    this.saveToStorage();
  }

  // Save to localStorage
  saveToStorage() {
    try {
      const data = {
        collectedItems: Array.from(this.collectedItems)
      };
      localStorage.setItem('collectibleData', JSON.stringify(data));
    } catch (error) {
      console.error('[CollectibleSystem] Failed to save:', error);
    }
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('collectibleData');
      if (saved) {
        const data = JSON.parse(saved);
        this.collectedItems = new Set(data.collectedItems || []);

        console.log(`[CollectibleSystem] Loaded ${this.collectedItems.size} collected items`);
      }
    } catch (error) {
      console.error('[CollectibleSystem] Failed to load:', error);
    }
  }
}

export default CollectibleSystem;
