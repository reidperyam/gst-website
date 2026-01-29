import { describe, it, expect } from 'vitest';
import { abbreviateARR } from '@/utils/abbreviate';

describe('Abbreviate ARR Utility', () => {
  describe('Special values handling', () => {
    it('should return "Not in source" as-is', () => {
      expect(abbreviateARR('Not in source')).toBe('Not in source');
    });

    it('should return "N/A" as-is', () => {
      expect(abbreviateARR('N/A')).toBe('N/A');
    });

    it('should return empty string as-is', () => {
      expect(abbreviateARR('')).toBe('');
    });

    it('should return null/undefined as-is', () => {
      expect(abbreviateARR(undefined as any)).toBe(undefined);
    });
  });

  describe('USD abbreviations', () => {
    it('should abbreviate $10M to $10M', () => {
      expect(abbreviateARR('$10M')).toBe('$10M');
    });

    it('should abbreviate $1,000M to $1B', () => {
      expect(abbreviateARR('$1,000M')).toBe('$1.0B');
    });

    it('should abbreviate $50000000 to $50M', () => {
      expect(abbreviateARR('$50000000')).toBe('$50M');
    });

    it('should abbreviate $1500 to $2K', () => {
      expect(abbreviateARR('$1500')).toBe('$2K');
    });

    it('should handle commas in values', () => {
      expect(abbreviateARR('$10,500,000')).toBe('$11M');
    });

    it('should handle values with decimals', () => {
      expect(abbreviateARR('$2.5M')).toBe('$3M');
    });

    it('should handle 1B correctly', () => {
      expect(abbreviateARR('$1B')).toBe('$1.0B');
    });

    it('should handle large numbers', () => {
      expect(abbreviateARR('$5000000000')).toBe('$5.0B');
    });

    it('should handle 100K values', () => {
      expect(abbreviateARR('$100K')).toBe('$100K');
    });
  });

  describe('Currency variations', () => {
    it('should preserve Euro symbol', () => {
      expect(abbreviateARR('€50M')).toContain('€');
      expect(abbreviateARR('€50M')).toBe('€50M');
    });

    it('should preserve GBP symbol', () => {
      expect(abbreviateARR('£25M')).toContain('£');
      expect(abbreviateARR('£25M')).toBe('£25M');
    });

    it('should preserve JPY symbol', () => {
      expect(abbreviateARR('¥100M')).toContain('¥');
      expect(abbreviateARR('¥100M')).toBe('¥100M');
    });

    it('should preserve AUD symbol', () => {
      expect(abbreviateARR('A$75M')).toContain('A$');
      expect(abbreviateARR('A$75M')).toBe('A$75M');
    });

    it('should convert large EUR values', () => {
      const result = abbreviateARR('€2000M');
      expect(result).toContain('€');
      expect(result).toBe('€2.0B');
    });
  });

  describe('Edge cases', () => {
    it('should handle very small values', () => {
      expect(abbreviateARR('$100')).toBe('$100');
    });

    it('should handle values without currency symbol', () => {
      expect(abbreviateARR('50M')).toBe('$50M');
    });

    it('should handle lowercase currency multipliers', () => {
      expect(abbreviateARR('$10m')).toBe('$10M');
    });

    it('should handle uppercase currency multipliers', () => {
      expect(abbreviateARR('$10M')).toBe('$10M');
    });

    it('should trim whitespace', () => {
      expect(abbreviateARR('  $10M  ')).toBe('$10M');
    });

    it('should handle malformed input gracefully', () => {
      expect(abbreviateARR('$ABC')).toBe('$0');
    });

    it('should handle zero values', () => {
      expect(abbreviateARR('$0')).toBe('$0');
    });
  });

  describe('Real-world examples', () => {
    it('should handle typical startup ARR', () => {
      expect(abbreviateARR('$5,200,000')).toBe('$5M');
    });

    it('should handle typical growth company ARR', () => {
      expect(abbreviateARR('$50,000,000')).toBe('$50M');
    });

    it('should handle enterprise ARR', () => {
      expect(abbreviateARR('$500,000,000')).toBe('$500M');
    });

    it('should handle mega-company ARR', () => {
      expect(abbreviateARR('$10,000,000,000')).toBe('$10.0B');
    });
  });
});
