import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { ConfigurationEditForm } from '../../components/forms/ConfigurationEditForm';
import { OrganizationConfigType } from '../../../backend/models/enums/OrganizationConfigType';
import { server } from '../../__mocks__/api-handlers';
import { mockOrganizationConfigurations, mockConfigurationUpdateResponse, mockConfigurationUpdateErrorResponse } from '../../__mocks__/data';
import { useFormWithConfirmation } from '../../hooks/useFormWithConfirmation';

// Mock the useFormWithConfirmation hook
jest.mock('../../hooks/useFormWithConfirmation', () => ({
  useFormWithConfirmation: jest.fn()
}));

// Setup function for userEvent
const setup = () => {
  return userEvent.setup();
};

describe('ConfigurationEditForm', () => {
  // Set up MSW server
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    // Default mock implementation for useFormWithConfirmation
    (useFormWithConfirmation as jest.Mock).mockReturnValue({
      formMethods: {
        control: {},
        formState: { errors: {} },
        register: jest.fn(),
        handleSubmit: jest.fn(),
        setValue: jest.fn(),
        getValues: jest.fn(),
        watch: jest.fn()
      },
      handleSubmit: jest.fn(),
      isSubmitting: false,
      isConfirmationOpen: false,
      setIsConfirmationOpen: jest.fn(),
      handleConfirm: jest.fn(),
      handleCancel: jest.fn()
    });
  });

  it('renders the form with ORGANIZATION_CONFIG fields', () => {
    // Arrange
    const configData = mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    // Act
    render(
      <ConfigurationEditForm
        configData={configData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );

    // Assert - check for presence of key ORGANIZATION_CONFIG fields
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Team Name')).toBeInTheDocument();
    expect(screen.getByText('Slug')).toBeInTheDocument();
    expect(screen.getByText('Short Name')).toBeInTheDocument();
    expect(screen.getByText('Logo URL')).toBeInTheDocument();
    expect(screen.getByText('Buy Tabs')).toBeInTheDocument();
    expect(screen.getByText('Profile Fields')).toBeInTheDocument();
    expect(screen.getByText('Customer Service Phone')).toBeInTheDocument();
  });

  it('renders the form with CLIENT_CONFIG fields', () => {
    // Arrange
    const configData = mockOrganizationConfigurations.org1[OrganizationConfigType.CLIENT_CONFIG];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    // Act
    render(
      <ConfigurationEditForm
        configData={configData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );

    // Assert - check for presence of key CLIENT_CONFIG fields
    expect(screen.getByText('Public Amplitude Experiments Key')).toBeInTheDocument();
    expect(screen.getByText('Public Segment Write Key')).toBeInTheDocument();
    expect(screen.getByText('Braze Public Key')).toBeInTheDocument();
    expect(screen.getByText('Braze Base URL')).toBeInTheDocument();
    expect(screen.getByText('Court Cash Label')).toBeInTheDocument();
    expect(screen.getByText('Court Cash Enabled')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy Link')).toBeInTheDocument();
    expect(screen.getByText('Terms Link')).toBeInTheDocument();
  });

  it('renders the form with CLIENT_CONFIG_IOS fields', () => {
    // Arrange
    const configData = mockOrganizationConfigurations.org1[OrganizationConfigType.CLIENT_CONFIG_IOS];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    // Act
    render(
      <ConfigurationEditForm
        configData={configData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );

    // Assert - check for presence of iOS-specific field
    expect(screen.getByText('iOS Store Link')).toBeInTheDocument();
  });

  it('renders the form with CLIENT_CONFIG_ANDROID fields', () => {
    // Arrange
    const configData = mockOrganizationConfigurations.org1[OrganizationConfigType.CLIENT_CONFIG_ANDROID];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    // Act
    render(
      <ConfigurationEditForm
        configData={configData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );

    // Assert - check for presence of Android-specific field
    expect(screen.getByText('Android Store Link')).toBeInTheDocument();
  });

  it('displays validation errors for invalid fields', () => {
    // Arrange
    const configData = mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    // Mock form with errors
    (useFormWithConfirmation as jest.Mock).mockReturnValue({
      formMethods: {
        control: {},
        formState: {
          errors: {
            Name: { message: 'Name is required' },
            LogoUrl: { message: 'Must be a valid URL' }
          }
        },
        register: jest.fn(),
        handleSubmit: jest.fn(),
        setValue: jest.fn(),
        getValues: jest.fn(),
        watch: jest.fn()
      },
      handleSubmit: jest.fn(),
      isSubmitting: false,
      isConfirmationOpen: false,
      setIsConfirmationOpen: jest.fn(),
      handleConfirm: jest.fn(),
      handleCancel: jest.fn()
    });

    // Act
    render(
      <ConfigurationEditForm
        configData={configData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );

    // Assert - check for validation error messages
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Must be a valid URL')).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    // Arrange
    const user = setup();
    const configData = mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const handleSubmit = jest.fn();

    (useFormWithConfirmation as jest.Mock).mockReturnValue({
      formMethods: {
        control: {},
        formState: { errors: {} },
        register: jest.fn(),
        handleSubmit: jest.fn((fn) => fn(configData)),
        setValue: jest.fn(),
        getValues: jest.fn().mockReturnValue(configData),
        watch: jest.fn()
      },
      handleSubmit,
      isSubmitting: false,
      isConfirmationOpen: false,
      setIsConfirmationOpen: jest.fn(),
      handleConfirm: jest.fn(),
      handleCancel: jest.fn()
    });

    // Act
    render(
      <ConfigurationEditForm
        configData={configData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );

    // Click save button
    await user.click(screen.getByRole('button', { name: /Save Changes/i }));

    // Assert - check if form submission handler was called
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('shows confirmation dialog before submitting', async () => {
    // Arrange
    const user = setup();
    const configData = mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const setIsConfirmationOpen = jest.fn();
    const handleConfirm = jest.fn();

    (useFormWithConfirmation as jest.Mock).mockReturnValue({
      formMethods: {
        control: {},
        formState: { errors: {} },
        register: jest.fn(),
        handleSubmit: jest.fn(),
        setValue: jest.fn(),
        getValues: jest.fn(),
        watch: jest.fn()
      },
      handleSubmit: jest.fn(),
      isSubmitting: false,
      isConfirmationOpen: true,
      setIsConfirmationOpen,
      handleConfirm,
      handleCancel: jest.fn()
    });

    // Act
    render(
      <ConfigurationEditForm
        configData={configData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );

    // Assert - check for confirmation dialog content
    expect(screen.getByText('Confirm Changes')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to save these configuration changes/i)).toBeInTheDocument();
    expect(screen.getByText(/Acme Sports/i)).toBeInTheDocument();
    
    // Get and click the confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.click(confirmButton);
    
    // Assert confirm handler was called
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    // Arrange
    const user = setup();
    const configData = mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    // Act
    render(
      <ConfigurationEditForm
        configData={configData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );

    // Click the form cancel button (not the dialog cancel)
    const cancelButton = screen.getByRole('button', { name: /^Cancel$/i });
    await user.click(cancelButton);

    // Assert - check if cancel handler was called
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables buttons during submission', () => {
    // Arrange
    const configData = mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG];
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    // Act
    render(
      <ConfigurationEditForm
        configData={configData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={true}
      />
    );

    // Assert - check button states during submission
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    // The Cancel button should still be enabled
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled();
  });
});