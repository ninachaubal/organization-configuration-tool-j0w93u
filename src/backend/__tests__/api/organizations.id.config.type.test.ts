import { createMocks } from 'node-mocks-http'; // ^1.12.2
import { OrganizationConfigType } from '../../models/enums/OrganizationConfigType';
import { ConfigurationService } from '../../services/ConfigurationService';
import { AppError, AppErrorCode, HttpStatusCode } from '../../types/error';
import configurations from '../../__fixtures__/configurations.json';
import { validateConfigData } from '../../middleware/validation';
import handler from '../../api/organizations/[id]/config/[type]/index';

// Mock the ConfigurationService
jest.mock('../../services/ConfigurationService', () => ({
  ConfigurationService: {
    getConfigurationByType: jest.fn(),
    updateConfiguration: jest.fn()
  }
}));

// Mock the validation middleware
jest.mock('../../middleware/validation', () => ({
  validateConfigData: jest.fn()
}));

// Mock the auth middleware to pass through for testing
jest.mock('../../middleware/auth', () => ({
  withAuth: (handler) => handler
}));

/**
 * Helper function to find a specific configuration from test fixtures by organization ID and type
 */
const findConfigurationByTypeAndId = (
  organizationId: string,
  configType: OrganizationConfigType
): object | undefined => {
  return configurations.find(
    config => 
      config.OrganizationId === organizationId && 
      config.OrganizationConfigType === configType
  );
};

/**
 * Helper function to create a mock request with method, query parameters, and body
 */
const createMockRequest = (method: string, query: object, body?: object) => {
  const { req, res } = createMocks({
    method,
    query,
    body
  });
  
  return { req, res };
};

/**
 * Helper function to add mock user information to a request object
 */
const addMockUser = (req: any) => {
  req.user = {
    id: 'test-user',
    email: 'test@example.com',
    roles: ['admin']
  };
  return req;
};

describe('GET /api/organizations/[id]/config/[type]', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return configuration for a valid organization ID and type', async () => {
    // Define test data
    const organizationId = 'org1';
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    const expectedConfig = findConfigurationByTypeAndId(organizationId, configType);
    
    // Mock service response
    (ConfigurationService.getConfigurationByType as jest.Mock).mockResolvedValueOnce(expectedConfig);
    
    // Create mock request
    const { req, res } = createMockRequest('GET', {
      id: organizationId,
      type: configType
    });
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(ConfigurationService.getConfigurationByType).toHaveBeenCalledWith(organizationId, configType);
    expect(res._getStatusCode()).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      config: expectedConfig
    });
  });
  
  it('should return 404 when organization ID is not found', async () => {
    // Define test data
    const organizationId = 'non-existent-org';
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    
    // Mock service to throw NOT_FOUND error
    (ConfigurationService.getConfigurationByType as jest.Mock).mockRejectedValueOnce(
      new AppError(AppErrorCode.NOT_FOUND, 'Organization not found', HttpStatusCode.NOT_FOUND)
    );
    
    // Create mock request
    const { req, res } = createMockRequest('GET', {
      id: organizationId,
      type: configType
    });
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(ConfigurationService.getConfigurationByType).toHaveBeenCalledWith(organizationId, configType);
    expect(res._getStatusCode()).toBe(HttpStatusCode.NOT_FOUND);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
  
  it('should return 404 when configuration type is not found', async () => {
    // Define test data
    const organizationId = 'org1';
    const configType = 'NON_EXISTENT_TYPE' as OrganizationConfigType;
    
    // Create mock request
    const { req, res } = createMockRequest('GET', {
      id: organizationId,
      type: configType
    });
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(res._getStatusCode()).toBe(HttpStatusCode.BAD_REQUEST);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
    expect(JSON.parse(res._getData())).toHaveProperty('validTypes');
  });
  
  it('should return 404 when organization ID is missing', async () => {
    // Define test data
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    
    // Create mock request with no organizationId
    const { req, res } = createMockRequest('GET', {
      type: configType
    });
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(res._getStatusCode()).toBe(HttpStatusCode.BAD_REQUEST);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
  
  it('should return 400 when configuration type is missing or invalid', async () => {
    // Define test data
    const organizationId = 'org1';
    
    // Create mock request with no configType
    const { req, res } = createMockRequest('GET', {
      id: organizationId
    });
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(res._getStatusCode()).toBe(HttpStatusCode.BAD_REQUEST);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
  
  it('should handle unexpected service errors', async () => {
    // Define test data
    const organizationId = 'org1';
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    
    // Mock service to throw unexpected error
    (ConfigurationService.getConfigurationByType as jest.Mock).mockRejectedValueOnce(
      new Error('Unexpected error')
    );
    
    // Create mock request
    const { req, res } = createMockRequest('GET', {
      id: organizationId,
      type: configType
    });
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(ConfigurationService.getConfigurationByType).toHaveBeenCalledWith(organizationId, configType);
    expect(res._getStatusCode()).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
});

describe('PUT /api/organizations/[id]/config/[type]', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should update configuration for a valid organization ID and type', async () => {
    // Define test data
    const organizationId = 'org1';
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    const updateData = {
      Name: 'Updated Org Name',
      TeamName: 'Updated Team Name'
    };
    
    // Get test data and create expected result
    const originalConfig = findConfigurationByTypeAndId(organizationId, configType);
    const expectedUpdatedConfig = {
      ...originalConfig,
      ...updateData,
      __updatedAt: expect.any(String),
      __updatedBy: 'test-user'
    };
    
    // Mock validation middleware
    (validateConfigData as jest.Mock).mockReturnValueOnce(updateData);
    
    // Mock service response
    (ConfigurationService.updateConfiguration as jest.Mock).mockResolvedValueOnce(expectedUpdatedConfig);
    
    // Create mock request
    const { req, res } = createMockRequest('PUT', {
      id: organizationId,
      type: configType
    }, updateData);
    
    // Add mock user information
    addMockUser(req);
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(validateConfigData).toHaveBeenCalledWith(updateData, configType);
    expect(ConfigurationService.updateConfiguration).toHaveBeenCalledWith(
      organizationId, 
      configType, 
      updateData, 
      'test-user'
    );
    expect(res._getStatusCode()).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      config: expectedUpdatedConfig
    });
  });
  
  it('should return 400 when validation fails', async () => {
    // Define test data
    const organizationId = 'org1';
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    const invalidData = {
      Name: '' // Invalid empty name
    };
    
    // Mock validation middleware to throw error
    (validateConfigData as jest.Mock).mockImplementation(() => {
      throw new AppError(
        AppErrorCode.VALIDATION_ERROR,
        'Validation failed',
        HttpStatusCode.BAD_REQUEST,
        { details: { Name: ['Name is required'] } }
      );
    });
    
    // Create mock request
    const { req, res } = createMockRequest('PUT', {
      id: organizationId,
      type: configType
    }, invalidData);
    
    // Add mock user information
    addMockUser(req);
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(validateConfigData).toHaveBeenCalledWith(invalidData, configType);
    expect(ConfigurationService.updateConfiguration).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.BAD_REQUEST);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
    expect(JSON.parse(res._getData())).toHaveProperty('details');
  });
  
  it('should return 404 when organization ID is not found', async () => {
    // Define test data
    const organizationId = 'non-existent-org';
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    const updateData = {
      Name: 'Updated Org Name'
    };
    
    // Mock validation middleware
    (validateConfigData as jest.Mock).mockReturnValueOnce(updateData);
    
    // Mock service to throw NOT_FOUND error
    (ConfigurationService.updateConfiguration as jest.Mock).mockRejectedValueOnce(
      new AppError(AppErrorCode.NOT_FOUND, 'Organization not found', HttpStatusCode.NOT_FOUND)
    );
    
    // Create mock request
    const { req, res } = createMockRequest('PUT', {
      id: organizationId,
      type: configType
    }, updateData);
    
    // Add mock user information
    addMockUser(req);
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(validateConfigData).toHaveBeenCalledWith(updateData, configType);
    expect(ConfigurationService.updateConfiguration).toHaveBeenCalledWith(
      organizationId,
      configType,
      updateData,
      'test-user'
    );
    expect(res._getStatusCode()).toBe(HttpStatusCode.NOT_FOUND);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
  
  it('should return 404 when organization ID is missing', async () => {
    // Define test data
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    const updateData = {
      Name: 'Updated Org Name'
    };
    
    // Create mock request with no organizationId
    const { req, res } = createMockRequest('PUT', {
      type: configType
    }, updateData);
    
    // Add mock user information
    addMockUser(req);
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(res._getStatusCode()).toBe(HttpStatusCode.BAD_REQUEST);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
  
  it('should return 400 when configuration type is missing or invalid', async () => {
    // Define test data
    const organizationId = 'org1';
    const updateData = {
      Name: 'Updated Org Name'
    };
    
    // Create mock request with no configType
    const { req, res } = createMockRequest('PUT', {
      id: organizationId
    }, updateData);
    
    // Add mock user information
    addMockUser(req);
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(res._getStatusCode()).toBe(HttpStatusCode.BAD_REQUEST);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
  
  it('should return 400 when request body is missing', async () => {
    // Define test data
    const organizationId = 'org1';
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    
    // Create mock request with no body
    const { req, res } = createMockRequest('PUT', {
      id: organizationId,
      type: configType
    });
    
    // Add mock user information
    addMockUser(req);
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(validateConfigData).not.toHaveBeenCalled();
    expect(ConfigurationService.updateConfiguration).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.BAD_REQUEST);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
  
  it('should handle unexpected service errors during update', async () => {
    // Define test data
    const organizationId = 'org1';
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    const updateData = {
      Name: 'Updated Org Name'
    };
    
    // Mock validation middleware
    (validateConfigData as jest.Mock).mockReturnValueOnce(updateData);
    
    // Mock service to throw unexpected error
    (ConfigurationService.updateConfiguration as jest.Mock).mockRejectedValueOnce(
      new Error('Unexpected error')
    );
    
    // Create mock request
    const { req, res } = createMockRequest('PUT', {
      id: organizationId,
      type: configType
    }, updateData);
    
    // Add mock user information
    addMockUser(req);
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(validateConfigData).toHaveBeenCalledWith(updateData, configType);
    expect(ConfigurationService.updateConfiguration).toHaveBeenCalledWith(
      organizationId,
      configType,
      updateData,
      'test-user'
    );
    expect(res._getStatusCode()).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
});

describe('Unsupported HTTP methods', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return 405 for unsupported methods', async () => {
    // Define test data
    const organizationId = 'org1';
    const configType = OrganizationConfigType.ORGANIZATION_CONFIG;
    
    // Create mock request with POST method (unsupported)
    const { req, res } = createMockRequest('POST', {
      id: organizationId,
      type: configType
    });
    
    // Call the handler
    await handler(req, res);
    
    // Verify expectations
    expect(res._getStatusCode()).toBe(HttpStatusCode.METHOD_NOT_ALLOWED);
    expect(JSON.parse(res._getData())).toHaveProperty('success', false);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
    expect(res.getHeader('Allow')).toEqual(['GET', 'PUT']);
  });
});