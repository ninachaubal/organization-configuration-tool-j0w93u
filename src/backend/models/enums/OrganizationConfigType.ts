/**
 * Defines the different types of organization configuration that can exist in the system.
 * This enum is used to categorize configuration records and serves as the sort key in DynamoDB.
 * It also determines which tab a configuration appears under in the UI.
 */
export enum OrganizationConfigType {
  /**
   * Core organization configuration settings including name, branding, BuyTabs, and Profile settings
   */
  ORGANIZATION_CONFIG = 'ORGANIZATION_CONFIG',
  
  /**
   * General client configuration settings applicable across all platforms
   * Includes analytics keys, privacy links, and shared client settings
   */
  CLIENT_CONFIG = 'CLIENT_CONFIG',
  
  /**
   * iOS-specific client configuration settings
   * Includes App Store links and iOS-specific features
   */
  CLIENT_CONFIG_IOS = 'CLIENT_CONFIG_IOS',
  
  /**
   * Android-specific client configuration settings
   * Includes Play Store links and Android-specific features
   */
  CLIENT_CONFIG_ANDROID = 'CLIENT_CONFIG_ANDROID'
}