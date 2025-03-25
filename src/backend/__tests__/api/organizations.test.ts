import { createMocks } from 'node-mocks-http'; // v1.12.2
import { OrganizationService } from '../../services/OrganizationService';
import organizations from '../../__fixtures__/organizations.json';
import { AppError, AppErrorCode, HttpStatusCode } from '../../types/error';
import handler from '../../api/organizations/index';

// Mock the OrganizationService
jest.mock('../../services/OrganizationService', () => ({
  OrganizationService: {
    getOrganizations: jest.fn(),
    createOrganization: jest.fn()
  }
}));

/**
 * Helper function to create a mock NextJS request with method and body
 * 
 * @param method - HTTP method for the request
 * @param body - Optional request body
 * @returns Mock request and response objects
 */
const createMockRequest = (method: string, body?: object) => {
  return createMocks({
    method,
    body
  });
};

describe('GET /api/organizations', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return a list of organizations', async () => {
    // Mock the service to return test organizations
    (OrganizationService.getOrganizations as jest.Mock).mockResolvedValue(organizations);

    // Create mock request and response
    const { req, res } = createMockRequest('GET');

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(OrganizationService.getOrganizations).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      organizations
    });
  });

  it('should handle empty organization list', async () => {
    // Mock the service to return an empty array
    (OrganizationService.getOrganizations as jest.Mock).mockResolvedValue([]);

    // Create mock request and response
    const { req, res } = createMockRequest('GET');

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(OrganizationService.getOrganizations).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      organizations: []
    });
  });

  it('should handle service errors', async () => {
    // Mock the service to throw an error
    const errorMessage = 'Database error';
    const error = new AppError(
      AppErrorCode.DATABASE_ERROR,
      errorMessage,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
    (OrganizationService.getOrganizations as jest.Mock).mockRejectedValue(error);

    // Create mock request and response
    const { req, res } = createMockRequest('GET');

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(OrganizationService.getOrganizations).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
    expect(JSON.parse(res._getData()).error).toEqual(errorMessage);
  });
});

describe('POST /api/organizations', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should create a new organization with valid data', async () => {
    // Create organization data
    const orgData = {
      OrganizationId: 'new-org',
      Name: 'New Organization'
    };
    
    // Mock service to return the created organization
    (OrganizationService.createOrganization as jest.Mock).mockResolvedValue(orgData);

    // Create mock request and response
    const { req, res } = createMockRequest('POST', orgData);

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(OrganizationService.createOrganization).toHaveBeenCalledWith(
      orgData.OrganizationId,
      orgData.Name,
      expect.any(String)
    );
    expect(res._getStatusCode()).toBe(HttpStatusCode.CREATED);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      organization: orgData
    });
  });

  it('should return 400 with invalid organization data', async () => {
    // Create invalid organization data (missing Name)
    const invalidData = {
      OrganizationId: 'new-org'
    };
    
    // Create mock request and response
    const { req, res } = createMockRequest('POST', invalidData);

    // Mock service to throw validation error
    const error = new AppError(
      AppErrorCode.VALIDATION_ERROR,
      'Invalid organization data',
      HttpStatusCode.BAD_REQUEST,
      { details: 'Name is required' }
    );
    (OrganizationService.createOrganization as jest.Mock).mockRejectedValue(error);

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(OrganizationService.createOrganization).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.BAD_REQUEST);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
    expect(JSON.parse(res._getData()).error).toEqual('Invalid organization data');
  });

  it('should return 409 when organization ID already exists', async () => {
    // Create organization data with existing ID
    const existingData = {
      OrganizationId: 'org1', // This ID exists in the fixtures
      Name: 'Duplicate Organization'
    };
    
    // Create mock request and response
    const { req, res } = createMockRequest('POST', existingData);

    // Mock service to throw duplicate entity error
    const error = new AppError(
      AppErrorCode.DUPLICATE_ENTITY,
      `Organization with ID ${existingData.OrganizationId} already exists`,
      HttpStatusCode.CONFLICT
    );
    (OrganizationService.createOrganization as jest.Mock).mockRejectedValue(error);

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(OrganizationService.createOrganization).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.CONFLICT);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
    expect(JSON.parse(res._getData()).error).toContain('already exists');
  });

  it('should handle unexpected errors during creation', async () => {
    // Create valid organization data
    const orgData = {
      OrganizationId: 'new-org',
      Name: 'New Organization'
    };
    
    // Create mock request and response
    const { req, res } = createMockRequest('POST', orgData);

    // Mock service to throw an unexpected error
    const error = new Error('Unexpected error');
    (OrganizationService.createOrganization as jest.Mock).mockRejectedValue(error);

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(OrganizationService.createOrganization).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
});

describe('Unsupported HTTP methods', () => {
  it('should return 405 for unsupported methods', async () => {
    // Test with PUT method
    const { req, res } = createMockRequest('PUT');

    // Call the handler
    await handler(req, res);

    // Verify the response
    expect(res._getStatusCode()).toBe(HttpStatusCode.METHOD_NOT_ALLOWED);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
    expect(JSON.parse(res._getData()).error).toContain('Method PUT Not Allowed');
    
    // Check if Allow header is set
    const headers = res._getHeaders();
    expect(headers.allow).toEqual(['GET', 'POST']);
  });
});