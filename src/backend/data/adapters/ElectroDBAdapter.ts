import { OrganizationConfiguration } from '../entities/OrganizationConfiguration';
import { createDatabaseError } from '../../utils/error-handling';
import { error } from '../../utils/logging';

/**
 * Executes a query operation on the OrganizationConfiguration entity with error handling
 * 
 * @param params - Parameters for the query operation
 * @returns Results of the query operation
 */
async function query(params: Record<string, any>): Promise<any> {
  try {
    const result = await OrganizationConfiguration.query(params);
    return result;
  } catch (err) {
    error('Database operation failed: query', err, { params });
    throw createDatabaseError('query', err);
  }
}

/**
 * Retrieves a specific item from the OrganizationConfiguration entity with error handling
 * 
 * @param params - Parameters for the get operation
 * @returns The retrieved item
 */
async function get(params: Record<string, any>): Promise<any> {
  try {
    const result = await OrganizationConfiguration.get(params);
    return result;
  } catch (err) {
    error('Database operation failed: get', err, { params });
    throw createDatabaseError('get', err);
  }
}

/**
 * Creates a new item in the OrganizationConfiguration entity with error handling
 * 
 * @param params - Parameters for the put operation
 * @returns The created item
 */
async function put(params: Record<string, any>): Promise<any> {
  try {
    const result = await OrganizationConfiguration.put(params);
    return result;
  } catch (err) {
    error('Database operation failed: put', err, { params });
    throw createDatabaseError('put', err);
  }
}

/**
 * Updates an existing item in the OrganizationConfiguration entity with error handling
 * 
 * @param params - Parameters for the update operation
 * @returns The updated item
 */
async function update(params: Record<string, any>): Promise<any> {
  try {
    const result = await OrganizationConfiguration.update(params);
    return result;
  } catch (err) {
    error('Database operation failed: update', err, { params });
    throw createDatabaseError('update', err);
  }
}

/**
 * Performs a scan operation on the OrganizationConfiguration entity with error handling
 * 
 * @param params - Parameters for the scan operation
 * @returns Results of the scan operation
 */
async function scan(params: Record<string, any>): Promise<any> {
  try {
    const result = await OrganizationConfiguration.scan(params);
    return result;
  } catch (err) {
    error('Database operation failed: scan', err, { params });
    throw createDatabaseError('scan', err);
  }
}

/**
 * Retrieves multiple items from the OrganizationConfiguration entity with error handling
 * 
 * @param params - Parameters for the batchGet operation
 * @returns The retrieved items
 */
async function batchGet(params: Record<string, any>[]): Promise<any> {
  try {
    const result = await OrganizationConfiguration.batchGet(params);
    return result;
  } catch (err) {
    error('Database operation failed: batchGet', err, { params });
    throw createDatabaseError('batchGet', err);
  }
}

/**
 * Adapter for ElectroDB operations providing a simplified interface 
 * with consistent error handling for database operations
 */
export const ElectroDBAdapter = {
  query,
  get,
  put,
  update,
  scan,
  batchGet
};