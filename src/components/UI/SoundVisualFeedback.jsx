import React, { useState, useEffect } from 'react';

/**
 * Sound Visual Feedback - Shows visual indicators for sound effects
 * Since audio is disabled, this provides visual feedback for game sounds
 */
export function SoundVisualFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const handleSound = (event) => {
      const { soundType, position, volume = 1 } = event.detail;

      const newFeedback = {
        id: Date.now() + Math.random(),
        soundType,
        position: position || { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        volume,
        timestamp: Date.now()
      };

      setFeedbacks(current => [...current, newFeedback]);

      // Remove after animation
      setTimeout(() => {
        setFeedbacks(current => current.filter(f => f.id !== newFeedback.id));
      }, 1000);
    };

    window.addEventListener('soundEffect', handleSound);

    return () => {
      window.removeEventListener('soundEffect', handleSound);
    };
  }, []);

  const getSoundIcon = (soundType) => {
    switch (soundType) {
      case 'shoot':
      case 'weaponFired':
        return '💥';
      case 'hit':
      case 'enemyHit':
        return '🎯';
      case 'death':
      case 'enemyDeath':
        return '☠️';
      case 'collect':
      case 'itemCollected':
        return '✨';
      case 'powerup':
        return '⚡';
      case 'damage':
      case 'playerHit':
        return '❗';
      case 'reload':
        return '🔄';
      case 'levelComplete':
        return '🎉';
      case 'warning':
        return '⚠️';
      default:
        return '🔊';
    }
  };

  const getSoundColor = (soundType) => {
    switch (soundType) {
      case 'shoot':
      case 'weaponFired':
        return 'text-orange-400';
      case 'hit':
      case 'enemyHit':
        return 'text-red-500';
      case 'death':
      case 'enemyDeath':
        return 'text-gray-500';
      case 'collect':
      case 'itemCollected':
        return 'text-yellow-400';
      case 'powerup':
        return 'text-purple-400';
      case 'damage':
      case 'playerHit':
        return 'text-red-600';
      case 'reload':
        return 'text-cyan-400';
      case 'levelComplete':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {feedbacks.map((feedback) => {
        const size = 20 + (feedback.volume * 30);

        return (
          <div
            key={feedback.id}
            className="absolute animate-sound-pulse"
            style={{
              left: `${feedback.position.x}px`,
              top: `${feedback.position.y}px`,
              fontSize: `${size}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`${getSoundColor(feedback.soundType)} drop-shadow-glow`}>
              {getSoundIcon(feedback.soundType)}
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes sound-pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
        }

        .animate-sound-pulse {
          animation: sound-pulse 1s ease-out forwards;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  );
}

export default SoundVisualFeedback;
