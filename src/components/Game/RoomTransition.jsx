import React, { useEffect, useRef } from 'react';

/**
 * RoomTransition - Enhanced camera and visual transitions between rooms
 * Provides smooth camera movement and visual effects
 */
export function RoomTransition({
  gameEngine,
  isTransitioning,
  progress,
  fromRoom,
  toRoom,
  onTransitionComplete
}) {
  const cameraAnimRef = useRef(null);

  // Animate camera during transition
  useEffect(() => {
    if (!gameEngine || !gameEngine.getCamera || !isTransitioning) return;

    const camera = gameEngine.getCamera();
    const startPos = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };

    // Target position (move forward into next room)
    const targetPos = {
      x: startPos.x,
      y: startPos.y + 0.5, // Slight upward movement
      z: startPos.z - 5 // Move forward
    };

    const animate = () => {
      if (!isTransitioning || progress >= 1) return;

      // Smooth easing
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Interpolate camera position
      camera.position.y = startPos.y + (targetPos.y - startPos.y) * easeProgress;
      camera.position.z = startPos.z + (targetPos.z - startPos.z) * easeProgress;

      cameraAnimRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (cameraAnimRef.current) {
        cancelAnimationFrame(cameraAnimRef.current);
      }
    };
  }, [gameEngine, isTransitioning, progress]);

  if (!isTransitioning) {
    return null;
  }

  return (
    <>
      {/* Fade overlay - reduced opacity to not block view */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 50,
          pointerEvents: 'none',
          opacity: progress < 0.5 ? progress * 0.6 : (2 - progress * 2) * 0.6,
          transition: 'opacity 0.1s ease'
        }}
      />

      {/* Transition UI */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 51,
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        {/* Room label */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 4px 8px rgba(0,0,0,0.9)',
            marginBottom: '24px',
            opacity: progress < 0.5 ? 1 - progress * 2 : (progress - 0.5) * 2,
            transition: 'opacity 0.2s ease'
          }}
        >
          {progress < 0.5 ? `Leaving Room ${fromRoom + 1}` : `Entering Room ${toRoom + 1}`}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '400px',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            margin: '0 auto'
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: '#00aaff',
              boxShadow: '0 0 10px rgba(0, 170, 255, 0.8)',
              transition: 'width 0.1s linear'
            }}
          />
        </div>

        {/* Transition hint */}
        <div
          style={{
            fontSize: '16px',
            color: '#cccccc',
            marginTop: '16px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          Moving to next area...
        </div>
      </div>

      {/* Vignette effect - reduced */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.4) 100%)',
          zIndex: 49,
          pointerEvents: 'none',
          opacity: 0.3 + progress * 0.3
        }}
      />
    </>
  );
}

export default RoomTransition;
