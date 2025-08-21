import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ReservaConClase } from '../types/reservas';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private notificationIds: Map<string, string> = new Map(); // claseId -> notificationId

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Solicitar permisos de notificación
  async requestPermissions(): Promise<boolean> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permisos de notificación no otorgados');
        return false;
      }
      
      return true;
    } else {
      console.log('Las notificaciones push solo funcionan en dispositivos físicos');
      return false;
    }
  }

  // Obtener el token de notificación
  async getNotificationToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Necesitarás reemplazar esto con tu Project ID
      });
      return token.data;
    } catch (error) {
      console.error('Error al obtener token de notificación:', error);
      return null;
    }
  }

  // Programar recordatorio de clase
  async scheduleClassReminder(reserva: ReservaConClase): Promise<string | null> {
    try {
      // Calcular la fecha y hora de la clase
      const claseDate = this.calculateNextClassDate(reserva);
      if (!claseDate) {
        console.log('No se pudo calcular la fecha de la clase');
        return null;
      }

      // Programar notificación 1 hora antes
      const reminderTime = new Date(claseDate.getTime() - 60 * 60 * 1000); // 1 hora antes
      
      // Solo programar si la notificación es en el futuro
      if (reminderTime <= new Date()) {
        console.log('La clase ya pasó o es muy pronto para programar notificación');
        return null;
      }

      // Crear ID único para la notificación
      const notificationId = `clase_${reserva.claseId}_${reserva.id}`;
      
      // Cancelar notificación existente si existe
      await this.cancelClassReminder(reserva.claseId);

      // Programar nueva notificación
      const scheduledNotificationId = await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: `Recordatorio: ${reserva.clase.nombre}`,
          body: `Tu clase comienza en 1 hora. ${reserva.clase.profesor} - ${reserva.clase.sala || 'Sala por confirmar'}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            reservaId: reserva.id,
            claseId: reserva.claseId,
            className: reserva.clase.nombre,
            reminderType: 'class_reminder'
          },
        },
        trigger: {
          date: reminderTime,
        } as Notifications.DateTriggerInput,
      });

      // Guardar el ID de la notificación
      this.notificationIds.set(reserva.claseId, scheduledNotificationId);
      
      console.log(`Notificación programada para ${reserva.clase.nombre} en ${reminderTime.toLocaleString()}`);
      return scheduledNotificationId;
    } catch (error) {
      console.error('Error al programar notificación de clase:', error);
      return null;
    }
  }

  // Cancelar recordatorio de clase
  async cancelClassReminder(claseId: string): Promise<boolean> {
    try {
      const notificationId = this.notificationIds.get(claseId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        this.notificationIds.delete(claseId);
        console.log(`Notificación cancelada para clase ${claseId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al cancelar notificación de clase:', error);
      return false;
    }
  }

  // Cancelar todas las notificaciones programadas
  async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationIds.clear();
      console.log('Todas las notificaciones canceladas');
      return true;
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
      return false;
    }
  }

  // Obtener todas las notificaciones programadas
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return [];
    }
  }

  // Programar notificación local personalizada
  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data,
        },
        trigger,
      });
      return notificationId;
    } catch (error) {
      console.error('Error al programar notificación local:', error);
      return null;
    }
  }

  // Calcular la próxima fecha de clase basada en los días y horario
  private calculateNextClassDate(reserva: ReservaConClase): Date | null {
    try {
      const now = new Date();
      const [hours, minutes] = reserva.clase.horario.split(':').map(Number);
      
      // Obtener los días de la semana (0 = Domingo, 1 = Lunes, etc.)
      const diasSemana = reserva.clase.dias.map(dia => {
        const diasMap: { [key: string]: number } = {
          'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'JUEVES': 4,
          'VIERNES': 5, 'SABADO': 6, 'DOMINGO': 0
        };
        return diasMap[dia.toUpperCase()] || 0;
      });

      // Buscar el próximo día de clase
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        checkDate.setHours(hours, minutes, 0, 0);
        
        if (diasSemana.includes(checkDate.getDay()) && checkDate > now) {
          return checkDate;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error al calcular fecha de clase:', error);
      return null;
    }
  }

  // Limpiar notificaciones expiradas
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const scheduledNotifications = await this.getScheduledNotifications();
      const now = new Date();
      
      for (const notification of scheduledNotifications) {
        if (notification.trigger && 'date' in notification.trigger && notification.trigger.date) {
          const triggerDate = new Date(notification.trigger.date);
          if (triggerDate <= now) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            console.log(`Notificación expirada cancelada: ${notification.identifier}`);
          }
        }
      }
    } catch (error) {
      console.error('Error al limpiar notificaciones expiradas:', error);
    }
  }

  // Configurar listener para notificaciones recibidas
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Configurar listener para notificaciones tocadas
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

export default NotificationService;
