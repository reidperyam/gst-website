/**
 * Astro Content Collections configuration.
 *
 * Defines typed, schema-validated collections that Astro processes at
 * build time. The glob loader reads JSON files from source directories
 * without requiring a file move to src/content/.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { RegulationSchema } from './schemas/regulatory-map';

const regulatoryMap = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/data/regulatory-map' }),
  schema: RegulationSchema,
});

export const collections = { 'regulatory-map': regulatoryMap };
