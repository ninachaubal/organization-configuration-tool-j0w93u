import { z } from 'zod'; // zod version: ^3.0.0
import { ClientConfigIOSFormValues } from '../types/form';

/**
 * Zod schema for validating CLIENT_CONFIG_IOS type organization configuration
 * 
 * This schema enforces validation rules for iOS-specific configuration data,
 * particularly ensuring that the iOS store link is a valid URL if provided.
 */
export const clientConfigIOSSchema = z.object({
  IosStoreLink: z.string().url('Must be a valid URL').optional()
});