import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import { ConfigurationService } from '../../../../../../../backend/services/ConfigurationService';
import { OrganizationConfigType } from '../../../../../../../backend/models/enums/OrganizationConfigType';
import { AppError, AppErrorCode, HttpStatusCode } from '../../../../../../../backend/types/error';
import { GetOrganizationConfigByTypeResponse, UpdateOrganizationConfigResponse } from '../../../../../../../backend/types/response';
import { error as logError } from '../../../../../../../backend/utils/logging';

/**
 * Handles GET requests to retrieve a specific configuration type for an organization
 * 
 * @param request - The NextJS request object
 * @param context - Contains route parameters including organization ID and config type
 * @returns JSON response with configuration data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, type: string } }
): Promise<NextResponse> {
  const { id, type } = params;

  try {
    // Validate that the configuration type is valid
    if (!isValidConfigType(type)) {
      throw new AppError(
        AppErrorCode.VALIDATION_ERROR,
        `Invalid configuration type: ${type}`,
        HttpStatusCode.BAD_REQUEST
      );
    }

    // Get configuration by ID and type
    const configType = type as OrganizationConfigType;
    const config = await ConfigurationService.getConfigurationByType(id, configType);

    // Return successful response
    const response: GetOrganizationConfigByTypeResponse = {
      success: true,
      config
    };

    return NextResponse.json(response, { status: HttpStatusCode.OK });
  } catch (error) {
    // Let the error handler function format the error response
    return handleError(error);
  }
}

/**
 * Handles PUT requests to update a specific configuration type for an organization
 * 
 * @param request - The NextJS request object
 * @param context - Contains route parameters including organization ID and config type
 * @returns JSON response with updated configuration data or error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, type: string } }
): Promise<NextResponse> {
  const { id, type } = params;
  
  try {
    // Parse request body for update data
    const updateData = await request.json();
    
    // Validate that the configuration type is valid
    if (!isValidConfigType(type)) {
      throw new AppError(
        AppErrorCode.VALIDATION_ERROR,
        `Invalid configuration type: ${type}`,
        HttpStatusCode.BAD_REQUEST
      );
    }

    // Get user information for audit trail (assuming it's in the request headers)
    // In a real implementation, this would come from an auth system
    const updatedBy = request.headers.get('x-user-id') || 'anonymous';
    
    // Update configuration
    const configType = type as OrganizationConfigType;
    const updatedConfig = await ConfigurationService.updateConfiguration(
      id, 
      configType, 
      updateData, 
      updatedBy
    );

    // Return successful response
    const response: UpdateOrganizationConfigResponse = {
      success: true,
      config: updatedConfig
    };

    return NextResponse.json(response, { status: HttpStatusCode.OK });
  } catch (error) {
    // Let the error handler function format the error response
    return handleError(error);
  }
}

/**
 * Validates if a string is a valid OrganizationConfigType
 * 
 * @param type - The type string to validate
 * @returns True if the type is valid, false otherwise
 */
function isValidConfigType(type: string): boolean {
  return Object.values(OrganizationConfigType).includes(type as OrganizationConfigType);
}

/**
 * Handles errors and returns appropriate NextResponse objects
 * 
 * @param error - The error that occurred
 * @returns A formatted error response
 */
function handleError(error: Error | unknown): NextResponse {
  // Log the error
  logError('API Error in organization config route', error);
  
  if (error instanceof AppError) {
    // For AppError, use the provided status code and details
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    );
  }
  
  // For other errors, return a generic 500 error
  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
      code: AppErrorCode.INTERNAL_SERVER_ERROR
    },
    { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
  );
}