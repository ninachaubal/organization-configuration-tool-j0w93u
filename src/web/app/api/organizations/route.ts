import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import { OrganizationService } from '../../../../backend/services/OrganizationService';
import { GetOrganizationsResponse, CreateOrganizationResponse } from '../../../../backend/types/response';
import { AppError, AppErrorCode } from '../../../../backend/types/error';
import { formatErrorResponse, getErrorStatusCode } from '../../../../backend/utils/error-handling';
import { error } from '../../../../backend/utils/logging';

/**
 * Handles GET requests to fetch all organizations
 * 
 * @param request The Next.js request object
 * @returns JSON response with all organizations
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Call OrganizationService to retrieve all organizations
    const organizations = await OrganizationService.getOrganizations();
    
    // Return a successful response with the organizations
    const response: GetOrganizationsResponse = {
      success: true,
      organizations
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    // Log the error
    error('Failed to retrieve organizations', err);
    
    // Format the error response
    const errorResponse = formatErrorResponse(err);
    
    // Determine the appropriate HTTP status code
    const statusCode = err instanceof AppError 
      ? err.statusCode 
      : 500; // Default to 500 for unknown errors
    
    // Return the error response
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * Handles POST requests to create a new organization with default configurations
 * 
 * @param request The Next.js request object
 * @returns JSON response with the created organization details
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = await request.json();
    const { organizationId, name } = body;
    
    // Get user identifier (in a real application, this would come from authentication)
    // For now, use a default or extract from headers
    const userId = request.headers.get('x-user-id') || 'system';
    
    // Create the organization with default configurations for all types
    const organization = await OrganizationService.createOrganization(
      organizationId,
      name,
      userId
    );
    
    // Return a successful response with the created organization
    const response: CreateOrganizationResponse = {
      success: true,
      organization
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    // Log the error
    error('Failed to create organization', err);
    
    // Format the error response with appropriate details
    const errorResponse = formatErrorResponse(err);
    
    // Determine the appropriate HTTP status code
    const statusCode = err instanceof AppError 
      ? err.statusCode 
      : 500; // Default to 500 for unknown errors
    
    // Return the error response
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}