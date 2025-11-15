@echo off
echo Phase 1: Deleting debug/test components...

del /F /Q "src\components\Game\RenderingTest.jsx" 2>nul
if %errorlevel%==0 echo Deleted RenderingTest.jsx

del /F /Q "src\components\Game\EmergencyVisibilityTest.jsx" 2>nul
if %errorlevel%==0 echo Deleted EmergencyVisibilityTest.jsx

del /F /Q "src\components\Game\CameraDebugger.jsx" 2>nul
if %errorlevel%==0 echo Deleted CameraDebugger.jsx

del /F /Q "src\components\Game\SceneGraphAnalyzer.jsx" 2>nul
if %errorlevel%==0 echo Deleted SceneGraphAnalyzer.jsx

del /F /Q "src\components\Game\MinimalGameMode.jsx" 2>nul
if %errorlevel%==0 echo Deleted MinimalGameMode.jsx

del /F /Q "src\components\Game\ForceEnemySpawner.jsx" 2>nul
if %errorlevel%==0 echo Deleted ForceEnemySpawner.jsx

echo.
echo Phase 1 Complete!
echo Deleted 6 debug/test components.
