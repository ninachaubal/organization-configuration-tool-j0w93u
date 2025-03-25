import * as React from 'react';
import { organizationSchema } from '../../validators/organization';
import { OrganizationFormValues, NewOrganizationFormProps } from '../../types/form';
import { useFormWithConfirmation } from '../../hooks/useFormWithConfirmation';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '../ui/form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import * as AlertDialog from '@radix-ui/react-alert-dialog'; // version: ^1.0.0

/**
 * A form component for creating new organizations in the configuration management tool.
 * Provides fields for OrganizationId and Name with validation and confirmation dialog.
 */
export function NewOrganizationForm({ onSubmit, onCancel, isSubmitting }: NewOrganizationFormProps) {
  // Use form with confirmation for enhanced user experience when creating a new organization
  const {
    formMethods,
    handleSubmit,
    isConfirmationOpen,
    setIsConfirmationOpen,
    handleConfirm,
    handleCancel
  } = useFormWithConfirmation<OrganizationFormValues>({
    defaultValues: {
      OrganizationId: '',
      Name: ''
    },
    onSubmit,
    onCancel,
    confirmationMessage: 'Are you sure you want to create this organization?',
    schema: organizationSchema
  });

  return (
    <>
      <Form {...formMethods}>
        <div className="space-y-4">
          <FormField
            control={formMethods.control}
            name="OrganizationId"
            render={({ name }) => (
              <FormItem>
                <FormLabel>OrganizationId</FormLabel>
                <FormControl>
                  <Input placeholder="org-identifier" {...formMethods.register(name)} />
                </FormControl>
                <FormDescription>
                  Must be unique and can only contain lowercase letters, numbers, and hyphens
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formMethods.control}
            name="Name"
            render={({ name }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Organization Name" {...formMethods.register(name)} />
                </FormControl>
                <FormDescription>
                  The display name for the organization
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </div>
      </Form>

      <AlertDialog.Root open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-md shadow-lg max-w-md w-full space-y-4">
            <AlertDialog.Title className="text-lg font-semibold">
              Confirm Organization Creation
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-foreground">
              Are you sure you want to create this organization? You cannot change the OrganizationId later.
            </AlertDialog.Description>
            <div className="flex justify-end space-x-2 pt-2">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button onClick={handleConfirm} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Organization'}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}