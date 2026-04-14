/**
 * Domain types for the Interactive Regulatory Map feature.
 *
 * Types are inferred from the Zod schema in `src/schemas/regulatory-map.ts`
 * (single source of truth). This file re-exports them so existing imports
 * from `../types/regulatory-map` keep working.
 */

export type { Regulation, RegulationCategory } from '../schemas/regulatory-map';

export interface RegionSelectedDetail {
  regionId: string;
}

declare global {
  interface WindowEventMap {
    regionSelected: CustomEvent<RegionSelectedDetail>;
  }
}
