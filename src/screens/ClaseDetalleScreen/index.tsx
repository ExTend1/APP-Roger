import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import {
  ActivityIndicator,
  Button,
  Searchbar,
  Snackbar,
  Text,
  useTheme
} from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import { SwipeableScreen } from '../../components/SwipeableScreen';
import { useReservas } from '../../contexts/ReservasContext';
import { ClaseCardData } from '../../types/reservas';

const ClaseDetalleScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { 
    state, 
    fetchClases, 
    fetchReservas, 
    reservarClase, 
    cancelarReserva, 
    setSearchTerm, 
    setSelectedTipo,
    setSelectedDate,
    getClasesFiltradas,
    isClaseReservada,
    fetchUserTokens
  } = useReservas();

  // Estado local
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const loadData = useCallback(async () => {
    console.log('[ClaseDetalleScreen] Cargando datos...');
    await Promise.all([
      fetchClases(),
      fetchReservas(),
      fetchUserTokens()
    ]);
    console.log('[ClaseDetalleScreen] Datos cargados');
  }, [fetchClases, fetchReservas, fetchUserTokens]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generar datos del calendario con colores distintivos
  const generateCalendarData = () => {
    const calendarData: any = {};
    
    state.clases.forEach(clase => {
      clase.dias.forEach(dia => {
        // Generar fechas para las próximas 4 semanas
        for (let week = 0; week < 4; week++) {
          const dateKey = getDateKeyFromDay(dia, week);
          if (dateKey) {
            // Solo agregar un punto por fecha, no por clase
            if (!calendarData[dateKey]) {
              // Verificar si hay alguna clase reservada para este día
              const tieneClaseReservada = state.clases.some(c => 
                c.dias.some(d => d.toLowerCase() === dia.toLowerCase()) && 
                isClaseReservada(c.id)
              );
              
              const color = tieneClaseReservada ? '#90EE90' : '#87CEEB'; // Verde si hay reservas, celeste si solo disponibles
              
              calendarData[dateKey] = {
                dots: [{
                  key: dateKey, // Usar la fecha como key en lugar del ID de clase
                  color: color,
                  selectedDotColor: color
                }]
              };
            }
          }
        }
      });
    });
    
    return calendarData;
  };

  // Convertir día de la semana a fecha específica
  const getDateKeyFromDay = (dia: string, weekOffset: number = 0): string | null => {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    
    // Mapeo de días en mayúsculas a minúsculas para compatibilidad
    const mapeoDias: Record<string, string> = {
      'LUNES': 'lunes',
      'MARTES': 'martes', 
      'MIÉRCOLES': 'miércoles',
      'MIERCOLES': 'miércoles',
      'JUEVES': 'jueves',
      'VIERNES': 'viernes',
      'SÁBADO': 'sábado',
      'SABADO': 'sábado',
      'DOMINGO': 'domingo'
    };
    
    const diaNormalizado = mapeoDias[dia] || dia.toLowerCase();
    const diaIndex = diasSemana.indexOf(diaNormalizado);
    
    if (diaIndex === -1) return null;
    
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (diaIndex - currentDay + 7) % 7;
    
    // Si es hoy, mostrar la próxima semana
    const targetDays = daysUntilTarget === 0 ? 7 + (weekOffset * 7) : daysUntilTarget + (weekOffset * 7);
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + targetDays);
    
    return targetDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  };

  // Manejador para cuando se selecciona una fecha en el calendario
  const handleDateSelect = (day: DateData) => {
    const fechaSeleccionada = day.dateString;
    
    // Si ya está seleccionada la misma fecha, la deseleccionamos
    if (state.selectedDate === fechaSeleccionada) {
      setSelectedDate(null);
    } else {
      // Establecer la fecha seleccionada para filtrar las clases
      setSelectedDate(fechaSeleccionada);
    }
  };



  // Manejador de reserva/cancelación
  const handleReservaToggle = async (clase: ClaseCardData) => {
    const isReservada = isClaseReservada(clase.id);
    
    try {
      let success = false;
      if (isReservada) {
        success = await cancelarReserva(clase.id);
        if (success) {
          showSnackbar('Reserva cancelada exitosamente', 'success');
        }
      } else {
        success = await reservarClase(clase.id);
        if (success) {
          showSnackbar('Clase reservada exitosamente', 'success');
        }
      }
      
      if (!success && state.error) {
        showSnackbar(state.error, 'error');
      }
    } catch {
      showSnackbar('Error inesperado', 'error');
    }
  };

  // Mostrar snackbar
  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  // Obtener icono según el tipo de clase
  const getIconByTipo = (tipo: string): string => {
    const iconos: Record<string, string> = {
      funcional: 'dumbbell',
      crossfit: 'gymnastics',
    };
    return iconos[tipo.toLowerCase()] || 'dumbbell';
  };

  // Obtener imagen según el tipo de clase
  const getImageByTipo = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower === 'crossfit') {
      return require('../../../assets/images/crossfit.jpg');
    } else if (tipoLower === 'funcional') {
      return require('../../../assets/images/funcional.png');
    }
    
    return null; // Para otros tipos, no mostrar imagen
  };

  // Obtener color según el tipo de clase
  const getColorByTipo = (tipo: string) => {
    const colors: Record<string, string> = {
      funcional: theme.colors.primary,
      crossfit: '#FF5722',
    };
    return colors[tipo.toLowerCase()] || theme.colors.primary;
  };

  // Formatear días
  const formatDias = (dias: string[]): string => {
    const diasAbrev: Record<string, string> = {
      'LUNES': 'Lun',
      'MARTES': 'Mar',
      'MIERCOLES': 'Mié',
      'JUEVES': 'Jue',
      'VIERNES': 'Vie',
      'SABADO': 'Sáb',
      'DOMINGO': 'Dom',
    };
    return dias.map(dia => diasAbrev[dia] || dia).join(', ');
  };

  // Tipos disponibles para filtro
  const tiposDisponibles = [
    { value: 'todos', label: 'Todas' },
    { value: 'funcional', label: 'Funcional' },
    { value: 'crossfit', label: 'CrossFit' },
  ];

  // Renderizar tarjeta de clase
  const renderClaseCard = ({ item: clase }: { item: ClaseCardData }) => {
    const isReservada = isClaseReservada(clase.id);
    const colorTipo = getColorByTipo(clase.tipo);
    
    // Verificar si la clase tiene cupos disponibles usando la información real de la API
    const tieneCuposDisponibles = !clase.tieneCupoLimitado || 
      (clase.cuposDisponibles !== undefined && clase.cuposDisponibles !== null && clase.cuposDisponibles > 0);
    
    // Determinar el estado del botón
    const botonDeshabilitado = state.isReserving || state.isCanceling || !tieneCuposDisponibles;
    const textoBoton = isReservada ? 'Cancelar Reserva' : 
      (tieneCuposDisponibles ? 'Reservar Clase' : 'Sin Cupos');
    
    return (
      <View style={[styles.claseCard, { backgroundColor: theme.colors.surface }]}>
                  {/* Sección Superior - Gradiente */}
          <View style={[
            styles.topSection, 
            { 
              backgroundColor: theme.dark ? '#2C2C2C' : '#FFFFFF',
            }
          ]}>
            {/* Background Image para crossfit y funcional */}
            {(() => {
              const claseImage = getImageByTipo(clase.tipo);
              if (claseImage) {
                return (
                  <Image 
                    source={claseImage} 
                    style={styles.topSectionBackground}
                    resizeMode="cover"
                  />
                );
              }
              return null;
            })()}
            
            {/* Overlay para mejorar legibilidad */}
            {(() => {
              const claseImage = getImageByTipo(clase.tipo);
              if (claseImage) {
                return (
                  <View style={styles.topSectionOverlay} />
                );
              }
              return null;
            })()}

                     {/* Círculo central con imagen o placeholder - Solo para clases sin imagen */}
             {(() => {
               const claseImage = getImageByTipo(clase.tipo);
               if (!claseImage) {
                 return (
                   <View style={[
                     styles.circleContainer,
                     { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' }
                   ]}>
                     <View style={styles.photoPlaceholder}>
                       <Text style={[styles.photoPlaceholderText, { fontSize: 48 }]}>
                         {getIconByTipo(clase.tipo)}
                       </Text>
                       <Text style={styles.photoPlaceholderSubtext}>
                         {clase.tipo.charAt(0).toUpperCase() + clase.tipo.slice(1)}
                       </Text>
                     </View>
                     {/* Círculos de fondo para efecto dinámico */}
                     <View style={styles.backgroundCircles}>
                       <View style={[
                         styles.circle, 
                         styles.circle1, 
                         { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)' }
                       ]} />
                       <View style={[
                         styles.circle, 
                         styles.circle2, 
                         { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)' }
                       ]} />
                       <View style={[
                         styles.circle, 
                         styles.circle3, 
                         { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.15)' }
                       ]} />
                     </View>
                   </View>
                 );
               }
               return null;
             })()}
          </View>

                 {/* Sección Inferior - Información */}
         <View style={[
           styles.bottomSection, 
           { 
             backgroundColor: theme.dark ? '#1A1A1A' : '#F5F5F5'
           }
         ]}>
            {/* Título y Badges en la misma línea */}
            <View style={styles.titleRow}>
              <Text style={[
                styles.claseTitle, 
                { color: theme.dark ? 'white' : 'black' }
              ]}>
                {clase.nombre}
              </Text>

              {/* Badges a la derecha del título */}
              <View style={styles.titleBadgesContainer}>
                <View style={[styles.badge, { backgroundColor: colorTipo }]}>
                  <Text style={styles.badgeText}>
                    {clase.tipo.charAt(0).toUpperCase() + clase.tipo.slice(1)}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: theme.dark ? '#FFAF2E' : '#E0E0E0' }]}>
                  <Text style={[styles.badgeText, { color: theme.dark ? 'black' : 'rgba(0, 0, 0, 0.7)' }]}>
                    Alta Intensidad
                  </Text>
                </View>
              </View>
            </View>

           {/* Descripción */}
           <Text style={[
             styles.claseDescription, 
             { color: theme.dark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)' }
           ]}>
             {clase.descripcion}
           </Text>

          {/* Detalles */}
          <View style={styles.detailsContainer}>
                         {/* Horario */}
             <View style={styles.detailRow}>
               <Ionicons name="time" size={20} color={theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)'} style={styles.detailIcon} />
               <Text style={[styles.detailText, { color: theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)' }]}>
                 {clase.horario} • {clase.duracion} min
               </Text>
             </View>

             {/* Profesor y cupo */}
             <View style={styles.detailRow}>
               <Ionicons name="people" size={20} color={theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)'} style={styles.detailIcon} />
               <Text style={[styles.detailText, { color: theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)' }]}>
                 {clase.profesor} • {clase.tieneCupoLimitado ? 
                   `${clase.cuposOcupados || 0}/${clase.cupo} cupos` : 
                   'Sin límite de cupos'}
               </Text>
             </View>

             {/* Días */}
             <View style={styles.detailRow}>
               <Ionicons name="calendar" size={20} color={theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)'} style={styles.detailIcon} />
               <Text style={[styles.detailText, { color: theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)' }]}>
                 {formatDias(clase.dias)}
               </Text>
             </View>
          </View>

          {/* Botón de reserva */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => handleReservaToggle(clase)}
              loading={state.isReserving || state.isCanceling}
              disabled={botonDeshabilitado}
              style={[
                styles.reservaButton,
                { 
                  backgroundColor: isReservada ? '#F54927' : 
                    (tieneCuposDisponibles ? '#7DE34D' : '#9E9E9E'),
                  borderRadius: 12,
                }
              ]}
              labelStyle={styles.buttonLabel}
            >
              {textoBoton}
            </Button>
          </View>
        </View>
      </View>
    );
  };

  // Obtener clases filtradas
  const clasesFiltradas = getClasesFiltradas();



  // Crear estilos dinámicos para el calendario y componentes adaptativos
  const calendarStyles = StyleSheet.create({
    searchContainerDynamic: {
      backgroundColor: theme.colors.background,
    },
         calendarContainer: {
       flex: 1,
       padding: 16,
       paddingHorizontal: 20,
       backgroundColor: theme.colors.surface,
     },
    calendar: {
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
         calendarLegend: {
       flexDirection: 'row',
       justifyContent: 'center',
       alignItems: 'center',
       marginTop: 16,
       paddingHorizontal: 20,
       paddingVertical: 12,
       backgroundColor: theme.colors.surfaceVariant,
       borderRadius: 16,
       marginHorizontal: 20,
       gap: 24,
     },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    legendDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginRight: 8,
    },
    legendText: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
         calendarInfo: {
       marginTop: 16,
       paddingHorizontal: 20,
       paddingVertical: 16,
       backgroundColor: theme.colors.surfaceVariant,
       borderRadius: 16,
       alignItems: 'center',
       marginHorizontal: 20,
     },
    calendarInfoText: {
      fontSize: 14,
      textAlign: 'center',
      opacity: 0.8,
      lineHeight: 20,
    },
  });

  return (
    <SwipeableScreen>
             <SafeAreaView 
         style={[
           styles.container, 
           { 
             backgroundColor: theme.colors.background,
             paddingBottom: insets.bottom > 0 ? insets.bottom : 20 // Ajuste para Android
           }
         ]}
         edges={['top', 'left', 'right']} // Solo aplicar safe area en la parte superior y laterales
       >
         <StatusBar style="light" />
         
         {/* Header personalizado */}
         <CustomHeader />

        {/* Contenido principal */}
        <View style={styles.content}>
        {/* Barra de búsqueda con selector de fecha integrado */}
        <View style={[styles.searchContainer, calendarStyles.searchContainerDynamic]}>
          <Searchbar
            placeholder="Buscar clases..."
            onChangeText={setSearchTerm}
            value={state.searchTerm}
            style={styles.searchbar}
          />
          
          {/* Botón de fecha integrado que funciona como toggle */}
          <TouchableOpacity
            style={[
              styles.dateSelectorButton,
              { 
                backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderColor: theme.dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
              },
              viewMode === 'calendar' && {
                backgroundColor: theme.colors.primary + '1A',
                borderColor: theme.colors.primary
              }
            ]}
            onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            <View style={styles.dateSelectorContent}>
              <Ionicons 
                name={viewMode === 'list' ? 'calendar' : 'list'} 
                size={20} 
                color={theme.dark ? '#FF6B6B' : '#E74C3C'} 
                style={styles.dateSelectorIcon} 
              />
              <View style={styles.dateSelectorTextContainer}>
              </View>
            </View>
          </TouchableOpacity>
        </View>



        {/* Filtros por tipo y fecha */}
        <View style={styles.filtrosContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtrosContent}
          >
            {/* Botón para limpiar filtro de fecha */}
            {state.selectedDate && (
              <View
                style={[
                  styles.filtroCard,
                  { backgroundColor: theme.colors.primary + '1A' }
                ]}
              >
                <Text
                  style={[
                    styles.filtroText,
                    { color: theme.colors.primary, fontWeight: 'bold' }
                  ]}
                  onPress={() => setSelectedDate(null)}
                >
                  Limpiar fecha
                </Text>
              </View>
            )}
            
            {tiposDisponibles.map((tipo) => (
              <View
                key={tipo.value}
                style={[
                  styles.filtroCard,
                  { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
                  state.selectedTipo === tipo.value && {
                    backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                  }
                ]}
              >
                <Text
                  style={[
                    styles.filtroText,
                    { color: theme.dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' },
                    state.selectedTipo === tipo.value && {
                      color: theme.dark ? 'white' : 'black',
                      fontWeight: 'bold'
                    }
                  ]}
                  onPress={() => setSelectedTipo(tipo.value === 'todos' ? null : tipo.value)}
                >
                  {tipo.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>



        {/* Lista de clases */}
        {state.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
              Cargando clases...
            </Text>
          </View>
        ) : viewMode === 'calendar' ? (
          // Vista de Calendario
          <View style={calendarStyles.calendarContainer}>
            <Calendar
              markedDates={generateCalendarData()}
              markingType="multi-dot"
              onDayPress={handleDateSelect}
              theme={{
                backgroundColor: theme.colors.surface,
                calendarBackground: theme.colors.surface,
                textSectionTitleColor: theme.colors.onSurface,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.onSurface,
                textDisabledColor: theme.colors.onSurfaceVariant,
                dotColor: theme.colors.primary,
                selectedDotColor: '#ffffff',
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.onSurface,
                indicatorColor: theme.colors.primary,
                textDayFontWeight: '400',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
              style={calendarStyles.calendar}
              enableSwipeMonths={true}
              showWeekNumbers={false}
              firstDay={1} // Lunes como primer día de la semana
            />
            
            {/* Leyenda del calendario */}
            <View style={calendarStyles.calendarLegend}>
              <View style={calendarStyles.legendItem}>
                <View style={[calendarStyles.legendDot, { backgroundColor: '#90EE90' }]} />
                <Text style={[calendarStyles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                  Reservadas
                </Text>
              </View>
              <View style={calendarStyles.legendItem}>
                <View style={[calendarStyles.legendDot, { backgroundColor: '#87CEEB' }]} />
                <Text style={[calendarStyles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                Disponibles
                </Text>
              </View>
            </View>
            
            {/* Información adicional del calendario */}
            <View style={calendarStyles.calendarInfo}>
              {state.selectedDate ? (
                <View style={styles.calendarInfoRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[calendarStyles.calendarInfoText, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                    Mostrando clases del {new Date(state.selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              ) : (
                <View style={styles.calendarInfoRow}>
                  <Ionicons name="bulb" size={16} color={theme.colors.onSurfaceVariant} style={{ marginRight: 4 }} />
                  <Text style={[calendarStyles.calendarInfoText, { color: theme.colors.onSurfaceVariant }]}>
                    Toca una fecha para ver las clases del día
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : clasesFiltradas.length > 0 ? (
          <FlatList
            data={clasesFiltradas}
            renderItem={renderClaseCard}
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
              <Ionicons name="fitness" size={16} color={theme.colors.onSurfaceVariant} style={{ marginRight: 4 }} />
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                {state.selectedDate ? 'No hay clases programadas para este día' : 'No se encontraron clases'}
              </Text>
            </View>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              {state.selectedDate ? 'Intenta seleccionar otra fecha' : 'Intenta ajustar los filtros de búsqueda'}
            </Text>
          </View>
        )}
      </View>


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
      </SwipeableScreen>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16, // Restaurado el padding horizontal original
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 8,
    gap: 12,
  },

  dateSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 50,
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateSelectorIcon: {
    fontSize: 20,
  },
  dateSelectorTextContainer: {
    alignItems: 'center',
  },
  dateSelectorMonth: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dateSelectorDay: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  searchbar: {
    flex: 1, // Hace que el Searchbar ocupe el espacio disponible
    borderRadius: 12,
    paddingVertical: 0, // Eliminar padding vertical para que el texto se ajuste mejor
    paddingHorizontal: 12, // Ajustar padding horizontal
  },
  viewToggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleButtonActive: {
    borderColor: '#4CAF50', // Color de la línea activa
    backgroundColor: '#E8F5E9', // Color de fondo activo
  },
  viewToggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  viewToggleTextActive: {
    color: '#4CAF50', // Color del texto activo
    fontWeight: 'bold',
  },
  filtrosContainer: {
    marginBottom: 16,
    paddingHorizontal: 16, // Agregado padding horizontal solo para los filtros
  },
  filtrosContent: {
    paddingHorizontal: 4,
  },
  filtroCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  filtroText: {
    fontSize: 14,
    fontWeight: '500',
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
  claseCard: {
    marginBottom: 16,
    borderRadius: 16,
    marginHorizontal: 4, // Restaurado el margen horizontal original
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  topSection: {
    padding: 0, // Eliminado el padding para que la imagen ocupe toda la zona
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    position: 'relative',
    minHeight: 280, // Aumentado para más espacio para la imagen
    justifyContent: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Cambiado a flex-start para alinear a la izquierda
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 20, // Agregado padding horizontal para los badges
    paddingTop: 10, // Agregado padding superior para los badges
    gap: 8, // Agregado gap entre los badges
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',

  },
  circleContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mainCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  photoPlaceholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoPlaceholderSubtext: {
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    fontWeight: '500',
  },
  backgroundCircles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 50,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -20,
    left: -20,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -30,
    right: -30,
  },
  circle3: {
    width: 200,
    height: 200,
    top: 50,
    left: 50,
  },
  bottomSection: {
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 15,
  },
  claseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 0, // Eliminado el margen inferior ya que está en titleRow
    flex: 1, // Para que ocupe el espacio disponible
  },
  claseDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.8,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  detailText: {
    fontSize: 15,
    flex: 1,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  reservaButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
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
  snackbar: {
    marginBottom: 16,
  },
  claseImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  topSectionBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  topSectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)', // Overlay más sutil para que la imagen se vea mejor
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  titleBadgesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4, // Ajustar el margen superior para que esté alineado con el título
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

});

export default ClaseDetalleScreen;