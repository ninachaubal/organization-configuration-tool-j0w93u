/**
 * Types and interfaces for form handling in the organization configuration management tool
 * 
 * This file defines type definitions for forms used in the UI, including form value interfaces,
 * component props interfaces, and utility types for form submission and validation.
 * These types ensure type safety when working with forms across the application.
 */

import * as React from 'react'; // react version: ^18.0.0
import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';
import { OrganizationFieldName } from '../../backend/models/enums/OrganizationFieldName';
import { ConfigurationRecord } from './configuration';
import { z } from 'zod'; // zod version: ^3.0.0
import { UseFormReturn, FieldValues } from 'react-hook-form'; // react-hook-form version: ^7.0.0

/**
 * Interface for BuyTab configuration items used in forms
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
 * Interface for ProfileField configuration items used in forms
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
 * Interface for customer service configuration used in forms
 */
export interface CustomerServiceConfig {
  /** Customer service phone number */
  CustomerServicePhone?: string;
}

/**
 * Interface for Braze integration configuration used in forms
 */
export interface BrazeConfig {
  /** Public API key for Braze integration */
  PublicKey?: string;
  
  /** Base URL for Braze API */
  BaseUrl?: string;
}

/**
 * Interface for organization court cash feature configuration used in forms
 */
export interface OrganizationCourtCashConfig {
  /** Display label for court cash feature */
  Label?: string;
  
  /** Whether court cash feature is enabled */
  Enabled?: boolean;
}

/**
 * Interface for organization creation form values
 * 
 * Used when creating a new organization with the NewOrganizationForm component
 */
export interface OrganizationFormValues {
  /** Unique identifier for the organization */
  OrganizationId: string;
  
  /** Organization display name */
  Name: string;
}

/**
 * Interface for ORGANIZATION_CONFIG type form values
 * 
 * Contains core organization details, branding, and user-facing settings
 */
export interface OrganizationConfigFormValues {
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
 * Interface for CLIENT_CONFIG type form values
 * 
 * Contains general client settings applicable across platforms
 */
export interface ClientConfigFormValues {
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
 * Interface for CLIENT_CONFIG_IOS type form values
 * 
 * Contains iOS-specific client settings
 */
export interface ClientConfigIOSFormValues {
  /** Link to the iOS app in the App Store */
  IosStoreLink?: string;
}

/**
 * Interface for CLIENT_CONFIG_ANDROID type form values
 * 
 * Contains Android-specific client settings
 */
export interface ClientConfigAndroidFormValues {
  /** Link to the Android app in the Play Store */
  AndroidStoreLink?: string;
}

/**
 * Union type of all configuration form value types
 * 
 * Used to represent form values for any configuration type
 */
export type ConfigFormValues = 
  | OrganizationConfigFormValues 
  | ClientConfigFormValues 
  | ClientConfigIOSFormValues 
  | ClientConfigAndroidFormValues;

/**
 * Type for form submission handler functions
 * 
 * Provides a consistent type for form submit handlers throughout the application
 */
export type FormSubmitHandler<T extends FieldValues> = 
  (data: T) => void | Promise<void>;

/**
 * Props interface for the NewOrganizationForm component
 */
export interface NewOrganizationFormProps {
  /** Handler function called when the form is submitted */
  onSubmit: FormSubmitHandler<OrganizationFormValues>;
  
  /** Handler function called when the form is cancelled */
  onCancel: () => void;
  
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
}

/**
 * Props interface for the ConfigurationEditForm component
 */
export interface ConfigurationEditFormProps {
  /** The configuration record being edited */
  configData: ConfigurationRecord;
  
  /** Handler function called when the form is submitted */
  onSubmit: FormSubmitHandler<ConfigFormValues>;
  
  /** Handler function called when the form is cancelled */
  onCancel: () => void;
  
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
}

/**
 * Props interface for the useFormWithConfirmation hook
 * 
 * This hook provides form handling with a confirmation dialog before submission
 */
export interface FormWithConfirmationProps<T extends FieldValues> {
  /** Initial values for the form fields */
  defaultValues: Partial<T>;
  
  /** Handler function called when the form is submitted */
  onSubmit: FormSubmitHandler<T>;
  
  /** Handler function called when the form is cancelled */
  onCancel: () => void;
  
  /** Message to display in the confirmation dialog */
  confirmationMessage: string;
  
  /** Zod schema for form validation */
  schema: z.ZodType<T>;
}

/**
 * Return type interface for the useFormWithConfirmation hook
 */
export interface UseFormWithConfirmationReturn<T extends FieldValues> {
  /** Form methods from react-hook-form */
  formMethods: UseFormReturn<T>;
  
  /** Handler function to trigger form submission */
  handleSubmit: () => void;
  
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  
  /** Whether the confirmation dialog is open */
  isConfirmationOpen: boolean;
  
  /** State setter for controlling the confirmation dialog */
  setIsConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  /** Handler function when confirmation is accepted */
  handleConfirm: () => void;
  
  /** Handler function when confirmation is cancelled */
  handleCancel: () => void;
}