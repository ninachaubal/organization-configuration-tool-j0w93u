import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import { ConfigurationService } from '../../../../../backend/services/ConfigurationService';
import { OrganizationService } from '../../../../../backend/services/OrganizationService';
import { GetOrganizationConfigResponse } from '../../../../../backend/types/response';
import { formatErrorResponse, getErrorStatusCode } from '../../../../../backend/utils/error-handling';
import { AppError } from '../../../../../backend/types/error';

/**
 * Handles GET requests to fetch all configuration records for an organization
 * 
 * @param request - The NextJS request object
 * @param params - The route parameters containing the organization ID
 * @returns A NextResponse with the configuration records or an error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    
    // Verify the organization exists
    await OrganizationService.getOrganizationById(id);
    
    // Get all configuration records for the organization
    const configs = await ConfigurationService.getConfigurationsByOrganizationId(id);
    
    // Construct the response
    const response: GetOrganizationConfigResponse = {
      success: true,
      configs
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    // Format the error response
    const errorResponse = formatErrorResponse(error);
    
    // Determine the status code
    let statusCode = 500; // Default to 500 (Internal Server Error)
    if (error instanceof AppError) {
      statusCode = getErrorStatusCode(error.code);
    }
    
    // Return the error response
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}