'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react'; // v0.284.0

import OrganizationSelector from '../../components/OrganizationSelector';
import ConfigurationTabs from '../../components/ConfigurationTabs';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/EmptyState';

import { useOrganizations } from '../../hooks/useOrganizations';
import { useConfigurationData } from '../../hooks/useConfigurationData';
import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';

export default function HomePage() {
  // Initialize router with useRouter hook for navigation
  const router = useRouter();

  // Fetch organizations using useOrganizations hook
  const { organizations, isLoading: isLoadingOrganizations, error: organizationsError } = useOrganizations();

  // Initialize selectedOrganizationId state with useState(null)
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

  // Fetch configuration data for selected organization using useConfigurationData hook
  const { 
    configurations, 
    activeConfigType, 
    isLoading: isLoadingConfig,
    error: configError,
    setActiveConfigType 
  } = useConfigurationData(selectedOrganizationId);

  // Find the selected organization object
  const selectedOrganization = selectedOrganizationId 
    ? organizations.find(org => org.OrganizationId === selectedOrganizationId) || null
    : null;

  // Create handleOrganizationSelect callback to update selected organization
  const handleOrganizationSelect = useCallback((organizationId: string) => {
    setSelectedOrganizationId(organizationId);
  }, []);

  // Create handleEditClick callback to navigate to edit page
  const handleEditClick = useCallback(() => {
    if (selectedOrganizationId && activeConfigType) {
      router.push(`/organizations/${selectedOrganizationId}/config/${activeConfigType}/edit`);
    }
  }, [selectedOrganizationId, activeConfigType, router]);

  // Create handleNewOrganizationClick callback to navigate to new organization page
  const handleNewOrganizationClick = useCallback(() => {
    router.push('/organizations/new');
  }, [router]);

  return (
    <div className="container mx-auto py-8 px-4" data-testid="home-page">
      {/* Render a header section with title and description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organization Configuration Tool</h1>
        <p className="text-gray-500">Manage organization settings and configurations for the multi-tenant application</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          {/* Render OrganizationSelector component with organizations data */}
          <div className="w-full md:w-auto flex-grow" data-testid="organization-selector-container">
            <OrganizationSelector
              organizations={organizations}
              selectedOrg={selectedOrganization}
              onSelect={handleOrganizationSelect}
              isLoading={isLoadingOrganizations}
            />
          </div>

          {/* Render 'Add New Organization' button that navigates to the creation page */}
          <Button
            onClick={handleNewOrganizationClick}
            className="flex items-center gap-2"
            data-testid="add-new-organization"
            aria-label="Add New Organization"
          >
            <Plus size={16} aria-hidden="true" />
            Add New Organization
          </Button>
        </div>

        {/* Handle error states with appropriate error messages */}
        {organizationsError && (
          <EmptyState
            title="Error Loading Organizations"
            description={organizationsError.message || "Failed to load organizations. Please try again."}
            action={
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        )}

        {/* If no organization is selected, render EmptyState component with prompt to select an organization */}
        {!organizationsError && !selectedOrganizationId && (
          <EmptyState
            title="No Organization Selected"
            description="Please select an organization from the dropdown above to view and manage its configuration settings."
            data-testid="empty-state-no-organization"
          />
        )}

        {/* If organization is selected, render ConfigurationTabs component with configuration data */}
        {selectedOrganizationId && (
          <div className="mt-4" data-testid="configuration-tabs-container">
            {configError ? (
              <EmptyState
                title="Error Loading Configuration"
                description={configError.message || "Failed to load configuration data. Please try again."}
                action={
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                }
              />
            ) : (
              <ConfigurationTabs
                configData={configurations}
                activeTab={activeConfigType}
                onTabChange={setActiveConfigType}
                onEditClick={handleEditClick}
                isLoading={isLoadingConfig}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}