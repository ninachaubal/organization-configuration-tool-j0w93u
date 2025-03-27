import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import { checkDatabaseConnection } from './db';
import { withErrorHandling } from '../../../middleware/error';
import { withLogging } from '../../../middleware/logging';
import { info } from '../../../utils/logging';
import { HttpStatusCode } from '../../../types/error';

/**
 * API route handler for the main health check endpoint
 * 
 * @param request NextJS request object
 * @returns Response with application health status
 */
async function healthCheckHandler(request: NextRequest): Promise<NextResponse> {
  // Log the start of health check process
  info('Performing application health check');
  
  // Check database connectivity
  const dbStatus = await checkDatabaseConnection();
  
  // Create a health check response object with overall status and component statuses
  const healthCheck = {
    success: dbStatus.success, // Overall status depends on database status
    timestamp: new Date().toISOString(),
    components: {
      database: {
        status: dbStatus.success ? 'healthy' : 'unhealthy',
        ...(dbStatus.details && { details: dbStatus.details })
      }
    }
  };
  
  // Log the health check result
  info('Health check completed', { success: healthCheck.success });
  
  // Return NextResponse with health check data and appropriate status code (200 for success, 503 for failure)
  return NextResponse.json(
    healthCheck,
    { status: healthCheck.success ? HttpStatusCode.OK : HttpStatusCode.SERVICE_UNAVAILABLE }
  );
}

// Export the GET handler for the health check API endpoint with error handling and logging middleware
export const GET = withLogging(withErrorHandling(healthCheckHandler as any));