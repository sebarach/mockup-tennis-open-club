import { toast } from 'sonner'

// Tipos de errores específicos
export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: any
  context?: string
}

// Crear error personalizado
export function createAppError(
  message: string, 
  code?: string, 
  statusCode?: number, 
  details?: any
): AppError {
  const error = new Error(message) as AppError
  error.code = code
  error.statusCode = statusCode
  error.details = details
  error.context = 'application'
  return error
}

// Mapear errores de Supabase a mensajes user-friendly
export function mapSupabaseError(error: any): string {
  if (!error) return 'Error desconocido'

  // Errores de autenticación
  if (error.message?.includes('Invalid login credentials')) {
    return 'Credenciales inválidas. Verifica tu email y contraseña.'
  }

  if (error.message?.includes('Email not confirmed')) {
    return 'Debes confirmar tu email antes de iniciar sesión.'
  }

  if (error.message?.includes('User not found')) {
    return 'Usuario no encontrado.'
  }

  // Errores de base de datos
  if (error.code === 'PGRST301') {
    return 'No tienes permisos para realizar esta operación.'
  }

  if (error.code === 'PGRST116') {
    return 'El recurso solicitado no fue encontrado.'
  }

  if (error.code === '23505') {
    return 'Ya existe un registro con esos datos. Verifica la información.'
  }

  if (error.code === '23503') {
    return 'No se puede realizar la operación debido a dependencias existentes.'
  }

  if (error.code === '23514') {
    return 'Los datos no cumplen con las restricciones requeridas.'
  }

  // Errores de red
  if (error.message?.includes('Failed to fetch')) {
    return 'Error de conexión. Verifica tu conexión a internet.'
  }

  if (error.message?.includes('NetworkError')) {
    return 'Error de red. Inténtalo nuevamente.'
  }

  // Errores de validación personalizada
  if (error.message?.includes('Email inválido')) {
    return 'El formato del email no es válido.'
  }

  if (error.message?.includes('Tournament not found')) {
    return 'El torneo especificado no existe.'
  }

  if (error.message?.includes('Player not found')) {
    return 'El jugador especificado no existe.'
  }

  // Error genérico
  return error.message || 'Ha ocurrido un error inesperado.'
}

// Handler central de errores
export function handleError(error: any, context?: string) {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error)

  const userMessage = mapSupabaseError(error)
  
  // Mostrar toast de error
  toast.error(userMessage)

  // Reportar a servicio de logging (opcional)
  if (process.env.NODE_ENV === 'production') {
    // Aquí se podría integrar con Sentry, LogRocket, etc.
    reportError(error, context)
  }

  return userMessage
}

// Wrapper para funciones async con manejo de errores
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error, context)
      return null
    }
  }
}

// Hook para manejo de errores en componentes
export function useErrorHandler() {
  return {
    handleError: (error: any, context?: string) => handleError(error, context),
    showError: (message: string) => toast.error(message),
    showSuccess: (message: string) => toast.success(message),
    showInfo: (message: string) => toast.info(message),
    showWarning: (message: string) => toast.warning(message)
  }
}

// Función privada para reportar errores (placeholder)
function reportError(error: any, context?: string) {
  // Implementar integración con servicio de logging
  // Ejemplo: Sentry.captureException(error, { tags: { context } })
}

// Validador de errores críticos
export function isCriticalError(error: any): boolean {
  const criticalCodes = ['PGRST301', '401', '403', '500']
  return criticalCodes.includes(error?.code) || error?.statusCode >= 500
}

// Retry helper para operaciones fallidas
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // No reintentar en errores de autorización
      if (error?.statusCode === 401 || error?.statusCode === 403) {
        throw error
      }

      if (attempt === maxRetries) {
        throw error
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}