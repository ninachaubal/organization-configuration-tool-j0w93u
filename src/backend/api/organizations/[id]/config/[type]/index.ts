import { NextApiRequest, NextApiResponse } from 'next'; // ^14.0.0
import { ConfigurationService } from '../../../../../../services/ConfigurationService';
import { OrganizationConfigType } from '../../../../../../models/enums/OrganizationConfigType';
import { handleApiError } from '../../../../../../utils/error-handling';
import { HttpStatusCode } from '../../../../../../types/error';
import { withAuth } from '../../../../../../middleware/auth';
import { validateConfigData } from '../../../../../../middleware/validation';

/**
 * API route handler for organization configuration by type
 * Supports GET (retrieve) and PUT (update) operations
 */
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    // Extract organizationId from URL parameter
    const organizationId = req.query.id as string;
    if (!organizationId) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    // Extract and validate config type
    const configTypeParam = req.query.type as string;
    if (!configTypeParam || !Object.values(OrganizationConfigType).includes(configTypeParam as OrganizationConfigType)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: `Invalid configuration type: ${configTypeParam}`,
        validTypes: Object.values(OrganizationConfigType)
      });
    }
    
    // Convert to proper enum type
    const configType = configTypeParam as OrganizationConfigType;

    // Route to appropriate handler based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getConfigurationByType(req, res, organizationId, configType);
      case 'PUT':
        return await updateConfiguration(req, res, organizationId, configType);
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: `Method ${req.method} Not Allowed`
        });
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

/**
 * Handles GET requests to retrieve configuration by type
 */
async function getConfigurationByType(
  req: NextApiRequest, 
  res: NextApiResponse,
  organizationId: string,
  configType: OrganizationConfigType
): Promise<void> {
  try {
    const config = await ConfigurationService.getConfigurationByType(organizationId, configType);
    
    return res.status(HttpStatusCode.OK).json({
      success: true,
      config
    });
  } catch (error) {
    handleApiError(error, res);
  }
}

/**
 * Handles PUT requests to update configuration by type
 */
async function updateConfiguration(
  req: NextApiRequest, 
  res: NextApiResponse,
  organizationId: string,
  configType: OrganizationConfigType
): Promise<void> {
  try {
    // Extract request body
    const data = req.body;
    
    try {
      // Validate configuration data
      validateConfigData(data, configType);
    } catch (validationError) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        details: validationError.details || validationError.message
      });
    }

    // Extract user information from the authenticated request
    const user = (req as any).user || { id: 'system' };
    const updatedBy = user.id || user.email || 'unknown';

    // Update configuration - service handles empty field removal and updates only changed fields
    const updatedConfig = await ConfigurationService.updateConfiguration(
      organizationId,
      configType,
      data,
      updatedBy
    );

    return res.status(HttpStatusCode.OK).json({
      success: true,
      config: updatedConfig
    });
  } catch (error) {
    handleApiError(error, res);
  }
}

// Export the handler with authentication middleware
export default withAuth(handler);