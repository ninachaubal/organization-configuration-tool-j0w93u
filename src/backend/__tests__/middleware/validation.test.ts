import { jest } from '@jest/globals';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

import {
  withValidation,
  validateRequestBody,
  validateOrganizationData,
  validateConfigData,
  validationMiddleware
} from '../../middleware/validation';
import { AppError, AppErrorCode, HttpStatusCode } from '../../types/error';
import { OrganizationConfigType } from '../../models/enums/OrganizationConfigType';
import { organizationSchema } from '../../validation/schemas/organization';

/**
 * Creates a mock NextApiRequest object for testing
 */
function createMockRequest(body: Record<string, any>): Partial<NextApiRequest> {
  return {
    body,
    method: 'POST'
  };
}

/**
 * Creates a mock NextApiResponse object for testing
 */
function createMockResponse(): Partial<NextApiResponse> {
  const res: Partial<NextApiResponse> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis()
  };
  return res;
}

/**
 * Creates a mock NextRequest object for testing App Router middleware
 */
function createMockNextRequest(body: Record<string, any>): NextRequest {
  const req = new NextRequest('https://example.com/api/test', {
    method: 'POST',
  });
  
  // Mock the json method to return the provided body
  req.json = jest.fn().mockResolvedValue(body);
  
  return req;
}

describe('withValidation', () => {
  it('should pass validated data to handler when validation succeeds', async () => {
    // Create a simple schema
    const schema = z.object({
      name: z.string(),
      age: z.number()
    });
    
    // Create mock handler, request, and response
    const mockHandler = jest.fn().mockImplementation((req, res) => {
      return res.status(200).json({ success: true });
    });
    
    const req = createMockRequest({ name: 'Test User', age: 30 });
    const res = createMockResponse();
    
    // Wrap the handler with validation
    const wrappedHandler = withValidation(schema, mockHandler);
    
    // Call the wrapped handler
    await wrappedHandler(req as NextApiRequest, res as NextApiResponse);
    
    // Verify handler was called with validated data
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(req, res);
    expect(req.body).toEqual({ name: 'Test User', age: 30 });
    
    // Verify response was not modified by middleware
    expect(res.status).not.toHaveBeenCalledWith(400);
  });
  
  it('should return 400 with validation errors when validation fails', async () => {
    // Create a schema with required fields
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      age: z.number().min(18)
    });
    
    // Create mock handler, request with invalid data, and response
    const mockHandler = jest.fn();
    
    const req = createMockRequest({ name: 'Test User', age: 16 }); // Missing email and age < 18
    const res = createMockResponse();
    
    // Wrap the handler with validation
    const wrappedHandler = withValidation(schema, mockHandler);
    
    // Call the wrapped handler
    await wrappedHandler(req as NextApiRequest, res as NextApiResponse);
    
    // Verify handler was not called
    expect(mockHandler).not.toHaveBeenCalled();
    
    // Verify response status and data
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: 'Validation failed',
      details: expect.objectContaining({
        validationErrors: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('email')
          }),
          expect.objectContaining({
            message: expect.stringContaining('18')
          })
        ])
      })
    }));
  });
  
  it('should handle errors thrown by the handler', async () => {
    // Create a simple schema
    const schema = z.object({
      name: z.string()
    });
    
    // Create a mock handler that throws an error
    const mockError = new Error('Handler error');
    const mockHandler = jest.fn().mockImplementation(() => {
      throw mockError;
    });
    
    const req = createMockRequest({ name: 'Test User' });
    const res = createMockResponse();
    
    // Wrap the handler with validation
    const wrappedHandler = withValidation(schema, mockHandler);
    
    // Call the wrapped handler
    await wrappedHandler(req as NextApiRequest, res as NextApiResponse);
    
    // Verify handler was called
    expect(mockHandler).toHaveBeenCalledTimes(1);
    
    // Verify error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.stringContaining('unexpected error')
    }));
  });
});

describe('validateRequestBody', () => {
  it('should return validated data when validation succeeds', () => {
    // Create a simple schema
    const schema = z.object({
      name: z.string(),
      age: z.number()
    });
    
    // Call validateRequestBody with valid data
    const data = { name: 'Test User', age: 30 };
    const validatedData = validateRequestBody(schema, data);
    
    // Verify the function returns the validated data
    expect(validatedData).toEqual(data);
  });
  
  it('should throw AppError with validation errors when validation fails', () => {
    // Create a schema with required fields
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      age: z.number().min(18)
    });
    
    // Call validateRequestBody with invalid data in a try/catch block
    const data = { name: 'Test User', age: 16 }; // Missing email and age < 18
    
    try {
      validateRequestBody(schema, data);
      // If we reach here, validation didn't fail as expected
      fail('Expected validation to fail, but it succeeded');
    } catch (error) {
      // Verify that an AppError was thrown
      expect(error).toBeInstanceOf(AppError);
      
      const appError = error as AppError;
      // Verify error properties
      expect(appError.code).toBe(AppErrorCode.VALIDATION_ERROR);
      expect(appError.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(appError.details).toHaveProperty('validationErrors');
      expect(appError.details?.validationErrors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('email')
        }),
        expect.objectContaining({
          message: expect.stringContaining('18')
        })
      ]));
    }
  });
});

describe('validateOrganizationData', () => {
  it('should return validated organization data when validation succeeds', () => {
    // Create valid organization data
    const data = {
      OrganizationId: 'test-org',
      Name: 'Test Organization'
    };
    
    // Call validateOrganizationData with valid data
    const validatedData = validateOrganizationData(data);
    
    // Verify the function returns the validated data
    expect(validatedData).toEqual(data);
  });
  
  it('should throw AppError when organization data is invalid', () => {
    // Create invalid organization data
    const data = {
      // Missing required Name field
      OrganizationId: 'test-org'
    };
    
    try {
      validateOrganizationData(data);
      fail('Expected validation to fail, but it succeeded');
    } catch (error) {
      // Verify that an AppError was thrown
      expect(error).toBeInstanceOf(AppError);
      
      const appError = error as AppError;
      // Verify error properties
      expect(appError.code).toBe(AppErrorCode.VALIDATION_ERROR);
      expect(appError.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(appError.details).toHaveProperty('validationErrors');
      expect(appError.details?.validationErrors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          field: expect.stringContaining('Name'),
          message: expect.stringContaining('required')
        })
      ]));
    }
  });
});

describe('validateConfigData', () => {
  it('should validate ORGANIZATION_CONFIG data correctly', () => {
    // Create valid ORGANIZATION_CONFIG data
    const data = {
      OrganizationId: 'test-org',
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
      Name: 'Test Organization',
      TeamName: 'Test Team',
      LogoUrl: 'https://example.com/logo.png'
    };
    
    // Call validateConfigData with valid data
    const validatedData = validateConfigData(data, OrganizationConfigType.ORGANIZATION_CONFIG);
    
    // Verify the function returns the validated data
    expect(validatedData).toEqual(data);
  });
  
  it('should validate CLIENT_CONFIG data correctly', () => {
    // Create valid CLIENT_CONFIG data
    const data = {
      OrganizationId: 'test-org',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG,
      PublicAmplitudeExperimentsKey: 'test-key',
      PrivacyPolicyLink: 'https://example.com/privacy'
    };
    
    // Call validateConfigData with valid data
    const validatedData = validateConfigData(data, OrganizationConfigType.CLIENT_CONFIG);
    
    // Verify the function returns the validated data
    expect(validatedData).toEqual(data);
  });
  
  it('should validate CLIENT_CONFIG_IOS data correctly', () => {
    // Create valid CLIENT_CONFIG_IOS data
    const data = {
      OrganizationId: 'test-org',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS,
      IosStoreLink: 'https://apps.apple.com/test-app'
    };
    
    // Call validateConfigData with valid data
    const validatedData = validateConfigData(data, OrganizationConfigType.CLIENT_CONFIG_IOS);
    
    // Verify the function returns the validated data
    expect(validatedData).toEqual(data);
  });
  
  it('should validate CLIENT_CONFIG_ANDROID data correctly', () => {
    // Create valid CLIENT_CONFIG_ANDROID data
    const data = {
      OrganizationId: 'test-org',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID,
      AndroidStoreLink: 'https://play.google.com/store/apps/test-app'
    };
    
    // Call validateConfigData with valid data
    const validatedData = validateConfigData(data, OrganizationConfigType.CLIENT_CONFIG_ANDROID);
    
    // Verify the function returns the validated data
    expect(validatedData).toEqual(data);
  });
  
  it('should throw AppError when configuration data is invalid', () => {
    // Test each configuration type with invalid data
    
    // ORGANIZATION_CONFIG with invalid URL
    const invalidOrgConfig = {
      OrganizationId: 'test-org',
      OrganizationConfigType: OrganizationConfigType.ORGANIZATION_CONFIG,
      LogoUrl: 'invalid-url' // Not a valid URL
    };
    
    try {
      validateConfigData(invalidOrgConfig, OrganizationConfigType.ORGANIZATION_CONFIG);
      fail('Expected validation to fail for ORGANIZATION_CONFIG, but it succeeded');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(AppErrorCode.VALIDATION_ERROR);
    }
    
    // CLIENT_CONFIG with invalid URL
    const invalidClientConfig = {
      OrganizationId: 'test-org',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG,
      PrivacyPolicyLink: 'invalid-url' // Not a valid URL
    };
    
    try {
      validateConfigData(invalidClientConfig, OrganizationConfigType.CLIENT_CONFIG);
      fail('Expected validation to fail for CLIENT_CONFIG, but it succeeded');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(AppErrorCode.VALIDATION_ERROR);
    }
    
    // CLIENT_CONFIG_IOS with invalid URL
    const invalidIOSConfig = {
      OrganizationId: 'test-org',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_IOS,
      IosStoreLink: 'invalid-url' // Not a valid URL
    };
    
    try {
      validateConfigData(invalidIOSConfig, OrganizationConfigType.CLIENT_CONFIG_IOS);
      fail('Expected validation to fail for CLIENT_CONFIG_IOS, but it succeeded');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(AppErrorCode.VALIDATION_ERROR);
    }
    
    // CLIENT_CONFIG_ANDROID with invalid URL
    const invalidAndroidConfig = {
      OrganizationId: 'test-org',
      OrganizationConfigType: OrganizationConfigType.CLIENT_CONFIG_ANDROID,
      AndroidStoreLink: 'invalid-url' // Not a valid URL
    };
    
    try {
      validateConfigData(invalidAndroidConfig, OrganizationConfigType.CLIENT_CONFIG_ANDROID);
      fail('Expected validation to fail for CLIENT_CONFIG_ANDROID, but it succeeded');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(AppErrorCode.VALIDATION_ERROR);
    }
  });
});

describe('validationMiddleware', () => {
  it('should return null when validation succeeds', async () => {
    // Create a simple schema
    const schema = z.object({
      name: z.string(),
      age: z.number()
    });
    
    // Create a mock NextRequest with valid data
    const req = createMockNextRequest({ name: 'Test User', age: 30 });
    
    // Call validationMiddleware with the schema and request
    const result = await validationMiddleware(schema, req);
    
    // Verify the function returns null (validation passed)
    expect(result).toBeNull();
  });
  
  it('should return NextResponse with 400 status when validation fails', async () => {
    // Create a schema with required fields
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      age: z.number().min(18)
    });
    
    // Create a mock NextRequest with invalid data
    const req = createMockNextRequest({ name: 'Test User', age: 16 }); // Missing email and age < 18
    
    // Call validationMiddleware with the schema and request
    const result = await validationMiddleware(schema, req);
    
    // Verify the function returns a NextResponse
    expect(result).toBeInstanceOf(NextResponse);
    
    // Verify response status and data
    const response = result as NextResponse;
    expect(response.status).toBe(400);
    
    // Parse the response body
    const body = await response.json();
    expect(body).toEqual(expect.objectContaining({
      success: false,
      error: 'Validation failed',
      details: expect.objectContaining({
        validationErrors: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('email')
          }),
          expect.objectContaining({
            message: expect.stringContaining('18')
          })
        ])
      })
    }));
  });
  
  it('should handle JSON parsing errors', async () => {
    // Create a simple schema
    const schema = z.object({
      name: z.string()
    });
    
    // Create a mock NextRequest with a json method that throws an error
    const req = new NextRequest('https://example.com/api/test');
    req.json = jest.fn().mockRejectedValue(new SyntaxError('Unexpected token'));
    
    // Call validationMiddleware with the schema and request
    const result = await validationMiddleware(schema, req);
    
    // Verify the function returns a NextResponse
    expect(result).toBeInstanceOf(NextResponse);
    
    // Verify response status and data
    const response = result as NextResponse;
    expect(response.status).toBe(400);
    
    // Parse the response body
    const body = await response.json();
    expect(body).toEqual(expect.objectContaining({
      success: false,
      error: 'Invalid JSON in request body'
    }));
  });
});