import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'; // v14.0.0
import { NextRequest, NextResponse } from 'next/server'; // v14.0.0
import {
  logApiRequest,
  logApiResponse,
  info,
  error
} from '../utils/logging';
import { isDevelopment, isTest } from '../config/environment';

/**
 * Higher-order function that wraps an API handler with logging middleware
 * 
 * @param handler - The original API handler function
 * @returns A new handler function with logging functionality
 */
export const withLogging = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Add request ID for correlation
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    req.headers['x-request-id'] = Array.isArray(requestId) ? requestId[0] : requestId;
    
    // Start time for performance measurement
    const startTime = Date.now();
    
    // Log the incoming request
    logApiRequest(req);
    
    // Create a proxy around the response to capture data for logging
    const proxiedRes = createResponseProxy(res, req, startTime, requestId as string);
    
    try {
      // Call the original handler with the proxied response
      return await handler(req, proxiedRes);
    } catch (err) {
      // Calculate request duration
      const duration = Date.now() - startTime;
      
      // Log any uncaught errors
      error('Uncaught error in API handler', err, {
        path: req.url,
        method: req.method,
        userId: extractUserIdFromRequest(req),
        requestId,
        duration
      });
      
      // Re-throw the error for global error handling
      throw err;
    }
  };
};

/**
 * Middleware function for NextJS App Router that logs requests
 * 
 * @param request - The incoming request object
 * @returns NextResponse or undefined to continue processing
 */
export const loggingMiddleware = (request: NextRequest): NextResponse | undefined => {
  // Skip logging in test environment
  if (isTest()) {
    return undefined;
  }
  
  // Generate request ID if not present
  const requestId = request.headers.get('x-request-id') || 
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // Extract relevant request details
  const method = request.method;
  const url = request.url;
  const headerObj = Object.fromEntries([...request.headers.entries()]);
  const sanitizedHeaders = sanitizeHeaders(headerObj);
  
  // Log the request
  info(`API Request: ${method} ${url}`, {
    method,
    url,
    headers: sanitizedHeaders,
    userId: extractUserIdFromRequest(request),
    requestId
  });
  
  // Return undefined to continue to the next middleware or route handler
  return undefined;
};

/**
 * Extracts the user ID from the request for audit logging purposes
 * 
 * @param request - The incoming request object
 * @returns The user ID if available, undefined otherwise
 */
export const extractUserIdFromRequest = (request: NextApiRequest | NextRequest): string | undefined => {
  // Try to extract from authorization header (JWT token)
  let authHeader: string | null | undefined;
  
  if (request instanceof NextRequest) {
    // NextRequest (App Router)
    authHeader = request.headers.get('authorization');
  } else {
    // NextApiRequest (Pages Router)
    authHeader = request.headers.authorization;
  }
    
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Basic extraction - in a real app, you'd properly decode and verify the JWT
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {  // Ensure it's a valid JWT format
        const tokenData = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        if (tokenData.sub || tokenData.userId) {
          return tokenData.sub || tokenData.userId;
        }
      }
    } catch (e) {
      // Silently fail if token parsing fails
    }
  }
  
  // Try to extract from session (if using NextAuth or similar)
  // This mainly applies to Pages Router
  if ('session' in request && 
      request.session && 
      typeof request.session === 'object' &&
      request.session.user &&
      typeof request.session.user === 'object' &&
      'id' in request.session.user) {
    return request.session.user.id as string;
  }
  
  // Could not extract user ID
  return undefined;
};

/**
 * Creates a proxy around the NextApiResponse object to capture response data for logging
 * 
 * @param res - The original response object
 * @param req - The request object
 * @param startTime - The request start time for calculating duration
 * @param requestId - The request ID for correlation
 * @returns A proxied response object that captures data for logging
 */
export const createResponseProxy = (
  res: NextApiResponse, 
  req: NextApiRequest,
  startTime: number,
  requestId: string
): NextApiResponse => {
  // Store the original methods we want to override
  const originalJson = res.json;
  const originalSend = res.send;
  const originalStatus = res.status;
  const originalRedirect = res.redirect;
  const originalEnd = res.end;
  
  // Variables to store the response data for logging
  let statusCode = 200;
  let responseBody: any;
  let isResponseLogged = false;
  
  // Override the status method
  res.status = function(code: number) {
    statusCode = code;
    return originalStatus.call(this, code);
  };
  
  // Helper to log the response
  const logResponse = (body: any) => {
    if (isResponseLogged) return;
    
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Log the response
    logApiResponse(req, res, statusCode, body);
    
    // Add additional context for performance logging
    info('API Response timing', {
      path: req.url,
      method: req.method,
      statusCode,
      duration,
      requestId
    });
    
    isResponseLogged = true;
  };
  
  // Override the json method
  res.json = function(body: any) {
    responseBody = body;
    logResponse(body);
    return originalJson.call(this, body);
  };
  
  // Override the send method
  res.send = function(body: any) {
    responseBody = body;
    logResponse(body);
    return originalSend.call(this, body);
  };
  
  // Override the redirect method
  res.redirect = function(url: string) {
    // Log the redirect
    const duration = Date.now() - startTime;
    info('API Redirect', {
      path: req.url,
      method: req.method,
      redirectUrl: url,
      statusCode: 302, // Default redirect status
      duration,
      requestId
    });
    
    isResponseLogged = true;
    return originalRedirect.call(this, url);
  };
  
  // Override the end method to catch cases where other methods aren't called
  res.end = function(cb?: () => void) {
    if (!isResponseLogged) {
      // If we get here without logging, log with whatever we have
      logResponse(responseBody || 'No response body');
    }
    return originalEnd.call(this, cb);
  };
  
  return res;
};

/**
 * Sanitizes request headers to remove sensitive information before logging
 * 
 * @param headers - The original headers object
 * @returns A sanitized copy of the headers object
 */
export const sanitizeHeaders = (headers: Record<string, string | string[] | undefined>): Record<string, string | string[] | undefined> => {
  const sanitized = { ...headers };
  
  // Remove sensitive headers
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-csrf-token',
    'x-api-key',
    'proxy-authorization',
    'set-cookie',
    'cookie2'
  ];
  
  sensitiveHeaders.forEach(header => {
    delete sanitized[header];
  });
  
  return sanitized;
};