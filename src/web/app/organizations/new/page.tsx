import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from 'next-toast';
import { ArrowLeft } from 'lucide-react';

import { NewOrganizationForm } from '../../../components/forms/NewOrganizationForm';
import { Button } from '../../../components/ui/button';
import { createOrganization } from '../../../lib/api-client';
import { OrganizationFormValues } from '../../../types/form';

/**
 * NextJS page component for creating new organizations in the configuration management tool.
 * Provides a form interface for users to enter OrganizationId and Name, validates the input,
 * and handles the creation process with appropriate feedback.
 * 
 * This component implements the F-002 feature (Organization Creation) from the technical specification.
 */
export default function NewOrganizationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles form submission and organization creation
   * 
   * @param data Form values containing OrganizationId and Name
   */
  const handleSubmit = async (data: OrganizationFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Call the API to create the organization
      const response = await createOrganization({
        organizationId: data.OrganizationId,
        name: data.Name
      });
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Organization created successfully',
          type: 'success'
        });
        
        // Navigate to the configuration page for the new organization
        // This satisfies requirement F-002-RQ-003: System shall redirect to Configuration Page after creation
        if (response.organization) {
          router.push(`/organizations?id=${response.organization.OrganizationId}`);
        } else {
          router.push('/organizations');
        }
      } else {
        throw new Error(response.error || 'Failed to create organization');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create organization',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles cancellation of the form
   */
  const handleCancel = () => {
    router.push('/organizations');
  };

  return (
    <div className="container py-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Configuration
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Organization</h1>
        <p className="text-muted-foreground mt-2">
          Enter the organization details below to create a new organization with default configurations.
        </p>
      </div>
      
      {/* F-002-RQ-001: System shall provide a form to create a new organization */}
      <NewOrganizationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}