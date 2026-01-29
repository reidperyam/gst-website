import { describe, it, expect } from 'vitest';
import { generateSlug, parseARR, parseTechnologies } from '@/utils/excel-converter';

describe('Excel Converter Utilities', () => {
  describe('generateSlug', () => {
    it('should convert simple text to lowercase slug', () => {
      expect(generateSlug('Project Eclipse')).toBe('project-eclipse');
    });

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('My Project Name')).toBe('my-project-name');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Project-Name_123!@#')).toBe('project-name123');
    });

    it('should collapse multiple hyphens', () => {
      expect(generateSlug('Project---Name')).toBe('project-name');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(generateSlug('-Project Name-')).toBe('project-name');
    });

    it('should handle uppercase letters', () => {
      expect(generateSlug('PROJECT ECLIPSE')).toBe('project-eclipse');
    });

    it('should preserve numbers', () => {
      expect(generateSlug('Project 2024 Name')).toBe('project-2024-name');
    });

    it('should handle single word', () => {
      expect(generateSlug('Eclipse')).toBe('eclipse');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle only special characters', () => {
      expect(generateSlug('!@#$%')).toBe('');
    });

    it('should handle accented characters by removing them', () => {
      expect(generateSlug('Café Project')).toBe('caf-project');
    });

    it('should be idempotent (applying twice gives same result)', () => {
      const original = 'Project Eclipse';
      const firstSlug = generateSlug(original);
      const secondSlug = generateSlug(firstSlug);

      expect(firstSlug).toBe(secondSlug);
    });

    it('should handle real project names', () => {
      expect(generateSlug('Project Eclipse')).toBe('project-eclipse');
      expect(generateSlug('ImEx')).toBe('imex');
      expect(generateSlug('Tech Platform 2024')).toBe('tech-platform-2024');
    });
  });

  describe('parseARR', () => {
    it('should parse USD values', () => {
      const result = parseARR('$50M');
      expect(result.arr).toBe('$50M');
      expect(result.arrNumeric).toBe(50000000);
      expect(result.currency).toBe('USD');
    });

    it('should parse EUR values', () => {
      const result = parseARR('€50M');
      expect(result.arr).toBe('€50M');
      expect(result.currency).toBe('EUR');
    });

    it('should parse GBP values', () => {
      const result = parseARR('£50M');
      expect(result.arr).toBe('£50M');
      expect(result.currency).toBe('GBP');
    });

    it('should parse JPY values', () => {
      const result = parseARR('¥50M');
      expect(result.arr).toBe('¥50M');
      expect(result.currency).toBe('JPY');
    });

    it('should parse AUD values', () => {
      const result = parseARR('A$50M');
      expect(result.arr).toBe('A$50M');
      expect(result.currency).toBe('AUD');
    });

    it('should handle numeric multipliers (M)', () => {
      const result = parseARR('$100M');
      expect(result.arrNumeric).toBe(100000000);
    });

    it('should handle numeric multipliers (B)', () => {
      const result = parseARR('$2B');
      expect(result.arrNumeric).toBe(2000000000);
    });

    it('should handle numeric multipliers (K)', () => {
      const result = parseARR('$500K');
      expect(result.arrNumeric).toBe(500000);
    });

    it('should handle values with commas', () => {
      const result = parseARR('$10,500,000');
      expect(result.arrNumeric).toBe(10500000);
    });

    it('should handle plain numeric values without multiplier', () => {
      const result = parseARR('$1000');
      expect(result.arrNumeric).toBe(1000);
    });

    it('should handle empty string', () => {
      const result = parseARR('');
      expect(result.arr).toBe('N/A');
      expect(result.arrNumeric).toBe(0);
      expect(result.currency).toBe('USD');
    });

    it('should handle null/undefined', () => {
      const result = parseARR(undefined as any);
      expect(result.arr).toBe('N/A');
      expect(result.arrNumeric).toBe(0);
    });

    it('should handle non-numeric values', () => {
      const result = parseARR('$ABC');
      expect(result.arrNumeric).toBe(0);
    });

    it('should handle case-insensitive multipliers', () => {
      const resultM = parseARR('$50m');
      const resultB = parseARR('$2b');
      const resultK = parseARR('$100k');

      expect(resultM.arrNumeric).toBe(50000000);
      expect(resultB.arrNumeric).toBe(2000000000);
      expect(resultK.arrNumeric).toBe(100000);
    });

    it('should trim whitespace', () => {
      const result = parseARR('  $50M  ');
      expect(result.arr).toBe('$50M');
      expect(result.arrNumeric).toBe(50000000);
    });

    it('should handle real examples', () => {
      const example1 = parseARR('$61M');
      expect(example1.arrNumeric).toBe(61000000);
      expect(example1.currency).toBe('USD');

      const example2 = parseARR('€25.5M');
      expect(example2.currency).toBe('EUR');
      expect(example2.arrNumeric).toBeGreaterThan(25000000);
    });
  });

  describe('parseTechnologies', () => {
    it('should parse comma-separated technologies', () => {
      const result = parseTechnologies('Node.js, React, PostgreSQL');
      expect(result).toEqual(['Node.js', 'React', 'PostgreSQL']);
    });

    it('should parse semicolon-separated technologies', () => {
      const result = parseTechnologies('AWS; Docker; Kubernetes');
      expect(result).toEqual(['AWS', 'Docker', 'Kubernetes']);
    });

    it('should handle mixed separators', () => {
      const result = parseTechnologies('Node.js, React; AWS, PostgreSQL');
      expect(result.length).toBe(4);
      expect(result).toContain('Node.js');
      expect(result).toContain('React');
    });

    it('should trim whitespace from each tech', () => {
      const result = parseTechnologies('  Node.js  ,  React  ,  AWS  ');
      expect(result).toEqual(['Node.js', 'React', 'AWS']);
    });

    it('should filter out empty entries', () => {
      const result = parseTechnologies('Node.js, , React, ');
      expect(result).toEqual(['Node.js', 'React']);
      expect(result.length).toBe(2);
    });

    it('should handle empty string', () => {
      const result = parseTechnologies('');
      expect(result).toEqual([]);
    });

    it('should handle null/undefined', () => {
      const result = parseTechnologies(undefined as any);
      expect(result).toEqual([]);
    });

    it('should handle single technology', () => {
      const result = parseTechnologies('Node.js');
      expect(result).toEqual(['Node.js']);
    });

    it('should preserve technology casing', () => {
      const result = parseTechnologies('Node.js, ReactJS, PostgreSQL');
      expect(result).toEqual(['Node.js', 'ReactJS', 'PostgreSQL']);
    });

    it('should handle technologies with special characters', () => {
      const result = parseTechnologies('C#, .NET, F#');
      expect(result).toContain('C#');
      expect(result).toContain('.NET');
      expect(result).toContain('F#');
    });

    it('should handle real examples', () => {
      const example1 = parseTechnologies('AWS, .NET 8, C#, SQL Server, ReactJS, TypeScript');
      expect(example1.length).toBe(6);

      const example2 = parseTechnologies('Node.js, AWS, RDS, Elastic Beanstalk, SES');
      expect(example2.length).toBe(5);
    });

    it('should handle technologies with numbers and dots', () => {
      const result = parseTechnologies('Python 3.11, Node.js 18, .NET 8');
      expect(result.length).toBe(3);
      expect(result).toContain('Python 3.11');
      expect(result).toContain('Node.js 18');
      expect(result).toContain('.NET 8');
    });
  });

  describe('Integration scenarios', () => {
    it('should work together to process project data', () => {
      const codeName = 'Project Eclipse';
      const arr = '$61M';
      const techs = 'AWS, .NET 8, C#, ReactJS';

      const slug = generateSlug(codeName);
      const arrParsed = parseARR(arr);
      const techList = parseTechnologies(techs);

      expect(slug).toBe('project-eclipse');
      expect(arrParsed.arrNumeric).toBe(61000000);
      expect(techList.length).toBe(4);
    });
  });
});
