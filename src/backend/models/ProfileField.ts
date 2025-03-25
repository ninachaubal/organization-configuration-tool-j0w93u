import { OrganizationFieldName } from './enums/OrganizationFieldName';

/**
 * Interface representing the configuration of a user profile field within an organization.
 * 
 * This interface defines the structure for profile field configuration settings, which determine
 * how user profile fields are displayed, edited, and validated within an organization's user interface.
 * The configuration includes whether fields are editable, editable by SSO users, and/or required.
 */
export interface ProfileField {
  /**
   * The name of the profile field.
   * 
   * This must be one of the predefined field names from OrganizationFieldName enum.
   * Examples include EMAIL, FIRST_NAME, LAST_NAME, etc.
   */
  FieldName: OrganizationFieldName;
  
  /**
   * Indicates whether the field is editable by users.
   * 
   * If true, users can modify this field in their profile.
   * If false, the field is read-only.
   * If undefined, the system uses a default value (typically false).
   */
  IsEditable?: boolean;
  
  /**
   * Indicates whether the field is editable by users who have authenticated via SSO.
   * 
   * This allows for different edit permissions between SSO and non-SSO users.
   * If true, SSO users can modify this field in their profile.
   * If false, the field is read-only for SSO users.
   * If undefined, the system uses a default value (typically false).
   */
  IsSSOUserEditable?: boolean;
  
  /**
   * Indicates whether the field is required.
   * 
   * If true, users must provide a value for this field.
   * If false, the field is optional.
   * If undefined, the system uses a default value (typically false).
   */
  IsRequired?: boolean;
}