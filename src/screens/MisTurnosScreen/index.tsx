import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import {
  ActivityIndicator,
  Button,
  Card,
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
    getClasesFiltradas,
    clearError
  } = useReservas();

  // Estado local
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');

  // Crear estilos dinámicos para el viewToggle
  const viewToggleStyles = StyleSheet.create({
    viewToggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    viewToggleButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'transparent',
      marginHorizontal: 8,
    },
    viewToggleButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '1A', // Semi-transparente
    },
    viewToggleText: {
      fontSize: 14,
      fontWeight: '500',
    },
    viewToggleTextActive: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
  });

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

  // Generar datos del calendario para las próximas 4 semanas
  const generateCalendarData = () => {
    const reservasActivas = getReservasActivas();
    const todasLasClases = getClasesFiltradas();
    const markedDates: any = {};
    
    // Marcar las fechas de las reservas activas (verde)
    reservasActivas.forEach(reserva => {
      const fechaKey = reserva.fecha;
      if (fechaKey) {
        markedDates[fechaKey] = {
          marked: true,
          dotColor: '#90EE90', // Verde claro para clases reservadas
          textColor: theme.colors.onSurface,
          backgroundColor: 'rgba(144, 238, 144, 0.2)',
        };
      }
    });

    // Generar fechas para las próximas 4 semanas basadas en los días de las clases
    const hoy = new Date();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    
    todasLasClases.forEach(clase => {
      if (clase.dias && clase.dias.length > 0) {
        // Generar fechas para las próximas 4 semanas
        for (let semana = 0; semana < 4; semana++) {
          clase.dias.forEach(diaClase => {
            const diaIndex = diasSemana.findIndex(d => d.toLowerCase() === diaClase.toLowerCase());
            if (diaIndex !== -1) {
              // Calcular la fecha para este día de la semana
              const fecha = new Date(hoy);
              fecha.setDate(hoy.getDate() + (semana * 7) + (diaIndex - hoy.getDay() + 7) % 7);
              
              // Solo incluir fechas futuras
              if (fecha > hoy) {
                const fechaKey = fecha.toISOString().split('T')[0];
                
                // Verificar si ya hay una reserva en esta fecha para esta clase
                const tieneReserva = reservasActivas.some(reserva => 
                  reserva.fecha === fechaKey && reserva.claseId === clase.id
                );
                
                // Solo marcar si no hay una reserva en esa fecha
                if (!markedDates[fechaKey]) {
                  markedDates[fechaKey] = {
                    marked: true,
                    dotColor: tieneReserva ? '#90EE90' : '#87CEEB', // Verde si reservada, celeste si disponible
                    textColor: theme.colors.onSurface,
                    backgroundColor: tieneReserva ? 'rgba(144, 238, 144, 0.2)' : 'rgba(135, 206, 235, 0.2)',
                  };
                } else if (tieneReserva) {
                  // Si ya existe la fecha, actualizar el color si esta clase está reservada
                  markedDates[fechaKey].dotColor = '#90EE90';
                  markedDates[fechaKey].backgroundColor = 'rgba(144, 238, 144, 0.2)';
                }
              }
            }
          });
        }
      }
    });

    return markedDates;
  };

  // Manejar selección de fecha en el calendario
  const handleDateSelect = (day: DateData) => {
    const fechaSeleccionada = day.dateString;
    const reservasEnFecha = getReservasActivas().filter(reserva => reserva.fecha === fechaSeleccionada);
    const clasesEnFecha = getClasesFiltradas().filter(clase => {
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const fecha = new Date(fechaSeleccionada);
      const diaSemana = diasSemana[fecha.getDay()];
      return clase.dias.some(dia => dia.toLowerCase() === diaSemana.toLowerCase());
    });
    
    let mensaje = `📅 ${fechaSeleccionada}\n\n`;
    
    if (reservasEnFecha.length > 0) {
      mensaje += `🟢 Clases reservadas:\n`;
      reservasEnFecha.forEach(reserva => {
        mensaje += `• ${reserva.clase.nombre} - ${reserva.clase.horario}\n`;
      });
      mensaje += '\n';
    }
    
    if (clasesEnFecha.length > 0) {
      mensaje += `🔵 Clases disponibles:\n`;
      clasesEnFecha.forEach(clase => {
        const estaReservada = reservasEnFecha.some(r => r.claseId === clase.id);
        const estado = estaReservada ? ' (Reservada)' : '';
        mensaje += `• ${clase.nombre} - ${clase.horario}${estado}\n`;
      });
    }
    
    if (reservasEnFecha.length === 0 && clasesEnFecha.length === 0) {
      mensaje += 'No hay clases programadas para este día.';
    }
    
    showSnackbar(mensaje, 'success');
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

              {/* Detalles completos de la clase */}
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

                <View style={styles.detalleRow}>
                  <Text style={[styles.detalleIcon, { color: theme.colors.primary }]}>🏷️</Text>
                  <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant }]}>
                    Tipo: {reserva.clase.tipo.charAt(0).toUpperCase() + reserva.clase.tipo.slice(1)}
                  </Text>
                </View>

                {/* Descripción de la clase */}
                {reserva.clase.descripcion && (
                  <View style={styles.descripcionContainer}>
                    <Text style={[styles.detalleIcon, { color: theme.colors.primary }]}>📝</Text>
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
          
          {/* Toggle de vista: Botones redondeados como en Clases */}
          <View style={viewToggleStyles.viewToggleContainer}>
            <TouchableOpacity
              style={[
                viewToggleStyles.viewToggleButton,
                viewMode === 'cards' && viewToggleStyles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('cards')}
            >
              <Text style={[
                viewToggleStyles.viewToggleText,
                viewMode === 'cards' && viewToggleStyles.viewToggleTextActive
              ]}>
                📋 Lista
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                viewToggleStyles.viewToggleButton,
                viewMode === 'calendar' && viewToggleStyles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('calendar')}
            >
              <Text style={[
                viewToggleStyles.viewToggleText,
                viewMode === 'calendar' && viewToggleStyles.viewToggleTextActive
              ]}>
                📅 Calendario
              </Text>
            </TouchableOpacity>
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
          viewMode === 'cards' ? (
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
            <View style={styles.calendarContainer}>
              <Calendar
                markedDates={generateCalendarData()}
                markingType="dot"
                onDayPress={handleDateSelect}
                theme={{
                  backgroundColor: theme.colors.surface,
                  calendarBackground: theme.colors.surface,
                  textSectionTitleColor: theme.colors.onSurface,
                  selectedDayBackgroundColor: theme.colors.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: theme.colors.primary,
                  dayTextColor: theme.colors.onSurface,
                  textDisabledColor: theme.colors.outline,
                  dotColor: '#90EE90',
                  selectedDotColor: '#ffffff',
                  arrowColor: theme.colors.primary,
                  monthTextColor: theme.colors.onSurface,
                  indicatorColor: theme.colors.primary,
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '300',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13,
                }}
                enableSwipeMonths={true}
                showWeekNumbers={false}
                firstDay={1}
              />
              
              {/* Leyenda del calendario */}
              <View style={styles.calendarLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#90EE90' }]} />
                  <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                    Clase reservada
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#87CEEB' }]} />
                  <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                    Clase disponible
                  </Text>
                </View>
              </View>
              
              {/* Información del calendario */}
              <View style={styles.calendarInfo}>
                <Text style={[styles.calendarInfoText, { color: theme.colors.onSurfaceVariant }]}>
                  📅 Visualiza todas las clases en el calendario
                </Text>
                <Text style={[styles.calendarInfoText, { color: theme.colors.onSurfaceVariant }]}>
                  Verde: clases reservadas • Celeste: clases disponibles para reservar
                </Text>
                <Text style={[styles.calendarInfoText, { color: theme.colors.onSurfaceVariant }]}>
                  💡 Toca una fecha para ver las clases del día
                </Text>
              </View>
            </View>
          )
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
    marginBottom: 16,
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

  calendarContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 13,
  },
  calendarInfo: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginTop: 10,
  },
  calendarInfoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },


});

export default MisTurnosScreen;