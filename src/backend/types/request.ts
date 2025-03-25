/**
 * request.ts
 * 
 * Defines TypeScript interfaces for API request objects used in the organization configuration management tool.
 * This file provides standardized request type definitions to ensure consistent data handling across API routes.
 */

import { Organization } from '../models/Organization';
import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';
import { 
  BuyTab, 
  ProfileField, 
  CustomerServiceConfig,
  BrazeConfig,
  OrganizationCourtCashConfig
} from '../models/ConfigurationRecord';

/**
 * Base interface for all API request objects.
 * Provides common structure for request types throughout the application.
 */
export interface BaseRequest {
  // Base properties can be added here if needed
}

/**
 * Common pagination parameters for list requests.
 */
export interface PaginationParams {
  /**
   * Page number to retrieve (1-based indexing)
   */
  page: number;
  
  /**
   * Number of items per page
   */
  limit: number;
}

/**
 * Request type for listing organizations API endpoint.
 * GET /api/organizations
 */
export interface GetOrganizationsRequest extends BaseRequest {
  /**
   * Optional pagination parameters for the request
   */
  pagination?: PaginationParams;
}

/**
 * Request type for organization creation API endpoint.
 * POST /api/organizations
 */
export interface CreateOrganizationRequest extends BaseRequest {
  /**
   * Unique identifier for the organization
   */
  OrganizationId: string;
  
  /**
   * Display name of the organization
   */
  Name: string;
}

/**
 * Request type for retrieving all configuration types for an organization.
 * GET /api/organizations/{id}/config
 */
export interface GetOrganizationConfigRequest extends BaseRequest {
  /**
   * The organization identifier
   */
  OrganizationId: string;
}

/**
 * Request type for retrieving a specific configuration type.
 * GET /api/organizations/{id}/config/{type}
 */
export interface GetOrganizationConfigByTypeRequest extends BaseRequest {
  /**
   * The organization identifier
   */
  OrganizationId: string;
  
  /**
   * The type of configuration to retrieve
   */
  OrganizationConfigType: OrganizationConfigType;
}

/**
 * Base request type for configuration update API endpoint.
 * PUT /api/organizations/{id}/config/{type}
 */
export interface UpdateOrganizationConfigRequest extends BaseRequest {
  /**
   * The organization identifier
   */
  OrganizationId: string;
  
  /**
   * The type of configuration to update
   */
  OrganizationConfigType: OrganizationConfigType;
}

/**
 * Request body type for updating ORGANIZATION_CONFIG type.
 */
export interface UpdateOrganizationConfigBodyType {
  Name?: string;
  TeamName?: string;
  Slug?: string;
  ShortName?: string;
  LogoUrl?: string;
  FanWebRootUrl?: string;
  BrandColor?: string;
  ExternalProviderId?: string;
  SocialLink?: string;
  DonateLink?: string;
  BuyTabs?: BuyTab[];
  Profile?: ProfileField[];
  CustomerServiceConfig?: CustomerServiceConfig;
}

/**
 * Request body type for updating CLIENT_CONFIG type.
 */
export interface UpdateClientConfigBodyType {
  PublicAmplitudeExperimentsKey?: string;
  PublicSegmentWriteKey?: string;
  Braze?: BrazeConfig;
  OrganizationCourtCash?: OrganizationCourtCashConfig;
  PrivacyPolicyLink?: string;
  TermsLink?: string;
}

/**
 * Request body type for updating CLIENT_CONFIG_IOS type.
 */
export interface UpdateClientConfigIOSBodyType {
  IosStoreLink?: string;
}

/**
 * Request body type for updating CLIENT_CONFIG_ANDROID type.
 */
export interface UpdateClientConfigAndroidBodyType {
  AndroidStoreLink?: string;
}

/**
 * Union type for different configuration update request bodies based on OrganizationConfigType.
 */
export type UpdateOrganizationConfigRequestBody =
  | UpdateOrganizationConfigBodyType
  | UpdateClientConfigBodyType
  | UpdateClientConfigIOSBodyType
  | UpdateClientConfigAndroidBodyType;

/**
 * Generic interface for requests that support pagination.
 */
export interface RequestWithPagination {
  /**
   * The page number to retrieve (1-based)
   */
  page?: number;
  
  /**
   * The number of items per page
   */
  limit?: number;
}