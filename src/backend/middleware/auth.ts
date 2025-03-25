import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'; // ^14.0.0
import { NextRequest, NextResponse, NextMiddleware } from 'next/server'; // ^14.0.0
import { AppError, AppErrorCode, HttpStatusCode } from '../types/error';
import { createAppError } from '../utils/error-handling';
import { env, isDevelopment } from '../config/environment';

/**
 * Higher-order function that wraps an API handler with authentication checks
 * 
 * @param handler - The API handler to wrap
 * @returns A new handler function with authentication
 */
export const withAuth = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Extract token from request
    const token = extractTokenFromRequest(req);
    
    // Validate token
    if (!validateAuthToken(token)) {
      const error = createAuthenticationError('Authentication required');
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
    }
    
    // Attach user information to request
    if (token) {
      (req as any).user = getUserFromToken(token);
    }
    
    // Call the original handler
    return handler(req, res);
  };
};

/**
 * Higher-order function that wraps an API handler with role-based permission checks
 * 
 * @param requiredRoles - Array of roles allowed to access the endpoint
 * @param handler - The API handler to wrap
 * @returns A new handler function with permission checks
 */
export const withPermission = (requiredRoles: string[], handler: NextApiHandler): NextApiHandler => {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (req as any).user;
    
    // Check if user has any of the required roles
    const hasPermission = requiredRoles.some(role => user.roles.includes(role));
    
    if (!hasPermission) {
      const error = createAuthorizationError(
        'You do not have permission to access this resource',
        requiredRoles
      );
      
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
      });
    }
    
    // Call the original handler
    return handler(req, res);
  });
};

/**
 * NextJS Edge Runtime middleware for authentication in App Router
 * 
 * @param request - The incoming request
 * @returns NextResponse or undefined to continue
 */
export const authMiddleware = async (request: NextRequest): Promise<NextResponse | undefined> => {
  // Skip authentication for non-API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return undefined;
  }
  
  // Extract token from request
  const token = extractTokenFromRequest(request);
  
  // In development, allow requests without token
  if (!token && isDevelopment()) {
    return undefined;
  }
  
  // Validate token
  if (!validateAuthToken(token)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
        code: AppErrorCode.UNAUTHORIZED,
      },
      { status: HttpStatusCode.UNAUTHORIZED }
    );
  }
  
  // Continue to the route handler
  return undefined;
};

/**
 * Validates an authentication token and returns whether it's valid
 * 
 * @param token - The token to validate
 * @returns True if token is valid, false otherwise
 */
export const validateAuthToken = (token: string | undefined): boolean => {
  if (!token) {
    return false;
  }
  
  // In development mode, accept any token for testing
  if (isDevelopment()) {
    return true;
  }
  
  // In production, would verify the token signature and expiration
  // This is a placeholder for actual token validation logic
  try {
    // Token validation logic would go here
    // For now, we'll just check if it's a non-empty string
    return token.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Extracts user information from a validated authentication token
 * 
 * @param token - The authenticated token
 * @returns User information from the token
 */
export const getUserFromToken = (token: string): { id: string; email: string; roles: string[] } => {
  // In development mode, return a mock user
  if (isDevelopment()) {
    return {
      id: 'dev-user-id',
      email: 'dev@example.com',
      roles: ['admin'],
    };
  }
  
  // In production, would decode the JWT token
  // This is a placeholder for actual token decoding logic
  try {
    // Token decoding logic would go here
    // For now, we'll just return a mock user
    return {
      id: 'user-id-from-token',
      email: 'user@example.com',
      roles: ['admin'],
    };
  } catch (error) {
    // Fallback in case of decoding errors
    return {
      id: 'unknown',
      email: 'unknown',
      roles: [],
    };
  }
};

/**
 * Creates a standardized authentication error
 * 
 * @param message - Error message
 * @returns Authentication error with UNAUTHORIZED code
 */
export const createAuthenticationError = (message: string): AppError => {
  return createAppError(
    AppErrorCode.UNAUTHORIZED,
    message,
    { authRequired: true }
  );
};

/**
 * Creates a standardized authorization error
 * 
 * @param message - Error message
 * @param requiredRoles - Roles required for the operation
 * @returns Authorization error with FORBIDDEN code
 */
export const createAuthorizationError = (message: string, requiredRoles: string[]): AppError => {
  return createAppError(
    AppErrorCode.FORBIDDEN,
    message,
    { requiredRoles }
  );
};

/**
 * Extracts the authentication token from various request sources
 * 
 * @param request - The request object (NextApiRequest or NextRequest)
 * @returns The extracted token or undefined if not found
 */
export const extractTokenFromRequest = (request: NextApiRequest | NextRequest): string | undefined => {
  let token: string | undefined;
  
  // Type guard for NextRequest vs NextApiRequest
  const isNextRequest = (req: NextApiRequest | NextRequest): req is NextRequest => {
    return 'nextUrl' in req;
  };
  
  // Check Authorization header
  if (isNextRequest(request)) {
    // NextRequest (App Router)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check cookies if no token in header
    if (!token) {
      const authCookie = request.cookies.get('auth_token');
      token = authCookie?.value;
    }
    
    // In development, also check query parameters
    if (!token && isDevelopment()) {
      token = request.nextUrl.searchParams.get('token') || undefined;
    }
  } else {
    // NextApiRequest (Pages Router)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check cookies if no token in header
    if (!token && request.cookies) {
      token = request.cookies.auth_token;
    }
    
    // In development, also check query parameters
    if (!token && isDevelopment() && request.query) {
      token = request.query.token as string | undefined;
    }
  }
  
  return token;
};