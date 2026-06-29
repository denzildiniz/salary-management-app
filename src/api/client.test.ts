import { describe, it, expect } from 'vitest';
import { ApiError } from './client';

describe('ApiError', () => {
  it('sets the message correctly', () => {
    const err = new ApiError('Something went wrong');
    expect(err.message).toBe('Something went wrong');
  });

  it('sets name to "ApiError" to distinguish it from generic Error', () => {
    const err = new ApiError('test');
    expect(err.name).toBe('ApiError');
  });

  it('is an instance of Error so it can be caught with catch(err)', () => {
    const err = new ApiError('test');
    expect(err instanceof Error).toBe(true);
  });

  it('is an instance of ApiError', () => {
    const err = new ApiError('test');
    expect(err instanceof ApiError).toBe(true);
  });

  it('stores the details array when provided — used to show row-level CSV validation errors', () => {
    const details = ['Row 2: Salary must be positive', 'Row 5: Missing email'];
    const err = new ApiError('Validation failed', details);
    expect(err.details).toEqual(details);
  });

  it('leaves details undefined when not provided — regular API errors have no row detail', () => {
    const err = new ApiError('Not found');
    expect(err.details).toBeUndefined();
  });

  it('preserves an empty details array without converting it to undefined', () => {
    const err = new ApiError('Partial failure', []);
    expect(err.details).toEqual([]);
  });

  it('can be thrown and caught correctly', () => {
    expect(() => {
      throw new ApiError('Forbidden', ['missing permission']);
    }).toThrow('Forbidden');
  });
});
