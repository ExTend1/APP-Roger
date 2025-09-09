// Comentado temporalmente por problemas de autenticación en producción
/*
import ProfileEditScreen from '@/src/screens/ProfileEditScreen';

export default ProfileEditScreen;
*/

// Pantalla temporal que muestra mensaje de funcionalidad deshabilitada
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function ProfileEditScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Editar Perfil
          </Text>
          <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.onSurface }]}>
            Esta funcionalidad está temporalmente deshabilitada por mantenimiento.
          </Text>
          <Text variant="bodyMedium" style={[styles.subMessage, { color: theme.colors.onSurfaceVariant }]}>
            Si necesitas actualizar tu información personal, contacta al gimnasio.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    margin: 16,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subMessage: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 