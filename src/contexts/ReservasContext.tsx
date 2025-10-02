import React, { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import NotificationService from '../services/notificationService';
import { reservaService } from '../services/reservaService';
import {
    Clase,
    ClaseCardData,
    EstadoReserva,
    ReservaCardData,
    ReservaConClase
} from '../types/reservas';
import { useAuthStore } from './authStore';
import { useNotificationConfig } from './NotificationConfigContext';

// Estado del contexto
interface ReservasState {
  // Datos
  clases: ClaseCardData[];
  reservas: ReservaCardData[];
  selectedClase: Clase | null;
  
  // Estados de carga
  isLoading: boolean;
  isReserving: boolean;
  isCanceling: boolean;
  
  // Filtros y UI
  searchTerm: string;
  selectedTipo: string | null;
  selectedProfesor: string | null;
  selectedDia: string | null;
  selectedHorario: string | null;
  mostrarFiltrosAvanzados: boolean;
  
  // Error
  error: string | null;
  userTokens: number; // Agregar estado para tokens del usuario
}

// Acciones del reducer
type ReservasAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESERVING'; payload: boolean }
  | { type: 'SET_CANCELING'; payload: boolean }
  | { type: 'SET_CLASES'; payload: ClaseCardData[] }
  | { type: 'SET_RESERVAS'; payload: ReservaConClase[] }
  | { type: 'SET_SELECTED_CLASE'; payload: ClaseCardData | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SELECTED_TIPO'; payload: string | null }
  | { type: 'SET_SELECTED_PROFESOR'; payload: string | null }
  | { type: 'SET_SELECTED_DIA'; payload: string | null }
  | { type: 'SET_SELECTED_HORARIO'; payload: string | null }
  | { type: 'SET_MOSTRAR_FILTROS_AVANZADOS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_RESERVA'; payload: ReservaConClase }
  | { type: 'REMOVE_RESERVA'; payload: string } // claseId
  | { type: 'UPDATE_CLASE_RESERVA_STATUS'; payload: { claseId: string; isReservada: boolean; reservaId?: string } }
  | { type: 'SET_USER_TOKENS'; payload: number }; // Nueva acción para tokens

// Estado inicial
const initialState: ReservasState = {
  clases: [],
  reservas: [],
  selectedClase: null,
  isLoading: false,
  isReserving: false,
  isCanceling: false,
  searchTerm: '',
  selectedTipo: null,
  error: null,
  userTokens: 0, // Agregar estado para tokens del usuario
  // Nuevos filtros avanzados
  selectedProfesor: null,
  selectedDia: null,
  selectedHorario: null,
  mostrarFiltrosAvanzados: false,
};

// Reducer
const reservasReducer = (state: ReservasState, action: ReservasAction): ReservasState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_RESERVING':
      return { ...state, isReserving: action.payload };
    
    case 'SET_CANCELING':
      return { ...state, isCanceling: action.payload };
    
    case 'SET_CLASES':
      // Convertir clases a ClaseCardData manteniendo el estado de reserva
      const clasesConReserva = action.payload.map(clase => {
        const claseExistente = state.clases.find(c => c.id === clase.id);
        return {
          ...clase,
          isReservada: claseExistente?.isReservada || false,
          reservaId: claseExistente?.reservaId,
        };
      });
      return { ...state, clases: clasesConReserva };
    
    case 'SET_RESERVAS':
      // Convertir reservas a ReservaCardData y actualizar estado de clases
      const reservasFormateadas = action.payload.map(formatReservaCardData);
      const clasesActualizadas = state.clases.map(clase => {
        const reserva = action.payload.find(r => r.claseId === clase.id && r.estado === 'ACTIVA');
        return {
          ...clase,
          isReservada: !!reserva,
          reservaId: reserva?.id,
        };
      });
      return { 
        ...state, 
        reservas: reservasFormateadas,
        clases: clasesActualizadas,
      };
    
    case 'SET_SELECTED_CLASE':
      return { ...state, selectedClase: action.payload };
    
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    
    case 'SET_SELECTED_TIPO':
      return { ...state, selectedTipo: action.payload };
    
    case 'SET_SELECTED_PROFESOR':
      return { ...state, selectedProfesor: action.payload };
    
    case 'SET_SELECTED_DIA':
      return { ...state, selectedDia: action.payload };
    
    case 'SET_SELECTED_HORARIO':
      return { ...state, selectedHorario: action.payload };
    
    case 'SET_MOSTRAR_FILTROS_AVANZADOS':
      return { ...state, mostrarFiltrosAvanzados: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'ADD_RESERVA':
      const nuevaReserva = formatReservaCardData(action.payload);
      const clasesConNuevaReserva = state.clases.map(clase => 
        clase.id === action.payload.claseId 
          ? { ...clase, isReservada: true, reservaId: action.payload.id }
          : clase
      );
      return {
        ...state,
        reservas: [...state.reservas, nuevaReserva],
        clases: clasesConNuevaReserva,
      };
    
    case 'REMOVE_RESERVA':
      const reservasSinCancelada = state.reservas.filter(r => r.claseId !== action.payload);
      const clasesSinReserva = state.clases.map(clase => 
        clase.id === action.payload 
          ? { ...clase, isReservada: false, reservaId: undefined }
          : clase
      );
      return {
        ...state,
        reservas: reservasSinCancelada,
        clases: clasesSinReserva,
      };
    
    case 'UPDATE_CLASE_RESERVA_STATUS':
      const clasesConEstadoActualizado = state.clases.map(clase => 
        clase.id === action.payload.claseId 
          ? { 
              ...clase, 
              isReservada: action.payload.isReservada,
              reservaId: action.payload.reservaId,
            }
          : clase
      );
      return { ...state, clases: clasesConEstadoActualizado };
    
    case 'SET_USER_TOKENS':
      return { ...state, userTokens: action.payload };
    
    default:
      return state;
  }
};

// Funciones helper
const formatDias = (dias: string[]): string => {
  const diasAbreviados: Record<string, string> = {
    'LUNES': 'Lun',
    'MARTES': 'Mar',
    'MIERCOLES': 'Mié',
    'JUEVES': 'Jue',
    'VIERNES': 'Vie',
    'SABADO': 'Sáb',
    'DOMINGO': 'Dom',
  };
  
  return dias.map(dia => diasAbreviados[dia] || dia).join(', ');
};

const formatFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getEstadoTexto = (estado: EstadoReserva): string => {
  switch (estado) {
    case 'ACTIVA':
      return 'Confirmada';
    case 'CANCELADA':
      return 'Cancelada';
    case 'COMPLETADA':
      return 'Completada';
    default:
      return estado;
  }
};

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

const getEstadoColor = (estado: EstadoReserva): string => {
  switch (estado) {
    case 'ACTIVA':
      return '#4CAF50'; // Verde
    case 'CANCELADA':
      return '#F44336'; // Rojo
    case 'COMPLETADA':
      return '#2196F3'; // Azul
    default:
      return '#757575'; // Gris
  }
};

const formatReservaCardData = (reserva: ReservaConClase): ReservaCardData => ({
  ...reserva,
  diasTexto: formatDias(reserva.clase.dias),
  fechaFormateada: formatFecha(reserva.fecha),
  estadoTexto: getEstadoTexto(reserva.estado),
  estadoColor: getEstadoColor(reserva.estado),
});

// Contexto
export interface ReservasContextType {
  // Estado
  state: ReservasState;
  
  // Acciones de datos
  fetchClases: () => Promise<void>;
  fetchReservas: () => Promise<void>;
  reservarClase: (claseId: string) => Promise<boolean>;
  cancelarReserva: (claseId: string) => Promise<boolean>;
  
  // Acciones de UI
  setSearchTerm: (term: string) => void;
  setSelectedTipo: (tipo: string | null) => void;
  setSelectedProfesor: (profesor: string | null) => void;
  setSelectedDia: (dia: string | null) => void;
  setSelectedHorario: (horario: string | null) => void;
  setMostrarFiltrosAvanzados: (mostrar: boolean) => void;
  limpiarFiltros: () => void;
  obtenerOpcionesUnicas: () => { tipos: string[]; profesores: string[]; dias: string[]; horarios: string[] };
  setSelectedClase: (clase: ClaseCardData | null) => void;
  clearError: () => void;
  
  // Getters
  getClasesFiltradas: () => ClaseCardData[];
  getReservasActivas: () => ReservaCardData[];
  isClaseReservada: (claseId: string) => boolean;
  getDisponibilidadCupos: (claseId: string) => Promise<any>;
  fetchUserTokens: () => Promise<void>;
  loadData: () => Promise<void>;
}

const ReservasContext = createContext<ReservasContextType | undefined>(undefined);

// Provider
interface ReservasProviderProps {
  children: ReactNode;
}

export const ReservasProvider: React.FC<ReservasProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reservasReducer, initialState);
  const { user, isAuthenticated } = useAuthStore();
  const { notificationsEnabled } = useNotificationConfig();

  // Cargar clases
  const fetchClases = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await reservaService.getAllClases();
      
      if (response.success && response.data) {
        // Obtener información de cupos para cada clase
        const clasesConCupos = await Promise.all(
          response.data.map(async (clase) => {
            try {
              const cuposResponse = await reservaService.getDisponibilidadCupos(clase.id);
              if (cuposResponse.success && cuposResponse.data) {
                return {
                  ...clase,
                  cuposDisponibles: cuposResponse.data.cupos.disponibles,
                  cuposOcupados: cuposResponse.data.cupos.ocupados,
                  tieneCupoLimitado: cuposResponse.data.cupos.tieneCupoLimitado,
                };
              }
            } catch (error) {
              console.warn(`Error al obtener cupos para clase ${clase.id}:`, error);
            }
            return clase;
          })
        );

        dispatch({ type: 'SET_CLASES', payload: clasesConCupos });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Error al cargar clases' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error de conexión al cargar clases' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, user]);

  // Cargar reservas
  const fetchReservas = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await reservaService.getMisReservas();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_RESERVAS', payload: response.data });
      }
    } catch (error) {
      console.warn('Error al cargar reservas:', error);
    }
  }, [isAuthenticated, user]);

  // Obtener disponibilidad de cupos para una clase
  const getDisponibilidadCupos = useCallback(async (claseId: string) => {
    try {
      const response = await reservaService.getDisponibilidadCupos(claseId);
      return response;
    } catch (error) {
      console.warn('Error al obtener disponibilidad de cupos:', error);
      return null;
    }
  }, []);

  // Obtener tokens del usuario actual
  const fetchUserTokens = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('🔍 [fetchUserTokens] Usuario no autenticado o no disponible');
      return;
    }

    try {
      console.log('🔍 [fetchUserTokens] Obteniendo tokens para usuario:', user.id);
      
      // Obtener el accessToken del store de autenticación
      const { useAuthStore } = await import('./authStore');
      const { getState } = useAuthStore;
      const authState = getState();
      const accessToken = authState.accessToken;
      
      console.log('🔍 [fetchUserTokens] AccessToken obtenido:', accessToken ? 'SÍ' : 'NO');
      console.log('🔍 [fetchUserTokens] AccessToken (primeros 20 chars):', accessToken ? accessToken.substring(0, 20) + '...' : 'N/A');
      
      if (!accessToken) {
        console.warn('🔍 [fetchUserTokens] No hay accessToken disponible');
        return;
      }
      
      // Usar el servicio de reservas con el token
      const response = await reservaService.getUserTokens(accessToken);
      
      console.log('🔍 [fetchUserTokens] Respuesta de la API:', response);
      
      if (response.success && response.data) {
        const tokens = response.data.token || 0;
        console.log('🔍 [fetchUserTokens] Tokens obtenidos:', tokens);
        dispatch({ type: 'SET_USER_TOKENS', payload: tokens });
      } else {
        console.warn('🔍 [fetchUserTokens] Error en la respuesta:', response.error);
      }
    } catch (error) {
      console.warn('🔍 [fetchUserTokens] Error al obtener tokens:', error);
    }
  }, [isAuthenticated, user]);

  // Función para cargar datos iniciales
  const loadData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      await Promise.all([fetchClases(), fetchReservas()]);
    } catch (error) {
      console.warn('Error cargando datos iniciales:', error);
    }
  }, [isAuthenticated, user, fetchClases, fetchReservas]);

  // Efecto para refrescar tokens automáticamente
  useEffect(() => {
    if (isAuthenticated && user) {
      // Refrescar tokens inmediatamente
      fetchUserTokens();
      
      // Refrescar tokens cada 30 segundos
      const interval = setInterval(() => {
        fetchUserTokens();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, fetchUserTokens]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user, loadData]);

  // Programar notificaciones para reservas existentes solo al cargar inicialmente
  useEffect(() => {
    if (state.reservas.length > 0 && notificationsEnabled) {
      const scheduleNotificationsForExistingReservas = async () => {
        try {
          const notificationService = NotificationService.getInstance();
          
          // Solicitar permisos primero
          const hasPermission = await notificationService.requestPermissions();
          if (!hasPermission) {
            console.log('No se tienen permisos de notificación');
            return;
          }
          
          // Limpiar notificaciones duplicadas y expiradas primero
          await notificationService.cleanupExpiredNotifications();
          
          // Obtener notificaciones ya programadas para evitar duplicados
          const scheduledNotifications = await notificationService.getScheduledNotifications();
          const scheduledReservaIds = new Set(
            scheduledNotifications
              .filter(n => n.content.data?.reminderType === 'class_reminder')
              .map(n => n.content.data?.reservaId)
              .filter(Boolean)
          );
          
          // Programar notificaciones solo para reservas que no tienen notificación programada
          let newNotificationsCount = 0;
          for (const reserva of state.reservas) {
            if (reserva.estado === 'ACTIVA' && !scheduledReservaIds.has(reserva.id)) {
              const notificationId = await notificationService.scheduleClassReminder(reserva);
              if (notificationId) {
                newNotificationsCount++;
              }
            }
          }
          
          console.log(`Notificaciones programadas: ${newNotificationsCount} nuevas, ${scheduledReservaIds.size} existentes`);
        } catch (error) {
          console.warn('Error al programar notificaciones para reservas existentes:', error);
        }
      };
      
      scheduleNotificationsForExistingReservas();
    }
  }, [notificationsEnabled]); // Removido state.reservas de las dependencias para evitar re-programación constante

  const reservarClase = useCallback(async (claseId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      console.warn('No se puede reservar clase: usuario no autenticado');
      return false;
    }

    dispatch({ type: 'SET_RESERVING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const response = await reservaService.reservarClase(claseId);
      
      if (response.success && response.data) {
        // Encontrar la clase para crear la reserva completa
        const clase = state.clases.find(c => c.id === claseId);
        if (clase) {
          const reservaCompleta: ReservaConClase = {
            ...response.data,
            clase: clase,
          };
          dispatch({ type: 'ADD_RESERVA', payload: reservaCompleta });
          
          // Programar notificación para la clase solo si están habilitadas
          if (notificationsEnabled) {
            try {
              const notificationService = NotificationService.getInstance();
              await notificationService.scheduleClassReminder(reservaCompleta);
            } catch (notificationError) {
              console.warn('Error al programar notificación:', notificationError);
              // No fallar la reserva si la notificación falla
            }
          }
        } else {
          // Si no tenemos la clase, solo actualizar el estado
          dispatch({ 
            type: 'UPDATE_CLASE_RESERVA_STATUS', 
            payload: { claseId, isReservada: true, reservaId: response.data.id }
          });
        }
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Error reservando clase' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error de conexión al reservar clase' });
      return false;
    } finally {
      dispatch({ type: 'SET_RESERVING', payload: false });
    }
  }, [state.clases, isAuthenticated, user]);

  const cancelarReserva = useCallback(async (claseId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      console.warn('No se puede cancelar reserva: usuario no autenticado');
      return false;
    }

    dispatch({ type: 'SET_CANCELING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const response = await reservaService.cancelarReserva(claseId);
      
      if (response.success) {
        // Cancelar notificación de la clase solo si están habilitadas
        if (notificationsEnabled) {
          try {
            const notificationService = NotificationService.getInstance();
            await notificationService.cancelClassReminder(claseId);
          } catch (notificationError) {
            console.warn('Error al cancelar notificación:', notificationError);
            // No fallar la cancelación si la notificación falla
          }
        }
        
        dispatch({ type: 'REMOVE_RESERVA', payload: claseId });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Error cancelando reserva' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error de conexión al cancelar reserva' });
      return false;
    } finally {
      dispatch({ type: 'SET_CANCELING', payload: false });
    }
  }, [isAuthenticated, user]);

  // Acciones de UI
  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const setSelectedTipo = useCallback((tipo: string | null) => {
    dispatch({ type: 'SET_SELECTED_TIPO', payload: tipo });
  }, []);

  const setSelectedClase = useCallback((clase: ClaseCardData | null) => {
    dispatch({ type: 'SET_SELECTED_CLASE', payload: clase });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Getters
  const getClasesFiltradas = useCallback((): ClaseCardData[] => {
    let clasesFiltradas = state.clases;

    // Filtrar por término de búsqueda
    if (state.searchTerm) {
      const termino = state.searchTerm.toLowerCase();
      clasesFiltradas = clasesFiltradas.filter(clase =>
        clase.nombre.toLowerCase().includes(termino) ||
        clase.profesor.toLowerCase().includes(termino) ||
        clase.tipo.toLowerCase().includes(termino)
      );
    }

    // Filtrar por tipo
    if (state.selectedTipo && state.selectedTipo !== 'todos') {
      clasesFiltradas = clasesFiltradas.filter(clase => clase.tipo === state.selectedTipo);
    }

    // Filtrar por profesor
    if (state.selectedProfesor && state.selectedProfesor !== 'todos') {
      clasesFiltradas = clasesFiltradas.filter(clase => clase.profesor === state.selectedProfesor);
    }

    // Filtrar por día
    if (state.selectedDia && state.selectedDia !== 'todos') {
      clasesFiltradas = clasesFiltradas.filter(clase => 
        clase.dias.some(dia => dia.toLowerCase().includes(state.selectedDia!.toLowerCase()))
      );
    }

    // Filtrar por horario
    if (state.selectedHorario && state.selectedHorario !== 'todos') {
      clasesFiltradas = clasesFiltradas.filter(clase => clase.horario.includes(state.selectedHorario!));
    }

    // Filtrar solo clases activas
    clasesFiltradas = clasesFiltradas.filter(clase => clase.activa);

    // Ordenar por proximidad
    clasesFiltradas = clasesFiltradas.sort((a, b) => {
      const diasA = calcularDiasHastaProximaClase(a);
      const diasB = calcularDiasHastaProximaClase(b);
      return diasA - diasB;
    });

    return clasesFiltradas;
  }, [state.clases, state.searchTerm, state.selectedTipo, state.selectedProfesor, state.selectedDia, state.selectedHorario]);

  const getReservasActivas = useCallback((): ReservaCardData[] => {
    return state.reservas.filter(reserva => reserva.estado === 'ACTIVA');
  }, [state.reservas]);

  const isClaseReservada = useCallback((claseId: string): boolean => {
    return state.clases.find(clase => clase.id === claseId)?.isReservada || false;
  }, [state.clases]);

  // Nuevas funciones para filtros avanzados
  const setSelectedProfesor = useCallback((profesor: string | null) => {
    dispatch({ type: 'SET_SELECTED_PROFESOR', payload: profesor });
  }, []);

  const setSelectedDia = useCallback((dia: string | null) => {
    dispatch({ type: 'SET_SELECTED_DIA', payload: dia });
  }, []);

  const setSelectedHorario = useCallback((horario: string | null) => {
    dispatch({ type: 'SET_SELECTED_HORARIO', payload: horario });
  }, []);

  const setMostrarFiltrosAvanzados = useCallback((mostrar: boolean) => {
    dispatch({ type: 'SET_MOSTRAR_FILTROS_AVANZADOS', payload: mostrar });
  }, []);

  const limpiarFiltros = useCallback(() => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    dispatch({ type: 'SET_SELECTED_TIPO', payload: null });
    dispatch({ type: 'SET_SELECTED_PROFESOR', payload: null });
    dispatch({ type: 'SET_SELECTED_DIA', payload: null });
    dispatch({ type: 'SET_SELECTED_HORARIO', payload: null });
  }, []);

  const obtenerOpcionesUnicas = useCallback(() => {
    const tipos = [...new Set(state.clases.map(clase => clase.tipo))];
    const profesores = [...new Set(state.clases.map(clase => clase.profesor))];
    const dias = [...new Set(state.clases.flatMap(clase => clase.dias))];
    const horarios = [...new Set(state.clases.map(clase => clase.horario))];
    
    return { tipos, profesores, dias, horarios };
  }, [state.clases]);

  const value: ReservasContextType = {
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
    setSelectedClase,
    clearError,
    getClasesFiltradas,
    getReservasActivas,
    isClaseReservada,
    getDisponibilidadCupos,
    fetchUserTokens,
    loadData,
  };

  return (
    <ReservasContext.Provider value={value}>
      {children}
    </ReservasContext.Provider>
  );
};

// Hook personalizado
export const useReservas = (): ReservasContextType => {
  const context = useContext(ReservasContext);
  
  if (context === undefined) {
    // Retornar un contexto por defecto para evitar errores
    return {
      state: initialState,
      fetchClases: async () => {},
      fetchReservas: async () => {},
      reservarClase: async () => false,
      cancelarReserva: async () => false,
      setSearchTerm: () => {},
      setSelectedTipo: () => {},
      setSelectedProfesor: () => {},
      setSelectedDia: () => {},
      setSelectedHorario: () => {},
      setMostrarFiltrosAvanzados: () => {},
      limpiarFiltros: () => {},
      obtenerOpcionesUnicas: () => ({ tipos: [], profesores: [], dias: [], horarios: [] }),
      setSelectedClase: () => {},
      clearError: () => {},
      getClasesFiltradas: () => [],
      getReservasActivas: () => [],
      isClaseReservada: () => false,
      getDisponibilidadCupos: async () => null,
      fetchUserTokens: async () => {},
      loadData: async () => {},
    };
  }
  return context;
};

export default ReservasContext;