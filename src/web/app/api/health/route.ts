import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import { checkDatabaseConnection } from '../../../../backend/api/health/db';
import { errorMiddleware } from '../../../../backend/middleware/error';
import { loggingMiddleware } from '../../../../backend/middleware/logging';
import { info } from '../../../../backend/utils/logging';
import { HttpStatusCode } from '../../../../backend/types/error';

/**
 * API route handler for the health check endpoint
 * 
 * This endpoint verifies the application's operational status, including database connectivity,
 * and returns appropriate status codes for monitoring systems.
 * 
 * @param request NextJS request object
 * @returns Response with application health status
 */
async function healthCheckHandler(request: NextRequest): Promise<NextResponse> {
  // Log the start of health check process
  info('Health check initiated', { path: request.url });
  
  try {
    // Check database connectivity
    const dbStatus = await checkDatabaseConnection();
    
    // Create health check response
    const healthCheckResponse = {
      success: dbStatus.success, // Overall health is based on DB status
      timestamp: new Date().toISOString(),
      database: dbStatus // Include full database status with details
    };
    
    // Return response with appropriate status code
    return NextResponse.json(
      healthCheckResponse,
      { status: dbStatus.success ? HttpStatusCode.OK : HttpStatusCode.SERVICE_UNAVAILABLE }
    );
  } catch (err) {
    // Handle any unexpected errors using error middleware
    return errorMiddleware(err, request);
  }
}

/**
 * GET handler for the health check API endpoint
 * Route: /api/health
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Apply logging middleware
  loggingMiddleware(request);
  
  // Execute health check handler
  return healthCheckHandler(request);
}