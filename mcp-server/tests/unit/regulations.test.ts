/**
 * Tests for the regulation loader, search_regulations tool, and
 * list_regulation_facets tool.
 */

import {
  REGULATION_ENTRIES,
  loadRegulationByUri,
  listJurisdictions,
  listCategories,
} from '../../src/content/regulation-loader';
import { RegulationSearchInputSchema } from '../../src/schemas';

describe('regulation-loader URI taxonomy', () => {
  it('parses the EU jurisdiction from id "eu-gdpr"', () => {
    const entry = REGULATION_ENTRIES.find((e) => e.data.id === 'eu-gdpr');
    expect(entry).toBeDefined();
    expect(entry!.uri).toBe('gst://regulations/eu/gdpr');
    expect(entry!.jurisdiction).toBe('eu');
    expect(entry!.frameworkId).toBe('gdpr');
  });

  it('parses the US-CA sub-region from id "us-ca-ccpa"', () => {
    const entry = REGULATION_ENTRIES.find((e) => e.data.id === 'us-ca-ccpa');
    expect(entry).toBeDefined();
    expect(entry!.uri).toBe('gst://regulations/us-ca/ccpa');
    expect(entry!.jurisdiction).toBe('us-ca');
    expect(entry!.frameworkId).toBe('ccpa');
  });

  it('parses the CA-AB sub-region from id "ca-ab-pipa"', () => {
    const entry = REGULATION_ENTRIES.find((e) => e.data.id === 'ca-ab-pipa');
    expect(entry).toBeDefined();
    expect(entry!.uri).toBe('gst://regulations/ca-ab/pipa');
    expect(entry!.jurisdiction).toBe('ca-ab');
    expect(entry!.frameworkId).toBe('pipa');
  });

  it('does not treat "ca-cccs" as a sub-region (4-letter framework code, not 2-letter province)', () => {
    const entry = REGULATION_ENTRIES.find((e) => e.data.id === 'ca-cccs');
    expect(entry).toBeDefined();
    expect(entry!.jurisdiction).toBe('ca');
    expect(entry!.frameworkId).toBe('cccs');
  });

  it('produces 120 distinct URIs', () => {
    const uris = new Set(REGULATION_ENTRIES.map((e) => e.uri));
    expect(uris.size).toBe(REGULATION_ENTRIES.length);
    expect(uris.size).toBeGreaterThanOrEqual(120);
  });
});

describe('loadRegulationByUri', () => {
  it('returns the EU GDPR record for its canonical URI', () => {
    const found = loadRegulationByUri('gst://regulations/eu/gdpr');
    expect(found).not.toBeNull();
    expect(found!.data.name).toMatch(/General Data Protection Regulation/);
  });

  it('returns null for an unknown URI', () => {
    expect(loadRegulationByUri('gst://regulations/zz/nope')).toBeNull();
  });
});

describe('listJurisdictions / listCategories', () => {
  it('returns sorted unique jurisdictions including expected entries', () => {
    const j = listJurisdictions();
    expect(j).toContain('eu');
    expect(j).toContain('us');
    expect(j).toContain('us-ca');
    expect(j).toContain('ca');
    expect(j).toContain('ca-ab');
    expect([...j]).toEqual([...j].sort());
  });

  it('returns the four canonical regulation categories', () => {
    const c = listCategories();
    expect(c).toEqual(
      ['ai-governance', 'cybersecurity', 'data-privacy', 'industry-compliance'].sort()
    );
  });
});

describe('RegulationSearchInputSchema (tool input contract)', () => {
  it('parses an empty input (defaults applied)', () => {
    const result = RegulationSearchInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
    }
  });

  it('rejects a limit > 120', () => {
    expect(RegulationSearchInputSchema.safeParse({ limit: 121 }).success).toBe(false);
  });

  it('rejects an unknown category enum value', () => {
    expect(RegulationSearchInputSchema.safeParse({ category: 'environmental' }).success).toBe(
      false
    );
  });
});
