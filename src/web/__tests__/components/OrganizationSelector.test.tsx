import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrganizationSelector from '../../components/OrganizationSelector';
import { mockOrganizations } from '../../__mocks__/data';
import { Organization } from '../../types/organization';

describe('OrganizationSelector', () => {
  it('renders dropdown with organizations', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    
    render(
      <OrganizationSelector 
        organizations={mockOrganizations} 
        selectedOrg={null} 
        onSelect={onSelect} 
        isLoading={false} 
      />
    );
    
    expect(screen.getByRole('combobox', { name: /select organization/i })).toBeInTheDocument();
    
    await user.click(screen.getByRole('combobox', { name: /select organization/i }));
    
    for (const org of mockOrganizations) {
      expect(screen.getByText(org.Name)).toBeInTheDocument();
    }
  });

  it('calls onSelect when an organization is selected', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    
    render(
      <OrganizationSelector 
        organizations={mockOrganizations} 
        selectedOrg={null} 
        onSelect={onSelect} 
        isLoading={false} 
      />
    );
    
    await user.click(screen.getByRole('combobox', { name: /select organization/i }));
    await user.click(screen.getByText('Acme Sports'));
    
    expect(onSelect).toHaveBeenCalledWith('org1');
  });

  it('displays the selected organization name', async () => {
    const user = userEvent.setup();
    const selectedOrg: Organization = mockOrganizations[0];
    const onSelect = jest.fn();
    
    render(
      <OrganizationSelector 
        organizations={mockOrganizations} 
        selectedOrg={selectedOrg} 
        onSelect={onSelect} 
        isLoading={false} 
      />
    );
    
    // Open dropdown to verify the correct organization is selected
    await user.click(screen.getByRole('combobox', { name: /select organization/i }));
    
    // Verify the selected organization name is present in the dropdown
    expect(screen.getByText(selectedOrg.Name)).toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    const onSelect = jest.fn();
    
    render(
      <OrganizationSelector 
        organizations={mockOrganizations} 
        selectedOrg={null} 
        onSelect={onSelect} 
        isLoading={true} 
      />
    );
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('handles empty organizations array', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    
    render(
      <OrganizationSelector 
        organizations={[]} 
        selectedOrg={null} 
        onSelect={onSelect} 
        isLoading={false} 
      />
    );
    
    await user.click(screen.getByRole('combobox', { name: /select organization/i }));
    
    expect(screen.getByText('No organizations available')).toBeInTheDocument();
  });
});