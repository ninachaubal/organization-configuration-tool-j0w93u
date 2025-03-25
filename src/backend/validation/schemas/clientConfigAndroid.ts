import { z } from 'zod';
import { OrganizationConfigType } from '../../models/enums/OrganizationConfigType';

/**
 * Zod validation schema for CLIENT_CONFIG_ANDROID type organization configuration.
 * Enforces validation rules for Android-specific configuration data, particularly the Android store link URL.
 */
export const clientConfigAndroidSchema = z.object({
  // Required organization identifier
  OrganizationId: z.string(),
  
  // Must be the CLIENT_CONFIG_ANDROID type
  OrganizationConfigType: z.literal(OrganizationConfigType.CLIENT_CONFIG_ANDROID),
  
  // Optional Android store link that must be a valid URL if provided
  AndroidStoreLink: z.string().url().optional()
});