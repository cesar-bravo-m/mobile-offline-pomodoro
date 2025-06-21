import React, { createContext, useContext, useState } from 'react';
import Notification from './Notification';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  isVisible: boolean;
}

interface NotificationContextType {
  showNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 15);
    const newNotification: NotificationData = { 
      id, 
      title, 
      message, 
      type,
      isVisible: true
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markNotificationVisible = (id: string, isVisible: boolean) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isVisible } 
          : notification
      )
    );
  };

  // Get only visible notifications for stacking
  const visibleNotifications = notifications.filter(n => n.isVisible);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notification, index) => {
        const visibleIndex = visibleNotifications.findIndex(n => n.id === notification.id);
        const isTop = visibleIndex === visibleNotifications.length - 1;
        
        return (
          <Notification
            key={notification.id}
            visible={notification.isVisible}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onHide={() => hideNotification(notification.id)}
            onVisibilityChange={(isVisible) => markNotificationVisible(notification.id, isVisible)}
            isTop={isTop}
            stackIndex={visibleIndex}
            totalCount={visibleNotifications.length}
          />
        );
      })}
    </NotificationContext.Provider>
  );
}; 