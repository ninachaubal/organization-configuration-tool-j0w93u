import { z } from 'zod'; // version ^3.0.0
import { OrganizationConfigType } from '../../models/enums/OrganizationConfigType';

/**
 * Zod validation schema for CLIENT_CONFIG_IOS type organization configuration.
 * Enforces validation rules for iOS-specific configuration data, 
 * particularly the iOS store link URL.
 */
export const clientConfigIOSSchema = z.object({
  // OrganizationId must be a string
  OrganizationId: z.string(),
  
  // OrganizationConfigType must be specifically CLIENT_CONFIG_IOS
  OrganizationConfigType: z.literal(OrganizationConfigType.CLIENT_CONFIG_IOS),
  
  // IosStoreLink must be a valid URL if provided, but is optional
  IosStoreLink: z.string().url().optional()
});