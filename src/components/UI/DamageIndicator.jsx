import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';

// Damage Indicator - Shows screen flash and damage numbers when player takes damage
export function DamageIndicator() {
  const { state } = useGame();
  const [damageFlash, setDamageFlash] = useState(false);
  const [lowHealthWarning, setLowHealthWarning] = useState(false);
  const [previousHealth, setPreviousHealth] = useState(state.player.health);
  const [damageNumbers, setDamageNumbers] = useState([]);
  
  // Monitor health changes
  useEffect(() => {
    const currentHealth = state.player.health;
    
    if (currentHealth < previousHealth) {
      // Player took damage
      const damage = previousHealth - currentHealth;
      
      // Show damage flash
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 150);
      
      // Add floating damage number
      const damageId = Date.now();
      setDamageNumbers(prev => [...prev, { id: damageId, damage, time: Date.now() }]);
      
      // Remove damage number after animation
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== damageId));
      }, 2000);
    }
    
    // Update low health warning
    setLowHealthWarning(currentHealth <= 25 && currentHealth > 0);
    setPreviousHealth(currentHealth);
  }, [state.player.health, previousHealth]);
  
  // Listen for projectile hit events from the enemy projectile system
  useEffect(() => {
    const handleProjectileHit = (data) => {
      
      // Enhanced damage flash for projectile hits
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 200);
      
      // Add projectile-specific damage number with enemy type info
      const damageId = Date.now();
      const enemyType = data.enemyType || 'unknown';
      setDamageNumbers(prev => [...prev, { 
        id: damageId, 
        damage: data.damage, 
        time: Date.now(),
        isProjectile: true,
        enemyType 
      }]);
      
      // Remove damage number after animation
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== damageId));
      }, 2000);
    };
    
    // Listen to game engine events if available
    if (window.gameEngine && window.gameEngine.on) {
      window.gameEngine.on('playerHitByProjectile', handleProjectileHit);
      
      return () => {
        if (window.gameEngine && window.gameEngine.off) {
          window.gameEngine.off('playerHitByProjectile', handleProjectileHit);
        }
      };
    }
  }, []);
  
  return (
    <>
      {/* Damage Flash Overlay */}
      {damageFlash && (
        <div className="fixed inset-0 bg-red-600 opacity-30 pointer-events-none z-40 animate-pulse" />
      )}
      
      {/* Low Health Warning */}
      {lowHealthWarning && (
        <div className="fixed inset-4 border-4 border-red-500 rounded-lg pointer-events-none z-40 animate-pulse">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded font-bold text-lg">
            ⚠️ LOW HEALTH ⚠️
          </div>
        </div>
      )}
      
      {/* Floating Damage Numbers */}
      {damageNumbers.map((damageNum) => {
        // Create unique animation name for each damage number
        const animationName = `floatUp-${damageNum.id}`;
        
        return (
          <div key={damageNum.id}>
            {/* Inject keyframes dynamically */}
            <style>
              {`
                @keyframes ${animationName} {
                  0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                  }
                  20% {
                    transform: translate(-50%, -80px) scale(1.2);
                  }
                  100% {
                    opacity: 0;
                    transform: translate(-50%, -120px) scale(0.8);
                  }
                }
              `}
            </style>
            
            <div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
              style={{
                animation: `${animationName} 2s ease-out forwards`
              }}
            >
              <div className={`font-bold text-3xl drop-shadow-lg ${
                damageNum.isProjectile 
                  ? 'text-orange-400' // Projectile hits are orange
                  : 'text-red-400'    // Regular damage is red
              }`}>
                -{damageNum.damage}
                {damageNum.isProjectile && (
                  <div className="text-sm text-gray-300 mt-1">
                    {damageNum.enemyType.replace('_', ' ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default DamageIndicator;