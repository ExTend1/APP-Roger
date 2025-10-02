import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Searchbar,
  Snackbar,
  Text,
  useTheme,
  Chip,
  Menu,
  Divider,
  FAB
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
    setSelectedProfesor,
    setSelectedDia,
    setSelectedHorario,
    setMostrarFiltrosAvanzados,
    limpiarFiltros,
    obtenerOpcionesUnicas,
    getClasesFiltradas,
    isClaseReservada,
    fetchUserTokens
  } = useReservas();

  // Estado local
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

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

  // Funciones para calcular proximidad de clases
  const calcularProximaClase = (clase: ClaseCardData): string => {
    const diasMap: { [key: string]: number } = {
      'DOMINGO': 0, 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3,
      'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6
    };
    const nombresDiasCompletos: { [key: number]: string } = {
      0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
      4: 'Jueves', 5: 'Viernes', 6: 'Sábado'
    };

    const hoy = new Date();
    const diaActual = hoy.getDay();
    const horaActual = hoy.getHours() * 60 + hoy.getMinutes();

    const [horas, minutos] = clase.horario.split(':').map(Number);
    const horaClase = horas * 60 + minutos;

    const diasClase = clase.dias.map(dia => diasMap[dia]).sort((a, b) => a - b);

    for (let i = 0; i < 7; i++) {
      const diaBuscar = (diaActual + i) % 7;
      if (diasClase.includes(diaBuscar)) {
        const fechaProxima = new Date(hoy);
        fechaProxima.setDate(hoy.getDate() + i);

        const nombreDia = nombresDiasCompletos[diaBuscar];
        const diaMes = fechaProxima.getDate();
        const mes = fechaProxima.getMonth() + 1;

        if (i === 0 && horaClase > horaActual) {
          const tiempoRestante = horaClase - horaActual;
          const horasRestantes = Math.floor(tiempoRestante / 60);
          const minutosRestantes = tiempoRestante % 60;
          if (horasRestantes > 0) {
            return `${nombreDia} ${diaMes}/${mes} - Hoy en ${horasRestantes}h ${minutosRestantes}m`;
          } else {
            return `${nombreDia} ${diaMes}/${mes} - Hoy en ${minutosRestantes}m`;
          }
        }
        if (i > 0) {
          return `${nombreDia} ${diaMes}/${mes}`;
        }
      }
    }
    return 'Próximamente';
  };

  const calcularDiasHastaProximaClase = (clase: ClaseCardData): number => {
    const diasMap: { [key: string]: number } = {
      'DOMINGO': 0, 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3,
      'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6
    };
    const hoy = new Date();
    const diaActual = hoy.getDay();
    const horaActual = hoy.getHours() * 60 + hoy.getMinutes();
    const [horas, minutos] = clase.horario.split(':').map(Number);
    const horaClase = horas * 60 + minutos;
    const diasClase = clase.dias.map(dia => diasMap[dia]).sort((a, b) => a - b);

    for (let i = 0; i < 7; i++) {
      const diaBuscar = (diaActual + i) % 7;
      if (diasClase.includes(diaBuscar)) {
        if (i === 0 && horaClase > horaActual) {
          return 0;
        }
        if (i > 0) {
          return i;
        }
      }
    }
    return 7;
  };

  const obtenerTextoProximidad = (dias: number): string => {
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Mañana';
    if (dias === 2) return 'En 2 días';
    if (dias === 3) return 'En 3 días';
    if (dias === 4) return 'En 4 días';
    if (dias === 5) return 'En 5 días';
    if (dias === 6) return 'En 6 días';
    return 'Próximamente';
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
    
    // Calcular proximidad
    const diasHastaProximaClase = calcularDiasHastaProximaClase(clase);
    const textoProximidad = obtenerTextoProximidad(diasHastaProximaClase);
    const proximaClaseInfo = calcularProximaClase(clase);
    
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
              <View style={styles.titleContainer}>
                <Text style={[
                  styles.claseTitle, 
                  { color: theme.dark ? 'white' : 'black' }
                ]}>
                  {clase.nombre}
                </Text>
                {/* Badge de proximidad */}
                <View style={[
                  styles.badge, 
                  {
                    backgroundColor: diasHastaProximaClase === 0 ? '#4CAF50' :
                      diasHastaProximaClase === 1 ? '#FF9800' :
                      diasHastaProximaClase <= 3 ? '#2196F3' : '#9E9E9E'
                  }
                ]}>
                  <Text style={styles.badgeText}>
                    {textoProximidad}
                  </Text>
                </View>
              </View>

              {/* Badge del tipo de clase */}
              <View style={styles.titleBadgesContainer}>
                <View style={[styles.badge, { backgroundColor: colorTipo }]}>
                  <Text style={styles.badgeText}>
                    {clase.tipo.charAt(0).toUpperCase() + clase.tipo.slice(1)}
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

           {/* Información de próxima clase */}
           <View style={styles.proximaClaseContainer}>
             <Ionicons 
               name="time-outline" 
               size={16} 
               color={theme.colors.primary} 
               style={styles.proximaClaseIcon}
             />
             <Text style={[
               styles.proximaClaseText,
               { color: theme.colors.primary }
             ]}>
               Próxima clase: {proximaClaseInfo}
             </Text>
           </View>

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
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Buscar clases..."
            onChangeText={setSearchTerm}
            value={state.searchTerm}
            style={styles.searchbar}
          />
        </View>



        {/* Botón para mostrar filtros avanzados */}
        <View style={styles.filtrosContainer}>
          <TouchableOpacity
            style={[
              styles.filtrosAvanzadosButton,
              { backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
            ]}
            onPress={() => setMostrarFiltrosAvanzados(!state.mostrarFiltrosAvanzados)}
          >
            <Ionicons 
              name={state.mostrarFiltrosAvanzados ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.filtrosAvanzadosText, { color: theme.colors.primary }]}>
              Filtros
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtros avanzados */}
        {state.mostrarFiltrosAvanzados && (
          <View style={styles.filtrosAvanzadosContainer}>
            {/* Filtro por Tipo */}
            <View style={styles.filtroAvanzadoGroup}>
              <Text style={[styles.filtroAvanzadoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Tipo de Clase
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tiposDisponibles.map((tipo) => (
                  <Chip
                    key={tipo.value}
                    selected={state.selectedTipo === tipo.value || (tipo.value === 'todos' && !state.selectedTipo)}
                    onPress={() => setSelectedTipo(tipo.value === 'todos' ? null : tipo.value)}
                    style={[
                      styles.filtroAvanzadoChip,
                      (state.selectedTipo === tipo.value || (tipo.value === 'todos' && !state.selectedTipo)) && {
                        backgroundColor: '#FFD700',
                        borderColor: '#FFA500',
                        borderWidth: 2
                      }
                    ]}
                    textStyle={{ color: 'black' }}
                    selectedColor="#FFD700"
                    icon="check"
                  >
                    {tipo.label}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            {/* Filtro por Profesor */}
            <View style={styles.filtroAvanzadoGroup}>
              <Text style={[styles.filtroAvanzadoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Profesor
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['todos', ...obtenerOpcionesUnicas().profesores].map((profesor) => (
                  <Chip
                    key={profesor}
                    selected={state.selectedProfesor === profesor || (profesor === 'todos' && !state.selectedProfesor)}
                    onPress={() => setSelectedProfesor(profesor === 'todos' ? null : profesor)}
                    style={[
                      styles.filtroAvanzadoChip,
                      (state.selectedProfesor === profesor || (profesor === 'todos' && !state.selectedProfesor)) && {
                        backgroundColor: '#FFD700',
                        borderColor: '#FFA500',
                        borderWidth: 2
                      }
                    ]}
                    textStyle={{ color: 'black' }}
                    selectedColor="#FFD700"
                    icon="check"
                  >
                    {profesor === 'todos' ? 'Todos' : profesor}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            {/* Filtro por Día */}
            <View style={styles.filtroAvanzadoGroup}>
              <Text style={[styles.filtroAvanzadoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Día
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['todos', ...obtenerOpcionesUnicas().dias].map((dia) => (
                  <Chip
                    key={dia}
                    selected={state.selectedDia === dia || (dia === 'todos' && !state.selectedDia)}
                    onPress={() => setSelectedDia(dia === 'todos' ? null : dia)}
                    style={[
                      styles.filtroAvanzadoChip,
                      (state.selectedDia === dia || (dia === 'todos' && !state.selectedDia)) && {
                        backgroundColor: '#FFD700',
                        borderColor: '#FFA500',
                        borderWidth: 2
                      }
                    ]}
                    textStyle={{ color: 'black' }}
                    selectedColor="#FFD700"
                    icon="check"
                  >
                    {dia === 'todos' ? 'Todos' : dia}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            {/* Filtro por Horario */}
            <View style={styles.filtroAvanzadoGroup}>
              <Text style={[styles.filtroAvanzadoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Horario
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['todos', ...obtenerOpcionesUnicas().horarios].map((horario) => (
                  <Chip
                    key={horario}
                    selected={state.selectedHorario === horario || (horario === 'todos' && !state.selectedHorario)}
                    onPress={() => setSelectedHorario(horario === 'todos' ? null : horario)}
                    style={[
                      styles.filtroAvanzadoChip,
                      (state.selectedHorario === horario || (horario === 'todos' && !state.selectedHorario)) && {
                        backgroundColor: '#FFD700',
                        borderColor: '#FFA500',
                        borderWidth: 2
                      }
                    ]}
                    textStyle={{ color: 'black' }}
                    selectedColor="#FFD700"
                    icon="check"
                  >
                    {horario === 'todos' ? 'Todos' : horario}
                  </Chip>
                ))}
              </ScrollView>
            </View>
            
            {/* Botón para limpiar filtros */}
            <TouchableOpacity
              style={[styles.limpiarFiltrosButton, { backgroundColor: theme.colors.errorContainer }]}
              onPress={limpiarFiltros}
            >
              <Ionicons name="close-circle" size={16} color={theme.colors.error} />
              <Text style={[styles.limpiarFiltrosText, { color: theme.colors.error }]}>
                Limpiar Filtros
              </Text>
            </TouchableOpacity>
          </View>
        )}



        {/* Lista de clases */}
        {state.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
              Cargando clases...
            </Text>
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
                No se encontraron clases
              </Text>
            </View>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              Intenta ajustar los filtros de búsqueda
            </Text>
          </View>
        )}
      </View>

      {/* FAB para navegación y actualización */}
      <FAB
        icon="refresh"
        onPress={loadData}
        size="small"
        style={[
          styles.fab, 
          { 
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom > 0 ? insets.bottom + 16 : 32 // Ajuste para Android
          }
        ]}
        loading={state.isLoading}
        label="Actualizar"
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
  fab: {
    position: 'absolute',
    margin: 12,
    right: 12,
    borderRadius: 12,
    elevation: 6, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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

  // Estilos para filtros avanzados
  filtrosAvanzadosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  filtrosAvanzadosText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  filtrosAvanzadosContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filtroAvanzadoGroup: {
    marginBottom: 16,
  },
  filtroAvanzadoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filtroAvanzadoChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  limpiarFiltrosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
  },
  limpiarFiltrosText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Estilos para proximidad
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  proximaClaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  proximaClaseIcon: {
    marginRight: 6,
  },
  proximaClaseText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

});

export default ClaseDetalleScreen;