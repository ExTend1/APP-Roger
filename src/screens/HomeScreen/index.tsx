import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../contexts/authStore';
import CustomHeader from '../../components/CustomHeader';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    console.log('🚪 Iniciando logout desde HomeScreen...');
    await logout();
    // Navegación explícita como respaldo
    setTimeout(() => {
      console.log('🔄 Navegando a login...');
      router.replace('/login');
    }, 200);
  };

  // Manejadores para los iconos del header
  const handleBellPress = () => {
    console.log('🔔 Notificaciones');
    // Aquí puedes navegar a las notificaciones
  };

  const handleSettingsPress = () => {
    console.log('⚙️ Configuración');
    // Aquí puedes navegar a la configuración
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      
      {/* Header personalizado */}
      <CustomHeader
        onBellPress={handleBellPress}
        onSettingsPress={handleSettingsPress}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Content */}
        <View style={styles.content}>
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                🏋️‍♂️ Roger Gym
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Tu app de entrenamiento
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                👤 Tu Perfil
              </Text>
              <Text style={[styles.profileText, { color: theme.colors.onSurfaceVariant }]}>
                Email: {user?.email}
              </Text>
              <Text style={[styles.profileText, { color: theme.colors.onSurfaceVariant }]}>
                Rol: {user?.rol}
              </Text>
            </Card.Content>
          </Card>

          {/* Botón de logout */}
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            labelStyle={[styles.logoutButtonLabel, { color: theme.colors.error }]}
            buttonColor="transparent"
          >
            Cerrar Sesión
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
  },
  profileText: {
    fontSize: 14,
    marginBottom: 4,
  },
  logoutButton: {
    marginTop: 32,
    borderColor: 'transparent',
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  logoutButtonLabel: {
    fontSize: 16,
  },
});

export default HomeScreen;