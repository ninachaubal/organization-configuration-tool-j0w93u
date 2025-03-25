#!/usr/bin/env node
import { App, Tags } from 'aws-cdk-lib'; // v2.80.0
import { Environment } from 'aws-cdk-lib/core'; // v2.80.0
import * as fs from 'fs'; // N/A
import * as path from 'path'; // N/A

// Import stack classes
import { AmplifyStack } from '../lib/amplify-stack';
import { DynamoDBStack } from '../lib/dynamodb-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';
import { IAMStack } from '../lib/iam-stack';
import { MonitoringStack } from '../lib/monitoring-stack';

/**
 * Extracts the target environment from command line arguments
 * @returns Environment name (dev, test, or prod)
 */
function getEnvironmentFromArgs(): string {
  // Look for --env=X or -e X in the arguments
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    // Check for --env=X format
    if (args[i].startsWith('--env=')) {
      return args[i].split('=')[1];
    }
    
    // Check for --env X or -e X format
    if ((args[i] === '--env' || args[i] === '-e') && i + 1 < args.length) {
      return args[i + 1];
    }
  }
  
  // Default to 'dev' if no environment specified
  return 'dev';
}

/**
 * Loads environment-specific configuration from JSON files
 * @param environment Environment to load configuration for
 * @returns Configuration object with environment-specific settings
 */
function loadEnvironmentConfig(environment: string): any {
  // Determine config file path
  const configPath = path.join(__dirname, '..', 'config', `${environment}.json`);
  
  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.warn(`Config file for environment '${environment}' not found at ${configPath}, using defaults`);
    return {};
  }
  
  // Read and parse config file
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error(`Error loading config for environment '${environment}':`, error);
    return {};
  }
}

// Main execution block

// Determine target environment
const environment = getEnvironmentFromArgs();
console.log(`Deploying infrastructure for environment: ${environment}`);

// Load environment-specific configuration
const config = loadEnvironmentConfig(environment);

// Set up AWS environment (account and region)
const awsEnvironment: Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT || config.accountId,
  region: process.env.CDK_DEFAULT_REGION || config.region || 'us-east-1',
};

// Create the CDK app
const app = new App();

// Create stacks in order of dependency
const dynamoDBStack = new DynamoDBStack(app, `OrganizationConfig-DynamoDB-${environment}`, {
  env: awsEnvironment,
  // Pass any environment-specific DynamoDB configuration
  ...config.dynamoDB,
});

// IAM stack depends on DynamoDB stack
const iamStack = new IAMStack(app, `OrganizationConfig-IAM-${environment}`, {
  env: awsEnvironment,
  dynamoDBStack,
  // Pass any environment-specific IAM configuration
  ...config.iam,
});

// Amplify stack depends on IAM stack
const amplifyStack = new AmplifyStack(app, `OrganizationConfig-Amplify-${environment}`, {
  env: awsEnvironment,
  amplifyServiceRole: iamStack.amplifyServiceRole,
  // Pass any environment-specific Amplify configuration
  ...config.amplify,
});

// CloudFront stack depends on Amplify stack
const cloudFrontStack = new CloudFrontStack(app, `OrganizationConfig-CloudFront-${environment}`, {
  env: awsEnvironment,
  amplifyStack,
  // Pass any environment-specific CloudFront configuration
  customDomain: config.customDomain,
  enableIPv6: config.enableIPv6 !== false,
  ...config.cloudFront,
});

// Monitoring stack depends on all other stacks
const monitoringStack = new MonitoringStack(app, `OrganizationConfig-Monitoring-${environment}`, {
  env: awsEnvironment,
  amplifyStack,
  dynamoDBStack,
  cloudFrontStack,
  alarmEmailAddresses: config.alarmEmailAddresses || [],
  // Pass any environment-specific monitoring configuration
  ...config.monitoring,
});

// Apply environment tags to all resources
Tags.of(app).add('Environment', environment);
Tags.of(app).add('Application', 'OrganizationConfigTool');
Tags.of(app).add('ManagedBy', 'CDK');

// Apply any additional tags from configuration
if (config.tags) {
  Object.entries(config.tags).forEach(([key, value]) => {
    Tags.of(app).add(key, value as string);
  });
}

// Synthesize the CloudFormation templates
app.synth();