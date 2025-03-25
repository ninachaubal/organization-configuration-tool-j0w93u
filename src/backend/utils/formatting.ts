import { ConfigurationRecord, BuyTab, ProfileField } from '../types/configuration';
import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';
import { Organization } from '../models/Organization';

/**
 * Formats organization data for display in the UI
 * @param organization The organization data to format
 * @returns Formatted organization data
 */
export function formatOrganizationForDisplay(organization: Organization): Organization {
  return {
    ...organization,
    // Returning a copy of the organization without modifications
    // This function serves as a standardization point if we need display formatting in the future
  };
}

/**
 * Formats configuration data for display in the UI
 * @param config The configuration data to format
 * @returns Formatted configuration data
 */
export function formatConfigurationForDisplay(config: ConfigurationRecord): ConfigurationRecord {
  const formattedConfig = { ...config };
  
  // Format date fields
  if (config.__createdAt) {
    formattedConfig.__createdAt = formatDateForDisplay(config.__createdAt);
  }
  
  if (config.__updatedAt) {
    formattedConfig.__updatedAt = formatDateForDisplay(config.__updatedAt);
  }
  
  // Format specific fields based on configuration type
  switch (config.OrganizationConfigType) {
    case OrganizationConfigType.ORGANIZATION_CONFIG:
      // TypeScript will narrow the type here
      if ('BuyTabs' in config && config.BuyTabs) {
        (formattedConfig as any).BuyTabs = formatBuyTabsForDisplay(config.BuyTabs);
      }
      
      if ('Profile' in config && config.Profile) {
        (formattedConfig as any).Profile = formatProfileFieldsForDisplay(config.Profile);
      }
      break;
      
    case OrganizationConfigType.CLIENT_CONFIG:
      // Format CLIENT_CONFIG specific fields if needed
      break;
      
    case OrganizationConfigType.CLIENT_CONFIG_IOS:
      // Format CLIENT_CONFIG_IOS specific fields if needed
      break;
      
    case OrganizationConfigType.CLIENT_CONFIG_ANDROID:
      // Format CLIENT_CONFIG_ANDROID specific fields if needed
      break;
  }
  
  return formattedConfig;
}

/**
 * Formats BuyTabs array for display in the UI
 * @param buyTabs The BuyTabs array to format
 * @returns Formatted BuyTabs array
 */
export function formatBuyTabsForDisplay(buyTabs: BuyTab[] | undefined): BuyTab[] | undefined {
  if (!buyTabs) return undefined;
  
  return buyTabs.map(tab => ({
    ...tab,
    // Ensure all required fields have values
    Label: tab.Label,
    Slug: tab.Slug,
    Type: tab.Type,
    GenreCode: tab.GenreCode,
  }));
}

/**
 * Formats Profile fields array for display in the UI
 * @param profileFields The Profile fields array to format
 * @returns Formatted Profile fields array
 */
export function formatProfileFieldsForDisplay(profileFields: ProfileField[] | undefined): ProfileField[] | undefined {
  if (!profileFields) return undefined;
  
  return profileFields.map(field => ({
    ...field,
    // Ensure boolean fields have consistent values (default to false if undefined)
    IsEditable: field.IsEditable ?? false,
    IsSSOUserEditable: field.IsSSOUserEditable ?? false,
    IsRequired: field.IsRequired ?? false,
  }));
}

/**
 * Formats date strings for display in the UI
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export function formatDateForDisplay(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined;
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    // If date parsing fails, return the original string
    return dateString;
  }
}

/**
 * Formats configuration data for storage in the database
 * @param config The configuration data to format for database storage
 * @returns Database-ready configuration data
 */
export function formatConfigurationForDatabase(config: Partial<ConfigurationRecord>): Partial<ConfigurationRecord> {
  // Create a copy of the config object
  const dbConfig = { ...config };
  
  // Add metadata
  dbConfig.__updatedAt = new Date().toISOString();
  
  // Note: In a real implementation, we would add the current user
  // dbConfig.__updatedBy = getCurrentUser();
  
  // Remove empty fields to avoid storing them in the database
  return removeEmptyFields(dbConfig);
}

/**
 * Formats a list of organizations for API response
 * @param organizations The organizations to format
 * @returns API response with organizations list
 */
export function formatOrganizationListForResponse(organizations: Organization[]): { organizations: Organization[] } {
  return {
    organizations: organizations.map(org => formatOrganizationForDisplay(org)),
  };
}

/**
 * Formats configuration data for API response
 * @param config The configuration data to format
 * @returns API response with configuration data
 */
export function formatConfigurationForResponse(config: ConfigurationRecord): { config: ConfigurationRecord } {
  return {
    config: formatConfigurationForDisplay(config),
  };
}

/**
 * Removes empty fields (undefined, null, or empty string) from an object
 * @param obj The object to remove empty fields from
 * @returns Object with empty fields removed
 */
export function removeEmptyFields<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    // Skip undefined, null, and empty string values
    if (value === undefined || value === null || value === '') {
      return;
    }
    
    // Keep boolean false values and number 0 values (they are not "empty")
    if (value === false || value === 0) {
      result[key] = value;
      return;
    }
    
    // Handle arrays by filtering out empty items
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return; // Skip empty arrays
      }
      
      // For arrays of objects, remove empty fields from each object
      const filteredArray = value.filter(item => {
        if (item === undefined || item === null) return false;
        if (typeof item === 'object') {
          const cleaned = removeEmptyFields(item);
          return Object.keys(cleaned).length > 0;
        }
        return true;
      }).map(item => {
        return typeof item === 'object' && item !== null 
          ? removeEmptyFields(item) 
          : item;
      });
      
      if (filteredArray.length === 0) {
        return; // Skip arrays that become empty after filtering
      }
      
      result[key] = filteredArray;
      return;
    }
    
    // Handle objects by recursively removing empty fields
    if (value !== null && typeof value === 'object') {
      const cleanedObj = removeEmptyFields(value);
      if (Object.keys(cleanedObj).length > 0) {
        result[key] = cleanedObj;
      }
      return;
    }
    
    // Include non-empty primitive values
    result[key] = value;
  });
  
  return result as T;
}