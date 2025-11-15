import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { GameStates } from '../../types/game.js';

// Game Over Screen - Shows when player runs out of health and lives
export function GameOverScreen() {
  const { state, setGameState, resetGame, restartLevel } = useGame();
  const [showDetails, setShowDetails] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('fadeIn');
  
  useEffect(() => {
    // Animation sequence
    setTimeout(() => setAnimationPhase('visible'), 100);
    setTimeout(() => setShowDetails(true), 800);
  }, []);
  
  const handleRestart = () => {
    // Reset only health and level state, keep score/stats/lives
    restartLevel();
    // Immediately restart the same level
    setTimeout(() => {
      setGameState(GameStates.PLAYING);
    }, 100);
  };
  
  const handleMainMenu = () => {
    setGameState(GameStates.MENU);
  };
  
  if (state.gameState !== GameStates.GAME_OVER) {
    return null;
  }
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ${
        animationPhase === 'fadeIn' ? 'bg-black bg-opacity-0' : 'bg-black bg-opacity-90'
      }`}
    >
      <div className={`text-white text-center transition-all duration-800 ${
        animationPhase === 'fadeIn' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
      }`}>
        
        {/* Game Over Title */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-500 mb-4">
            GAME OVER
          </h1>
          <div className="text-xl text-gray-300">
            Your mission has failed
          </div>
        </div>
        
        {/* Player Stats */}
        {showDetails && (
          <div className="mb-8 transition-opacity duration-500">
            <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 mx-auto max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-blue-400">Final Stats</h3>
              
              <div className="grid grid-cols-2 gap-4 text-lg">
                <div className="text-right text-gray-400">Score:</div>
                <div className="text-left text-white font-bold">{state.player.score.toLocaleString()}</div>
                
                <div className="text-right text-gray-400">Level:</div>
                <div className="text-left text-white font-bold">{state.currentLevel}</div>
                
                <div className="text-right text-gray-400">Accuracy:</div>
                <div className="text-left text-white font-bold">{state.player.accuracy}%</div>
                
                <div className="text-right text-gray-400">Lives Used:</div>
                <div className="text-left text-red-400 font-bold">{3 - state.player.lives}/3</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        {showDetails && (
          <div className="space-y-4 transition-opacity duration-500">
            <button
              onClick={handleRestart}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors duration-200 block mx-auto"
            >
              🔄 RESTART LEVEL
            </button>
            
            <button
              onClick={handleMainMenu}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 block mx-auto"
            >
              📋 MAIN MENU
            </button>
          </div>
        )}
        
        {/* Subtle animated elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-red-500 rounded-full opacity-30 animate-bounce"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameOverScreen;