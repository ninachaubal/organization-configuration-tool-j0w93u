/**
 * Organization.ts
 * 
 * Defines the core Organization interface which represents the structure of an organization entity
 * in the multi-tenant application. This model is used throughout the application for organization
 * selection, display, and creation operations.
 */

/**
 * Represents an organization entity in the multi-tenant application.
 * 
 * This interface is used for:
 * - Organization selection in the dropdown interface (F-001)
 * - Creating new organizations (F-002)
 * - Core data structure for organization entities
 * 
 * Note: Organization configurations are stored separately using the OrganizationConfigType enum
 * to categorize different types of configuration (ORGANIZATION_CONFIG, CLIENT_CONFIG, etc.)
 */
export interface Organization {
  /**
   * Unique identifier for the organization
   * This ID is used as the partition key in DynamoDB and must be unique across all organizations.
   * It forms part of the composite key for configuration records, allowing all configuration types
   * to be grouped under a single organization.
   */
  OrganizationId: string;

  /**
   * Display name of the organization
   * This name is shown in the organization selection dropdown and throughout the UI.
   * Used for human-readable identification of the organization.
   */
  Name: string;
}