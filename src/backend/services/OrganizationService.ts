import { z } from 'zod'; // ^3.22.4
import { ElectroDBAdapter } from '../data/adapters/ElectroDBAdapter';
import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';
import { Organization } from '../models/Organization';
import { ConfigurationService } from './ConfigurationService';
import { AppError, AppErrorCode, HttpStatusCode } from '../types/error';
import { organizationSchema } from '../validation/schemas/organization';

/**
 * Retrieves a list of all organizations with unique names
 * 
 * @returns Promise with array of organizations containing OrganizationId and Name
 */
async function getOrganizations(): Promise<Organization[]> {
  try {
    // Retrieve ORGANIZATION_CONFIG records since they contain the organization name
    const result = await ElectroDBAdapter.scan({
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG
    });

    // Extract OrganizationId and Name from results
    const organizations: Organization[] = result.map((item: any) => ({
      OrganizationId: item.OrganizationId,
      Name: item.Name || item.OrganizationId // Fallback to ID if name not set
    }));

    // Filter for unique OrganizationIds (should not be needed, but just in case)
    const uniqueOrganizations = organizations.filter(
      (org, index, self) =>
        index === self.findIndex((o) => o.OrganizationId === org.OrganizationId)
    );

    // Sort alphabetically by name
    uniqueOrganizations.sort((a, b) => a.Name.localeCompare(b.Name));

    return uniqueOrganizations;
  } catch (err) {
    // ElectroDBAdapter handles database errors, so we just propagate them
    throw err;
  }
}

/**
 * Retrieves a specific organization by its ID
 * 
 * @param organizationId - The unique identifier for the organization
 * @returns Promise with the organization object
 * @throws AppError with NOT_FOUND code if organization doesn't exist
 */
async function getOrganizationById(organizationId: string): Promise<Organization> {
  if (!organizationId) {
    throw new AppError(
      AppErrorCode.VALIDATION_ERROR,
      'Organization ID is required',
      HttpStatusCode.BAD_REQUEST
    );
  }

  try {
    // Get the ORGANIZATION_CONFIG record for this organization
    const result = await ElectroDBAdapter.get({
      OrganizationId: organizationId,
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG
    });

    return {
      OrganizationId: result.OrganizationId,
      Name: result.Name || result.OrganizationId
    };
  } catch (err) {
    // If the specific error is NOT_FOUND, enhance it with a more descriptive message
    if (err instanceof AppError && err.code === AppErrorCode.NOT_FOUND) {
      throw new AppError(
        AppErrorCode.NOT_FOUND,
        `Organization with ID ${organizationId} not found`,
        HttpStatusCode.NOT_FOUND
      );
    }
    // Otherwise propagate the original error
    throw err;
  }
}

/**
 * Retrieves organizations that match a specific name (case-insensitive)
 * 
 * @param name - The name or partial name to search for
 * @returns Promise with array of matching organizations
 */
async function getOrganizationsByName(name: string): Promise<Organization[]> {
  if (!name) {
    throw new AppError(
      AppErrorCode.VALIDATION_ERROR,
      'Name is required for search',
      HttpStatusCode.BAD_REQUEST
    );
  }

  try {
    // Get all organization records
    const result = await ElectroDBAdapter.scan({
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG
    });

    // Filter by name (case-insensitive)
    const searchTerm = name.toLowerCase();
    const matchingOrganizations: Organization[] = result
      .filter((item: any) => {
        const orgName = (item.Name || '').toLowerCase();
        return orgName.includes(searchTerm);
      })
      .map((item: any) => ({
        OrganizationId: item.OrganizationId,
        Name: item.Name || item.OrganizationId
      }));

    // Sort alphabetically by name
    matchingOrganizations.sort((a, b) => a.Name.localeCompare(b.Name));

    return matchingOrganizations;
  } catch (err) {
    // Propagate the error
    throw err;
  }
}

/**
 * Checks if an organization with the given ID already exists
 * 
 * @param organizationId - The ID to check
 * @returns Promise with boolean indicating existence
 */
async function organizationExists(organizationId: string): Promise<boolean> {
  if (!organizationId) {
    throw new AppError(
      AppErrorCode.VALIDATION_ERROR,
      'Organization ID is required',
      HttpStatusCode.BAD_REQUEST
    );
  }

  try {
    // Try to get the organization config
    await ElectroDBAdapter.get({
      OrganizationId: organizationId,
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG
    });

    // If we reach here, the organization exists
    return true;
  } catch (err) {
    // If error is NOT_FOUND, the organization doesn't exist
    if (err instanceof AppError && err.code === AppErrorCode.NOT_FOUND) {
      return false;
    }
    // For any other error, propagate it
    throw err;
  }
}

/**
 * Creates a new organization with default configurations for all types
 * 
 * @param organizationId - The unique identifier for the new organization
 * @param name - The display name for the new organization
 * @param createdBy - The identifier of the user creating the organization
 * @returns Promise with the created organization
 * @throws AppError if validation fails or organization already exists
 */
async function createOrganization(
  organizationId: string,
  name: string,
  createdBy: string
): Promise<Organization> {
  try {
    // Validate input data
    const validatedData = validateOrganizationData({ 
      OrganizationId: organizationId, 
      Name: name 
    });

    // Check if organization already exists
    const exists = await organizationExists(organizationId);
    if (exists) {
      throw new AppError(
        AppErrorCode.DUPLICATE_ENTITY,
        `Organization with ID ${organizationId} already exists`,
        HttpStatusCode.CONFLICT
      );
    }

    // Create configuration records for all types
    await ConfigurationService.createConfigurationRecord(
      organizationId,
      OrganizationConfigType.ORGANIZATION_CONFIG,
      { Name: validatedData.Name },
      createdBy
    );

    await ConfigurationService.createConfigurationRecord(
      organizationId,
      OrganizationConfigType.CLIENT_CONFIG,
      {},
      createdBy
    );

    await ConfigurationService.createConfigurationRecord(
      organizationId,
      OrganizationConfigType.CLIENT_CONFIG_IOS,
      {},
      createdBy
    );

    await ConfigurationService.createConfigurationRecord(
      organizationId,
      OrganizationConfigType.CLIENT_CONFIG_ANDROID,
      {},
      createdBy
    );

    // Return the created organization
    return {
      OrganizationId: validatedData.OrganizationId,
      Name: validatedData.Name
    };
  } catch (err) {
    // If the error is database related and we've already created some records,
    // we should ideally clean up, but for simplicity, we're just propagating the error
    // A more robust implementation would include rollback logic
    throw err;
  }
}

/**
 * Validates organization data against the organization schema
 * 
 * @param data - The data to validate
 * @returns Validated data if validation passes
 * @throws AppError with validation details if validation fails
 */
function validateOrganizationData(data: Record<string, any>): Record<string, any> {
  try {
    // Validate using the organization schema
    return organizationSchema.parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new AppError(
        AppErrorCode.VALIDATION_ERROR,
        'Invalid organization data',
        HttpStatusCode.BAD_REQUEST,
        { details: err.format() }
      );
    }
    throw err;
  }
}

/**
 * Service for managing organization data in the multi-tenant application
 */
export const OrganizationService = {
  getOrganizations,
  getOrganizationById,
  getOrganizationsByName,
  organizationExists,
  createOrganization
};