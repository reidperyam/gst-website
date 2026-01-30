import type { Project } from '../types/portfolio';

/**
 * Engagement type categorization constants
 */
export const ENGAGEMENT_CATEGORIES = {
  valueCreation: [
    'Value Creation - Growth',
    'Value Creation - Integration',
    'Value Creation - Modernization',
    'Value Creation - Turnaround'
  ],
  technicalDiligence: [
    'Early Stage Assessment',
    'Technical Assessment',
    'Buy-Side Technical Diligence'
  ]
} as const;

/**
 * Growth stage categorization keywords
 */
export const GROWTH_KEYWORDS = [
  'growth',
  'expansion',
  'small',
  'scaling',
  'scale-up',
  'startup',
  'early'
];

/**
 * Mature stage categorization keywords
 */
export const MATURE_KEYWORDS = [
  'mature',
  'maturity',
  'established',
  'developed',
  'legacy',
  'modernizing',
  'enterprise'
];

/**
 * Filter criteria interface
 */
export interface FilterCriteria {
  search: string;
  stage: string; // 'all' | 'growth-category' | 'mature-category' | specific stage name
  theme: string; // 'all' | specific theme name
  year: string; // 'all' | year as string
  engagement: string; // 'all' | 'value-creation' | 'technical-diligence'
}

/**
 * Categorizes a growth stage string into growth, mature, or other
 * @param stage - The growth stage string to categorize
 * @returns 'growth' | 'mature' | 'other'
 */
export function categorizeGrowthStage(stage: string): 'growth' | 'mature' | 'other' {
  const stageLower = stage.toLowerCase();

  if (GROWTH_KEYWORDS.some(keyword => stageLower.includes(keyword))) {
    return 'growth';
  }

  if (MATURE_KEYWORDS.some(keyword => stageLower.includes(keyword))) {
    return 'mature';
  }

  return 'other';
}

/**
 * Categorizes an engagement type into its category
 * @param engagementType - The engagement type to categorize
 * @returns 'value-creation' | 'technical-diligence' | 'other'
 */
export function categorizeEngagementType(
  engagementType: string | undefined
): 'value-creation' | 'technical-diligence' | 'other' {
  if (!engagementType) return 'other';

  if (ENGAGEMENT_CATEGORIES.valueCreation.includes(engagementType as any)) {
    return 'value-creation';
  }

  if (ENGAGEMENT_CATEGORIES.technicalDiligence.includes(engagementType as any)) {
    return 'technical-diligence';
  }

  return 'other';
}

/**
 * Gets all unique growth stages from a list of projects
 * @param projects - Array of projects to analyze
 * @returns Array of unique growth stages
 */
export function getUniqueGrowthStages(projects: Project[]): string[] {
  return [...new Set(projects.map(p => p.growthStage))];
}

/**
 * Gets all growth stage projects from a list of projects
 * @param projects - Array of projects to analyze
 * @returns Array of growth stage projects
 */
export function getGrowthStageProjects(projects: Project[]): string[] {
  const uniqueStages = getUniqueGrowthStages(projects);
  return uniqueStages
    .filter(stage => categorizeGrowthStage(stage) === 'growth')
    .sort();
}

/**
 * Gets all mature stage projects from a list of projects
 * @param projects - Array of projects to analyze
 * @returns Array of mature stage projects
 */
export function getMatureStageProjects(projects: Project[]): string[] {
  const uniqueStages = getUniqueGrowthStages(projects);
  return uniqueStages
    .filter(stage => categorizeGrowthStage(stage) === 'mature')
    .sort();
}

/**
 * Gets all unique themes from a list of projects
 * @param projects - Array of projects to analyze
 * @returns Sorted array of unique themes
 */
export function getUniqueThemes(projects: Project[]): string[] {
  return [...new Set(projects.map(p => p.theme))].sort();
}

/**
 * Gets all unique years from a list of projects
 * @param projects - Array of projects to analyze
 * @returns Array of unique years sorted in descending order
 */
export function getUniqueYears(projects: Project[]): number[] {
  return [...new Set(projects.map(p => p.year))].sort((a, b) => b - a);
}

/**
 * Gets all unique engagement types from a list of projects
 * @param projects - Array of projects to analyze
 * @returns Sorted array of unique engagement types
 */
export function getUniqueEngagementTypes(projects: Project[]): string[] {
  return [
    ...new Set(
      projects
        .map(p => p.engagementType)
        .filter((e): e is string => e !== undefined)
    )
  ].sort();
}

/**
 * Extracts searchable text from a project
 * @param project - Project to extract text from
 * @returns Combined searchable text
 */
export function createSearchableText(project: Project): string {
  const techs = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
      ? project.technologies.split(',').map(t => t.trim())
      : [];

  return [project.codeName, project.industry, project.summary, ...techs]
    .join(' ')
    .toLowerCase();
}

/**
 * Filters projects based on provided criteria
 * @param projects - Array of projects to filter
 * @param criteria - Filter criteria to apply
 * @param growthStages - List of growth stage values
 * @param matureStages - List of mature stage values
 * @returns Filtered array of projects
 */
export function filterProjects(
  projects: Project[],
  criteria: FilterCriteria,
  growthStages: string[] = [],
  matureStages: string[] = []
): Project[] {
  return projects.filter(project => {
    // Search filter
    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      const searchableText = createSearchableText(project);

      if (!searchableText.includes(searchLower)) return false;
    }

    // Stage filter - handle category filtering
    if (criteria.stage !== 'all') {
      if (criteria.stage === 'growth-category') {
        if (!growthStages.includes(project.growthStage)) return false;
      } else if (criteria.stage === 'mature-category') {
        if (!matureStages.includes(project.growthStage)) return false;
      } else if (project.growthStage !== criteria.stage) {
        return false;
      }
    }

    // Theme filter
    if (criteria.theme !== 'all' && project.theme !== criteria.theme) {
      return false;
    }

    // Year filter
    if (criteria.year !== 'all' && project.year.toString() !== criteria.year) {
      return false;
    }

    // Engagement type filter - categorized by type
    if (criteria.engagement !== 'all') {
      if (criteria.engagement === 'value-creation') {
        if (!ENGAGEMENT_CATEGORIES.valueCreation.includes(project.engagementType as any)) {
          return false;
        }
      } else if (criteria.engagement === 'technical-diligence') {
        if (!ENGAGEMENT_CATEGORIES.technicalDiligence.includes(project.engagementType as any)) {
          return false;
        }
      }
    }

    return true;
  });
}
