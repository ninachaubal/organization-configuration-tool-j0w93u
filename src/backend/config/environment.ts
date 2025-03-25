/**
 * Environment configuration for the application
 * 
 * This module provides a centralized location for accessing environment-specific values
 * and determining the current execution environment.
 */

// Environment variables with defaults
const NODE_ENV = process.env.NODE_ENV || 'development';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const ORGANIZATION_CONFIGURATION_TABLE_NAME = process.env.ORGANIZATION_CONFIGURATION_TABLE_NAME;
const DYNAMODB_LOCAL_ENDPOINT = process.env.DYNAMODB_LOCAL_ENDPOINT;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * Determines if the application is running in development mode
 * @returns True if running in development environment
 */
export const isDevelopment = (): boolean => {
  return NODE_ENV === 'development';
};

/**
 * Determines if the application is running in production mode
 * @returns True if running in production environment
 */
export const isProduction = (): boolean => {
  return NODE_ENV === 'production';
};

/**
 * Determines if the application is running in test mode
 * @returns True if running in test environment
 */
export const isTest = (): boolean => {
  return NODE_ENV === 'test';
};

/**
 * Validates that all required environment variables are set
 * @throws Error if any required variables are missing
 */
export const validateRequiredEnvVars = (): void => {
  const missingVars: string[] = [];

  if (!ORGANIZATION_CONFIGURATION_TABLE_NAME) {
    missingVars.push('ORGANIZATION_CONFIGURATION_TABLE_NAME');
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (isDevelopment()) {
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`AWS Region: ${AWS_REGION}`);
    console.log(`DynamoDB Table: ${ORGANIZATION_CONFIGURATION_TABLE_NAME}`);
    console.log(`DynamoDB Local Endpoint: ${DYNAMODB_LOCAL_ENDPOINT || 'Not set (using AWS)'}`);
    console.log('All required environment variables are present.');
  }
};

// Export environment variables
export const env = {
  NODE_ENV,
  AWS_REGION,
  ORGANIZATION_CONFIGURATION_TABLE_NAME,
  DYNAMODB_LOCAL_ENDPOINT,
  API_BASE_URL,
};