import React, { useState, useEffect } from 'react';

/**
 * Notification Display - Shows large on-screen notifications
 */
export function NotificationDisplay() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleNotification = (event) => {
      const { message, type = 'info', duration = 3000 } = event.detail || {};

      if (message) {

        setNotification({ message, type, id: Date.now() });

        // Auto-hide after duration
        setTimeout(() => {
          setNotification(null);
        }, duration);
      }
    };

    window.addEventListener('showNotification', handleNotification);

    return () => {
      window.removeEventListener('showNotification', handleNotification);
    };
  }, []);

  if (!notification) return null;

  // Different colors based on type
  const getColorClass = () => {
    switch (notification.type) {
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
    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div
        className={`${getColorClass()} text-white px-8 py-6 rounded-lg font-bold text-2xl border-4 shadow-2xl animate-bounce`}
        style={{
          animation: 'bounce 0.5s ease-in-out 3, fadeIn 0.3s ease-in',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        {notification.message}
      </div>
    </div>
  );
}

export default NotificationDisplay;
