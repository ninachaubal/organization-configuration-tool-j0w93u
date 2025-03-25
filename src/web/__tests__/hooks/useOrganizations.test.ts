import { renderHook } from '@testing-library/react-hooks'; // v8.0.1
import { waitFor } from '@testing-library/react'; // v14.0.0
import { setupServer } from 'msw/node'; // v1.0.0
import { rest } from 'msw'; // v1.0.0
import { useOrganizations } from '../../hooks/useOrganizations';
import { mockOrganizations, mockOrganizationsResponse } from '../../__mocks__/data';
import { handlers } from '../../__mocks__/api-handlers';

// Set up MSW server for API mocking
const server = setupServer(...handlers);

describe('useOrganizations', () => {
  // Start server before all tests
  beforeAll(() => server.listen());
  
  // Reset handlers after each test to ensure clean state
  afterEach(() => server.resetHandlers());
  
  // Clean up after all tests
  afterAll(() => server.close());

  test('should fetch organizations successfully', async () => {
    // Render the hook in an isolated test environment
    const { result } = renderHook(() => useOrganizations());
    
    // Wait for the asynchronous fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify that organizations data was fetched correctly
    expect(result.current.organizations).toEqual(mockOrganizations);
    expect(result.current.error).toBeNull();
  });

  test('should handle API errors', async () => {
    // Override the default handler to simulate a server error
    server.use(
      rest.get('/api/organizations', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Server error' })
        );
      })
    );
    
    const { result } = renderHook(() => useOrganizations());
    
    // Wait for the error to be processed
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify error handling behavior
    expect(result.current.organizations).toEqual([]);
    expect(result.current.error).not.toBeNull();
  });

  test('should show loading state initially', async () => {
    const { result } = renderHook(() => useOrganizations());
    
    // Immediately check the hook's initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.organizations).toEqual([]);
    
    // Wait for loading to complete for cleanup
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  test('should refetch organizations when refetch is called', async () => {
    const { result } = renderHook(() => useOrganizations());
    
    // Wait for initial data load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Set up mock to return updated data on the next fetch
    const updatedOrganizations = [
      ...mockOrganizations,
      { OrganizationId: 'org4', Name: 'New Organization' }
    ];
    
    server.use(
      rest.get('/api/organizations', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ organizations: updatedOrganizations })
        );
      })
    );
    
    // Manually trigger refetch
    await result.current.refetch();
    
    // Wait for refetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify that the data was updated
    expect(result.current.organizations).toEqual(updatedOrganizations);
    expect(result.current.error).toBeNull();
  });
});