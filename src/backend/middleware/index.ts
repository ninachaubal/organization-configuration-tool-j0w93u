/**
 * Middleware index file
 * 
 * Centralized exports for all middleware functions used in the organization
 * configuration management tool. This file provides a single import point
 * for authentication, error handling, logging, and validation middleware.
 */

// Authentication middleware
export {
  withAuth,
  withPermission,
  authMiddleware,
  validateAuthToken,
  getUserFromToken
} from './auth';

// Error handling middleware
export {
  withErrorHandling,
  errorMiddleware,
  getErrorStatusCode
} from './error';

// Logging middleware
export {
  withLogging,
  loggingMiddleware,
  extractUserIdFromRequest
} from './logging';

// Validation middleware
export {
  withValidation,
  validateRequestBody,
  validateOrganizationData,
  validateConfigData,
  validateOrganizationConfig,
  validationMiddleware
} from './validation';