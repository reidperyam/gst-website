import type { Regulation } from '../types/regulatory-map';

/**
 * Loads and validates all regulatory JSON files via Astro content collections.
 * Schema validation happens at build time via the collection definition in
 * content.config.ts. Called from the regulations.json.ts API endpoint.
 *
 * Uses dynamic import for astro:content so this module can also be imported
 * in vitest (which only uses getRegulationsByRegion, not this function).
 */
export async function fetchAllRegulations(): Promise<Regulation[]> {
  const { getCollection } = await import('astro:content');
  const entries = await getCollection('regulatory-map');
  return entries.map((entry) => entry.data as Regulation);
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
