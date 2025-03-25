# Configuration API Endpoints

This document describes the API endpoints for managing organization configurations in the configuration management tool.

## Base URL

All API endpoints are relative to `/api`.

## Authentication

All API endpoints require authentication. The application assumes external authentication is in place.

## Get All Configurations

**Endpoint:** `GET /organizations/{id}/config`

Retrieves all configuration records for a specific organization.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Organization ID |

### Response

```json
{
  "success": true,
  "configs": [
    {
      "OrganizationId": "org1",
      "OrganizationConfigType": "ORGANIZATION_CONFIG",
      "Name": "Organization 1",
      "TeamName": "Team 1",
      "Slug": "org-1",
      "ShortName": "Org1",
      "LogoUrl": "https://example.com/logo.png",
      "FanWebRootUrl": "https://example.com",
      "BrandColor": "#FF5733",
      "ExternalProviderId": "ext-123",
      "BuyTabs": [
        {
          "Label": "Season Tickets",
          "Slug": "season",
          "Type": "season"
        }
      ],
      "Profile": [
        {
          "FieldName": "EMAIL",
          "IsEditable": true,
          "IsSSOUserEditable": false,
          "IsRequired": true
        }
      ],
      "CustomerServiceConfig": {
        "CustomerServicePhone": "555-123-4567"
      },
      "__createdAt": "2023-01-01T00:00:00Z",
      "__updatedAt": "2023-01-01T00:00:00Z",
      "__updatedBy": "admin"
    },
    {
      "OrganizationId": "org1",
      "OrganizationConfigType": "CLIENT_CONFIG",
      "PublicAmplitudeExperimentsKey": "amplitude-key",
      "PublicSegmentWriteKey": "segment-key",
      "Braze": {
        "PublicKey": "braze-key",
        "BaseUrl": "https://braze.example.com"
      },
      "OrganizationCourtCash": {
        "Label": "Court Cash",
        "Enabled": true
      },
      "PrivacyPolicyLink": "https://example.com/privacy",
      "TermsLink": "https://example.com/terms",
      "__createdAt": "2023-01-01T00:00:00Z",
      "__updatedAt": "2023-01-01T00:00:00Z",
      "__updatedBy": "admin"
    },
    {
      "OrganizationId": "org1",
      "OrganizationConfigType": "CLIENT_CONFIG_IOS",
      "IosStoreLink": "https://apps.apple.com/app/id123456789",
      "__createdAt": "2023-01-01T00:00:00Z",
      "__updatedAt": "2023-01-01T00:00:00Z",
      "__updatedBy": "admin"
    },
    {
      "OrganizationId": "org1",
      "OrganizationConfigType": "CLIENT_CONFIG_ANDROID",
      "AndroidStoreLink": "https://play.google.com/store/apps/details?id=com.example.app",
      "__createdAt": "2023-01-01T00:00:00Z",
      "__updatedAt": "2023-01-01T00:00:00Z",
      "__updatedBy": "admin"
    }
  ]
}
```

### Error Responses

| Status Code | Description | Example |
|-------------|-------------|---------|
| 404 | Not Found - Organization with the specified ID does not exist | `{"success": false, "error": "Organization not found", "code": "NOT_FOUND"}` |
| 500 | Internal Server Error | `{"success": false, "error": "Failed to retrieve configurations", "code": "INTERNAL_ERROR"}` |

## Get Specific Configuration Type

**Endpoint:** `GET /organizations/{id}/config/{type}`

Retrieves a specific configuration type for an organization.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Organization ID |
| type | string | Configuration type (ORGANIZATION_CONFIG, CLIENT_CONFIG, CLIENT_CONFIG_IOS, CLIENT_CONFIG_ANDROID) |

### Response

```json
{
  "success": true,
  "config": {
    "OrganizationId": "org1",
    "OrganizationConfigType": "ORGANIZATION_CONFIG",
    "Name": "Organization 1",
    "TeamName": "Team 1",
    "Slug": "org-1",
    "ShortName": "Org1",
    "LogoUrl": "https://example.com/logo.png",
    "FanWebRootUrl": "https://example.com",
    "BrandColor": "#FF5733",
    "ExternalProviderId": "ext-123",
    "BuyTabs": [
      {
        "Label": "Season Tickets",
        "Slug": "season",
        "Type": "season"
      }
    ],
    "Profile": [
      {
        "FieldName": "EMAIL",
        "IsEditable": true,
        "IsSSOUserEditable": false,
        "IsRequired": true
      }
    ],
    "CustomerServiceConfig": {
      "CustomerServicePhone": "555-123-4567"
    },
    "__createdAt": "2023-01-01T00:00:00Z",
    "__updatedAt": "2023-01-01T00:00:00Z",
    "__updatedBy": "admin"
  }
}
```

### Error Responses

| Status Code | Description | Example |
|-------------|-------------|---------|
| 404 | Not Found - Organization or configuration type not found | `{"success": false, "error": "Configuration not found", "code": "NOT_FOUND"}` |
| 400 | Bad Request - Invalid configuration type | `{"success": false, "error": "Invalid configuration type", "code": "VALIDATION_ERROR"}` |
| 500 | Internal Server Error | `{"success": false, "error": "Failed to retrieve configuration", "code": "INTERNAL_ERROR"}` |

## Update Configuration

**Endpoint:** `PUT /organizations/{id}/config/{type}`

Updates a specific configuration type for an organization. Only the fields included in the request body will be updated.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Organization ID |
| type | string | Configuration type (ORGANIZATION_CONFIG, CLIENT_CONFIG, CLIENT_CONFIG_IOS, CLIENT_CONFIG_ANDROID) |

### Request Body

Object containing the fields to update. The structure depends on the configuration type.

**Note:** Empty fields (null, undefined, or empty string) will not be set in the database.

#### Example Request for ORGANIZATION_CONFIG

```json
{
  "Name": "Updated Organization Name",
  "BrandColor": "#00FF00",
  "BuyTabs": [
    {
      "Label": "Season Tickets",
      "Slug": "season",
      "Type": "season"
    },
    {
      "Label": "Single Game",
      "Slug": "single",
      "Type": "single",
      "GenreCode": "BASK"
    }
  ]
}
```

#### Example Request for CLIENT_CONFIG

```json
{
  "PublicAmplitudeExperimentsKey": "new-amplitude-key",
  "PrivacyPolicyLink": "https://example.com/updated-privacy"
}
```

#### Example Request for CLIENT_CONFIG_IOS

```json
{
  "IosStoreLink": "https://apps.apple.com/app/id987654321"
}
```

#### Example Request for CLIENT_CONFIG_ANDROID

```json
{
  "AndroidStoreLink": "https://play.google.com/store/apps/details?id=com.example.updated"
}
```

### Response

```json
{
  "success": true,
  "config": {
    "OrganizationId": "org1",
    "OrganizationConfigType": "ORGANIZATION_CONFIG",
    "Name": "Updated Organization Name",
    "TeamName": "Team 1",
    "Slug": "org-1",
    "ShortName": "Org1",
    "LogoUrl": "https://example.com/logo.png",
    "FanWebRootUrl": "https://example.com",
    "BrandColor": "#00FF00",
    "ExternalProviderId": "ext-123",
    "BuyTabs": [
      {
        "Label": "Season Tickets",
        "Slug": "season",
        "Type": "season"
      },
      {
        "Label": "Single Game",
        "Slug": "single",
        "Type": "single",
        "GenreCode": "BASK"
      }
    ],
    "Profile": [
      {
        "FieldName": "EMAIL",
        "IsEditable": true,
        "IsSSOUserEditable": false,
        "IsRequired": true
      }
    ],
    "CustomerServiceConfig": {
      "CustomerServicePhone": "555-123-4567"
    },
    "__createdAt": "2023-01-01T00:00:00Z",
    "__updatedAt": "2023-01-02T00:00:00Z",
    "__updatedBy": "admin"
  }
}
```

### Error Responses

| Status Code | Description | Example |
|-------------|-------------|---------|
| 404 | Not Found - Organization or configuration type not found | `{"success": false, "error": "Configuration not found", "code": "NOT_FOUND"}` |
| 400 | Bad Request - Invalid input data | `{"success": false, "error": "Validation error", "code": "VALIDATION_ERROR", "details": {"Name": "Name must be a string", "BuyTabs[1].Slug": "Slug is required"}}` |
| 500 | Internal Server Error | `{"success": false, "error": "Failed to update configuration", "code": "INTERNAL_ERROR"}` |

## Configuration Data Structures

The following sections describe the data structures for each configuration type.

### Base Configuration Fields

All configuration types include these base fields:

| Field | Type | Description |
|-------|------|-------------|
| OrganizationId | string | Unique identifier for the organization |
| OrganizationConfigType | string | Type of configuration (ORGANIZATION_CONFIG, CLIENT_CONFIG, CLIENT_CONFIG_IOS, CLIENT_CONFIG_ANDROID) |
| __createdAt | string (ISO date) | Timestamp when the configuration was created |
| __updatedAt | string (ISO date) | Timestamp when the configuration was last updated |
| __updatedBy | string | Identifier of the user who last updated the configuration |

### ORGANIZATION_CONFIG Fields

The ORGANIZATION_CONFIG type includes these fields:

| Field | Type | Description |
|-------|------|-------------|
| Name | string | Display name for the organization |
| TeamName | string | Name of the team associated with the organization |
| Slug | string | URL-friendly identifier for the organization |
| ShortName | string | Abbreviated name for the organization |
| LogoUrl | string (URL) | URL to the organization's logo image |
| FanWebRootUrl | string (URL) | Base URL for the organization's fan website |
| BrandColor | string (hex color) | Primary brand color for the organization |
| ExternalProviderId | string | Identifier for the organization in an external system |
| SocialLink | string (URL) | URL to the organization's social media page |
| DonateLink | string (URL) | URL to the organization's donation page |
| BuyTabs | array of BuyTab objects | Configuration for purchase options displayed to users |
| Profile | array of ProfileField objects | Configuration for user profile fields |
| CustomerServiceConfig | object | Configuration for customer service contact information |

### CLIENT_CONFIG Fields

The CLIENT_CONFIG type includes these fields:

| Field | Type | Description |
|-------|------|-------------|
| PublicAmplitudeExperimentsKey | string | API key for Amplitude Experiments |
| PublicSegmentWriteKey | string | Write key for Segment analytics |
| Braze | object | Configuration for Braze integration |
| OrganizationCourtCash | object | Configuration for the Court Cash feature |
| PrivacyPolicyLink | string (URL) | URL to the organization's privacy policy |
| TermsLink | string (URL) | URL to the organization's terms of service |

### CLIENT_CONFIG_IOS Fields

The CLIENT_CONFIG_IOS type includes these fields:

| Field | Type | Description |
|-------|------|-------------|
| IosStoreLink | string (URL) | URL to the organization's iOS app in the App Store |

### CLIENT_CONFIG_ANDROID Fields

The CLIENT_CONFIG_ANDROID type includes these fields:

| Field | Type | Description |
|-------|------|-------------|
| AndroidStoreLink | string (URL) | URL to the organization's Android app in the Google Play Store |

## Complex Data Structures

The following sections describe the structure of complex data types used in configuration records.

### BuyTab Object

Represents a purchase option displayed to users.

| Field | Type | Description |
|-------|------|-------------|
| Label | string | Display name for the purchase option |
| Slug | string | URL-friendly identifier for the purchase option |
| Type | string | Type of purchase option (e.g., 'season', 'single') |
| GenreCode | string | Optional code identifying the genre of the purchase option |

### ProfileField Object

Represents a field in the user profile.

| Field | Type | Description |
|-------|------|-------------|
| FieldName | string (enum) | Name of the profile field (EMAIL, FIRST_NAME, LAST_NAME, BIRTHDAY, PHONE_NUMBER) |
| IsEditable | boolean | Whether the field can be edited by users |
| IsSSOUserEditable | boolean | Whether the field can be edited by SSO users |
| IsRequired | boolean | Whether the field is required |

### CustomerServiceConfig Object

Configuration for customer service contact information.

| Field | Type | Description |
|-------|------|-------------|
| CustomerServicePhone | string | Phone number for customer service |

### BrazeConfig Object

Configuration for Braze integration.

| Field | Type | Description |
|-------|------|-------------|
| PublicKey | string | Public API key for Braze |
| BaseUrl | string (URL) | Base URL for Braze API |

### OrganizationCourtCashConfig Object

Configuration for the Court Cash feature.

| Field | Type | Description |
|-------|------|-------------|
| Label | string | Display name for the Court Cash feature |
| Enabled | boolean | Whether the Court Cash feature is enabled |

## Validation Rules

The following validation rules are applied to configuration data:

- OrganizationId is required and must match the ID in the URL path
- OrganizationConfigType is required and must match the type in the URL path
- URL fields must be valid URLs
- BuyTab objects must have Label, Slug, and Type fields
- ProfileField objects must have a valid FieldName from the OrganizationFieldName enum
- Boolean fields must be true or false

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

## Related Endpoints

See the [Organization API documentation](./organizations.md) for endpoints related to organization management.