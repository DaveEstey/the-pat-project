/**
 * Tutorial Popup Component
 * Displays tutorial tips and instructions to the player
 */

import React, { useState, useEffect, useRef } from 'react';

export function TutorialPopup() {
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const handleShow = (event) => {
      const { stepId, title, description, icon, duration, canSkip, priority } = event.detail;

      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      setActiveTutorial({
        stepId,
        title,
        description,
        icon,
        duration,
        canSkip,
        priority
      });
      setIsVisible(true);
      setProgress(0);

      // Animate progress bar
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressPercent = Math.min((elapsed / duration) * 100, 100);
        setProgress(progressPercent);

        if (progressPercent >= 100) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }, 50);
    };

    const handleComplete = (event) => {
      const { stepId } = event.detail;
      if (activeTutorial && activeTutorial.stepId === stepId) {
        setIsVisible(false);
        setTimeout(() => {
          setActiveTutorial(null);
          setProgress(0);
        }, 300);
      }
    };

    const handleSkipped = (event) => {
      const { stepId } = event.detail;
      if (activeTutorial && activeTutorial.stepId === stepId) {
        setIsVisible(false);
        setTimeout(() => {
          setActiveTutorial(null);
          setProgress(0);
        }, 300);
      }
    };

    window.addEventListener('tutorialShow', handleShow);
    window.addEventListener('tutorialComplete', handleComplete);
    window.addEventListener('tutorialSkipped', handleSkipped);

    return () => {
      // Clear progress interval on unmount
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      window.removeEventListener('tutorialShow', handleShow);
      window.removeEventListener('tutorialComplete', handleComplete);
      window.removeEventListener('tutorialSkipped', handleSkipped);
    };
  }, [activeTutorial]);

  const handleSkip = () => {
    if (activeTutorial && activeTutorial.canSkip) {
      window.dispatchEvent(new CustomEvent('tutorialSkipRequested', {
        detail: { stepId: activeTutorial.stepId }
      }));
      setIsVisible(false);
      setTimeout(() => {
        setActiveTutorial(null);
        setProgress(0);
      }, 300);
    }
  };

  if (!activeTutorial) {
    return null;
  }

  return (
    <div
      className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{ maxWidth: '600px', width: '90%' }}
    >
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg shadow-2xl border-2 border-blue-400 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 bg-opacity-50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeTutorial.icon}</span>
            <h3 className="text-xl font-bold text-white">{activeTutorial.title}</h3>
          </div>
          {activeTutorial.canSkip && (
            <button
              onClick={handleSkip}
              className="text-white hover:text-red-400 transition-colors text-sm font-semibold px-3 py-1 rounded bg-black bg-opacity-30 hover:bg-opacity-50"
            >
              Skip (ESC)
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-white text-lg leading-relaxed">
            {activeTutorial.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-blue-950">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Priority Indicator (for debugging, can be removed) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="px-6 py-2 bg-black bg-opacity-30 text-xs text-gray-400">
            Priority: {activeTutorial.priority} | Step: {activeTutorial.stepId}
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorialPopup;
