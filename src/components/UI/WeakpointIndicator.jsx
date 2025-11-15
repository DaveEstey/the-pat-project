import React, { useState, useEffect } from 'react';

/**
 * Weakpoint Indicator - Shows damage numbers and weakpoint hit feedback
 */
export function WeakpointIndicator() {
  const [damageNumbers, setDamageNumbers] = useState([]);

  useEffect(() => {
    const handleWeakpointHit = (event) => {
      const { weakpoint, damage, position } = event.detail;

      // Create damage number with unique ID
      const damageNum = {
        id: Date.now() + Math.random(),
        damage,
        weakpoint,
        position,
        createdAt: Date.now()
      };

      setDamageNumbers(prev => [...prev, damageNum]);

      // Remove after animation (2 seconds)
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== damageNum.id));
      }, 2000);
    };

    // Listen for weakpoint hit events
    if (window.gameEngine) {
      window.gameEngine.on('weakpointHit', handleWeakpointHit);

      return () => {
        window.gameEngine.off('weakpointHit', handleWeakpointHit);
      };
    }
  }, []);

  // Convert 3D position to screen coordinates
  const projectToScreen = (position) => {
    if (!window.gameEngine || !window.gameEngine.getCamera) return null;

    try {
      const camera = window.gameEngine.getCamera();
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      const vector = new THREE.Vector3(position.x, position.y, position.z);
      vector.project(camera);

      const rect = canvas.getBoundingClientRect();
      const x = ((vector.x + 1) / 2) * rect.width + rect.left;
      const y = ((-vector.y + 1) / 2) * rect.height + rect.top;

      return { x, y };
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {damageNumbers.map((dmg) => {
        const screenPos = projectToScreen(dmg.position);
        if (!screenPos) return null;

        const elapsed = Date.now() - dmg.createdAt;
        const progress = elapsed / 2000; // 2 second animation

        // Float upward and fade out
        const yOffset = -progress * 100; // Move up 100px
        const opacity = 1 - progress;
        const scale = 1 + progress * 0.5; // Grow slightly

        // Get color based on weakpoint type
        let color = 'text-red-400';
        if (dmg.weakpoint.effects?.includes('instantKill')) {
          color = 'text-purple-400';
        } else if (dmg.weakpoint.effects?.includes('critical')) {
          color = 'text-yellow-400';
        } else if (dmg.weakpoint.effects?.includes('explosion')) {
          color = 'text-orange-400';
        } else if (dmg.weakpoint.effects?.includes('armorBreak')) {
          color = 'text-cyan-400';
        } else if (dmg.weakpoint.multiplier >= 2.0) {
          color = 'text-yellow-300';
        }

        // Get size based on damage
        let textSize = 'text-2xl';
        if (dmg.weakpoint.effects?.includes('instantKill')) {
          textSize = 'text-5xl';
        } else if (dmg.weakpoint.effects?.includes('critical')) {
          textSize = 'text-4xl';
        } else if (dmg.weakpoint.multiplier >= 2.0) {
          textSize = 'text-3xl';
        }

        return (
          <div
            key={dmg.id}
            className={`absolute font-bold ${color} ${textSize}`}
            style={{
              left: `${screenPos.x}px`,
              top: `${screenPos.y + yOffset}px`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: opacity,
              textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 5px currentColor',
              transition: 'none'
            }}
          >
            {/* Damage number */}
            <div className="font-mono">
              {Math.floor(dmg.damage)}
            </div>

            {/* Weakpoint label */}
            {dmg.weakpoint.description && (
              <div className="text-xs mt-1 text-center opacity-90">
                {dmg.weakpoint.description.toUpperCase()}
              </div>
            )}

            {/* Special effect labels */}
            {dmg.weakpoint.effects?.includes('instantKill') && (
              <div className="text-sm mt-1 text-center animate-pulse">
                ⚡ INSTANT KILL ⚡
              </div>
            )}
            {dmg.weakpoint.effects?.includes('critical') && !dmg.weakpoint.effects?.includes('instantKill') && (
              <div className="text-sm mt-1 text-center">
                ★ CRITICAL ★
              </div>
            )}
            {dmg.weakpoint.effects?.includes('armorBreak') && (
              <div className="text-sm mt-1 text-center">
                🛡️ ARMOR BREAK
              </div>
            )}
            {dmg.weakpoint.effects?.includes('explosion') && (
              <div className="text-sm mt-1 text-center">
                💥 EXPLOSIVE
              </div>
            )}

            {/* Multiplier indicator */}
            {dmg.weakpoint.multiplier > 1.0 && (
              <div className="text-xs mt-1 text-center font-normal opacity-75">
                ×{dmg.weakpoint.multiplier.toFixed(1)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WeakpointIndicator;
