// Test file for nextClassCalculator
import { calcularProximaClase, getProximaClaseTexto } from './nextClassCalculator';
import { Clase, ReservaConClase } from '../types/reservas';

// Sample test data
const sampleClases: Clase[] = [
  {
    id: '1',
    nombre: 'Yoga Matutino',
    descripcion: 'Clase de yoga para principiantes',
    imagen: null,
    duracion: 60,
    dias: ['LUNES', 'MIERCOLES', 'VIERNES'],
    horario: '08:00',
    cupo: 20,
    tipo: 'YOGA',
    tipoClase: 'PERMANENTE',
    profesor: 'Ana García',
    sala: null,
    activa: true,
    excepciones: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    nombre: 'Spinning',
    descripcion: 'Clase de spinning intensa',
    imagen: null,
    duracion: 45,
    dias: ['MARTES', 'JUEVES'],
    horario: '19:00',
    cupo: 15,
    tipo: 'SPINNING',
    tipoClase: 'PERMANENTE',
    profesor: 'Carlos López',
    sala: null,
    activa: true,
    excepciones: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

const sampleReservas: ReservaConClase[] = [
  {
    id: 'res1',
    userId: 'user1',
    claseId: '1',
    fecha: '2024-01-15T08:00:00Z', // Monday 8 AM
    estado: 'ACTIVA',
    fechaReserva: '2024-01-10T00:00:00Z',
    fechaCancelada: null,
    fechaCompletada: null,
    clase: sampleClases[0],
  }
];

// Test function
export const testNextClassCalculator = () => {
  console.log('🧪 Testing nextClassCalculator...');
  
  // Test 1: Calculate next class from today (assuming today is Monday)
  const today = new Date('2024-01-15T06:00:00Z'); // Monday 6 AM
  const proximaClase = calcularProximaClase(sampleClases, sampleReservas, today);
  
  console.log('📅 Test 1 - Próxima clase desde lunes 6 AM:', proximaClase ? {
    nombre: proximaClase.clase.nombre,
    fecha: proximaClase.fecha.toISOString(),
    esHoy: proximaClase.esHoy,
    esManana: proximaClase.esManana,
    texto: getProximaClaseTexto(proximaClase)
  } : 'No hay próxima clase');
  
  // Test 2: Calculate next class from Tuesday
  const tuesday = new Date('2024-01-16T06:00:00Z'); // Tuesday 6 AM
  const proximaClaseMartes = calcularProximaClase(sampleClases, sampleReservas, tuesday);
  
  console.log('📅 Test 2 - Próxima clase desde martes 6 AM:', proximaClaseMartes ? {
    nombre: proximaClaseMartes.clase.nombre,
    fecha: proximaClaseMartes.fecha.toISOString(),
    esHoy: proximaClaseMartes.esHoy,
    esManana: proximaClaseMartes.esManana,
    texto: getProximaClaseTexto(proximaClaseMartes)
  } : 'No hay próxima clase');
  
  // Test 3: Calculate next class from Saturday
  const saturday = new Date('2024-01-20T06:00:00Z'); // Saturday 6 AM
  const proximaClaseSabado = calcularProximaClase(sampleClases, sampleReservas, saturday);
  
  console.log('📅 Test 3 - Próxima clase desde sábado 6 AM:', proximaClaseSabado ? {
    nombre: proximaClaseSabado.clase.nombre,
    fecha: proximaClaseSabado.fecha.toISOString(),
    esHoy: proximaClaseSabado.esHoy,
    esManana: proximaClaseSabado.esManana,
    texto: getProximaClaseTexto(proximaClaseSabado)
  } : 'No hay próxima clase');
};

// Export for manual testing
export default testNextClassCalculator; 