import { jest } from 'jest'; // v29.5.0
import { createMocks } from 'node-mocks-http'; // v1.12.2
import { NextRequest, NextResponse } from 'next/server'; // v14.0.0
import {
  withAuth,
  withPermission,
  authMiddleware,
  validateAuthToken,
  getUserFromToken,
  createAuthenticationError,
  createAuthorizationError
} from '../../middleware/auth';
import { AppError, AppErrorCode, HttpStatusCode } from '../../types/error';
import { isDevelopment } from '../../config/environment';

// Mock the isDevelopment function
jest.mock('../../config/environment', () => ({
  isDevelopment: jest.fn()
}));

describe('withAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isDevelopment as jest.Mock).mockReturnValue(false); // Default to production mode
  });

  test('should call handler when token is valid', async () => {
    // Mock validateAuthToken and getUserFromToken behavior
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'validateAuthToken')
      .mockReturnValue(true);
    
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'getUserFromToken')
      .mockReturnValue({
        id: 'test-user',
        email: 'test@example.com',
        roles: ['admin']
      });

    // Create mock request/response and handler
    const mockHandler = jest.fn().mockImplementation((req, res) => {
      return res.status(200).json({ success: true });
    });
    
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });
    
    // Act
    const wrappedHandler = withAuth(mockHandler);
    await wrappedHandler(req, res);
    
    // Assert
    expect(mockHandler).toHaveBeenCalledWith(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });

  test('should attach user to request when token is valid', async () => {
    // Arrange
    const mockUser = {
      id: 'test-user',
      email: 'test@example.com',
      roles: ['admin']
    };
    
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'validateAuthToken')
      .mockReturnValue(true);
    
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'getUserFromToken')
      .mockReturnValue(mockUser);
    
    const mockHandler = jest.fn().mockImplementation((req, res) => {
      return res.status(200).json({ user: (req as any).user });
    });
    
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });
    
    // Act
    const wrappedHandler = withAuth(mockHandler);
    await wrappedHandler(req, res);
    
    // Assert
    expect((req as any).user).toEqual(mockUser);
    expect(JSON.parse(res._getData())).toEqual({ user: mockUser });
  });

  test('should return unauthorized error when token is invalid', async () => {
    // Arrange
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'validateAuthToken')
      .mockReturnValue(false);
    
    const mockHandler = jest.fn();
    
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer invalid-token'
      }
    });
    
    // Act
    const wrappedHandler = withAuth(mockHandler);
    await wrappedHandler(req, res);
    
    // Assert
    expect(mockHandler).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.UNAUTHORIZED);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: false,
      error: expect.any(String),
      code: AppErrorCode.UNAUTHORIZED
    });
  });

  test('should handle different token sources', async () => {
    // Arrange
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'validateAuthToken')
      .mockReturnValue(true);
    
    // Test for token in cookies
    const { req: reqWithCookie, res: resWithCookie } = createMocks({
      method: 'GET',
      cookies: { auth_token: 'cookie-token' }
    });
    
    const mockHandler = jest.fn().mockImplementation((req, res) => {
      return res.status(200).json({ success: true });
    });
    
    // Act & Assert - Cookie token
    const wrappedHandler = withAuth(mockHandler);
    await wrappedHandler(reqWithCookie, resWithCookie);
    
    expect(mockHandler).toHaveBeenCalledWith(reqWithCookie, resWithCookie);
    expect(resWithCookie._getStatusCode()).toBe(200);
  });
});

describe('withPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isDevelopment as jest.Mock).mockReturnValue(false);
  });

  test('should allow access when user has required role', async () => {
    // Arrange
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'validateAuthToken')
      .mockReturnValue(true);
    
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'getUserFromToken')
      .mockReturnValue({
        id: 'test-user',
        email: 'test@example.com',
        roles: ['admin', 'editor']
      });
    
    const mockHandler = jest.fn().mockImplementation((req, res) => {
      return res.status(200).json({ success: true });
    });
    
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });
    
    // Act
    const wrappedHandler = withPermission(['admin'], mockHandler);
    await wrappedHandler(req, res);
    
    // Assert
    expect(mockHandler).toHaveBeenCalledWith(req, res);
    expect(res._getStatusCode()).toBe(200);
  });

  test('should deny access when user lacks required roles', async () => {
    // Arrange
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'validateAuthToken')
      .mockReturnValue(true);
    
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'getUserFromToken')
      .mockReturnValue({
        id: 'test-user',
        email: 'test@example.com',
        roles: ['editor']
      });
    
    const mockHandler = jest.fn();
    
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });
    
    // Act
    const wrappedHandler = withPermission(['admin'], mockHandler);
    await wrappedHandler(req, res);
    
    // Assert
    expect(mockHandler).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.FORBIDDEN);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: false,
      code: AppErrorCode.FORBIDDEN
    });
  });

  test('should allow access when user has any of multiple required roles', async () => {
    // Arrange
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'validateAuthToken')
      .mockReturnValue(true);
    
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'getUserFromToken')
      .mockReturnValue({
        id: 'test-user',
        email: 'test@example.com',
        roles: ['editor']
      });
    
    const mockHandler = jest.fn().mockImplementation((req, res) => {
      return res.status(200).json({ success: true });
    });
    
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });
    
    // Act
    const wrappedHandler = withPermission(['admin', 'editor'], mockHandler);
    await wrappedHandler(req, res);
    
    // Assert
    expect(mockHandler).toHaveBeenCalledWith(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should continue when token is valid', async () => {
    // Arrange
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'validateAuthToken')
      .mockReturnValue(true);
    
    const mockRequest = {
      nextUrl: { pathname: '/api/organizations' },
      headers: {
        get: jest.fn().mockImplementation((header) => {
          if (header === 'authorization') return 'Bearer valid-token';
          return null;
        })
      },
      cookies: {
        get: jest.fn().mockReturnValue(null)
      }
    } as unknown as NextRequest;
    
    // Act
    const response = await authMiddleware(mockRequest);
    
    // Assert
    expect(response).toBeUndefined();
  });

  test('should return unauthorized response when token is invalid', async () => {
    // Arrange
    jest.spyOn(Object.getPrototypeOf(require('../../middleware/auth')), 'validateAuthToken')
      .mockReturnValue(false);
    
    (isDevelopment as jest.Mock).mockReturnValue(false);
    
    const mockRequest = {
      nextUrl: { pathname: '/api/organizations' },
      headers: {
        get: jest.fn().mockImplementation((header) => {
          if (header === 'authorization') return 'Bearer invalid-token';
          return null;
        })
      },
      cookies: {
        get: jest.fn().mockReturnValue(null)
      }
    } as unknown as NextRequest;
    
    // Mock NextResponse.json
    const jsonMock = jest.fn().mockReturnValue({ status: HttpStatusCode.UNAUTHORIZED });
    (NextResponse as any).json = jsonMock;
    
    // Act
    await authMiddleware(mockRequest);
    
    // Assert
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: AppErrorCode.UNAUTHORIZED
      }),
      expect.objectContaining({ status: HttpStatusCode.UNAUTHORIZED })
    );
  });

  test('should skip authentication for non-API routes', async () => {
    // Arrange
    const mockRequest = {
      nextUrl: { pathname: '/dashboard' },
      headers: {
        get: jest.fn().mockReturnValue(null)
      },
      cookies: {
        get: jest.fn().mockReturnValue(null)
      }
    } as unknown as NextRequest;
    
    // Act
    const response = await authMiddleware(mockRequest);
    
    // Assert
    expect(response).toBeUndefined();
  });

  test('should allow requests without token in development mode', async () => {
    // Arrange
    (isDevelopment as jest.Mock).mockReturnValue(true);
    
    const mockRequest = {
      nextUrl: { pathname: '/api/organizations' },
      headers: {
        get: jest.fn().mockReturnValue(null)
      },
      cookies: {
        get: jest.fn().mockReturnValue(null)
      },
      searchParams: {
        get: jest.fn().mockReturnValue(null)
      }
    } as unknown as NextRequest;
    
    // Act
    const response = await authMiddleware(mockRequest);
    
    // Assert
    expect(response).toBeUndefined();
  });
});

describe('validateAuthToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return false for undefined token', () => {
    // Act
    const result = validateAuthToken(undefined);
    
    // Assert
    expect(result).toBe(false);
  });

  test('should return false for empty token', () => {
    // Act
    const result = validateAuthToken('');
    
    // Assert
    expect(result).toBe(false);
  });

  test('should return true for any token in development mode', () => {
    // Arrange
    (isDevelopment as jest.Mock).mockReturnValue(true);
    
    // Act
    const result = validateAuthToken('any-token');
    
    // Assert
    expect(result).toBe(true);
  });

  test('should validate token structure in production mode', () => {
    // Arrange
    (isDevelopment as jest.Mock).mockReturnValue(false);
    
    // Act
    const result = validateAuthToken('valid-token');
    
    // Assert
    expect(result).toBe(true);
  });
});

describe('getUserFromToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return a mock user in development mode', () => {
    // Arrange
    (isDevelopment as jest.Mock).mockReturnValue(true);
    
    // Act
    const user = getUserFromToken('any-token');
    
    // Assert
    expect(user).toEqual({
      id: 'dev-user-id',
      email: 'dev@example.com',
      roles: ['admin']
    });
  });

  test('should extract user information from a valid token', () => {
    // Arrange
    (isDevelopment as jest.Mock).mockReturnValue(false);
    
    // Act
    const user = getUserFromToken('valid-token');
    
    // Assert
    expect(user).toEqual(expect.objectContaining({
      id: expect.any(String),
      email: expect.any(String),
      roles: expect.any(Array)
    }));
  });

  test('should include user id, email, and roles', () => {
    // Arrange
    (isDevelopment as jest.Mock).mockReturnValue(false);
    
    // Act
    const user = getUserFromToken('valid-token');
    
    // Assert
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('roles');
    expect(Array.isArray(user.roles)).toBe(true);
  });
});

describe('createAuthenticationError', () => {
  test('should create an AppError with UNAUTHORIZED code', () => {
    // Act
    const error = createAuthenticationError('Test authentication error');
    
    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(AppErrorCode.UNAUTHORIZED);
  });

  test('should set the correct HTTP status code', () => {
    // Act
    const error = createAuthenticationError('Test authentication error');
    
    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
  });

  test('should use the provided message', () => {
    // Arrange
    const message = 'Custom authentication error message';
    
    // Act
    const error = createAuthenticationError(message);
    
    // Assert
    expect(error.message).toBe(message);
  });
});

describe('createAuthorizationError', () => {
  test('should create an AppError with FORBIDDEN code', () => {
    // Act
    const error = createAuthorizationError('Test authorization error', ['admin']);
    
    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(AppErrorCode.FORBIDDEN);
  });

  test('should set the correct HTTP status code', () => {
    // Act
    const error = createAuthorizationError('Test authorization error', ['admin']);
    
    // Assert
    expect(error.statusCode).toBe(HttpStatusCode.FORBIDDEN);
  });

  test('should use the provided message', () => {
    // Arrange
    const message = 'Custom authorization error message';
    
    // Act
    const error = createAuthorizationError(message, ['admin']);
    
    // Assert
    expect(error.message).toBe(message);
  });

  test('should include required roles in error details', () => {
    // Arrange
    const requiredRoles = ['admin', 'editor'];
    
    // Act
    const error = createAuthorizationError('Test authorization error', requiredRoles);
    
    // Assert
    expect(error.details).toHaveProperty('requiredRoles', requiredRoles);
  });
});