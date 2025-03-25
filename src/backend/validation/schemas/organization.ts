import { z } from 'zod'; // ^3.0.0
import { isValidOrganizationId } from '../../utils/validation';

/**
 * Zod schema for validating Organization entity data.
 * Enforces validation rules for organization creation and updates, 
 * ensuring required fields are present and properly formatted.
 */
export const organizationSchema = z.object({
  OrganizationId: z.string()
    .min(1, "Organization ID is required")
    .refine(isValidOrganizationId, {
      message: "Organization ID contains invalid characters"
    }),
  Name: z.string().min(1, "Name is required")
});