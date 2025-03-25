"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; // v0.284.0

import { useConfigurationData } from '../../../../hooks/useConfigurationData';
import ConfigurationTabs from '../../../../components/ConfigurationTabs';
import { ConfigurationEditForm } from '../../../../components/forms/ConfigurationEditForm';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import EmptyState from '../../../../components/EmptyState';

/**
 * NextJS page component for displaying and editing organization configuration
 */
const ConfigurationPage = (): React.ReactElement => {
  // Extract the organization ID from the route parameters
  const params = useParams();
  const router = useRouter();
  const organizationId = params?.id as string;

  // Initialize state for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  // Initialize state for form submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the useConfigurationData hook to fetch and manage configuration data
  const {
    configurations,
    activeConfigType,
    activeConfiguration,
    isLoading,
    error,
    setActiveConfigType,
    updateConfiguration,
    refetch
  } = useConfigurationData(organizationId);

  // Function to handle entering edit mode
  const handleEdit = () => {
    setIsEditMode(true);
  };

  // Function to handle canceling edit mode
  const handleCancel = () => {
    setIsEditMode(false);
  };

  // Function to handle form submission
  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await updateConfiguration(activeConfigType, data);
      setIsEditMode(false);
    } catch (err) {
      console.error('Failed to update configuration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle the case where the organization ID is not provided
  if (!organizationId) {
    return (
      <Alert variant="error">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Invalid organization ID. Please select a valid organization.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6" data-testid="organization-config-page">
      {/* Back navigation link to the organizations list */}
      <div className="mb-4">
        <Link href="/organizations" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Organizations
        </Link>
      </div>

      {/* Display error alert if there was an error fetching data */}
      {error && (
        <Alert variant="error" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load configuration data'}
          </AlertDescription>
        </Alert>
      )}

      {/* Display loading indicator while data is being fetched */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <LoadingIndicator size="lg" text="Loading configuration..." />
        </div>
      )}

      {/* Display empty state if no configuration data is found */}
      {!isLoading && !error && !configurations?.length && (
        <EmptyState
          title="No Configuration Found"
          description={`No configuration data found for this organization (ID: ${organizationId})`}
          action={
            <Button onClick={() => router.push('/organizations')}>
              Return to Organizations
            </Button>
          }
        />
      )}

      {/* Display configuration data when available */}
      {!isLoading && !error && configurations?.length > 0 && (
        <>
          {isEditMode ? (
            /* In edit mode, render the ConfigurationEditForm component */
            <ConfigurationEditForm
              configData={activeConfiguration}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          ) : (
            /* In view mode, render the ConfigurationTabs component */
            <ConfigurationTabs
              configData={configurations}
              activeTab={activeConfigType}
              onTabChange={setActiveConfigType}
              onEditClick={handleEdit}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ConfigurationPage;