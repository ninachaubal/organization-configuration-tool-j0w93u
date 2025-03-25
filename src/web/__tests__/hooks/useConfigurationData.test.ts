import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks'; // ^8.0.1
import { waitFor } from '@testing-library/react'; // ^14.0.0
import { useConfigurationData } from '../../hooks/useConfigurationData';
import { OrganizationConfigType } from '../../../backend/models/enums/OrganizationConfigType';
import { mockOrganizationConfigurations } from '../../__mocks__/data';
import { 
  getOrganizationConfigurations, 
  updateOrganizationConfiguration 
} from '../../lib/api-client';

// Mock the API functions
jest.mock('../../lib/api-client', () => ({
  getOrganizationConfigurations: jest.fn(),
  updateOrganizationConfiguration: jest.fn(),
}));

describe('useConfigurationData', () => {
  beforeEach(() => {
    // Reset mock implementation and calls before each test
    jest.resetAllMocks();
  });

  afterEach(() => {
    // Clear all mocks to prevent test interference
    jest.clearAllMocks();
  });

  it('should return initial state with null values when no organizationId is provided', () => {
    const { result } = renderHook(() => useConfigurationData(null));
    
    expect(result.current.configurations).toBeNull();
    expect(result.current.activeConfiguration).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.activeConfigType).toBe(OrganizationConfigType.ORGANIZATION_CONFIG);
  });

  it('should fetch configurations when organizationId is provided', async () => {
    const organizationId = 'org1';
    const mockConfigs = Object.values(mockOrganizationConfigurations.org1);
    
    (getOrganizationConfigurations as jest.Mock).mockResolvedValue(mockConfigs);
    
    const { result } = renderHook(() => useConfigurationData(organizationId));
    
    // Wait for the async operation to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(getOrganizationConfigurations).toHaveBeenCalledWith(organizationId);
    expect(result.current.configurations).toEqual(mockConfigs);
    expect(result.current.activeConfigType).toBe(OrganizationConfigType.ORGANIZATION_CONFIG);
    expect(result.current.activeConfiguration).toEqual(mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG]);
  });

  it('should set loading state while fetching data', async () => {
    const organizationId = 'org1';
    const mockConfigs = Object.values(mockOrganizationConfigurations.org1);
    
    // Create a delayed promise to test loading state
    (getOrganizationConfigurations as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(mockConfigs), 100);
      });
    });
    
    const { result } = renderHook(() => useConfigurationData(organizationId));
    
    // Should be in loading state immediately
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the async operation to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.configurations).toEqual(mockConfigs);
  });

  it('should handle errors when fetching configurations', async () => {
    const organizationId = 'org1';
    const testError = new Error('Failed to fetch');
    
    (getOrganizationConfigurations as jest.Mock).mockRejectedValue(testError);
    
    const { result } = renderHook(() => useConfigurationData(organizationId));
    
    // Wait for the async operation to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.error).toEqual(testError);
    expect(result.current.configurations).toBeNull();
  });

  it('should set active configuration type correctly', async () => {
    const organizationId = 'org1';
    const mockConfigs = Object.values(mockOrganizationConfigurations.org1);
    
    (getOrganizationConfigurations as jest.Mock).mockResolvedValue(mockConfigs);
    
    const { result } = renderHook(() => useConfigurationData(organizationId));
    
    // Wait for the async operation to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Default active config type should be ORGANIZATION_CONFIG
    expect(result.current.activeConfigType).toBe(OrganizationConfigType.ORGANIZATION_CONFIG);
    expect(result.current.activeConfiguration).toEqual(mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG]);
    
    // Change active config type
    act(() => {
      result.current.setActiveConfigType(OrganizationConfigType.CLIENT_CONFIG);
    });
    
    expect(result.current.activeConfigType).toBe(OrganizationConfigType.CLIENT_CONFIG);
    expect(result.current.activeConfiguration).toEqual(mockOrganizationConfigurations.org1[OrganizationConfigType.CLIENT_CONFIG]);
  });

  it('should update configuration successfully', async () => {
    const organizationId = 'org1';
    const mockConfigs = Object.values(mockOrganizationConfigurations.org1);
    const updatedConfig = {
      ...mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG],
      Name: 'Updated Acme Sports'
    };
    
    (getOrganizationConfigurations as jest.Mock).mockResolvedValue(mockConfigs);
    (updateOrganizationConfiguration as jest.Mock).mockResolvedValue({
      success: true,
      config: updatedConfig
    });
    
    const { result } = renderHook(() => useConfigurationData(organizationId));
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Update configuration
    await act(async () => {
      await result.current.updateConfiguration(
        OrganizationConfigType.ORGANIZATION_CONFIG,
        { Name: 'Updated Acme Sports' }
      );
    });
    
    // Verify updateOrganizationConfiguration was called with correct parameters
    expect(updateOrganizationConfiguration).toHaveBeenCalledWith(
      organizationId,
      OrganizationConfigType.ORGANIZATION_CONFIG,
      { Name: 'Updated Acme Sports' }
    );
    
    // Verify the local state was updated
    const updatedConfigInState = result.current.configurations?.find(
      config => config.OrganizationConfigType === OrganizationConfigType.ORGANIZATION_CONFIG
    );
    expect(updatedConfigInState).toEqual(updatedConfig);
  });

  it('should handle errors when updating configuration', async () => {
    const organizationId = 'org1';
    const mockConfigs = Object.values(mockOrganizationConfigurations.org1);
    const testError = new Error('Update failed');
    
    (getOrganizationConfigurations as jest.Mock).mockResolvedValue(mockConfigs);
    (updateOrganizationConfiguration as jest.Mock).mockRejectedValue(testError);
    
    const { result } = renderHook(() => useConfigurationData(organizationId));
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Try to update configuration
    let error;
    await act(async () => {
      try {
        await result.current.updateConfiguration(
          OrganizationConfigType.ORGANIZATION_CONFIG,
          { Name: 'Updated Acme Sports' }
        );
      } catch (e) {
        error = e;
      }
    });
    
    // Verify the error was thrown
    expect(error).toEqual(testError);
  });

  it('should refetch configurations when refetch function is called', async () => {
    const organizationId = 'org1';
    const mockConfigs = Object.values(mockOrganizationConfigurations.org1);
    
    (getOrganizationConfigurations as jest.Mock).mockResolvedValue(mockConfigs);
    
    const { result } = renderHook(() => useConfigurationData(organizationId));
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Clear the mock calls to check if it's called again
    (getOrganizationConfigurations as jest.Mock).mockClear();
    
    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });
    
    // Verify getOrganizationConfigurations was called again
    expect(getOrganizationConfigurations).toHaveBeenCalledWith(organizationId);
  });
});