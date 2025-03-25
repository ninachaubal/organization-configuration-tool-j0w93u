import { createMocks } from 'node-mocks-http'; // v1.12.2
import { ConfigurationService } from '../../services/ConfigurationService';
import { configurations } from '../../__fixtures__/configurations.json';
import { AppError, AppErrorCode, HttpStatusCode } from '../../types/error';
import { GetOrganizationConfigResponse } from '../../types/response';
import handler from '../../api/organizations/[id]/config/index';

// Mock the ConfigurationService
jest.mock('../../services/ConfigurationService', () => ({
  ConfigurationService: {
    getConfigurationsByOrganizationId: jest.fn()
  }
}));

/**
 * Helper function to filter test configuration fixtures by organization ID
 * 
 * @param organizationId - The organization ID to filter by
 * @returns Filtered configuration records for the specified organization
 */
function filterConfigurationsByOrganizationId(organizationId: string) {
  return configurations.filter(config => config.OrganizationId === organizationId);
}

describe('GET /api/organizations/[id]/config', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return all configuration records for a valid organization ID', async () => {
    // Define a valid organization ID
    const organizationId = 'org1';
    const expectedConfigs = filterConfigurationsByOrganizationId(organizationId);
    
    // Mock ConfigurationService to return the filtered configs
    (ConfigurationService.getConfigurationsByOrganizationId as jest.Mock).mockResolvedValue(expectedConfigs);
    
    // Create mock request with GET method and organizationId in query params
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: organizationId },
    });

    // Call the handler with the mock request and response
    await handler(req, res);

    // Verify service was called with correct organization ID
    expect(ConfigurationService.getConfigurationsByOrganizationId).toHaveBeenCalledWith(organizationId);
    expect(res._getStatusCode()).toBe(HttpStatusCode.OK);
    
    // Verify response structure and data
    const responseData = JSON.parse(res._getData()) as GetOrganizationConfigResponse;
    expect(responseData.success).toBe(true);
    expect(responseData.configs).toEqual(expectedConfigs);
  });

  it('should return 404 when organization ID is not found', async () => {
    // Define a non-existent organization ID
    const nonExistentId = 'non-existent-id';
    
    // Mock service to throw a NOT_FOUND error
    (ConfigurationService.getConfigurationsByOrganizationId as jest.Mock).mockRejectedValue(
      new AppError(
        AppErrorCode.NOT_FOUND,
        `Organization with ID ${nonExistentId} not found`,
        HttpStatusCode.NOT_FOUND
      )
    );
    
    // Create mock request with non-existent organization ID
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: nonExistentId },
    });

    // Call the handler
    await handler(req, res);

    // Verify service call and response
    expect(ConfigurationService.getConfigurationsByOrganizationId).toHaveBeenCalledWith(nonExistentId);
    expect(res._getStatusCode()).toBe(HttpStatusCode.NOT_FOUND);
    
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBeTruthy();
  });

  it('should return 404 when organization ID is missing', async () => {
    // Create mock request with no ID in query params
    const { req, res } = createMocks({
      method: 'GET',
      query: {}, // No ID provided
    });

    // Call the handler
    await handler(req, res);

    // Verify service was not called and appropriate error returned
    expect(ConfigurationService.getConfigurationsByOrganizationId).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.NOT_FOUND);
    
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBeTruthy();
  });

  it('should handle empty configuration list', async () => {
    // Define a valid organization ID that has no configurations
    const organizationId = 'empty-org';
    
    // Mock service to return empty array
    (ConfigurationService.getConfigurationsByOrganizationId as jest.Mock).mockResolvedValue([]);
    
    // Create mock request
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: organizationId },
    });

    // Call the handler
    await handler(req, res);

    // Verify service was called and empty configs array returned
    expect(ConfigurationService.getConfigurationsByOrganizationId).toHaveBeenCalledWith(organizationId);
    expect(res._getStatusCode()).toBe(HttpStatusCode.OK);
    
    const responseData = JSON.parse(res._getData()) as GetOrganizationConfigResponse;
    expect(responseData.success).toBe(true);
    expect(responseData.configs).toEqual([]);
  });

  it('should handle unexpected service errors', async () => {
    // Define a valid organization ID
    const organizationId = 'org1';
    
    // Mock service to throw an unexpected error
    (ConfigurationService.getConfigurationsByOrganizationId as jest.Mock).mockRejectedValue(
      new Error('Unexpected service error')
    );
    
    // Create mock request
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: organizationId },
    });

    // Call the handler
    await handler(req, res);

    // Verify service was called and error response returned
    expect(ConfigurationService.getConfigurationsByOrganizationId).toHaveBeenCalledWith(organizationId);
    expect(res._getStatusCode()).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBeTruthy();
  });
});

describe('Unsupported HTTP methods', () => {
  it('should return 405 for unsupported methods', async () => {
    // Create mock request with unsupported method
    const { req, res } = createMocks({
      method: 'POST', // Using POST as an example of unsupported method
      query: { id: 'org1' },
    });

    // Call the handler
    await handler(req, res);
    
    // Verify method not allowed response
    expect(res._getStatusCode()).toBe(HttpStatusCode.METHOD_NOT_ALLOWED);
    
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBeTruthy();
  });
});