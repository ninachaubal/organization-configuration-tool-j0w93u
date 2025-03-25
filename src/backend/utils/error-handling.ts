import { NextApiResponse } from 'next'; // ^14.0.0
import { 
  AppError, 
  AppErrorCode, 
  HttpStatusCode, 
  ErrorResponse 
} from '../types/error';
import { error as logError } from './logging';
import { isDevelopment } from '../config/environment';

/**
 * Creates a standardized AppError instance with the specified error code, message, and optional details
 * 
 * @param code - Application error code
 * @param message - Error message
 * @param details - Additional error details (optional)
 * @returns A new AppError instance with appropriate status code
 */
export function createAppError(
  code: AppErrorCode,
  message: string,
  details?: Record<string, any>
): AppError {
  const statusCode = getErrorStatusCode(code);
  return new AppError(code, message, statusCode, details);
}

/**
 * Handles errors in API routes by sending appropriate error responses
 * 
 * @param err - Error to handle
 * @param res - NextJS API response object
 */
export function handleApiError(
  err: Error | AppError | unknown,
  res: NextApiResponse
): void {
  // Log the error
  logError('API Error encountered', err);

  // Determine status code and format error response
  let statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  
  if (isAppError(err)) {
    statusCode = err.statusCode;
  }

  const errorResponse = formatErrorResponse(err);
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Formats an error into a standardized ErrorResponse object
 * 
 * @param err - Error to format
 * @returns Standardized error response object
 */
export function formatErrorResponse(err: Error | AppError | unknown): ErrorResponse {
  if (isAppError(err)) {
    // For AppError instances, use the provided properties
    const response: ErrorResponse = {
      success: false,
      error: err.message,
      code: err.code,
      details: err.details
    };

    // Include stack trace in development mode
    if (isDevelopment() && err instanceof Error && err.stack) {
      response.details = {
        ...(response.details || {}),
        stack: err.stack
      };
    }

    return response;
  }

  // For generic errors, create a standard internal server error response
  const defaultError: ErrorResponse = {
    success: false,
    error: 'An unexpected error occurred',
    code: AppErrorCode.INTERNAL_SERVER_ERROR,
  };

  // Include error details in development mode
  if (isDevelopment() && err instanceof Error) {
    defaultError.details = { 
      message: err.message,
      stack: err.stack 
    };
  }

  return defaultError;
}

/**
 * Type guard to check if an error is an instance of AppError
 * 
 * @param err - Error to check
 * @returns True if the error is an AppError instance, false otherwise
 */
export function isAppError(err: Error | AppError | unknown): err is AppError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err &&
    'statusCode' in err
  );
}

/**
 * Creates a standardized not found error for a specific resource
 * 
 * @param resourceType - Type of resource that wasn't found
 * @param resourceId - ID of the resource that wasn't found
 * @returns A new AppError instance with NOT_FOUND code
 */
export function createNotFoundError(
  resourceType: string,
  resourceId: string
): AppError {
  const message = `The requested ${resourceType} (${resourceId}) was not found`;
  return createAppError(AppErrorCode.NOT_FOUND, message, {
    resourceType,
    resourceId
  });
}

/**
 * Creates a standardized duplicate entity error
 * 
 * @param entityType - Type of entity that already exists
 * @param identifier - Identifier of the duplicate entity
 * @returns A new AppError instance with DUPLICATE_ENTITY code
 */
export function createDuplicateEntityError(
  entityType: string,
  identifier: string
): AppError {
  const message = `A ${entityType} with this identifier (${identifier}) already exists`;
  return createAppError(AppErrorCode.DUPLICATE_ENTITY, message, {
    entityType,
    identifier
  });
}

/**
 * Creates a standardized database error
 * 
 * @param operation - Database operation that failed
 * @param originalError - Original error from the database operation
 * @returns A new AppError instance with DATABASE_ERROR code
 */
export function createDatabaseError(
  operation: string,
  originalError: Error | unknown
): AppError {
  const message = `Database operation failed: ${operation}`;
  const details: Record<string, any> = { operation };
  
  // Include safe details from the original error in development mode
  if (isDevelopment() && originalError instanceof Error) {
    details.originalError = {
      message: originalError.message,
      stack: originalError.stack
    };
  }
  
  return createAppError(AppErrorCode.DATABASE_ERROR, message, details);
}

/**
 * Maps an AppErrorCode to the appropriate HTTP status code
 * 
 * @param errorCode - Application error code
 * @returns The corresponding HTTP status code
 */
function getErrorStatusCode(errorCode: AppErrorCode): number {
  switch (errorCode) {
    case AppErrorCode.VALIDATION_ERROR:
      return HttpStatusCode.BAD_REQUEST;
    case AppErrorCode.NOT_FOUND:
      return HttpStatusCode.NOT_FOUND;
    case AppErrorCode.DUPLICATE_ENTITY:
      return HttpStatusCode.CONFLICT;
    case AppErrorCode.DATABASE_ERROR:
      return HttpStatusCode.INTERNAL_SERVER_ERROR;
    case AppErrorCode.UNAUTHORIZED:
      return HttpStatusCode.UNAUTHORIZED;
    case AppErrorCode.FORBIDDEN:
      return HttpStatusCode.FORBIDDEN;
    case AppErrorCode.INTERNAL_SERVER_ERROR:
    default:
      return HttpStatusCode.INTERNAL_SERVER_ERROR;
  }
}