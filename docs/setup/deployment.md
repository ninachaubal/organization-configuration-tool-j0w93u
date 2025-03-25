# Deployment Guide

This guide provides comprehensive instructions for deploying the Organization Configuration Management Tool to different environments. The application is designed to be deployed to AWS using a combination of AWS Amplify for hosting and AWS CDK for infrastructure management.

## Deployment Architecture

The application is deployed on AWS with the following components:

- **AWS Amplify**: Hosts the NextJS application with built-in CI/CD capabilities
- **Amazon DynamoDB**: Stores organization configuration data with on-demand capacity
- **Amazon CloudFront**: Provides content delivery and caching for improved performance
- **AWS IAM**: Manages security roles and permissions for AWS services
- **Amazon CloudWatch**: Monitors application health and performance

The infrastructure is defined as code using AWS CDK, enabling consistent and repeatable deployments across environments.

### Environment Strategy

The application supports three deployment environments:

1. **Development (dev)**: For active development and testing
2. **Testing (test)**: For integration testing and user acceptance testing (UAT)
3. **Production (prod)**: For live internal use

Each environment has its own configuration and AWS resources, isolated from other environments.

### Deployment Flow

The typical deployment flow follows this progression:

1. Changes are developed and tested locally
2. Changes are pushed to the development branch and deployed to the development environment
3. After testing, changes are promoted to the testing branch and deployed to the testing environment
4. After UAT approval, changes are promoted to the main branch and deployed to the production environment

This flow ensures that changes are thoroughly tested before reaching production.

## Prerequisites

Before deploying the application, ensure you have the following prerequisites:

- **AWS Account**: With appropriate permissions to create and manage resources
- **AWS CLI**: Installed and configured with appropriate credentials
- **Node.js**: Version 18 or later
- **npm**: Latest stable version
- **AWS CDK**: Installed globally (`npm install -g aws-cdk`)
- **jq**: Installed for JSON parsing in deployment scripts
- **Git**: For version control and accessing the repository

## Deployment Methods

The application can be deployed using two methods:

### Automated Deployment (CI/CD)

The repository includes GitHub Actions workflows for automated deployment to each environment:

- **Development**: Triggered by pushes to the `development` branch
- **Testing**: Triggered by pushes to the `testing` branch
- **Production**: Triggered by pushes to the `main` branch

These workflows handle building, testing, and deploying the application automatically.

```yaml
name: Deploy to Development

on:
  push:
    branches: [development]
    paths:
      - src/**
      - package.json
      - package-lock.json
      - yarn.lock
      - infrastructure/**
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: development
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      # Additional steps for building and deploying...
```

### Manual Deployment

For manual deployment, use the deployment script in the infrastructure directory:

```bash
./infrastructure/scripts/deploy.sh -e <environment> [-s <stack>]
```

Where:
- `<environment>` is one of: dev, test, prod
- `<stack>` (optional) is one of: all, dynamodb, iam, amplify, cloudfront, monitoring

If no stack is specified, all stacks will be deployed in the correct order.

## Environment Configuration

Each environment requires specific configuration:

### Environment Variables

The application requires environment variables to be set for each deployment environment. These variables are typically set in the AWS Amplify console or through the infrastructure as code.

For a complete list of environment variables, see [Environment Variables](./environment-variables.md).

Key environment variables include:

```
ORGANIZATION_CONFIGURATION_TABLE_NAME=<dynamodb-table-name>
AWS_REGION=<aws-region>
NODE_ENV=<environment>
```

### AWS Secrets

For GitHub Actions workflows, the following secrets must be configured in the repository settings:

- `AWS_ACCESS_KEY_ID`: AWS access key with deployment permissions
- `AWS_SECRET_ACCESS_KEY`: Corresponding AWS secret key
- `AWS_REGION`: AWS region for deployment
- `AWS_ACCOUNT_ID`: AWS account ID
- `ORGANIZATION_CONFIGURATION_TABLE_NAME`: Name of the DynamoDB table
- `DEV_APP_URL`: URL of the development environment
- `TEST_APP_URL`: URL of the testing environment
- `PROD_APP_URL`: URL of the production environment
- `SLACK_BOT_TOKEN`: Token for Slack notifications (optional)

### Infrastructure Configuration

Environment-specific infrastructure configuration is stored in JSON files in the `infrastructure/config` directory:

- `dev.json`: Development environment configuration
- `test.json`: Testing environment configuration
- `prod.json`: Production environment configuration

These files contain AWS account details, region settings, and application-specific parameters for each environment.

## Deployment Process

The deployment process consists of several steps:

### 1. Environment Preparation

Before the first deployment to an environment, the AWS environment must be bootstrapped for CDK:

```bash
./infrastructure/scripts/bootstrap-environment.sh -e <environment>
```

This script sets up the necessary AWS CDK bootstrap resources, configures AWS profiles, and prepares the environment for infrastructure deployment.

### 2. Infrastructure Deployment

Deploy the infrastructure using either the CI/CD pipeline or the manual deployment script. The infrastructure deployment creates or updates the following resources:

- DynamoDB table for organization configuration data
- IAM roles and policies for secure access
- AWS Amplify hosting for the NextJS application
- CloudFront distribution for content delivery
- CloudWatch resources for monitoring

The deployment order is important to respect dependencies between resources.

### 3. Application Deployment

The application is deployed to AWS Amplify, which handles building and hosting the NextJS application. The deployment process includes:

1. Building the backend code
2. Building the frontend code with environment-specific variables
3. Deploying the built application to AWS Amplify
4. Configuring the Amplify domain and build settings

### 4. Verification

After deployment, verify that the application is running correctly:

1. Check the AWS Amplify console for successful build and deployment
2. Access the application URL and verify it loads correctly
3. Test the API health endpoint: `<app-url>/api/health`
4. Run smoke tests or integration tests against the deployed environment

## Rollback Procedures

If a deployment fails or causes issues, you can roll back to a previous stable state:

### Automated Rollback

The CI/CD workflows include automated rollback for failed deployments. If a deployment fails, the workflow will attempt to roll back to the previous stable state.

### Manual Rollback

For manual rollback, use the rollback functionality in the deployment script:

```bash
./infrastructure/scripts/deploy.sh -e <environment> -s <stack> -r
```

Alternatively, you can roll back through the AWS Management Console:

1. Go to the AWS CloudFormation console
2. Select the stack that needs to be rolled back
3. Choose "Rollback" from the Actions menu
4. Confirm the rollback operation

### Application Rollback

To roll back the application without changing infrastructure:

1. Go to the AWS Amplify console
2. Select the application
3. Navigate to the Hosting tab
4. Find the previous successful deployment
5. Click "Redeploy this version"

## Monitoring and Logging

After deployment, monitor the application using AWS CloudWatch:

### CloudWatch Dashboard

A CloudWatch dashboard is created as part of the infrastructure deployment, providing visibility into:

- Amplify build and deployment status
- DynamoDB performance and throttling metrics
- CloudFront request and error metrics
- API response times and error rates

### Logs

Application logs are available in several locations:

- **Amplify Build Logs**: Build and deployment logs in the AWS Amplify console
- **Application Logs**: Runtime logs in CloudWatch Logs
- **Deployment Logs**: Infrastructure deployment logs in `/tmp/deploy-*.log`

### Alerts

CloudWatch alarms are configured for critical metrics with appropriate thresholds:

- DynamoDB throttling: >5 events in 5 minutes
- API error rate: >5% errors in 5 minutes
- API latency: >1s p95 latency for 5 minutes
- Amplify build failures: Any failure

Alarms trigger notifications to the configured email addresses and Slack channels.

## Troubleshooting

Common deployment issues and their solutions:

### Infrastructure Deployment Failures

If infrastructure deployment fails:

1. Check CloudFormation events in the AWS Management Console
2. Review deployment logs in `/tmp/deploy-*.log`
3. Verify AWS credentials and permissions
4. Check for syntax errors in CDK code
5. Ensure the environment is properly bootstrapped

### Application Build Failures

If the application build fails in AWS Amplify:

1. Check Amplify build logs for error messages
2. Verify environment variables are correctly set
3. Ensure dependencies are properly specified
4. Check for TypeScript or ESLint errors
5. Verify the build command is correct

### Runtime Issues

If the application runs but has issues:

1. Check CloudWatch logs for runtime errors
2. Verify DynamoDB table exists and has correct permissions
3. Check API responses for error messages
4. Verify environment variables are correctly set
5. Test API endpoints directly to isolate frontend vs. backend issues

## Security Considerations

When deploying the application, consider the following security aspects:

### Access Control

- Use IAM roles with least privilege access
- Secure AWS credentials in GitHub Secrets or AWS Secrets Manager
- Implement proper authentication for the application
- Restrict access to deployment environments

### Data Protection

- Ensure DynamoDB encryption is enabled
- Use HTTPS for all communication
- Implement proper input validation
- Configure appropriate security headers

### Compliance

- Follow organizational security policies
- Document deployment procedures for audit purposes
- Maintain deployment history and logs
- Implement proper monitoring and alerting

## Additional Resources

For more information, refer to the following resources:

- [Local Development Setup](./local-development.md)
- [Environment Variables](./environment-variables.md)
- [Infrastructure Documentation](../../infrastructure/README.md)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [NextJS Deployment Documentation](https://nextjs.org/docs/deployment)