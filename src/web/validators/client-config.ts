import { z } from 'zod'; // zod version: ^3.0.0
import { ClientConfigFormValues } from '../types/form';

/**
 * Zod schema for validating Braze configuration settings
 */
export const brazeConfigSchema = z.object({
  PublicKey: z.string().optional(),
  BaseUrl: z.string().url('Must be a valid URL').optional()
});

/**
 * Zod schema for validating organization court cash configuration settings
 */
export const organizationCourtCashConfigSchema = z.object({
  Label: z.string().optional(),
  Enabled: z.boolean().optional()
});

/**
 * Zod schema for validating CLIENT_CONFIG type organization configuration in the frontend
 */
export const clientConfigSchema = z.object({
  PublicAmplitudeExperimentsKey: z.string().optional(),
  PublicSegmentWriteKey: z.string().optional(),
  Braze: brazeConfigSchema.optional(),
  OrganizationCourtCash: organizationCourtCashConfigSchema.optional(),
  PrivacyPolicyLink: z.string().url('Must be a valid URL').optional(),
  TermsLink: z.string().url('Must be a valid URL').optional()
});