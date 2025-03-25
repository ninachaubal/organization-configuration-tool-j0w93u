import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewOrganizationForm } from '../../components/forms/NewOrganizationForm';
import { OrganizationFormValues } from '../../types/form';

describe('NewOrganizationForm', () => {
  it('renders the form with OrganizationId and Name fields', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <NewOrganizationForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );
    
    // Check for OrganizationId field
    expect(screen.getByLabelText(/OrganizationId/i)).toBeInTheDocument();
    
    // Check for Name field
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    
    // Check for Create Organization button
    expect(screen.getByRole('button', { name: /Create Organization/i })).toBeInTheDocument();
    
    // Check for Cancel button
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('validates OrganizationId field', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const user = userEvent.setup();
    
    render(
      <NewOrganizationForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );
    
    // Get the submit button and OrganizationId input
    const submitButton = screen.getByRole('button', { name: /Create Organization/i });
    const orgIdInput = screen.getByLabelText(/OrganizationId/i);
    
    // Submit the form without entering anything
    await user.click(submitButton);
    
    // Check that validation error is shown
    expect(await screen.findByText(/Organization ID is required/i)).toBeInTheDocument();
    
    // Enter invalid value (uppercase letters)
    await user.clear(orgIdInput);
    await user.type(orgIdInput, 'INVALID-ORG');
    await user.click(submitButton);
    
    // Check that format validation error is shown
    expect(await screen.findByText(/Organization ID can only contain lowercase letters, numbers, and hyphens/i)).toBeInTheDocument();
    
    // Enter valid value
    await user.clear(orgIdInput);
    await user.type(orgIdInput, 'valid-org-id');
    
    // Should not show error anymore for valid input
    await waitFor(() => {
      expect(screen.queryByText(/Organization ID can only contain lowercase letters, numbers, and hyphens/i)).not.toBeInTheDocument();
    });
  });

  it('validates Name field', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const user = userEvent.setup();
    
    render(
      <NewOrganizationForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );
    
    // Get the submit button and Name input
    const submitButton = screen.getByRole('button', { name: /Create Organization/i });
    const nameInput = screen.getByLabelText(/Name/i);
    
    // Submit the form without entering anything
    await user.click(submitButton);
    
    // Check that validation error is shown
    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
    
    // Enter valid value
    await user.clear(nameInput);
    await user.type(nameInput, 'Test Organization');
    
    // Should not show error anymore for valid input
    await waitFor(() => {
      expect(screen.queryByText(/Name is required/i)).not.toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const user = userEvent.setup();
    
    render(
      <NewOrganizationForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );
    
    // Get the form fields
    const orgIdInput = screen.getByLabelText(/OrganizationId/i);
    const nameInput = screen.getByLabelText(/Name/i);
    const submitButton = screen.getByRole('button', { name: /Create Organization/i });
    
    // Fill in the form with valid data
    await user.type(orgIdInput, 'test-org');
    await user.type(nameInput, 'Test Organization');
    
    // Submit the form
    await user.click(submitButton);
    
    // Confirmation dialog should appear
    expect(screen.getByText(/Confirm Organization Creation/i)).toBeInTheDocument();
    
    // Click Confirm button
    const confirmButton = screen.getByRole('button', { name: /^Create Organization$/i });
    await user.click(confirmButton);
    
    // Check that onSubmit was called with correct data
    expect(onSubmit).toHaveBeenCalledWith({
      OrganizationId: 'test-org',
      Name: 'Test Organization'
    });
  });

  it('cancels form submission when Cancel button is clicked', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const user = userEvent.setup();
    
    render(
      <NewOrganizationForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );
    
    // Find and click the Cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    // Check that onCancel was called
    expect(onCancel).toHaveBeenCalled();
    
    // Check that onSubmit was not called
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('cancels form submission when Cancel is clicked in confirmation dialog', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const user = userEvent.setup();
    
    render(
      <NewOrganizationForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={false}
      />
    );
    
    // Get the form fields
    const orgIdInput = screen.getByLabelText(/OrganizationId/i);
    const nameInput = screen.getByLabelText(/Name/i);
    const submitButton = screen.getByRole('button', { name: /Create Organization/i });
    
    // Fill in the form with valid data
    await user.type(orgIdInput, 'test-org');
    await user.type(nameInput, 'Test Organization');
    
    // Submit the form
    await user.click(submitButton);
    
    // Confirmation dialog should appear
    expect(screen.getByText(/Confirm Organization Creation/i)).toBeInTheDocument();
    
    // Click Cancel button in dialog
    const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[1]; // Get the second Cancel button (in the dialog)
    await user.click(cancelButton);
    
    // Check that onSubmit was not called
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables form submission when isSubmitting is true', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <NewOrganizationForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={true}
      />
    );
    
    // Check that the submit button is disabled
    const submitButton = screen.getByRole('button', { name: /Creating/i });
    expect(submitButton).toBeDisabled();
    
    // Check that the cancel button is not disabled
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).not.toBeDisabled();
  });
});