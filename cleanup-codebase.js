#!/usr/bin/env node

/**
 * Codebase Cleanup Script
 * Systematically removes legacy/unused files following the optimization proposal
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  phase: (msg) => console.log(`\n${colors.bright}${colors.blue}🔷 ${msg}${colors.reset}\n`)
};

// Define files to delete by phase
const phases = {
  phase1: {
    name: 'Debug/Test Components (ZERO RISK)',
    files: [
      'src/components/Game/RenderingTest.jsx',
      'src/components/Game/EmergencyVisibilityTest.jsx',
      'src/components/Game/CameraDebugger.jsx',
      'src/components/Game/SceneGraphAnalyzer.jsx',
      'src/components/Game/MinimalGameMode.jsx',
      'src/components/Game/ForceEnemySpawner.jsx'
    ]
  },
  phase2: {
    name: 'Unused Hooks (LOW RISK)',
    files: [
      'src/hooks/useBalancedRoomTimer.js',
      'src/hooks/useRoomProgression.js',
      'src/hooks/useControls.js'
    ]
  },
  phase4: {
    name: 'Legacy Combat Systems (MEDIUM RISK)',
    files: [
      'src/components/Game/EmergencyCombatSystem.jsx',
      'src/hooks/useCombatClicks.js'
    ]
  },
  phase5: {
    name: 'Legacy Room/Spawn Systems (MEDIUM RISK)',
    files: [
      'src/components/Game/RoomManager.jsx',
      'src/components/Game/RoomEnemySpawner.jsx',
      'src/systems/EnemySpawnSystem.js',
      'src/systems/RoomSystem.js',
      'src/components/Game/MovementController.jsx',
      'src/components/Game/MultiRoomManager.jsx'
    ]
  },
  phase6: {
    name: 'Legacy UI Components (LOW RISK)',
    files: [
      'src/components/UI/EnhancedContinuePrompt.jsx',
      'src/components/UI/EnemyCounter.jsx',
      'src/components/UI/RoomCompletionUI.jsx',
      'src/components/UI/RoomTimer.jsx',
      'src/components/UI/WeaponSelector.jsx'
    ]
  },
  phase7: {
    name: 'Transitional Components (LOW RISK)',
    files: [
      'src/components/Game/MovementTransition.jsx',
      'src/components/Game/LevelCompleteUI.jsx',
      'src/components/Game/GameErrorBoundary.jsx'
    ]
  }
};

// Statistics
let stats = {
  deleted: 0,
  notFound: 0,
  errors: 0,
  totalSize: 0
};

/**
 * Delete a single file
 */
function deleteFile(filePath) {
  const fullPath = path.join(__dirname, filePath);

  try {
    if (fs.existsSync(fullPath)) {
      const fileStats = fs.statSync(fullPath);
      fs.unlinkSync(fullPath);
      stats.deleted++;
      stats.totalSize += fileStats.size;
      log.success(`Deleted: ${filePath} (${(fileStats.size / 1024).toFixed(2)} KB)`);
      return true;
    } else {
      stats.notFound++;
      log.warning(`Not found: ${filePath}`);
      return false;
    }
  } catch (err) {
    stats.errors++;
    log.error(`Error deleting ${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * Execute a phase of deletions
 */
function executePhase(phaseKey) {
  const phase = phases[phaseKey];
  log.phase(`PHASE: ${phase.name}`);

  let phaseStats = { deleted: 0, notFound: 0, errors: 0 };

  phase.files.forEach(file => {
    const result = deleteFile(file);
    if (result) phaseStats.deleted++;
  });

  console.log(`Phase complete: ${phaseStats.deleted} files deleted\n`);
  return phaseStats;
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('   CODEBASE CLEANUP - LEGACY CODE REMOVAL');
  console.log('═══════════════════════════════════════════════════');
  console.log(colors.reset);

  log.info('Starting cleanup process...');
  log.info(`Working directory: ${__dirname}\n`);

  // Execute phases in order
  const phasesToExecute = ['phase1', 'phase2', 'phase4', 'phase5', 'phase6', 'phase7'];

  phasesToExecute.forEach(phaseKey => {
    executePhase(phaseKey);
  });

  // Summary
  console.log(`\n${colors.bright}${colors.cyan}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('   CLEANUP SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log(colors.reset);

  log.success(`Files deleted: ${stats.deleted}`);
  log.warning(`Files not found: ${stats.notFound}`);
  if (stats.errors > 0) {
    log.error(`Errors encountered: ${stats.errors}`);
  }
  log.info(`Total space freed: ${(stats.totalSize / 1024).toFixed(2)} KB`);

  console.log(`\n${colors.green}${colors.bright}`);
  console.log('✨ Cleanup complete!');
  console.log(colors.reset);

  console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
  console.log('1. Run: npm run dev');
  console.log('2. Test the game thoroughly');
  console.log('3. If everything works, proceed with Phase 8-9 (GameCanvas refactor)');
  console.log('4. Review CLEANUP_EXECUTION_PLAN.md for detailed refactor instructions\n');
}

// Execute
try {
  main();
} catch (err) {
  log.error(`Fatal error: ${err.message}`);
  process.exit(1);
}
