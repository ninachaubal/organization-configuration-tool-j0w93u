import { OrganizationService } from "../../services/OrganizationService";
import { ElectroDBAdapter } from "../../data/adapters/ElectroDBAdapter";
import { ConfigurationService } from "../../services/ConfigurationService";
import { OrganizationConfigType } from "../../models/enums/OrganizationConfigType";
import { Organization } from "../../models/Organization";
import { AppError, AppErrorCode, HttpStatusCode } from "../../types/error";
import organizations from "../../__fixtures__/organizations.json";
import configurations from "../../__fixtures__/configurations.json";

// Mock dependencies
jest.mock("../../data/adapters/ElectroDBAdapter", () => ({
  query: jest.fn(),
  get: jest.fn(),
  scan: jest.fn()
}));

jest.mock("../../services/ConfigurationService", () => ({
  createConfigurationRecord: jest.fn()
}));

describe("OrganizationService", () => {
  // Setup and cleanup
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getOrganizations", () => {
    it("should retrieve all organizations with unique names", async () => {
      // Arrange
      const orgConfigs = configurations.filter(
        config => config.OrganizationConfigType === "ORGANIZATION_CONFIG"
      );
      
      (ElectroDBAdapter.scan as jest.Mock).mockResolvedValue(orgConfigs);
      
      // Act
      const result = await OrganizationService.getOrganizations();
      
      // Assert
      expect(ElectroDBAdapter.scan).toHaveBeenCalledWith({
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG
      });
      
      // Verify all organizations are returned
      expect(result.length).toBe(orgConfigs.length);
      
      // Verify organizations are sorted alphabetically by Name
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].Name.localeCompare(result[i].Name)).toBeLessThanOrEqual(0);
      }
      
      // Verify correct structure of returned organizations
      result.forEach(org => {
        expect(org).toHaveProperty("OrganizationId");
        expect(org).toHaveProperty("Name");
      });
    });

    it("should propagate errors from the database", async () => {
      // Arrange
      const dbError = new Error("Database connection failed");
      (ElectroDBAdapter.scan as jest.Mock).mockRejectedValue(dbError);
      
      // Act & Assert
      await expect(OrganizationService.getOrganizations()).rejects.toThrow(dbError);
    });
  });

  describe("getOrganizationById", () => {
    it("should retrieve an organization by its ID", async () => {
      // Arrange
      const orgId = "org1";
      const orgConfig = configurations.find(
        config => config.OrganizationId === orgId && config.OrganizationConfigType === "ORGANIZATION_CONFIG"
      );
      
      (ElectroDBAdapter.get as jest.Mock).mockResolvedValue(orgConfig);
      
      // Act
      const result = await OrganizationService.getOrganizationById(orgId);
      
      // Assert
      expect(ElectroDBAdapter.get).toHaveBeenCalledWith({
        OrganizationId: orgId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG
      });
      
      expect(result).toEqual({
        OrganizationId: orgId,
        Name: orgConfig.Name
      });
    });

    it("should throw NOT_FOUND error when organization does not exist", async () => {
      // Arrange
      const orgId = "nonexistent";
      const notFoundError = new AppError(
        AppErrorCode.NOT_FOUND,
        "Resource not found",
        HttpStatusCode.NOT_FOUND
      );
      
      (ElectroDBAdapter.get as jest.Mock).mockRejectedValue(notFoundError);
      
      // Act & Assert
      await expect(OrganizationService.getOrganizationById(orgId))
        .rejects
        .toThrow(new AppError(
          AppErrorCode.NOT_FOUND,
          `Organization with ID ${orgId} not found`,
          HttpStatusCode.NOT_FOUND
        ));
    });

    it("should throw VALIDATION_ERROR when organization ID is not provided", async () => {
      // Act & Assert
      await expect(OrganizationService.getOrganizationById(""))
        .rejects
        .toThrow(new AppError(
          AppErrorCode.VALIDATION_ERROR,
          "Organization ID is required",
          HttpStatusCode.BAD_REQUEST
        ));
    });
  });

  describe("getOrganizationsByName", () => {
    it("should retrieve organizations that match a name (case-insensitive)", async () => {
      // Arrange
      const orgConfigs = configurations.filter(
        config => config.OrganizationConfigType === "ORGANIZATION_CONFIG"
      );
      
      (ElectroDBAdapter.scan as jest.Mock).mockResolvedValue(orgConfigs);
      
      // Act
      const searchTerm = "rocket";
      const result = await OrganizationService.getOrganizationsByName(searchTerm);
      
      // Assert
      expect(ElectroDBAdapter.scan).toHaveBeenCalledWith({
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG
      });
      
      // Verify case-insensitive matching works
      expect(result.length).toBeGreaterThan(0);
      result.forEach(org => {
        expect(org.Name.toLowerCase()).toContain(searchTerm.toLowerCase());
      });
    });

    it("should return empty array when no organizations match the name", async () => {
      // Arrange
      const orgConfigs = configurations.filter(
        config => config.OrganizationConfigType === "ORGANIZATION_CONFIG"
      );
      
      (ElectroDBAdapter.scan as jest.Mock).mockResolvedValue(orgConfigs);
      
      // Act
      const searchTerm = "nonexistent_organization";
      const result = await OrganizationService.getOrganizationsByName(searchTerm);
      
      // Assert
      expect(result).toEqual([]);
    });

    it("should throw VALIDATION_ERROR when name is not provided", async () => {
      // Act & Assert
      await expect(OrganizationService.getOrganizationsByName(""))
        .rejects
        .toThrow(new AppError(
          AppErrorCode.VALIDATION_ERROR,
          "Name is required for search",
          HttpStatusCode.BAD_REQUEST
        ));
    });
  });

  describe("organizationExists", () => {
    it("should return true when organization exists", async () => {
      // Arrange
      const orgId = "org1";
      const orgConfig = configurations.find(
        config => config.OrganizationId === orgId && config.OrganizationConfigType === "ORGANIZATION_CONFIG"
      );
      
      (ElectroDBAdapter.get as jest.Mock).mockResolvedValue(orgConfig);
      
      // Act
      const result = await OrganizationService.organizationExists(orgId);
      
      // Assert
      expect(ElectroDBAdapter.get).toHaveBeenCalledWith({
        OrganizationId: orgId,
        OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG
      });
      
      expect(result).toBe(true);
    });

    it("should return false when organization does not exist", async () => {
      // Arrange
      const notFoundError = new AppError(
        AppErrorCode.NOT_FOUND,
        "Resource not found",
        HttpStatusCode.NOT_FOUND
      );
      
      (ElectroDBAdapter.get as jest.Mock).mockRejectedValue(notFoundError);
      
      // Act
      const result = await OrganizationService.organizationExists("nonexistent");
      
      // Assert
      expect(result).toBe(false);
    });

    it("should throw VALIDATION_ERROR when organization ID is not provided", async () => {
      // Act & Assert
      await expect(OrganizationService.organizationExists(""))
        .rejects
        .toThrow(new AppError(
          AppErrorCode.VALIDATION_ERROR,
          "Organization ID is required",
          HttpStatusCode.BAD_REQUEST
        ));
    });
  });

  describe("createOrganization", () => {
    it("should create a new organization with default configurations", async () => {
      // Arrange
      jest.spyOn(OrganizationService, "organizationExists").mockResolvedValue(false);
      
      (ConfigurationService.createConfigurationRecord as jest.Mock).mockImplementation(
        (orgId, configType, data, createdBy) => {
          return Promise.resolve({
            OrganizationId: orgId,
            OrganizationConfigType: configType,
            ...data
          });
        }
      );
      
      const orgId = "neworg";
      const name = "New Organization";
      const createdBy = "test-user";
      
      // Act
      const result = await OrganizationService.createOrganization(orgId, name, createdBy);
      
      // Assert
      expect(OrganizationService.organizationExists).toHaveBeenCalledWith(orgId);
      
      // Verify all configuration types are created
      expect(ConfigurationService.createConfigurationRecord).toHaveBeenCalledTimes(4);
      
      // Verify ORGANIZATION_CONFIG creation with name
      expect(ConfigurationService.createConfigurationRecord).toHaveBeenCalledWith(
        orgId,
        OrganizationConfigType.ORGANIZATION_CONFIG,
        { Name: name },
        createdBy
      );
      
      // Verify other config types creation
      expect(ConfigurationService.createConfigurationRecord).toHaveBeenCalledWith(
        orgId,
        OrganizationConfigType.CLIENT_CONFIG,
        {},
        createdBy
      );
      
      expect(ConfigurationService.createConfigurationRecord).toHaveBeenCalledWith(
        orgId,
        OrganizationConfigType.CLIENT_CONFIG_IOS,
        {},
        createdBy
      );
      
      expect(ConfigurationService.createConfigurationRecord).toHaveBeenCalledWith(
        orgId,
        OrganizationConfigType.CLIENT_CONFIG_ANDROID,
        {},
        createdBy
      );
      
      // Verify returned organization object
      expect(result).toEqual({
        OrganizationId: orgId,
        Name: name
      });
    });

    it("should throw DUPLICATE_ENTITY error when organization ID already exists", async () => {
      // Arrange
      const orgId = "existingorg";
      const name = "Existing Organization";
      const createdBy = "test-user";
      
      jest.spyOn(OrganizationService, "organizationExists").mockResolvedValue(true);
      
      // Act & Assert
      await expect(OrganizationService.createOrganization(orgId, name, createdBy))
        .rejects
        .toThrow(new AppError(
          AppErrorCode.DUPLICATE_ENTITY,
          `Organization with ID ${orgId} already exists`,
          HttpStatusCode.CONFLICT
        ));
    });

    it("should throw validation error for invalid data", async () => {
      // Arrange
      const orgId = "";
      const name = "";
      const createdBy = "test-user";
      
      // Act & Assert
      await expect(OrganizationService.createOrganization(orgId, name, createdBy))
        .rejects
        .toThrow(AppErrorCode.VALIDATION_ERROR);
    });
  });

  describe("validateOrganizationData", () => {
    it("should validate organization data successfully", () => {
      // Arrange
      const validData = {
        OrganizationId: "validorg",
        Name: "Valid Organization"
      };
      
      // Access validateOrganizationData from OrganizationService object
      const validateOrganizationData = (OrganizationService as any).validateOrganizationData;
      
      // Act
      const result = validateOrganizationData(validData);
      
      // Assert
      expect(result).toEqual(validData);
    });

    it("should throw validation error for missing required fields", () => {
      // Arrange
      const invalidData = {
        OrganizationId: "validorg"
        // Missing Name field
      };
      
      // Access validateOrganizationData from OrganizationService object
      const validateOrganizationData = (OrganizationService as any).validateOrganizationData;
      
      // Act & Assert
      expect(() => validateOrganizationData(invalidData))
        .toThrow(AppErrorCode.VALIDATION_ERROR);
    });

    it("should throw validation error for invalid field format", () => {
      // Arrange
      const invalidData = {
        OrganizationId: "invalid org id with spaces", // Contains invalid characters
        Name: "Valid Organization"
      };
      
      // Access validateOrganizationData from OrganizationService object
      const validateOrganizationData = (OrganizationService as any).validateOrganizationData;
      
      // Act & Assert
      expect(() => validateOrganizationData(invalidData))
        .toThrow(AppErrorCode.VALIDATION_ERROR);
    });
  });
});