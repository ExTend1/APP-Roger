import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  FAB,
  Searchbar,
  Snackbar,
  Text,
  useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <Card style={[styles.claseCard, { backgroundColor: theme.colors.surface }]} elevation={3}>
        <Card.Content>
          {/* Header con tipo y estado */}
          <View style={styles.claseHeader}>
            <View style={styles.tipoContainer}>
              <Text style={styles.claseEmoji}>
                {getEmojiByTipo(clase.tipo)}
              </Text>
              <Chip 
                mode="flat"
                style={[styles.tipoChip, { backgroundColor: colorTipo }]}
                textStyle={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}
              >
                {clase.tipo.charAt(0).toUpperCase() + clase.tipo.slice(1)}
              </Chip>
            </View>
            
            <Chip
              mode="flat"
              style={[
                styles.tipoChip,
                isReservada ? styles.reservadoChip : styles.disponibleChip
              ]}
              textStyle={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}
            >
              {isReservada ? '✓ Reservada' : '○ Disponible'}
            </Chip>
          </View>

          {/* Información de la clase */}
          <Text style={[styles.claseNombre, { color: theme.colors.onSurface }]}>
            {clase.nombre}
          </Text>
          
          <Text style={[styles.claseDescripcion, { color: theme.colors.onSurfaceVariant }]}>
            {clase.descripcion}
          </Text>

          {/* Detalles mejorados */}
          <View style={styles.detallesContainer}>
            <View style={styles.detalleRow}>
              <Text style={[styles.detalleIcon, { color: theme.colors.primary }]}>👨‍🏫</Text>
              <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant, fontWeight: '500' }]}>
                {clase.profesor}
              </Text>
            </View>
            
            <View style={styles.detalleRow}>
              <Text style={[styles.detalleIcon, { color: theme.colors.primary }]}>⏰</Text>
              <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant }]}>
                {clase.horario} • {clase.duracion} min
              </Text>
            </View>
            
            <View style={styles.detalleRow}>
              <Text style={[styles.detalleIcon, { color: theme.colors.primary }]}>📅</Text>
              <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant }]}>
                {formatDias(clase.dias)}
              </Text>
            </View>

            {clase.cupo && (
              <View style={styles.detalleRow}>
                <Text style={[styles.detalleIcon, { color: theme.colors.primary }]}>👥</Text>
                <Text style={[styles.detalleTexto, { color: theme.colors.onSurfaceVariant }]}>
                  Cupo: {clase.cupo} personas
                </Text>
              </View>
            )}
          </View>
        </Card.Content>

        {/* Botón de acción mejorado */}
        <Card.Actions style={styles.cardActions}>
          <Button
            mode={isReservada ? 'outlined' : 'contained'}
            onPress={() => handleReservaToggle(clase)}
            loading={state.isReserving || state.isCanceling}
            disabled={state.isReserving || state.isCanceling}
            icon={isReservada ? 'close' : 'check'}
            style={[
              styles.reservaButton,
              isReservada && { borderColor: theme.colors.error }
            ]}
            buttonColor={isReservada ? undefined : theme.colors.primary}
            textColor={isReservada ? theme.colors.error : 'white'}
          >
            {isReservada ? 'Cancelar Reserva' : 'Reservar Clase'}
          </Button>
        </Card.Actions>
      </Card>
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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtrosContainer}
          contentContainerStyle={styles.filtrosContent}
        >
          {tiposDisponibles.map((tipo) => (
            <Chip
              key={tipo.value}
              mode={state.selectedTipo === tipo.value ? 'flat' : 'outlined'}
              selected={state.selectedTipo === tipo.value}
              onPress={() => setSelectedTipo(tipo.value === 'todos' ? null : tipo.value)}
              style={styles.filtroChip}
            >
              {tipo.label}
            </Chip>
          ))}
        </ScrollView>

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
    paddingHorizontal: 16,
  },
  searchbar: {
    marginVertical: 12,
    borderRadius: 12,
  },
  filtrosContainer: {
    marginBottom: 16,
  },
  filtrosContent: {
    paddingHorizontal: 4,
  },
  filtroChip: {
    marginRight: 8,
    marginVertical: 4,
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
    marginHorizontal: 4,
  },
  claseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  claseEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  tipoChip: {
    borderRadius: 20,
  },
  reservadoChip: {
    backgroundColor: '#4CAF50',
  },
  disponibleChip: {
    borderColor: '#2196F3',
  },
  claseNombre: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  claseDescripcion: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.8,
  },
  detallesContainer: {
    gap: 12,
    marginTop: 8,
  },
  detalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detalleIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  detalleTexto: {
    fontSize: 15,
    flex: 1,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  reservaButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
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

export default ClaseDetalleScreen;