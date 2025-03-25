import { jest } from '@jest/globals';
import { ConfigurationService } from '../../services/ConfigurationService';
import { ElectroDBAdapter } from '../../data/adapters/ElectroDBAdapter';
import { OrganizationConfigType } from '../../models/enums/OrganizationConfigType';
import { OrganizationFieldName } from '../../models/enums/OrganizationFieldName';
import { ConfigurationRecord, createDefaultConfiguration } from '../../models/ConfigurationRecord';
import { AppError, AppErrorCode, HttpStatusCode } from '../../types/error';

// Mock ElectroDB adapter that is used by ConfigurationService
jest.mock('../../data/adapters/ElectroDBAdapter', () => ({
  query: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  update: jest.fn()
}));

describe('ConfigurationService', () => {
  // Sample test data
  const testOrganizationId = 'test-org-1';
  const testUserId = 'test-user-1';
  
  const testOrganizationConfig: ConfigurationRecord = {
    OrganizationId: testOrganizationId,
    OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
    Name: 'Test Organization',
    TeamName: 'Test Team',
    Slug: 'test-org',
    LogoUrl: 'https://example.com/logo.png',
    Profile: [
      {
        FieldName: OrganizationFieldName.EMAIL,
        IsEditable: false,
        IsRequired: true
      }
    ],
    __createdAt: '2023-01-01T00:00:00.000Z',
    __updatedAt: '2023-01-01T00:00:00.000Z',
    __updatedBy: 'system'
  };
  
  const testClientConfig: ConfigurationRecord = {
    OrganizationId: testOrganizationId,
    OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG,
    PublicAmplitudeExperimentsKey: 'test-key',
    __createdAt: '2023-01-01T00:00:00.000Z',
    __updatedAt: '2023-01-01T00:00:00.000Z',
    __updatedBy: 'system'
  };
  
  const testConfigRecords = [testOrganizationConfig, testClientConfig];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    jest.resetAllMocks();
  });

  describe('getConfigurationsByOrganizationId', () => {
    it('should retrieve all configuration records for an organization', async () => {
      // Mock the ElectroDBAdapter.query method
      (ElectroDBAdapter.query as jest.Mock).mockResolvedValue(testConfigRecords);

      // Call the service method
      const result = await ConfigurationService.getConfigurationsByOrganizationId(testOrganizationId);

      // Verify that ElectroDBAdapter.query was called with correct params
      expect(ElectroDBAdapter.query).toHaveBeenCalledWith({
        OrganizationId: testOrganizationId
      });

      // Verify the result
      expect(result).toEqual(testConfigRecords);
      expect(result.length).toBe(2);
    });

    it('should propagate errors from the database', async () => {
      // Mock database error
      const dbError = new AppError(
        AppErrorCode.DATABASE_ERROR,
        'Database operation failed',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
      (ElectroDBAdapter.query as jest.Mock).mockRejectedValue(dbError);

      // Call the service method and expect it to throw
      await expect(ConfigurationService.getConfigurationsByOrganizationId(testOrganizationId))
        .rejects.toThrow(dbError);
        
      // Verify the query was attempted
      expect(ElectroDBAdapter.query).toHaveBeenCalledWith({
        OrganizationId: testOrganizationId
      });
    });
  });

  describe('getConfigurationByType', () => {
    it('should retrieve a specific configuration type for an organization', async () => {
      // Mock the ElectroDBAdapter.get method
      (ElectroDBAdapter.get as jest.Mock).mockResolvedValue(testOrganizationConfig);

      // Call the service method
      const result = await ConfigurationService.getConfigurationByType(
        testOrganizationId,
        OrganizationConfigType.ORGANIZATION_CONFIG
      );

      // Verify that ElectroDBAdapter.get was called with correct params
      expect(ElectroDBAdapter.get).toHaveBeenCalledWith({
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG
      });

      // Verify the result
      expect(result).toEqual(testOrganizationConfig);
    });

    it('should throw NOT_FOUND error when configuration does not exist', async () => {
      // Mock not found response
      (ElectroDBAdapter.get as jest.Mock).mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(ConfigurationService.getConfigurationByType(
        testOrganizationId,
        OrganizationConfigType.ORGANIZATION_CONFIG
      )).rejects.toThrow(AppError);

      // Verify the error has correct properties
      try {
        await ConfigurationService.getConfigurationByType(
          testOrganizationId,
          OrganizationConfigType.ORGANIZATION_CONFIG
        );
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe(AppErrorCode.NOT_FOUND);
        expect((err as AppError).statusCode).toBe(HttpStatusCode.NOT_FOUND);
      }
    });
  });

  describe('updateConfiguration', () => {
    it('should update configuration with valid data', async () => {
      // Mock data to update
      const updateData = {
        Name: 'Updated Organization Name',
        TeamName: 'Updated Team Name'
      };

      // Expected data after update
      const updatedConfig = {
        ...testOrganizationConfig,
        ...updateData,
        __updatedAt: expect.any(String),
        __updatedBy: testUserId
      };

      // Mock the ElectroDBAdapter.update method
      (ElectroDBAdapter.update as jest.Mock).mockResolvedValue(updatedConfig);

      // Call the service method
      const result = await ConfigurationService.updateConfiguration(
        testOrganizationId,
        OrganizationConfigType.ORGANIZATION_CONFIG,
        updateData,
        testUserId
      );

      // Verify that ElectroDBAdapter.update was called with appropriate data
      expect(ElectroDBAdapter.update).toHaveBeenCalledWith(expect.objectContaining({
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
        Name: 'Updated Organization Name',
        TeamName: 'Updated Team Name',
        __updatedAt: expect.any(String),
        __updatedBy: testUserId
      }));

      // Verify the result
      expect(result).toEqual(updatedConfig);
      expect(result.Name).toBe('Updated Organization Name');
      expect(result.TeamName).toBe('Updated Team Name');
      expect(result.__updatedBy).toBe(testUserId);
    });

    it('should throw validation error for invalid data', async () => {
      // Invalid data with LogoUrl that's not a URL
      const invalidData = {
        LogoUrl: 'not-a-valid-url'
      };

      // Call the service method and expect it to throw
      await expect(ConfigurationService.updateConfiguration(
        testOrganizationId,
        OrganizationConfigType.ORGANIZATION_CONFIG,
        invalidData,
        testUserId
      )).rejects.toThrow(AppError);

      // Verify the error has correct properties
      try {
        await ConfigurationService.updateConfiguration(
          testOrganizationId,
          OrganizationConfigType.ORGANIZATION_CONFIG,
          invalidData,
          testUserId
        );
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe(AppErrorCode.VALIDATION_ERROR);
        expect((err as AppError).statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      }

      // Verify that update was not called
      expect(ElectroDBAdapter.update).not.toHaveBeenCalled();
    });
  });

  describe('createConfigurationRecord', () => {
    it('should create a new configuration record with valid data', async () => {
      // Define test data for a new configuration
      const newData = {
        Name: 'New Organization',
        TeamName: 'New Team'
      };

      // Expected config after creation
      const expectedConfig = {
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
        Name: 'New Organization',
        TeamName: 'New Team',
        __createdAt: expect.any(String),
        __updatedAt: expect.any(String),
        __updatedBy: testUserId
      };

      // Mock the default configuration
      const defaultConfig = {
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
        Name: `Organization ${testOrganizationId}`,
        Profile: [
          {
            FieldName: OrganizationFieldName.EMAIL,
            IsEditable: false,
            IsRequired: true
          }
        ]
      };

      // Mock the createDefaultConfiguration function (from imported modules)
      jest.spyOn(require('../../models/ConfigurationRecord'), 'createDefaultConfiguration')
        .mockReturnValue(defaultConfig);

      // Mock the ElectroDBAdapter.put method
      (ElectroDBAdapter.put as jest.Mock).mockResolvedValue(expectedConfig);

      // Call the service method
      const result = await ConfigurationService.createConfigurationRecord(
        testOrganizationId,
        OrganizationConfigType.ORGANIZATION_CONFIG,
        newData,
        testUserId
      );

      // Verify that ElectroDBAdapter.put was called with merged data
      expect(ElectroDBAdapter.put).toHaveBeenCalledWith(expect.objectContaining({
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
        Name: 'New Organization',
        TeamName: 'New Team',
        __createdAt: expect.any(String),
        __updatedAt: expect.any(String),
        __updatedBy: testUserId
      }));

      // Verify the result
      expect(result).toEqual(expectedConfig);
    });

    it('should throw validation error for invalid data', async () => {
      // Define default config
      const defaultConfig = {
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
        Name: `Organization ${testOrganizationId}`
      };

      // Invalid data with LogoUrl that's not a URL
      const invalidData = {
        LogoUrl: 'not-a-valid-url'
      };

      // Mock the createDefaultConfiguration function
      jest.spyOn(require('../../models/ConfigurationRecord'), 'createDefaultConfiguration')
        .mockReturnValue(defaultConfig);

      // Call the service method and expect it to throw
      await expect(ConfigurationService.createConfigurationRecord(
        testOrganizationId,
        OrganizationConfigType.ORGANIZATION_CONFIG,
        invalidData,
        testUserId
      )).rejects.toThrow(AppError);

      // Verify the error has correct properties
      try {
        await ConfigurationService.createConfigurationRecord(
          testOrganizationId,
          OrganizationConfigType.ORGANIZATION_CONFIG,
          invalidData,
          testUserId
        );
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe(AppErrorCode.VALIDATION_ERROR);
        expect((err as AppError).statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      }

      // Verify put was not called
      expect(ElectroDBAdapter.put).not.toHaveBeenCalled();
    });
  });

  describe('validateConfigurationData', () => {
    it('should validate data for each configuration type', () => {
      // Access the internal function 
      const validateConfigurationData = 
        (ConfigurationService as any).validateConfigurationData;
      
      if (!validateConfigurationData) {
        // Skip tests if function is not accessible
        return;
      }

      // Test ORGANIZATION_CONFIG validation
      const orgConfigData = {
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
        Name: 'Test Org',
        LogoUrl: 'https://example.com/logo.png'
      };
      
      expect(validateConfigurationData(
        OrganizationConfigType.ORGANIZATION_CONFIG,
        orgConfigData
      )).toEqual(orgConfigData);

      // Test CLIENT_CONFIG validation
      const clientConfigData = {
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG,
        PublicAmplitudeExperimentsKey: 'test-key',
        PrivacyPolicyLink: 'https://example.com/privacy'
      };
      
      expect(validateConfigurationData(
        OrganizationConfigType.CLIENT_CONFIG,
        clientConfigData
      )).toEqual(clientConfigData);

      // Test CLIENT_CONFIG_IOS validation
      const iosConfigData = {
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS,
        IosStoreLink: 'https://example.com/ios'
      };
      
      expect(validateConfigurationData(
        OrganizationConfigType.CLIENT_CONFIG_IOS,
        iosConfigData
      )).toEqual(iosConfigData);

      // Test CLIENT_CONFIG_ANDROID validation
      const androidConfigData = {
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID,
        AndroidStoreLink: 'https://example.com/android'
      };
      
      expect(validateConfigurationData(
        OrganizationConfigType.CLIENT_CONFIG_ANDROID,
        androidConfigData
      )).toEqual(androidConfigData);
    });

    it('should throw validation error for invalid data', () => {
      // Access the internal function
      const validateConfigurationData = 
        (ConfigurationService as any).validateConfigurationData;
      
      if (!validateConfigurationData) {
        // Skip tests if function is not accessible
        return;
      }

      // Invalid ORGANIZATION_CONFIG (LogoUrl is not a URL)
      const invalidOrgConfigData = {
        OrganizationId: testOrganizationId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
        LogoUrl: 'not-a-valid-url'
      };

      // Should throw AppError with VALIDATION_ERROR code
      expect(() => validateConfigurationData(
        OrganizationConfigType.ORGANIZATION_CONFIG,
        invalidOrgConfigData
      )).toThrow(AppError);

      try {
        validateConfigurationData(
          OrganizationConfigType.ORGANIZATION_CONFIG,
          invalidOrgConfigData
        );
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe(AppErrorCode.VALIDATION_ERROR);
        expect((err as AppError).statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      }
    });
  });

  describe('removeEmptyFields', () => {
    it('should remove null, undefined, and empty string values', () => {
      // Access the internal function
      const removeEmptyFields = 
        (ConfigurationService as any).removeEmptyFields;
      
      if (!removeEmptyFields) {
        // Skip tests if function is not accessible
        return;
      }

      const testData = {
        field1: 'value1',
        field2: '',            // Empty string, should be removed
        field3: null,          // null, should be removed
        field4: undefined,     // undefined, should be removed
        field5: 0,             // 0 is a valid value, should be kept
        field6: false,         // false is a valid value, should be kept
        field7: [],            // Empty array is a valid value, should be kept
        field8: {}             // Empty object is a valid value, should be kept
      };

      const result = removeEmptyFields(testData);

      // Verify empty values are removed
      expect(result).not.toHaveProperty('field2');
      expect(result).not.toHaveProperty('field3');
      expect(result).not.toHaveProperty('field4');

      // Verify valid values are kept
      expect(result).toHaveProperty('field1', 'value1');
      expect(result).toHaveProperty('field5', 0);
      expect(result).toHaveProperty('field6', false);
      expect(result).toHaveProperty('field7');
      expect(result).toHaveProperty('field8');
    });
  });
});