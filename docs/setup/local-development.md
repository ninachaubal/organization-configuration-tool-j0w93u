# Local Development Setup

This guide provides step-by-step instructions for setting up your local development environment for the Organization Configuration Management Tool. Following these instructions will help you get the application running locally for development and testing purposes.

## Prerequisites

Before you begin, ensure you have the following tools installed on your system:

- **Node.js**: Version 18 or later (as specified in `.nvmrc`)
- **npm** or **yarn**: Latest stable version
- **Git**: For version control
- **AWS CLI**: Configured with appropriate credentials
- **AWS Account**: With permissions to access DynamoDB

### Node.js and npm

We recommend using [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# Install and use the correct Node.js version
nvm install
nvm use
```

Verify your installation:

```bash
node --version # Should show v18.x.x
npm --version
```

### AWS CLI

Install the AWS CLI following the [official instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

Configure your AWS credentials:

```bash
aws configure
```

You'll need to provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json recommended)

## Clone the Repository

Clone the repository and navigate to the project directory:

```bash
git clone <repository-url>
cd organization-configuration-tool
```

## Project Structure

The project is organized as a monorepo with the following structure:

```
├── src/
│   ├── backend/     # Backend services and API routes
│   └── web/         # NextJS web application
├── infrastructure/  # AWS CDK infrastructure code
└── docs/           # Documentation
```

Each directory has its own `package.json` file and dependencies.

## Install Dependencies

Install dependencies for both the backend and frontend:

```bash
# Install backend dependencies
cd src/backend
npm install

# Install frontend dependencies
cd ../web
npm install
```

## Environment Configuration

Create a `.env.local` file in the `src/web` directory with the following content:

```
ORGANIZATION_CONFIGURATION_TABLE_NAME=OrganizationConfiguration
AWS_REGION=us-east-1
```

For a complete list of environment variables and their descriptions, see [Environment Variables](./environment-variables.md).

## DynamoDB Setup

You have two options for DynamoDB:

### Option 1: Use AWS DynamoDB

Ensure your AWS credentials have access to the DynamoDB table specified in your environment variables.

### Option 2: Use DynamoDB Local (Recommended for Development)

DynamoDB Local allows you to run DynamoDB on your local machine without connecting to AWS.

1. Install DynamoDB Local:

```bash
npm install -g dynamodb-local
```

2. Start DynamoDB Local:

```bash
dynamodb-local -port 8000
```

3. Update your `.env.local` file to use the local endpoint:

```
ORGANIZATION_CONFIGURATION_TABLE_NAME=OrganizationConfiguration
AWS_REGION=us-east-1
DYNAMODB_LOCAL_ENDPOINT=http://localhost:8000
```

The application will automatically create the required table in DynamoDB Local when it starts in development mode.

## Running the Application

Start the development server:

```bash
# From the src/web directory
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

The development server includes:
- Hot reloading for frontend changes
- API routes served from the same server
- Automatic table creation for DynamoDB Local (if configured)

## Development Workflow

### Making Changes

1. Create a new branch for your feature or bug fix
2. Make your changes to the code
3. Run tests to ensure your changes don't break existing functionality
4. Submit a pull request

### Running Tests

```bash
# Run backend tests
cd src/backend
npm test

# Run frontend tests
cd ../web
npm test
```

### Linting

```bash
# Lint backend code
cd src/backend
npm run lint

# Lint frontend code
cd ../web
npm run lint
```

## Infrastructure Development

If you need to modify the AWS infrastructure:

1. Install dependencies for the CDK project:

```bash
cd infrastructure/cdk
npm install
```

2. Bootstrap your AWS environment (first time only):

```bash
cd ../scripts
./bootstrap-environment.sh -e dev
```

3. Deploy infrastructure changes:

```bash
./deploy.sh -e dev
```

See the [infrastructure README](../../infrastructure/README.md) for more details.

## Troubleshooting

### Common Issues

#### DynamoDB Connection Issues

If you encounter DynamoDB connection issues:

- Verify your AWS credentials are correctly configured
- Check that the DynamoDB table exists and is accessible
- If using DynamoDB Local, ensure it's running on the specified port
- Verify the `ORGANIZATION_CONFIGURATION_TABLE_NAME` environment variable is set correctly

#### Node.js Version Issues

If you encounter Node.js compatibility issues:

- Ensure you're using Node.js 18 as specified in `.nvmrc`
- Run `nvm use` to switch to the correct version
- Delete `node_modules` and reinstall dependencies if necessary

#### NextJS Development Server Issues

If the development server fails to start:

- Check for errors in the console output
- Verify all required environment variables are set
- Ensure ports 3000 and 8000 (for DynamoDB Local) are available

## Additional Resources

- [NextJS Documentation](https://nextjs.org/docs)
- [ElectroDB Documentation](https://electrodb.dev/)
- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [DynamoDB Local Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)