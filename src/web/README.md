# Organization Configuration Management Tool - Web Frontend

## Overview

The web frontend for the Organization Configuration Management Tool is built with NextJS 14 and React 18, providing an intuitive interface for managing organization configurations in a multi-tenant system. It features organization selection, configuration viewing and editing, and new organization creation capabilities.

## Features

- Organization selection via dropdown interface
- Tab-based configuration display by configuration type
- Form-based configuration editing with validation
- New organization creation workflow
- Responsive design for various screen sizes
- Accessibility compliance with WCAG AA standards

## Project Structure

- `/app`: NextJS App Router pages and API routes
- `/components`: Reusable React components
  - `/ui`: Shadcn UI components
  - `/forms`: Form components for configuration editing
- `/hooks`: Custom React hooks for data fetching and form handling
- `/types`: TypeScript type definitions
- `/validators`: Zod validation schemas
- `/lib`: Utility functions and API client
- `/contexts`: React context providers
- `/providers`: Higher-order provider components
- `/__tests__`: Test files for components and utilities
- `/__mocks__`: Mock data and handlers for testing

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation
```bash
# Install dependencies
npm install
# or
yarn
```

### Development
```bash
# Start development server
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
ORGANIZATION_CONFIGURATION_TABLE_NAME=your-dynamodb-table-name
AWS_REGION=your-aws-region
```

## Key Components

- **OrganizationSelector**: Dropdown for selecting organizations
- **ConfigurationTabs**: Tab interface for different configuration types
- **ConfigurationDisplay**: Component for displaying configuration data
- **ConfigurationEditForm**: Form for editing configuration settings
- **NewOrganizationForm**: Form for creating new organizations

## API Routes

- `GET /api/organizations`: List all organizations
- `POST /api/organizations`: Create a new organization
- `GET /api/organizations/[id]/config`: Get all configuration types for an organization
- `GET /api/organizations/[id]/config/[type]`: Get a specific configuration type
- `PUT /api/organizations/[id]/config/[type]`: Update a specific configuration type

## Testing

```bash
# Run tests
npm run test
# or
yarn test

# Run tests with watch mode
npm run test:watch
# or
yarn test:watch

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage
```

## Building for Production

```bash
# Build the application
npm run build
# or
yarn build

# Start the production server
npm run start
# or
yarn start
```

## Deployment

The application is designed to be deployed using AWS Amplify, which provides a streamlined deployment process for NextJS applications. Refer to the deployment documentation in `/docs/setup/deployment.md` for detailed instructions.

## Contributing

1. Follow the project's code style and conventions
2. Write tests for new features and bug fixes
3. Ensure all tests pass before submitting pull requests
4. Update documentation as needed

## Architecture

The web frontend follows a layered architecture:

1. **UI Layer**: React components for presentation
2. **Form Management**: react-hook-form with zod for validation
3. **API Layer**: NextJS API routes for data operations
4. **Data Access Layer**: Services for DynamoDB interaction via ElectroDB