import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, List, Switch, Divider, useTheme as usePaperTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuthStore } from '@/src/contexts/authStore';
import { useNotificationConfig } from '@/src/contexts/NotificationConfigContext';
import { SwipeableScreen } from '@/src/components/SwipeableScreen';
import NotificationService from '@/src/services/notificationService';

export default function AjustesScreen() {
  const theme = usePaperTheme();
  const router = useRouter();
  const { themeMode, toggleTheme } = useTheme();
  const { logout } = useAuthStore();
  const { notificationsEnabled, setNotificationsEnabled } = useNotificationConfig();

  // Función para manejar el cambio de estado de notificaciones
  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        // Solicitar permisos cuando se activa
        const notificationService = NotificationService.getInstance();
        const hasPermission = await notificationService.requestPermissions();
        
        if (hasPermission) {
          await setNotificationsEnabled(true);
          Alert.alert('Notificaciones Activadas', 'Recibirás recordatorios de clases 1 hora antes.');
        } else {
          Alert.alert(
            'Permisos Requeridos',
            'Para recibir notificaciones de clases, necesitas permitir el acceso a las notificaciones.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Configuración', 
                onPress: () => {
                  // Aquí podrías abrir la configuración del sistema
                  console.log('Usuario debe ir a Configuración > Notificaciones');
                }
              }
            ]
          );
          return; // No cambiar el estado si no hay permisos
        }
      } else {
        // Desactivar notificaciones
        await setNotificationsEnabled(false);
        // Cancelar todas las notificaciones programadas
        const notificationService = NotificationService.getInstance();
        await notificationService.cancelAllNotifications();
        Alert.alert('Notificaciones Desactivadas', 'Ya no recibirás recordatorios de clases.');
      }
    } catch (error) {
      console.error('Error al cambiar estado de notificaciones:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado de las notificaciones');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // La navegación se maneja automáticamente en el layout
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo de nuevo.');
            }
          },
        },
      ]
    );
  };

  return (
    <SwipeableScreen>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? "light" : "dark"} backgroundColor={theme.colors.surface} />
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            Ajustes
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Personaliza tu experiencia
          </Text>
        </View>

        {/* Notifications Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Notificaciones
            </Text>
            <List.Item
              title="Notificaciones push"
              description="Recibe recordatorios de clases 1 hora antes"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Appearance Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Apariencia
            </Text>
            <List.Item
              title="Modo oscuro"
              description="Cambiar entre tema claro y oscuro"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={themeMode === 'dark'}
                  onValueChange={toggleTheme}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Account Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Cuenta
            </Text>
            <List.Item
              title="Perfil"
              description="Editar información personal"
              left={(props) => <List.Icon {...props} icon="account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/profile-edit' as any)}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Cambiar contraseña"
              description="Actualizar tu contraseña"
              left={(props) => <List.Icon {...props} icon="lock" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Cerrar sesión"
              description="Salir de tu cuenta"
              left={(props) => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
              titleStyle={{ color: theme.colors.error }}
              onPress={handleLogout}
            />
          </Card.Content>
        </Card>

        {/* Support Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Soporte
            </Text>
            <List.Item
              title="Ayuda"
              description="Centro de ayuda y preguntas frecuentes"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/centro-ayuda' as any)}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Contacto"
              description="Ponte en contacto con soporte"
              left={(props) => <List.Icon {...props} icon="message" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Acerca de"
              description="Información de la aplicación"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/acercade' as any)}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Política de Privacidad"
              description="Cómo manejamos tu información"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/politica-privacidad' as any)}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Términos y Condiciones"
              description="Condiciones de uso de la app"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/terminos-condiciones' as any)}
            />
          </Card.Content>
        </Card>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text variant="bodySmall" style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>
            Versión 1.0.0
          </Text>
        </View>
        </ScrollView>
      </SafeAreaView>
    </SwipeableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 4,
  },

  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  versionText: {
    opacity: 0.7,
  },
}); 