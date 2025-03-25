import { useState, useCallback } from 'react'; // react version: ^18.0.0
import { FieldValues, UseFormReturn } from 'react-hook-form'; // react-hook-form version: ^7.0.0
import { ZodType } from 'zod'; // zod version: ^3.0.0
import { prepareFormDataForSubmission } from '../lib/form-helpers';
import { FormSubmitHandler } from '../types/form';

/**
 * A custom hook that handles form submission with validation, error handling, and data preparation.
 * This hook abstracts common form submission logic for configuration forms throughout the application.
 * 
 * @param formMethods - Form methods from react-hook-form
 * @param onSubmit - Function to call with validated and prepared form data
 * @param defaultValues - Original values to compare against for detecting changes
 * @returns Object containing submission handler, loading state, and error state
 */
export function useSubmitWithValidation<T extends FieldValues>(
  formMethods: UseFormReturn<T>,
  onSubmit: FormSubmitHandler<T>,
  defaultValues: Partial<T>
) {
  // State for tracking submission status and errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized submission handler to prevent unnecessary re-renders
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    // Use react-hook-form's handleSubmit to run validation
    return formMethods.handleSubmit(async (data) => {
      try {
        // Clear any previous errors
        setError(null);
        
        // Set loading state
        setIsSubmitting(true);
        
        // Prepare data for submission by removing empty values and extracting only changed values
        const preparedData = prepareFormDataForSubmission(data, defaultValues);
        
        // Call the provided submit handler with prepared data
        await onSubmit(preparedData as T);
        
        // Reset loading state on success
        setIsSubmitting(false);
        return true;
      } catch (err) {
        // Handle errors
        setIsSubmitting(false);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        return false;
      }
    })();
  }, [formMethods, onSubmit, defaultValues]);

  return {
    handleSubmit,
    isSubmitting,
    error
  };
}