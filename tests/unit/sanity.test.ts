import { describe, it, expect } from 'vitest';

describe('Sanity Checks', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify test infrastructure is working', () => {
    expect(true).toBe(true);
  });
});
