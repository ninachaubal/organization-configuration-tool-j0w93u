import { useState, useEffect, useCallback } from 'react'; // v18.0.0
import { Organization, UseOrganizationsReturn } from '../types/organization';
import { getOrganizations } from '../lib/api-client';

/**
 * Custom hook that fetches and manages the list of organizations
 * Provides organizations data, loading state, error handling, and refetch functionality
 * 
 * @returns {UseOrganizationsReturn} Object containing organizations array, loading state, error state, and refetch function
 */
export function useOrganizations(): UseOrganizationsReturn {
  // State for storing the list of organizations
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  
  // Loading state to track data fetching status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Error state to capture and expose any fetch errors
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches the list of organizations from the API
   * Memoized to prevent unnecessary re-renders
   */
  const fetchOrganizations = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API to get organizations
      const data = await getOrganizations();
      setOrganizations(data);
    } catch (err) {
      // Handle any errors during fetch
      setError(err instanceof Error 
        ? err 
        : new Error('Failed to fetch organizations'));
      
      // Keep the existing organizations data if there was an error
    } finally {
      // Always set loading to false when done
      setIsLoading(false);
    }
  }, []);

  // Fetch organizations when the component mounts
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Return the organizations, loading state, error state, and refetch function
  return {
    organizations,
    isLoading,
    error,
    refetch: fetchOrganizations
  };
}