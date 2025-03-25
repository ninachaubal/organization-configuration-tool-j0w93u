import { useState, useCallback } from 'react'; // react version: ^18.0.0
import { useForm, FieldValues } from 'react-hook-form'; // react-hook-form version: ^7.0.0
import { zodResolver } from '@hookform/resolvers/zod'; // @hookform/resolvers/zod version: ^3.0.0
import { FormWithConfirmationProps, UseFormWithConfirmationReturn } from '../types/form';
import { useSubmitWithValidation } from './useSubmitWithValidation';

/**
 * A custom hook that combines form handling with a confirmation dialog before submission.
 * This hook provides form validation, state management, and a confirmation step to enhance
 * the user experience and prevent accidental form submissions.
 * 
 * @template T - Type of form values extending FieldValues
 * @param props - Props for the form with confirmation
 * @returns Object containing form methods, handlers, and confirmation dialog state
 */
export function useFormWithConfirmation<T extends FieldValues>(
  props: FormWithConfirmationProps<T>
): UseFormWithConfirmationReturn<T> {
  const { defaultValues, onSubmit, onCancel, confirmationMessage, schema } = props;
  
  // Initialize form with schema validation
  const formMethods = useForm<T>({
    defaultValues,
    resolver: zodResolver(schema)
  });
  
  // State for confirmation dialog
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  // Set up submission handler with validation
  const { handleSubmit: submitWithValidation, isSubmitting } = useSubmitWithValidation(
    formMethods,
    onSubmit,
    defaultValues as Partial<T>
  );
  
  // Handler to validate form and open confirmation dialog if valid
  const handleSubmit = useCallback(() => {
    formMethods.handleSubmit(() => {
      setIsConfirmationOpen(true);
    })();
  }, [formMethods]);
  
  // Handler for when user confirms in the dialog
  const handleConfirm = useCallback(() => {
    submitWithValidation();
    setIsConfirmationOpen(false);
  }, [submitWithValidation]);
  
  // Handler for when user cancels the form editing process
  const handleCancel = useCallback(() => {
    setIsConfirmationOpen(false);
    onCancel();
  }, [onCancel]);
  
  return {
    formMethods,
    handleSubmit,
    isSubmitting,
    isConfirmationOpen,
    setIsConfirmationOpen,
    handleConfirm,
    handleCancel
  };
}