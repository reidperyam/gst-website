/**
 * Supported currency types for project ARR values
 */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'] as const;

/**
 * Type representing supported currencies
 */
export type Currency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Valid growth stage values
 */
export const GROWTH_STAGE_VALUES = [
  'Early-Stage Growth',
  'Scaling Growth',
  'Expansion Stage',
  'Established Market Leader',
  'Mature Enterprise',
  'Legacy System'
] as const;

/**
 * Type representing valid growth stages
 */
export type GrowthStage = typeof GROWTH_STAGE_VALUES[number] | string;

/**
 * Valid engagement type values
 */
export const ENGAGEMENT_TYPE_VALUES = [
  'Value Creation - Growth',
  'Value Creation - Integration',
  'Value Creation - Modernization',
  'Value Creation - Turnaround',
  'Early Stage Assessment',
  'Technical Assessment',
  'Buy-Side Technical Diligence'
] as const;

/**
 * Type representing valid engagement types
 */
export type EngagementType = typeof ENGAGEMENT_TYPE_VALUES[number];

/**
 * Valid sortable columns for projects
 */
export const SORTABLE_COLUMNS = ['codeName', 'theme', 'arr', 'growthStage', 'year'] as const;

/**
 * Type representing sortable columns
 */
export type SortableColumn = typeof SORTABLE_COLUMNS[number];

/**
 * Valid sort directions
 */
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

/**
 * Type representing sort directions
 */
export type SortDirection = typeof SORT_DIRECTIONS[number];

/**
 * Project interface with comprehensive type safety
 */
export interface Project {
  id: string;
  codeName: string;
  industry: string;
  theme: string;
  summary: string;
  arr: string; // Display format (e.g., "$220,000,000", "€120,000,000")
  arrNumeric: number; // For sorting/calculations (in base currency units)
  currency: Currency;
  growthStage: GrowthStage;
  year: number;
  technologies: readonly string[];
  engagementType?: EngagementType;
  engagementTypeTag?: string;
  engagementTypeDescription?: string;
  challenge?: string;
  solution?: string;
}

/**
 * Statistics display interface
 */
export interface Stat {
  value: string;
  label: string;
}

/**
 * Filter state interface with type safety
 */
export interface FilterState {
  search: string;
  theme: string;
  stage: string;
  year: string;
}

/**
 * Sort state interface with type safety
 */
export interface SortState {
  column: SortableColumn | null;
  direction: SortDirection;
}

/**
 * Type guard to check if a value is a valid currency
 * @param value - Value to check
 * @returns True if value is a valid currency
 */
export function isCurrency(value: any): value is Currency {
  return SUPPORTED_CURRENCIES.includes(value);
}

/**
 * Type guard to check if a value is a valid engagement type
 * @param value - Value to check
 * @returns True if value is a valid engagement type
 */
export function isEngagementType(value: any): value is EngagementType {
  return ENGAGEMENT_TYPE_VALUES.includes(value);
}

/**
 * Type guard to check if a value is a sortable column
 * @param value - Value to check
 * @returns True if value is a valid sortable column
 */
export function isSortableColumn(value: any): value is SortableColumn {
  return SORTABLE_COLUMNS.includes(value);
}

/**
 * Type guard to check if a value is a valid sort direction
 * @param value - Value to check
 * @returns True if value is a valid sort direction
 */
export function isSortDirection(value: any): value is SortDirection {
  return SORT_DIRECTIONS.includes(value);
}
