import React from 'react';
import { Organization, OrganizationSelectorProps } from '../types/organization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import LoadingIndicator from './LoadingIndicator';

/**
 * A dropdown component that allows users to select an organization from a list.
 * Displays organization names, handles loading states, and triggers configuration
 * loading when an organization is selected.
 */
const OrganizationSelector = ({
  organizations,
  selectedOrg,
  onSelect,
  isLoading
}: OrganizationSelectorProps) => {
  /**
   * Handles organization selection and calls the onSelect callback
   * @param value - The selected organization ID
   */
  const handleOrganizationChange = (value: string) => {
    onSelect(value);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium whitespace-nowrap">Organization:</span>
      <div className="w-full">
        <Select
          onValueChange={handleOrganizationChange}
          value={selectedOrg?.OrganizationId || ''}
          disabled={isLoading}
        >
          <SelectTrigger
            className="w-full"
            aria-label="Select organization"
          >
            <SelectValue placeholder="Select Organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.length > 0 ? (
              organizations.map((org) => (
                <SelectItem 
                  key={org.OrganizationId} 
                  value={org.OrganizationId}
                >
                  {org.Name}
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                {isLoading ? "Loading organizations..." : "No organizations available"}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      {isLoading && (
        <LoadingIndicator size="sm" />
      )}
    </div>
  );
};

export default OrganizationSelector;