import { z } from 'zod'; // version: ^3.0.0
import { OrganizationFormValues } from '../types/form';

/**
 * Zod schema for validating organization creation form data
 * 
 * This schema enforces validation rules for the organization creation form,
 * ensuring that OrganizationId and Name fields meet the required format and constraints.
 * Used with react-hook-form's zodResolver for form validation throughout the application.
 */
export const organizationSchema = z.object({
  OrganizationId: z.string()
    .min(1, "Organization ID is required")
    .regex(/^[a-z0-9-]+$/, "Organization ID can only contain lowercase letters, numbers, and hyphens"),
  Name: z.string().min(1, "Name is required")
});