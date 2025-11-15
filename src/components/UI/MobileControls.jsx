import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';

/**
 * Mobile Touch Controls
 * - Touch to aim and shoot
 * - Swipe left/right to switch weapons
 * - Touch buttons for pause and inventory
 */
const MobileControls = ({ onShoot, onWeaponSwitch }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const { state, setGameState } = useGame();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth < 768;
      setIsMobile(mobile);
      setShowControls(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle touch for aiming and shooting
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });

      // Shoot on tap
      if (onShoot) {
        onShoot(touch.clientX, touch.clientY);
      }
    }
  }, [onShoot]);

  // Handle swipe for weapon switching
  const handleTouchEnd = useCallback((e) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    // Detect swipe (fast horizontal movement)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 300) {
      if (deltaX > 0 && onWeaponSwitch) {
        // Swipe right - next weapon
        onWeaponSwitch(1);
      } else if (deltaX < 0 && onWeaponSwitch) {
        // Swipe left - previous weapon
        onWeaponSwitch(-1);
      }
    }

    setTouchStart(null);
  }, [touchStart, onWeaponSwitch]);

  if (!showControls) return null;

  return (
    <div className="fixed inset-0 pointer-events-auto z-30">
      {/* Main touch area for aiming/shooting */}
      <div
        className="absolute inset-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />

      {/* Mobile UI Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* Pause button */}
        <button
          className="bg-gray-800 bg-opacity-75 text-white p-3 rounded-full shadow-lg active:bg-gray-700 pointer-events-auto"
          onTouchStart={(e) => {
            e.stopPropagation();
            setGameState(state.gameState === 'paused' ? 'playing' : 'paused');
          }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Weapon switch indicators */}
      <div className="absolute bottom-24 left-4 right-4 flex justify-center gap-4 pointer-events-none">
        <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-bold">Swipe to switch weapon</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Touch indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-6 py-3 rounded-full pointer-events-none">
        <p className="text-sm font-bold text-center">Tap to shoot</p>
      </div>

      {/* Weapon quick-switch buttons (optional, for easier switching) */}
      <div className="absolute bottom-32 right-4 flex flex-col gap-2">
        {state.player.weapons.map((weapon, index) => (
          <button
            key={weapon.type}
            className={`p-3 rounded-full shadow-lg transition-all pointer-events-auto ${
              state.player.currentWeapon === index
                ? 'bg-yellow-500 text-black scale-110'
                : 'bg-gray-800 bg-opacity-75 text-white active:bg-gray-700'
            }`}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (onWeaponSwitch && state.player.currentWeapon !== index) {
                const delta = index - state.player.currentWeapon;
                onWeaponSwitch(delta);
              }
            }}
          >
            <span className="text-lg font-bold">{index + 1}</span>
          </button>
        ))}
      </div>

      {/* Crosshair indicator for mobile */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-12 h-12 border-2 border-white rounded-full opacity-50 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Tutorial hint (show for first few seconds) */}
      {state.player.shotsFired < 5 && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-xl animate-bounce pointer-events-none">
          <p className="text-lg font-bold text-center">
            👆 Tap anywhere to aim and shoot!
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileControls;
