import { rest } from 'msw'; // v1.0.0
import { setupServer } from 'msw/node'; // v1.0.0
import { 
  getOrganizations,
  createOrganization,
  getOrganizationConfigurations,
  getOrganizationConfigurationType,
  updateOrganizationConfiguration
} from '../../lib/api-client';
import { removeEmptyValues } from '../../lib/utils';
import { OrganizationConfigType } from '../../../backend/models/enums/OrganizationConfigType';
import {
  mockOrganizations,
  mockOrganizationConfigurations,
  mockOrganizationsResponse,
  mockConfigurationResponse,
  mockConfigurationsResponse,
  mockOrganizationCreationResponse,
  mockOrganizationCreationErrorResponse,
  mockConfigurationUpdateResponse,
  mockConfigurationUpdateErrorResponse
} from '../../__mocks__/data';

// Mock removeEmptyValues to track calls
jest.mock('../../lib/utils', () => ({
  removeEmptyValues: jest.fn((data) => data) // Return data unchanged for simplicity
}));

/**
 * Sets up MSW server with handlers for API mocking
 * @returns MSW server instance
 */
function setupApiMocks() {
  const handlers = [
    // GET /api/organizations - Success
    rest.get('/api/organizations', (req, res, ctx) => {
      return res(ctx.json(mockOrganizationsResponse));
    }),
    
    // POST /api/organizations - Success
    rest.post('/api/organizations', (req, res, ctx) => {
      return res(ctx.json(mockOrganizationCreationResponse));
    }),
    
    // GET /api/organizations/:id/config - Success
    rest.get('/api/organizations/org1/config', (req, res, ctx) => {
      return res(ctx.json(mockConfigurationsResponse));
    }),
    
    // GET /api/organizations/:id/config - Not Found
    rest.get('/api/organizations/nonexistent/config', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json({ error: 'Organization not found' }));
    }),
    
    // GET /api/organizations/:id/config/:type - Success
    rest.get('/api/organizations/org1/config/ORGANIZATION_CONFIG', (req, res, ctx) => {
      return res(ctx.json(mockConfigurationResponse));
    }),
    
    // GET /api/organizations/:id/config/:type - Not Found
    rest.get('/api/organizations/org1/config/NONEXISTENT_TYPE', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json({ error: 'Configuration type not found' }));
    }),
    
    // PUT /api/organizations/:id/config/:type - Success
    rest.put('/api/organizations/org1/config/ORGANIZATION_CONFIG', (req, res, ctx) => {
      return res(ctx.json(mockConfigurationUpdateResponse));
    }),
    
    // PUT /api/organizations/:id/config/:type - Validation Error
    rest.put('/api/organizations/org1/config/INVALID', (req, res, ctx) => {
      return res(ctx.status(400), ctx.json(mockConfigurationUpdateErrorResponse));
    })
  ];
  
  return setupServer(...handlers);
}

const server = setupApiMocks();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchWithErrorHandling', () => {
  it('should handle successful responses', async () => {
    const result = await getOrganizations();
    expect(result).toEqual(mockOrganizations);
  });
  
  it('should handle error responses', async () => {
    // Override the handler for this specific test
    server.use(
      rest.get('/api/organizations', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    await expect(getOrganizations()).rejects.toThrow('Server error');
  });
  
  it('should handle network errors', async () => {
    // Override the handler to simulate a network error
    server.use(
      rest.get('/api/organizations', (req, res, ctx) => {
        return res.networkError('Failed to connect');
      })
    );
    
    await expect(getOrganizations()).rejects.toThrow();
  });
});

describe('getOrganizations', () => {
  it('should fetch organizations successfully', async () => {
    const result = await getOrganizations();
    expect(result).toEqual(mockOrganizations);
  });
  
  it('should handle API errors', async () => {
    // Override the handler for this test
    server.use(
      rest.get('/api/organizations', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Failed to fetch organizations' }));
      })
    );
    
    await expect(getOrganizations()).rejects.toThrow('Failed to fetch organizations');
  });
});

describe('createOrganization', () => {
  it('should create organization successfully', async () => {
    const orgData = {
      organizationId: 'new-org',
      name: 'New Organization'
    };
    
    const result = await createOrganization(orgData);
    expect(result).toEqual(mockOrganizationCreationResponse);
  });
  
  it('should handle validation errors', async () => {
    const orgData = {
      organizationId: 'existing-org',
      name: 'Existing Organization'
    };
    
    // Override handler for this test
    server.use(
      rest.post('/api/organizations', (req, res, ctx) => {
        return res(ctx.status(400), ctx.json(mockOrganizationCreationErrorResponse));
      })
    );
    
    await expect(createOrganization(orgData)).rejects.toThrow('OrganizationId already exists');
  });
});

describe('getOrganizationConfigurations', () => {
  it('should fetch all configurations for an organization', async () => {
    const result = await getOrganizationConfigurations('org1');
    expect(result).toEqual(Object.values(mockOrganizationConfigurations.org1));
  });
  
  it('should handle organization not found', async () => {
    await expect(getOrganizationConfigurations('nonexistent')).rejects.toThrow('Organization not found');
  });
});

describe('getOrganizationConfigurationType', () => {
  it('should fetch specific configuration type', async () => {
    const result = await getOrganizationConfigurationType('org1', OrganizationConfigType.ORGANIZATION_CONFIG);
    expect(result).toEqual(mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG]);
  });
  
  it('should handle configuration type not found', async () => {
    // Override handler to simulate the error for a non-existent type
    server.use(
      rest.get('/api/organizations/org1/config/NONEXISTENT_TYPE', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ error: 'Configuration type not found' }));
      })
    );
    
    // @ts-ignore - Intentionally using an invalid type for testing
    await expect(getOrganizationConfigurationType('org1', 'NONEXISTENT_TYPE')).rejects.toThrow('Configuration type not found');
  });
});

describe('updateOrganizationConfiguration', () => {
  beforeEach(() => {
    // Reset the mock before each test
    (removeEmptyValues as jest.Mock).mockClear();
  });
  
  it('should update configuration successfully', async () => {
    const updateData = {
      Name: 'Updated Acme Sports'
    };
    
    const result = await updateOrganizationConfiguration(
      'org1', 
      OrganizationConfigType.ORGANIZATION_CONFIG,
      updateData
    );
    
    expect(result).toEqual(mockConfigurationUpdateResponse);
  });
  
  it('should remove empty values before sending', async () => {
    const updateData = {
      Name: 'Updated Acme Sports',
      TeamName: '',
      LogoUrl: null,
      BuyTabs: []
    };
    
    (removeEmptyValues as jest.Mock).mockReturnValue({
      Name: 'Updated Acme Sports'
    });
    
    await updateOrganizationConfiguration(
      'org1', 
      OrganizationConfigType.ORGANIZATION_CONFIG,
      updateData
    );
    
    expect(removeEmptyValues).toHaveBeenCalledWith(updateData);
  });
  
  it('should handle validation errors', async () => {
    const updateData = {
      Name: '' // Empty name will cause validation error
    };
    
    // Override handler for this test
    server.use(
      rest.put('/api/organizations/org1/config/ORGANIZATION_CONFIG', (req, res, ctx) => {
        return res(ctx.status(400), ctx.json(mockConfigurationUpdateErrorResponse));
      })
    );
    
    await expect(updateOrganizationConfiguration(
      'org1',
      OrganizationConfigType.ORGANIZATION_CONFIG,
      updateData
    )).rejects.toThrow('Validation failed: Name field is required');
  });
});