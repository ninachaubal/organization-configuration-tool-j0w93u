/**
 * api.ts
 * 
 * This file defines the TypeScript interfaces and types for API operations in the
 * organization configuration management tool. It provides a centralized location for
 * API-related type definitions, combining request and response types with API-specific
 * utilities and helpers.
 */

import { Organization } from '../models/Organization';
import { ConfigurationRecord } from '../models/ConfigurationRecord';
import { OrganizationConfigType } from '../models/enums/OrganizationConfigType';
import { AppErrorCode, HttpStatusCode } from './error';

/**
 * Enum defining the available API endpoints in the application
 */
export enum ApiEndpoint {
  ORGANIZATIONS = '/api/organizations',
  ORGANIZATION_CONFIG = '/api/organizations/:id/config',
  ORGANIZATION_CONFIG_BY_TYPE = '/api/organizations/:id/config/:type',
  HEALTH = '/api/health',
  HEALTH_DB = '/api/health/db',
}

/**
 * Enum defining the HTTP methods used in API operations
 */
export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * Type definition for API route handler functions
 */
export type ApiHandler = (req: ApiRequest) => Promise<ApiResponse<any> | ApiErrorResponse>;

/**
 * Generic interface for API requests with method, endpoint, and optional data
 */
export interface ApiRequest {
  method: ApiMethod;
  endpoint: ApiEndpoint;
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Generic interface for API responses with status code and typed body
 */
export interface ApiResponse<T> {
  statusCode: HttpStatusCode;
  body: T;
  headers?: Record<string, string>;
}

/**
 * Interface for API error responses with status code and error details
 */
export interface ApiErrorResponse {
  statusCode: HttpStatusCode;
  body: {
    error: string;
    code: AppErrorCode;
    details?: Record<string, any>;
  };
}

/**
 * Configuration interface for API routes with endpoint, methods, and handler
 */
export interface ApiRouteConfig {
  endpoint: ApiEndpoint;
  methods: ApiMethod[];
  requiresAuth: boolean;
  handler: ApiHandler;
}

/**
 * Type for functions that build API endpoint URLs with parameters
 */
export type ApiEndpointBuilder = (params?: Record<string, string>) => string;

/**
 * Options interface for making API requests with optional parameters
 */
export interface ApiRequestOptions {
  params?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Interface for API client with methods for different HTTP operations
 */
export interface ApiClient {
  get<T>(endpoint: ApiEndpoint | string, options?: ApiRequestOptions): Promise<T>;
  post<T>(endpoint: ApiEndpoint | string, options?: ApiRequestOptions): Promise<T>;
  put<T>(endpoint: ApiEndpoint | string, options?: ApiRequestOptions): Promise<T>;
  delete<T>(endpoint: ApiEndpoint | string, options?: ApiRequestOptions): Promise<T>;
}

/**
 * Interface defining the structure of API endpoint URLs for the application
 */
export interface ApiEndpoints {
  organizations: {
    list: string;
    create: string;
    getById: (id: string) => string;
  };
  configurations: {
    getAll: (id: string) => string;
    getByType: (id: string, type: OrganizationConfigType) => string;
    update: (id: string, type: OrganizationConfigType) => string;
  };
  health: {
    check: string;
    db: string;
  };
}

/**
 * Response type for getting a list of organizations
 */
export interface GetOrganizationsResponse {
  organizations: Organization[];
}

/**
 * Response type for creating a new organization
 */
export interface CreateOrganizationResponse {
  success: boolean;
  organization?: Organization;
  error?: string;
}

/**
 * Response type for getting all configuration types for an organization
 */
export interface GetOrganizationConfigResponse {
  configs: ConfigurationRecord[];
}

/**
 * Response type for getting a specific configuration type for an organization
 */
export interface GetOrganizationConfigByTypeResponse {
  config: ConfigurationRecord;
}

/**
 * Response type for updating a configuration
 */
export interface UpdateOrganizationConfigResponse {
  success: boolean;
  config?: ConfigurationRecord;
  error?: string;
}

/**
 * Response type for health check endpoints
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  message?: string;
  details?: Record<string, any>;
}

/**
 * Interface mapping API endpoints to their response types for type safety
 */
export interface ApiResponseMapping {
  organizations: {
    list: GetOrganizationsResponse;
    create: CreateOrganizationResponse;
  };
  configurations: {
    getAll: GetOrganizationConfigResponse;
    getByType: GetOrganizationConfigByTypeResponse;
    update: UpdateOrganizationConfigResponse;
  };
  health: {
    check: HealthCheckResponse;
    db: HealthCheckResponse;
  };
}