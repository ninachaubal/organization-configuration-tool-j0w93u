/**
 * ElectroDB Entities for DynamoDB Data Access
 * 
 * This file exports all ElectroDB entities and DynamoDB clients used for data access
 * throughout the application. It serves as the central export point for database 
 * interaction components, providing a clean abstraction layer for DynamoDB operations.
 * 
 * @file Central export point for ElectroDB entities and DynamoDB clients
 */

import { 
  OrganizationConfiguration,
  dynamoDbClient,
  documentClient
} from './OrganizationConfiguration';

// Export the ElectroDB entity for organization configuration data
export { OrganizationConfiguration };

// Export the DynamoDB clients for use in other parts of the application
export { dynamoDbClient, documentClient };