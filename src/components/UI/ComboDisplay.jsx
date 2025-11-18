import React, { useState, useEffect } from 'react';
import { getComboSystem } from '../../systems/ComboSystem.js';

/**
 * Combo Display - Shows current combo count, multiplier, and progress
 */
export function ComboDisplay() {
  const [combo, setCombo] = useState(0);
  const [scoreMultiplier, setScoreMultiplier] = useState(1.0);
  const [damageMultiplier, setDamageMultiplier] = useState(1.0);
  const [progress, setProgress] = useState(100);
  const [tierName, setTierName] = useState(null);
  const [tierColor, setTierColor] = useState(0xffffff);
  const [milestone, setMilestone] = useState(null);
  const [showMilestone, setShowMilestone] = useState(false);

  useEffect(() => {
    const comboSystem = getComboSystem();

    // Listen to combo events from combo system
    const handleComboUpdate = () => {
      try {
        const state = comboSystem.getComboState();
        setCombo(state.combo || 0);
        setScoreMultiplier(state.scoreMultiplier || 1.0);
        setDamageMultiplier(state.damageMultiplier || 1.0);
        setProgress(comboSystem.getComboProgress() || 0);
        setTierName(state.tierName);
        setTierColor(state.tierColor || 0xffffff);
      } catch (error) {
        console.error('Error updating combo display:', error);
      }
    };

    const handleMilestone = (event) => {
      setMilestone(event.detail);
      setShowMilestone(true);

      // Hide milestone after 2 seconds
      setTimeout(() => {
        setShowMilestone(false);
      }, 2000);
    };

    // Update combo display every 100ms
    const interval = setInterval(handleComboUpdate, 100);

    // Listen for milestone events
    window.addEventListener('comboMilestone', handleMilestone);

    // Initial update
    handleComboUpdate();

    return () => {
      clearInterval(interval);
      window.removeEventListener('comboMilestone', handleMilestone);
    };
  }, []);

  // Don't show if combo is 0
  if (combo === 0) {
    return null;
  }

  const comboSize = Math.min(3, 1 + combo / 20); // Scale up with combo
  const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.05;
  const tierColorHex = `#${tierColor.toString(16).padStart(6, '0')}`;

  return (
    <>
      {/* Combo Counter - Now rendered within parent stack, no absolute positioning */}
      <div className="text-right pointer-events-auto">
        <div
          className="relative"
          style={{
            transform: `scale(${comboSize * pulseScale})`,
            transition: 'transform 0.2s ease-out'
          }}
        >
          {/* Tier name */}
          {tierName && (
            <div
              className="text-2xl font-bold mb-1 animate-pulse"
              style={{
                color: tierColorHex,
                textShadow: `0 0 15px ${tierColorHex}80`
              }}
            >
              {tierName}
            </div>
          )}

          {/* Combo number */}
          <div
            className="text-6xl font-bold mb-1"
            style={{
              color: tierColorHex,
              textShadow: `0 0 20px ${tierColorHex}80`
            }}
          >
            {combo}
          </div>

          {/* Combo label */}
          <div className="text-xl font-bold text-white opacity-90">
            COMBO
          </div>

          {/* Multipliers */}
          <div className="flex gap-2 justify-end mt-1">
            <div
              className="text-xl font-bold"
              style={{
                color: '#ff4444',
                textShadow: '0 0 10px rgba(255, 68, 68, 0.8)'
              }}
            >
              DMG ×{damageMultiplier.toFixed(1)}
            </div>
            <div
              className="text-xl font-bold"
              style={{
                color: '#ffaa00',
                textShadow: '0 0 10px rgba(255, 170, 0, 0.8)'
              }}
            >
              SCORE ×{scoreMultiplier.toFixed(1)}
            </div>
          </div>

          {/* Combo timer progress bar */}
          <div className="w-48 h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                backgroundColor: progress > 50 ? tierColorHex :
                                progress > 25 ? '#ffaa00' :
                                '#ff4444'
              }}
            />
          </div>
        </div>
      </div>

      {/* Milestone Popup - Fixed positioning */}
      {showMilestone && milestone && (
        <div className="absolute top-0 right-0 animate-bounce pointer-events-none">
          <div
            className="text-4xl font-bold px-6 py-3 rounded-lg bg-black bg-opacity-80 border-4"
            style={{
              borderColor: `#${milestone.color.toString(16).padStart(6, '0')}`,
              color: `#${milestone.color.toString(16).padStart(6, '0')}`,
              textShadow: `0 0 20px #${milestone.color.toString(16).padStart(6, '0')}80`
            }}
          >
            {milestone.name}
          </div>
        </div>
      )}
    </>
  );
}

export default ComboDisplay;
