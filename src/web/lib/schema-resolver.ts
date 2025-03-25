import { z } from 'zod'; // ^3.0.0
import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';
import { organizationConfigSchema } from '../validators/organization-config';
import { clientConfigSchema } from '../validators/client-config';
import { clientConfigIOSSchema } from '../validators/client-config-ios';
import { clientConfigAndroidSchema } from '../validators/client-config-android';
import { organizationSchema } from '../validators/organization';
import { ConfigFormValues } from '../types/form';

/**
 * Returns the appropriate Zod validation schema based on the organization configuration type
 * 
 * This function is used to dynamically select the correct validation schema for form validation
 * based on the type of configuration being edited or created.
 *
 * @param configType - The organization configuration type
 * @returns The Zod schema corresponding to the provided configuration type
 * @throws Error if an unsupported configuration type is provided
 */
export function getSchemaByType(configType: OrganizationConfigType): z.ZodType<any> {
  switch (configType) {
    case OrganizationConfigType.ORGANIZATION_CONFIG:
      return organizationConfigSchema;
    case OrganizationConfigType.CLIENT_CONFIG:
      return clientConfigSchema;
    case OrganizationConfigType.CLIENT_CONFIG_IOS:
      return clientConfigIOSSchema;
    case OrganizationConfigType.CLIENT_CONFIG_ANDROID:
      return clientConfigAndroidSchema;
    default:
      throw new Error(`Unsupported configuration type: ${configType}`);
  }
}

/**
 * Returns the Zod validation schema for creating a new organization
 * 
 * This function provides the validation schema used when creating a new organization
 * through the organization creation form.
 *
 * @returns The Zod schema for organization creation
 */
export function getSchemaForNewOrganization(): z.ZodType<any> {
  return organizationSchema;
}