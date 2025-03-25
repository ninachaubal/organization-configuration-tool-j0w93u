import { z } from 'zod'; // ^3.22.4
import {
  validateSchema,
  validateOrganizationConfig,
  createValidationError,
  validateRequestBody,
  validateQueryParams,
  isValidOrganizationId
} from '../../utils/validation';
import {
  AppError,
  AppErrorCode,
  HttpStatusCode,
  ValidationError
} from '../../types/error';
import { OrganizationConfigType } from '../../models/enums/OrganizationConfigType';
import {
  organizationSchema,
  organizationConfigSchema,
  clientConfigSchema,
  clientConfigIOSSchema,
  clientConfigAndroidSchema
} from '../../validation/schemas';

describe('validateSchema', () => {
  it('returns an empty array for valid data', () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
      age: z.number()
    });
    const data = { name: 'John', age: 30 };
    
    // Act
    const errors = validateSchema(schema, data);
    
    // Assert
    expect(errors).toEqual([]);
  });

  it('returns validation errors for invalid data', () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
      age: z.number()
    });
    const data = { name: 'John', age: 'thirty' as any };
    
    // Act
    const errors = validateSchema(schema, data);
    
    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('age');
    expect(errors[0].message).toContain('Expected number');
  });

  it('correctly formats field paths for nested objects', () => {
    // Arrange
    const schema = z.object({
      user: z.object({
        profile: z.object({
          firstName: z.string(),
          lastName: z.string()
        })
      })
    });
    const data = {
      user: {
        profile: {
          firstName: 123 as any,
          lastName: 'Doe'
        }
      }
    };
    
    // Act
    const errors = validateSchema(schema, data);
    
    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('user.profile.firstName');
    expect(errors[0].message).toContain('Expected string');
  });

  it('handles array validation errors correctly', () => {
    // Arrange
    const schema = z.object({
      items: z.array(z.object({
        id: z.number(),
        name: z.string()
      }))
    });
    const data = {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 'two' as any, name: 'Item 2' }
      ]
    };
    
    // Act
    const errors = validateSchema(schema, data);
    
    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('items.1.id');
    expect(errors[0].message).toContain('Expected number');
  });

  it('works with custom validation messages', () => {
    // Arrange
    const schema = z.object({
      email: z.string().email('Must be a valid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters')
    });
    const data = {
      email: 'not-an-email',
      password: 'short'
    };
    
    // Act
    const errors = validateSchema(schema, data);
    
    // Assert
    expect(errors.length).toBe(2);
    expect(errors[0].field).toBe('email');
    expect(errors[0].message).toBe('Must be a valid email address');
    expect(errors[1].field).toBe('password');
    expect(errors[1].message).toBe('Password must be at least 8 characters');
  });

  it('validates against organizationSchema correctly', () => {
    // Arrange
    const validData = {
      OrganizationId: 'org123',
      Name: 'Test Organization'
    };
    
    // Act
    const errors = validateSchema(organizationSchema, validData);
    
    // Assert
    expect(errors).toEqual([]);
  });
  
  it('returns errors when validating invalid data against organizationSchema', () => {
    // Arrange
    const invalidData = {
      OrganizationId: '', // Empty ID
      Name: 'Test Organization'
    };
    
    // Act
    const errors = validateSchema(organizationSchema, invalidData);
    
    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('OrganizationId');
  });
});

describe('validateOrganizationConfig', () => {
  it('validates correctly for ORGANIZATION_CONFIG type', () => {
    // Arrange
    const validConfig = {
      OrganizationId: 'org123',
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
      Name: 'Test Organization',
      TeamName: 'Test Team'
    };
    
    // Act
    const errors = validateOrganizationConfig(validConfig, OrganizationConfigType.ORGANIZATION_CONFIG);
    
    // Assert
    expect(errors).toEqual([]);
  });

  it('validates correctly for CLIENT_CONFIG type', () => {
    // Arrange
    const validConfig = {
      OrganizationId: 'org123',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG,
      PublicSegmentWriteKey: 'segment-key',
      PrivacyPolicyLink: 'https://example.com/privacy'
    };
    
    // Act
    const errors = validateOrganizationConfig(validConfig, OrganizationConfigType.CLIENT_CONFIG);
    
    // Assert
    expect(errors).toEqual([]);
  });

  it('validates correctly for CLIENT_CONFIG_IOS type', () => {
    // Arrange
    const validConfig = {
      OrganizationId: 'org123',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS,
      IosStoreLink: 'https://apps.apple.com/app/test'
    };
    
    // Act
    const errors = validateOrganizationConfig(validConfig, OrganizationConfigType.CLIENT_CONFIG_IOS);
    
    // Assert
    expect(errors).toEqual([]);
  });

  it('validates correctly for CLIENT_CONFIG_ANDROID type', () => {
    // Arrange
    const validConfig = {
      OrganizationId: 'org123',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID,
      AndroidStoreLink: 'https://play.google.com/store/apps/details?id=test'
    };
    
    // Act
    const errors = validateOrganizationConfig(validConfig, OrganizationConfigType.CLIENT_CONFIG_ANDROID);
    
    // Assert
    expect(errors).toEqual([]);
  });

  it('returns validation errors for invalid data', () => {
    // Arrange
    const invalidConfig = {
      OrganizationId: 'org123',
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
      LogoUrl: 'not-a-url'
    };
    
    // Act
    const errors = validateOrganizationConfig(invalidConfig, OrganizationConfigType.ORGANIZATION_CONFIG);
    
    // Assert
    expect(errors.length).toBeGreaterThan(0);
    const logoUrlError = errors.find(err => err.field === 'LogoUrl');
    expect(logoUrlError).toBeDefined();
    expect(logoUrlError?.message).toContain('valid URL');
  });

  it('throws an error for unknown config types', () => {
    // Arrange
    const config = {
      OrganizationId: 'org123'
    };
    
    // Act
    const errors = validateOrganizationConfig(config, 'UNKNOWN_TYPE' as OrganizationConfigType);
    
    // Assert
    expect(errors.length).toBe(1);
    expect(errors[0].field).toBe('configType');
    expect(errors[0].message).toContain('Invalid configuration type');
  });
});

describe('createValidationError', () => {
  it('creates an AppError with VALIDATION_ERROR code', () => {
    // Arrange
    const validationErrors: ValidationError[] = [
      { field: 'name', message: 'Name is required' }
    ];
    
    // Act
    const error = createValidationError(validationErrors);
    
    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(AppErrorCode.VALIDATION_ERROR);
  });

  it('sets the correct HTTP status code (BAD_REQUEST)', () => {
    // Arrange
    const validationErrors: ValidationError[] = [
      { field: 'name', message: 'Name is required' }
    ];
    
    // Act
    const error = createValidationError(validationErrors);
    
    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it('includes validation errors in the details', () => {
    // Arrange
    const validationErrors: ValidationError[] = [
      { field: 'name', message: 'Name is required' },
      { field: 'email', message: 'Invalid email format' }
    ];
    
    // Act
    const error = createValidationError(validationErrors);
    
    // Assert
    expect(error.details).toBeDefined();
    expect(error.details?.validationErrors).toEqual(validationErrors);
  });

  it('uses the provided message', () => {
    // Arrange
    const validationErrors: ValidationError[] = [
      { field: 'name', message: 'Name is required' }
    ];
    const customMessage = 'Custom validation error message';
    
    // Act
    const error = createValidationError(validationErrors, customMessage);
    
    // Assert
    expect(error.message).toBe(customMessage);
  });

  it('uses a default message if none provided', () => {
    // Arrange
    const validationErrors: ValidationError[] = [
      { field: 'name', message: 'Name is required' }
    ];
    
    // Act
    const error = createValidationError(validationErrors);
    
    // Assert
    expect(error.message).toBe('Validation failed. Please check your input.');
  });
});

describe('validateRequestBody', () => {
  it('returns validated data for valid input', () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string().email()
    });
    const validBody = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com'
    };
    
    // Act
    const result = validateRequestBody(schema, validBody);
    
    // Assert
    expect(result).toEqual(validBody);
  });

  it('throws a validation error for invalid input', () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string().email()
    });
    const invalidBody = {
      name: 'John Doe',
      age: '30' as any, // Should be a number
      email: 'invalid-email'
    };
    
    // Act & Assert
    expect(() => {
      validateRequestBody(schema, invalidBody);
    }).toThrow(AppError);
  });

  it('thrown error includes field-specific validation details', () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string().email()
    });
    const invalidBody = {
      name: 'John Doe',
      age: '30' as any, // Should be a number
      email: 'invalid-email'
    };
    
    // Act & Assert
    try {
      validateRequestBody(schema, invalidBody);
      fail('Expected function to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.code).toBe(AppErrorCode.VALIDATION_ERROR);
        expect(error.details?.validationErrors).toBeDefined();
        
        const validationErrors = error.details?.validationErrors as ValidationError[];
        expect(validationErrors.length).toBe(2);
        
        // Check for specific field errors
        const ageError = validationErrors.find(err => err.field === 'age');
        const emailError = validationErrors.find(err => err.field === 'email');
        
        expect(ageError).toBeDefined();
        expect(emailError).toBeDefined();
      }
    }
  });

  it('correctly validates complex nested objects', () => {
    // Arrange
    const schema = z.object({
      user: z.object({
        profile: z.object({
          firstName: z.string(),
          lastName: z.string(),
          address: z.object({
            street: z.string(),
            city: z.string(),
            zip: z.string()
          })
        }),
        preferences: z.array(z.object({
          key: z.string(),
          value: z.string()
        }))
      })
    });
    
    const validBody = {
      user: {
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            zip: '12345'
          }
        },
        preferences: [
          { key: 'theme', value: 'dark' },
          { key: 'notifications', value: 'on' }
        ]
      }
    };
    
    // Act
    const result = validateRequestBody(schema, validBody);
    
    // Assert
    expect(result).toEqual(validBody);
  });
});

describe('validateQueryParams', () => {
  it('returns validated query params for valid input', () => {
    // Arrange
    const schema = z.object({
      page: z.string().transform(val => parseInt(val, 10)),
      limit: z.string().transform(val => parseInt(val, 10)),
      search: z.string().optional()
    });
    const validQuery = {
      page: '1',
      limit: '10',
      search: 'test'
    };
    
    // Act
    const result = validateQueryParams(schema, validQuery);
    
    // Assert
    expect(result).toEqual({
      page: 1,
      limit: 10,
      search: 'test'
    });
  });

  it('throws a validation error for invalid input', () => {
    // Arrange
    const schema = z.object({
      page: z.string().transform(val => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed)) throw new Error('Must be a number');
        return parsed;
      }),
      limit: z.string().transform(val => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed)) throw new Error('Must be a number');
        return parsed;
      })
    });
    const invalidQuery = {
      page: 'one', // Not a valid number
      limit: '10'
    };
    
    // Act & Assert
    expect(() => {
      validateQueryParams(schema, invalidQuery);
    }).toThrow(AppError);
  });

  it('handles string array query parameters correctly', () => {
    // Arrange
    const schema = z.object({
      ids: z.array(z.string()).or(z.string().transform(val => [val])), // Handle both array and single string
      category: z.string()
    });
    const validQuery = {
      ids: ['1', '2', '3'], // This is how Next.js would represent multiple query params with the same name
      category: 'products'
    };
    
    // Act
    const result = validateQueryParams(schema, validQuery);
    
    // Assert
    expect(result).toEqual(validQuery);
  });

  it('correctly coerces string values to appropriate types', () => {
    // Arrange
    const schema = z.object({
      enabled: z.string().transform(val => val === 'true'),
      count: z.string().transform(val => parseInt(val, 10)),
      price: z.string().transform(val => parseFloat(val))
    });
    const validQuery = {
      enabled: 'true',
      count: '42',
      price: '19.99'
    };
    
    // Act
    const result = validateQueryParams(schema, validQuery);
    
    // Assert
    expect(result).toEqual({
      enabled: true,
      count: 42,
      price: 19.99
    });
  });
});

describe('isValidOrganizationId', () => {
  it('returns true for valid organization IDs', () => {
    // Arrange & Act & Assert
    expect(isValidOrganizationId('org123')).toBe(true);
    expect(isValidOrganizationId('organization_123')).toBe(true);
    expect(isValidOrganizationId('organization-123')).toBe(true);
    expect(isValidOrganizationId('ORGANIZATION_123')).toBe(true);
  });

  it('returns false for empty strings', () => {
    // Arrange & Act & Assert
    expect(isValidOrganizationId('')).toBe(false);
  });

  it('returns false for strings with invalid characters', () => {
    // Arrange & Act & Assert
    expect(isValidOrganizationId('org 123')).toBe(false); // Space
    expect(isValidOrganizationId('org.123')).toBe(false); // Period
    expect(isValidOrganizationId('org@123')).toBe(false); // Special character
    expect(isValidOrganizationId('org/123')).toBe(false); // Slash
  });

  it('returns false for undefined or null', () => {
    // Arrange & Act & Assert
    expect(isValidOrganizationId(undefined as unknown as string)).toBe(false);
    expect(isValidOrganizationId(null as unknown as string)).toBe(false);
  });

  it('handles edge cases correctly', () => {
    // Arrange & Act & Assert
    expect(isValidOrganizationId('123')).toBe(true); // Only numbers
    expect(isValidOrganizationId('___')).toBe(true); // Only underscores
    expect(isValidOrganizationId('---')).toBe(true); // Only hyphens
  });
});