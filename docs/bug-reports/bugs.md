# Enemy Projectile System - Implementation Request

## Current Issue
The game has functional enemy spawning and player combat, but enemies cannot damage the player. The projectile system that allows enemies to shoot at the player is either missing or non-functional.

## Required Implementation

### Core Functionality Needed
- Enemies should fire projectiles toward the player at regular intervals
- Projectiles should be visible (bullets, energy blasts, etc.) traveling through 3D space
- Projectiles should detect collision with the player character
- Successful hits should reduce player health shown in the health bar
- Player should have visual/audio feedback when taking damage

### System Integration Requirements
- Work with existing enemy AI and spawning system
- Integrate with current player health display (health bar already exists in UI)
- Respect the room-based combat system (enemies stop shooting when room clears)
- Function properly with the existing UnifiedCombatSystem

### Technical Approach
**Analysis Request**: Examine the current codebase structure to identify:
- Where enemy behavior/AI is currently implemented
- How the player health system is structured and managed
- What projectile or collision detection systems (if any) already exist
- The best integration points for enemy firing mechanics

**Implementation Strategy**:
- Extend existing enemy components with firing capability
- Create projectile objects that move through 3D space toward player position
- Add collision detection between projectiles and player
- Connect successful hits to player health reduction system
- Add visual and audio feedback for projectile impacts

### Expected Behavior
1. Enemies spawn and begin shooting at player after brief delay
2. Visible projectiles travel from enemy positions toward player
3. Player takes damage when hit, with health bar decreasing
4. Player can see/dodge incoming projectiles
5. Different enemy types have different projectile patterns (speed, damage, frequency)
6. Player death/game over when health reaches zero

### Integration Points
- Enemy AI should trigger projectile firing based on line-of-sight and timing
- Player health management should integrate with existing UI health bar
- Projectile collision should work within the Three.js scene graph
- System should pause/resume properly with existing room state management

## Request for Claude Code
Analyze the existing codebase to understand current architecture, then implement a complete enemy projectile system that enables enemies to damage the player. Focus on making the system work seamlessly with existing combat mechanics rather than rebuilding core systems.