import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, Surface, useTheme, Chip, IconButton, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../contexts/authStore';
import { useReservas } from '../../contexts/ReservasContext';
import CustomHeader from '../../components/CustomHeader';
import { calcularProximaClase, getProximaClaseTexto, NextClassInfo } from '../../utils/nextClassCalculator';
import testNextClassCalculator from '../../utils/nextClassCalculator.test';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { state, fetchClases, fetchReservas } = useReservas();
  const [proximaClase, setProximaClase] = useState<NextClassInfo | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
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
  }, [fetchClases, fetchReservas]);

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
      >
        {/* Content */}
        <View style={styles.content}>
          
          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={styles.statContent}>
                <IconButton
                  icon="calendar-check"
                  size={24}
                  iconColor={theme.colors.primary}
                  style={styles.statIcon}
                />
                <View style={styles.statTextContainer}>
                  <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
                    {state.reservas?.length || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Reservas
                  </Text>
                </View>
              </View>
            </Surface>

            <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={styles.statContent}>
                <IconButton
                  icon="dumbbell"
                  size={24}
                  iconColor={theme.colors.secondary}
                  style={styles.statIcon}
                />
                <View style={styles.statTextContainer}>
                  <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
                    {state.clases?.length || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Clases
                  </Text>
                </View>
              </View>
            </Surface>
          </View>

          {/* Next Class Section */}
          <Surface style={[styles.nextClassCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.nextClassHeader}>
              <IconButton
                icon="clock-outline"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text style={[styles.nextClassTitle, { color: theme.colors.onSurface }]}>
                Próxima Clase
              </Text>
            </View>
            
            {proximaClase ? (
              <View style={styles.nextClassContent}>
                <View style={styles.nextClassIconContainer}>
                  <IconButton
                    icon={getIconByTipo(proximaClase.clase.tipo)}
                    size={32}
                    iconColor="white"
                    style={[styles.nextClassIcon, { backgroundColor: getColorByTipo(proximaClase.clase.tipo) }]}
                  />
                </View>
                <View style={styles.nextClassDetails}>
                  <Text style={[styles.nextClassName, { color: theme.colors.onSurface }]}>
                    {proximaClase.clase.nombre}
                  </Text>
                  <Text style={[styles.nextClassTime, { color: theme.colors.onSurfaceVariant }]}>
                    {getProximaClaseTexto(proximaClase)}
                  </Text>
                  <Chip 
                    mode="flat"
                    style={[styles.nextClassChip, { backgroundColor: getColorByTipo(proximaClase.clase.tipo) }]}
                    textStyle={{ color: 'white', fontSize: 12, fontWeight: '600' }}
                  >
                    {proximaClase.clase.tipo.charAt(0).toUpperCase() + proximaClase.clase.tipo.slice(1)}
                  </Chip>
                </View>
              </View>
            ) : (
              <View style={styles.noClassContainer}>
                <IconButton
                  icon="calendar-remove"
                  size={32}
                  iconColor={theme.colors.onSurfaceVariant}
                />
                <Text style={[styles.noClassText, { color: theme.colors.onSurfaceVariant }]}>
                  No hay clases programadas
                </Text>
                <Text style={[styles.noClassSubtext, { color: theme.colors.onSurfaceVariant }]}>
                  Ve a la sección de clases para reservar
                </Text>
              </View>
            )}
          </Surface>

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
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
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

  // Next Class Section
  nextClassCard: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
  },
  nextClassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextClassTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextClassContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextClassIconContainer: {
    marginRight: 16,
  },
  nextClassIcon: {
    margin: 0,
    borderRadius: 12,
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
});

export default HomeScreen;