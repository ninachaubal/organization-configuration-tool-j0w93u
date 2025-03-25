import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib'; // aws-cdk-lib@2.80.0
import { Construct } from 'constructs'; // constructs@10.2.69
import { Role, ServicePrincipal, ManagedPolicy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam'; // aws-cdk-lib@2.80.0
import { DynamoDBStack } from './dynamodb-stack';

/**
 * Props for the IAMStack including the DynamoDB stack reference
 */
export interface IAMStackProps extends StackProps {
  /**
   * The DynamoDB stack containing the organization configuration table
   */
  dynamoDBStack: DynamoDBStack;
}

/**
 * CDK Stack that provisions and configures IAM roles and policies for the Organization Configuration Management Tool
 */
export class IAMStack extends Stack {
  /**
   * The IAM role for AWS Amplify service
   */
  public readonly amplifyServiceRole: Role;

  /**
   * The IAM role for Lambda functions
   */
  public readonly lambdaExecutionRole: Role;

  /**
   * The DynamoDB stack reference
   */
  private readonly dynamoDBStack: DynamoDBStack;

  /**
   * Creates a new instance of the IAMStack
   * @param scope The parent construct
   * @param id The construct ID
   * @param props The stack properties
   */
  constructor(scope: Construct, id: string, props: IAMStackProps) {
    super(scope, id, props);

    // Store the DynamoDB stack reference
    this.dynamoDBStack = props.dynamoDBStack;

    // Create the Amplify service role
    this.amplifyServiceRole = this.createAmplifyServiceRole();

    // Create the Lambda execution role
    this.lambdaExecutionRole = this.createLambdaExecutionRole();

    // Output the IAM role ARNs as CloudFormation outputs
    new CfnOutput(this, 'AmplifyServiceRoleArn', {
      value: this.amplifyServiceRole.roleArn,
      description: 'The ARN of the IAM role for AWS Amplify service',
      exportName: 'AmplifyServiceRoleArn',
    });

    new CfnOutput(this, 'LambdaExecutionRoleArn', {
      value: this.lambdaExecutionRole.roleArn,
      description: 'The ARN of the IAM role for Lambda functions',
      exportName: 'LambdaExecutionRoleArn',
    });
  }

  /**
   * Creates and configures the IAM role for AWS Amplify
   * @returns The created IAM role for Amplify
   */
  private createAmplifyServiceRole(): Role {
    // Create a new IAM role for AWS Amplify
    const role = new Role(this, 'AmplifyServiceRole', {
      roleName: `${this.stackName}-amplify-service-role`,
      assumedBy: new ServicePrincipal('amplify.amazonaws.com'),
      description: 'IAM role for AWS Amplify to manage resources for Organization Configuration Management Tool',
    });

    // Add AWS managed policies for Amplify
    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify')
    );

    // Add DynamoDB access policy
    role.addToPolicy(
      this.createDynamoDBAccessPolicy(this.dynamoDBStack.tableName)
    );

    // Add CloudWatch Logs access policy
    role.addToPolicy(this.createCloudWatchLogsPolicy());

    // Add additional policies for other services that Amplify may need
    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'ssm:GetParametersByPath',
          'ssm:GetParameters',
          'ssm:GetParameter',
        ],
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/amplify/*`],
      })
    );

    return role;
  }

  /**
   * Creates and configures the IAM role for Lambda functions
   * @returns The created IAM role for Lambda functions
   */
  private createLambdaExecutionRole(): Role {
    // Create a new IAM role for Lambda
    const role = new Role(this, 'LambdaExecutionRole', {
      roleName: `${this.stackName}-lambda-execution-role`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      description: 'IAM role for Lambda functions in the Organization Configuration Management Tool',
    });

    // Add AWS managed policy for Lambda basic execution
    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // Add DynamoDB access policy
    role.addToPolicy(
      this.createDynamoDBAccessPolicy(this.dynamoDBStack.tableName)
    );

    // Add CloudWatch Logs access policy
    role.addToPolicy(this.createCloudWatchLogsPolicy());

    return role;
  }

  /**
   * Creates a policy statement for DynamoDB access
   * @param tableName The name of the DynamoDB table
   * @returns The created policy statement for DynamoDB access
   */
  private createDynamoDBAccessPolicy(tableName: string): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'dynamodb:BatchGetItem',
        'dynamodb:BatchWriteItem',
        'dynamodb:ConditionCheckItem',
        'dynamodb:DeleteItem',
        'dynamodb:DescribeTable',
        'dynamodb:GetItem',
        'dynamodb:GetRecords',
        'dynamodb:PutItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:UpdateItem',
      ],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/${tableName}`,
        `arn:aws:dynamodb:${this.region}:${this.account}:table/${tableName}/index/*`,
      ],
    });
  }

  /**
   * Creates a policy statement for CloudWatch Logs access
   * @returns The created policy statement for CloudWatch Logs access
   */
  private createCloudWatchLogsPolicy(): PolicyStatement {
    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'logs:DescribeLogStreams',
      ],
      resources: [
        `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/amplify/*`,
        `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/*`,
      ],
    });
  }
}