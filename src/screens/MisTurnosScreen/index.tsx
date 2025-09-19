import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
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
    getClasesFiltradas,
    clearError
  } = useReservas();

  // Estado local
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());


  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchReservas();
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

  // Toggle expanded state
  const toggleExpanded = (reservaId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(reservaId)) {
      newExpanded.delete(reservaId);
    } else {
      newExpanded.add(reservaId);
    }
    setExpandedCards(newExpanded);
  };

  // Obtener icono según el tipo de clase
  const getIconByTipo = (tipo: string): string => {
    const iconos: Record<string, string> = {
      funcional: 'dumbbell',
      crossfit: 'gymnastics',
    };
    return iconos[tipo.toLowerCase()] || 'dumbbell';
  };

  // Obtener color según el tipo de clase
  const getColorByTipo = (tipo: string) => {
    const colors: Record<string, string> = {
      funcional: theme.colors.primary,
      crossfit: '#FF5722',
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
    const puedeCancelar = diasRestantes.dias >= 0;
    const isExpanded = expandedCards.has(reserva.id);

    return (
      <Card style={[styles.reservaCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        {/* Línea naranja a la izquierda */}
        <View style={[styles.orangeLine, { backgroundColor: colorTipo }]} />
        
        <Card.Content style={styles.cardContent}>
          {/* Header principal con título, instructor y tiempo - Layout compacto */}
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleSection}>
              <Text style={[styles.claseNombre, { color: theme.colors.onSurface }]}>
                {reserva.clase.nombre}
              </Text>
              <Text style={[styles.instructorName, { color: theme.colors.onSurfaceVariant }]}>
                {reserva.clase.profesor} - {reserva.clase.horario} - {diasRestantes.texto}
              </Text>
            </View>
            
            <View style={[styles.difficultyChip, { backgroundColor: colorTipo }]}>
              <Text style={styles.difficultyChipText}>
                {reserva.clase.tipo.charAt(0).toUpperCase() + reserva.clase.tipo.slice(1)}
              </Text>
            </View>
          </View>

          {/* Botones de acción en la parte inferior - Solo visibles cuando NO está expandido */}
          {!isExpanded && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => toggleExpanded(reserva.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.detailsButtonText, { color: "white" }]}>
                  Ver Detalles
                </Text>
              </TouchableOpacity>
              
              {puedeCancelar && reserva.estado === 'ACTIVA' && (
                <Button
                  mode="outlined"
                  onPress={() => handleCancelar(reserva.claseId, reserva.clase.nombre)}
                  loading={state.isCanceling}
                  disabled={state.isCanceling}
                  style={[styles.cancelButton, { borderColor: theme.colors.outline }]}
                  textColor={"white"}
                  compact
                >
                  Cancelar
                </Button>
              )}
            </View>
          )}

          {/* Detalle expandido */}
          {isExpanded && (
            <View style={styles.detalleContainer}>
              {/* Información de tiempo */}
              <View style={styles.tiempoContainer}>
                <View style={styles.tiempoInfo}>
                  <View style={styles.tiempoLabelContainer}>
                    <Ionicons name="calendar" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.tiempoLabel, { color: theme.colors.primary, fontWeight: '600' }]}>
                      {diasRestantes.texto}
                    </Text>
                  </View>
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

              {/* Detalles completos de la clase */}
              <View style={styles.detallesContainer}>
                <View style={styles.detalleRow}>
                  <Ionicons name="person" size={20} color={theme.colors.primary} style={styles.detalleIcon} />
                  <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant, fontWeight: '500' }]}>
                    {reserva.clase.profesor}
                  </Text>
                </View>
                
                <View style={styles.detalleRow}>
                  <Ionicons name="time" size={20} color={theme.colors.primary} style={styles.detalleIcon} />
                  <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant }]}>
                    {reserva.clase.horario} • {reserva.clase.duracion} min
                  </Text>
                </View>
                
                <View style={styles.detalleRow}>
                  <Ionicons name="calendar" size={20} color={theme.colors.primary} style={styles.detalleIcon} />
                  <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant }]}>
                    {reserva.diasTexto}
                  </Text>
                </View>

                <View style={styles.detalleRow}>
                  <Ionicons name="pricetag" size={20} color={theme.colors.primary} style={styles.detalleIcon} />
                  <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant }]}>
                    Tipo: {reserva.clase.tipo.charAt(0).toUpperCase() + reserva.clase.tipo.slice(1)}
                  </Text>
                </View>

                {/* Descripción de la clase */}
                {reserva.clase.descripcion && (
                  <View style={styles.descripcionContainer}>
                    <Ionicons name="document-text" size={20} color={theme.colors.primary} style={styles.detalleIcon} />
                    <Text style={[styles.descripcionTexto, { color: theme.colors.onSurfaceVariant }]}>
                      {reserva.clase.descripcion}
                    </Text>
                  </View>
                )}
              </View>

              {/* Botones de acción en la parte inferior cuando está expandido */}
              <View style={[styles.actionButtonsContainer, { marginTop: 20 }]}>
                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={() => toggleExpanded(reserva.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.detailsButtonText, { color: "white" }]}>
                    Ver menos
                  </Text>
                </TouchableOpacity>
                
                {puedeCancelar && reserva.estado === 'ACTIVA' && (
                  <Button
                    mode="outlined"
                    onPress={() => handleCancelar(reserva.claseId, reserva.clase.nombre)}
                    loading={state.isCanceling}
                    disabled={state.isCanceling}
                    style={[styles.cancelButton, { borderColor: theme.colors.outline }]}
                    textColor={"white"}
                    compact
                  >
                    Cancelar
                  </Button>
                )}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Obtener reservas activas
  const reservasActivas = getReservasActivas();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      
      {/* Header personalizado */}
      <CustomHeader />

      {/* Content */}
      <View style={styles.content}>
        {/* Header de la sección */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Mi Agenda
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Tienes {reservasActivas.length} {reservasActivas.length === 1 ? 'actividad programada' : 'actividades programadas'}
            </Text>
          </View>
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
            <View style={styles.emptyContent}>
              <Ionicons name="calendar" size={16} color={theme.colors.onSurfaceVariant} style={{ marginRight: 4 }} />
              <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
                No tienes reservas activas
              </Text>
            </View>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              ¡Ve a "Clases" para reservar tu primera actividad!
            </Text>
          </View>
        )}
      </View>

      {/* FAB para actualizar */}
      {/* <FAB
        icon="refresh"
        onPress={loadData}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        loading={state.isLoading}
      /> */}

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

  titleSection: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitleSection: {
    flex: 1,
    marginRight: 12,
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    textAlign: 'left',
    marginBottom: 16,
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
  // Estilos para la línea naranja a la izquierda
  orangeLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6, // Ancho de la línea
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  // Estilos para el contenido del Card
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingLeft: 24, // Más espacio para la línea naranja
  },
  // Estilos para el header del Card
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  claseNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  instructorName: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
  difficultyChip: {
    borderRadius: 16,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  difficultyChipText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Estilos para los botones de acción
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  detailsButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'black',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    flex: 1,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#F54927",
    borderRadius: 10,
    borderColor: '#9E9E9E',
    height: 40,
    paddingHorizontal: 16,
    flex: 1,
  },
  // Estilos para el detalle expandido
  detalleContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  detalleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detalleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
  tiempoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  tiempoLabel: {
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  detalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detalleIcon: {
    marginRight: 8,
    width: 20,
    height: 20,
  },
  detalleTexto: {
    fontSize: 14,
    flex: 1,
  },
  descripcionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  descripcionTexto: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  expandText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  expandIcon: {
    margin: 0,
    padding: 0,
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

  emptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },


});

export default MisTurnosScreen;