import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Surface, useTheme, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../contexts/authStore';
import { useReservas } from '../../contexts/ReservasContext';
import CustomHeader from '../../components/CustomHeader';
import { calcularProximaClase, getProximaClaseTexto, NextClassInfo } from '../../utils/nextClassCalculator';
import testNextClassCalculator from '../../utils/nextClassCalculator.test';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { state, fetchClases, fetchReservas } = useReservas();
  const [proximaClase, setProximaClase] = useState<NextClassInfo | null>(null);
  const [fechaActual, setFechaActual] = useState(new Date());

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

  // Función para obtener el emoji según el tipo de clase
  const getEmojiByTipo = (tipo: string): string => {
    const emojis: { [key: string]: string } = {
      'YOGA': '🧘‍♀️',
      'PILATES': '🤸‍♀️',
      'SPINNING': '🚴‍♀️',
      'FUNCIONAL': '💪',
      'ZUMBA': '💃',
      'BOXEO': '🥊',
      'NATACION': '🏊‍♀️',
      'CROSSFIT': '🏋️‍♂️',
      'DANZA': '🩰',
      'MEDITACION': '🧘‍♂️',
    };
    return emojis[tipo] || '🏋️‍♂️';
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

  // Función para formatear la fecha actual
  const formatFechaActual = (fecha: Date): string => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const dia = dias[fecha.getDay()];
    const diaNumero = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${dia} ${diaNumero} de ${mes} de ${año}`;
  };

  // Calcular la próxima clase cuando cambien los datos
  useEffect(() => {
    if (state.clases && state.reservas) {
      const proxima = calcularProximaClase(state.clases, state.reservas, fechaActual);
      setProximaClase(proxima);
    }
  }, [state.clases, state.reservas, fechaActual]);

  // Actualizar la fecha cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaActual(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

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

  const handleSettingsPress = () => {
    // Aquí puedes navegar a la configuración
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      
      {/* Header personalizado */}
      <CustomHeader
        onBellPress={handleBellPress}
        onSettingsPress={handleSettingsPress}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Content */}
        <View style={styles.content}>
          {/* Card de fecha actual */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                📅 {formatFechaActual(fechaActual)}
              </Text>
              
              {/* Próxima clase */}
              {proximaClase ? (
                <View style={styles.proximaClaseContainer}>
                  <Text style={[styles.proximaClaseLabel, { color: theme.colors.primary }]}>
                    Próxima clase:
                  </Text>
                  <View style={styles.proximaClaseInfo}>
                    <Text style={styles.proximaClaseEmoji}>
                      {getEmojiByTipo(proximaClase.clase.tipo)}
                    </Text>
                    <View style={styles.proximaClaseDetails}>
                      <Text style={[styles.proximaClaseNombre, { color: theme.colors.onSurface }]}>
                        {proximaClase.clase.nombre}
                      </Text>
                      <Text style={[styles.proximaClaseHorario, { color: theme.colors.onSurfaceVariant }]}>
                        {getProximaClaseTexto(proximaClase)}
                      </Text>
                    </View>
                    <Chip 
                      mode="flat"
                      style={[styles.tipoChip, { backgroundColor: getColorByTipo(proximaClase.clase.tipo) }]}
                      textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
                    >
                      {proximaClase.clase.tipo.charAt(0).toUpperCase() + proximaClase.clase.tipo.slice(1)}
                    </Chip>
                  </View>
                </View>
              ) : (
                <Text style={[styles.noClasesText, { color: theme.colors.onSurfaceVariant }]}>
                  No hay clases programadas próximamente
                </Text>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                🏋️‍♂️ Roger Gym
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Tu app de entrenamiento
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                👤 Tu Perfil
              </Text>
              <Text style={[styles.profileText, { color: theme.colors.onSurfaceVariant }]}>
                Email: {user?.email}
              </Text>
              <Text style={[styles.profileText, { color: theme.colors.onSurfaceVariant }]}>
                Rol: {user?.rol}
              </Text>
            </Card.Content>
          </Card>

          {/* Botón de logout */}
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            labelStyle={[styles.logoutButtonLabel, { color: theme.colors.error }]}
            buttonColor="transparent"
          >
            Cerrar Sesión
          </Button>
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
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
  },
  profileText: {
    fontSize: 14,
    marginBottom: 4,
  },
  proximaClaseContainer: {
    marginTop: 12,
  },
  proximaClaseLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  proximaClaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 12,
  },
  proximaClaseEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  proximaClaseDetails: {
    flex: 1,
  },
  proximaClaseNombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  proximaClaseHorario: {
    fontSize: 14,
    opacity: 0.8,
  },
  tipoChip: {
    borderRadius: 12,
  },
  noClasesText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 32,
    borderColor: 'transparent',
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  logoutButtonLabel: {
    fontSize: 16,
  },
});

export default HomeScreen;