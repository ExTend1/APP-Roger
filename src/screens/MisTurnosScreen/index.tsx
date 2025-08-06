import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    FAB,
    Snackbar,
    Text,
    useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import { useReservas } from '../../contexts/ReservasContext';
import { ReservaCardData } from '../../types/reservas';

const MisTurnosScreen: React.FC = () => {
  const theme = useTheme();
  const { 
    state, 
    fetchReservas, 
    cancelarReserva, 
    getReservasActivas,
    clearError
  } = useReservas();

  // Estado local
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchReservas();
  };

  // Manejadores para los iconos del header
  const handleBellPress = () => {
    console.log('🔔 Notificaciones');
  };

  const handleSettingsPress = () => {
    console.log('⚙️ Configuración');
  };

  // Manejador de cancelación
  const handleCancelar = async (claseId: string, nombreClase: string) => {
    try {
      const success = await cancelarReserva(claseId);
      if (success) {
        showSnackbar(`Reserva de "${nombreClase}" cancelada exitosamente`, 'success');
      } else if (state.error) {
        showSnackbar(state.error, 'error');
      }
    } catch (error) {
      showSnackbar('Error inesperado al cancelar reserva', 'error');
    }
  };

  // Mostrar snackbar
  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  // Obtener emoji según el tipo de clase
  const getEmojiByTipo = (tipo: string): string => {
    const emojis: Record<string, string> = {
      funcional: '🏋️‍♂️',
      cardio: '🏃‍♂️',
      fuerza: '💪',
      yoga: '🧘‍♀️',
      pilates: '🤸‍♀️',
      aqua: '🏊‍♀️',
      baile: '💃',
    };
    return emojis[tipo.toLowerCase()] || '🏋️‍♂️';
  };

  // Obtener color según el tipo de clase
  const getColorByTipo = (tipo: string) => {
    const colors: Record<string, string> = {
      funcional: theme.colors.primary,
      cardio: '#F44336',
      fuerza: '#FF9800',
      yoga: '#4CAF50',
      pilates: '#2196F3',
      aqua: '#00BCD4',
      baile: '#9C27B0',
    };
    return colors[tipo.toLowerCase()] || theme.colors.primary;
  };

  // Formatear fecha para mostrar días restantes
  const getDiasRestantes = (fecha: string): { dias: number; texto: string } => {
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaReserva.setHours(0, 0, 0, 0);
    
    const diferencia = Math.ceil((fechaReserva.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diferencia < 0) {
      return { dias: diferencia, texto: 'Completada' };
    } else if (diferencia === 0) {
      return { dias: diferencia, texto: 'Hoy' };
    } else if (diferencia === 1) {
      return { dias: diferencia, texto: 'Mañana' };
    } else {
      return { dias: diferencia, texto: `En ${diferencia} días` };
    }
  };

  const renderReserva = ({ item: reserva }: { item: ReservaCardData }) => {
    const colorTipo = getColorByTipo(reserva.clase.tipo);
    const diasRestantes = getDiasRestantes(reserva.fecha);
    const puedeCancelar = diasRestantes.dias >= 0; // Solo se puede cancelar si no ha pasado

    return (
      <Card style={[styles.reservaCard, { backgroundColor: theme.colors.surface }]} elevation={3}>
        <Card.Content>
          <View style={styles.reservaHeader}>
            <View style={styles.claseInfo}>
              <Text style={styles.claseEmoji}>
                {getEmojiByTipo(reserva.clase.tipo)}
              </Text>
              <View style={styles.claseTitulo}>
                <Text style={[styles.claseNombre, { color: theme.colors.onSurface }]}>
                  {reserva.clase.nombre}
                </Text>
                <Chip 
                  mode="flat"
                  style={[styles.tipoChip, { backgroundColor: colorTipo }]}
                  textStyle={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}
                >
                  {reserva.clase.tipo.charAt(0).toUpperCase() + reserva.clase.tipo.slice(1)}
                </Chip>
              </View>
            </View>
            
            <Chip
              mode="flat"
              style={[styles.estadoChip, { backgroundColor: reserva.estadoColor }]}
              textStyle={{ color: 'white', fontSize: 12, fontWeight: '600' }}
            >
              {reserva.estadoTexto}
            </Chip>
          </View>

          {/* Información de tiempo mejorada */}
          <View style={styles.tiempoContainer}>
            <View style={styles.tiempoInfo}>
              <Text style={[styles.tiempoLabel, { color: theme.colors.primary, fontWeight: '600' }]}>
                📅 {diasRestantes.texto}
              </Text>
              <Text style={[styles.fechaCompleta, { color: theme.colors.onSurfaceVariant }]}>
                {reserva.fechaFormateada}
              </Text>
            </View>
            
            {diasRestantes.dias >= 0 && (
              <View style={[styles.tiempoChip, { backgroundColor: diasRestantes.dias === 0 ? '#4CAF50' : '#2196F3' }]}>
                <Text style={styles.tiempoChipText}>
                  {diasRestantes.dias === 0 ? 'HOY' : diasRestantes.dias === 1 ? 'MAÑANA' : `${diasRestantes.dias}D`}
                </Text>
              </View>
            )}
          </View>

          {/* Detalles de la clase mejorados */}
          <View style={styles.detallesContainer}>
            <View style={styles.detalleRow}>
              <Text style={[styles.detalleIcon, { color: theme.colors.primary }]}>👨‍🏫</Text>
              <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant, fontWeight: '500' }]}>
                {reserva.clase.profesor}
              </Text>
            </View>
            
            <View style={styles.detalleRow}>
              <Text style={[styles.detalleIcon, { color: theme.colors.primary }]}>⏰</Text>
              <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant }]}>
                {reserva.clase.horario} • {reserva.clase.duracion} min
              </Text>
            </View>
            
            <View style={styles.detalleRow}>
              <Text style={[styles.detalleIcon, { color: theme.colors.primary }]}>🗓️</Text>
              <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant }]}>
                {reserva.diasTexto}
              </Text>
            </View>
          </View>
        </Card.Content>

        {/* Acciones mejoradas */}
        {puedeCancelar && reserva.estado === 'ACTIVA' && (
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => handleCancelar(reserva.claseId, reserva.clase.nombre)}
              loading={state.isCanceling}
              disabled={state.isCanceling}
              icon="close"
              style={[styles.cancelButton, { borderColor: theme.colors.error }]}
              textColor={theme.colors.error}
            >
              Cancelar Reserva
            </Button>
          </Card.Actions>
        )}
      </Card>
    );
  };

  // Obtener reservas activas
  const reservasActivas = getReservasActivas();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      
      {/* Header personalizado */}
      <CustomHeader
        onBellPress={handleBellPress}
        onSettingsPress={handleSettingsPress}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Header de la sección */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Mi Agenda
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Tienes {reservasActivas.length} {reservasActivas.length === 1 ? 'actividad programada' : 'actividades programadas'}
          </Text>
        </View>

        {state.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
              Cargando mis reservas...
            </Text>
          </View>
        ) : reservasActivas.length > 0 ? (
          <FlatList
            data={reservasActivas}
            renderItem={renderReserva}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={state.isLoading}
                onRefresh={loadData}
                colors={[theme.colors.primary]}
              />
            }
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              📅 No tienes reservas activas
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              ¡Ve a "Clases" para reservar tu primera actividad!
            </Text>
          </View>
        )}
      </View>

      {/* FAB para actualizar */}
      <FAB
        icon="refresh"
        onPress={loadData}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        loading={state.isLoading}
      />

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          { backgroundColor: snackbarType === 'success' ? theme.colors.primary : theme.colors.error }
        ]}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 100, // Espacio para el FAB
  },
  reservaCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  claseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  claseEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  claseTitulo: {
    flex: 1,
  },
  claseNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipoChip: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    height: 24,
  },
  estadoChip: {
    borderRadius: 16,
    height: 28,
  },
  tiempoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  tiempoInfo: {
    flex: 1,
  },
  tiempoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  fechaCompleta: {
    fontSize: 13,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  tiempoChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  tiempoChipText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  detallesContainer: {
    gap: 8,
  },
  detalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detalleIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  detalleTexto: {
    fontSize: 14,
    flex: 1,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default MisTurnosScreen;