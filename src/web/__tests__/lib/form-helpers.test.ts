import {
  hasFormChanged,
  extractChangedValues,
  prepareFormDataForSubmission,
  getNestedValue,
  setNestedValue,
  transformFormData,
  validateFormField
} from '../../lib/form-helpers';
import { deepClone, deepEqual, removeEmptyValues } from '../../lib/utils';

describe('hasFormChanged', () => {
  it('should return false when values are identical', () => {
    const values1 = { name: 'Test', age: 30, address: { city: 'New York' } };
    const values2 = { name: 'Test', age: 30, address: { city: 'New York' } };
    
    expect(hasFormChanged(values1, values2)).toBe(false);
  });
  
  it('should return true when primitive values have changed', () => {
    const defaultValues = { name: 'Test', age: 30 };
    const currentValues = { name: 'Changed', age: 30 };
    
    expect(hasFormChanged(currentValues, defaultValues)).toBe(true);
  });
  
  it('should return true when nested object values have changed', () => {
    const defaultValues = { 
      name: 'Test', 
      address: { city: 'New York', zip: '10001' } 
    };
    const currentValues = { 
      name: 'Test', 
      address: { city: 'Boston', zip: '10001' } 
    };
    
    expect(hasFormChanged(currentValues, defaultValues)).toBe(true);
  });
  
  it('should return true when array values have changed', () => {
    const defaultValues = { name: 'Test', tags: ['tag1', 'tag2'] };
    const currentValues = { name: 'Test', tags: ['tag1', 'tag3'] };
    
    expect(hasFormChanged(currentValues, defaultValues)).toBe(true);
  });
  
  it('should not mutate the original objects', () => {
    const defaultValues = { 
      name: 'Test', 
      address: { city: 'New York' } 
    };
    const currentValues = { 
      name: 'Changed', 
      address: { city: 'Boston' } 
    };
    
    // Create deep clones to verify no mutation
    const defaultClone = deepClone(defaultValues);
    const currentClone = deepClone(currentValues);
    
    hasFormChanged(currentValues, defaultValues);
    
    // Verify objects weren't mutated
    expect(deepEqual(defaultValues, defaultClone)).toBe(true);
    expect(deepEqual(currentValues, currentClone)).toBe(true);
  });
});

describe('extractChangedValues', () => {
  it('should return empty object when no values have changed', () => {
    const values1 = { name: 'Test', age: 30, address: { city: 'New York' } };
    const values2 = { name: 'Test', age: 30, address: { city: 'New York' } };
    
    expect(extractChangedValues(values1, values2)).toEqual({});
  });
  
  it('should extract only changed primitive values', () => {
    const defaultValues = { name: 'Test', age: 30, active: true };
    const currentValues = { name: 'Changed', age: 30, active: true };
    
    expect(extractChangedValues(currentValues, defaultValues)).toEqual({
      name: 'Changed'
    });
  });
  
  it('should extract nested object changes', () => {
    const defaultValues = { 
      name: 'Test', 
      address: { city: 'New York', zip: '10001' } 
    };
    const currentValues = { 
      name: 'Test', 
      address: { city: 'Boston', zip: '10001' } 
    };
    
    expect(extractChangedValues(currentValues, defaultValues)).toEqual({
      address: { city: 'Boston' }
    });
  });
  
  it('should extract array changes', () => {
    const defaultValues = { name: 'Test', tags: ['tag1', 'tag2'] };
    const currentValues = { name: 'Test', tags: ['tag1', 'tag3'] };
    
    expect(extractChangedValues(currentValues, defaultValues)).toEqual({
      tags: ['tag1', 'tag3']
    });
  });
  
  it('should handle added properties', () => {
    const defaultValues = { name: 'Test' };
    const currentValues = { name: 'Test', newProp: 'value' };
    
    expect(extractChangedValues(currentValues, defaultValues)).toEqual({
      newProp: 'value'
    });
  });
  
  it('should not mutate the original objects', () => {
    const defaultValues = { 
      name: 'Test', 
      address: { city: 'New York' } 
    };
    const currentValues = { 
      name: 'Changed', 
      address: { city: 'Boston' } 
    };
    
    // Create deep clones to verify no mutation
    const defaultClone = deepClone(defaultValues);
    const currentClone = deepClone(currentValues);
    
    extractChangedValues(currentValues, defaultValues);
    
    // Verify objects weren't mutated
    expect(deepEqual(defaultValues, defaultClone)).toBe(true);
    expect(deepEqual(currentValues, currentClone)).toBe(true);
  });
});

describe('prepareFormDataForSubmission', () => {
  it('should return empty object when no values have changed', () => {
    const formData = { name: 'Test', age: 30 };
    const defaultValues = { name: 'Test', age: 30 };
    
    expect(prepareFormDataForSubmission(formData, defaultValues)).toEqual({});
  });
  
  it('should extract changed values and remove empty values', () => {
    const defaultValues = { 
      name: 'Test', 
      description: 'Original', 
      age: 30 
    };
    const formData = { 
      name: 'Changed', 
      description: '', 
      age: 30 
    };
    
    expect(prepareFormDataForSubmission(formData, defaultValues)).toEqual({
      name: 'Changed'
    });
  });
  
  it('should handle nested objects and arrays', () => {
    const defaultValues = { 
      name: 'Test',
      address: { 
        city: 'New York',
        zip: '10001'
      },
      tags: ['tag1', 'tag2']
    };
    
    const formData = { 
      name: 'Test',
      address: { 
        city: 'Boston',
        zip: ''
      },
      tags: ['tag1', 'tag3']
    };
    
    expect(prepareFormDataForSubmission(formData, defaultValues)).toEqual({
      address: { 
        city: 'Boston'
      },
      tags: ['tag1', 'tag3']
    });
  });
  
  it('should not mutate the original objects', () => {
    const defaultValues = { 
      name: 'Test',
      address: { city: 'New York' } 
    };
    const formData = { 
      name: 'Changed',
      address: { city: 'Boston' } 
    };
    
    // Create deep clones to verify no mutation
    const defaultClone = deepClone(defaultValues);
    const formDataClone = deepClone(formData);
    
    prepareFormDataForSubmission(formData, defaultValues);
    
    // Verify objects weren't mutated
    expect(deepEqual(defaultValues, defaultClone)).toBe(true);
    expect(deepEqual(formData, formDataClone)).toBe(true);
  });
});

describe('getNestedValue', () => {
  it('should return value at specified path', () => {
    const obj = {
      user: {
        profile: {
          name: 'John',
          address: {
            city: 'New York'
          }
        }
      }
    };
    
    expect(getNestedValue(obj, 'user.profile.name')).toBe('John');
    expect(getNestedValue(obj, 'user.profile.address.city')).toBe('New York');
  });
  
  it("should return default value when path doesn't exist", () => {
    const obj = {
      user: {
        profile: {
          name: 'John'
        }
      }
    };
    
    expect(getNestedValue(obj, 'user.profile.age', 30)).toBe(30);
    expect(getNestedValue(obj, 'user.settings', {})).toEqual({});
  });
  
  it('should handle array indices in path', () => {
    const obj = {
      users: [
        { name: 'John' },
        { name: 'Jane' }
      ]
    };
    
    expect(getNestedValue(obj, 'users.0.name')).toBe('John');
    expect(getNestedValue(obj, 'users.1.name')).toBe('Jane');
    expect(getNestedValue(obj, 'users.2.name', 'Unknown')).toBe('Unknown');
  });
  
  it('should handle empty or null objects', () => {
    expect(getNestedValue(null, 'user.name', 'Default')).toBe('Default');
    expect(getNestedValue(undefined, 'user.name', 'Default')).toBe('Default');
    expect(getNestedValue({}, 'user.name', 'Default')).toBe('Default');
  });
});

describe('setNestedValue', () => {
  it('should set value at specified path', () => {
    const obj = {
      user: {
        profile: {
          name: 'John'
        }
      }
    };
    
    const result = setNestedValue(obj, 'user.profile.name', 'Jane');
    
    expect(result).toEqual({
      user: {
        profile: {
          name: 'Jane'
        }
      }
    });
  });
  
  it("should create intermediate objects if they don't exist", () => {
    const obj = {
      user: {}
    };
    
    const result = setNestedValue(obj, 'user.profile.name', 'John');
    
    expect(result).toEqual({
      user: {
        profile: {
          name: 'John'
        }
      }
    });
  });
  
  it('should handle array indices in path', () => {
    const obj = {
      users: [
        { name: 'John' },
        { name: 'Jane' }
      ]
    };
    
    const result = setNestedValue(obj, 'users.0.name', 'Jack');
    
    expect(result).toEqual({
      users: [
        { name: 'Jack' },
        { name: 'Jane' }
      ]
    });
  });
  
  it('should not mutate the original object', () => {
    const obj = {
      user: {
        profile: {
          name: 'John'
        }
      }
    };
    
    const objClone = deepClone(obj);
    
    setNestedValue(obj, 'user.profile.name', 'Jane');
    
    // Original object should not be modified
    expect(deepEqual(obj, objClone)).toBe(true);
  });
});

describe('transformFormData', () => {
  it('should transform data according to field mapping', () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };
    
    const fieldMapping = {
      'firstName': 'user.firstName',
      'lastName': 'user.lastName',
      'email': 'contact.email'
    };
    
    const result = transformFormData(formData, fieldMapping);
    
    expect(result).toEqual({
      user: {
        firstName: 'John',
        lastName: 'Doe'
      },
      contact: {
        email: 'john@example.com'
      }
    });
  });
  
  it('should handle nested source and target paths', () => {
    const formData = {
      user: {
        name: {
          first: 'John',
          last: 'Doe'
        }
      },
      contactInfo: {
        email: 'john@example.com'
      }
    };
    
    const fieldMapping = {
      'user.name.first': 'profile.firstName',
      'user.name.last': 'profile.lastName',
      'contactInfo.email': 'profile.contact.email'
    };
    
    const result = transformFormData(formData, fieldMapping);
    
    expect(result).toEqual({
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        contact: {
          email: 'john@example.com'
        }
      }
    });
  });
  
  it("should ignore mappings where source path doesn't exist", () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe'
    };
    
    const fieldMapping = {
      'firstName': 'user.firstName',
      'lastName': 'user.lastName',
      'email': 'contact.email'
    };
    
    const result = transformFormData(formData, fieldMapping);
    
    expect(result).toEqual({
      user: {
        firstName: 'John',
        lastName: 'Doe'
      }
    });
  });
  
  it('should not mutate the original object', () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe'
    };
    
    const formDataClone = deepClone(formData);
    
    const fieldMapping = {
      'firstName': 'user.firstName',
      'lastName': 'user.lastName'
    };
    
    transformFormData(formData, fieldMapping);
    
    // Original object should not be modified
    expect(deepEqual(formData, formDataClone)).toBe(true);
  });
});

describe('validateFormField', () => {
  it('should return valid:true when validator returns true', () => {
    const validator = (value: string) => value.length > 3;
    
    const result = validateFormField('Test', validator);
    
    expect(result).toEqual({ valid: true });
  });
  
  it('should return valid:false and message when validator returns string', () => {
    const validator = (value: string) => 
      value.length > 3 ? true : 'Value must be longer than 3 characters';
    
    const result = validateFormField('Te', validator);
    
    expect(result).toEqual({ 
      valid: false, 
      message: 'Value must be longer than 3 characters' 
    });
  });
  
  it('should return valid:false and default message when validator returns false', () => {
    const validator = (value: string) => value.length > 3;
    
    const result = validateFormField('Te', validator);
    
    expect(result).toEqual({ 
      valid: false, 
      message: 'Invalid value' 
    });
  });
  
  it('should handle different value types', () => {
    // String validator
    const stringValidator = (value: string) => 
      typeof value === 'string' && value.length > 0;
    
    // Number validator
    const numberValidator = (value: number) => 
      typeof value === 'number' && value > 0;
    
    // Boolean validator
    const booleanValidator = (value: boolean) => 
      typeof value === 'boolean';
    
    // Object validator
    const objectValidator = (value: object) => 
      typeof value === 'object' && Object.keys(value).length > 0;
    
    expect(validateFormField('Test', stringValidator)).toEqual({ valid: true });
    expect(validateFormField(42, numberValidator)).toEqual({ valid: true });
    expect(validateFormField(true, booleanValidator)).toEqual({ valid: true });
    expect(validateFormField({ key: 'value' }, objectValidator)).toEqual({ valid: true });
    
    expect(validateFormField('', stringValidator)).toEqual({ 
      valid: false, 
      message: 'Invalid value' 
    });
    expect(validateFormField(0, numberValidator)).toEqual({ 
      valid: false, 
      message: 'Invalid value' 
    });
    expect(validateFormField({}, objectValidator)).toEqual({ 
      valid: false, 
      message: 'Invalid value' 
    });
  });
});