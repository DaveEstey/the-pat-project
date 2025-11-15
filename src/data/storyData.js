// Story data for narrative sequences between levels

export const StoryData = {
  // Level introduction stories
  levelIntros: {
    1: {
      title: "Urban Outbreak",
      text: "The city is under attack. Your mission: reach the extraction point. Stay alert, shooter.",
      character: "Commander",
      duration: 4000
    },
    2: {
      title: "Industrial Sabotage",
      text: "Intel suggests the factory is producing illegal weapons. Shut it down and get out alive.",
      character: "Commander",
      duration: 4000
    },
    3: {
      title: "Underground Network",
      text: "You've traced the operation to this fortress. This is it - the final push. Good luck.",
      character: "Commander",
      duration: 4000
    },
    4: {
      title: "Jungle Infiltration",
      text: "Deep in hostile territory. The enemy won't see you coming through this dense jungle.",
      character: "Commander",
      duration: 4000
    },
    5: {
      title: "Space Station Alpha",
      text: "Zero gravity combat ahead. The station's defense grid is active. Move carefully.",
      character: "AI",
      duration: 4000
    },
    6: {
      title: "Haunted Mansion",
      text: "Strange readings from this location. Proceed with caution - nothing is as it seems.",
      character: "Commander",
      duration: 4000
    },
    7: {
      title: "Western Frontier",
      text: "Old west, new threats. The outlaws have set up a stronghold in this abandoned town.",
      character: "Commander",
      duration: 4000
    },
    8: {
      title: "Rooftop Chase",
      text: "High above the city. Your target is on the move - don't let them escape!",
      character: "Commander",
      duration: 4000
    },
    9: {
      title: "Temple of Doom",
      text: "Ancient traps and modern enemies. The temple holds secrets worth killing for.",
      character: "Explorer",
      duration: 4000
    },
    10: {
      title: "Space Station Beta",
      text: "AI systems have gone rogue. Shut down the reactor core before it's too late.",
      character: "AI",
      duration: 4000
    },
    11: {
      title: "Cathedral of Shadows",
      text: "The final piece of the puzzle lies within. Face your fears and claim victory.",
      character: "Commander",
      duration: 4000
    },
    12: {
      title: "The Final Convergence",
      text: "All paths lead here. This is your last stand. Make it count, shooter.",
      character: "Commander",
      duration: 4000
    }
  },

  // Level completion stories
  levelOutros: {
    1: {
      title: "Urban Secured",
      text: "Sector clear. Intel recovered suggests this is bigger than we thought. Moving to next location.",
      character: "Commander",
      duration: 3500
    },
    2: {
      title: "Factory Destroyed",
      text: "Good work. We've shut down their production, but the supplier is still out there.",
      character: "Commander",
      duration: 3500
    },
    3: {
      title: "Network Exposed",
      text: "We found their main operation. This isn't over - prepare for the next phase.",
      character: "Commander",
      duration: 3500
    },
    4: {
      title: "Jungle Cleared",
      text: "You've cut through their defenses. The path ahead opens to new challenges.",
      character: "Commander",
      duration: 3500
    },
    5: {
      title: "Station Secured",
      text: "Defense grid disabled. But sensors show more stations in orbit. Keep moving.",
      character: "AI",
      duration: 3500
    },
    6: {
      title: "Mansion Conquered",
      text: "Whatever was here is gone now. The trail leads to the frontier.",
      character: "Commander",
      duration: 3500
    },
    7: {
      title: "Frontier Liberated",
      text: "The outlaws are scattered. Time to take this fight to the rooftops.",
      character: "Commander",
      duration: 3500
    },
    8: {
      title: "Target Eliminated",
      text: "Clean shot. But our investigation points to an ancient temple. Gear up.",
      character: "Commander",
      duration: 3500
    },
    9: {
      title: "Temple Survived",
      text: "You've claimed the artifact. The AI systems are reacting. Get to the space station!",
      character: "Explorer",
      duration: 3500
    },
    10: {
      title: "Reactor Shutdown",
      text: "Crisis averted. But the cathedral holds the final key. This ends now.",
      character: "AI",
      duration: 3500
    },
    11: {
      title: "Cathedral Cleared",
      text: "All the pieces are in place. The final convergence begins. Ready yourself.",
      character: "Commander",
      duration: 3500
    },
    12: {
      title: "MISSION COMPLETE",
      text: "Against all odds, you've prevailed. The threat is neutralized. Excellent work, shooter.",
      character: "Commander",
      duration: 5000
    }
  },

  // Special story moments based on player actions
  specialMoments: {
    first_boss_defeat: {
      title: "First Victory",
      text: "First major threat eliminated. You're proving yourself, shooter.",
      character: "Commander",
      duration: 3000
    },
    half_complete: {
      title: "Halfway There",
      text: "Six levels down. Six to go. Don't lose focus now.",
      character: "Commander",
      duration: 3000
    },
    all_weapons_collected: {
      title: "Fully Armed",
      text: "You've collected all available weapons. Use them wisely.",
      character: "Commander",
      duration: 3000
    },
    perfect_accuracy: {
      title: "Sharpshooter",
      text: "100% accuracy this level. Impressive shooting.",
      character: "Commander",
      duration: 2500
    },
    no_damage_taken: {
      title: "Untouchable",
      text: "Not a scratch. Your skills are exceptional.",
      character: "Commander",
      duration: 2500
    }
  },

  // Character profiles
  characters: {
    Commander: {
      name: "Commander Hayes",
      avatar: "commander",
      color: "#00ff00"
    },
    AI: {
      name: "ARIA (AI Assistant)",
      avatar: "ai",
      color: "#00ffff"
    },
    Explorer: {
      name: "Dr. Chen",
      avatar: "explorer",
      color: "#ffaa00"
    }
  }
};

/**
 * Get story for level start
 */
export function getLevelIntro(levelNumber) {
  return StoryData.levelIntros[levelNumber] || null;
}

/**
 * Get story for level completion
 */
export function getLevelOutro(levelNumber) {
  return StoryData.levelOutros[levelNumber] || null;
}

/**
 * Get special moment story
 */
export function getSpecialMoment(momentKey) {
  return StoryData.specialMoments[momentKey] || null;
}

/**
 * Get character info
 */
export function getCharacter(characterName) {
  return StoryData.characters[characterName] || StoryData.characters.Commander;
}

export default StoryData;
