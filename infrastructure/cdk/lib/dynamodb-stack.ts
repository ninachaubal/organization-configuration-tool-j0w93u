import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib'; // aws-cdk-lib@2.80.0
import { Construct } from 'constructs'; // constructs@10.2.69
import { Table, AttributeType, BillingMode, ProjectionType } from 'aws-cdk-lib/aws-dynamodb'; // aws-cdk-lib@2.80.0

/**
 * CDK Stack that provisions and configures the DynamoDB table for organization configuration data.
 * This stack implements the single-table design pattern with a composite key structure
 * and a Global Secondary Index for efficient queries.
 */
export class DynamoDBStack extends Stack {
  /**
   * The DynamoDB table for organization configuration data
   */
  public readonly organizationConfigTable: Table;
  
  /**
   * The name of the DynamoDB table
   */
  public readonly tableName: string;

  /**
   * Creates a new instance of the DynamoDBStack
   * @param scope The parent construct
   * @param id The construct ID
   * @param props The stack properties
   */
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the DynamoDB table with appropriate settings
    this.organizationConfigTable = this.createOrganizationConfigTable();
    this.tableName = this.organizationConfigTable.tableName;

    // Export the table name and ARN as CloudFormation outputs
    // so they can be referenced by other stacks or external resources
    new CfnOutput(this, 'OrganizationConfigTableName', {
      value: this.organizationConfigTable.tableName,
      description: 'The name of the DynamoDB table for organization configuration',
      exportName: 'OrganizationConfigTableName',
    });

    new CfnOutput(this, 'OrganizationConfigTableArn', {
      value: this.organizationConfigTable.tableArn,
      description: 'The ARN of the DynamoDB table for organization configuration',
      exportName: 'OrganizationConfigTableArn',
    });
  }

  /**
   * Creates and configures the DynamoDB table for organization configuration data
   * @returns The created DynamoDB table
   */
  private createOrganizationConfigTable(): Table {
    // Determine the environment for table naming
    const environment = this.node.tryGetContext('environment') || 'dev';
    
    // Create the table with partition key (pk) and sort key (sk)
    // following the single-table design pattern
    const table = new Table(this, 'OrganizationConfigTable', {
      tableName: `organization-configuration-${environment}`,
      
      // The partition key is OrganizationId, which groups all configuration types
      // for an organization together for efficient querying
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      
      // The sort key is OrganizationConfigType, which differentiates between
      // different types of configuration for the same organization
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      
      // Using on-demand capacity mode (PAY_PER_REQUEST) allows the table to
      // automatically scale with traffic without requiring capacity planning
      billingMode: BillingMode.PAY_PER_REQUEST,
      
      // Enable point-in-time recovery for backup and fault tolerance
      // This allows restoration to any point within the last 35 days
      pointInTimeRecovery: true,
      
      // Optional TTL attribute for future use if we need to expire records
      timeToLiveAttribute: '__ttl',
      
      // Set the removal policy to RETAIN to prevent accidental deletion
      // of the table and its data during stack operations
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Add the GSI for ExternalProviderId lookups
    this.addGlobalSecondaryIndex(table);

    return table;
  }

  /**
   * Adds the Global Secondary Index for ExternalProviderId lookups.
   * This index enables efficient queries for organizations by their ExternalProviderId.
   * @param table The DynamoDB table
   */
  private addGlobalSecondaryIndex(table: Table): void {
    table.addGlobalSecondaryIndex({
      // The index name 'gsi1' matches the ElectroDB entity definition
      // to ensure compatibility with the application code
      indexName: 'gsi1',
      
      // The GSI partition key is ExternalProviderId
      partitionKey: {
        name: 'gsi1pk',
        type: AttributeType.STRING,
      },
      
      // The GSI sort key is a placeholder (empty string in most cases)
      sortKey: {
        name: 'gsi1sk',
        type: AttributeType.STRING,
      },
      
      // Include all attributes in the index to support rich queries
      projectionType: ProjectionType.ALL,
    });
  }
}