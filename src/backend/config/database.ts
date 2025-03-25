/**
 * Database configuration module
 * 
 * Configures and exports the AWS DynamoDB client and document client instances
 * for database operations. Supports both production AWS DynamoDB and
 * local development with DynamoDB Local.
 */

import { 
  DynamoDBClient, 
  CreateTableCommand 
} from '@aws-sdk/client-dynamodb'; // v3.400.0
import { 
  DynamoDBDocumentClient 
} from '@aws-sdk/lib-dynamodb'; // v3.400.0
import { 
  marshall, 
  unmarshall 
} from '@aws-sdk/util-dynamodb'; // v3.400.0
import { 
  env, 
  isDevelopment 
} from './environment';
import { 
  TABLE_NAMES 
} from './constants';

// Configure the DynamoDB client based on the environment
// In development with DynamoDB Local, use the local endpoint
// In production, use default AWS configuration
const dynamoDBClientConfig = {
  region: env.AWS_REGION,
  ...(isDevelopment() && env.DYNAMODB_LOCAL_ENDPOINT 
      ? { endpoint: env.DYNAMODB_LOCAL_ENDPOINT } 
      : {})
};

// Create the DynamoDB client with the appropriate configuration
const dynamoDBClient = new DynamoDBClient(dynamoDBClientConfig);

// Configure the DynamoDB document client with marshalling options
// - removeUndefinedValues: Removes undefined values from objects when converting to DynamoDB format
// - wrapNumbers: Set to false to return numbers as native JavaScript numbers instead of objects
const documentClientConfig = {
  marshallOptions: {
    removeUndefinedValues: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
};

// Create the document client from the basic client
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient, documentClientConfig);

/**
 * Ensures that the required DynamoDB table exists in the local development environment
 * 
 * This function only runs in development when DYNAMODB_LOCAL_ENDPOINT is set.
 * It creates the organization configuration table if it doesn't exist.
 */
const ensureTableExists = async (): Promise<void> => {
  // Only run this function in development with DynamoDB Local
  if (!(isDevelopment() && env.DYNAMODB_LOCAL_ENDPOINT)) {
    return;
  }

  try {
    // Define the table schema
    const createTableCommand = new CreateTableCommand({
      TableName: TABLE_NAMES.ORGANIZATION_CONFIGURATION,
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' }, // Partition key
        { AttributeName: 'sk', KeyType: 'RANGE' }, // Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
        { AttributeName: 'gsi1pk', AttributeType: 'S' },
        { AttributeName: 'gsi1sk', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'bySSOId',
          KeySchema: [
            { AttributeName: 'gsi1pk', KeyType: 'HASH' },
            { AttributeName: 'gsi1sk', KeyType: 'RANGE' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });

    // Try to create the table
    await dynamoDBClient.send(createTableCommand);
    console.log(`Table ${TABLE_NAMES.ORGANIZATION_CONFIGURATION} created successfully`);
  } catch (error) {
    // Ignore the error if the table already exists
    if (error instanceof Error && error.name === 'ResourceInUseException') {
      console.log(`Table ${TABLE_NAMES.ORGANIZATION_CONFIGURATION} already exists`);
    } else {
      console.error('Error creating table:', error);
      throw error;
    }
  }
};

// Export the configured clients and utility function
export {
  dynamoDBClient,
  documentClient,
  ensureTableExists,
};