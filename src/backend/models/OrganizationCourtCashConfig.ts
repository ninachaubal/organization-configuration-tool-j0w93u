/**
 * OrganizationCourtCashConfig.ts
 * 
 * This interface defines the structure for organization court cash configuration settings.
 * It's used within the CLIENT_CONFIG configuration type to manage organization-specific
 * court cash feature settings.
 */

/**
 * Represents the configuration for an organization's court cash feature.
 * 
 * @interface OrganizationCourtCashConfig
 * @property {string} [Label] - The display label for the court cash feature
 * @property {boolean} [Enabled] - Whether the court cash feature is enabled for the organization
 */
export interface OrganizationCourtCashConfig {
  /**
   * The display label for the court cash feature
   */
  Label?: string;
  
  /**
   * Whether the court cash feature is enabled for the organization
   */
  Enabled?: boolean;
}