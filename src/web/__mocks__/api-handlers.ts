import { rest, http } from 'msw'; // msw v1.0.0
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
} from './data';
import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';

// Define API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * MSW handler for GET /api/organizations endpoint
 * Returns a list of all organizations
 */
const getOrganizationsHandler = rest.get(`${API_BASE_URL}/organizations`, (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json(mockOrganizationsResponse)
  );
});

/**
 * MSW handler for POST /api/organizations endpoint
 * Creates a new organization if the ID doesn't already exist
 */
const createOrganizationHandler = rest.post(`${API_BASE_URL}/organizations`, async (req, res, ctx) => {
  const body = await req.json();
  const { organizationId } = body;
  
  // Check if organization already exists
  const exists = mockOrganizations.some(org => org.OrganizationId === organizationId);
  
  if (exists) {
    return res(
      ctx.status(400),
      ctx.json(mockOrganizationCreationErrorResponse)
    );
  }
  
  return res(
    ctx.status(200),
    ctx.json(mockOrganizationCreationResponse)
  );
});

/**
 * MSW handler for GET /api/organizations/:id/config endpoint
 * Returns all configuration types for a specific organization
 */
const getOrganizationConfigurationsHandler = rest.get(`${API_BASE_URL}/organizations/:id/config`, (req, res, ctx) => {
  const { id } = req.params;
  
  // Check if organization exists
  const orgConfigs = mockOrganizationConfigurations[id as string];
  if (!orgConfigs) {
    return res(
      ctx.status(404),
      ctx.json({ error: 'Organization not found' })
    );
  }
  
  return res(
    ctx.status(200),
    ctx.json({ configs: Object.values(orgConfigs) })
  );
});

/**
 * MSW handler for GET /api/organizations/:id/config/:type endpoint
 * Returns a specific configuration type for an organization
 */
const getOrganizationConfigurationTypeHandler = rest.get(`${API_BASE_URL}/organizations/:id/config/:type`, (req, res, ctx) => {
  const { id, type } = req.params;
  
  // Check if organization exists
  const orgConfigs = mockOrganizationConfigurations[id as string];
  if (!orgConfigs) {
    return res(
      ctx.status(404),
      ctx.json({ error: 'Organization not found' })
    );
  }
  
  // Check if configuration type exists
  const config = orgConfigs[type as OrganizationConfigType];
  if (!config) {
    return res(
      ctx.status(404),
      ctx.json({ error: 'Configuration type not found' })
    );
  }
  
  return res(
    ctx.status(200),
    ctx.json({ config })
  );
});

/**
 * MSW handler for PUT /api/organizations/:id/config/:type endpoint
 * Updates a specific configuration type for an organization
 */
const updateOrganizationConfigurationHandler = rest.put(`${API_BASE_URL}/organizations/:id/config/:type`, async (req, res, ctx) => {
  const { id, type } = req.params;
  const body = await req.json();
  
  // Check if organization exists
  const orgConfigs = mockOrganizationConfigurations[id as string];
  if (!orgConfigs) {
    return res(
      ctx.status(404),
      ctx.json({ error: 'Organization not found' })
    );
  }
  
  // Check if configuration type exists
  const config = orgConfigs[type as OrganizationConfigType];
  if (!config) {
    return res(
      ctx.status(404),
      ctx.json({ error: 'Configuration type not found' })
    );
  }
  
  // Simple validation - check if required fields are present
  if (type === OrganizationConfigType.ORGANIZATION_CONFIG && !body.Name) {
    return res(
      ctx.status(400),
      ctx.json(mockConfigurationUpdateErrorResponse)
    );
  }
  
  return res(
    ctx.status(200),
    ctx.json(mockConfigurationUpdateResponse)
  );
});

/**
 * Array of all MSW handlers for API mocking during tests
 */
export const handlers = [
  getOrganizationsHandler,
  createOrganizationHandler,
  getOrganizationConfigurationsHandler,
  getOrganizationConfigurationTypeHandler,
  updateOrganizationConfigurationHandler
];