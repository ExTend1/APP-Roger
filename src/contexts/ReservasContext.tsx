import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  Clase,
  ReservaConClase,
  ClaseCardData,
  ReservaCardData,
  ReservaError,
  TipoClase,
  EstadoReserva,
} from '../types/reservas';
import { reservaService } from '../services/reservaService';

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
  
  // Error
  error: string | null;
}

// Acciones del reducer
type ReservasAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESERVING'; payload: boolean }
  | { type: 'SET_CANCELING'; payload: boolean }
  | { type: 'SET_CLASES'; payload: Clase[] }
  | { type: 'SET_RESERVAS'; payload: ReservaConClase[] }
  | { type: 'SET_SELECTED_CLASE'; payload: Clase | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SELECTED_TIPO'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_RESERVA'; payload: ReservaConClase }
  | { type: 'REMOVE_RESERVA'; payload: string } // claseId
  | { type: 'UPDATE_CLASE_RESERVA_STATUS'; payload: { claseId: string; isReservada: boolean; reservaId?: string } };

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
interface ReservasContextType {
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
  setSelectedClase: (clase: Clase | null) => void;
  clearError: () => void;
  
  // Getters
  getClasesFiltradas: () => ClaseCardData[];
  getReservasActivas: () => ReservaCardData[];
  isClaseReservada: (claseId: string) => boolean;
}

const ReservasContext = createContext<ReservasContextType | undefined>(undefined);

// Provider
interface ReservasProviderProps {
  children: ReactNode;
}

export const ReservasProvider: React.FC<ReservasProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reservasReducer, initialState);

  // Debug: verificar que el provider se está montando
  console.log('🔧 ReservasProvider montado');

  // Acciones de datos
  const fetchClases = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const response = await reservaService.getAllClases();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CLASES', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Error obteniendo clases' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error de conexión al obtener clases' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchReservas = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const response = await reservaService.getMisReservas();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_RESERVAS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Error obteniendo reservas' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error de conexión al obtener reservas' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const reservarClase = useCallback(async (claseId: string): Promise<boolean> => {
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
  }, [state.clases]);

  const cancelarReserva = useCallback(async (claseId: string): Promise<boolean> => {
    dispatch({ type: 'SET_CANCELING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const response = await reservaService.cancelarReserva(claseId);
      
      if (response.success) {
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
  }, []);

  // Acciones de UI
  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const setSelectedTipo = useCallback((tipo: string | null) => {
    dispatch({ type: 'SET_SELECTED_TIPO', payload: tipo });
  }, []);

  const setSelectedClase = useCallback((clase: Clase | null) => {
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

    // Filtrar solo clases activas
    clasesFiltradas = clasesFiltradas.filter(clase => clase.activa);

    return clasesFiltradas;
  }, [state.clases, state.searchTerm, state.selectedTipo]);

  const getReservasActivas = useCallback((): ReservaCardData[] => {
    return state.reservas.filter(reserva => reserva.estado === 'ACTIVA');
  }, [state.reservas]);

  const isClaseReservada = useCallback((claseId: string): boolean => {
    return state.clases.find(clase => clase.id === claseId)?.isReservada || false;
  }, [state.clases]);

  const value: ReservasContextType = {
    state,
    fetchClases,
    fetchReservas,
    reservarClase,
    cancelarReserva,
    setSearchTerm,
    setSelectedTipo,
    setSelectedClase,
    clearError,
    getClasesFiltradas,
    getReservasActivas,
    isClaseReservada,
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
  console.log('🔍 useReservas llamado, context:', context ? 'disponible' : 'undefined');
  
  if (context === undefined) {
    console.warn('⚠️ useReservas debe ser usado dentro de un ReservasProvider');
    // Retornar un contexto por defecto para evitar errores
    return {
      state: initialState,
      fetchClases: async () => {},
      fetchReservas: async () => {},
      reservarClase: async () => false,
      cancelarReserva: async () => false,
      setSearchTerm: () => {},
      setSelectedTipo: () => {},
      setSelectedClase: () => {},
      clearError: () => {},
      getClasesFiltradas: () => [],
      getReservasActivas: () => [],
      isClaseReservada: () => false,
    };
  }
  return context;
};

export default ReservasContext;