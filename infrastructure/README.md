# Organization Configuration Management Tool - Infrastructure

This repository contains the infrastructure code and deployment scripts for the Organization Configuration Management Tool, an internal administrative interface for managing organization configurations within a multi-tenant system.

## Architecture Overview

The application is deployed on AWS using a combination of services to provide a secure, scalable, and maintainable infrastructure. The key components include:

- **AWS Amplify**: Hosts the NextJS application with built-in CI/CD capabilities
- **Amazon DynamoDB**: Stores organization configuration data with on-demand capacity
- **Amazon CloudFront**: Provides content delivery and caching for improved performance
- **AWS IAM**: Manages security roles and permissions for AWS services
- **Amazon CloudWatch**: Monitors application health and performance

The infrastructure is defined as code using AWS CDK, enabling consistent and repeatable deployments across environments.

## Infrastructure Components

The infrastructure is organized into several CDK stacks, each responsible for a specific aspect of the application:

### DynamoDB Stack

Provisions the DynamoDB table for storing organization configuration data with the following features:

- Single-table design with composite key structure
- Global Secondary Index for ExternalProviderId lookups
- On-demand capacity mode for automatic scaling
- Point-in-time recovery for backup and disaster recovery
- Retention policy to prevent accidental deletion

### IAM Stack

Creates IAM roles and policies for secure service-to-service authentication:

- Amplify service role with permissions to access DynamoDB and CloudWatch
- Lambda execution role for any serverless functions
- Least privilege access policies following security best practices

### Amplify Stack

Configures AWS Amplify for hosting the NextJS application:

- Automated builds and deployments from GitHub or CodeCommit
- Environment-specific build settings and environment variables
- Branch-specific configurations for development and production
- Custom domain configuration with HTTPS

### CloudFront Stack

Sets up CloudFront distribution for content delivery:

- HTTPS-only access with TLS 1.2 or higher
- Cache behaviors optimized for static and dynamic content
- Security headers including Content-Security-Policy
- Custom domain with Route 53 integration (optional)

### Monitoring Stack

Implements CloudWatch monitoring resources:

- Dashboard with metrics for all infrastructure components
- Alarms for critical metrics with appropriate thresholds
- SNS topics for alarm notifications
- Email subscriptions for alerts

## Environment Setup

The infrastructure supports multiple deployment environments (development, testing, production) with environment-specific configurations.

### Environment Configuration

Environment-specific settings are stored in JSON files in the `config` directory:

- `dev.json`: Development environment configuration
- `test.json`: Testing environment configuration
- `prod.json`: Production environment configuration

These files contain AWS account details, region settings, and application-specific parameters for each environment.

### Bootstrap Process

Before deploying the infrastructure, each environment must be bootstrapped using the `bootstrap-environment.sh` script:

```bash
./scripts/bootstrap-environment.sh -e <environment>
```

This script sets up the necessary AWS CDK bootstrap resources, configures AWS profiles, and prepares the environment for infrastructure deployment.

## Deployment

The infrastructure is deployed using the `deploy.sh` script, which handles environment-specific deployments, pre-deployment validation, and post-deployment verification.

### Deployment Process

To deploy the infrastructure to a specific environment:

```bash
./scripts/deploy.sh -e <environment> [-s <stack>]
```

Where:
- `<environment>` is one of: dev, test, prod
- `<stack>` (optional) is one of: all, dynamodb, iam, amplify, cloudfront, monitoring

If no stack is specified, all stacks will be deployed in the correct order.

### Deployment Order

When deploying all stacks, they are deployed in the following order to respect dependencies:

1. DynamoDB Stack
2. IAM Stack
3. Amplify Stack
4. CloudFront Stack
5. Monitoring Stack

### Rollback Procedures

If a deployment fails, the script will attempt to roll back to the previous stable state. Manual rollback can be performed using the AWS Management Console or by deploying a previous version of the infrastructure code.

## Backup and Disaster Recovery

The infrastructure includes backup and disaster recovery capabilities to protect against data loss and service disruptions.

### Backup Procedures

DynamoDB backups are managed using the `backup-dynamodb.sh` script:

```bash
./scripts/backup-dynamodb.sh -e <environment> [-r <retention_days>]
```

This script creates on-demand backups of the DynamoDB table and manages backup retention (default: 90 days).

In addition, point-in-time recovery is enabled for the DynamoDB table, allowing restoration to any point within the last 35 days.

### Disaster Recovery

The disaster recovery strategy includes:

- Application code: Stored in GitHub repository with version history
- DynamoDB data: Point-in-time recovery and on-demand backups
- Infrastructure: Defined as code in AWS CDK for rapid redeployment

Recovery procedures are documented in the operations runbook with the following objectives:
- Recovery Time Objective (RTO): 1 hour
- Recovery Point Objective (RPO): 24 hours

## Monitoring and Alerting

The application's health and performance are monitored using CloudWatch with the following components:

### CloudWatch Dashboard

A comprehensive dashboard displays metrics for all infrastructure components, including:

- Amplify build and deployment status
- DynamoDB performance and throttling metrics
- CloudFront request and error metrics
- API response times and error rates

### Alarms and Notifications

CloudWatch alarms are configured for critical metrics with appropriate thresholds:

- DynamoDB throttling: >5 events in 5 minutes
- API error rate: >5% errors in 5 minutes
- API latency: >1s p95 latency for 5 minutes
- Amplify build failures: Any failure

Alarms trigger notifications to the configured email addresses via SNS.

## Security Considerations

The infrastructure implements several security measures to protect the application and its data:

### Network Security

- HTTPS-only access with TLS 1.2 or higher
- Security headers including Content-Security-Policy
- CloudFront distribution with appropriate cache behaviors

### Identity and Access Management

- IAM roles with least privilege access
- Service-to-service authentication using IAM roles
- No hardcoded credentials in the codebase

### Data Protection

- DynamoDB encryption at rest using AWS-managed keys
- Secure transmission of data using HTTPS
- Backup and recovery procedures to prevent data loss

## Cost Optimization

The infrastructure is designed to minimize costs while maintaining performance and reliability:

### Resource Sizing

- DynamoDB on-demand capacity to pay only for what you use
- Amplify build caching to reduce build minutes
- CloudFront caching to reduce origin requests

### Cost Monitoring

- Resource tagging for cost allocation
- AWS Budgets for cost tracking
- Regular review of resource utilization

## Maintenance Procedures

Regular maintenance tasks to keep the infrastructure secure and up-to-date:

### Routine Maintenance

- Monthly dependency updates via automated PRs
- Security patching as needed
- Quarterly review of resource utilization and optimization

### Infrastructure Updates

To update the infrastructure code:

1. Make changes to the CDK code in the `cdk` directory
2. Test changes in the development environment
3. Promote changes to testing and production using the deployment pipeline
4. Monitor the deployment for any issues

## Troubleshooting

Common issues and their solutions:

### Deployment Failures

- Check CloudFormation events in the AWS Management Console
- Review deployment logs in `/tmp/deploy-*.log`
- Verify AWS credentials and permissions

### Application Issues

- Check Amplify build logs for build failures
- Review CloudWatch logs for application errors
- Verify DynamoDB capacity and throttling metrics

### Monitoring Alerts

- Investigate CloudWatch alarm details
- Check relevant logs and metrics
- Follow the incident response procedure in the operations runbook

## Getting Started

To set up the infrastructure for development:

### Prerequisites

- AWS CLI installed and configured
- Node.js 18+ and npm/yarn
- AWS CDK installed (`npm install -g aws-cdk`)
- jq installed for JSON parsing

### Initial Setup

1. Clone the repository
2. Navigate to the infrastructure directory
3. Bootstrap the development environment:
   ```bash
   ./scripts/bootstrap-environment.sh -e dev
   ```
4. Deploy the infrastructure:
   ```bash
   ./scripts/deploy.sh -e dev
   ```
5. Verify the deployment in the AWS Management Console

## Contributing

Guidelines for contributing to the infrastructure code:

- Follow the AWS CDK best practices
- Use the existing stack structure for new resources
- Update environment configurations as needed
- Test changes in the development environment before promoting to production
- Document any new infrastructure components or procedures

## References

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Amazon DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Amazon CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)