import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * BossIntroSequence - Dramatic introduction sequence for boss enemies
 * Features camera zoom, UI overlays, and boss name reveal
 */
export function BossIntroSequence({
  gameEngine,
  bossData,
  onIntroComplete,
  playerCamera
}) {
  const [introState, setIntroState] = useState('starting'); // 'starting', 'zooming', 'revealing', 'complete'
  const [showUI, setShowUI] = useState(false);
  const [bossNameVisible, setBossNameVisible] = useState(false);
  const originalCameraPos = useRef(null);
  const originalCameraRot = useRef(null);
  const animationFrameRef = useRef(null);

  // Start intro sequence
  useEffect(() => {
    if (!gameEngine || !bossData || !playerCamera) return;

    // Save original camera position
    originalCameraPos.current = {
      x: playerCamera.position.x,
      y: playerCamera.position.y,
      z: playerCamera.position.z
    };
    originalCameraRot.current = {
      x: playerCamera.rotation.x,
      y: playerCamera.rotation.y,
      z: playerCamera.rotation.z
    };

    // Start sequence
    setTimeout(() => {
      setIntroState('zooming');
      startCameraZoom();
    }, 500);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameEngine, bossData, playerCamera]);

  // Camera zoom animation towards boss
  const startCameraZoom = () => {
    if (!playerCamera || !bossData) return;

    const startTime = Date.now();
    const duration = 2000; // 2 second zoom

    // Calculate target position (closer to boss)
    const bossPos = bossData.position;
    const targetPos = {
      x: bossPos.x,
      y: bossPos.y + 2, // Above boss
      z: bossPos.z + 5 // In front of boss
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing function
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Interpolate camera position
      playerCamera.position.x = originalCameraPos.current.x +
        (targetPos.x - originalCameraPos.current.x) * easeProgress;
      playerCamera.position.y = originalCameraPos.current.y +
        (targetPos.y - originalCameraPos.current.y) * easeProgress;
      playerCamera.position.z = originalCameraPos.current.z +
        (targetPos.z - originalCameraPos.current.z) * easeProgress;

      // Look at boss
      playerCamera.lookAt(bossPos.x, bossPos.y + 1, bossPos.z);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Zoom complete, show boss name
        setIntroState('revealing');
        setShowUI(true);

        setTimeout(() => {
          setBossNameVisible(true);
        }, 200);

        // Hold on boss for 2 seconds
        setTimeout(() => {
          startCameraReturn();
        }, 2500);
      }
    };

    animate();
  };

  // Return camera to original position
  const startCameraReturn = () => {
    if (!playerCamera) return;

    const startTime = Date.now();
    const duration = 1500; // 1.5 second return

    const currentPos = {
      x: playerCamera.position.x,
      y: playerCamera.position.y,
      z: playerCamera.position.z
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Interpolate back to original
      playerCamera.position.x = currentPos.x +
        (originalCameraPos.current.x - currentPos.x) * easeProgress;
      playerCamera.position.y = currentPos.y +
        (originalCameraPos.current.y - currentPos.y) * easeProgress;
      playerCamera.position.z = currentPos.z +
        (originalCameraPos.current.z - currentPos.z) * easeProgress;

      // Restore original rotation
      playerCamera.rotation.x = originalCameraRot.current.x;
      playerCamera.rotation.y = originalCameraRot.current.y;
      playerCamera.rotation.z = originalCameraRot.current.z;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Intro complete
        setIntroState('complete');
        setShowUI(false);

        if (onIntroComplete) {
          onIntroComplete();
        }
      }
    };

    animate();
  };

  if (!bossData || introState === 'complete') {
    return null;
  }

  return (
    <>
      {/* Dark overlay during intro */}
      {showUI && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            opacity: showUI ? 1 : 0
          }}
        />
      )}

      {/* Boss name reveal */}
      {showUI && bossNameVisible && (
        <div
          style={{
            position: 'fixed',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 101,
            textAlign: 'center',
            animation: 'fadeInScale 0.5s ease-out forwards'
          }}
        >
          {/* Boss type label */}
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#ff4444',
              textShadow: '0 0 10px rgba(255, 68, 68, 0.8), 0 4px 8px rgba(0,0,0,0.8)',
              marginBottom: '16px',
              letterSpacing: '4px',
              textTransform: 'uppercase'
            }}
          >
            {bossData.category || 'BOSS ENCOUNTER'}
          </div>

          {/* Boss name */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#ffffff',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 68, 68, 0.6), 0 8px 16px rgba(0,0,0,0.9)',
              letterSpacing: '2px',
              marginBottom: '24px'
            }}
          >
            {bossData.name || 'UNKNOWN THREAT'}
          </div>

          {/* Boss health bar */}
          <div
            style={{
              width: '600px',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              margin: '0 auto'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#ff4444',
                boxShadow: '0 0 10px rgba(255, 68, 68, 0.8)',
                animation: 'healthBarFill 0.8s ease-out forwards'
              }}
            />
          </div>

          {/* Boss subtitle/description */}
          {bossData.subtitle && (
            <div
              style={{
                fontSize: '18px',
                color: '#cccccc',
                marginTop: '16px',
                fontStyle: 'italic',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {bossData.subtitle}
            </div>
          )}
        </div>
      )}

      {/* Warning text */}
      {showUI && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 101,
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ff4444',
            textShadow: '0 0 10px rgba(255, 68, 68, 0.8), 0 4px 8px rgba(0,0,0,0.8)',
            animation: 'pulse 1s ease-in-out infinite',
            letterSpacing: '2px'
          }}
        >
          ⚠ PREPARE FOR BATTLE ⚠
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }

        @keyframes healthBarFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
}

export default BossIntroSequence;
