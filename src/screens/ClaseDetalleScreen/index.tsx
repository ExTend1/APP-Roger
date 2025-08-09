import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  FAB,
  Searchbar,
  Snackbar,
  Text,
  useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, CalendarTheme, DateData } from 'react-native-calendars';
import CustomHeader from '../../components/CustomHeader';
import { useReservas } from '../../contexts/ReservasContext';
import { ClaseCardData } from '../../types/reservas';

const ClaseDetalleScreen: React.FC = () => {
  const theme = useTheme();
  const { 
    state, 
    fetchClases, 
    fetchReservas, 
    reservarClase, 
    cancelarReserva, 
    setSearchTerm, 
    setSelectedTipo,
    getClasesFiltradas,
    isClaseReservada,
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
    await Promise.all([
      fetchClases(),
      fetchReservas()
    ]);
  };

  // Manejadores para los iconos del header
  const handleBellPress = () => {
    console.log('🔔 Notificaciones');
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
    } catch (error) {
      showSnackbar('Error inesperado', 'error');
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

  // Obtener imagen según el tipo de clase
  const getImageByTipo = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower === 'crossfit') {
      return require('../../../assets/images/crossfit.png');
    } else if (tipoLower === 'pilates') {
      return require('../../../assets/images/pilates.png');
    }
    
    return null; // Para otros tipos, no mostrar imagen
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
    { value: 'cardio', label: 'Cardio' },
    { value: 'fuerza', label: 'Fuerza' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'aqua', label: 'Aqua' },
    { value: 'baile', label: 'Baile' },
  ];

  // Renderizar tarjeta de clase
  const renderClaseCard = ({ item: clase }: { item: ClaseCardData }) => {
    const isReservada = isClaseReservada(clase.id);
    const colorTipo = getColorByTipo(clase.tipo);
    
    return (
      <View style={[styles.claseCard, { backgroundColor: theme.colors.surface }]}>
                  {/* Sección Superior - Gradiente */}
          <View style={[
            styles.topSection, 
            { 
              backgroundColor: theme.dark ? '#2C2C2C' : '#FFFFFF',
            }
          ]}>
            {/* Background Image para crossfit y pilates */}
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
                       <Text style={styles.photoPlaceholderText}>
                         {getEmojiByTipo(clase.tipo)}
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
               <Text style={[styles.detailIcon, { color: theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)' }]}>🕐</Text>
               <Text style={[styles.detailText, { color: theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)' }]}>
                 {clase.horario} • {clase.duracion} min
               </Text>
             </View>

             {/* Profesor y cupo */}
             <View style={styles.detailRow}>
               <Text style={[styles.detailIcon, { color: theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)' }]}>👥</Text>
               <Text style={[styles.detailText, { color: theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)' }]}>
                 {clase.profesor} • {clase.cupo || 12}/{clase.cupo || 12} cupos
               </Text>
             </View>

             {/* Días */}
             <View style={styles.detailRow}>
               <Text style={[styles.detailIcon, { color: theme.dark ? 'white' : 'rgba(0, 0, 0, 0.7)' }]}>📅</Text>
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
              disabled={state.isReserving || state.isCanceling}
              style={[
                styles.reservaButton,
                { 
                  backgroundColor: isReservada ? '#F54927' : '#7DE34D',
                  borderRadius: 12,
                }
              ]}
              labelStyle={styles.buttonLabel}
            >
              {isReservada ? 'Cancelar Reserva' : 'Reservar Clase'}
            </Button>
          </View>
        </View>
      </View>
    );
  };

  // Obtener clases filtradas
  const clasesFiltradas = getClasesFiltradas();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      
      {/* Header personalizado */}
      <CustomHeader
        onBellPress={handleBellPress}
      />

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Barra de búsqueda */}
        <Searchbar
          placeholder="Buscar clases..."
          onChangeText={setSearchTerm}
          value={state.searchTerm}
          style={styles.searchbar}
        />

                 {/* Filtros por tipo */}
         <View style={styles.filtrosContainer}>
           <ScrollView 
             horizontal 
             showsHorizontalScrollIndicator={false}
             contentContainerStyle={styles.filtrosContent}
           >
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
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              🏋️‍♂️ No se encontraron clases
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              Intenta ajustar los filtros de búsqueda
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
    paddingHorizontal: 16, // Restaurado el padding horizontal original
  },
  searchbar: {
    marginVertical: 12,
    marginHorizontal: 16, // Agregado margen horizontal solo para la búsqueda
    borderRadius: 12,
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
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
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
});

export default ClaseDetalleScreen;