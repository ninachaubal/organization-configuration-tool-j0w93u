import { NextApiRequest, NextApiResponse } from 'next'; // ^14.0.0
import { OrganizationService } from '../../../services';
import { 
  GetOrganizationsRequest, 
  CreateOrganizationRequest 
} from '../../../types/request';
import { 
  GetOrganizationsResponse,
  CreateOrganizationResponse 
} from '../../../types/response';
import { Organization } from '../../../models/Organization';
import { handleApiError } from '../../../utils/error-handling';
import { withValidation } from '../../../middleware/validation';
import { organizationSchema } from '../../../validation/schemas/organization';

/**
 * Handler for GET requests to list all organizations
 * 
 * @param req - NextJS API request
 * @param res - NextJS API response
 */
async function getOrganizationsHandler(
  req: NextApiRequest,
  res: NextApiResponse<GetOrganizationsResponse>
): Promise<void> {
  // Retrieve all organizations
  const organizations = await OrganizationService.getOrganizations();
  
  // Send response
  res.status(200).json({
    success: true,
    organizations
  });
}

/**
 * Handler for POST requests to create a new organization
 * 
 * @param req - NextJS API request with CreateOrganizationRequest body
 * @param res - NextJS API response
 */
async function createOrganizationHandler(
  req: NextApiRequest,
  res: NextApiResponse<CreateOrganizationResponse>
): Promise<void> {
  // Extract organization data from the request body
  const { OrganizationId, Name } = req.body as CreateOrganizationRequest;
  
  // Get user identifier from request headers or use a default value
  const userId = req.headers['x-user-id'] as string || 'system';
  
  // Create the organization with all configuration types
  const organization = await OrganizationService.createOrganization(
    OrganizationId,
    Name,
    userId
  );
  
  // Send response with created organization
  res.status(201).json({
    success: true,
    organization
  });
}

/**
 * Main API route handler for organization endpoints
 * 
 * @param req - NextJS API request
 * @param res - NextJS API response
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    // Route based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getOrganizationsHandler(req, res);
      case 'POST':
        return await createOrganizationHandler(req, res);
      default:
        // Method not allowed
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({
          success: false,
          error: `Method ${req.method} Not Allowed`
        });
    }
  } catch (error) {
    // Handle any errors
    handleApiError(error, res);
  }
}

// Export the handler with validation
// The validation middleware will only validate POST requests
export default withValidation(organizationSchema, handler);