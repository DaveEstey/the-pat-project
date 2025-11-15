import React, { useState, useEffect } from 'react';

/**
 * Hit Marker - Shows when you hit an enemy
 * Displays an X at crosshair and damage numbers
 */
export function HitMarker() {
  const [hits, setHits] = useState([]);
  const [damageNumbers, setDamageNumbers] = useState([]);

  useEffect(() => {
    const handleHit = (event) => {
      const { damage, position, isCritical } = event.detail || {};

      // Add hit marker (X at center)
      const hitId = Date.now() + Math.random();
      setHits(prev => [...prev, { id: hitId, time: Date.now(), isCritical }]);

      // Remove after 200ms
      setTimeout(() => {
        setHits(prev => prev.filter(h => h.id !== hitId));
      }, 200);

      // Add damage number if damage provided
      if (damage && position) {
        const numberId = Date.now() + Math.random();
        setDamageNumbers(prev => [...prev, {
          id: numberId,
          damage: Math.floor(damage),
          x: position.x || window.innerWidth / 2,
          y: position.y || window.innerHeight / 2,
          isCritical,
          time: Date.now()
        }]);

        // Remove after 1 second
        setTimeout(() => {
          setDamageNumbers(prev => prev.filter(n => n.id !== numberId));
        }, 1000);
      }
    };

    window.addEventListener('weaponHit', handleHit);

    return () => {
      window.removeEventListener('weaponHit', handleHit);
    };
  }, []);

  return (
    <>
      {/* Hit markers at crosshair center */}
      {hits.map(hit => (
        <div
          key={hit.id}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
          style={{
            animation: 'hitMarkerFade 0.2s ease-out'
          }}
        >
          {/* X marker */}
          <div className="relative w-12 h-12">
            {/* Top-left to bottom-right */}
            <div
              className={`absolute w-8 h-1 ${hit.isCritical ? 'bg-yellow-400' : 'bg-white'} transform rotate-45`}
              style={{
                top: '50%',
                left: '50%',
                marginLeft: '-16px',
                marginTop: '-2px',
                boxShadow: hit.isCritical ? '0 0 10px #ffd700' : '0 0 5px #ffffff'
              }}
            />
            {/* Top-right to bottom-left */}
            <div
              className={`absolute w-8 h-1 ${hit.isCritical ? 'bg-yellow-400' : 'bg-white'} transform -rotate-45`}
              style={{
                top: '50%',
                left: '50%',
                marginLeft: '-16px',
                marginTop: '-2px',
                boxShadow: hit.isCritical ? '0 0 10px #ffd700' : '0 0 5px #ffffff'
              }}
            />
          </div>
        </div>
      ))}

      {/* Damage numbers floating up */}
      {damageNumbers.map(number => {
        const elapsed = Date.now() - number.time;
        const progress = elapsed / 1000; // 0 to 1 over 1 second
        const yOffset = -progress * 50; // Float up 50px

        return (
          <div
            key={number.id}
            className="absolute pointer-events-none z-50"
            style={{
              left: `${number.x}px`,
              top: `${number.y + yOffset}px`,
              transform: 'translate(-50%, -50%)',
              opacity: 1 - progress,
              animation: 'damageFloat 1s ease-out'
            }}
          >
            <div
              className={`font-bold ${number.isCritical ? 'text-yellow-400 text-3xl' : 'text-white text-2xl'}`}
              style={{
                textShadow: number.isCritical
                  ? '0 0 10px #ffd700, 2px 2px 4px #000000'
                  : '2px 2px 4px #000000',
                WebkitTextStroke: number.isCritical ? '1px #ff8800' : '0px'
              }}
            >
              {number.damage}
            </div>
          </div>
        );
      })}

      {/* CSS Animations */}
      <style>{`
        @keyframes hitMarkerFade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes damageFloat {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -100px) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

export default HitMarker;
