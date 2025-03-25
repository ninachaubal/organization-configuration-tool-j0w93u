import { useState, useEffect, useCallback, useMemo } from 'react'; // ^18.0.0
import { ConfigurationRecord } from '../types/configuration';
import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';
import { getOrganizationConfigurations, updateOrganizationConfiguration } from '../lib/api-client';

/**
 * Interface defining the return type of the useConfigurationData hook
 */
export interface UseConfigurationDataReturn {
  /** Array of all configuration records for the selected organization, or null if not loaded */
  configurations: ConfigurationRecord[] | null;
  /** Currently active configuration type tab */
  activeConfigType: OrganizationConfigType;
  /** The configuration record corresponding to the active tab, or null if not found */
  activeConfiguration: ConfigurationRecord | null;
  /** Whether configuration data is currently being loaded */
  isLoading: boolean;
  /** Error object if data fetching failed, or null if successful */
  error: Error | null;
  /** Function to change the active configuration type tab */
  setActiveConfigType: (type: OrganizationConfigType) => void;
  /** Function to update a specific configuration type with new data */
  updateConfiguration: (type: OrganizationConfigType, data: Partial<ConfigurationRecord>) => Promise<void>;
  /** Function to manually refetch configuration data */
  refetch: () => Promise<void>;
}

/**
 * Custom hook that fetches and manages organization configuration data
 * 
 * @param organizationId - The ID of the organization to fetch configurations for
 * @returns Object containing configuration data, loading state, error state, and helper functions
 */
export function useConfigurationData(organizationId: string | null | undefined): UseConfigurationDataReturn {
  // State for storing all configuration records
  const [configurations, setConfigurations] = useState<ConfigurationRecord[] | null>(null);
  // Loading state for async operations
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Error state for handling failed requests
  const [error, setError] = useState<Error | null>(null);
  
  // State for tracking which configuration type tab is active
  const [activeConfigType, setActiveConfigType] = useState<OrganizationConfigType>(
    OrganizationConfigType.ORGANIZATION_CONFIG
  );
  
  /**
   * Fetches all configuration types for the selected organization
   */
  const fetchConfigurations = useCallback(async () => {
    // Reset state if no organization is selected
    if (!organizationId) {
      setConfigurations(null);
      setError(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const configs = await getOrganizationConfigurations(organizationId);
      setConfigurations(configs);
    } catch (err) {
      console.error('Error fetching configurations:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch configurations'));
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);
  
  /**
   * Updates a specific configuration type with new data
   * 
   * @param type - The configuration type to update
   * @param data - The new data to apply to the configuration
   * @throws Error if the update fails or organization ID is missing
   */
  const updateConfiguration = useCallback(async (
    type: OrganizationConfigType,
    data: Partial<ConfigurationRecord>
  ) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }
    
    try {
      const response = await updateOrganizationConfiguration(
        organizationId,
        type,
        data
      );
      
      if (response.success && configurations) {
        // Update the local state with the updated configuration
        const updatedConfigs = configurations.map(config => 
          config.OrganizationConfigType === type ? response.config : config
        );
        setConfigurations(updatedConfigs);
      } else if (!response.success) {
        throw new Error(response.error || 'Failed to update configuration');
      }
    } catch (err) {
      console.error('Error updating configuration:', err);
      throw err instanceof Error ? err : new Error('An unknown error occurred');
    }
  }, [organizationId, configurations]);
  
  // Fetch configurations when organizationId changes
  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);
  
  /**
   * Gets the active configuration record based on the selected type
   */
  const activeConfiguration = useMemo(() => {
    if (!configurations) return null;
    return configurations.find(config => config.OrganizationConfigType === activeConfigType) || null;
  }, [configurations, activeConfigType]);
  
  // Return the hook's interface
  return {
    configurations,
    activeConfigType,
    activeConfiguration,
    isLoading,
    error,
    setActiveConfigType,
    updateConfiguration,
    refetch: fetchConfigurations
  };
}