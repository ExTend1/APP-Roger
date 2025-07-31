import { Clase, ReservaConClase } from '../types/reservas';

export interface NextClassInfo {
  clase: Clase;
  fecha: Date;
  fechaFormateada: string;
  diasRestantes: number;
  esHoy: boolean;
  esManana: boolean;
}

// Función para obtener el día de la semana como número (0 = Domingo, 1 = Lunes, etc.)
const getDayOfWeek = (date: Date): number => {
  return date.getDay();
};

// Función para obtener el nombre del día en español
const getDayName = (day: number): string => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[day];
};

// Función para obtener el nombre del mes en español
const getMonthName = (month: number): string => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[month];
};

// Función para formatear fecha en español
const formatDate = (date: Date): string => {
  const dia = date.getDate();
  const mes = getMonthName(date.getMonth());
  const año = date.getFullYear();
  return `${dia} de ${mes} de ${año}`;
};

// Función para calcular la próxima fecha de una clase
const calcularProximaFechaClase = (clase: Clase, desdeFecha: Date = new Date()): Date | null => {
  console.log('📅 Calculando próxima fecha para clase:', {
    nombre: clase.nombre,
    dias: clase.dias,
    horario: clase.horario,
    desdeFecha: desdeFecha.toISOString()
  });
  
  const diasClase = clase.dias.map(dia => {
    const diasMap: { [key: string]: number } = {
      'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6, 'DOMINGO': 0
    };
    return diasMap[dia];
  });

  console.log('📅 Días de clase mapeados:', diasClase);

  if (diasClase.length === 0) return null;

  // Obtener la hora de la clase
  const [horas, minutos] = clase.horario.split(':').map(Number);
  
  // Crear fecha actual
  const fechaActual = new Date(desdeFecha);
  fechaActual.setHours(horas, minutos, 0, 0);

  // Buscar la próxima fecha válida
  for (let i = 0; i < 7; i++) {
    const fechaCandidata = new Date(fechaActual);
    fechaCandidata.setDate(fechaActual.getDate() + i);
    
    const diaSemana = getDayOfWeek(fechaCandidata);
    
          if (diasClase.includes(diaSemana)) {
        // Verificar si la clase ya pasó hoy
        if (i === 0 && fechaCandidata <= desdeFecha) {
          continue; // Buscar el próximo día
        }
        return fechaCandidata;
      }
  }

  return null;
};

// Función principal para calcular la próxima clase
export const calcularProximaClase = (
  clases: Clase[],
  misReservas: ReservaConClase[],
  desdeFecha: Date = new Date()
): NextClassInfo | null => {
  console.log('🔍 Calculando próxima clase con:', {
    clasesCount: clases.length,
    reservasCount: misReservas.length,
    desdeFecha: desdeFecha.toISOString()
  });
  
  if (clases.length === 0) return null;

  let proximaClase: NextClassInfo | null = null;
  let fechaMasProxima: Date | null = null;

  // Primero, buscar en las reservas activas
  const reservasActivas = misReservas.filter(reserva => 
    reserva.estado === 'ACTIVA' && new Date(reserva.fecha) > desdeFecha
  );

  if (reservasActivas.length > 0) {
    // Ordenar por fecha y tomar la más próxima
    reservasActivas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const reservaMasProxima = reservasActivas[0];
    const fechaReserva = new Date(reservaMasProxima.fecha);
    
    proximaClase = {
      clase: reservaMasProxima.clase,
      fecha: fechaReserva,
      fechaFormateada: formatDate(fechaReserva),
      diasRestantes: Math.ceil((fechaReserva.getTime() - desdeFecha.getTime()) / (1000 * 60 * 60 * 24)),
      esHoy: fechaReserva.toDateString() === desdeFecha.toDateString(),
      esManana: fechaReserva.toDateString() === new Date(desdeFecha.getTime() + 24 * 60 * 60 * 1000).toDateString(),
    };
    
    fechaMasProxima = fechaReserva;
  }

  // Luego, buscar en todas las clases disponibles
  clases.forEach(clase => {
    if (!clase.activa) return;

    const proximaFecha = calcularProximaFechaClase(clase, desdeFecha);
    if (!proximaFecha) return;

    // Si no tenemos una clase próxima o esta es más próxima
    if (!fechaMasProxima || proximaFecha < fechaMasProxima) {
      proximaClase = {
        clase,
        fecha: proximaFecha,
        fechaFormateada: formatDate(proximaFecha),
        diasRestantes: Math.ceil((proximaFecha.getTime() - desdeFecha.getTime()) / (1000 * 60 * 60 * 24)),
        esHoy: proximaFecha.toDateString() === desdeFecha.toDateString(),
        esManana: proximaFecha.toDateString() === new Date(desdeFecha.getTime() + 24 * 60 * 60 * 1000).toDateString(),
      };
      fechaMasProxima = proximaFecha;
    }
  });

  return proximaClase;
};

// Función para obtener el texto descriptivo de la próxima clase
export const getProximaClaseTexto = (proximaClase: NextClassInfo): string => {
  const { clase, fecha, esHoy, esManana } = proximaClase;
  
  let tiempoTexto = '';
  if (esHoy) {
    tiempoTexto = 'HOY';
  } else if (esManana) {
    tiempoTexto = 'MAÑANA';
  } else {
    const diaSemana = getDayName(fecha.getDay());
    tiempoTexto = diaSemana;
  }

  return `${tiempoTexto} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
}; 