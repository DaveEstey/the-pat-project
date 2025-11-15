import React, { useState, useEffect } from 'react';

// Unified Movement Controller - Controls movement based on single enemy state
export function UnifiedMovementController() {
  const [isMovementLocked, setIsMovementLocked] = useState(false);
  const [enemyCount, setEnemyCount] = useState(0);
  const [roomState, setRoomState] = useState('unknown');
  const [roomIndex, setRoomIndex] = useState(0);
  const [levelNumber, setLevelNumber] = useState(1);
  
  // Monitor unified enemy system state
  useEffect(() => {
    const checkMovementState = () => {
      if (window.unifiedEnemySystem) {
        const { 
          enemies, 
          roomState: currentRoomState, 
          roomIndex: currentRoomIndex, 
          levelNumber: currentLevelNumber 
        } = window.unifiedEnemySystem;
        const aliveEnemies = enemies.filter(e => e.health > 0);
        const shouldLock = aliveEnemies.length > 0 && currentRoomState === 'active';
        
        setEnemyCount(aliveEnemies.length);
        setRoomState(currentRoomState);
        setRoomIndex(currentRoomIndex || 0);
        setLevelNumber(currentLevelNumber || 1);
        
        if (shouldLock !== isMovementLocked) {
          setIsMovementLocked(shouldLock);
          
          // Control actual game movement
          const gameEngine = window.gameEngine || window.engineRef?.current;
          if (gameEngine) {
            if (shouldLock) {
              // Stop movement during combat
              if (gameEngine.pauseMovement) {
                gameEngine.pauseMovement();
              }
              if (gameEngine.isMoving !== undefined) {
                gameEngine.isMoving = false;
              }
            } else {
              // Allow movement when room cleared
              if (gameEngine.resumeMovement) {
                gameEngine.resumeMovement();
              }
              if (gameEngine.isMoving !== undefined) {
                gameEngine.isMoving = true;
              }
            }
          }
        }
      }
    };
    
    // Check movement state every 500ms
    const interval = setInterval(checkMovementState, 500);
    
    // Also check immediately
    checkMovementState();
    
    return () => clearInterval(interval);
  }, [isMovementLocked]);
  
  // Visual feedback based on movement state
  if (!window.unifiedEnemySystem) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white px-4 py-2 rounded z-50">
        <div className="font-bold">Waiting for room system...</div>
      </div>
    );
  }
  
  if (roomState === 'cleared') {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded z-50">
        <div className="font-bold text-lg">ROOM CLEARED!</div>
        <div className="text-sm">All enemies defeated</div>
      </div>
    );
  }
  
  if (isMovementLocked) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded z-50">
        <div className="font-bold">COMBAT ACTIVE</div>
        <div className="text-sm">{enemyCount} ENEMIES REMAINING</div>
        {roomIndex > 0 && <div className="text-xs">Room {roomIndex + 1} - Level {levelNumber}</div>}
        <div className="text-xs">Movement Locked</div>
      </div>
    );
  }
  
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded z-50">
      <div className="font-bold">READY</div>
      <div className="text-sm">Movement Unlocked</div>
    </div>
  );
}

export default UnifiedMovementController;