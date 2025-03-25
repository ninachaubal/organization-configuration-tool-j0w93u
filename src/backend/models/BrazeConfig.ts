/**
 * BrazeConfig Interface
 * 
 * Defines the structure for Braze integration configuration settings within the CLIENT_CONFIG type.
 * This interface is used for storing and validating Braze-related configuration data
 * for organizations in the multi-tenant system.
 * 
 * @interface BrazeConfig
 * @property {string} PublicKey - The public API key used to authenticate with Braze services
 * @property {string} BaseUrl - The base URL endpoint for Braze API integration
 */
export interface BrazeConfig {
  /**
   * The public API key used to authenticate with Braze services
   */
  PublicKey?: string;
  
  /**
   * The base URL endpoint for Braze API integration
   */
  BaseUrl?: string;
}