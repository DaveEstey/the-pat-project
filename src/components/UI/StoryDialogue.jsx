import React, { useState, useEffect } from 'react';
import { getCharacter } from '../../data/storyData.js';

/**
 * Story Dialogue Component
 * Displays narrative text with character portraits
 */
const StoryDialogue = ({ story, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [textProgress, setTextProgress] = useState(0);
  const [skipAvailable, setSkipAvailable] = useState(false);

  useEffect(() => {
    if (!story) {
      setVisible(false);
      return;
    }

    // Show dialogue
    setVisible(true);
    setTextProgress(0);
    setSkipAvailable(false);

    // Text typewriter effect
    const textLength = story.text.length;
    const typeSpeed = 30; // ms per character
    let currentChar = 0;

    const typeInterval = setInterval(() => {
      currentChar++;
      setTextProgress(currentChar);

      if (currentChar >= textLength) {
        clearInterval(typeInterval);
        setSkipAvailable(true);
      }
    }, typeSpeed);

    // Auto-dismiss after duration
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, story.duration || 4000);

    // Allow skip after 1 second
    const skipTimer = setTimeout(() => {
      setSkipAvailable(true);
    }, 1000);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(dismissTimer);
      clearTimeout(skipTimer);
    };
  }, [story]);

  const handleClose = () => {
    setVisible(false);

    // Dispatch global event that story dialogue is complete
    window.dispatchEvent(new CustomEvent('storyDialogueComplete', {
      detail: { timestamp: Date.now() }
    }));

    if (onComplete) {
      setTimeout(onComplete, 300); // Small delay for fade animation
    }
  };

  const handleSkip = () => {
    if (skipAvailable) {
      setTextProgress(story.text.length);
      handleClose();
    }
  };

  if (!visible || !story) return null;

  const character = getCharacter(story.character);
  const displayedText = story.text.substring(0, textProgress);
  const isComplete = textProgress >= story.text.length;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-end justify-center z-50 animate-fade-in"
      onClick={handleSkip}
    >
      {/* Dialogue box */}
      <div className="w-full max-w-4xl mb-8 mx-4 bg-gradient-to-b from-gray-900 to-black border-4 border-cyan-500 rounded-lg shadow-2xl overflow-hidden animate-slide-up">
        {/* Header with character info */}
        <div className="bg-gradient-to-r from-cyan-900 to-blue-900 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Character avatar placeholder */}
            <div
              className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-2xl"
              style={{ backgroundColor: character.color }}
            >
              {story.character[0]}
            </div>
            <div>
              <div className="text-white font-bold text-lg">{character.name}</div>
              {story.title && (
                <div className="text-cyan-300 text-sm">{story.title}</div>
              )}
            </div>
          </div>

          {/* Skip indicator */}
          {skipAvailable && (
            <div className="text-gray-400 text-sm animate-pulse">
              Click to {isComplete ? 'continue' : 'skip'} →
            </div>
          )}
        </div>

        {/* Dialogue text */}
        <div className="px-8 py-6 bg-black bg-opacity-50">
          <p className="text-white text-xl leading-relaxed">
            {displayedText}
            {!isComplete && (
              <span className="inline-block w-2 h-6 bg-cyan-400 ml-1 animate-blink"></span>
            )}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-cyan-500 transition-all duration-100"
            style={{ width: `${(textProgress / story.text.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes story-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes story-slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes story-blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .animate-fade-in {
          animation: story-fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: story-slide-up 0.4s ease-out;
        }

        .animate-blink {
          animation: story-blink 0.8s infinite;
        }
      `}</style>
    </div>
  );
};

export default StoryDialogue;
