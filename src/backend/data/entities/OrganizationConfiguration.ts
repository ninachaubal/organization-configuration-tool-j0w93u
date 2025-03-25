import { Entity } from 'electrodb'; // v2.10.0
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'; // v3.400.0
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'; // v3.400.0
import { OrganizationConfigType } from '../../models/enums/OrganizationConfigType';
import { OrganizationFieldName } from '../../models/enums/OrganizationFieldName';
import { ConfigurationRecord } from '../../types/configuration';
import { env } from '../../config/environment';

/**
 * Creates a DynamoDB client with the appropriate configuration.
 * Supports connecting to local DynamoDB instance for development
 * if DYNAMODB_LOCAL_ENDPOINT is provided.
 */
export const dynamoDbClient = new DynamoDBClient({
  region: env.AWS_REGION,
  ...(env.DYNAMODB_LOCAL_ENDPOINT && {
    endpoint: env.DYNAMODB_LOCAL_ENDPOINT,
    credentials: {
      accessKeyId: 'fakeMyKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  }),
});

/**
 * Creates a DynamoDB document client with marshalling options.
 * This provides a more convenient interface for working with 
 * JavaScript objects when interacting with DynamoDB.
 */
const marshallOptions = {
  convertEmptyValues: true,
  removeUndefinedValues: true,
  convertClassInstanceToMap: true,
};

const unmarshallOptions = {
  wrapNumbers: false,
};

const translateConfig = { marshallOptions, unmarshallOptions };
export const documentClient = DynamoDBDocumentClient.from(dynamoDbClient, translateConfig);

/**
 * ElectroDB Entity for Organization Configuration.
 * This entity provides a structured interface for interacting with
 * the organization configuration table in DynamoDB.
 */
export const OrganizationConfiguration = new Entity({
  model: {
    entity: 'OrganizationConfiguration',
    version: '1',
    service: 'OrganizationConfigurationService',
  },
  table: {
    name: env.ORGANIZATION_CONFIGURATION_TABLE_NAME,
    partitionKey: 'pk',
    sortKey: 'sk',
  },
  attributes: {
    // Primary key components
    OrganizationId: {
      type: 'string',
      required: true,
    },
    OrganizationConfigType: {
      type: 'string',
      required: true,
      enum: [
        OrganizationConfigType.ORGANIZATION_CONFIG,
        OrganizationConfigType.CLIENT_CONFIG,
        OrganizationConfigType.CLIENT_CONFIG_IOS,
        OrganizationConfigType.CLIENT_CONFIG_ANDROID,
      ],
    },
    
    // ORGANIZATION_CONFIG attributes
    Name: {
      type: 'string',
    },
    TeamName: {
      type: 'string',
    },
    Slug: {
      type: 'string',
    },
    ShortName: {
      type: 'string',
    },
    LogoUrl: {
      type: 'string',
    },
    FanWebRootUrl: {
      type: 'string',
    },
    BrandColor: {
      type: 'string',
    },
    ExternalProviderId: {
      type: 'string',
    },
    SocialLink: {
      type: 'string',
    },
    DonateLink: {
      type: 'string',
    },
    
    // BuyTabs configuration
    BuyTabs: {
      type: 'list',
      items: {
        type: 'map',
        properties: {
          Label: 'string',
          Slug: 'string',
          Type: 'string',
          GenreCode: 'string',
        },
      },
    },
    
    // Profile configuration
    Profile: {
      type: 'list',
      items: {
        type: 'map',
        properties: {
          FieldName: 'string',
          IsEditable: 'boolean',
          IsSSOUserEditable: 'boolean',
          IsRequired: 'boolean',
        },
      },
    },
    
    // CustomerServiceConfig
    CustomerServiceConfig: {
      type: 'map',
      properties: {
        CustomerServicePhone: 'string',
      },
    },
    
    // CLIENT_CONFIG attributes
    PublicAmplitudeExperimentsKey: {
      type: 'string',
    },
    PublicSegmentWriteKey: {
      type: 'string',
    },
    PrivacyPolicyLink: {
      type: 'string',
    },
    TermsLink: {
      type: 'string',
    },
    
    // Braze configuration
    Braze: {
      type: 'map',
      properties: {
        PublicKey: 'string',
        BaseUrl: 'string',
      },
    },
    
    // OrganizationCourtCash configuration
    OrganizationCourtCash: {
      type: 'map',
      properties: {
        Label: 'string',
        Enabled: 'boolean',
      },
    },
    
    // CLIENT_CONFIG_IOS attributes
    IosStoreLink: {
      type: 'string',
    },
    
    // CLIENT_CONFIG_ANDROID attributes
    AndroidStoreLink: {
      type: 'string',
    },
    
    // Audit fields
    __createdAt: {
      type: 'string',
    },
    __updatedAt: {
      type: 'string',
    },
    __updatedBy: {
      type: 'string',
    },
  },
  indexes: {
    // Primary index
    primary: {
      pk: {
        field: 'pk',
        composite: ['OrganizationId'],
      },
      sk: {
        field: 'sk',
        composite: ['OrganizationConfigType'],
      },
    },
    // GSI for looking up by ExternalProviderId
    gsi1: {
      collection: 'bySSOId',
      index: 'gsi1',
      pk: {
        field: 'gsi1pk',
        composite: ['ExternalProviderId'],
      },
      sk: {
        field: 'gsi1sk',
        composite: [],
      },
    },
  },
}, { client: documentClient });