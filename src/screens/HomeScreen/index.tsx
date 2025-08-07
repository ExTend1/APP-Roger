import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import { useAuthStore } from '../../contexts/authStore';
import { useReservas } from '../../contexts/ReservasContext';
import { calcularProximaClase, NextClassInfo } from '../../utils/nextClassCalculator';
import testNextClassCalculator from '../../utils/nextClassCalculator.test';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { state, fetchClases, fetchReservas, getReservasActivas } = useReservas();
  const [proximaClase, setProximaClase] = useState<NextClassInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Función para refrescar datos
  const onRefresh = useCallback(async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await Promise.all([fetchClases(), fetchReservas()]);
    } catch (error) {
      console.warn('Error refrescando datos:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchClases, fetchReservas, user]);

  // Cargar datos al montar el componente y cuando cambie el usuario
  useEffect(() => {
    const loadData = async () => {
      if (!user) return; // No cargar datos si no hay usuario logueado
      
      try {
        await Promise.all([fetchClases(), fetchReservas()]);
      } catch (error) {
        // Error silencioso para evitar logs en producción
      }
    };
    
    loadData();
    
    // Test the calculator logic (only in development)
    if (__DEV__) {
      testNextClassCalculator();
    }
  }, [fetchClases, fetchReservas, user?.id]); // Agregar user?.id como dependencia

  // Función para obtener el icono según el tipo de clase
  const getIconByTipo = (tipo: string): string => {
    const icons: { [key: string]: string } = {
      'YOGA': 'human-handsup',
      'PILATES': 'human-handsup',
      'SPINNING': 'bike',
      'FUNCIONAL': 'dumbbell',
      'ZUMBA': 'music',
      'BOXEO': 'hand-back-right',
      'NATACION': 'swim',
      'CROSSFIT': 'dumbbell',
      'DANZA': 'music-note',
      'MEDITACION': 'human-handsup',
    };
    return icons[tipo] || 'dumbbell';
  };

  // Función para obtener el color según el tipo de clase
  const getColorByTipo = (tipo: string): string => {
    const colores: { [key: string]: string } = {
      'YOGA': '#9C27B0',
      'PILATES': '#FF9800',
      'SPINNING': '#2196F3',
      'FUNCIONAL': '#4CAF50',
      'ZUMBA': '#E91E63',
      'BOXEO': '#F44336',
      'NATACION': '#00BCD4',
      'CROSSFIT': '#795548',
      'DANZA': '#FF5722',
      'MEDITACION': '#607D8B',
    };
    return colores[tipo] || '#666666';
  };

  // Calcular la próxima clase cuando cambien los datos
  useEffect(() => {
    if (state.clases && state.reservas) {
      const proxima = calcularProximaClase(state.clases, state.reservas, new Date());
      setProximaClase(proxima);
    }
  }, [state.clases, state.reservas]);

  // Obtener reservas activas para el indicador
  const reservasActivas = getReservasActivas();

  const handleLogout = async () => {
    await logout();
    // Navegación explícita como respaldo
    setTimeout(() => {
      router.replace('/login');
    }, 200);
  };

  // Manejadores para los iconos del header
  const handleBellPress = () => {
    // Aquí puedes navegar a las notificaciones
  };

  // Navegar a mis reservas
  const handleNavigateToReservas = () => {
    router.push('/turnos');
  };

  // Navegar a clases
  const handleNavigateToClases = () => {
    router.push('/clases');
  };

  // Mostrar loading si no hay datos y está cargando
  if (state.isLoading && (!state.clases || !state.reservas)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? "light" : "dark"} backgroundColor={theme.colors.surface} />
        <CustomHeader onBellPress={handleBellPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Cargando datos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? "light" : "dark"} backgroundColor={theme.colors.surface} />
      
      {/* Header personalizado */}
      <CustomHeader
        onBellPress={handleBellPress}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Content */}
        <View style={styles.content} >
          
          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Indicador de clases arriba */}
            <TouchableOpacity 
              style={[styles.workoutCard, { backgroundColor: '#FFE95C' }]}
              onPress={handleNavigateToClases}
              activeOpacity={0.8}
            >
              <View style={styles.workoutContent}>
                <View style={styles.workoutTextContainer}>
                  <Text style={styles.workoutTitle}>¡Anotate a Nuestras Clases!</Text>
                  <Text style={[styles.workoutSubtitle, {fontSize: 20, fontWeight: 'bold'}]}>
                    {state.isLoading ? 'Cargando...' : `${state.clases?.length || 0} clases disponibles`}
                  </Text>
                  <View style={styles.caloriesContainer}>
                    <View style={styles.caloriesBadge}>
                      <Text style={styles.caloriesText}>
                        {state.isLoading ? '...' : (state.clases?.length || 0)}
                      </Text>
                    </View>
                    <IconButton
                      icon="trending-up"
                      size={16}
                      iconColor="white"
                      style={styles.trendIcon}
                    />
                  </View>
                </View>
                
                {/* Imagen que se sale del contenedor */}
                <View style={styles.imageContainer}>
                  <Image 
                    source={require('../../../assets/images/aguchin.png')}
                    style={styles.workoutImage}
                    resizeMode="cover"
                  />
                  {/* Círculos de fondo para efecto dinámico */}
                  <View style={styles.backgroundCircles}>
                    <View style={[styles.circle, styles.circle1]} />
                    <View style={[styles.circle, styles.circle2]} />
                    <View style={[styles.circle, styles.circle3]} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Grid de dos columnas: Próxima Clase y Mis Reservas */}
          <View style={styles.bottomGrid}>
                         {/* Próxima Clase - Izquierda */}
             <View style={styles.leftColumn}>
               <TouchableOpacity 
                 style={[styles.nextClassCard, { backgroundColor: '#222222' }]}
                 activeOpacity={0.8}
               >
                 <View style={styles.nextClassContent}>
                   <View style={styles.nextClassTextContainer}>
                     <Text style={styles.nextClassTitle}>Próxima <Text style={{color: '#f6e7c5', fontSize: 20, fontWeight: 'bold'}}>Clase</Text></Text>
                     <Text style={styles.nextClassSubtitle}>
                       {proximaClase ? proximaClase.clase.nombre : 'No hay clases programadas'}
                     </Text>
                     <View style={styles.nextClassBadgeContainer}>
                       <View style={styles.nextClassBadge}>
                         <Text style={styles.nextClassBadgeText}>
                           {proximaClase ? proximaClase.clase.tipo.charAt(0).toUpperCase() + proximaClase.clase.tipo.slice(1) : '0'}
                         </Text>
                       </View>
                       <IconButton
                         icon="clock-outline"
                         size={16}
                         iconColor="white"
                         style={styles.nextClassTrendIcon}
                       />
                     </View>
                   </View>
                   
                   {/* Icono que se sale del contenedor */}
                   <View style={styles.nextClassImageContainer}>
                     <IconButton
                       icon="calendar-clock"
                       size={50}
                       iconColor="rgba(246, 231, 197, 0.9)"
                       style={styles.nextClassIcon}
                     />
                     {/* Círculos de fondo para efecto dinámico */}
                     <View style={styles.nextClassBackgroundCircles}>
                       <View style={[styles.nextClassCircle, styles.nextClassCircle1]} />
                       <View style={[styles.nextClassCircle, styles.nextClassCircle2]} />
                       <View style={[styles.nextClassCircle, styles.nextClassCircle3]} />
                     </View>
                   </View>
                 </View>
               </TouchableOpacity>
             </View>

            {/* Mis Reservas - Derecha */}
            <View style={styles.rightColumn}>
              <TouchableOpacity 
                style={[styles.reservasCard, { backgroundColor: '#FFAF2E' }]}
                onPress={handleNavigateToReservas}
                activeOpacity={0.8}
              >
                <View style={styles.reservasContent}>
                  <View style={styles.reservasTextContainer}>
                    <Text style={styles.reservasTitle}>Mis <Text style={{color: 'black', fontSize: 28, fontWeight: 'bold'}}>Reservas</Text></Text>
                    <Text style={styles.reservasSubtitle}>
                      {state.isLoading ? 'Cargando...' : `${reservasActivas.length} reservas activas`}
                    </Text>
                    <View style={styles.reservasBadgeContainer}>
                      <View style={styles.reservasBadge}>
                        <Text style={styles.reservasBadgeText}>
                          {state.isLoading ? '...' : reservasActivas.length}
                        </Text>
                      </View>
                      <IconButton
                        icon="calendar-check"
                        size={16}
                        iconColor="white"
                        style={styles.reservasTrendIcon}
                      />
                    </View>
                  </View>                  
                </View>
                             </TouchableOpacity>
             </View>
           </View>
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
    padding: 16,
  },

  // Stats Grid
  statsGrid: {
    marginBottom: 20,
  },
  
  // Bottom Grid - Dos columnas
  bottomGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  leftColumn: {
    flex: 0.5,
  },
  rightColumn: {
    flex: 0.5,
  },
  statCard: {
    flex: 0.5,
    borderRadius: 16,
    padding: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    margin: 0,
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statLoading: {
    marginLeft: 8,
  },

  // Next Class Section
  nextClassCard: {
    borderRadius: 20,
    marginTop: 0,
    padding: 20,
    minHeight: 172.5,
    overflow: 'hidden',
    position: 'relative',
  },
  nextClassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextClassContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextClassTextContainer: {
    flex: 1,
    zIndex: 2,
  },
  nextClassTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  nextClassSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  nextClassBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextClassBadge: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  nextClassBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextClassTrendIcon: {
    backgroundColor: '#000',
    borderRadius: 8,
    margin: 0,
  },
  nextClassImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginRight: -90,
    marginTop: -60,
  },
  nextClassIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextClassBackgroundCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  nextClassCircle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(246, 231, 197, 0.15)',
  },
  nextClassCircle1: {
    width: 80,
    height: 80,
    top: -10,
    right: 20,
  },
  nextClassCircle2: {
    width: 60,
    height: 60,
    bottom: 10,
    right: 60,
  },
  nextClassCircle3: {
    width: 40,
    height: 40,
    top: 30,
    right: 40,
  },
  nextClassDetails: {
    flex: 1,
  },
  nextClassName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  nextClassTime: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  nextClassChip: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  noClassContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noClassText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  noClassSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  // Nuevo indicador de clases con estilo mejorado
  workoutCard: {
    backgroundColor: '#FFE95C',
    borderRadius: 20,
    overflow: 'hidden', // Para que la imagen se salga del contenedor
    padding: 20,
    position: 'relative',
    minHeight: 140,
  },
  workoutContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutTextContainer: {
    flex: 1,
    zIndex: 2,
  },
  workoutLabel: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
    fontWeight: '500',
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  workoutSubtitle: {
    fontSize: 14,
    color: 'orange',
    marginBottom: 12,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesBadge: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  caloriesText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  trendIcon: {
    backgroundColor: '#000',
    borderRadius: 8,
    margin: 0,
  },
  imageContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    overflow: 'hidden',
    marginRight: -50, // Para que se salga más del contenedor
    marginTop: -30,
    marginBottom: -47,
  },
  workoutImage: {
    width: '100%',
    height: '100%',
  },
  backgroundCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  circle1: {
    width: 80,
    height: 80,
    top: -10,
    right: 20,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: 10,
    right: 60,
  },
  circle3: {
    width: 40,
    height: 40,
    top: 30,
    right: 40,
  },
  progressContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Nuevo indicador de reservas con estilo mejorado
  reservasCard: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reservasContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reservasTextContainer: {
    flex: 1,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservasLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  reservasNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  reservasAction: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Nuevo indicador de reservas con estilo mejorado (nuevo)
  reservasContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  reservasTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  reservasSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  reservasBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservasBadge: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  reservasBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reservasTrendIcon: {
    backgroundColor: '#000',
    borderRadius: 8,
    margin: 0,
  },
  reservasImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginLeft: -20, // Para que se salga del contenedor
    marginTop: -10,
  },
  reservasIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reservasBackgroundCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  reservasCircle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  reservasCircle1: {
    width: 80,
    height: 80,
    top: -10,
    right: 20,
  },
  reservasCircle2: {
    width: 60,
    height: 60,
    bottom: 10,
    right: 60,
  },
  reservasCircle3: {
    width: 40,
    height: 40,
    top: 30,
    right: 40,
  },

});

export default HomeScreen;