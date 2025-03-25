import { z } from 'zod';
import { OrganizationConfigType } from '../../models/enums/OrganizationConfigType';

/**
 * Zod schema for validating Braze configuration settings.
 * Contains optional fields for PublicKey and BaseUrl.
 */
export const brazeConfigSchema = z.object({
  PublicKey: z.string().optional(),
  BaseUrl: z.string().url().optional()
});

/**
 * Zod schema for validating organization court cash configuration settings.
 * Contains optional fields for Label and Enabled.
 */
export const organizationCourtCashConfigSchema = z.object({
  Label: z.string().optional(),
  Enabled: z.boolean().optional()
});

/**
 * Zod schema for validating CLIENT_CONFIG type organization configuration.
 * Enforces the correct OrganizationConfigType and validates various client configuration fields.
 */
export const clientConfigSchema = z.object({
  OrganizationId: z.string(),
  OrganizationConfigType: z.literal(OrganizationConfigType.CLIENT_CONFIG),
  PublicAmplitudeExperimentsKey: z.string().optional(),
  PublicSegmentWriteKey: z.string().optional(),
  Braze: brazeConfigSchema.optional(),
  OrganizationCourtCash: organizationCourtCashConfigSchema.optional(),
  PrivacyPolicyLink: z.string().url().optional(),
  TermsLink: z.string().url().optional()
});