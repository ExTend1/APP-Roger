import React from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Surface, Chip, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import CustomHeader from '../../components/CustomHeader';

interface Turno {
  id: string;
  clase: string;
  fecha: string;
  hora: string;
  instructor: string;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
}

const MisTurnosScreen: React.FC = () => {
  const theme = useTheme();

  // Mock data - esto vendrá de la API más tarde
  const turnos: Turno[] = [
    {
      id: '1',
      clase: 'Funcional',
      fecha: '2025-01-30',
      hora: '10:00',
      instructor: 'Carlos Pérez',
      estado: 'confirmado',
    },
    {
      id: '2',
      clase: 'Yoga',
      fecha: '2025-01-31',
      hora: '18:00',
      instructor: 'Ana García',
      estado: 'pendiente',
    },
    {
      id: '3',
      clase: 'CrossFit',
      fecha: '2025-02-01',
      hora: '07:00',
      instructor: 'Miguel Rodríguez',
      estado: 'confirmado',
    },
  ];

  const getEstadoColor = (estado: Turno['estado']) => {
    switch (estado) {
      case 'confirmado':
        return theme.colors.primary;
      case 'pendiente':
        return theme.colors.tertiary;
      case 'cancelado':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getEstadoText = (estado: Turno['estado']) => {
    switch (estado) {
      case 'confirmado':
        return 'Confirmado';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  // Manejadores para los iconos del header
  const handleBellPress = () => {
    console.log('🔔 Notificaciones');
  };

  const handleSettingsPress = () => {
    console.log('⚙️ Configuración');
  };

  const renderTurno = ({ item }: { item: Turno }) => (
    <Card style={styles.turnoCard} mode="elevated">
      <Card.Content>
        <View style={styles.turnoHeader}>
          <Text style={[styles.claseText, { color: theme.colors.onSurface }]}>
            🏋️‍♂️ {item.clase}
          </Text>
          <Chip
            mode="flat"
            style={{ backgroundColor: getEstadoColor(item.estado) }}
            textStyle={{ color: theme.colors.surface }}
          >
            {getEstadoText(item.estado)}
          </Chip>
        </View>
        
        <Text style={[styles.fechaText, { color: theme.colors.onSurfaceVariant }]}>
          📅 {new Date(item.fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        
        <Text style={[styles.horaText, { color: theme.colors.onSurfaceVariant }]}>
          ⏰ {item.hora}
        </Text>
        
        <Text style={[styles.instructorText, { color: theme.colors.onSurfaceVariant }]}>
          👨‍🏫 {item.instructor}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      
      {/* Header personalizado */}
      <CustomHeader
        onBellPress={handleBellPress}
        onSettingsPress={handleSettingsPress}
      />

      {/* Content */}
      <View style={styles.content}>
        {turnos.length > 0 ? (
          <FlatList
            data={turnos}
            renderItem={renderTurno}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              📅 No tienes turnos reservados
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              ¡Reserva tu primera clase!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingVertical: 20,
  },
  turnoCard: {
    marginBottom: 16,
  },
  turnoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  claseText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  fechaText: {
    fontSize: 14,
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  horaText: {
    fontSize: 14,
    marginBottom: 6,
  },
  instructorText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default MisTurnosScreen;