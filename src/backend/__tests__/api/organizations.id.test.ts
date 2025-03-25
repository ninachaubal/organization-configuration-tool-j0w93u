import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import { OrganizationService } from '../../services/OrganizationService';
import { organizations } from '../../__fixtures__/organizations.json';
import { 
  AppError, 
  AppErrorCode, 
  HttpStatusCode 
} from '../../types/error';
import { GET } from '../../api/organizations/[id]/index';

// Mock the OrganizationService
jest.mock('../../services/OrganizationService', () => ({ 
  OrganizationService: { 
    getOrganizationById: jest.fn() 
  } 
}));

/**
 * Helper function to create a mock NextJS request with params
 * 
 * @param organizationId - The organization ID to include in the request URL
 * @returns Mock NextRequest object with the organization ID in the URL
 */
const createMockRequest = (organizationId: string): NextRequest => {
  return new NextRequest(new URL(`http://localhost/api/organizations/${organizationId}`));
};

describe('GET /api/organizations/[id]', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return an organization when found', async () => {
    // Arrange
    const testOrg = { OrganizationId: 'org1', Name: 'Acme Sports' };
    OrganizationService.getOrganizationById.mockResolvedValue(testOrg);
    
    // Act
    const req = createMockRequest('org1');
    const params = { id: 'org1' };
    const response = await GET(req, { params });
    
    // Assert
    expect(OrganizationService.getOrganizationById).toHaveBeenCalledWith('org1');
    const body = await response.json();
    expect(body).toEqual({ organization: testOrg });
    expect(response.status).toBe(HttpStatusCode.OK);
  });

  it('should return 404 when organization is not found', async () => {
    // Arrange
    const error = new AppError(
      AppErrorCode.NOT_FOUND,
      'Organization with ID nonexistent not found',
      HttpStatusCode.NOT_FOUND
    );
    OrganizationService.getOrganizationById.mockRejectedValue(error);
    
    // Act
    const req = createMockRequest('nonexistent');
    const params = { id: 'nonexistent' };
    const response = await GET(req, { params });
    
    // Assert
    expect(OrganizationService.getOrganizationById).toHaveBeenCalledWith('nonexistent');
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Organization with ID nonexistent not found');
    expect(body.code).toBe(AppErrorCode.NOT_FOUND);
  });

  it('should handle unexpected errors', async () => {
    // Arrange
    const error = new Error('Unexpected error');
    OrganizationService.getOrganizationById.mockRejectedValue(error);
    
    // Act
    const req = createMockRequest('org1');
    const params = { id: 'org1' };
    const response = await GET(req, { params });
    
    // Assert
    expect(OrganizationService.getOrganizationById).toHaveBeenCalledWith('org1');
    expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unexpected error');
    expect(body.code).toBe(AppErrorCode.INTERNAL_SERVER_ERROR);
  });
});

describe('Unsupported HTTP methods', () => {
  it('should return 405 for unsupported methods', async () => {
    // Arrange
    const req = new NextRequest(new URL('http://localhost/api/organizations/org1'), {
      method: 'POST'
    });
    const params = { id: 'org1' };
    
    // Act
    const response = await GET(req, { params });
    
    // Assert
    expect(response.status).toBe(HttpStatusCode.METHOD_NOT_ALLOWED);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe(AppErrorCode.METHOD_NOT_ALLOWED);
  });
});