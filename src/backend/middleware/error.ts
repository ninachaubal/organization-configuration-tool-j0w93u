import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'; // ^14.0.0
import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import {
  AppError,
  AppErrorCode,
  HttpStatusCode,
  ErrorResponse
} from '../types/error';
import {
  handleApiError,
  formatErrorResponse,
  isAppError
} from '../utils/error-handling';
import { error } from '../utils/logging';
import { isDevelopment } from '../config/environment';

/**
 * Higher-order function that wraps an API handler with error handling middleware
 * 
 * @param handler - The original API handler to wrap
 * @returns A new handler function with error handling
 */
export const withErrorHandling = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Execute the original handler
      return await handler(req, res);
    } catch (err) {
      // If an error occurs, handle it using the error handling utility
      handleApiError(err, res);
    }
  };
};

/**
 * Middleware function for NextJS App Router that handles errors in API routes
 * 
 * @param err - The error that occurred
 * @param request - The NextJS request object
 * @returns NextResponse with appropriate error status and body
 */
export const errorMiddleware = (
  err: Error | AppError | unknown,
  request: NextRequest
): NextResponse => {
  // Log the error
  error('API Error in App Router', err, {
    url: request.url,
    method: request.method
  });

  // Format the error into a standardized response
  const errorResponse = formatErrorResponse(err);
  
  // Determine the appropriate status code
  const statusCode = getErrorStatusCode(err);
  
  // Create the error response
  const response = NextResponse.json(
    errorResponse,
    { status: statusCode }
  );

  return response;
};

/**
 * Extracts the appropriate HTTP status code from an error
 * 
 * @param err - The error to extract status code from
 * @returns HTTP status code appropriate for the error
 */
export const getErrorStatusCode = (err: Error | AppError | unknown): number => {
  if (isAppError(err)) {
    return err.statusCode;
  }
  
  return HttpStatusCode.INTERNAL_SERVER_ERROR;
};