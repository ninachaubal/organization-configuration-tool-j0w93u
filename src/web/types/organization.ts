import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';
import { z } from 'zod';

/**
 * Represents an organization entity with basic identification properties
 */
export interface Organization {
  /**
   * Unique identifier for the organization
   */
  OrganizationId: string;
  
  /**
   * Display name of the organization
   */
  Name: string;
}

/**
 * Response structure for the API endpoint that returns a list of organizations
 */
export interface OrganizationsResponse {
  /**
   * Array of organization objects
   */
  organizations: Organization[];
}

/**
 * Response structure for the API endpoint that creates a new organization
 */
export interface OrganizationCreationResponse {
  /**
   * Indicates if the creation operation was successful
   */
  success: boolean;
  
  /**
   * The created organization object (only present on success)
   */
  organization?: Organization;
  
  /**
   * Error message in case of failure
   */
  error?: string;
}

/**
 * Props for the OrganizationSelector component
 */
export interface OrganizationSelectorProps {
  /**
   * Array of available organizations to select from
   */
  organizations: Organization[];
  
  /**
   * Currently selected organization, or null if none selected
   */
  selectedOrg: Organization | null;
  
  /**
   * Callback function invoked when an organization is selected
   */
  onSelect: (organizationId: string) => void;
  
  /**
   * Flag indicating whether the organizations are currently loading
   */
  isLoading: boolean;
}

/**
 * Return type for the useOrganizations hook
 */
export interface UseOrganizationsReturn {
  /**
   * Array of organizations retrieved from the API
   */
  organizations: Organization[];
  
  /**
   * Flag indicating whether the organizations are currently loading
   */
  isLoading: boolean;
  
  /**
   * Error object if the fetch operation failed, or null if successful
   */
  error: Error | null;
  
  /**
   * Function to manually refetch the organizations
   */
  refetch: () => Promise<void>;
}

/**
 * Zod schema for validating organization data
 */
export const organizationSchema = z.object({
  OrganizationId: z.string().min(1, "Organization ID is required"),
  Name: z.string().min(1, "Name is required")
});