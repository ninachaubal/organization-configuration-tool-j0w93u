/**
 * Application-wide constants for the backend services
 * Centralizes hardcoded values to ensure consistency across the application
 */

/**
 * DynamoDB table names used in the application
 */
export const TABLE_NAMES = {
  /**
   * Table storing organization configuration data
   * This is configured via the ORGANIZATION_CONFIGURATION_TABLE_NAME environment variable
   */
  ORGANIZATION_CONFIGURATION: process.env.ORGANIZATION_CONFIGURATION_TABLE_NAME || 'OrganizationConfiguration',
};

/**
 * Key prefixes for DynamoDB composite keys
 */
export const KEY_PREFIXES = {
  /**
   * Prefix for organization-related keys
   */
  ORGANIZATION: 'ORG#',
};

/**
 * DynamoDB index names for global secondary indexes
 */
export const INDEX_NAMES = {
  /**
   * GSI for looking up organizations by their SSO provider ID
   */
  BY_SSO_ID: 'bySSOId',
};

/**
 * Default number of items to return in paginated list operations
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum allowed number of items per page in paginated list operations
 */
export const MAX_PAGE_SIZE = 100;

/**
 * API rate limiting constants
 */
export const API_RATE_LIMIT = {
  /**
   * Number of requests allowed per minute per user
   */
  REQUESTS_PER_MINUTE: 60,
};

/**
 * Standardized error codes for consistent error handling across the application
 */
export const ERROR_CODES = {
  /**
   * Error code for validation failures (400 Bad Request)
   */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  /**
   * Error code for resource not found errors (404 Not Found)
   */
  NOT_FOUND: 'NOT_FOUND',
  
  /**
   * Error code for unauthorized access (401 Unauthorized / 403 Forbidden)
   */
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  /**
   * Error code for server-side errors (500 Internal Server Error)
   */
  SERVER_ERROR: 'SERVER_ERROR',
  
  /**
   * Error code for duplicate ID errors (400 Bad Request)
   */
  DUPLICATE_ID: 'DUPLICATE_ID',
};