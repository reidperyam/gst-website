/**
 * Barrel export for all data source Zod schemas.
 *
 * Schemas are the single source of truth for data shapes.
 * TypeScript types are inferred from schemas via `z.infer<>` and
 * re-exported from `src/types/` for stable import paths.
 */

export * from './regulatory-map';
