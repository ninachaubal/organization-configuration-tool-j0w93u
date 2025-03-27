import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import { OrganizationService } from '../../../../services/OrganizationService';
import { withErrorHandling } from '../../../../middleware/error';
import { AppError, AppErrorCode, HttpStatusCode } from '../../../../types/error';
import { Organization } from '../../../../models/Organization';
import { OrganizationIdParam } from '../../../../types/request';

/**
 * Handles GET requests to retrieve a specific organization by ID
 * 
 * @param request - The incoming request object
 * @param params - Object containing route parameters
 * @returns Response containing the organization details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: OrganizationIdParam }
): Promise<NextResponse> {
  try {
    // Extract organizationId from the URL path parameters
    const { id: organizationId } = params;
    
    // Call OrganizationService.getOrganizationById to retrieve the organization
    const organization = await OrganizationService.getOrganizationById(organizationId);
    
    // Return NextResponse with status 200 and the organization in the response body
    return NextResponse.json({ organization }, { status: HttpStatusCode.OK });
  } catch (error) {
    // Handle any errors using appropriate error formatting
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code, details: error.details },
        { status: error.statusCode }
      );
    }
    
    // Handle generic errors
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred', 
        code: AppErrorCode.INTERNAL_SERVER_ERROR 
      },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}