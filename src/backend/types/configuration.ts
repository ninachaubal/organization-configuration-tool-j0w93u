import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';
import { OrganizationFieldName } from '../models/enums/OrganizationFieldName';

/**
 * Defines the structure of a BuyTab configuration item used in organization settings
 */
export interface BuyTab {
  /** Display label for the buy tab */
  Label: string;
  
  /** URL slug for the buy tab */
  Slug: string;
  
  /** Type of the buy tab */
  Type: string;
  
  /** Optional genre code for categorization */
  GenreCode?: string;
}

/**
 * Defines the structure of a profile field configuration for an organization
 */
export interface ProfileField {
  /** The name of the profile field */
  FieldName: OrganizationFieldName;
  
  /** Whether the field is editable */
  IsEditable?: boolean;
  
  /** Whether SSO users can edit this field */
  IsSSOUserEditable?: boolean;
  
  /** Whether the field is required */
  IsRequired?: boolean;
}

/**
 * Defines the structure of customer service configuration settings
 */
export interface CustomerServiceConfig {
  /** Customer service phone number */
  CustomerServicePhone?: string;
}

/**
 * Defines the structure of Braze integration configuration settings
 */
export interface BrazeConfig {
  /** Braze public API key */
  PublicKey?: string;
  
  /** Braze API base URL */
  BaseUrl?: string;
}

/**
 * Defines the structure of court cash feature configuration settings
 */
export interface OrganizationCourtCashConfig {
  /** Display label for court cash feature */
  Label?: string;
  
  /** Whether the court cash feature is enabled */
  Enabled?: boolean;
}

/**
 * Defines the base fields common to all configuration record types
 */
export interface BaseConfigurationRecord {
  /** Unique identifier for the organization */
  OrganizationId: string;
  
  /** Type of configuration record */
  OrganizationConfigType: OrganizationConfigType;
  
  /** Creation timestamp */
  __createdAt?: string;
  
  /** Last update timestamp */
  __updatedAt?: string;
  
  /** User who last updated the record */
  __updatedBy?: string;
}

/**
 * Defines the structure of the ORGANIZATION_CONFIG configuration type
 */
export interface OrganizationConfigRecord extends BaseConfigurationRecord {
  /** Specifies this is an organization configuration record */
  OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG;
  
  /** Organization display name */
  Name?: string;
  
  /** Team name associated with the organization */
  TeamName?: string;
  
  /** URL slug for the organization */
  Slug?: string;
  
  /** Short name/abbreviation for the organization */
  ShortName?: string;
  
  /** URL to the organization's logo */
  LogoUrl?: string;
  
  /** Root URL for the organization's fan website */
  FanWebRootUrl?: string;
  
  /** Primary brand color in hexadecimal format */
  BrandColor?: string;
  
  /** External SSO provider ID */
  ExternalProviderId?: string;
  
  /** Social media link */
  SocialLink?: string;
  
  /** Donation link */
  DonateLink?: string;
  
  /** Array of buy tab configurations */
  BuyTabs?: BuyTab[];
  
  /** Array of profile field configurations */
  Profile?: ProfileField[];
  
  /** Customer service configuration settings */
  CustomerServiceConfig?: CustomerServiceConfig;
}

/**
 * Defines the structure of the CLIENT_CONFIG configuration type
 */
export interface ClientConfigRecord extends BaseConfigurationRecord {
  /** Specifies this is a client configuration record */
  OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG;
  
  /** Amplitude experiments public API key */
  PublicAmplitudeExperimentsKey?: string;
  
  /** Segment write key for public client usage */
  PublicSegmentWriteKey?: string;
  
  /** Braze integration configuration */
  Braze?: BrazeConfig;
  
  /** Court cash feature configuration */
  OrganizationCourtCash?: OrganizationCourtCashConfig;
  
  /** Privacy policy URL */
  PrivacyPolicyLink?: string;
  
  /** Terms of service URL */
  TermsLink?: string;
}

/**
 * Defines the structure of the CLIENT_CONFIG_IOS configuration type
 */
export interface ClientConfigIOSRecord extends BaseConfigurationRecord {
  /** Specifies this is an iOS client configuration record */
  OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS;
  
  /** App Store link for iOS app */
  IosStoreLink?: string;
}

/**
 * Defines the structure of the CLIENT_CONFIG_ANDROID configuration type
 */
export interface ClientConfigAndroidRecord extends BaseConfigurationRecord {
  /** Specifies this is an Android client configuration record */
  OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID;
  
  /** Play Store link for Android app */
  AndroidStoreLink?: string;
}

/**
 * Union type of all configuration record types,
 * representing any valid configuration record
 */
export type ConfigurationRecord = 
  | OrganizationConfigRecord
  | ClientConfigRecord
  | ClientConfigIOSRecord
  | ClientConfigAndroidRecord;