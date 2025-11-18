import React, { useState, useEffect } from 'react';
import { UI_ZONES, Z_LAYERS, getUIClasses } from './UILayout.jsx';

/**
 * Notification Display - Shows large on-screen notifications
 * Now positioned above center to not block crosshair
 */
export function NotificationDisplay() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (event) => {
      const { message, type = 'info', duration = 3000 } = event.detail || {};

      if (message) {
        const newNotif = { message, type, id: Date.now() };
        setNotifications(prev => [...prev, newNotif]);

        // Auto-hide after duration
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, duration);
      }
    };

    window.addEventListener('showNotification', handleNotification);

    return () => {
      window.removeEventListener('showNotification', handleNotification);
    };
  }, []);

  if (notifications.length === 0) return null;

  // Different colors based on type
  const getColorClass = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-300';
      case 'error':
        return 'bg-red-500 border-red-300';
      case 'warning':
        return 'bg-yellow-500 border-yellow-300';
      case 'info':
      default:
        return 'bg-blue-500 border-blue-300';
    }
  };

  return (
    <div className={getUIClasses(UI_ZONES.NOTIFICATION_STACK, Z_LAYERS.NOTIFICATIONS)}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getColorClass(notification.type)} text-white px-8 py-6 rounded-lg font-bold text-2xl border-4 shadow-2xl animate-bounce`}
          style={{
            animation: 'bounce 0.5s ease-in-out 3, fadeIn 0.3s ease-in',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

export default NotificationDisplay;
