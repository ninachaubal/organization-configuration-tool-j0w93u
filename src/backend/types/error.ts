/**
 * Error types, interfaces, and enums for standardized error handling
 * throughout the organization configuration management tool.
 */

/**
 * Standard HTTP status codes used in API responses
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Application-specific error codes for error classification
 */
export enum AppErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE_ENTITY = "DUPLICATE_ENTITY",
  DATABASE_ERROR = "DATABASE_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

/**
 * Interface for field-specific validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Interface for standardized error responses in API endpoints
 */
export interface ErrorResponse {
  success: boolean;
  error: string;
  code: AppErrorCode;
  details?: Record<string, any>;
}

/**
 * Custom error class for application-specific errors
 * with standardized properties
 */
export class AppError extends Error {
  code: AppErrorCode;
  statusCode: number;
  details?: Record<string, any>;

  /**
   * Creates a new AppError instance with the specified parameters
   * 
   * @param code - Application error code
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param details - Additional error details (optional)
   */
  constructor(
    code: AppErrorCode,
    message: string,
    statusCode: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
  }
}