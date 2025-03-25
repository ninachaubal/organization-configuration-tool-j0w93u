import { OrganizationConfigType } from '../../backend/models/enums/OrganizationConfigType';
import { OrganizationFieldName } from '../../backend/models/enums/OrganizationFieldName';

/**
 * Sample organization data for testing
 */
export const mockOrganizations = [
  {
    OrganizationId: 'org1',
    Name: 'Acme Sports',
  },
  {
    OrganizationId: 'org2',
    Name: 'Metro Athletics',
  },
  {
    OrganizationId: 'org3',
    Name: 'City Racers',
  },
];

/**
 * Common timestamp values for testing
 */
const createdAt = '2023-01-01T00:00:00Z';
const updatedAt = '2023-06-15T12:30:45Z';
const updatedBy = 'test.user@example.com';

/**
 * Sample organization configurations grouped by organization ID and configuration type
 */
export const mockOrganizationConfigurations = {
  org1: {
    [OrganizationConfigType.ORGANIZATION_CONFIG]: {
      OrganizationId: 'org1',
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
      Name: 'Acme Sports',
      TeamName: 'Acme Rockets',
      Slug: 'acme-rockets',
      ShortName: 'Rockets',
      LogoUrl: 'https://example.com/logos/rockets.png',
      FanWebRootUrl: 'https://rockets.example.com',
      BrandColor: '#FF5733',
      ExternalProviderId: 'acme123',
      SocialLink: 'https://twitter.com/acmerockets',
      DonateLink: 'https://rockets.example.com/donate',
      BuyTabs: [
        {
          Label: 'Season Tickets',
          Slug: 'season',
          Type: 'season',
        },
        {
          Label: 'Single Game',
          Slug: 'single',
          Type: 'single',
          GenreCode: 'BASK',
        },
      ],
      Profile: [
        {
          FieldName: OrganizationFieldName.EMAIL,
          IsEditable: true,
          IsSSOUserEditable: false,
          IsRequired: true,
        },
        {
          FieldName: OrganizationFieldName.FIRST_NAME,
          IsEditable: true,
          IsSSOUserEditable: true,
          IsRequired: true,
        },
        {
          FieldName: OrganizationFieldName.LAST_NAME,
          IsEditable: true,
          IsSSOUserEditable: true,
          IsRequired: true,
        },
        {
          FieldName: OrganizationFieldName.PHONE_NUMBER,
          IsEditable: true,
          IsSSOUserEditable: true,
          IsRequired: false,
        },
      ],
      CustomerServiceConfig: {
        CustomerServicePhone: '555-123-4567',
      },
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
    [OrganizationConfigType.CLIENT_CONFIG]: {
      OrganizationId: 'org1',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG,
      PublicAmplitudeExperimentsKey: 'test-amplitude-key',
      PublicSegmentWriteKey: 'test-segment-key',
      Braze: {
        PublicKey: 'test-braze-key',
        BaseUrl: 'https://sdk.braze.com/api/v3',
      },
      OrganizationCourtCash: {
        Label: 'Rocket Cash',
        Enabled: true,
      },
      PrivacyPolicyLink: 'https://rockets.example.com/privacy',
      TermsLink: 'https://rockets.example.com/terms',
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
    [OrganizationConfigType.CLIENT_CONFIG_IOS]: {
      OrganizationId: 'org1',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS,
      IosStoreLink: 'https://apps.apple.com/us/app/acme-rockets/id123456789',
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
    [OrganizationConfigType.CLIENT_CONFIG_ANDROID]: {
      OrganizationId: 'org1',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID,
      AndroidStoreLink: 'https://play.google.com/store/apps/details?id=com.acme.rockets',
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
  },
  org2: {
    [OrganizationConfigType.ORGANIZATION_CONFIG]: {
      OrganizationId: 'org2',
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
      Name: 'Metro Athletics',
      TeamName: 'Metro Tigers',
      Slug: 'metro-tigers',
      ShortName: 'Tigers',
      LogoUrl: 'https://example.com/logos/tigers.png',
      FanWebRootUrl: 'https://tigers.example.com',
      BrandColor: '#3366FF',
      ExternalProviderId: 'metro456',
      SocialLink: 'https://twitter.com/metrotigerse',
      DonateLink: 'https://tigers.example.com/donate',
      BuyTabs: [
        {
          Label: 'Season Tickets',
          Slug: 'season',
          Type: 'season',
        },
        {
          Label: 'Group Sales',
          Slug: 'group',
          Type: 'group',
        },
      ],
      Profile: [
        {
          FieldName: OrganizationFieldName.EMAIL,
          IsEditable: true,
          IsSSOUserEditable: false,
          IsRequired: true,
        },
        {
          FieldName: OrganizationFieldName.FIRST_NAME,
          IsEditable: true,
          IsSSOUserEditable: true,
          IsRequired: true,
        },
        {
          FieldName: OrganizationFieldName.LAST_NAME,
          IsEditable: true,
          IsSSOUserEditable: true,
          IsRequired: true,
        },
      ],
      CustomerServiceConfig: {
        CustomerServicePhone: '555-987-6543',
      },
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
    [OrganizationConfigType.CLIENT_CONFIG]: {
      OrganizationId: 'org2',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG,
      PublicAmplitudeExperimentsKey: 'test-amplitude-key-metro',
      PublicSegmentWriteKey: 'test-segment-key-metro',
      Braze: {
        PublicKey: 'test-braze-key-metro',
        BaseUrl: 'https://sdk.braze.com/api/v3',
      },
      OrganizationCourtCash: {
        Label: 'Tiger Bucks',
        Enabled: true,
      },
      PrivacyPolicyLink: 'https://tigers.example.com/privacy',
      TermsLink: 'https://tigers.example.com/terms',
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
    [OrganizationConfigType.CLIENT_CONFIG_IOS]: {
      OrganizationId: 'org2',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS,
      IosStoreLink: 'https://apps.apple.com/us/app/metro-tigers/id987654321',
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
    [OrganizationConfigType.CLIENT_CONFIG_ANDROID]: {
      OrganizationId: 'org2',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID,
      AndroidStoreLink: 'https://play.google.com/store/apps/details?id=com.metro.tigers',
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
  },
  org3: {
    [OrganizationConfigType.ORGANIZATION_CONFIG]: {
      OrganizationId: 'org3',
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
      Name: 'City Racers',
      TeamName: 'City Speedsters',
      Slug: 'city-speedsters',
      ShortName: 'Speedsters',
      LogoUrl: 'https://example.com/logos/speedsters.png',
      FanWebRootUrl: 'https://speedsters.example.com',
      BrandColor: '#33CC66',
      ExternalProviderId: 'city789',
      SocialLink: 'https://twitter.com/cityspeedsters',
      DonateLink: 'https://speedsters.example.com/donate',
      BuyTabs: [
        {
          Label: 'Season Tickets',
          Slug: 'season',
          Type: 'season',
        },
        {
          Label: 'Special Events',
          Slug: 'events',
          Type: 'event',
          GenreCode: 'RACE',
        },
      ],
      Profile: [
        {
          FieldName: OrganizationFieldName.EMAIL,
          IsEditable: true,
          IsSSOUserEditable: false,
          IsRequired: true,
        },
        {
          FieldName: OrganizationFieldName.FIRST_NAME,
          IsEditable: true,
          IsSSOUserEditable: true,
          IsRequired: true,
        },
        {
          FieldName: OrganizationFieldName.LAST_NAME,
          IsEditable: true,
          IsSSOUserEditable: true,
          IsRequired: true,
        },
        {
          FieldName: OrganizationFieldName.BIRTHDAY,
          IsEditable: true,
          IsSSOUserEditable: true,
          IsRequired: false,
        },
      ],
      CustomerServiceConfig: {
        CustomerServicePhone: '555-333-2222',
      },
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
    [OrganizationConfigType.CLIENT_CONFIG]: {
      OrganizationId: 'org3',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG,
      PublicAmplitudeExperimentsKey: 'test-amplitude-key-city',
      PublicSegmentWriteKey: 'test-segment-key-city',
      Braze: {
        PublicKey: 'test-braze-key-city',
        BaseUrl: 'https://sdk.braze.com/api/v3',
      },
      OrganizationCourtCash: {
        Label: 'Speed Cash',
        Enabled: true,
      },
      PrivacyPolicyLink: 'https://speedsters.example.com/privacy',
      TermsLink: 'https://speedsters.example.com/terms',
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
    [OrganizationConfigType.CLIENT_CONFIG_IOS]: {
      OrganizationId: 'org3',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS,
      IosStoreLink: 'https://apps.apple.com/us/app/city-speedsters/id456789123',
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
    [OrganizationConfigType.CLIENT_CONFIG_ANDROID]: {
      OrganizationId: 'org3',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID,
      AndroidStoreLink: 'https://play.google.com/store/apps/details?id=com.city.speedsters',
      __createdAt: createdAt,
      __updatedAt: updatedAt,
      __updatedBy: updatedBy,
    },
  },
};

/**
 * Mock API response for the organizations list endpoint
 */
export const mockOrganizationsResponse = {
  organizations: mockOrganizations,
};

/**
 * Mock API response for a single configuration endpoint
 * This example uses the ORGANIZATION_CONFIG for org1
 */
export const mockConfigurationResponse = {
  config: mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG],
};

/**
 * Mock API response for the configurations endpoint that returns all config types for an organization
 * This example uses all configurations for org1
 */
export const mockConfigurationsResponse = {
  configs: Object.values(mockOrganizationConfigurations.org1),
};

/**
 * Mock API response for successful organization creation
 */
export const mockOrganizationCreationResponse = {
  success: true,
  organization: {
    OrganizationId: 'new-org',
    Name: 'New Organization',
  },
};

/**
 * Mock API response for failed organization creation
 */
export const mockOrganizationCreationErrorResponse = {
  success: false,
  error: 'OrganizationId already exists',
};

/**
 * Mock API response for successful configuration update
 */
export const mockConfigurationUpdateResponse = {
  success: true,
  config: {
    ...mockOrganizationConfigurations.org1[OrganizationConfigType.ORGANIZATION_CONFIG],
    Name: 'Updated Acme Sports',
    __updatedAt: '2023-07-20T15:45:30Z',
  },
};

/**
 * Mock API response for failed configuration update
 */
export const mockConfigurationUpdateErrorResponse = {
  success: false,
  error: 'Validation failed: Name field is required',
};