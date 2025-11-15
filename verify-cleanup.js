#!/usr/bin/env node

/**
 * Verify Cleanup Script
 * Checks which files exist and scans for their imports before deletion
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}`)
};

const filesToCheck = [
  // Phase 1
  'src/components/Game/RenderingTest.jsx',
  'src/components/Game/EmergencyVisibilityTest.jsx',
  'src/components/Game/CameraDebugger.jsx',
  'src/components/Game/SceneGraphAnalyzer.jsx',
  'src/components/Game/MinimalGameMode.jsx',
  'src/components/Game/ForceEnemySpawner.jsx',
  // Phase 2
  'src/hooks/useBalancedRoomTimer.js',
  'src/hooks/useRoomProgression.js',
  'src/hooks/useControls.js',
  // Phase 4
  'src/components/Game/EmergencyCombatSystem.jsx',
  'src/hooks/useCombatClicks.js',
  // Phase 5
  'src/components/Game/RoomManager.jsx',
  'src/components/Game/RoomEnemySpawner.jsx',
  'src/systems/EnemySpawnSystem.js',
  'src/systems/RoomSystem.js',
  'src/components/Game/MovementController.jsx',
  'src/components/Game/MultiRoomManager.jsx',
  // Phase 6
  'src/components/UI/EnhancedContinuePrompt.jsx',
  'src/components/UI/EnemyCounter.jsx',
  'src/components/UI/RoomCompletionUI.jsx',
  'src/components/UI/RoomTimer.jsx',
  'src/components/UI/WeaponSelector.jsx',
  // Phase 7
  'src/components/Game/MovementTransition.jsx',
  'src/components/Game/LevelCompleteUI.jsx',
  'src/components/Game/GameErrorBoundary.jsx'
];

function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, filePath);
  return fs.existsSync(fullPath);
}

function getFileName(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function findImports(fileName) {
  try {
    // Search for imports of this file in the entire src directory
    const searchPattern = `import.*${fileName}`;
    const command = `findstr /s /i /r "import.*${fileName}" "src\\*.jsx" "src\\*.js"`;

    try {
      const result = execSync(command, {
        cwd: __dirname,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      if (result && result.trim()) {
        return result.split('\n').filter(line => line.trim());
      }
    } catch (err) {
      // findstr returns exit code 1 when no matches found
      if (err.status === 1) {
        return [];
      }
      throw err;
    }

    return [];
  } catch (err) {
    return [`Error searching: ${err.message}`];
  }
}

function main() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('   CLEANUP VERIFICATION REPORT');
  console.log('═══════════════════════════════════════════════════');
  console.log(colors.reset);

  let stats = {
    exists: 0,
    missing: 0,
    hasImports: 0,
    noImports: 0
  };

  filesToCheck.forEach(filePath => {
    const fileName = getFileName(filePath);
    const exists = checkFileExists(filePath);

    if (!exists) {
      stats.missing++;
      log.warning(`MISSING: ${filePath}`);
      return;
    }

    stats.exists++;

    // Check for imports
    log.section(`\nChecking: ${filePath}`);
    const imports = findImports(fileName);

    if (imports.length === 0) {
      stats.noImports++;
      log.success('No imports found - SAFE TO DELETE');
    } else {
      stats.hasImports++;
      log.warning(`Found ${imports.length} import(s):`);
      imports.forEach(imp => {
        console.log(`  ${colors.yellow}${imp}${colors.reset}`);
      });
    }
  });

  // Summary
  console.log(`\n${colors.bright}${colors.cyan}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('   SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log(colors.reset);

  console.log(`Total files to check: ${filesToCheck.length}`);
  log.success(`Files exist: ${stats.exists}`);
  log.warning(`Files missing: ${stats.missing}`);
  log.success(`No imports (safe): ${stats.noImports}`);
  log.warning(`Has imports (check): ${stats.hasImports}`);

  console.log(`\n${colors.yellow}Note:${colors.reset} Files with imports may still be safe to delete if:`);
  console.log('  - The importing file is also being deleted');
  console.log('  - The import is in a conditional block that never executes');
  console.log('  - The import is unused in the importing file\n');

  if (stats.hasImports > 0) {
    console.log(`${colors.yellow}⚠️  Review imports above before running cleanup${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✅ All files are safe to delete!${colors.reset}\n`);
  }
}

try {
  main();
} catch (err) {
  log.error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
}
