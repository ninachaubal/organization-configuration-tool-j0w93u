# Platform Purpose

We have a separate multi-tenant application where each tenant is an “organization”. This project is an internal tool to allow users to configure various settings for each organization. It will allow setting the configuration for a new organization or viewing and editing configurations for existing organizations.

# Platform Architecture

## Core Workflows

### User Journey

1. Viewing Organizations and Configuration

   - List all Organizations in a drop down so the user can select the one they are interested in.

- Fetch configuration for selected organization and display it

- 1. Editing Configuration

  2. - Each setting should be editable

     - - Allow the user to input the values they want for each setting

       - 1. Adding a new organization

         2. - Allow the user to create configuration for a new organization by provide the organizationId

            - ## Technical Stack

            - ### Core Technologies

            - - Language: TypeScript (.ts/.tsx)

- Framework: NextJS + React (app router)

- - Backend: NextJS api routes

  - - Styling: TailwindCSS

    - - UI Components & theming: Shadcn (buttons, sidebar, inputs, modals, dialogs, etc.)

      - - Iconography: lucide-react

        - - Form management: react-hook-form with zod for validation

          - ### Backend Services

          - - Database: DynamoDB

- ORM: ElectroDB

### Architecture Notes

- Single NextJS application

- NextJS routes for all API endpoints

- - Web platform only

  - - ORGANIZATION_CONFIGURATION_TABLE_NAME environment variable will be provided to point to the DynamoDB table.

    - 

  - # User Interface

  - ## Required Pages

  - ### Configuration Page

  - - Drop down to select organization by Name field

    - - Display all records that match the selected Name

      - - Show each record in a separate tab based on OrganizationConfigType field

- Button to edit record

- - Button to add a new organization

  - ### Edit Page

  - - Edit the selected record

- Show a form to edit available fields, any fields already set on the record should be pre-filled in the form

- - Fields that are not set on the record, but can be set for that OrganizationConfigType should also be shown in the form

  - - If a field is empty in the form, do not set it in db

    - ### New Organization Page

      - Show form to collect OrganizationId and Name

      - - Create records for each OrganizationConfigType for the provided OrganizationId and Name

- Redirect to Configuration Page with the new organization selected

- 

- # Organization Configuration

- ## ElectroDB Entity

- The Organization Configuration DynamoDB table uses the following ElectroDB entity

- ```
  export const organizationConfiguration = new Entity(
    {
      model: {
        entity: 'OrganizationConfiguration',
        version: '1',
        service: 'OrganizationConfigurationService',
      },
      attributes: {
        OrganizationId: {
          type: 'string',
          required: true,
        },
        OrganizationConfigType: {
          type: 'string',
          required: true,
          enum: Object.values(OrganizationConfigType),
        },
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
        IosStoreLink: {
          type: 'string',
        },
        AndroidStoreLink: {
          type: 'string',
        },
        SocialLink: {
          type: 'string',
        },
        DonateLink: {
          type: 'string',
        },
        PrivacyPolicyLink: {
          type: 'string',
        },
        TermsLink: {
          type: 'string',
        },
        BuyTabs: {
          type: 'list',
          items: {
            type: 'map',
            properties: {
              Label: {
                type: 'string',
              },
              Slug: {
                type: 'string',
              },
              Type: {
                type: 'string',
              },
              GenreCode: {
                type: 'string',
              },
            },
          },
        },
        Profile: {
          type: 'list',
          items: {
            type: 'map',
            properties: {
              FieldName: {
                type: Object.values(OrganizationFieldName),
              },
              IsEditable: {
                type: 'boolean',
              },
              IsSSOUserEditable: {
                type: 'boolean',
              },
              IsRequired: {
                type: 'boolean',
              },
            },
          },
        },
        CustomerServiceConfig: {
          type: 'map',
          properties: {
            CustomerServicePhone: {
              type: 'string',
            },
          },
        },
        PublicAmplitudeExperimentsKey: {
          type: 'string',
        },
        PublicSegmentWriteKey: {
          type: 'string',
        },
        Braze: {
          type: 'map',
          properties: {
            PublicKey: {
              type: 'string',
            },
            BaseUrl: {
              type: 'string',
            },
          },
        },
        OrganizationCourtCash: {
          type: 'map',
          properties: {
            Label: {
              type: 'string',
            },
            Enabled: {
              type: 'boolean',
            },
          },
        },
        __createdAt: {
          type: 'string',
          default: () => new Date().toISOString(),
          readOnly: true,
        },
        __updatedAt: {
          type: 'string',
          watch: '*',
          default: () => new Date().toISOString(),
          set: () => new Date().toISOString(),
          readOnly: true,
        },
        __updatedBy: {
          type: 'string',
          default: 'system',
        },
      },
      indexes: {
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
        bySSOId: {
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
    },
    { client, table: ORGANIZATION_CONFIGURATION_TABLE_NAME },
  );
  ```

  ## OrganizationConfigType

- The following OrganizationConfigType values are supported

- ```
  export const OrganizationConfigType = {
    ORGANIZATION_CONFIG: 'ORGANIZATION_CONFIG',
    CLIENT_CONFIG: 'CLIENT_CONFIG',
    CLIENT_CONFIG_IOS: 'CLIENT_CONFIG_IOS',
    CLIENT_CONFIG_ANDROID: 'CLIENT_CONFIG_ANDROID',
  };
  
  ```

  ## Profile.FieldName

- Profile.FieldName can have values of type OrganizationFieldName

- ```
  export const OrganizationFieldName = {
    EMAIL: 'EMAIL',
    FIRST_NAME: 'FIRST_NAME',
    LAST_NAME: 'LAST_NAME',
    BIRTHDAY: 'BIRTHDAY',
    PHONE_NUMBER: 'PHONE_NUMBER',
  } as const;
  ```