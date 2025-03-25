/**
 * Utility functions for form handling in the organization configuration management tool.
 * Provides helper functions for form data manipulation, comparison, validation, and preparation for API submission.
 */

import { deepClone, deepEqual, isEmpty, removeEmptyValues } from './utils';
import type { FieldValues } from 'react-hook-form';

/**
 * Determines if form values have changed from the default values
 * @param currentValues - Current form values
 * @param defaultValues - Default form values to compare against
 * @returns True if form values have changed, false otherwise
 */
export function hasFormChanged(
  currentValues: Record<string, any>,
  defaultValues: Record<string, any>
): boolean {
  // Create deep clones to avoid mutation
  const currentClone = deepClone(currentValues);
  const defaultClone = deepClone(defaultValues);
  
  // Return true if values are different, false if they're the same
  return !deepEqual(currentClone, defaultClone);
}

/**
 * Extracts only the values that have changed from the default values
 * @param currentValues - Current form values
 * @param defaultValues - Default form values to compare against
 * @returns Object containing only the changed values
 */
export function extractChangedValues(
  currentValues: Record<string, any>,
  defaultValues: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Iterate through each key in currentValues
  Object.keys(currentValues).forEach(key => {
    const currentValue = currentValues[key];
    const defaultValue = defaultValues[key];
    
    // Handle nested objects
    if (
      currentValue !== null &&
      defaultValue !== null &&
      typeof currentValue === 'object' &&
      typeof defaultValue === 'object' &&
      !Array.isArray(currentValue) &&
      !Array.isArray(defaultValue)
    ) {
      const nestedChanges = extractChangedValues(currentValue, defaultValue);
      
      // Only add nested changes if there are any
      if (Object.keys(nestedChanges).length > 0) {
        result[key] = nestedChanges;
      }
      
      return;
    }
    
    // Handle arrays
    if (Array.isArray(currentValue) && Array.isArray(defaultValue)) {
      // If arrays have different lengths, consider it changed
      if (currentValue.length !== defaultValue.length) {
        result[key] = currentValue;
        return;
      }
      
      // Compare each element in the arrays
      if (!deepEqual(currentValue, defaultValue)) {
        result[key] = currentValue;
      }
      
      return;
    }
    
    // For primitive values and everything else
    if (!deepEqual(currentValue, defaultValue)) {
      result[key] = currentValue;
    }
  });
  
  return result;
}

/**
 * Prepares form data for API submission by removing empty values and extracting only changed values
 * @param formData - The current form data
 * @param defaultValues - The default form values to compare against
 * @returns Prepared data ready for API submission
 */
export function prepareFormDataForSubmission(
  formData: Record<string, any>,
  defaultValues: Record<string, any>
): Record<string, any> {
  // Check if form data has changed
  if (!hasFormChanged(formData, defaultValues)) {
    return {};
  }
  
  // Extract only the changed values
  const changedValues = extractChangedValues(formData, defaultValues);
  
  // Remove empty values from the changed values
  const cleanedData = removeEmptyValues(changedValues);
  
  return cleanedData;
}

/**
 * Gets a nested value from an object using a path string (e.g., 'customer.address.city')
 * @param obj - The object to get the value from
 * @param path - The path to the value, using dot notation
 * @param defaultValue - The default value to return if the path doesn't exist
 * @returns The value at the specified path or the default value if not found
 */
export function getNestedValue(
  obj: Record<string, any>, 
  path: string, 
  defaultValue: any = undefined
): any {
  // Split the path by dots to get an array of keys
  const keys = path.split('.');
  let result = obj;
  
  // Traverse the object using the keys
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}

/**
 * Sets a nested value in an object using a path string (e.g., 'customer.address.city')
 * @param obj - The object to set the value in
 * @param path - The path to set the value at, using dot notation
 * @param value - The value to set
 * @returns A new object with the updated nested value
 */
export function setNestedValue(
  obj: Record<string, any>, 
  path: string, 
  value: any
): Record<string, any> {
  // Create a deep clone of the object to avoid mutation
  const clone = deepClone(obj);
  
  // Split the path by dots to get an array of keys
  const keys = path.split('.');
  let current = clone;
  
  // Traverse the object, creating nested objects as needed
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    // If the current key doesn't exist or isn't an object, create it
    if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
      current[key] = {};
    }
    
    current = current[key];
  }
  
  // Set the value at the final key
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
  
  return clone;
}

/**
 * Transforms form data according to a mapping of field paths
 * @param formData - The form data to transform
 * @param fieldMapping - An object mapping source paths to target paths
 * @returns Transformed data according to the mapping
 */
export function transformFormData(
  formData: Record<string, any>,
  fieldMapping: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Process each field mapping
  Object.entries(fieldMapping).forEach(([sourcePath, targetPath]) => {
    // Get the value from the source path
    const value = getNestedValue(formData, sourcePath);
    
    // Set the value at the target path if it's not undefined
    if (value !== undefined) {
      setNestedValue(result, targetPath, value);
    }
  });
  
  return result;
}

/**
 * Validates a single form field value against a validation function
 * @param value - The value to validate
 * @param validator - A function that returns true for valid values,
 *                   false for invalid values, or a string error message
 * @returns An object with a valid flag and optional error message
 */
export function validateFormField(
  value: any,
  validator: (value: any) => boolean | string
): { valid: boolean; message?: string } {
  const result = validator(value);
  
  if (result === true) {
    return { valid: true };
  }
  
  if (typeof result === 'string') {
    return { valid: false, message: result };
  }
  
  return { valid: false, message: 'Invalid value' };
}