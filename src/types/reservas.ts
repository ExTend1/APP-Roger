import { z } from 'zod';

// Enums
export const TipoClaseEnum = z.enum(['PERMANENTE', 'TEMPORAL']);
export const EstadoReservaEnum = z.enum(['ACTIVA', 'CANCELADA', 'COMPLETADA']);

// Schemas de validación
export const claseSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  imagen: z.string().nullable().optional(),
  duracion: z.number(),
  dias: z.array(z.string()),
  horario: z.string(),
  cupo: z.number().nullable().optional(),
  tipo: z.string(),
  tipoClase: TipoClaseEnum,
  profesor: z.string(),
  sala: z.string().nullable().optional(),
  activa: z.boolean(),
  excepciones: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const reservaSchema = z.object({
  id: z.string(),
  userId: z.string(),
  claseId: z.string(),
  fecha: z.string(),
  estado: EstadoReservaEnum,
  fechaReserva: z.string(),
  fechaCancelada: z.string().nullable().optional(),
  fechaCompletada: z.string().nullable().optional(),
});

export const reservaConClaseSchema = reservaSchema.extend({
  clase: claseSchema,
});

export const reservaConUsuarioSchema = reservaSchema.extend({
  user: z.object({
    id: z.string(),
    nombre: z.string(),
    apellido: z.string(),
    email: z.string(),
  }),
});

// Response schemas
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    error: z.string().nullable(),
    data: dataSchema.nullable(),
  });

export const clasesResponseSchema = apiResponseSchema(z.array(claseSchema));
export const claseResponseSchema = apiResponseSchema(claseSchema);
export const reservasResponseSchema = apiResponseSchema(z.array(reservaConClaseSchema));
export const reservaResponseSchema = apiResponseSchema(reservaSchema);

// Tipos TypeScript
export type TipoClase = z.infer<typeof TipoClaseEnum>;
export type EstadoReserva = z.infer<typeof EstadoReservaEnum>;
export type Clase = z.infer<typeof claseSchema>;
export type Reserva = z.infer<typeof reservaSchema>;
export type ReservaConClase = z.infer<typeof reservaConClaseSchema>;
export type ReservaConUsuario = z.infer<typeof reservaConUsuarioSchema>;
export type ApiResponse<T> = z.infer<ReturnType<typeof apiResponseSchema>>;
export type ClasesResponse = z.infer<typeof clasesResponseSchema>;
export type ClaseResponse = z.infer<typeof claseResponseSchema>;
export type ReservasResponse = z.infer<typeof reservasResponseSchema>;
export type ReservaResponse = z.infer<typeof reservaResponseSchema>;

// Request types
export interface ReservarClaseRequest {
  fecha?: string; // ISO string - opcional, si no se pasa se usa la fecha actual
}

// UI Types
export interface ClaseCardData extends Clase {
  isReservada?: boolean;
  reservaId?: string;
  cuposDisponibles?: number | null;
  cuposOcupados?: number;
  tieneCupoLimitado?: boolean;
}

export interface ReservaCardData extends ReservaConClase {
  diasTexto: string;
  fechaFormateada: string;
  estadoTexto: string;
  estadoColor: string;
}

// Error types
export interface ReservaError {
  type: 'validation' | 'auth' | 'server' | 'network' | 'business' | 'unknown';
  message: string;
  field?: string;
}