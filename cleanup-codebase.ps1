# PowerShell Cleanup Script
# Deletes legacy/unused files from the codebase

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   CODEBASE CLEANUP - LEGACY CODE REMOVAL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

$files = @(
    # Phase 1: Debug Components
    "src\components\Game\RenderingTest.jsx",
    "src\components\Game\EmergencyVisibilityTest.jsx",
    "src\components\Game\CameraDebugger.jsx",
    "src\components\Game\SceneGraphAnalyzer.jsx",
    "src\components\Game\MinimalGameMode.jsx",
    "src\components\Game\ForceEnemySpawner.jsx",

    # Phase 2: Unused Hooks
    "src\hooks\useBalancedRoomTimer.js",
    "src\hooks\useRoomProgression.js",
    "src\hooks\useControls.js",

    # Phase 4: Legacy Combat
    "src\components\Game\EmergencyCombatSystem.jsx",
    "src\hooks\useCombatClicks.js",

    # Phase 5: Legacy Room/Spawn
    "src\components\Game\RoomManager.jsx",
    "src\components\Game\RoomEnemySpawner.jsx",
    "src\systems\EnemySpawnSystem.js",
    "src\systems\RoomSystem.js",
    "src\components\Game\MovementController.jsx",
    "src\components\Game\MultiRoomManager.jsx",

    # Phase 6: Legacy UI
    "src\components\UI\EnhancedContinuePrompt.jsx",
    "src\components\UI\EnemyCounter.jsx",
    "src\components\UI\RoomCompletionUI.jsx",
    "src\components\UI\RoomTimer.jsx",
    "src\components\UI\WeaponSelector.jsx",

    # Phase 7: Transitional
    "src\components\Game\MovementTransition.jsx",
    "src\components\Game\LevelCompleteUI.jsx",
    "src\components\Game\GameErrorBoundary.jsx"
)

$deleted = 0
$notFound = 0
$totalSize = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file

    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Remove-Item $fullPath -Force
        $sizeKB = [math]::Round($size / 1KB, 2)
        Write-Host "[✓] Deleted: $file ($sizeKB KB)" -ForegroundColor Green
        $deleted++
        $totalSize += $size
    } else {
        Write-Host "[!] Not found: $file" -ForegroundColor Yellow
        $notFound++
    }
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Files deleted: $deleted" -ForegroundColor Green
Write-Host "Files not found: $notFound" -ForegroundColor Yellow
$totalSizeKB = [math]::Round($totalSize / 1KB, 2)
Write-Host "Total space freed: $totalSizeKB KB`n" -ForegroundColor Cyan

Write-Host "✨ Cleanup complete!`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run dev"
Write-Host "2. Test the game thoroughly"
Write-Host "3. Manually refactor GameCanvas.jsx (see FINAL_CLEANUP_SUMMARY.md)"
Write-Host "4. Review and commit changes`n"
