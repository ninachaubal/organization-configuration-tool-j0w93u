import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ConfigurationTabs from '../../components/ConfigurationTabs';
import { mockOrganizationConfigurations } from '../../__mocks__/data';
import { OrganizationConfigType } from '../../../backend/models/enums/OrganizationConfigType';

describe('ConfigurationTabs', () => {
  it('renders all configuration type tabs', () => {
    // Create an array of configuration records
    const configData = Object.values(mockOrganizationConfigurations.org1);
    
    render(
      <ConfigurationTabs
        configData={configData}
        activeTab={OrganizationConfigType.ORGANIZATION_CONFIG}
        onTabChange={() => {}}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Assert that all config type tabs are rendered
    expect(screen.getByTestId('tab-organization-config')).toBeInTheDocument();
    expect(screen.getByTestId('tab-client-config')).toBeInTheDocument();
    expect(screen.getByTestId('tab-client-config-ios')).toBeInTheDocument();
    expect(screen.getByTestId('tab-client-config-android')).toBeInTheDocument();
    
    // Check that tab labels are formatted correctly using formatEnumValue
    expect(screen.getByTestId('tab-organization-config')).toHaveTextContent('Organization Config');
    expect(screen.getByTestId('tab-client-config')).toHaveTextContent('Client Config');
    expect(screen.getByTestId('tab-client-config-ios')).toHaveTextContent('Client Config Ios');
    expect(screen.getByTestId('tab-client-config-android')).toHaveTextContent('Client Config Android');
  });

  it('displays the active tab content correctly', () => {
    const configData = Object.values(mockOrganizationConfigurations.org1);
    
    render(
      <ConfigurationTabs
        configData={configData}
        activeTab={OrganizationConfigType.ORGANIZATION_CONFIG}
        onTabChange={() => {}}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // The ConfigurationDisplay component should be rendered inside the active tab content
    const editButton = screen.getByTestId('edit-button');
    expect(editButton).toBeInTheDocument();
    
    // Check that organization-specific data from ORGANIZATION_CONFIG is visible
    expect(screen.getByText('Acme Sports')).toBeInTheDocument();
    
    // Check that content from other config types is not visible
    expect(screen.queryByText('iOS Store Link')).not.toBeInTheDocument();
    expect(screen.queryByText('Android Store Link')).not.toBeInTheDocument();
  });

  it('calls onTabChange when a tab is clicked', () => {
    const configData = Object.values(mockOrganizationConfigurations.org1);
    const onTabChange = vi.fn();
    
    render(
      <ConfigurationTabs
        configData={configData}
        activeTab={OrganizationConfigType.ORGANIZATION_CONFIG}
        onTabChange={onTabChange}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Click on a different tab
    fireEvent.click(screen.getByTestId('tab-client-config'));
    
    // Check that onTabChange was called with the correct parameter
    expect(onTabChange).toHaveBeenCalledWith(OrganizationConfigType.CLIENT_CONFIG);
  });

  it('passes onEditClick to ConfigurationDisplay', () => {
    const configData = Object.values(mockOrganizationConfigurations.org1);
    const onEditClick = vi.fn();
    
    render(
      <ConfigurationTabs
        configData={configData}
        activeTab={OrganizationConfigType.ORGANIZATION_CONFIG}
        onTabChange={() => {}}
        onEditClick={onEditClick}
        isLoading={false}
      />
    );
    
    // Find and click the edit button in the active tab content
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Check that onEditClick was called
    expect(onEditClick).toHaveBeenCalled();
  });

  it('renders loading state correctly', () => {
    render(
      <ConfigurationTabs
        configData={[]}
        activeTab={OrganizationConfigType.ORGANIZATION_CONFIG}
        onTabChange={() => {}}
        onEditClick={() => {}}
        isLoading={true}
      />
    );
    
    // Check that loading indicator is visible
    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
  });

  it('handles null or empty configuration data gracefully', () => {
    render(
      <ConfigurationTabs
        configData={null}
        activeTab={OrganizationConfigType.ORGANIZATION_CONFIG}
        onTabChange={() => {}}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Check for empty state message
    expect(screen.getByText('No Organization Config found.')).toBeInTheDocument();
  });

  it('finds the active configuration based on activeTab', () => {
    const configData = Object.values(mockOrganizationConfigurations.org1);
    
    const { rerender } = render(
      <ConfigurationTabs
        configData={configData}
        activeTab={OrganizationConfigType.CLIENT_CONFIG}
        onTabChange={() => {}}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Check for CLIENT_CONFIG specific content
    expect(screen.getByText('Client Config')).toBeInTheDocument();
    expect(screen.getByText('test-amplitude-key')).toBeInTheDocument();
    
    // Change the active tab to CLIENT_CONFIG_IOS
    rerender(
      <ConfigurationTabs
        configData={configData}
        activeTab={OrganizationConfigType.CLIENT_CONFIG_IOS}
        onTabChange={() => {}}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Now we should see iOS-specific content
    expect(screen.getByText('iOS Store Link')).toBeInTheDocument();
    expect(screen.getByText('https://apps.apple.com/us/app/acme-rockets/id123456789')).toBeInTheDocument();
  });

  it('maintains tab selection when configuration data changes', () => {
    const configData = Object.values(mockOrganizationConfigurations.org1);
    
    const { rerender } = render(
      <ConfigurationTabs
        configData={configData}
        activeTab={OrganizationConfigType.CLIENT_CONFIG_ANDROID}
        onTabChange={() => {}}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Check for Android-specific content from org1
    expect(screen.getByText('Android Store Link')).toBeInTheDocument();
    expect(screen.getByText('https://play.google.com/store/apps/details?id=com.acme.rockets')).toBeInTheDocument();
    
    // Update the configuration data to org2
    const updatedConfigData = Object.values(mockOrganizationConfigurations.org2);
    
    rerender(
      <ConfigurationTabs
        configData={updatedConfigData}
        activeTab={OrganizationConfigType.CLIENT_CONFIG_ANDROID}
        onTabChange={() => {}}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Should still show Android content but with updated data from org2
    expect(screen.getByText('Android Store Link')).toBeInTheDocument();
    expect(screen.getByText('https://play.google.com/store/apps/details?id=com.metro.tigers')).toBeInTheDocument();
  });
});