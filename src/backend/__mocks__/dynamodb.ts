import { jest } from 'jest';
import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { DynamoDBDocumentClient, SendCommand } from '@aws-sdk/lib-dynamodb';

// Create mock clients
const mockDynamoDBClient = { send: jest.fn() };
const mockDocumentClient = { send: jest.fn() };

// Storage for custom mock responses
let mockResponses: Record<string, any> = {};

/**
 * Sets up default implementations for all mock client methods
 */
const setupMockImplementations = (): void => {
  // Default implementation for DynamoDB client
  mockDynamoDBClient.send.mockImplementation((command) => {
    const commandName = command.constructor.name;
    if (mockResponses[commandName]) {
      return Promise.resolve(mockResponses[commandName]);
    }
    return Promise.resolve({});
  });

  // Default implementation for DynamoDB document client
  mockDocumentClient.send.mockImplementation((command) => {
    const commandName = command.constructor.name;
    if (mockResponses[commandName]) {
      return Promise.resolve(mockResponses[commandName]);
    }
    return Promise.resolve({});
  });
};

/**
 * Resets all DynamoDB mock functions to their initial state
 */
export const resetMocks = (): void => {
  mockDynamoDBClient.send.mockReset();
  mockDocumentClient.send.mockReset();
  mockResponses = {};
  setupMockImplementations();
};

/**
 * Sets a custom response for a specific DynamoDB command
 * @param commandName The name of the command (e.g., 'PutItemCommand')
 * @param response The response to return when this command is used
 */
export const setMockDynamoDBResponse = (commandName: string, response: any): void => {
  mockResponses[commandName] = response;
  mockDynamoDBClient.send.mockImplementation((command) => {
    if (command.constructor.name === commandName) {
      return Promise.resolve(response);
    }
    if (mockResponses[command.constructor.name]) {
      return Promise.resolve(mockResponses[command.constructor.name]);
    }
    return Promise.resolve({});
  });
};

/**
 * Sets a custom response for a specific DynamoDB document client command
 * @param commandName The name of the command (e.g., 'PutCommand')
 * @param response The response to return when this command is used
 */
export const setMockDocumentClientResponse = (commandName: string, response: any): void => {
  mockResponses[commandName] = response;
  mockDocumentClient.send.mockImplementation((command) => {
    if (command.constructor.name === commandName) {
      return Promise.resolve(response);
    }
    if (mockResponses[command.constructor.name]) {
      return Promise.resolve(mockResponses[command.constructor.name]);
    }
    return Promise.resolve({});
  });
};

/**
 * Configures a DynamoDB command to throw an error
 * @param commandName The name of the command
 * @param error The error to throw
 */
export const setMockDynamoDBError = (commandName: string, error: Error): void => {
  mockDynamoDBClient.send.mockImplementation((command) => {
    if (command.constructor.name === commandName) {
      return Promise.reject(error);
    }
    if (mockResponses[command.constructor.name]) {
      return Promise.resolve(mockResponses[command.constructor.name]);
    }
    return Promise.resolve({});
  });
};

/**
 * Configures a DynamoDB document client command to throw an error
 * @param commandName The name of the command
 * @param error The error to throw
 */
export const setMockDocumentClientError = (commandName: string, error: Error): void => {
  mockDocumentClient.send.mockImplementation((command) => {
    if (command.constructor.name === commandName) {
      return Promise.reject(error);
    }
    if (mockResponses[command.constructor.name]) {
      return Promise.resolve(mockResponses[command.constructor.name]);
    }
    return Promise.resolve({});
  });
};

/**
 * Returns all calls made to the DynamoDB client send method
 * @returns Array of call arguments
 */
export const getMockDynamoDBCalls = (): any[] => {
  return mockDynamoDBClient.send.mock.calls;
};

/**
 * Returns all calls made to the document client send method
 * @returns Array of call arguments
 */
export const getMockDocumentClientCalls = (): any[] => {
  return mockDocumentClient.send.mock.calls;
};

/**
 * Mock implementation of the function to ensure DynamoDB table exists
 * Used to simulate successful table creation or verification in tests
 */
export const ensureTableExists = jest.fn().mockResolvedValue(true);

// Initialize the default implementations
setupMockImplementations();

// Export the mock clients
export const dynamoDBClient = mockDynamoDBClient as unknown as DynamoDBClient;
export const documentClient = mockDocumentClient as unknown as DynamoDBDocumentClient;