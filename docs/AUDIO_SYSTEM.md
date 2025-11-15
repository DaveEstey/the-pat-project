# Audio System Documentation

## Current Status: ❌ COMPLETELY DISABLED

### IMPORTANT NOTICE
The audio system is intentionally disabled for initial development to allow focus on core gameplay mechanics. All audio functionality uses placeholder functions that log intended actions but produce no sound.

**Do not enable audio until:**
1. Core gameplay is complete and tested
2. All visual systems are polished
3. Performance is optimized
4. Audio assets are prepared

---

## Placeholder Implementation

### Audio Utils (`src/utils/audioUtils.js`)
```javascript
// Audio system disabled for development
export const AudioSystem = {
  init: () => Promise.resolve(),
  playSound: (soundName, volume = 1) => {
    // Silent placeholder
  },
  playMusic: (musicName, loop = true) => {
    // Silent placeholder
  },
  stopSound: (soundName) => {},
  stopAllSounds: () => {},
  setMasterVolume: (volume) => {},
  setSFXVolume: (volume) => {},
  setMusicVolume: (volume) => {}
};
```

### Audio Hook (`src/hooks/useAudio.js`)
```javascript
export function useAudio() {
  const playSound = useCallback((soundName, volume = 1) => {
    AudioSystem.playSound(soundName, volume);
  }, []);

  return {
    playSound,
    playMusic,
    stopSound,
    setVolume,
    isReady: true // Always ready since audio is disabled
  };
}
```

---

## Planned Audio Architecture (When Enabled)

### Technology Stack
- **Library:** Tone.js (already in package.json)
- **Format:** Web Audio API
- **Fallback:** HTML5 Audio
- **Compression:** MP3 for music, OGG for SFX
- **3D Audio:** Web Audio panning and distance attenuation

### Audio Categories
1. **SFX (Sound Effects)** - Gameplay sounds
2. **Music** - Background music tracks
3. **Ambient** - Environment loops
4. **UI** - Menu and interface sounds
5. **Voice** - Character voices (optional)

---

## Sound Effects Specification

### Weapon Sounds

#### Pistol
```javascript
'weapon_pistol_fire' - Sharp crack (0.2s)
'weapon_pistol_reload' - Magazine click + slide (1.5s)
'weapon_pistol_empty' - Dry fire click (0.1s)
```

#### Shotgun
```javascript
'weapon_shotgun_fire' - Deep boom (0.3s)
'weapon_shotgun_pump' - Pump action (0.5s)
'weapon_shotgun_reload' - Shell insertion x8 (2.5s total)
'weapon_shotgun_empty' - Dry fire (0.1s)
```

#### Rapid Fire
```javascript
'weapon_rapidfire_fire' - Machine gun rattle (per shot)
'weapon_rapidfire_spin_up' - Wind-up (0.5s)
'weapon_rapidfire_spin_down' - Wind-down (0.5s)
'weapon_rapidfire_overheat' - Steam hiss + warning beep
'weapon_rapidfire_reload' - Belt feed mechanism (2.0s)
```

#### Grappling Arm
```javascript
'weapon_grapple_fire' - Hook launch + chain (0.3s)
'weapon_grapple_hit' - Clank + latch (0.2s)
'weapon_grapple_pull' - Chain retraction (1.0s)
'weapon_grapple_miss' - Chain whip (0.5s)
```

#### Bombs
```javascript
'weapon_bomb_throw' - Whoosh (0.3s)
'weapon_bomb_explode' - Loud boom + debris (1.5s)
'weapon_bomb_ice_explode' - Crystal shatter + freeze (1.5s)
'weapon_bomb_water_explode' - Splash + drip (1.5s)
'weapon_bomb_fire_explode' - Whoosh + crackle (1.5s)
```

### Combat Sounds

#### Hits & Impacts
```javascript
'impact_flesh' - Bullet hit soft target (0.2s)
'impact_armor' - Bullet hit metal (0.2s)
'impact_wall' - Bullet ricochet (0.3s)
'impact_critical' - Enhanced hit with flourish (0.4s)
'impact_headshot' - Distinctive sniper-like crack (0.3s)
```

#### Player Damage
```javascript
'player_hit' - Grunt + armor clang (0.3s)
'player_health_low' - Heartbeat loop (while < 25% HP)
'player_death' - Defeat sound (1.0s)
'player_shield_break' - Glass shatter (0.5s, if shield implemented)
```

#### Enemy Sounds
```javascript
// Basic Shooter
'enemy_basic_spawn' - Radio static + beep (0.5s)
'enemy_basic_attack' - Gun shot (0.2s)
'enemy_basic_hit' - Grunt (0.2s)
'enemy_basic_death' - Fall + radio static (0.8s)

// Armored
'enemy_armored_spawn' - Heavy stomp (0.5s)
'enemy_armored_attack' - Heavy cannon (0.4s)
'enemy_armored_hit' - Armor clang (0.2s)
'enemy_armored_death' - Explosion + metal fall (1.2s)

// Ninja
'enemy_ninja_spawn' - Smoke puff (0.3s)
'enemy_ninja_dash' - Whoosh (0.3s)
'enemy_ninja_attack' - Sword slash (0.2s)
'enemy_ninja_hit' - Quick grunt (0.1s)
'enemy_ninja_death' - Dissipate (0.5s)

// Bomb Thrower
'enemy_bomber_spawn' - Grenade pin pull (0.5s)
'enemy_bomber_wind_up' - Throw wind-up (1.0s)
'enemy_bomber_attack' - Throw + whistle (0.5s)
'enemy_bomber_hit' - Grunt (0.2s)
'enemy_bomber_death' - Explosions (1.0s)

// Fast Debuffer
'enemy_debuffer_spawn' - Electric crackle (0.5s)
'enemy_debuffer_attack' - Rapid laser shots (0.3s)
'enemy_debuffer_hit' - Electronic glitch (0.2s)
'enemy_debuffer_death' - Power down (0.6s)
'enemy_debuffer_debuff' - Slow-motion effect (0.5s)

// Boss
'boss_spawn' - Dramatic entrance (3.0s)
'boss_roar' - Intimidation sound (2.0s)
'boss_attack_1' - Varies by boss
'boss_attack_2' - Varies by boss
'boss_attack_special' - Signature attack (1.0s)
'boss_phase_transition' - Dramatic shift (2.0s)
'boss_hurt' - Major damage grunt (0.5s)
'boss_death' - Epic defeat sequence (5.0s)
```

### UI Sounds
```javascript
'ui_menu_open' - Menu slide (0.2s)
'ui_menu_close' - Menu close (0.2s)
'ui_button_hover' - Subtle beep (0.1s)
'ui_button_click' - Confirm beep (0.2s)
'ui_button_back' - Back beep (0.2s)
'ui_weapon_switch' - Quick mechanical (0.2s)
'ui_reload_warning' - Low ammo beep (0.3s)
'ui_notification' - Achievement chime (0.5s)
'ui_level_complete' - Victory fanfare (2.0s)
'ui_game_over' - Defeat sting (1.5s)
```

### Item & Collectible Sounds
```javascript
'item_pickup' - General collect (0.3s)
'item_health' - Heal sound (0.5s)
'item_ammo' - Reload clink (0.3s)
'item_powerup' - Power-up effect (0.8s)
'item_weapon_unlock' - Special fanfare (1.5s)
'item_key' - Key jingle (0.4s)
'item_coin' - Coin pickup (0.2s, if collectibles)
```

### Puzzle Sounds
```javascript
'puzzle_switch_activate' - Button press (0.2s)
'puzzle_switch_deactivate' - Button release (0.2s)
'puzzle_sequence_correct' - Positive chime (0.3s)
'puzzle_sequence_wrong' - Negative buzz (0.4s)
'puzzle_complete' - Solve fanfare (1.0s)
'puzzle_timer_warning' - Urgent beeping (0.5s loop)
'puzzle_failed' - Failure sound (0.8s)
'door_unlock' - Lock mechanism (1.0s)
'door_open' - Heavy door (2.0s)
```

### Environmental Sounds
```javascript
// Urban
'ambient_urban_traffic' - Distant cars (loop)
'ambient_urban_wind' - City wind (loop)
'ambient_urban_siren' - Police siren (occasional)

// Jungle
'ambient_jungle_birds' - Tropical birds (loop)
'ambient_jungle_insects' - Bugs chirping (loop)
'ambient_jungle_wind' - Leaves rustling (loop)

// Space
'ambient_space_hum' - Station hum (loop)
'ambient_space_alarms' - Alert sounds (occasional)
'ambient_space_radio' - Radio chatter (occasional)

// Haunted
'ambient_haunted_wind' - Eerie wind (loop)
'ambient_haunted_creak' - Wood creaking (occasional)
'ambient_haunted_whisper' - Ghostly whispers (occasional)

// Western
'ambient_western_wind' - Desert wind (loop)
'ambient_western_tumbleweed' - Blowing debris (occasional)
'ambient_western_saloon' - Piano music (distant, loop)
```

---

## Music Tracks Specification

### Menu Music
```javascript
'music_main_menu' - Epic orchestral (loop, 3:00)
'music_level_select' - Upbeat electronic (loop, 2:30)
'music_settings' - Calm ambient (loop, 2:00)
```

### Combat Music

#### Level 1-2 (Urban)
```javascript
'music_urban_combat' - Industrial electronic (loop, 3:30)
'music_urban_boss' - Intense electronic (loop, 4:00)
```

#### Level 3-4 (Underground/Jungle)
```javascript
'music_jungle_combat' - Tribal drums + electronic (loop, 3:45)
'music_jungle_boss' - Dramatic orchestral (loop, 4:30)
```

#### Level 5-6 (Space/Haunted)
```javascript
'music_space_combat' - Synthwave (loop, 3:30)
'music_haunted_combat' - Dark ambient (loop, 3:45)
'music_mid_boss' - Orchestral metal fusion (loop, 4:00)
```

#### Level 7-9 (Western/Temple)
```javascript
'music_western_combat' - Western rock (loop, 3:30)
'music_temple_combat' - Mysterious orchestral (loop, 3:45)
'music_temple_boss' - Epic orchestral (loop, 5:00)
```

#### Level 10-12 (Final Levels)
```javascript
'music_final_approach' - Building tension (loop, 4:00)
'music_final_boss_phase_1' - Epic orchestral (4:30)
'music_final_boss_phase_2' - Intense metal (4:30)
'music_final_boss_phase_3' - Desperate final stand (5:00)
```

### Special Music
```javascript
'music_victory' - Triumphant fanfare (30s, no loop)
'music_defeat' - Somber defeat (30s, no loop)
'music_credits' - Reflective orchestral (5:00)
'music_secret_room' - Mysterious jingle (2:00 loop)
```

---

## Audio Configuration

### Volume Levels
```javascript
// From gameConfig.js:174-186
audio: {
  maxSimultaneousSounds: 32,
  dopplerEffect: true,
  spatialAudio: true,
  compressionThreshold: 0.8,
  masterVolume: 0.7,
  categories: {
    sfx: 0.8,
    music: 0.6,
    ambient: 0.4,
    ui: 0.9
  }
}
```

### 3D Audio Settings
```javascript
{
  maxDistance: 100,      // units before sound is inaudible
  refDistance: 10,       // units at full volume
  rolloffFactor: 1.0,    // how quickly sound fades
  coneInnerAngle: 360,   // omnidirectional
  coneOuterAngle: 360,
  coneOuterGain: 0.0
}
```

---

## Audio Implementation Plan (When Ready)

### Phase 1: Core Infrastructure
1. Initialize Tone.js audio context
2. Create audio buffer pool
3. Implement basic playSound() function
4. Add volume controls
5. Test with 3-5 placeholder sounds

### Phase 2: Weapon Sounds
6. Implement all weapon fire sounds
7. Add reload sounds
8. Sync sounds with visual effects
9. Test audio feedback timing
10. Balance weapon sound volumes

### Phase 3: Combat & Feedback
11. Add player hit/death sounds
12. Implement enemy sound sets
13. Add impact and ricochet sounds
14. Create hit marker audio cues
15. Balance combat audio mix

### Phase 4: Music System
16. Implement music playback system
17. Add crossfading between tracks
18. Create combat intensity system
19. Sync music with boss phases
20. Add menu music

### Phase 5: Polish
21. Add UI sounds
22. Implement ambient environmental audio
23. Add puzzle interaction sounds
24. Create item pickup sounds
25. Final audio mixing and balance

---

## Audio Asset Requirements

### File Format Specifications
- **Music:** MP3, 192 kbps, stereo
- **SFX:** OGG Vorbis, 96 kbps, mono or stereo
- **Ambient:** OGG Vorbis, 128 kbps, stereo
- **Voice (if added):** OGG Vorbis, 128 kbps, mono

### Estimated Storage
```
Music (10 tracks × 3 min average): ~45 MB
SFX (150 sounds × 100 KB average): ~15 MB
Ambient (15 loops × 500 KB average): ~7.5 MB
UI (30 sounds × 50 KB average): ~1.5 MB
Total: ~70 MB
```

### Audio Sources (Planned)
- Original compositions (hire composer)
- Licensed stock music
- Generated SFX (sfxr, Bfxr)
- Recorded Foley
- Licensed sound libraries

---

## Audio Programming Interface

### When Implemented

#### Basic Playback
```javascript
// Play a sound effect
playSound('weapon_pistol_fire', {
  volume: 0.8,
  position: {x: 0, y: 0, z: -10}, // 3D position
  pitch: 1.0 // pitch variation
});

// Play music track
playMusic('music_urban_combat', {
  loop: true,
  fadeIn: 2.0, // seconds
  volume: 0.6
});

// Stop sound
stopSound('ambient_urban_traffic');

// Fade out and stop
fadeOutAndStop('music_boss', 2.0);
```

#### 3D Spatial Audio
```javascript
// Update listener (camera) position
updateAudioListener(cameraPosition, cameraRotation);

// Play 3D positioned sound
playSound3D('enemy_attack', enemyPosition, {
  volume: 1.0,
  maxDistance: 50,
  rolloff: 1.0
});
```

#### Dynamic Music
```javascript
// Increase music intensity during combat
setMusicIntensity(0.8); // 0.0 to 1.0

// Transition between tracks
transitionToMusic('music_boss', {
  duration: 3.0, // crossfade duration
  fadeOut: 'music_combat'
});
```

#### Audio Ducking
```javascript
// Lower music during dialogue or important sounds
duckAudio('music', 0.3, 2.0); // reduce to 30%, 2s transition
unduckAudio('music', 2.0); // restore, 2s transition
```

---

## Accessibility Features

### Planned Audio Accessibility
- **Visual Sound Indicators** - On-screen directional indicators
- **Subtitles** - For any voice/dialogue
- **Closed Captions** - For sound effects
- **Separate Volume Controls** - SFX, Music, Ambient, UI
- **Mono Audio Option** - For hearing-impaired
- **Visual Music Cues** - Rhythm indicators if needed

### Hearing Impaired Mode
- Visual hit markers more prominent
- Enemy attack warnings more visible
- Puzzle audio cues have visual backup
- UI feedback enhanced

---

## Performance Considerations

### Optimization Techniques
1. **Audio Pooling** - Reuse audio buffers
2. **Lazy Loading** - Load audio on demand
3. **Streaming** - Stream music, load SFX
4. **Compression** - Optimize file sizes
5. **Culling** - Don't play inaudible sounds
6. **Priority System** - Important sounds override less important

### Performance Targets
- Max simultaneous sounds: 32
- Music memory footprint: < 10 MB loaded
- SFX memory footprint: < 20 MB loaded
- No audio-related frame drops

---

## Testing Checklist (When Audio Enabled)

### Functional Tests
- [ ] All weapon sounds trigger correctly
- [ ] 3D audio positioning works
- [ ] Music loops seamlessly
- [ ] Volume controls affect all categories
- [ ] Sound doesn't play off-screen (unless 3D)
- [ ] No audio popping or crackling
- [ ] Audio survives pause/resume
- [ ] No memory leaks from audio

### Quality Tests
- [ ] Audio levels are balanced
- [ ] No clipping or distortion
- [ ] Transitions are smooth
- [ ] Combat audio isn't overwhelming
- [ ] Music matches atmosphere
- [ ] SFX provide clear feedback
- [ ] Ambient audio enhances immersion

---

## Audio Development Priorities

### Phase 1: Enable System (AFTER CORE GAME COMPLETE)
1. Remove placeholder functions
2. Initialize Tone.js properly
3. Test basic audio playback
4. Implement volume controls
5. Add audio settings UI

### Phase 2: Essential Sounds (HIGH PRIORITY)
6. Add weapon fire sounds (all 4 weapons)
7. Add player hit/death sounds
8. Add enemy hit/death sounds
9. Add UI button sounds
10. Add basic music tracks (menu + 1 combat)

### Phase 3: Full Implementation (MEDIUM PRIORITY)
11. Add all SFX from specification
12. Implement 3D spatial audio
13. Add all music tracks
14. Implement dynamic music system
15. Add ambient environmental audio

### Phase 4: Polish (LOW PRIORITY)
16. Fine-tune audio mixing
17. Add audio ducking
18. Implement crossfading
19. Add accessibility features
20. Final quality pass

---

## Audio References & Inspiration

### Similar Games to Study
- **DOOM (2016/Eternal)** - Intense combat audio, dynamic music
- **Devil May Cry 5** - Stylish combat sounds, music intensity
- **Superhot** - Minimalist but effective SFX
- **Hotline Miami** - Synthwave soundtrack, crunchy SFX
- **Enter the Gungeon** - Cartoon-style gun sounds, varied music

### Sound Design Principles
1. **Clarity** - Each sound should be distinct
2. **Feedback** - Sound confirms player actions
3. **Atmosphere** - Music/ambient sets tone
4. **Intensity** - Audio reflects game state
5. **Balance** - No sound drowns out others

---

## Current Implementation Status

### ✅ Placeholder System
- Silent audio functions
- Volume control UI (non-functional)
- Audio context structure
- Event system for audio triggers

### ❌ Not Implemented
- Actual sound playback
- Music system
- 3D spatial audio
- Audio asset loading
- Sound mixing
- All audio files

---

## Reminder: Audio is Disabled

**The audio system will remain disabled until:**
- Core gameplay is complete
- Performance is acceptable
- Visual systems are polished
- Audio assets are ready
- Development bandwidth allows

Focus on gameplay first. Polish audio last.
