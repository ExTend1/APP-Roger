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

  // Array de imágenes para alternar aleatoriamente
  const coachImages = [
    require('../../../assets/images/profe.webp'),
    require('../../../assets/images/ezo.webp')
  ];

  // Estado para la imagen seleccionada aleatoriamente
  const [selectedCoachImage, setSelectedCoachImage] = useState(() => {
    const randomIndex = Math.floor(Math.random() * coachImages.length);
    return coachImages[randomIndex];
  });

  // Función para refrescar datos
  const onRefresh = useCallback(async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await Promise.all([fetchClases(), fetchReservas()]);
      // Seleccionar nueva imagen aleatoria al refrescar
      const randomIndex = Math.floor(Math.random() * coachImages.length);
      setSelectedCoachImage(coachImages[randomIndex]);
    } catch (error) {
      console.warn('Error refrescando datos:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchClases, fetchReservas, user, coachImages]);

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
    const iconos: { [key: string]: string } = {
      'FUNCIONAL': 'dumbbell',
      'CROSSFIT': 'gymnastics',
    };
    return iconos[tipo] || 'dumbbell';
  };

  // Función para obtener el color según el tipo de clase
  const getColorByTipo = (tipo: string): string => {
    const colores: { [key: string]: string } = {
      'FUNCIONAL': '#4CAF50',
      'CROSSFIT': '#FF5722',
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

  // Calcular progreso mensual
  const calcularProgresoMensual = () => {
    if (!state.reservas || state.reservas.length === 0) {
      return { clasesCompletadas: 0, porcentaje: 0 };
    }

    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

    // Filtrar reservas del mes actual que ya pasaron
    const clasesCompletadas = state.reservas.filter(reserva => {
      const fechaReserva = new Date(reserva.fecha);
      return fechaReserva >= inicioMes && fechaReserva <= finMes && fechaReserva < ahora;
    }).length;

    // Meta mensual (puedes ajustar según tus necesidades)
    const metaMensual = 16; // 4 clases por semana
    const porcentaje = Math.min(Math.round((clasesCompletadas / metaMensual) * 100), 100);

    return { clasesCompletadas, porcentaje };
  };

  const progresoMensual = calcularProgresoMensual();

  const handleLogout = async () => {
    await logout();
    // Navegación explícita como respaldo
    setTimeout(() => {
      router.replace('/login');
    }, 200);
  };



  // Navegar a mis reservas
  const handleNavigateToReservas = () => {
    router.push('/turnos');
  };

  // Navegar a clases
  const handleNavigateToClases = () => {
    router.push('/clases');
  };

  // Navegar a progreso detallado
  const handleNavigateToProgress = () => {
    // Aquí puedes navegar a una pantalla de progreso detallado
    // Por ahora solo mostrará un console.log
    console.log('Navegar a progreso detallado');
  };

  // Mostrar loading si no hay datos y está cargando
  if (state.isLoading && (!state.clases || !state.reservas)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? "light" : "dark"} backgroundColor={theme.colors.surface} />
        <CustomHeader />
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
      <CustomHeader />
      
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
              accessibilityRole="button"
              accessibilityLabel="Ver clases disponibles"
              accessibilityHint="Toca para ver todas las clases disponibles y anotarte"
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
                      size={24}
                      iconColor="white"
                      style={styles.trendIcon}
                      accessibilityLabel="Icono de tendencia ascendente"
                    />
                  </View>
                </View>
                
                {/* Imagen que se sale del contenedor */}
                <View style={styles.imageContainer}>
                  <Image 
                    source={selectedCoachImage}
                    style={styles.workoutImage}
                    resizeMode="contain"
                    accessibilityLabel="Ilustración de persona haciendo ejercicio"
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
                 style={[styles.nextClassCard, { backgroundColor: theme.colors.surface }]}
                 activeOpacity={0.8}
                 accessibilityRole="button"
                 accessibilityLabel="Próxima clase programada"
                 accessibilityHint="Toca para ver detalles de tu próxima clase"
               >
                 <View style={styles.nextClassContent}>
                   <View style={styles.nextClassTextContainer}>
                     <Text style={[styles.nextClassTitle, { color: theme.dark ? 'white' : 'black' }]}>
                       Próxima <Text style={{color: theme.dark ? '#f6e7c5' : '#FFAF2E', fontSize: 20, fontWeight: 'bold'}}>Clase</Text>
                     </Text>
                     <Text style={[styles.nextClassSubtitle, { color: theme.dark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }]}>
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
                         size={24}
                         iconColor="white"
                         style={styles.nextClassTrendIcon}
                         accessibilityLabel="Icono de reloj"
                       />
                     </View>
                   </View>
                   
                   {/* Icono que se sale del contenedor */}
                   <View style={styles.nextClassImageContainer}>
                     <IconButton
                       icon="calendar-clock"
                       size={50}
                       iconColor={theme.dark ? "rgba(246, 231, 197, 0.9)" : "rgba(255, 175, 46, 0.9)"}
                       style={styles.nextClassIcon}
                       accessibilityLabel="Icono de calendario con reloj"
                     />
                     {/* Círculos de fondo para efecto dinámico */}
                     <View style={styles.nextClassBackgroundCircles}>
                       <View style={[
                         styles.nextClassCircle, 
                         styles.nextClassCircle1, 
                         { backgroundColor: theme.dark ? 'rgba(246, 231, 197, 0.15)' : 'rgba(255, 175, 46, 0.15)' }
                       ]} />
                       <View style={[
                         styles.nextClassCircle, 
                         styles.nextClassCircle2, 
                         { backgroundColor: theme.dark ? 'rgba(246, 231, 197, 0.15)' : 'rgba(255, 175, 46, 0.15)' }
                       ]} />
                       <View style={[
                         styles.nextClassCircle, 
                         styles.nextClassCircle3, 
                         { backgroundColor: theme.dark ? 'rgba(246, 231, 197, 0.15)' : 'rgba(255, 175, 46, 0.15)' }
                       ]} />
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
                accessibilityRole="button"
                accessibilityLabel="Mis reservas activas"
                accessibilityHint="Toca para ver y gestionar tus reservas activas"
              >
                <View style={styles.reservasContent}>
                  <View style={styles.reservasTextContainer}>
                                         <Text style={styles.reservasTitle}>Mis Reservas</Text>
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
                        size={24}
                        iconColor="white"
                        style={styles.reservasTrendIcon}
                        accessibilityLabel="Icono de calendario con check"
                      />
                    </View>
                  </View>                  
                </View>
                             </TouchableOpacity>
             </View>
                       </View>
          </View>

          {/* Indicador de Progreso Mensual */}
          <View style={styles.progressSection}>
            <TouchableOpacity 
              style={[styles.progressCard, { backgroundColor: '#FFAF2E' }]}
              onPress={handleNavigateToProgress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Progreso mensual de clases"
              accessibilityHint="Toca para ver detalles de tu progreso mensual"
            >
              <View style={styles.progressContent}>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Progreso Mensual</Text>
                  <Text style={styles.progressSubtitle}>
                    {state.isLoading ? 'Cargando...' : `${progresoMensual.clasesCompletadas} clases completadas`}
                  </Text>
                </View>
                
                <View style={styles.progressRightSection}>
                  <Text style={styles.progressPercentage}>{progresoMensual.porcentaje}%</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressBarFill, { width: `${progresoMensual.porcentaje}%` }]} />
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
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
    marginBottom: 8, // Reducido para que el indicador de progreso esté más cerca
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
    minHeight: 172.5, // Altura mínima que se puede expandir según el contenido
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    justifyContent: 'flex-start', // Cambiado para mejor distribución del contenido
    paddingVertical: 5,
  },
  nextClassTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  nextClassSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    flexWrap: 'wrap', // Permite que el texto se ajuste
  },
  nextClassBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextClassBadge: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 48,
    justifyContent: 'center',
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
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(246, 231, 197, 0.15)', // Se mantiene para tema oscuro
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
    fontSize: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 48,
    justifyContent: 'center',
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
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    overflow: 'visible',
    marginRight: -30,
    marginTop: 0,
    marginBottom: -30,
    alignSelf: 'flex-end',
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
    minHeight: 172.5, // Altura mínima que se puede expandir según el contenido
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
    justifyContent: 'center', // Centrado vertical
    paddingVertical: 8,
    paddingHorizontal: 4,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
    textAlign: 'center',
  },
  reservasSubtitle: {
    fontSize: 16,
    color: 'black',
    marginBottom: 8,
    textAlign: 'center',
    flexWrap: 'wrap', // Permite que el texto se ajuste
  },
  reservasBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservasBadge: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 48,
    justifyContent: 'center',
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
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Indicador de Progreso Mensual
  progressSection: {
    marginTop: 8 , // Reducido para que esté más cerca de los dos indicadores del grid
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  progressCard: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  progressContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTextContainer: {
    flex: 1,
    zIndex: 2,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 8,
  },
  progressRightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: 120,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  progressBar: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'black',
    borderRadius: 4,
  },

});

export default HomeScreen;