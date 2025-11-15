import React, { useState, useEffect, useCallback } from 'react';
import { ShootableTarget } from './ShootableTarget.jsx';

/**
 * SequencePuzzleManager - Manages target sequences for puzzle rooms
 * Players must shoot targets in the correct order to unlock rewards
 */
export function SequencePuzzleManager({
  gameEngine,
  puzzleConfig,
  onPuzzleComplete,
  onPuzzleFailed,
  roomPosition = { x: 0, y: 0, z: 0 }
}) {
  const [currentSequence, setCurrentSequence] = useState([]);
  const [requiredSequence, setRequiredSequence] = useState([]);
  const [puzzleState, setPuzzleState] = useState('active'); // 'active', 'completed', 'failed'
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Initialize puzzle from config
  useEffect(() => {
    if (!puzzleConfig) return;

    // Extract required sequence from config
    const sequence = puzzleConfig.targets
      .filter(t => t.requiresSequence)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map(t => t.targetId);

    setRequiredSequence(sequence);
    setCurrentSequence([]);
    setPuzzleState('active');
    setFeedbackMessage('Shoot the targets in the correct order!');
  }, [puzzleConfig]);

  // Handle target hits
  const handleTargetHit = useCallback((targetId) => {
    if (puzzleState !== 'active') return;

    setCurrentSequence(prev => {
      const newSequence = [...prev, targetId];

      // Check if sequence is still valid
      const expectedTargetId = requiredSequence[newSequence.length - 1];

      if (targetId !== expectedTargetId) {
        // Wrong target hit - puzzle failed
        setPuzzleState('failed');
        setFeedbackMessage('Wrong order! Puzzle failed.');

        if (onPuzzleFailed) {
          setTimeout(() => onPuzzleFailed(), 1000);
        }
        return newSequence;
      }

      // Correct target hit
      if (newSequence.length === requiredSequence.length) {
        // Puzzle complete!
        setPuzzleState('completed');
        setFeedbackMessage('Puzzle solved! Secret room unlocked!');

        // Emit secret room unlock event
        window.dispatchEvent(new CustomEvent('secretRoomUnlocked', {
          detail: {
            levelNumber: puzzleConfig.levelNumber || 1,
            rewardType: puzzleConfig.reward?.type,
            message: puzzleConfig.reward?.message
          }
        }));

        if (onPuzzleComplete) {
          setTimeout(() => onPuzzleComplete(), 1000);
        }
      } else {
        // Still in progress
        setFeedbackMessage(`Target ${newSequence.length}/${requiredSequence.length} hit!`);
      }

      return newSequence;
    });
  }, [puzzleState, requiredSequence, onPuzzleComplete, onPuzzleFailed]);

  // Render targets if puzzle config exists
  if (!puzzleConfig || !puzzleConfig.targets) {
    return null;
  }

  return (
    <>
      {/* Render all shootable targets */}
      {puzzleConfig.targets.map((targetConfig, index) => (
        <ShootableTarget
          key={targetConfig.targetId}
          gameEngine={gameEngine}
          position={{
            x: roomPosition.x + targetConfig.position.x,
            y: roomPosition.y + targetConfig.position.y,
            z: roomPosition.z + targetConfig.position.z
          }}
          targetId={targetConfig.targetId}
          color={targetConfig.color}
          size={targetConfig.size || 0.8}
          requiresSequence={targetConfig.requiresSequence}
          sequenceNumber={targetConfig.sequenceNumber}
          onHit={handleTargetHit}
        />
      ))}

      {/* Puzzle feedback UI */}
      {feedbackMessage && (
        <div
          style={{
            position: 'fixed',
            top: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: puzzleState === 'completed' ? 'rgba(0, 255, 0, 0.9)' :
                            puzzleState === 'failed' ? 'rgba(255, 0, 0, 0.9)' :
                            'rgba(0, 150, 255, 0.9)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: puzzleState === 'completed' || puzzleState === 'failed' ? 'pulse 0.5s ease-in-out' : 'none'
          }}
        >
          {feedbackMessage}
        </div>
      )}

      {/* Sequence progress indicator */}
      {puzzleState === 'active' && requiredSequence.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 1000,
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}
        >
          <span>Sequence Progress:</span>
          {requiredSequence.map((_, index) => (
            <div
              key={index}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: index < currentSequence.length ? '#00ff00' : '#444',
                border: '2px solid #fff',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default SequencePuzzleManager;
