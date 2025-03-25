import { NextApiResponse } from 'next'; // ^14.0.0
import {
  createAppError,
  handleApiError,
  formatErrorResponse,
  isAppError,
  createNotFoundError,
  createDuplicateEntityError,
  createDatabaseError,
  getErrorStatusCode
} from '../../utils/error-handling';
import {
  AppError,
  AppErrorCode,
  HttpStatusCode
} from '../../types/error';
import { error as logError } from '../../utils/logging';
import { isDevelopment } from '../../config/environment';

// Mock dependencies
jest.mock('../../utils/logging', () => ({
  error: jest.fn(),
}));

jest.mock('../../config/environment', () => ({
  isDevelopment: jest.fn(),
}));

describe('createAppError', () => {
  it('should create an AppError with the correct properties', () => {
    // Arrange
    const code = AppErrorCode.VALIDATION_ERROR;
    const message = 'Test error message';

    // Act
    const error = createAppError(code, message);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it('should set the appropriate status code based on error code', () => {
    // Arrange & Act
    const notFoundError = createAppError(AppErrorCode.NOT_FOUND, 'Not found');
    const validationError = createAppError(AppErrorCode.VALIDATION_ERROR, 'Invalid data');
    const duplicateError = createAppError(AppErrorCode.DUPLICATE_ENTITY, 'Duplicate data');
    const dbError = createAppError(AppErrorCode.DATABASE_ERROR, 'Database error');
    const internalError = createAppError(AppErrorCode.INTERNAL_SERVER_ERROR, 'Internal error');
    const unauthorizedError = createAppError(AppErrorCode.UNAUTHORIZED, 'Unauthorized');
    const forbiddenError = createAppError(AppErrorCode.FORBIDDEN, 'Forbidden');

    // Assert
    expect(notFoundError.statusCode).toBe(HttpStatusCode.NOT_FOUND);
    expect(validationError.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(duplicateError.statusCode).toBe(HttpStatusCode.CONFLICT);
    expect(dbError.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(internalError.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(unauthorizedError.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
    expect(forbiddenError.statusCode).toBe(HttpStatusCode.FORBIDDEN);
  });

  it('should include details when provided', () => {
    // Arrange
    const code = AppErrorCode.VALIDATION_ERROR;
    const message = 'Test error message';
    const details = { field: 'name', value: 'test' };

    // Act
    const error = createAppError(code, message, details);

    // Assert
    expect(error.details).toEqual(details);
  });
});

describe('handleApiError', () => {
  // Create a mock for NextApiResponse
  let mockResponse: jest.Mocked<NextApiResponse>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<NextApiResponse>;
  });

  it('should handle AppError instances with correct status code and response', () => {
    // Arrange
    const appError = new AppError(
      AppErrorCode.NOT_FOUND,
      'Resource not found',
      HttpStatusCode.NOT_FOUND,
      { resourceId: '123' }
    );

    // Act
    handleApiError(appError, mockResponse);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: 'Resource not found',
      code: AppErrorCode.NOT_FOUND,
      details: { resourceId: '123' }
    }));
  });

  it('should handle standard Error instances with 500 status code', () => {
    // Arrange
    const standardError = new Error('Standard error');

    // Act
    handleApiError(standardError, mockResponse);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: 'An unexpected error occurred',
      code: AppErrorCode.INTERNAL_SERVER_ERROR
    }));
  });

  it('should handle unknown error types with 500 status code', () => {
    // Act
    handleApiError('Not an error object', mockResponse);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: 'An unexpected error occurred',
      code: AppErrorCode.INTERNAL_SERVER_ERROR
    }));
  });

  it('should call the error logging function', () => {
    // Arrange
    const error = new Error('Test error');

    // Act
    handleApiError(error, mockResponse);

    // Assert
    expect(logError).toHaveBeenCalledWith('API Error encountered', error);
  });

  it('should include more error details in development mode', () => {
    // Arrange
    const error = new Error('Test error');
    error.stack = 'Mock stack trace';
    (isDevelopment as jest.Mock).mockReturnValue(true);

    // Act
    handleApiError(error, mockResponse);

    // Assert
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      details: expect.objectContaining({
        message: 'Test error',
        stack: 'Mock stack trace'
      })
    }));
  });
});

describe('formatErrorResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should format AppError instances with correct fields', () => {
    // Arrange
    const appError = new AppError(
      AppErrorCode.NOT_FOUND,
      'Resource not found',
      HttpStatusCode.NOT_FOUND,
      { resourceId: '123' }
    );

    // Act
    const response = formatErrorResponse(appError);

    // Assert
    expect(response).toEqual({
      success: false,
      error: 'Resource not found',
      code: AppErrorCode.NOT_FOUND,
      details: { resourceId: '123' }
    });
  });

  it('should format standard Error instances with generic error code', () => {
    // Arrange
    const standardError = new Error('Standard error');
    (isDevelopment as jest.Mock).mockReturnValue(false);

    // Act
    const response = formatErrorResponse(standardError);

    // Assert
    expect(response).toEqual({
      success: false,
      error: 'An unexpected error occurred',
      code: AppErrorCode.INTERNAL_SERVER_ERROR
    });
  });

  it('should format unknown error types', () => {
    // Act
    const response = formatErrorResponse('Not an error object');

    // Assert
    expect(response).toEqual({
      success: false,
      error: 'An unexpected error occurred',
      code: AppErrorCode.INTERNAL_SERVER_ERROR
    });
  });

  it('should include stack trace in details in development mode', () => {
    // Arrange
    const standardError = new Error('Standard error');
    standardError.stack = 'Mock stack trace';
    (isDevelopment as jest.Mock).mockReturnValue(true);

    // Act
    const response = formatErrorResponse(standardError);

    // Assert
    expect(response.details).toEqual(expect.objectContaining({
      message: 'Standard error',
      stack: 'Mock stack trace'
    }));
  });
});

describe('isAppError', () => {
  it('should return true for valid AppError instances', () => {
    // Arrange
    const appError = new AppError(
      AppErrorCode.VALIDATION_ERROR,
      'Validation error',
      HttpStatusCode.BAD_REQUEST
    );

    // Act & Assert
    expect(isAppError(appError)).toBe(true);
  });

  it('should return false for standard Error instances', () => {
    // Arrange
    const standardError = new Error('Standard error');

    // Act & Assert
    expect(isAppError(standardError)).toBe(false);
  });

  it('should return false for null or undefined', () => {
    // Act & Assert
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });

  it('should return false for objects missing required properties', () => {
    // Arrange
    const missingCode = { message: 'Error', statusCode: 400 };
    const missingMessage = { code: AppErrorCode.VALIDATION_ERROR, statusCode: 400 };
    const missingStatusCode = { code: AppErrorCode.VALIDATION_ERROR, message: 'Error' };

    // Act & Assert
    expect(isAppError(missingCode)).toBe(false);
    expect(isAppError(missingMessage)).toBe(false);
    expect(isAppError(missingStatusCode)).toBe(false);
  });
});

describe('createNotFoundError', () => {
  it('should create an AppError with NOT_FOUND code', () => {
    // Arrange
    const resourceType = 'organization';
    const resourceId = '123';

    // Act
    const error = createNotFoundError(resourceType, resourceId);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(AppErrorCode.NOT_FOUND);
  });

  it('should include resource type and ID in the message', () => {
    // Arrange
    const resourceType = 'organization';
    const resourceId = '123';

    // Act
    const error = createNotFoundError(resourceType, resourceId);

    // Assert
    expect(error.message).toContain(resourceType);
    expect(error.message).toContain(resourceId);
  });

  it('should include resource details in the details property', () => {
    // Arrange
    const resourceType = 'organization';
    const resourceId = '123';

    // Act
    const error = createNotFoundError(resourceType, resourceId);

    // Assert
    expect(error.details).toEqual({
      resourceType,
      resourceId
    });
  });

  it('should set the correct HTTP status code', () => {
    // Arrange
    const resourceType = 'organization';
    const resourceId = '123';

    // Act
    const error = createNotFoundError(resourceType, resourceId);

    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
  });
});

describe('createDuplicateEntityError', () => {
  it('should create an AppError with DUPLICATE_ENTITY code', () => {
    // Arrange
    const entityType = 'organization';
    const identifier = '123';

    // Act
    const error = createDuplicateEntityError(entityType, identifier);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(AppErrorCode.DUPLICATE_ENTITY);
  });

  it('should include entity type and identifier in the message', () => {
    // Arrange
    const entityType = 'organization';
    const identifier = '123';

    // Act
    const error = createDuplicateEntityError(entityType, identifier);

    // Assert
    expect(error.message).toContain(entityType);
    expect(error.message).toContain(identifier);
  });

  it('should include entity details in the details property', () => {
    // Arrange
    const entityType = 'organization';
    const identifier = '123';

    // Act
    const error = createDuplicateEntityError(entityType, identifier);

    // Assert
    expect(error.details).toEqual({
      entityType,
      identifier
    });
  });

  it('should set the correct HTTP status code', () => {
    // Arrange
    const entityType = 'organization';
    const identifier = '123';

    // Act
    const error = createDuplicateEntityError(entityType, identifier);

    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.CONFLICT);
  });
});

describe('createDatabaseError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an AppError with DATABASE_ERROR code', () => {
    // Arrange
    const operation = 'query';
    const originalError = new Error('Database connection failed');
    (isDevelopment as jest.Mock).mockReturnValue(false);

    // Act
    const error = createDatabaseError(operation, originalError);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(AppErrorCode.DATABASE_ERROR);
  });

  it('should include operation in the message', () => {
    // Arrange
    const operation = 'query';
    const originalError = new Error('Database connection failed');

    // Act
    const error = createDatabaseError(operation, originalError);

    // Assert
    expect(error.message).toContain(operation);
  });

  it('should include safe details from the original error', () => {
    // Arrange
    const operation = 'query';
    const originalError = new Error('Database connection failed');

    // Act
    const error = createDatabaseError(operation, originalError);

    // Assert
    expect(error.details).toEqual(expect.objectContaining({
      operation
    }));
  });

  it('should set the correct HTTP status code', () => {
    // Arrange
    const operation = 'query';
    const originalError = new Error('Database connection failed');

    // Act
    const error = createDatabaseError(operation, originalError);

    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
  });

  it('should include more details in development mode', () => {
    // Arrange
    const operation = 'query';
    const originalError = new Error('Database connection failed');
    originalError.stack = 'Mock stack trace';
    (isDevelopment as jest.Mock).mockReturnValue(true);

    // Act
    const error = createDatabaseError(operation, originalError);

    // Assert
    expect(error.details).toEqual(expect.objectContaining({
      operation,
      originalError: {
        message: 'Database connection failed',
        stack: 'Mock stack trace'
      }
    }));
  });
});

describe('getErrorStatusCode', () => {
  it('should map VALIDATION_ERROR to BAD_REQUEST', () => {
    // Arrange & Act
    const error = createAppError(AppErrorCode.VALIDATION_ERROR, 'Invalid data');
    
    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it('should map NOT_FOUND to NOT_FOUND', () => {
    // Arrange & Act
    const error = createAppError(AppErrorCode.NOT_FOUND, 'Resource not found');
    
    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
  });

  it('should map DUPLICATE_ENTITY to CONFLICT', () => {
    // Arrange & Act
    const error = createAppError(AppErrorCode.DUPLICATE_ENTITY, 'Entity already exists');
    
    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.CONFLICT);
  });

  it('should map DATABASE_ERROR to INTERNAL_SERVER_ERROR', () => {
    // Arrange & Act
    const error = createAppError(AppErrorCode.DATABASE_ERROR, 'Database error');
    
    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
  });

  it('should map INTERNAL_SERVER_ERROR to INTERNAL_SERVER_ERROR', () => {
    // Arrange & Act
    const error = createAppError(AppErrorCode.INTERNAL_SERVER_ERROR, 'Server error');
    
    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
  });

  it('should default to INTERNAL_SERVER_ERROR for unknown codes', () => {
    // Arrange & Act
    // @ts-ignore - Deliberately passing an invalid code for testing
    const error = createAppError('UNKNOWN_CODE', 'Unknown error');
    
    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
  });
});