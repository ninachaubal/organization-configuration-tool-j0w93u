/**
 * Represents customer service contact information for an organization.
 * Used as part of the ORGANIZATION_CONFIG configuration type.
 */
export interface CustomerServiceConfig {
  /**
   * Phone number for customer service support.
   * Optional field that can be undefined if not set.
   */
  CustomerServicePhone?: string;
}