# Organization API Endpoints

This document describes the API endpoints for managing organizations in the configuration management tool.

## Base URL

All API endpoints are relative to `/api`.

## Authentication

All API endpoints require authentication. The application assumes external authentication is in place.

## List Organizations

**Endpoint:** `GET /organizations`

Retrieves a list of all organizations with their IDs and names.

### Response

```json
{
  "success": true,
  "organizations": [
    {
      "OrganizationId": "org1",
      "Name": "Organization 1"
    },
    {
      "OrganizationId": "org2",
      "Name": "Organization 2"
    }
  ]
}
```

### Error Responses

| Status Code | Description | Example |
|-------------|-------------|---------|
| 500 | Internal Server Error | `{"success": false, "error": "Failed to retrieve organizations", "code": "INTERNAL_ERROR"}` |

## Create Organization

**Endpoint:** `POST /organizations`

Creates a new organization with default configurations for all configuration types.

### Request Body

```json
{
  "organizationId": "new-org",
  "name": "New Organization"
}
```

| Field | Type | Description |
|-------|------|-------------|
| organizationId | string | Unique identifier for the organization |
| name | string | Display name for the organization |

### Response

```json
{
  "success": true,
  "organization": {
    "OrganizationId": "new-org",
    "Name": "New Organization"
  }
}
```

### Error Responses

| Status Code | Description | Example |
|-------------|-------------|---------|
| 400 | Bad Request - Invalid input data | `{"success": false, "error": "Validation error", "code": "VALIDATION_ERROR", "details": {"organizationId": "Organization ID is required", "name": "Name is required"}}` |
| 409 | Conflict - Organization ID already exists | `{"success": false, "error": "Organization ID already exists", "code": "DUPLICATE_ENTITY"}` |
| 500 | Internal Server Error | `{"success": false, "error": "Failed to create organization", "code": "INTERNAL_ERROR"}` |

## Get Organization

**Endpoint:** `GET /organizations/{id}`

Retrieves a specific organization by ID.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Organization ID |

### Response

```json
{
  "success": true,
  "organization": {
    "OrganizationId": "org1",
    "Name": "Organization 1"
  }
}
```

### Error Responses

| Status Code | Description | Example |
|-------------|-------------|---------|
| 404 | Not Found - Organization with the specified ID does not exist | `{"success": false, "error": "Organization not found", "code": "NOT_FOUND"}` |
| 500 | Internal Server Error | `{"success": false, "error": "Failed to retrieve organization", "code": "INTERNAL_ERROR"}` |

## Organization Data Structure

The Organization object has the following structure:

| Field | Type | Description |
|-------|------|-------------|
| OrganizationId | string | Unique identifier for the organization |
| Name | string | Display name for the organization |

## Organization Creation Process

When a new organization is created, the system automatically creates default configuration records for all configuration types:

| Configuration Type | Description |
|-------------------|-------------|
| ORGANIZATION_CONFIG | Core organization details including name, branding, and profile settings |
| CLIENT_CONFIG | General client configuration settings including analytics keys and legal links |
| CLIENT_CONFIG_IOS | iOS-specific configuration settings |
| CLIENT_CONFIG_ANDROID | Android-specific configuration settings |

## Validation Rules

The following validation rules are applied to organization data:

- OrganizationId is required and must be unique
- Name is required
- OrganizationId cannot be changed after creation

## Organization Configuration Endpoints

The following endpoints are available for managing organization configurations:

| Endpoint | Description |
|----------|-------------|
| `GET /organizations/{id}/config` | Retrieves all configuration types for a specific organization |
| `GET /organizations/{id}/config/{type}` | Retrieves a specific configuration type for an organization |
| `PUT /organizations/{id}/config/{type}` | Updates a specific configuration type for an organization |

For detailed information about these endpoints, refer to the Configuration API documentation.

## Error Handling

All API endpoints return a consistent error format with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| success | boolean | Always false for error responses |
| error | string | Human-readable error message |
| code | string | Error code for programmatic handling |
| details | object (optional) | Additional error details, often field-specific validation errors |

## Rate Limiting

API endpoints have rate limiting applied. Exceeding the rate limit will result in a 429 Too Many Requests response.