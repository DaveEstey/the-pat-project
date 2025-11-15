import React from 'react';

const ScoreDisplay = ({ score, accuracy, level }) => {
  const formatScore = (num) => {
    return num.toLocaleString();
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-400';
    if (accuracy >= 60) return 'text-yellow-400';
    if (accuracy >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-black bg-opacity-50 p-3 rounded-lg text-white text-right">
      <div className="space-y-1">
        <div className="text-lg font-bold">
          Score: <span className="text-yellow-400">{formatScore(score)}</span>
        </div>
        <div className="text-sm">
          Accuracy: <span className={getAccuracyColor(accuracy)}>{accuracy.toFixed(1)}%</span>
        </div>
        <div className="text-sm text-gray-300">
          Level: {level}
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;