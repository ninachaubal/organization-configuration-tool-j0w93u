/**
 * Enum for organization profile field names
 * 
 * These values represent the standard user profile fields that can be configured
 * for organizations in the multi-tenant system. They are used throughout the application
 * to provide a type-safe way to reference different profile fields.
 */
export enum OrganizationFieldName {
  /**
   * User's email address
   */
  EMAIL = 'EMAIL',
  
  /**
   * User's first name
   */
  FIRST_NAME = 'FIRST_NAME',
  
  /**
   * User's last name
   */
  LAST_NAME = 'LAST_NAME',
  
  /**
   * User's birthday
   */
  BIRTHDAY = 'BIRTHDAY',
  
  /**
   * User's phone number
   */
  PHONE_NUMBER = 'PHONE_NUMBER'
}