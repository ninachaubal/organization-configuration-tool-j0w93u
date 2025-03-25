import { 
  Organization, 
  OrganizationsResponse,
  OrganizationCreationResponse
} from '../types/organization';
import { 
  ConfigurationRecord, 
  ConfigurationsResponse,
  ConfigurationResponse,
  ConfigurationUpdateResponse
} from '../types/configuration';
import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';
import { removeEmptyValues } from './utils';

// Base API URL from environment variables or default to '/api'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * Wrapper around the fetch API that handles common error scenarios and response parsing
 * @param url - The URL to fetch from, relative to the API base URL
 * @param options - Optional fetch options
 * @returns Parsed JSON response
 * @throws Error with details about the failed request
 */
async function fetchWithErrorHandling(url: string, options?: RequestInit): Promise<any> {
  const fullUrl = `${API_BASE_URL}${url}`;
  
  // Set default headers for JSON content type if not provided
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });
    
    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      // Try to parse error response as JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Unknown error occurred' };
      }
      
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    
    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    // Handle network errors or JSON parsing errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred during the API request');
  }
}

/**
 * Fetches the list of all organizations
 * @returns Promise resolving to an array of organizations
 */
export async function getOrganizations(): Promise<Organization[]> {
  const response = await fetchWithErrorHandling('/organizations');
  return response.organizations;
}

/**
 * Creates a new organization with default configurations
 * @param data Object containing organizationId and name
 * @returns Promise resolving to the creation response
 */
export async function createOrganization(
  data: { organizationId: string, name: string }
): Promise<OrganizationCreationResponse> {
  return await fetchWithErrorHandling('/organizations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Fetches all configuration types for a specific organization
 * @param organizationId The ID of the organization
 * @returns Promise resolving to an array of configuration records
 */
export async function getOrganizationConfigurations(
  organizationId: string
): Promise<ConfigurationRecord[]> {
  const encodedId = encodeURIComponent(organizationId);
  const response = await fetchWithErrorHandling(`/organizations/${encodedId}/config`);
  return response.configs;
}

/**
 * Fetches a specific configuration type for an organization
 * @param organizationId The ID of the organization
 * @param configType The configuration type to fetch
 * @returns Promise resolving to the configuration record
 */
export async function getOrganizationConfigurationType(
  organizationId: string,
  configType: OrganizationConfigType
): Promise<ConfigurationRecord> {
  const encodedId = encodeURIComponent(organizationId);
  const encodedType = encodeURIComponent(configType);
  const response = await fetchWithErrorHandling(
    `/organizations/${encodedId}/config/${encodedType}`
  );
  return response.config;
}

/**
 * Updates a specific configuration type for an organization
 * @param organizationId The ID of the organization
 * @param configType The configuration type to update
 * @param data The configuration data to update
 * @returns Promise resolving to the update response
 */
export async function updateOrganizationConfiguration(
  organizationId: string,
  configType: OrganizationConfigType,
  data: Partial<ConfigurationRecord>
): Promise<ConfigurationUpdateResponse> {
  // Remove empty values from the update data
  const cleanedData = removeEmptyValues(data);
  
  const encodedId = encodeURIComponent(organizationId);
  const encodedType = encodeURIComponent(configType);
  
  return await fetchWithErrorHandling(`/organizations/${encodedId}/config/${encodedType}`, {
    method: 'PUT',
    body: JSON.stringify(cleanedData),
  });
}