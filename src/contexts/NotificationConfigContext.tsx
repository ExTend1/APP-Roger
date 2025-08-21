import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationConfigContextType {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  toggleNotifications: () => Promise<void>;
}

const NotificationConfigContext = createContext<NotificationConfigContextType | undefined>(undefined);

export const useNotificationConfig = () => {
  const context = useContext(NotificationConfigContext);
  if (!context) {
    throw new Error('useNotificationConfig debe usarse dentro de NotificationConfigProvider');
  }
  return context;
};

interface NotificationConfigProviderProps {
  children: React.ReactNode;
}

export const NotificationConfigProvider: React.FC<NotificationConfigProviderProps> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    loadNotificationConfig();
  }, []);

  const loadNotificationConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('notificationConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setNotificationsEnabledState(config.enabled ?? true);
      }
    } catch (error) {
      console.warn('Error al cargar configuración de notificaciones:', error);
    }
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    try {
      setNotificationsEnabledState(enabled);
      await AsyncStorage.setItem('notificationConfig', JSON.stringify({ enabled }));
    } catch (error) {
      console.error('Error al guardar configuración de notificaciones:', error);
    }
  };

  const toggleNotifications = async () => {
    await setNotificationsEnabled(!notificationsEnabled);
  };

  const value: NotificationConfigContextType = {
    notificationsEnabled,
    setNotificationsEnabled,
    toggleNotifications,
  };

  return (
    <NotificationConfigContext.Provider value={value}>
      {children}
    </NotificationConfigContext.Provider>
  );
};
