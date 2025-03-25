/**
 * Validation barrel file
 * 
 * This file exports all validation-related functionality from the validation directory,
 * including schemas and utility functions. It centralizes access to validation tools
 * throughout the application for consistent data validation.
 */

// Import Zod library for schema validation
import { z } from 'zod'; // ^3.22.4

// Import all validation schemas from the schemas directory
import * as schemas from './schemas';

// Import validation utility functions
import {
  validateSchema,
  validateOrganizationConfig,
  createValidationError,
  validateRequestBody,
  validateQueryParams,
  isValidOrganizationId,
  ValidationError
} from '../utils/validation';

// Import OrganizationConfigType enum
import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';

// Re-export all validation schemas
export * from './schemas';

// Re-export validation utility functions
export {
  validateSchema,
  validateOrganizationConfig,
  createValidationError,
  validateRequestBody,
  validateQueryParams,
  isValidOrganizationId,
  ValidationError
};

// Re-export OrganizationConfigType enum
export { OrganizationConfigType };

// Re-export Zod
export { z };