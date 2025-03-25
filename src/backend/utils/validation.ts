import { z } from 'zod'; // ^3.22.4
import { 
  AppError, 
  AppErrorCode, 
  HttpStatusCode, 
  ValidationError 
} from '../types/error';
import { createAppError } from './error-handling';
import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';

/**
 * Validates data against a Zod schema and returns validation errors if any
 * 
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Array of validation errors, empty if validation passes
 */
export function validateSchema(
  schema: z.ZodSchema<any>,
  data: Record<string, any>
): ValidationError[] {
  try {
    schema.parse(data);
    return []; // No errors
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Transform Zod errors into ValidationError objects
      return error.errors.map((err) => {
        const field = err.path.join('.');
        return {
          field,
          message: err.message
        };
      });
    }
    
    // If it's not a ZodError, return a generic validation error
    return [{
      field: 'unknown',
      message: 'Unknown validation error occurred'
    }];
  }
}

/**
 * Validates organization configuration data against the appropriate schema based on configuration type
 * 
 * @param data - The configuration data to validate
 * @param configType - The type of organization configuration
 * @returns Array of validation errors, empty if validation passes
 */
export function validateOrganizationConfig(
  data: Record<string, any>,
  configType: OrganizationConfigType
): ValidationError[] {
  // Import the appropriate schema based on the configuration type
  let schema: z.ZodSchema<any>;
  
  // Note: These schemas would be imported from appropriate modules
  // This is a placeholder for how the validation would be structured
  switch (configType) {
    case OrganizationConfigType.ORGANIZATION_CONFIG:
      // Import organizationConfigSchema dynamically
      schema = getOrganizationConfigSchema();
      break;
    case OrganizationConfigType.CLIENT_CONFIG:
      // Import clientConfigSchema dynamically
      schema = getClientConfigSchema();
      break;
    case OrganizationConfigType.CLIENT_CONFIG_IOS:
      // Import clientConfigIOSSchema dynamically
      schema = getClientConfigIOSSchema();
      break;
    case OrganizationConfigType.CLIENT_CONFIG_ANDROID:
      // Import clientConfigAndroidSchema dynamically
      schema = getClientConfigAndroidSchema();
      break;
    default:
      return [{
        field: 'configType',
        message: `Invalid configuration type: ${configType}`
      }];
  }
  
  return validateSchema(schema, data);
}

/**
 * Creates a standardized AppError for validation errors with detailed validation information
 * 
 * @param validationErrors - Array of validation errors
 * @param message - Custom error message (optional)
 * @returns A new AppError instance with VALIDATION_ERROR code
 */
export function createValidationError(
  validationErrors: ValidationError[],
  message?: string
): AppError {
  const errorMessage = message || 'Validation failed. Please check your input.';
  
  return createAppError(
    AppErrorCode.VALIDATION_ERROR,
    errorMessage,
    { validationErrors }
  );
}

/**
 * Validates a request body against a schema and throws a validation error if invalid
 * 
 * @param schema - The Zod schema to validate against
 * @param body - The request body to validate
 * @returns The validated and typed data if validation passes
 * @throws AppError with VALIDATION_ERROR code if validation fails
 */
export function validateRequestBody<T extends z.ZodSchema<any>>(
  schema: T,
  body: Record<string, any>
): z.infer<T> {
  const validationErrors = validateSchema(schema, body);
  
  if (validationErrors.length > 0) {
    throw createValidationError(
      validationErrors,
      'Invalid request body. Please check your input.'
    );
  }
  
  // If validation passes, return the parsed data with correct typing
  return schema.parse(body) as z.infer<T>;
}

/**
 * Validates query parameters against a schema and throws a validation error if invalid
 * 
 * @param schema - The Zod schema to validate against
 * @param query - The query parameters to validate
 * @returns The validated and typed query parameters if validation passes
 * @throws AppError with VALIDATION_ERROR code if validation fails
 */
export function validateQueryParams<T extends z.ZodSchema<any>>(
  schema: T,
  query: Record<string, string | string[]>
): z.infer<T> {
  const validationErrors = validateSchema(schema, query);
  
  if (validationErrors.length > 0) {
    throw createValidationError(
      validationErrors,
      'Invalid query parameters. Please check your input.'
    );
  }
  
  // If validation passes, return the parsed data with correct typing
  return schema.parse(query) as z.infer<T>;
}

/**
 * Validates if a string is a valid organization ID format
 * 
 * @param organizationId - The organization ID to validate
 * @returns True if the organization ID is valid, false otherwise
 */
export function isValidOrganizationId(organizationId: string): boolean {
  // Check if organizationId is a string and not empty
  if (!organizationId || typeof organizationId !== 'string') {
    return false;
  }
  
  // Validate the organizationId against a pattern
  // Allow alphanumeric characters, hyphens, and underscores
  const validIdPattern = /^[a-zA-Z0-9_-]+$/;
  return validIdPattern.test(organizationId);
}

// Re-export ValidationError interface for convenience
export { ValidationError };

// Helper functions to get the appropriate schemas
// These would typically import from schema definition files
function getOrganizationConfigSchema(): z.ZodSchema<any> {
  // This would import from a schema definitions file
  return z.object({
    OrganizationId: z.string(),
    OrganizationConfigType: z.literal(OrganizationConfigType.ORGANIZATION_CONFIG),
    Name: z.string().optional(),
    TeamName: z.string().optional(),
    Slug: z.string().optional(),
    ShortName: z.string().optional(),
    LogoUrl: z.string().url().optional(),
    FanWebRootUrl: z.string().url().optional(),
    BrandColor: z.string().optional(),
    ExternalProviderId: z.string().optional(),
    BuyTabs: z.array(
      z.object({
        Label: z.string(),
        Slug: z.string(),
        Type: z.string(),
        GenreCode: z.string().optional()
      })
    ).optional(),
    Profile: z.array(
      z.object({
        FieldName: z.string(),
        IsEditable: z.boolean().optional(),
        IsSSOUserEditable: z.boolean().optional(),
        IsRequired: z.boolean().optional()
      })
    ).optional(),
    CustomerServiceConfig: z.object({
      CustomerServicePhone: z.string().optional()
    }).optional()
  });
}

function getClientConfigSchema(): z.ZodSchema<any> {
  return z.object({
    OrganizationId: z.string(),
    OrganizationConfigType: z.literal(OrganizationConfigType.CLIENT_CONFIG),
    PublicAmplitudeExperimentsKey: z.string().optional(),
    PublicSegmentWriteKey: z.string().optional(),
    Braze: z.object({
      PublicKey: z.string().optional(),
      BaseUrl: z.string().url().optional()
    }).optional(),
    OrganizationCourtCash: z.object({
      Label: z.string().optional(),
      Enabled: z.boolean().optional()
    }).optional(),
    PrivacyPolicyLink: z.string().url().optional(),
    TermsLink: z.string().url().optional()
  });
}

function getClientConfigIOSSchema(): z.ZodSchema<any> {
  return z.object({
    OrganizationId: z.string(),
    OrganizationConfigType: z.literal(OrganizationConfigType.CLIENT_CONFIG_IOS),
    IosStoreLink: z.string().url().optional()
  });
}

function getClientConfigAndroidSchema(): z.ZodSchema<any> {
  return z.object({
    OrganizationId: z.string(),
    OrganizationConfigType: z.literal(OrganizationConfigType.CLIENT_CONFIG_ANDROID),
    AndroidStoreLink: z.string().url().optional()
  });
}