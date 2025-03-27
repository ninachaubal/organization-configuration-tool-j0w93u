import { NextApiRequest, NextApiResponse } from 'next'; // ^14.0.0
import { ConfigurationService } from '../../../../../services/ConfigurationService';
import { AppError, AppErrorCode, HttpStatusCode } from '../../../../../types/error';
import { GetOrganizationConfigResponse } from '../../../../../types/response';
import { withErrorHandling } from '../../../../../middleware/error';

/**
 * API route handler for retrieving all configuration records for a specific organization
 * 
 * @param req - The NextJS API request
 * @param res - The NextJS API response
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetOrganizationConfigResponse>
): Promise<void> {
  // Extract organizationId from the request query parameters
  const { id } = req.query;
  
  // Validate that organizationId is a string and not empty
  if (!id || typeof id !== 'string') {
    throw new AppError(
      AppErrorCode.NOT_FOUND,
      'Organization ID is required',
      HttpStatusCode.NOT_FOUND
    );
  }

  // Retrieve all configuration records for the organization
  const configs = await ConfigurationService.getConfigurationsByOrganizationId(id);

  // Return the configuration records
  res.status(HttpStatusCode.OK).json({
    success: true,
    configs
  });
}

// Export the handler with error handling middleware
export default withErrorHandling(handler);