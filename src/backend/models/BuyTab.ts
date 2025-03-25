/**
 * Represents a buy tab configuration item in organization settings.
 * BuyTabs are part of the ORGANIZATION_CONFIG type and define purchasing options displayed to users.
 */
export interface BuyTab {
  /**
   * The display label for the buy tab
   */
  Label: string;
  
  /**
   * The URL-friendly identifier for the buy tab
   */
  Slug: string;
  
  /**
   * The type classification of the buy tab
   */
  Type: string;
  
  /**
   * Optional genre code associated with the buy tab
   */
  GenreCode?: string;
}