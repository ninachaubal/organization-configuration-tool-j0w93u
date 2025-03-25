import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest'; // v0.34.4
import ConfigurationDisplay from '../../components/ConfigurationDisplay';
import { mockOrganizationConfigurations } from '../../__mocks__/data';
import { OrganizationConfigType } from '../../../backend/models/enums/OrganizationConfigType';

describe('ConfigurationDisplay', () => {
  it('renders loading state correctly', () => {
    render(
      <ConfigurationDisplay
        configData={mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG]}
        onEditClick={() => {}}
        isLoading={true}
      />
    );
    
    // Loading indicator should be visible
    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();
    
    // Configuration content should not be visible
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
  });

  it('renders ORGANIZATION_CONFIG fields correctly', () => {
    const config = mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG];
    
    render(
      <ConfigurationDisplay
        configData={config}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Check basic fields
    expect(screen.getByTestId('field-name')).toHaveTextContent('Acme Sports');
    expect(screen.getByTestId('field-team-name')).toHaveTextContent('Acme Rockets');
    expect(screen.getByTestId('field-slug')).toHaveTextContent('acme-rockets');
    expect(screen.getByTestId('field-short-name')).toHaveTextContent('Rockets');
    expect(screen.getByTestId('field-logo-url')).toHaveTextContent('https://example.com/logos/rockets.png');
    expect(screen.getByTestId('field-fan-web-root-url')).toHaveTextContent('https://rockets.example.com');
    expect(screen.getByTestId('field-brand-color')).toHaveTextContent('#FF5733');
    expect(screen.getByTestId('field-external-provider-id')).toHaveTextContent('acme123');
    
    // Check BuyTabs
    expect(screen.getByText('Buy Tabs')).toBeInTheDocument();
    
    // First BuyTab
    expect(screen.getByText(/Label: Season Tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/Slug: season/i)).toBeInTheDocument();
    expect(screen.getByText(/Type: season/i)).toBeInTheDocument();
    
    // Second BuyTab
    expect(screen.getByText(/Label: Single Game/i)).toBeInTheDocument();
    expect(screen.getByText(/Slug: single/i)).toBeInTheDocument();
    expect(screen.getByText(/Type: single/i)).toBeInTheDocument();
    expect(screen.getByText(/GenreCode: BASK/i)).toBeInTheDocument();
    
    // Check Profile fields
    expect(screen.getByText('Profile Fields')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    
    // Check CustomerServiceConfig
    expect(screen.getByText('Customer Service Configuration')).toBeInTheDocument();
    expect(screen.getByTestId('field-customer-service-phone')).toHaveTextContent('555-123-4567');
  });

  it('renders CLIENT_CONFIG fields correctly', () => {
    const config = mockOrganizationConfigurations.org1[OrganizationConfigType.CLIENT_CONFIG];
    
    render(
      <ConfigurationDisplay
        configData={config}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Check API keys
    expect(screen.getByTestId('field-public-amplitude-experiments-key')).toHaveTextContent('test-amplitude-key');
    expect(screen.getByTestId('field-public-segment-write-key')).toHaveTextContent('test-segment-key');
    
    // Check Braze config
    expect(screen.getByText('Braze Configuration')).toBeInTheDocument();
    expect(screen.getByTestId('field-public-key')).toHaveTextContent('test-braze-key');
    expect(screen.getByTestId('field-base-url')).toHaveTextContent('https://sdk.braze.com/api/v3');
    
    // Check OrganizationCourtCash
    expect(screen.getByText('Organization Court Cash')).toBeInTheDocument();
    expect(screen.getByTestId('field-label')).toHaveTextContent('Rocket Cash');
    expect(screen.getByTestId('field-enabled')).toHaveTextContent('Yes');
    
    // Check links
    expect(screen.getByTestId('field-privacy-policy-link')).toHaveTextContent('https://rockets.example.com/privacy');
    expect(screen.getByTestId('field-terms-link')).toHaveTextContent('https://rockets.example.com/terms');
  });

  it('renders CLIENT_CONFIG_IOS fields correctly', () => {
    const config = mockOrganizationConfigurations.org1[OrganizationConfigType.CLIENT_CONFIG_IOS];
    
    render(
      <ConfigurationDisplay
        configData={config}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    expect(screen.getByTestId('field-ios-store-link')).toHaveTextContent('https://apps.apple.com/us/app/acme-rockets/id123456789');
  });

  it('renders CLIENT_CONFIG_ANDROID fields correctly', () => {
    const config = mockOrganizationConfigurations.org1[OrganizationConfigType.CLIENT_CONFIG_ANDROID];
    
    render(
      <ConfigurationDisplay
        configData={config}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    expect(screen.getByTestId('field-android-store-link')).toHaveTextContent('https://play.google.com/store/apps/details?id=com.acme.rockets');
  });

  it('handles missing or null fields gracefully', () => {
    const config = {
      ...mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG],
      Name: null,
      TeamName: undefined,
      BuyTabs: undefined,
    };
    
    render(
      <ConfigurationDisplay
        configData={config}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // The component should render without errors
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    
    // These fields should not be in the document
    expect(screen.queryByTestId('field-name')).not.toBeInTheDocument();
    expect(screen.queryByTestId('field-team-name')).not.toBeInTheDocument();
    expect(screen.queryByText('Buy Tabs')).not.toBeInTheDocument();
  });

  it('calls onEditClick when edit button is clicked', () => {
    const onEditClick = vi.fn();
    const config = mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG];
    
    render(
      <ConfigurationDisplay
        configData={config}
        onEditClick={onEditClick}
        isLoading={false}
      />
    );
    
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    expect(onEditClick).toHaveBeenCalledTimes(1);
  });

  it('formats boolean values correctly', () => {
    // Test with a true value
    const config = {
      ...mockOrganizationConfigurations.org1[OrganizationConfigType.CLIENT_CONFIG],
      OrganizationCourtCash: {
        Label: 'Test Cash',
        Enabled: true,
      },
    };
    
    const { unmount } = render(
      <ConfigurationDisplay
        configData={config}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Check that true is displayed as "Yes"
    expect(screen.getByTestId('field-enabled')).toHaveTextContent('Yes');
    
    // Clean up and test with false value
    unmount();
    
    const configWithFalse = {
      ...mockOrganizationConfigurations.org1[OrganizationConfigType.CLIENT_CONFIG],
      OrganizationCourtCash: {
        Label: 'Test Cash',
        Enabled: false,
      },
    };
    
    render(
      <ConfigurationDisplay
        configData={configWithFalse}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Check that false is displayed as "No"
    expect(screen.getByTestId('field-enabled')).toHaveTextContent('No');
  });

  it('formats complex objects correctly', () => {
    const config = mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG];
    
    render(
      <ConfigurationDisplay
        configData={config}
        onEditClick={() => {}}
        isLoading={false}
      />
    );
    
    // Check BuyTabs formatting
    expect(screen.getByText('Buy Tabs')).toBeInTheDocument();
    
    // BuyTabs should be formatted into a structured view
    const buyTabs = screen.getAllByText(/Label:/);
    expect(buyTabs.length).toBe(2); // Two BuyTabs in the mock data
    
    // Profile fields should be formatted with proper labels
    expect(screen.getByText('Profile Fields')).toBeInTheDocument();
    expect(screen.getAllByText(/Editable:/).length).toBe(4); // Four profile fields
    expect(screen.getAllByText(/SSO User Editable:/).length).toBe(4);
    expect(screen.getAllByText(/Required:/).length).toBe(4);
    
    // Each profile field should display its FieldName properly formatted
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });
});