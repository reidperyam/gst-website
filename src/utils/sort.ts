interface Project {
  year: number;
  [key: string]: any;
}

// Sort projects by year descending (most recent first)
export function sortProjectsByYear(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => b.year - a.year);
}

// Sort projects by ARR descending (highest first)
export function sortProjectsByARR(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => (b.arrNumeric || 0) - (a.arrNumeric || 0));
}

// Sort projects by code name ascending (alphabetical)
export function sortProjectsByName(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.codeName.localeCompare(b.codeName));
}
