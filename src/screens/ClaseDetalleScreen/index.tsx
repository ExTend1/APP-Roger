import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const ClaseDetalleScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
          <Text style={[styles.headerText, { color: theme.colors.onPrimary }]}>
            📅 Detalle de Clase
          </Text>
        </Surface>

        {/* Content */}
        <View style={styles.content}>
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                🏋️‍♂️ Funcional
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Entrenamiento funcional completo
              </Text>
              <Text style={[styles.cardText, { color: theme.colors.onSurfaceVariant }]}>
                📅 Lunes, 10:00 AM
              </Text>
              <Text style={[styles.cardText, { color: theme.colors.onSurfaceVariant }]}>
                👨‍🏫 Instructor: Carlos Pérez
              </Text>
              <Text style={[styles.cardText, { color: theme.colors.onSurfaceVariant }]}>
                ⏱️ Duración: 45 minutos
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                📝 Descripción
              </Text>
              <Text style={[styles.cardText, { color: theme.colors.onSurfaceVariant }]}>
                Clase de entrenamiento funcional que combina ejercicios de fuerza, 
                resistencia y flexibilidad. Ideal para mejorar la condición física general.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                🎯 Beneficios
              </Text>
              <Text style={[styles.cardText, { color: theme.colors.onSurfaceVariant }]}>
                • Mejora la fuerza funcional{'\n'}
                • Aumenta la resistencia cardiovascular{'\n'}
                • Desarrolla la coordinación{'\n'}
                • Quema calorías efectivamente
              </Text>
            </Card.Content>
          </Card>
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
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default ClaseDetalleScreen;