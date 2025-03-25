/**
 * Utility module providing common helper functions for data manipulation, 
 * comparison, validation, and transformation.
 */

/**
 * Checks if a value is a non-null object (excluding arrays)
 * @param value - The value to check
 * @returns True if the value is a non-null object, false otherwise
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param value - The value to check
 * @returns True if the value is empty, false otherwise
 */
export function isEmpty(value: any): boolean {
  // Check if value is null or undefined
  if (value === null || value === undefined) {
    return true;
  }
  
  // For strings, check if length is 0
  if (typeof value === 'string' && value.trim().length === 0) {
    return true;
  }
  
  // For arrays, check if length is 0
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  
  // For objects, check if it has no own properties
  if (isObject(value) && Object.keys(value).length === 0) {
    return true;
  }
  
  // If none of the above conditions are met, the value is not empty
  return false;
}

/**
 * Creates a deep copy of an object or array to avoid mutation
 * @param obj - The object to clone
 * @returns A deep copy of the input object
 */
export function deepClone<T>(obj: T): T {
  // Check if input is null or not an object, return as is
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // If input is a Date, return new Date with same value
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  // If input is an array, map each element through deepClone recursively
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  // If input is an object, create a new object and copy each property
  const cloned: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    cloned[key] = deepClone((obj as Record<string, any>)[key]);
  });
  
  return cloned as T;
}

/**
 * Compares two values for deep equality, including nested objects and arrays
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are deeply equal, false otherwise
 */
export function deepEqual(a: any, b: any): boolean {
  // If both values are null or undefined, they're equal
  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b;
  }
  
  // If types don't match, they're not equal
  if (typeof a !== typeof b) {
    return false;
  }
  
  // For primitive types, use strict equality
  if (typeof a !== 'object') {
    return a === b;
  }
  
  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    
    return true;
  }
  
  // If one is an array but the other isn't, they're not equal
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  
  // Handle objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  return keysA.every(key => 
    Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key])
  );
}

/**
 * Recursively removes empty values (null, undefined, empty strings, empty arrays, empty objects) from an object
 * @param obj - The object to clean
 * @returns A new object with empty values removed
 */
export function removeEmptyValues(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    // Skip empty values
    if (isEmpty(value)) {
      return;
    }
    
    // Recursively process objects
    if (isObject(value)) {
      result[key] = removeEmptyValues(value);
      return;
    }
    
    // Process arrays - filter out empty items and process objects recursively
    if (Array.isArray(value)) {
      const filteredArray = value
        .filter(item => !isEmpty(item))
        .map(item => isObject(item) ? removeEmptyValues(item) : item);
      
      if (filteredArray.length > 0) {
        result[key] = filteredArray;
      }
      
      return;
    }
    
    // Add non-empty values to result
    result[key] = value;
  });
  
  return result;
}

/**
 * Formats a date string or Date object into a localized string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string or empty string if input is invalid
 */
export function formatDate(
  date: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  if (!date) {
    return '';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Truncates a string to a specified length and adds an ellipsis if truncated
 * @param str - The string to truncate
 * @param maxLength - Maximum length of the resulting string
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns String with first letter capitalized
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str || str.length === 0) {
    return str;
  }
  
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats an enum value into a human-readable string
 * @param value - The enum value to format
 * @returns Formatted string with spaces between words and first letter capitalized
 */
export function formatEnumValue(value: string): string {
  // Replace underscores with spaces
  const withSpaces = value.replace(/_/g, ' ');
  
  // Split the string by capital letters and insert spaces
  const formatted = withSpaces.replace(/([A-Z])/g, ' $1').trim();
  
  // Capitalize the first letter of each word
  return formatted
    .split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
}

/**
 * Creates a debounced function that delays invoking the provided function until after a specified wait time
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced version of the input function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func.apply(context, args);
      timeoutId = null;
    }, wait);
  };
}