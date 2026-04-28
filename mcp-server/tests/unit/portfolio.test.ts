/**
 * Tests for the search_portfolio + list_portfolio_facets tool wrappers.
 *
 * The wrappers delegate to `filterProjects` / `getUnique*` (well-tested
 * upstream). We exercise: input parsing, facet shape, default behavior,
 * limit clamping at the schema layer, and the JSON-validation contract
 * for the bundled dataset.
 */

import projectsRaw from '../../../src/data/ma-portfolio/projects.json';
import {
  filterProjects,
  getUniqueThemes,
  getUniqueEngagementCategories,
  getUniqueGrowthStages,
  getUniqueYears,
} from '../../../src/utils/filterLogic';
import {
  ProjectsArraySchema,
  SearchPortfolioInputSchema,
  ListPortfolioFacetsInputSchema,
  type Project,
} from '../../src/schemas';

const PROJECTS: Project[] = ProjectsArraySchema.parse(projectsRaw);

describe('Portfolio dataset (bundle integrity)', () => {
  it('parses cleanly against ProjectsArraySchema', () => {
    expect(PROJECTS.length).toBeGreaterThan(0);
  });

  it('contains exactly 61 projects (regression guard)', () => {
    expect(PROJECTS.length).toBe(61);
  });

  it('every project has a non-empty technologies array', () => {
    for (const p of PROJECTS) {
      expect(Array.isArray(p.technologies)).toBe(true);
      expect(p.technologies.length).toBeGreaterThan(0);
    }
  });
});

describe('SearchPortfolioInputSchema', () => {
  it('applies defaults when only `search` is provided', () => {
    const parsed = SearchPortfolioInputSchema.parse({ search: 'CRM' });
    expect(parsed.theme).toBe('all');
    expect(parsed.engagement).toBe('all');
    expect(parsed.limit).toBe(20);
  });

  it('rejects limit > 61', () => {
    const result = SearchPortfolioInputSchema.safeParse({ limit: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects limit <= 0', () => {
    const result = SearchPortfolioInputSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it('accepts an empty input object via defaults', () => {
    const parsed = SearchPortfolioInputSchema.parse({});
    expect(parsed.theme).toBe('all');
    expect(parsed.limit).toBe(20);
  });
});

describe('search_portfolio (filter parity)', () => {
  it('returns at least one match for a substring known to occur in the dataset', () => {
    const matches = filterProjects(PROJECTS, {
      search: 'cloud',
      theme: 'all',
      engagement: 'all',
    });
    expect(matches.length).toBeGreaterThan(0);
  });

  it('returns an empty array for a deliberately impossible search', () => {
    const matches = filterProjects(PROJECTS, {
      search: 'xyznever-matches-anything-zz',
      theme: 'all',
      engagement: 'all',
    });
    expect(matches.length).toBe(0);
  });

  it('respects the engagement filter (engagementCategory equality)', () => {
    const valueCreation = filterProjects(PROJECTS, {
      search: '',
      theme: 'all',
      engagement: 'Buy-Side',
    });
    for (const p of valueCreation) {
      expect(p.engagementCategory).toBe('Buy-Side');
    }
  });

  it('respects the theme filter (exact match)', () => {
    const themes = getUniqueThemes(PROJECTS);
    const sample = themes[0];
    const filtered = filterProjects(PROJECTS, {
      search: '',
      theme: sample,
      engagement: 'all',
    });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(p.theme).toBe(sample);
    }
  });
});

describe('list_portfolio_facets (deterministic output)', () => {
  it('returns themes sorted ascending', () => {
    const themes = getUniqueThemes(PROJECTS);
    expect(themes.length).toBeGreaterThan(0);
    const sorted = [...themes].sort();
    expect(themes).toEqual(sorted);
  });

  it('returns years sorted descending', () => {
    const years = getUniqueYears(PROJECTS);
    expect(years.length).toBeGreaterThan(0);
    for (let i = 1; i < years.length; i++) {
      expect(years[i - 1]).toBeGreaterThanOrEqual(years[i]);
    }
  });

  it('returns engagementCategories with no duplicates', () => {
    const cats = getUniqueEngagementCategories(PROJECTS);
    expect(cats.length).toBe(new Set(cats).size);
  });

  it('returns growthStages with no duplicates', () => {
    const stages = getUniqueGrowthStages(PROJECTS);
    expect(stages.length).toBe(new Set(stages).size);
  });
});

describe('ListPortfolioFacetsInputSchema', () => {
  it('accepts an empty object', () => {
    const result = ListPortfolioFacetsInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
