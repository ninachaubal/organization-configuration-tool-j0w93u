import { NextRequest, NextResponse } from 'next/server'; // ^14.0.0
import { OrganizationConfiguration } from '../../../data/entities/OrganizationConfiguration';
import { createDatabaseError } from '../../../utils/error-handling';
import { info, error as logError } from '../../../utils/logging';
import { withErrorHandling } from '../../../middleware/error';
import { withLogging } from '../../../middleware/logging';

/**
 * Verifies connectivity to DynamoDB by performing a lightweight scan operation
 * 
 * @returns Result of the database connectivity check
 */
export async function checkDatabaseConnection(): Promise<{ success: boolean; details?: Record<string, any> }> {
  const startTime = Date.now();
  info('Performing database health check');
  
  try {
    // Perform a lightweight scan operation with a limit of 1 item
    // This is sufficient to verify database connectivity without retrieving large amounts of data
    const result = await OrganizationConfiguration.scan.go({ limit: 1 });
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    info('Database health check successful', { 
      responseTime,
      table: OrganizationConfiguration.table.name
    });
    
    return { 
      success: true, 
      details: { 
        responseTime: `${responseTime}ms`,
        dbOperationType: 'scan',
        table: OrganizationConfiguration.table.name
      } 
    };
  } catch (err) {
    // Calculate response time even for failures
    const responseTime = Date.now() - startTime;
    
    // Use the utility function to create a standardized database error
    const dbError = createDatabaseError('health check scan operation', err);
    
    // Log the error with details
    logError('Database health check failed', dbError, { 
      responseTime,
      table: OrganizationConfiguration.table.name 
    });
    
    return { 
      success: false, 
      details: { 
        error: dbError.message,
        responseTime: `${responseTime}ms`,
        table: OrganizationConfiguration.table.name
      } 
    };
  }
}

/**
 * API route handler for the database health check endpoint
 * 
 * @param request NextJS request object
 * @returns Response with database health check status
 */
async function dbHealthCheckHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection();
    
    // Create response data
    const responseData = {
      success: dbStatus.success,
      service: 'database',
      timestamp: new Date().toISOString(),
      ...(dbStatus.details && { details: dbStatus.details })
    };
    
    // Return appropriate status code based on check result
    return NextResponse.json(
      responseData,
      { status: dbStatus.success ? 200 : 503 }
    );
  } catch (err) {
    // Log any unexpected errors
    logError('Unexpected error in database health check handler', err);
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        service: 'database',
        timestamp: new Date().toISOString(),
        details: {
          error: err instanceof Error ? err.message : 'Unexpected error during health check'
        }
      },
      { status: 500 }
    );
  }
}

// Export the handler for the database health check endpoint
export const GET = dbHealthCheckHandler;