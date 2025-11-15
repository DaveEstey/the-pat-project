import React from 'react';

const HealthBar = ({ health, maxHealth }) => {
  const healthPercentage = Math.max(0, (health / maxHealth) * 100);
  const isLowHealth = healthPercentage < 30;

  return (
    <div className="bg-black bg-opacity-50 p-3 rounded-lg">
      <div className="text-white text-sm mb-1">Health</div>
      <div className="flex items-center space-x-2">
        <div className="w-48 h-6 bg-gray-700 rounded overflow-hidden border-2 border-gray-500">
          <div 
            className={`h-full transition-all duration-300 ${
              isLowHealth ? 'bg-red-500 animate-pulse' : 'bg-green-500'
            }`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
        <div className={`text-sm font-bold ${isLowHealth ? 'text-red-400' : 'text-white'}`}>
          {Math.ceil(health)}/{maxHealth}
        </div>
      </div>
      
      {/* Health warning */}
      {isLowHealth && (
        <div className="text-red-400 text-xs mt-1 animate-pulse">
          LOW HEALTH!
        </div>
      )}
    </div>
  );
};

export default HealthBar;