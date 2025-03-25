# Organization Configuration Management Tool

A web-based internal administrative interface for managing organization configurations within a multi-tenant system.

## Overview

This tool enables authorized users to create, view, and edit configuration settings for different organizations (tenants) within the system. It provides a structured, user-friendly approach to organization setup and maintenance.

The application serves as an internal administrative interface that addresses the need for a standardized process to manage organization configurations, reducing manual errors and improving operational efficiency.

## Features

- Organization selection via dropdown interface
- Tab-based configuration display by type (ORGANIZATION_CONFIG, CLIENT_CONFIG, etc.)
- Form-based editing of organization settings with validation
- New organization creation with default configurations
- Comprehensive view of all settings for each organization

## Technology Stack

- **Frontend**: NextJS 14 (with app router), React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS, Shadcn UI components
- **Form Management**: react-hook-form with zod validation
- **Data Storage**: DynamoDB with ElectroDB
- **Infrastructure**: AWS (Amplify, DynamoDB, CloudFront)

## Project Structure

```
organization-config-tool/
├── app/                  # NextJS app router pages and components
│   ├── api/              # API routes
│   ├── organizations/    # Organization pages
│   └── layout.tsx        # Root layout
├── components/           # Reusable React components
│   ├── ui/               # UI components (Shadcn)
│   └── forms/            # Form components
├── lib/                  # Utility functions and shared code
│   ├── db/               # Database utilities and ElectroDB entities
│   ├── validation/       # Zod schemas
│   └── api/              # API client utilities
├── public/               # Static assets
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- AWS credentials with access to DynamoDB

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd organization-config-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Configure environment variables by creating a `.env.local` file:
   ```
   ORGANIZATION_CONFIGURATION_TABLE_NAME=your-dynamodb-table-name
   AWS_REGION=us-east-1
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Environment Variables

| Variable Name | Purpose | Required | Default |
|---------------|---------|----------|---------|
| ORGANIZATION_CONFIGURATION_TABLE_NAME | DynamoDB table name for organization configuration | Yes | None |
| AWS_REGION | AWS region for DynamoDB access | Yes | us-east-1 |
| NODE_ENV | Environment mode (development/production) | No | development |
| NEXT_PUBLIC_API_BASE_URL | Base URL for API requests | No | /api |

## Development

### Testing

Run the test suite:

```bash
# Run unit tests
npm test
# or
yarn test

# Run integration tests
npm run test:integration
# or
yarn test:integration

# Run E2E tests
npm run test:e2e
# or
yarn test:e2e
```

### DynamoDB Local (Optional)

For development without connecting to a real AWS DynamoDB instance:

1. Install DynamoDB Local:
   ```bash
   npm install -g dynamodb-local
   ```

2. Start DynamoDB Local:
   ```bash
   dynamodb-local -port 8000
   ```

3. Configure your application to use the local instance by adding the following to your `.env.local` file:
   ```
   DYNAMODB_ENDPOINT=http://localhost:8000
   ```

4. Create the necessary table structure using AWS CLI or a setup script.

## Deployment

The application is deployed using AWS Amplify with a CI/CD pipeline. When code is pushed to the main branch, it automatically triggers a build and deployment process.

For detailed deployment instructions, refer to the deployment documentation.

## Usage

After launching the application:

1. Select an organization from the dropdown menu to view its configuration
2. Navigate between different configuration types using the tabs
3. Click the "Edit" button to modify configuration settings
4. Use the "New Organization" button to create a new organization with default settings

## Documentation

Additional documentation:

- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## License

This project is proprietary and for internal use only.