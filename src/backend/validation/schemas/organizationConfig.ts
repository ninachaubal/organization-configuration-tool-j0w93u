import { z } from 'zod'; // Version ^3.0.0
import { OrganizationConfigType } from '../../models/enums/OrganizationConfigType';
import { OrganizationFieldName } from '../../models/enums/OrganizationFieldName';

/**
 * Schema for validating BuyTab configuration items
 * BuyTabs represent purchase options displayed to users in the application
 */
export const buyTabSchema = z.object({
  Label: z.string().min(1, 'Label is required'),
  Slug: z.string().min(1, 'Slug is required'),
  Type: z.string().min(1, 'Type is required'),
  GenreCode: z.string().optional()
});

/**
 * Schema for validating ProfileField configuration items
 * Profile fields define which user profile fields are available, required, and editable
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
 * Schema for validating customer service configuration settings
 */
export const customerServiceConfigSchema = z.object({
  CustomerServicePhone: z.string().optional()
});

/**
 * Schema for validating ORGANIZATION_CONFIG type organization configuration
 * This is the main schema for organization core settings including branding, BuyTabs, and Profile settings
 */
export const organizationConfigSchema = z.object({
  OrganizationId: z.string().min(1, 'Organization ID is required'),
  OrganizationConfigType: z.literal(OrganizationConfigType.ORGANIZATION_CONFIG),
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
  CustomerServiceConfig: customerServiceConfigSchema.optional(),
  __createdAt: z.string().optional(),
  __updatedAt: z.string().optional(),
  __updatedBy: z.string().optional()
});