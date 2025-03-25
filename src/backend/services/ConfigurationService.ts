import { z } from 'zod'; // ^3.0.0
import { ElectroDBAdapter } from '../data/adapters/ElectroDBAdapter';
import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';
import { ConfigurationRecord, createDefaultConfiguration } from '../models/ConfigurationRecord';
import { AppError, AppErrorCode, HttpStatusCode } from '../types/error';
import { organizationConfigSchema } from '../validation/schemas/organizationConfig';
import { clientConfigSchema } from '../validation/schemas/clientConfig';
import { clientConfigIOSSchema } from '../validation/schemas/clientConfigIOS';
import { clientConfigAndroidSchema } from '../validation/schemas/clientConfigAndroid';

/**
 * Retrieves all configuration records for a specific organization
 * 
 * @param organizationId - The unique identifier for the organization
 * @returns Array of configuration records for the organization
 */
async function getConfigurationsByOrganizationId(organizationId: string): Promise<ConfigurationRecord[]> {
  if (!organizationId) {
    throw new AppError(
      AppErrorCode.VALIDATION_ERROR,
      'Organization ID is required',
      HttpStatusCode.BAD_REQUEST
    );
  }

  try {
    const result = await ElectroDBAdapter.query({
      OrganizationId: organizationId
    });

    return result as ConfigurationRecord[];
  } catch (error) {
    throw error; // ElectroDBAdapter already handles errors
  }
}

/**
 * Retrieves a specific configuration type for an organization
 * 
 * @param organizationId - The unique identifier for the organization
 * @param configType - The type of configuration to retrieve
 * @returns The configuration record of the specified type
 */
async function getConfigurationByType(
  organizationId: string,
  configType: OrganizationConfigType
): Promise<ConfigurationRecord> {
  if (!organizationId) {
    throw new AppError(
      AppErrorCode.VALIDATION_ERROR,
      'Organization ID is required',
      HttpStatusCode.BAD_REQUEST
    );
  }

  try {
    const result = await ElectroDBAdapter.get({
      OrganizationId: organizationId,
      OrganizationConfigType: configType
    });

    if (!result) {
      throw new AppError(
        AppErrorCode.NOT_FOUND,
        `Configuration of type ${configType} for organization ${organizationId} not found`,
        HttpStatusCode.NOT_FOUND
      );
    }

    return result as ConfigurationRecord;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw error; // ElectroDBAdapter already handles other errors
  }
}

/**
 * Updates a configuration record with new values
 * 
 * @param organizationId - The unique identifier for the organization
 * @param configType - The type of configuration to update
 * @param data - The new data to apply to the configuration
 * @param updatedBy - Identifier of the user making the update
 * @returns The updated configuration record
 */
async function updateConfiguration(
  organizationId: string,
  configType: OrganizationConfigType,
  data: Record<string, any>,
  updatedBy: string
): Promise<ConfigurationRecord> {
  if (!organizationId) {
    throw new AppError(
      AppErrorCode.VALIDATION_ERROR,
      'Organization ID is required',
      HttpStatusCode.BAD_REQUEST
    );
  }

  try {
    // Validate data against appropriate schema
    const validatedData = validateConfigurationData(configType, {
      ...data,
      OrganizationId: organizationId,
      OrganizationConfigType: configType,
    });

    // Add metadata
    const updateData = {
      ...validatedData,
      __updatedAt: new Date().toISOString(),
      __updatedBy: updatedBy,
    };

    // Remove empty fields to avoid setting them in the database
    const filteredData = removeEmptyFields(updateData);

    // Update the record
    const result = await ElectroDBAdapter.update({
      OrganizationId: organizationId,
      OrganizationConfigType: configType,
      ...filteredData
    });

    return result as ConfigurationRecord;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        AppErrorCode.VALIDATION_ERROR,
        'Invalid configuration data',
        HttpStatusCode.BAD_REQUEST,
        { details: error.format() }
      );
    }
    throw error; // ElectroDBAdapter already handles other errors
  }
}

/**
 * Creates a new configuration record for an organization
 * 
 * @param organizationId - The unique identifier for the organization
 * @param configType - The type of configuration to create
 * @param data - Additional data to include in the configuration
 * @param createdBy - Identifier of the user creating the record
 * @returns The newly created configuration record
 */
async function createConfigurationRecord(
  organizationId: string,
  configType: OrganizationConfigType,
  data: Record<string, any>,
  createdBy: string
): Promise<ConfigurationRecord> {
  if (!organizationId) {
    throw new AppError(
      AppErrorCode.VALIDATION_ERROR,
      'Organization ID is required',
      HttpStatusCode.BAD_REQUEST
    );
  }

  try {
    // Create default configuration
    const defaultConfig = createDefaultConfiguration(organizationId, configType);
    
    // Merge with provided data
    const mergedData = {
      ...defaultConfig,
      ...data,
      __createdAt: new Date().toISOString(),
      __updatedAt: new Date().toISOString(),
      __updatedBy: createdBy,
    };

    // Validate merged data
    const validatedData = validateConfigurationData(configType, mergedData);

    // Create the record
    const result = await ElectroDBAdapter.put(validatedData);

    return result as ConfigurationRecord;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        AppErrorCode.VALIDATION_ERROR,
        'Invalid configuration data',
        HttpStatusCode.BAD_REQUEST,
        { details: error.format() }
      );
    }
    throw error; // ElectroDBAdapter already handles other errors
  }
}

/**
 * Validates configuration data against the appropriate schema
 * 
 * @param configType - The type of configuration being validated
 * @param data - The data to validate
 * @returns The validated data
 * @throws AppError if validation fails
 */
function validateConfigurationData(
  configType: OrganizationConfigType,
  data: Record<string, any>
): Record<string, any> {
  let schema;

  // Select the appropriate validation schema based on config type
  switch (configType) {
    case OrganizationConfigType.ORGANIZATION_CONFIG:
      schema = organizationConfigSchema;
      break;
    case OrganizationConfigType.CLIENT_CONFIG:
      schema = clientConfigSchema;
      break;
    case OrganizationConfigType.CLIENT_CONFIG_IOS:
      schema = clientConfigIOSSchema;
      break;
    case OrganizationConfigType.CLIENT_CONFIG_ANDROID:
      schema = clientConfigAndroidSchema;
      break;
    default:
      throw new AppError(
        AppErrorCode.VALIDATION_ERROR,
        `Unsupported configuration type: ${configType}`,
        HttpStatusCode.BAD_REQUEST
      );
  }

  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        AppErrorCode.VALIDATION_ERROR,
        'Invalid configuration data',
        HttpStatusCode.BAD_REQUEST,
        { details: error.format() }
      );
    }
    throw error;
  }
}

/**
 * Removes empty fields from an update payload
 * 
 * @param data - The data object to filter
 * @returns A new object with empty fields removed
 */
function removeEmptyFields(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in data) {
    if (
      data[key] !== null && 
      data[key] !== undefined && 
      data[key] !== ''
    ) {
      result[key] = data[key];
    }
  }
  
  return result;
}

/**
 * Service for managing organization configuration data
 */
export const ConfigurationService = {
  getConfigurationsByOrganizationId,
  getConfigurationByType,
  updateConfiguration,
  createConfigurationRecord,
};