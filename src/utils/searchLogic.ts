import type { Project } from '../types/portfolio';
import { createSearchableText } from './filterLogic';

/**
 * Performs a debounced search on projects
 * @param projects - Array of projects to search
 * @param searchTerm - The search term to look for
 * @returns Filtered array of projects matching the search term
 */
export function performSearch(projects: Project[], searchTerm: string): Project[] {
  if (!searchTerm.trim()) {
    return projects;
  }

  const searchLower = searchTerm.toLowerCase();

  return projects.filter(project => {
    const searchableText = createSearchableText(project);
    return searchableText.includes(searchLower);
  });
}

/**
 * Debounces a function to delay its execution
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Creates a debounced search function
 * @param callback - Function to call with search results
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced search function
 */
export function createDebouncedSearch(
  callback: (term: string) => void,
  delay: number = 300
): (term: string) => void {
  return debounce(callback, delay);
}

/**
 * Highlights search term matches in text (for UI enhancement)
 * @param text - Text to highlight matches in
 * @param searchTerm - Term to highlight
 * @returns HTML string with highlights (if needed for rendering)
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Gets relevance score for a project based on search term
 * @param project - Project to score
 * @param searchTerm - Search term
 * @returns Relevance score (higher = more relevant)
 */
export function getSearchRelevance(project: Project, searchTerm: string): number {
  if (!searchTerm.trim()) {
    return 0;
  }

  const searchLower = searchTerm.toLowerCase();
  let score = 0;

  // Exact match in codeName is most relevant
  if (project.codeName.toLowerCase() === searchLower) {
    score += 100;
  } else if (project.codeName.toLowerCase().includes(searchLower)) {
    score += 50;
  }

  // Match in industry
  if (project.industry.toLowerCase().includes(searchLower)) {
    score += 30;
  }

  // Match in technologies
  if (Array.isArray(project.technologies)) {
    if (
      project.technologies.some(t =>
        t.toLowerCase().includes(searchLower)
      )
    ) {
      score += 25;
    }
  }

  // Match in summary
  if (project.summary.toLowerCase().includes(searchLower)) {
    score += 10;
  }

  return score;
}

/**
 * Sorts projects by search relevance
 * @param projects - Projects to sort
 * @param searchTerm - Search term for relevance calculation
 * @returns Projects sorted by relevance (highest first)
 */
export function sortBySearchRelevance(
  projects: Project[],
  searchTerm: string
): Project[] {
  if (!searchTerm.trim()) {
    return projects;
  }

  return [...projects].sort(
    (a, b) => getSearchRelevance(b, searchTerm) - getSearchRelevance(a, searchTerm)
  );
}
