import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'; // ^14.0.0
import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import { z } from 'zod'; // ^3.22.4

import { validateSchema, validateOrganizationConfig, createValidationError } from '../utils/validation';
import { ValidationError, AppError } from '../types/error';
import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';
import { organizationSchema } from '../validation/schemas/organization';
import { organizationConfigSchema } from '../validation/schemas/organizationConfig';
import { clientConfigSchema } from '../validation/schemas/clientConfig';
import { clientConfigIOSSchema } from '../validation/schemas/clientConfigIOS';
import { clientConfigAndroidSchema } from '../validation/schemas/clientConfigAndroid';

/**
 * Higher-order function that wraps an API handler with validation middleware
 * 
 * @param schema - Zod schema to validate request body against
 * @param handler - NextJS API handler to wrap
 * @returns Wrapped handler function with validation
 */
export function withValidation(
  schema: z.ZodSchema<any>,
  handler: NextApiHandler
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Only validate if request has a body and method is not GET
      if (req.body && req.method !== 'GET') {
        const validationErrors = validateSchema(schema, req.body);
        
        if (validationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: { validationErrors }
          });
        }
        
        // Add validated and typed data to the request
        req.body = schema.parse(req.body);
      }
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      // Handle any errors that occur during validation
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details
        });
      }
      
      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during request validation'
      });
    }
  };
}

/**
 * Validates a request body against a schema and throws a validation error if invalid
 *
 * @param schema - Zod schema to validate against
 * @param body - Request body to validate
 * @returns The validated and typed data if validation passes
 * @throws AppError with validation details if validation fails
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
 * Validates organization data against the organization schema
 *
 * @param data - Organization data to validate
 * @returns The validated organization data if validation passes
 * @throws AppError with validation details if validation fails
 */
export function validateOrganizationData(
  data: Record<string, any>
): z.infer<typeof organizationSchema> {
  return validateRequestBody(organizationSchema, data);
}

/**
 * Validates configuration data against the appropriate schema based on configuration type
 *
 * @param data - Configuration data to validate
 * @param configType - Type of organization configuration
 * @returns The validated configuration data if validation passes
 * @throws AppError with validation details if validation fails
 */
export function validateConfigData(
  data: Record<string, any>,
  configType: OrganizationConfigType
): any {
  let schema: z.ZodSchema<any>;
  
  switch (configType) {
    case OrganizationConfigType.ORGANIZATION_CONFIG:
      schema = organizationConfigSchema;
      break;
    case OrganizationConfigType.CLIENT_CONFIG:
      schema = clientConfigSchema;
      break;
    case OrganizationConfigType.CLIENT_CONFIG_IOS:
      schema = clientConfigIOSSchema;
      break;
    case OrganizationConfigType.CLIENT_CONFIG_ANDROID:
      schema = clientConfigAndroidSchema;
      break;
    default:
      throw new Error(`Invalid configuration type: ${configType}`);
  }
  
  return validateRequestBody(schema, data);
}

/**
 * Middleware function for NextJS App Router that validates request data
 *
 * @param schema - Zod schema to validate request body against
 * @param request - NextJS App Router request object
 * @returns NextResponse with error details if validation fails, null if validation passes
 */
export async function validationMiddleware(
  schema: z.ZodSchema<any>,
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the body against the schema
    const validationErrors = validateSchema(schema, body);
    
    if (validationErrors.length > 0) {
      // Return error response if validation fails
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: { validationErrors }
        },
        { status: 400 }
      );
    }
    
    // Return null to continue to the next middleware or handler
    return null;
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      );
    }
    
    // Handle other unexpected errors
    console.error('Validation middleware error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during request validation'
      },
      { status: 500 }
    );
  }
}

// Re-export validateOrganizationConfig for convenience
export { validateOrganizationConfig };