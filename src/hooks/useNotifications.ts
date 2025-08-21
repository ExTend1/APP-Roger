import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import NotificationService from '../services/notificationService';

export const useNotifications = () => {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Configurar listener para notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificación recibida:', notification);
    });

    // Configurar listener para cuando se toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      if (data?.reminderType === 'class_reminder') {
        // Navegar a la pantalla de mis turnos cuando se toca la notificación
        router.push('/turnos' as any);
      }
    });

    // Limpiar notificaciones expiradas al iniciar
    const cleanupExpiredNotifications = async () => {
      try {
        await NotificationService.getInstance().cleanupExpiredNotifications();
      } catch (error) {
        console.warn('Error al limpiar notificaciones expiradas:', error);
      }
    };
    
    cleanupExpiredNotifications();

    // Cleanup al desmontar
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Función para solicitar permisos manualmente
  const requestPermissions = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      return await notificationService.requestPermissions();
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  };

  // Función para obtener todas las notificaciones programadas
  const getScheduledNotifications = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      return await notificationService.getScheduledNotifications();
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return [];
    }
  };

  // Función para cancelar todas las notificaciones
  const cancelAllNotifications = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      return await notificationService.cancelAllNotifications();
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
      return false;
    }
  };

  return {
    requestPermissions,
    getScheduledNotifications,
    cancelAllNotifications,
  };
};
