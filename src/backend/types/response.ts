/**
 * response.ts
 * 
 * Defines TypeScript interfaces for API response objects used in the organization configuration management tool.
 * This file provides standardized response type definitions to ensure consistent data handling across API routes.
 */

import { Organization } from '../models/Organization';
import { ConfigurationRecord } from '../models/ConfigurationRecord';
import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';
import { ErrorResponse } from './error';

/**
 * Base interface for all API responses.
 * All response interfaces should extend this to ensure consistency.
 */
export interface BaseResponse {
  /**
   * Indicates whether the API request was successful or not.
   */
  success: boolean;
}

/**
 * Generic interface for paginated API responses.
 * Used for endpoints that return collections of items with pagination.
 * 
 * @template T - The type of items in the response data array
 */
export interface PaginatedResponse<T> extends BaseResponse {
  /**
   * Array of items returned by the API.
   */
  data: T[];
  
  /**
   * Pagination information.
   */
  pagination: {
    /**
     * Current page number.
     */
    page: number;
    
    /**
     * Number of items per page.
     */
    limit: number;
    
    /**
     * Total number of items available.
     */
    total: number;
    
    /**
     * Total number of pages available.
     */
    totalPages: number;
  };
}

/**
 * Response interface for the GET /api/organizations endpoint.
 * Returns a list of organizations available in the system.
 */
export interface GetOrganizationsResponse extends BaseResponse {
  /**
   * List of organizations.
   */
  organizations: Organization[];
}

/**
 * Response interface for the POST /api/organizations endpoint.
 * Returns the newly created organization.
 */
export interface CreateOrganizationResponse extends BaseResponse {
  /**
   * The newly created organization.
   */
  organization: Organization;
}

/**
 * Response interface for the GET /api/organizations/{id}/config endpoint.
 * Returns all configuration records for a specific organization.
 */
export interface GetOrganizationConfigResponse extends BaseResponse {
  /**
   * List of all configuration records for the organization.
   */
  configs: ConfigurationRecord[];
}

/**
 * Response interface for the GET /api/organizations/{id}/config/{type} endpoint.
 * Returns a specific configuration record by type.
 */
export interface GetOrganizationConfigByTypeResponse extends BaseResponse {
  /**
   * The requested configuration record.
   */
  config: ConfigurationRecord;
}

/**
 * Response interface for the PUT /api/organizations/{id}/config/{type} endpoint.
 * Returns the updated configuration record.
 */
export interface UpdateOrganizationConfigResponse extends BaseResponse {
  /**
   * The updated configuration record.
   */
  config: ConfigurationRecord;
}

/**
 * Response interface for health check endpoints.
 * Used to verify API and system health status.
 */
export interface HealthCheckResponse extends BaseResponse {
  /**
   * Health status message.
   */
  status: string;
  
  /**
   * Timestamp when the health check was performed.
   */
  timestamp: string;
  
  /**
   * Optional details about system health components.
   */
  details?: Record<string, any>;
}

/**
 * Union type representing all possible API response types.
 * Used for type checking and validation throughout the application.
 */
export type ApiResponseTypes =
  | GetOrganizationsResponse
  | CreateOrganizationResponse
  | GetOrganizationConfigResponse
  | GetOrganizationConfigByTypeResponse
  | UpdateOrganizationConfigResponse
  | HealthCheckResponse
  | ErrorResponse;