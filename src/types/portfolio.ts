export interface Project {
  id: string;
  codeName: string;
  industry: string;
  theme: string;
  summary: string;
  arr: string; // Display format (e.g., "$220,000,000", "€120,000,000")
  arrNumeric: number; // For sorting/calculations (in base currency units)
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';
  growthStage: string;
  year: number;
  technologies: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface FilterState {
  search: string;
  theme: string;
  stage: string;
  year: string;
}

export interface SortState {
  column: 'codeName' | 'theme' | 'arr' | 'growthStage' | 'year' | null;
  direction: 'asc' | 'desc';
}
