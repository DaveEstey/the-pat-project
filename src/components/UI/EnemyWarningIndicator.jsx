import React, { useState, useEffect } from 'react';

/**
 * Enemy Warning Indicator - Shows visual warnings when enemies are about to attack
 */
export function EnemyWarningIndicator() {
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const handleEnemyWarning = (event) => {
      const { enemyId, position, timeUntilShot } = event.detail;

      // Add new warning
      const newWarning = {
        id: enemyId,
        position: position,
        timeUntilShot: timeUntilShot,
        timestamp: Date.now()
      };

      setWarnings(current => {
        // Remove existing warning for this enemy
        const filtered = current.filter(w => w.id !== enemyId);
        return [...filtered, newWarning];
      });

      // Auto-remove warning after it expires
      setTimeout(() => {
        setWarnings(current => current.filter(w => w.id !== enemyId));
      }, timeUntilShot);
    };

    window.addEventListener('enemyAboutToShoot', handleEnemyWarning);

    return () => {
      window.removeEventListener('enemyAboutToShoot', handleEnemyWarning);
    };
  }, []);

  return (
    <>
      {warnings.map((warning) => {
        const timeLeft = Math.max(0, warning.timeUntilShot - (Date.now() - warning.timestamp));
        const progress = (timeLeft / warning.timeUntilShot) * 100;
        const urgency = timeLeft < 500 ? 'critical' : timeLeft < 1000 ? 'warning' : 'info';

        return (
          <div
            key={warning.id}
            className="fixed pointer-events-none z-40"
            style={{
              left: `${warning.position.x}px`,
              top: `${warning.position.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Warning circle with pulsing effect */}
            <div className={`relative w-20 h-20 ${urgency === 'critical' ? 'animate-ping-fast' : 'animate-pulse'}`}>
              {/* Outer ring */}
              <div className={`absolute inset-0 rounded-full border-4 ${
                urgency === 'critical' ? 'border-red-500' :
                urgency === 'warning' ? 'border-yellow-500' :
                'border-orange-500'
              } opacity-60`}></div>

              {/* Inner circle with progress */}
              <div className="absolute inset-2 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    fill="none"
                    stroke={urgency === 'critical' ? '#ef4444' : urgency === 'warning' ? '#eab308' : '#f97316'}
                    strokeWidth="3"
                    strokeDasharray={`${progress} ${100 - progress}`}
                    strokeLinecap="round"
                    className="transition-all duration-100"
                  />
                </svg>

                {/* Exclamation mark */}
                <div className={`absolute text-2xl font-bold ${
                  urgency === 'critical' ? 'text-red-500' :
                  urgency === 'warning' ? 'text-yellow-500' :
                  'text-orange-500'
                }`}>
                  !
                </div>
              </div>

              {/* Directional arrows pointing at enemy */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className={`w-0 h-0 border-l-8 border-r-8 border-t-8 ${
                  urgency === 'critical' ? 'border-t-red-500' :
                  urgency === 'warning' ? 'border-t-yellow-500' :
                  'border-t-orange-500'
                } border-l-transparent border-r-transparent`}></div>
              </div>
            </div>

            {/* Warning text */}
            {urgency === 'critical' && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                  INCOMING!
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes ping-fast {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }

        .animate-ping-fast {
          animation: ping-fast 0.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}

export default EnemyWarningIndicator;
