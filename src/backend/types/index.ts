/**
 * index.ts
 * 
 * Central export file for all TypeScript types, interfaces, and enums used in the backend
 * of the organization configuration management tool. This file aggregates and re-exports
 * type definitions from specialized type modules to provide a single import point for consumers.
 * 
 * This organization improves maintainability and reduces import complexity throughout the application.
 * Consumers can import all necessary types from a single location:
 * 
 * ```typescript
 * import { ApiEndpoint, ConfigurationRecord, AppErrorCode } from '@/backend/types';
 * ```
 * 
 * Rather than importing from multiple modules:
 * 
 * ```typescript
 * import { ApiEndpoint } from '@/backend/types/api';
 * import { ConfigurationRecord } from '@/backend/types/configuration';
 * import { AppErrorCode } from '@/backend/types/error';
 * ```
 */

// Re-export all API-related types
export * from './api';

// Re-export all configuration-related types
export * from './configuration';

// Re-export all error-related types
export * from './error';

// Re-export all request-related types
export * from './request';

// Re-export all response-related types
export * from './response';