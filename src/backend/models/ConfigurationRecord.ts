/**
 * ConfigurationRecord.ts
 * 
 * This file defines the data model for organization configuration records in the system.
 * It provides a structured type system for the different types of organization configuration,
 * including organization settings, client settings, and platform-specific settings.
 * 
 * The type system includes:
 * - A base interface with common fields for all configuration records
 * - Specific interfaces for each configuration type (Organization, Client, iOS, Android)
 * - A union type representing any valid configuration record
 * - A factory function to create default configuration records
 * 
 * This model serves as the central data structure for all organization configuration and is used
 * throughout the application for data validation, display, and persistence.
 */

import { OrganizationConfigType } from './enums/OrganizationConfigType';
import { OrganizationFieldName } from './enums/OrganizationFieldName';
import { BuyTab } from './BuyTab';
import { ProfileField } from './ProfileField';
import { CustomerServiceConfig } from './CustomerServiceConfig';
import { BrazeConfig } from './BrazeConfig';
import { OrganizationCourtCashConfig } from './OrganizationCourtCashConfig';

/**
 * Base interface for all configuration record types.
 * Contains fields common to all configuration records regardless of their specific type.
 * This serves as the foundation for all the specific configuration type interfaces.
 */
export interface BaseConfigurationRecord {
  /**
   * Unique identifier for the organization.
   * This is used as the partition key in DynamoDB.
   */
  OrganizationId: string;
  
  /**
   * Type of configuration record.
   * This is used as the sort key in DynamoDB and determines which tab a configuration appears under in the UI.
   */
  OrganizationConfigType: OrganizationConfigType;
  
  /**
   * Timestamp when the record was created.
   * Automatically set by the system during record creation.
   */
  __createdAt?: string;
  
  /**
   * Timestamp when the record was last updated.
   * Automatically updated by the system when the record is modified.
   */
  __updatedAt?: string;
  
  /**
   * Identifier of the user who last updated the record.
   * Used for audit trail purposes.
   */
  __updatedBy?: string;
}

/**
 * Organization configuration record.
 * Contains core organizational settings including name, branding, and user profile configuration.
 * This appears under the ORGANIZATION_CONFIG tab in the UI.
 */
export interface OrganizationConfigRecord extends BaseConfigurationRecord {
  /**
   * Specifies that this is an organization configuration record.
   */
  OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG;
  
  /**
   * The display name of the organization.
   */
  Name?: string;
  
  /**
   * The team name associated with the organization.
   */
  TeamName?: string;
  
  /**
   * URL-friendly identifier for the organization.
   */
  Slug?: string;
  
  /**
   * Abbreviated name for the organization.
   */
  ShortName?: string;
  
  /**
   * URL to the organization's logo image.
   */
  LogoUrl?: string;
  
  /**
   * Root URL for the organization's fan website.
   */
  FanWebRootUrl?: string;
  
  /**
   * Primary brand color for the organization, typically in hex format (e.g., #FF5733).
   */
  BrandColor?: string;
  
  /**
   * External provider identifier for SSO integration.
   */
  ExternalProviderId?: string;
  
  /**
   * Link to the organization's social media page.
   */
  SocialLink?: string;
  
  /**
   * Link to the organization's donation page.
   */
  DonateLink?: string;
  
  /**
   * Configuration for purchase options displayed to users.
   */
  BuyTabs?: BuyTab[];
  
  /**
   * Configuration for user profile fields.
   */
  Profile?: ProfileField[];
  
  /**
   * Configuration for customer service contact information.
   */
  CustomerServiceConfig?: CustomerServiceConfig;
}

/**
 * Client configuration record.
 * Contains general client settings applicable across all platforms.
 * This appears under the CLIENT_CONFIG tab in the UI.
 */
export interface ClientConfigRecord extends BaseConfigurationRecord {
  /**
   * Specifies that this is a client configuration record.
   */
  OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG;
  
  /**
   * Public API key for Amplitude Experiments integration.
   */
  PublicAmplitudeExperimentsKey?: string;
  
  /**
   * Public write key for Segment analytics integration.
   */
  PublicSegmentWriteKey?: string;
  
  /**
   * Configuration for Braze integration.
   */
  Braze?: BrazeConfig;
  
  /**
   * Configuration for organization court cash feature.
   */
  OrganizationCourtCash?: OrganizationCourtCashConfig;
  
  /**
   * Link to the organization's privacy policy.
   */
  PrivacyPolicyLink?: string;
  
  /**
   * Link to the organization's terms of service.
   */
  TermsLink?: string;
}

/**
 * iOS client configuration record.
 * Contains iOS-specific client settings.
 * This appears under the CLIENT_CONFIG_IOS tab in the UI.
 */
export interface ClientConfigIOSRecord extends BaseConfigurationRecord {
  /**
   * Specifies that this is an iOS client configuration record.
   */
  OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS;
  
  /**
   * Link to the organization's iOS app in the App Store.
   */
  IosStoreLink?: string;
}

/**
 * Android client configuration record.
 * Contains Android-specific client settings.
 * This appears under the CLIENT_CONFIG_ANDROID tab in the UI.
 */
export interface ClientConfigAndroidRecord extends BaseConfigurationRecord {
  /**
   * Specifies that this is an Android client configuration record.
   */
  OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID;
  
  /**
   * Link to the organization's Android app in the Google Play Store.
   */
  AndroidStoreLink?: string;
}

/**
 * Union type of all configuration record types.
 * Represents any valid configuration record in the system.
 * This is used throughout the application for type checking and validation.
 */
export type ConfigurationRecord = 
  | OrganizationConfigRecord
  | ClientConfigRecord
  | ClientConfigIOSRecord
  | ClientConfigAndroidRecord;

/**
 * Creates a default configuration record for a given organization ID and configuration type.
 * This is used when creating a new organization or adding a missing configuration type to an existing organization.
 * 
 * @param organizationId - The unique identifier for the organization
 * @param configType - The type of configuration to create
 * @returns A new configuration record with default values
 */
export function createDefaultConfiguration(
  organizationId: string,
  configType: OrganizationConfigType
): ConfigurationRecord {
  // Base configuration with common fields
  const baseConfig: BaseConfigurationRecord = {
    OrganizationId: organizationId,
    OrganizationConfigType: configType,
    __createdAt: new Date().toISOString(),
    __updatedAt: new Date().toISOString(),
    __updatedBy: 'system',
  };

  // Create specific configuration type with default values
  switch (configType) {
    case OrganizationConfigType.ORGANIZATION_CONFIG:
      return {
        ...baseConfig,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
        Name: `Organization ${organizationId}`,
        Profile: [
          {
            FieldName: OrganizationFieldName.EMAIL,
            IsEditable: false,
            IsSSOUserEditable: false,
            IsRequired: true
          },
          {
            FieldName: OrganizationFieldName.FIRST_NAME,
            IsEditable: true,
            IsSSOUserEditable: true,
            IsRequired: true
          },
          {
            FieldName: OrganizationFieldName.LAST_NAME,
            IsEditable: true,
            IsSSOUserEditable: true,
            IsRequired: true
          }
        ],
        BuyTabs: [
          {
            Label: 'General',
            Slug: 'general',
            Type: 'general'
          }
        ],
        CustomerServiceConfig: {
          CustomerServicePhone: ''
        }
      };

    case OrganizationConfigType.CLIENT_CONFIG:
      return {
        ...baseConfig,
        OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG,
        OrganizationCourtCash: {
          Enabled: false
        },
        Braze: {
          PublicKey: '',
          BaseUrl: ''
        },
        PrivacyPolicyLink: '',
        TermsLink: ''
      };

    case OrganizationConfigType.CLIENT_CONFIG_IOS:
      return {
        ...baseConfig,
        OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS,
        IosStoreLink: ''
      };

    case OrganizationConfigType.CLIENT_CONFIG_ANDROID:
      return {
        ...baseConfig,
        OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID,
        AndroidStoreLink: ''
      };
    
    default:
      // This should never happen because we're using an enum, but TypeScript requires it
      throw new Error(`Unsupported configuration type: ${configType}`);
  }
}