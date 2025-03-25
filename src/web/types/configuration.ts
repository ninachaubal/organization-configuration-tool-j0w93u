/**
 * Types and interfaces for organization configuration management
 * 
 * This file defines the TypeScript interfaces and types used for displaying,
 * editing, and managing different types of organization configurations in the UI.
 * It provides a type-safe representation of the data structures stored in DynamoDB.
 */

import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';
import { OrganizationFieldName } from '../../backend/models/enums/OrganizationFieldName';

/**
 * Defines the structure of a buy tab configuration item used in organization settings
 * 
 * BuyTabs represent different purchasing options displayed to users
 */
export interface BuyTab {
  /** Display label shown to users */
  Label: string;
  
  /** URL-friendly identifier for the tab */
  Slug: string;
  
  /** The type of purchase option */
  Type: string;
  
  /** Optional genre code for categorization */
  GenreCode?: string;
}

/**
 * Defines the structure of profile field configuration for organization users
 * 
 * These settings control which profile fields are available, editable, and required
 */
export interface ProfileField {
  /** The specific field name from the OrganizationFieldName enum */
  FieldName: OrganizationFieldName;
  
  /** Whether the field can be edited */
  IsEditable?: boolean;
  
  /** Whether SSO users can edit this field */
  IsSSOUserEditable?: boolean;
  
  /** Whether the field is required */
  IsRequired?: boolean;
}

/**
 * Defines the structure for customer service contact information in organization configuration
 */
export interface CustomerServiceConfig {
  /** Customer service phone number */
  CustomerServicePhone?: string;
}

/**
 * Defines the structure of Braze integration configuration settings used in CLIENT_CONFIG type
 */
export interface BrazeConfig {
  /** Public API key for Braze integration */
  PublicKey?: string;
  
  /** Base URL for Braze API */
  BaseUrl?: string;
}

/**
 * Defines the structure of organization court cash configuration settings
 */
export interface OrganizationCourtCashConfig {
  /** Display label for court cash feature */
  Label?: string;
  
  /** Whether court cash feature is enabled */
  Enabled?: boolean;
}

/**
 * Defines the base fields common to all configuration record types
 * 
 * These fields are present in every configuration record regardless of type
 */
export interface BaseConfigurationRecord {
  /** Unique identifier for the organization */
  OrganizationId: string;
  
  /** Type of configuration record */
  OrganizationConfigType: OrganizationConfigType;
  
  /** Timestamp when the record was created */
  __createdAt?: string;
  
  /** Timestamp when the record was last updated */
  __updatedAt?: string;
  
  /** Identifier of the user who last updated the record */
  __updatedBy?: string;
}

/**
 * Defines the structure of the ORGANIZATION_CONFIG configuration type
 * 
 * Contains core organization details, branding, and user-facing settings
 */
export interface OrganizationConfigRecord extends BaseConfigurationRecord {
  /** Specifies this is an organization config record */
  OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG;
  
  /** Organization display name */
  Name?: string;
  
  /** Team name for the organization */
  TeamName?: string;
  
  /** URL-friendly identifier */
  Slug?: string;
  
  /** Abbreviated name for the organization */
  ShortName?: string;
  
  /** URL to the organization's logo */
  LogoUrl?: string;
  
  /** Root URL for the organization's fan website */
  FanWebRootUrl?: string;
  
  /** Primary brand color in hex format (#RRGGBB) */
  BrandColor?: string;
  
  /** External provider identifier for SSO */
  ExternalProviderId?: string;
  
  /** Social media link */
  SocialLink?: string;
  
  /** Donation link */
  DonateLink?: string;
  
  /** Configuration for purchase options */
  BuyTabs?: BuyTab[];
  
  /** Configuration for user profile fields */
  Profile?: ProfileField[];
  
  /** Customer service contact information */
  CustomerServiceConfig?: CustomerServiceConfig;
}

/**
 * Defines the structure of the CLIENT_CONFIG configuration type
 * 
 * Contains general client settings applicable across platforms
 */
export interface ClientConfigRecord extends BaseConfigurationRecord {
  /** Specifies this is a client config record */
  OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG;
  
  /** Public key for Amplitude experiments */
  PublicAmplitudeExperimentsKey?: string;
  
  /** Public write key for Segment analytics */
  PublicSegmentWriteKey?: string;
  
  /** Braze integration configuration */
  Braze?: BrazeConfig;
  
  /** Court cash feature configuration */
  OrganizationCourtCash?: OrganizationCourtCashConfig;
  
  /** Link to organization's privacy policy */
  PrivacyPolicyLink?: string;
  
  /** Link to organization's terms of service */
  TermsLink?: string;
}

/**
 * Defines the structure of the CLIENT_CONFIG_IOS configuration type
 * 
 * Contains iOS-specific client settings
 */
export interface ClientConfigIOSRecord extends BaseConfigurationRecord {
  /** Specifies this is an iOS client config record */
  OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS;
  
  /** Link to the iOS app in the App Store */
  IosStoreLink?: string;
}

/**
 * Defines the structure of the CLIENT_CONFIG_ANDROID configuration type
 * 
 * Contains Android-specific client settings
 */
export interface ClientConfigAndroidRecord extends BaseConfigurationRecord {
  /** Specifies this is an Android client config record */
  OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID;
  
  /** Link to the Android app in the Play Store */
  AndroidStoreLink?: string;
}

/**
 * Union type of all configuration record types
 * 
 * Represents any valid configuration record regardless of type
 */
export type ConfigurationRecord = 
  | OrganizationConfigRecord 
  | ClientConfigRecord 
  | ClientConfigIOSRecord 
  | ClientConfigAndroidRecord;

/**
 * Props interface for the ConfigurationDisplay component
 * 
 * Used to display a specific configuration record
 */
export interface ConfigurationDisplayProps {
  /** The configuration record to display */
  configData: ConfigurationRecord;
  
  /** Callback function when edit button is clicked */
  onEditClick: () => void;
  
  /** Whether the component is in a loading state */
  isLoading: boolean;
}

/**
 * Props interface for the ConfigurationTabs component
 * 
 * Used to display tabbed navigation for different configuration types
 */
export interface ConfigurationTabsProps {
  /** Array of configuration records or null if loading */
  configData: ConfigurationRecord[] | null;
  
  /** Currently active tab */
  activeTab: OrganizationConfigType;
  
  /** Callback function when a tab is changed */
  onTabChange: (tab: OrganizationConfigType) => void;
  
  /** Callback function when edit button is clicked */
  onEditClick: () => void;
  
  /** Whether the component is in a loading state */
  isLoading: boolean;
}

/**
 * Props interface for the ConfigurationEditForm component
 * 
 * Used for editing a configuration record
 */
export interface ConfigurationEditFormProps {
  /** The configuration record to edit */
  configData: ConfigurationRecord;
  
  /** Callback function when form is submitted */
  onSubmit: (data: Partial<ConfigurationRecord>) => Promise<void>;
  
  /** Callback function when editing is cancelled */
  onCancel: () => void;
  
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
}

/**
 * Interface for the API response when fetching organization configurations
 */
export interface ConfigurationsResponse {
  /** Array of configuration records */
  configs: ConfigurationRecord[];
}

/**
 * Interface for the API response when fetching a specific configuration type
 */
export interface ConfigurationResponse {
  /** The requested configuration record */
  config: ConfigurationRecord;
}

/**
 * Interface for the API response when updating a configuration
 */
export interface ConfigurationUpdateResponse {
  /** Whether the update was successful */
  success: boolean;
  
  /** The updated configuration record */
  config: ConfigurationRecord;
  
  /** Error message if the update failed */
  error?: string;
}