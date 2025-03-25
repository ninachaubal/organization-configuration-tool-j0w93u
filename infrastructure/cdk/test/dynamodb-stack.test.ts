import { App } from 'aws-cdk-lib'; // aws-cdk-lib@2.80.0
import { Template, Match } from 'aws-cdk-lib/assertions'; // aws-cdk-lib@2.80.0
import { RemovalPolicy } from 'aws-cdk-lib'; // aws-cdk-lib@2.80.0
import { AttributeType, BillingMode, ProjectionType } from 'aws-cdk-lib/aws-dynamodb'; // aws-cdk-lib@2.80.0
import { DynamoDBStack } from '../../lib/dynamodb-stack';

describe('DynamoDBStack', () => {
  test('creates a DynamoDB table with correct key schema', () => {
    // ARRANGE
    const app = new App({
      context: {
        environment: 'test'
      }
    });
    
    // ACT
    const stack = new DynamoDBStack(app, 'TestDynamoDBStack');
    
    // ASSERT
    const template = Template.fromStack(stack);
    
    // Verify the DynamoDB table is created
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    
    // Verify table name includes the environment
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'organization-configuration-test'
    });
    
    // Verify key schema
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'sk',
          KeyType: 'RANGE'
        }
      ],
      AttributeDefinitions: Match.arrayWith([
        {
          AttributeName: 'pk',
          AttributeType: 'S'
        },
        {
          AttributeName: 'sk',
          AttributeType: 'S'
        }
      ])
    });
  });

  test('configures the table with on-demand capacity (PAY_PER_REQUEST)', () => {
    // ARRANGE
    const app = new App();
    
    // ACT
    const stack = new DynamoDBStack(app, 'TestDynamoDBStack');
    
    // ASSERT
    const template = Template.fromStack(stack);
    
    // Verify billing mode
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PAY_PER_REQUEST'
    });
  });

  test('configures Global Secondary Index correctly', () => {
    // ARRANGE
    const app = new App();
    
    // ACT
    const stack = new DynamoDBStack(app, 'TestDynamoDBStack');
    
    // ASSERT
    const template = Template.fromStack(stack);
    
    // Verify GSI configuration
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: [
        {
          IndexName: 'gsi1',
          KeySchema: [
            {
              AttributeName: 'gsi1pk',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'gsi1sk',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          }
        }
      ],
      AttributeDefinitions: Match.arrayWith([
        {
          AttributeName: 'gsi1pk',
          AttributeType: 'S'
        },
        {
          AttributeName: 'gsi1sk',
          AttributeType: 'S'
        }
      ])
    });
  });

  test('enables point-in-time recovery and sets RETAIN removal policy', () => {
    // ARRANGE
    const app = new App();
    
    // ACT
    const stack = new DynamoDBStack(app, 'TestDynamoDBStack');
    
    // ASSERT
    const template = Template.fromStack(stack);
    
    // Verify point-in-time recovery is enabled
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      }
    });
    
    // Verify removal policy is set to RETAIN
    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Retain'
    });
  });

  test('exports table name and ARN as CloudFormation outputs', () => {
    // ARRANGE
    const app = new App();
    
    // ACT
    const stack = new DynamoDBStack(app, 'TestDynamoDBStack');
    
    // ASSERT
    const template = Template.fromStack(stack);
    
    // Verify CloudFormation outputs
    template.hasOutput('OrganizationConfigTableName', {
      Export: {
        Name: 'OrganizationConfigTableName'
      }
    });
    
    template.hasOutput('OrganizationConfigTableArn', {
      Export: {
        Name: 'OrganizationConfigTableArn'
      }
    });
  });
});