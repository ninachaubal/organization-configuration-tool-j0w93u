/**
 * Mock implementation of ElectroDB Entity class for testing purposes.
 * This file enables unit testing of components that use ElectroDB entities
 * without requiring actual DynamoDB connections.
 */
import { jest } from 'jest';
import { dynamoDBClient, documentClient, resetMocks } from './dynamodb';

// Create mock implementations for all Entity methods
export const mockEntityInstance = {
  query: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  update: jest.fn(),
  scan: jest.fn(),
  batchGet: jest.fn()
};

// Create a mock constructor that returns the mock instance
const mockEntityConstructor = jest.fn().mockImplementation(() => mockEntityInstance);

/**
 * Resets all ElectroDB mock functions to their initial state.
 * Call this in beforeEach() to reset mocks between tests.
 */
export const resetElectroDBMocks = (): void => {
  // Reset DynamoDB mocks first
  resetMocks();
  
  // Reset all mock functions
  mockEntityInstance.query.mockReset();
  mockEntityInstance.get.mockReset();
  mockEntityInstance.put.mockReset();
  mockEntityInstance.update.mockReset();
  mockEntityInstance.scan.mockReset();
  mockEntityInstance.batchGet.mockReset();
  
  // Set up default implementations
  setupMockEntityImplementations();
};

/**
 * Sets up default implementations for all mock entity methods.
 * This provides sensible defaults for tests that don't need custom responses.
 */
const setupMockEntityImplementations = (): void => {
  // Default implementations return empty results
  mockEntityInstance.query.mockResolvedValue([]);
  mockEntityInstance.get.mockResolvedValue(null);
  mockEntityInstance.put.mockImplementation((data) => Promise.resolve(data));
  mockEntityInstance.update.mockImplementation((data) => Promise.resolve(data));
  mockEntityInstance.scan.mockResolvedValue([]);
  mockEntityInstance.batchGet.mockResolvedValue([]);
};

/**
 * Sets a custom response for the query method
 * @param response The response to return when query is called
 */
export const setMockQueryResponse = (response: any[]): void => {
  mockEntityInstance.query.mockResolvedValue(response);
};

/**
 * Sets a custom response for the get method
 * @param response The response to return when get is called
 */
export const setMockGetResponse = (response: any): void => {
  mockEntityInstance.get.mockResolvedValue(response);
};

/**
 * Sets a custom response for the put method
 * @param response The response to return when put is called
 */
export const setMockPutResponse = (response: any): void => {
  mockEntityInstance.put.mockResolvedValue(response);
};

/**
 * Sets a custom response for the update method
 * @param response The response to return when update is called
 */
export const setMockUpdateResponse = (response: any): void => {
  mockEntityInstance.update.mockResolvedValue(response);
};

/**
 * Sets a custom response for the scan method
 * @param response The response to return when scan is called
 */
export const setMockScanResponse = (response: any[]): void => {
  mockEntityInstance.scan.mockResolvedValue(response);
};

/**
 * Sets a custom response for the batchGet method
 * @param response The response to return when batchGet is called
 */
export const setMockBatchGetResponse = (response: any[]): void => {
  mockEntityInstance.batchGet.mockResolvedValue(response);
};

/**
 * Configures the query method to throw an error
 * @param error The error to throw when query is called
 */
export const setMockQueryError = (error: Error): void => {
  mockEntityInstance.query.mockRejectedValue(error);
};

/**
 * Configures the get method to throw an error
 * @param error The error to throw when get is called
 */
export const setMockGetError = (error: Error): void => {
  mockEntityInstance.get.mockRejectedValue(error);
};

/**
 * Configures the put method to throw an error
 * @param error The error to throw when put is called
 */
export const setMockPutError = (error: Error): void => {
  mockEntityInstance.put.mockRejectedValue(error);
};

/**
 * Configures the update method to throw an error
 * @param error The error to throw when update is called
 */
export const setMockUpdateError = (error: Error): void => {
  mockEntityInstance.update.mockRejectedValue(error);
};

/**
 * Mock implementation of ElectroDB Entity class.
 * This class mimics the ElectroDB Entity interface for testing purposes.
 */
export class Entity {
  /**
   * Creates a new mock Entity instance
   * @param config ElectroDB entity configuration
   */
  constructor(config: Record<string, any>) {
    // The constructor implementation is handled by Jest mock
    return mockEntityConstructor(config);
  }
}

// Initialize the default implementations
setupMockEntityImplementations();

// Re-export the mock DynamoDB clients
export { dynamoDBClient, documentClient };