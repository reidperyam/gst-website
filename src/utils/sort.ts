import type { Project } from '../types/portfolio';

/**
 * Sorts projects by year in descending order (most recent first)
 * Creates a new array without modifying the original
 * @param projects - Array of projects to sort
 * @returns New array of projects sorted by year (descending)
 * @example
 * const sorted = sortProjectsByYear(projects); // 2024, 2023, 2022...
 */
export function sortProjectsByYear(projects: readonly Project[]): Project[] {
  return [...projects].sort((a, b) => b.year - a.year);
}

/**
 * Sorts projects by ARR (Annual Recurring Revenue) in descending order (highest first)
 * Safely handles missing or invalid arrNumeric values
 * @param projects - Array of projects to sort
 * @returns New array of projects sorted by ARR (descending)
 * @example
 * const sorted = sortProjectsByARR(projects); // $200M, $100M, $50M...
 */
export function sortProjectsByARR(projects: readonly Project[]): Project[] {
  return [...projects].sort((a, b) => (b.arrNumeric || 0) - (a.arrNumeric || 0));
}

/**
 * Sorts projects by code name in ascending order (alphabetical A-Z)
 * Uses locale-aware string comparison for international characters
 * @param projects - Array of projects to sort
 * @returns New array of projects sorted by name (ascending)
 * @example
 * const sorted = sortProjectsByName(projects); // 'Alpha Corp', 'Beta Inc', 'Gamma LLC'...
 */
export function sortProjectsByName(projects: readonly Project[]): Project[] {
  return [...projects].sort((a, b) => a.codeName.localeCompare(b.codeName));
}
