import { NextApiRequest, NextApiResponse } from 'next'; // v14.0.0
import { isDevelopment, isProduction, isTest } from '../config/environment';
import { AppError } from '../types/error';

/**
 * Log levels for the application
 */
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

// Default log level based on environment
let currentLogLevel = isProduction() ? LogLevel.INFO : LogLevel.DEBUG;

/**
 * Determines if a message should be logged based on current log level
 * 
 * @param messageLevel - The level of the message being logged
 * @returns True if the message should be logged, false otherwise
 */
function shouldLog(messageLevel: LogLevel): boolean {
  // Don't log in test environment unless explicitly enabled
  if (isTest()) {
    return false;
  }

  // Log level hierarchy: ERROR > WARN > INFO > DEBUG
  switch (currentLogLevel) {
    case LogLevel.ERROR:
      return messageLevel === LogLevel.ERROR;
    case LogLevel.WARN:
      return messageLevel === LogLevel.ERROR || messageLevel === LogLevel.WARN;
    case LogLevel.INFO:
      return messageLevel === LogLevel.ERROR || messageLevel === LogLevel.WARN || messageLevel === LogLevel.INFO;
    case LogLevel.DEBUG:
      return true;
    default:
      return false;
  }
}

/**
 * Formats a log message with timestamp, level, and context
 * 
 * @param level - Log level
 * @param message - Message to log
 * @param context - Additional context information
 * @returns Formatted log message
 */
function formatLogMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

/**
 * Logs error messages with error details and stack traces in development
 * 
 * @param message - Error message
 * @param err - Error object
 * @param context - Additional context
 */
export function error(message: string, err?: Error | AppError | unknown, context?: Record<string, any>): void {
  if (!shouldLog(LogLevel.ERROR)) {
    return;
  }

  let logContext = { ...context };
  
  if (err) {
    // For AppError, include code and status
    if (err instanceof AppError) {
      logContext = {
        ...logContext,
        errorCode: err.code,
        statusCode: err.statusCode,
        errorDetails: err.details
      };
    }
    
    // Include stack trace in development
    if (isDevelopment() && err instanceof Error) {
      logContext = {
        ...logContext,
        stack: err.stack
      };
    }
  }
  
  console.error(formatLogMessage(LogLevel.ERROR, message, logContext));
}

/**
 * Logs warning messages with optional context
 * 
 * @param message - Warning message
 * @param context - Additional context
 */
export function warn(message: string, context?: Record<string, any>): void {
  if (!shouldLog(LogLevel.WARN)) {
    return;
  }
  
  console.warn(formatLogMessage(LogLevel.WARN, message, context));
}

/**
 * Logs informational messages with optional context
 * 
 * @param message - Info message
 * @param context - Additional context
 */
export function info(message: string, context?: Record<string, any>): void {
  if (!shouldLog(LogLevel.INFO)) {
    return;
  }
  
  console.info(formatLogMessage(LogLevel.INFO, message, context));
}

/**
 * Logs debug messages with optional context, suppressed in production
 * 
 * @param message - Debug message
 * @param context - Additional context
 */
export function debug(message: string, context?: Record<string, any>): void {
  if (!shouldLog(LogLevel.DEBUG)) {
    return;
  }
  
  // Skip debug logs in production
  if (isProduction()) {
    return;
  }
  
  console.debug(formatLogMessage(LogLevel.DEBUG, message, context));
}

/**
 * Sets the current log level for the application
 * 
 * @param level - New log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
  info(`Log level set to ${level}`);
}

/**
 * Logs details of an incoming API request
 * 
 * @param req - NextJS API request
 */
export function logApiRequest(req: NextApiRequest): void {
  const { method, url, headers } = req;
  
  // Sanitize headers to remove sensitive information
  const sanitizedHeaders = { ...headers };
  
  // Remove sensitive headers
  delete sanitizedHeaders.authorization;
  delete sanitizedHeaders.cookie;
  
  const requestContext = {
    method,
    url,
    headers: sanitizedHeaders,
  };
  
  // Include body in development mode for debugging
  if (isDevelopment() && req.body) {
    requestContext['body'] = req.body;
  }
  
  info(`API Request: ${method} ${url}`, requestContext);
}

/**
 * Logs details of an API response
 * 
 * @param req - NextJS API request
 * @param res - NextJS API response
 * @param statusCode - HTTP status code
 * @param body - Response body
 */
export function logApiResponse(req: NextApiRequest, res: NextApiResponse, statusCode: number, body: unknown): void {
  const { method, url } = req;
  
  const responseContext = {
    method,
    url,
    statusCode,
  };
  
  // Include response body in development mode
  if (isDevelopment()) {
    responseContext['body'] = body;
  }
  
  // Use appropriate log level based on status code
  if (statusCode >= 500) {
    error(`API Response: ${method} ${url} [${statusCode}]`, undefined, responseContext);
  } else if (statusCode >= 400) {
    warn(`API Response: ${method} ${url} [${statusCode}]`, responseContext);
  } else {
    info(`API Response: ${method} ${url} [${statusCode}]`, responseContext);
  }
}

/**
 * Logs configuration changes for audit purposes
 * 
 * @param organizationId - Organization ID
 * @param configType - Configuration type
 * @param userId - User making the change
 * @param changes - Changes made
 */
export function logConfigChange(organizationId: string, configType: string, userId: string, changes: Record<string, any>): void {
  // Sanitize sensitive fields if present
  const sanitizedChanges = { ...changes };
  
  // Example of fields we might want to sanitize (none present in our current schema)
  // TODO: Add any field sanitization needed as the schema evolves
  
  const message = `Configuration change for organization ${organizationId} (${configType})`;
  const context = {
    organizationId,
    configType,
    userId,
    changes: sanitizedChanges
  };
  
  info(message, context);
}