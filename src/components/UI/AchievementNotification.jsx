/**
 * Achievement Notification Component
 * Displays achievement unlock notifications
 */

import React, { useState, useEffect } from 'react';

export function AchievementNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleAchievementUnlocked = (event) => {
      const { achievement } = event.detail;

      const notification = {
        id: Date.now(),
        achievement,
        timestamp: Date.now()
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    window.addEventListener('achievementUnlocked', handleAchievementUnlocked);

    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementUnlocked);
    };
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="bg-gradient-to-r from-yellow-600 to-yellow-800 border-4 border-yellow-400 rounded-lg p-4 min-w-80 animate-slide-in-right shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">{notification.achievement.icon}</div>
            <div className="flex-1">
              <div className="text-yellow-200 text-xs font-bold uppercase">Achievement Unlocked!</div>
              <div className="text-white font-bold text-lg">{notification.achievement.name}</div>
              <div className="text-yellow-100 text-sm">{notification.achievement.description}</div>
              <div className="text-yellow-300 text-xs mt-1">+{notification.achievement.points} points</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AchievementNotification;
