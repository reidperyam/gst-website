/**
 * Barrel export for all data source Zod schemas.
 *
 * Schemas are the single source of truth for data shapes.
 * TypeScript types are inferred from schemas via `z.infer<>` and
 * re-exported from `src/types/` (or from data-source modules) for
 * stable import paths.
 */

export * from './diligence';
export * from './icg';
export * from './portfolio';
export * from './regulatory-map';
export * from './techpar';
