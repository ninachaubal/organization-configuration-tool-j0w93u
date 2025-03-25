import { z } from 'zod'; // ^3.0.0
import { OrganizationConfigFormValues } from '../types/form';
import { OrganizationFieldName } from '../../backend/models/enums/OrganizationFieldName';

/**
 * Zod schema for validating BuyTab configuration items
 * 
 * Enforces required fields and data types for BuyTab entries
 */
export const buyTabSchema = z.object({
  Label: z.string().min(1, 'Label is required'),
  Slug: z.string().min(1, 'Slug is required'),
  Type: z.string().min(1, 'Type is required'),
  GenreCode: z.string().optional()
});

/**
 * Zod schema for validating ProfileField configuration items
 * 
 * Ensures field names are from the allowed enum and boolean flags have correct types
 */
export const profileFieldSchema = z.object({
  FieldName: z.enum([
    OrganizationFieldName.EMAIL,
    OrganizationFieldName.FIRST_NAME,
    OrganizationFieldName.LAST_NAME,
    OrganizationFieldName.BIRTHDAY,
    OrganizationFieldName.PHONE_NUMBER
  ]),
  IsEditable: z.boolean().optional(),
  IsSSOUserEditable: z.boolean().optional(),
  IsRequired: z.boolean().optional()
});

/**
 * Zod schema for validating customer service configuration settings
 */
export const customerServiceConfigSchema = z.object({
  CustomerServicePhone: z.string().optional()
});

/**
 * Zod schema for validating ORGANIZATION_CONFIG type organization configuration in the frontend
 * 
 * This schema is used for form validation when creating or editing organization configuration.
 * It validates all fields according to their requirements, including nested objects and arrays.
 */
export const organizationConfigSchema = z.object({
  Name: z.string().optional(),
  TeamName: z.string().optional(),
  Slug: z.string().optional(),
  ShortName: z.string().optional(),
  LogoUrl: z.string().url('Must be a valid URL').optional(),
  FanWebRootUrl: z.string().url('Must be a valid URL').optional(),
  BrandColor: z.string().optional(),
  ExternalProviderId: z.string().optional(),
  SocialLink: z.string().url('Must be a valid URL').optional(),
  DonateLink: z.string().url('Must be a valid URL').optional(),
  BuyTabs: z.array(buyTabSchema).optional(),
  Profile: z.array(profileFieldSchema).optional(),
  CustomerServiceConfig: customerServiceConfigSchema.optional()
});