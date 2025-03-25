# Environment Variables

This document provides a comprehensive reference for all environment variables used in the Organization Configuration Management Tool. Environment variables are used to configure the application for different environments (development, testing, production) without changing the code.

## Core Environment Variables

These environment variables are essential for the application to function correctly:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ORGANIZATION_CONFIGURATION_TABLE_NAME` | Yes | None | The name of the DynamoDB table that stores organization configuration data |
| `AWS_REGION` | Yes | `us-east-1` | The AWS region where the DynamoDB table is located |
| `NODE_ENV` | No | `development` | The environment mode (`development`, `test`, or `production`) |
| `NEXT_PUBLIC_API_BASE_URL` | No | `/api` | Base URL for API requests in the frontend |

## Development-Specific Variables

These variables are used only in development environments:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DYNAMODB_LOCAL_ENDPOINT` | No | None | Endpoint URL for DynamoDB Local (e.g., `http://localhost:8000`) |

When `DYNAMODB_LOCAL_ENDPOINT` is set and `NODE_ENV` is `development`, the application will connect to DynamoDB Local instead of AWS DynamoDB. This is useful for local development without requiring AWS credentials or incurring AWS costs.

## Authentication Variables

The application assumes external authentication is handled by the hosting environment. If you need to configure authentication for development or testing, you can use these variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AUTH_PROVIDER` | No | None | The authentication provider to use (if implementing custom auth) |
| `AUTH_REDIRECT_URL` | No | None | The URL to redirect to after authentication |

Note: These variables are not used in the default implementation and are provided for reference if custom authentication is implemented.

## AWS Credentials

When running in AWS environments (like AWS Amplify), the application uses the IAM role assigned to the service. For local development, you need to provide AWS credentials using one of these methods:

1. **Environment Variables**:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_SESSION_TOKEN`: Your AWS session token (if using temporary credentials)

2. **AWS Credentials File**:
   - Configure credentials in `~/.aws/credentials`
   - Set the `AWS_PROFILE` environment variable to specify which profile to use

3. **IAM Roles**:
   - When running on AWS services, use IAM roles instead of hardcoded credentials

For security reasons, never commit AWS credentials to version control. Use environment variables or AWS credential management tools.

## Environment Configuration Files

The application supports different methods for setting environment variables:

### NextJS `.env` Files

For the web application, you can use NextJS environment files:

- `.env`: Default values for all environments
- `.env.local`: Local overrides (not committed to version control)
- `.env.development`: Development environment values
- `.env.test`: Test environment values
- `.env.production`: Production environment values

### Infrastructure Configuration

For AWS infrastructure deployment, environment-specific configuration is stored in JSON files:

- `infrastructure/config/dev.json`: Development environment
- `infrastructure/config/test.json`: Testing environment
- `infrastructure/config/prod.json`: Production environment

These files contain AWS account details, region settings, and application-specific parameters used during CDK deployment.

## Setting Environment Variables

### Local Development

For local development, create a `.env.local` file in the `src/web` directory:

```
ORGANIZATION_CONFIGURATION_TABLE_NAME=OrganizationConfiguration
AWS_REGION=us-east-1
DYNAMODB_LOCAL_ENDPOINT=http://localhost:8000
```

To set up local development environment completely:

1. Clone the repository
2. Install dependencies with `npm install` or `yarn`
3. Create the `.env.local` file with the required environment variables
4. If using DynamoDB Local:
   - Install with `npm install -g dynamodb-local`
   - Start with `dynamodb-local -port 8000`
   - Set `DYNAMODB_LOCAL_ENDPOINT=http://localhost:8000`
5. Start the development server with `npm run dev` or `yarn dev`

### AWS Amplify Deployment

When deploying to AWS Amplify, set environment variables in the Amplify Console:

1. Navigate to the AWS Amplify Console
2. Select your application
3. Go to "Environment variables"
4. Add the required variables including:
   - `ORGANIZATION_CONFIGURATION_TABLE_NAME`
   - `AWS_REGION`
   - Any other application-specific variables
5. Save the environment variables
6. Redeploy the application for the changes to take effect

AWS Amplify will automatically apply these environment variables to your application during the build and deployment process.

### CI/CD Pipeline

In GitHub Actions workflows, set environment variables using the `env` key in workflow files or using GitHub Secrets for sensitive values:

```yaml
env:
  NODE_ENV: production
  ORGANIZATION_CONFIGURATION_TABLE_NAME: OrganizationConfiguration-Prod
  AWS_REGION: us-east-1
```

For sensitive values, use GitHub Secrets:

```yaml
steps:
  - name: Deploy to AWS
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Environment Variable Validation

The application validates required environment variables at startup. If a required variable is missing, the application will log an error and may fail to start.

The validation logic is implemented in `src/backend/config/environment.ts` and checks for these required variables:

- `ORGANIZATION_CONFIGURATION_TABLE_NAME`

You can add custom validation for additional variables by modifying the `validateRequiredEnvVars` function in that file.

## Environment-Specific Configurations

### Development Environment

```
NODE_ENV=development
ORGANIZATION_CONFIGURATION_TABLE_NAME=OrganizationConfiguration-Dev
AWS_REGION=us-east-1
DYNAMODB_LOCAL_ENDPOINT=http://localhost:8000  # Optional, for local DynamoDB
```

### Testing Environment

```
NODE_ENV=test
ORGANIZATION_CONFIGURATION_TABLE_NAME=OrganizationConfiguration-Test
AWS_REGION=us-east-1
```

### Production Environment

```
NODE_ENV=production
ORGANIZATION_CONFIGURATION_TABLE_NAME=OrganizationConfiguration-Prod
AWS_REGION=us-east-1
```

## Security Considerations

### Sensitive Information

Environment variables often contain sensitive information. Follow these security best practices:

1. **Never commit sensitive environment variables to version control**
2. **Use `.env.local` for local development** (it's in `.gitignore`)
3. **Use secrets management services** for production environments
4. **Limit access to environment configuration** in production
5. **Rotate credentials regularly** if using access keys

### Environment Variable Encryption

For production deployments, consider using AWS Systems Manager Parameter Store or AWS Secrets Manager to store sensitive configuration values securely.

In AWS Amplify, environment variables are encrypted at rest and in transit.

## Troubleshooting

### Common Issues

#### Missing Required Variables

If the application fails to start with an error about missing environment variables:

1. Check that all required variables are defined in your environment
2. Verify the spelling and case of variable names
3. Ensure the variables are accessible to the application process

#### DynamoDB Connection Issues

If you encounter DynamoDB connection errors:

1. Verify `AWS_REGION` matches the region where your DynamoDB table is located
2. Check that `ORGANIZATION_CONFIGURATION_TABLE_NAME` is correct
3. Ensure your AWS credentials have permission to access the table
4. If using DynamoDB Local, verify `DYNAMODB_LOCAL_ENDPOINT` is correct and the service is running

#### Environment-Specific Behavior

If the application behaves differently across environments:

1. Check `NODE_ENV` is set correctly for each environment
2. Verify environment-specific configuration is loaded correctly
3. Look for conditional logic based on environment in the code

## Additional Resources

- [NextJS Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [AWS SDK for JavaScript Configuration](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html)
- [DynamoDB Local Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- [AWS Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)