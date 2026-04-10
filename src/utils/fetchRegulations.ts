import { RegulationSchema } from '../schemas/regulatory-map';
import type { Regulation } from '../types/regulatory-map';
import { validateDataSource } from './validateData';

/**
 * Loads and validates all regulatory JSON files at build time.
 * Called in Astro frontmatter to produce static data for the page.
 */
export async function fetchAllRegulations(): Promise<Regulation[]> {
  const modules = import.meta.glob<{ default: unknown }>('../data/regulatory-map/*.json', {
    eager: true,
  });

  const regulations: Regulation[] = [];

  for (const path in modules) {
    const raw = modules[path].default ?? modules[path];
    regulations.push(validateDataSource(RegulationSchema, raw, path));
  }

  return regulations;
}

/**
 * Builds a lookup map from region code to its applicable regulations.
 * Accepts both ISO 3166-1 alpha-3 country codes and ISO 3166-2 US state codes.
 * A single region may have multiple regulations (e.g., an EU member state has GDPR).
 */
export function getRegulationsByRegion(regulations: Regulation[]): Record<string, Regulation[]> {
  const map: Record<string, Regulation[]> = {};

  for (const reg of regulations) {
    for (const code of reg.regions) {
      if (!map[code]) {
        map[code] = [];
      }
      map[code].push(reg);
    }
  }

  return map;
}
