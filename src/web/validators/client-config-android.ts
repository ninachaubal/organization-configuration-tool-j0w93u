import { z } from 'zod'; // zod version: ^3.0.0
import { ClientConfigAndroidFormValues } from '../types/form';

/**
 * Zod schema for validating CLIENT_CONFIG_ANDROID type organization configuration
 * 
 * Enforces validation rules for Android-specific configuration data,
 * particularly validating that the Android store link is a valid URL.
 */
export const clientConfigAndroidSchema = z.object({
  AndroidStoreLink: z.string().url('Must be a valid URL').optional()
});