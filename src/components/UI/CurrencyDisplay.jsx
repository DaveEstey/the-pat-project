/**
 * Currency Display Component
 * Shows player's currency balances
 */

import React, { useState, useEffect } from 'react';
import { CurrencyType } from '../../systems/CurrencySystem.js';

export function CurrencyDisplay({ position = 'top-right' }) {
  const [balances, setBalances] = useState({
    [CurrencyType.CREDITS]: 0,
    [CurrencyType.GEMS]: 0,
    [CurrencyType.SCRAP]: 0
  });

  const [recentEarnings, setRecentEarnings] = useState([]);

  useEffect(() => {
    const handleCurrencyEarned = (event) => {
      const { currencyType, amount, total } = event.detail;

      // Update balance
      setBalances(prev => ({
        ...prev,
        [currencyType]: total
      }));

      // Show earning animation
      const earning = {
        id: Date.now(),
        type: currencyType,
        amount,
        timestamp: Date.now()
      };

      setRecentEarnings(prev => [...prev, earning]);

      // Remove after 2 seconds
      setTimeout(() => {
        setRecentEarnings(prev => prev.filter(e => e.id !== earning.id));
      }, 2000);
    };

    const handleCurrencySpent = (event) => {
      const { currencyType, remaining } = event.detail;

      setBalances(prev => ({
        ...prev,
        [currencyType]: remaining
      }));
    };

    window.addEventListener('currencyEarned', handleCurrencyEarned);
    window.addEventListener('currencySpent', handleCurrencySpent);

    return () => {
      window.removeEventListener('currencyEarned', handleCurrencyEarned);
      window.removeEventListener('currencySpent', handleCurrencySpent);
    };
  }, []);

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Get currency icon and color
  const getCurrencyStyle = (type) => {
    switch (type) {
      case CurrencyType.CREDITS:
        return { icon: '💰', color: 'text-yellow-400', bg: 'bg-yellow-900' };
      case CurrencyType.GEMS:
        return { icon: '💎', color: 'text-blue-400', bg: 'bg-blue-900' };
      case CurrencyType.SCRAP:
        return { icon: '🔩', color: 'text-gray-400', bg: 'bg-gray-900' };
      default:
        return { icon: '❓', color: 'text-white', bg: 'bg-gray-800' };
    }
  };

  return (
    <>
      {/* Currency Display */}
      <div className={`absolute ${getPositionClasses()} pointer-events-auto z-30`}>
        <div className="bg-black bg-opacity-80 rounded-lg p-3 border-2 border-gray-700">
          <div className="space-y-2">
            {/* Credits */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCurrencyStyle(CurrencyType.CREDITS).icon}</span>
              <div className="flex-1">
                <div className="text-xs text-gray-400">Credits</div>
                <div className={`text-lg font-bold ${getCurrencyStyle(CurrencyType.CREDITS).color}`}>
                  {formatNumber(balances[CurrencyType.CREDITS])}
                </div>
              </div>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCurrencyStyle(CurrencyType.GEMS).icon}</span>
              <div className="flex-1">
                <div className="text-xs text-gray-400">Gems</div>
                <div className={`text-lg font-bold ${getCurrencyStyle(CurrencyType.GEMS).color}`}>
                  {formatNumber(balances[CurrencyType.GEMS])}
                </div>
              </div>
            </div>

            {/* Scrap */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCurrencyStyle(CurrencyType.SCRAP).icon}</span>
              <div className="flex-1">
                <div className="text-xs text-gray-400">Scrap</div>
                <div className={`text-lg font-bold ${getCurrencyStyle(CurrencyType.SCRAP).color}`}>
                  {formatNumber(balances[CurrencyType.SCRAP])}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Earnings Notifications */}
      <div className={`absolute ${getPositionClasses().replace('right-4', 'right-48')} pointer-events-none z-40`}>
        <div className="space-y-2">
          {recentEarnings.map(earning => {
            const style = getCurrencyStyle(earning.type);
            return (
              <div
                key={earning.id}
                className={`${style.bg} ${style.color} px-3 py-2 rounded-lg border-2 border-current animate-slide-in-right`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{style.icon}</span>
                  <span className="font-bold">+{formatNumber(earning.amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default CurrencyDisplay;
