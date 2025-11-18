import React, { useState, useEffect } from 'react';
import { GameProvider } from './contexts/GameContext.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';
import { AudioProvider } from './contexts/AudioContext.jsx';
import GameCanvasWrapper from './components/Game/GameCanvasWrapper.jsx';
import MainMenu from './components/UI/MainMenu.jsx';
import LevelSelect from './components/UI/LevelSelect.jsx';
import Settings from './components/UI/Settings.jsx';
import HUD from './components/UI/HUD.jsx';
import GameOverScreen from './components/UI/GameOverScreen.jsx';
import LevelResultsScreen from './components/UI/LevelResultsScreen.jsx';
import DamageIndicator from './components/UI/DamageIndicator.jsx';
import StoryDialogue from './components/UI/StoryDialogue.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { useGame } from './contexts/GameContext.jsx';
import { GameStates } from './types/game.js';
import { getLevelIntro, getLevelOutro } from './data/storyData.js';

function GameContent() {
  const { state, advanceToNextLevel } = useGame();
  const [currentStory, setCurrentStory] = useState(null);
  const [showStory, setShowStory] = useState(false);

  // Show story on level start
  useEffect(() => {
    if (state.gameState === GameStates.PLAYING && state.currentLevel) {
      const intro = getLevelIntro(state.currentLevel);
      if (intro) {
        setCurrentStory(intro);
        setShowStory(true);
      }
    }
  }, [state.currentLevel, state.gameState]);

  // Show story on level complete
  useEffect(() => {
    if (state.gameState === GameStates.LEVEL_COMPLETE && state.currentLevel) {
      const outro = getLevelOutro(state.currentLevel);
      if (outro) {
        setTimeout(() => {
          setCurrentStory(outro);
          setShowStory(true);
        }, 1000); // Delay to show level complete screen first
      }
    }
  }, [state.gameState]);

  const renderCurrentScreen = () => {
    switch (state.gameState) {
      case GameStates.MENU:
        return <MainMenu />;
      case GameStates.LEVEL_SELECT:
        return <LevelSelect />;
      case GameStates.SETTINGS:
        return <Settings />;
      case GameStates.PLAYING:
        return (
          <>
            <GameCanvasWrapper />
            <HUD />
            <DamageIndicator />
          </>
        );
      case GameStates.PAUSED:
        return (
          <>
            <GameCanvasWrapper />
            <HUD />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
                <p className="text-gray-600">Press ESC to resume</p>
              </div>
            </div>
          </>
        );
      case GameStates.LOADING:
        return (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
              <p className="text-xl">Loading...</p>
            </div>
          </div>
        );
      case GameStates.GAME_OVER:
        return <GameOverScreen />;
      case GameStates.LEVEL_COMPLETE:
        return (
          <>
            {/* Show game canvas in background */}
            <GameCanvasWrapper />
            <LevelResultsScreen
              levelCompleted={state.ui.completedLevel || state.currentLevel}
              onContinue={advanceToNextLevel}
            />
          </>
        );
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {renderCurrentScreen()}

      {/* Story Dialogue Overlay */}
      {showStory && currentStory && (
        <StoryDialogue
          story={currentStory}
          onComplete={() => {
            setShowStory(false);
            setCurrentStory(null);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <ErrorBoundary>
        <SettingsProvider>
          <AudioProvider>
            <GameProvider>
              <GameContent />
            </GameProvider>
          </AudioProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;