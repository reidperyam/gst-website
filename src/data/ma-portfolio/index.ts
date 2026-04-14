/**
 * Single validated entry point for M&A portfolio data.
 *
 * Imports the raw JSON, validates against the Zod schema, and exports
 * a typed `projects` array. All consumers (pages, components, utilities)
 * should import from this module rather than `./projects.json` directly.
 *
 * Validation runs once at build time. On schema violation, the build
 * fails with a human-readable error naming the offending field.
 */

import { ProjectsArraySchema, type Project } from '../../schemas/portfolio';
import { validateDataSource } from '../../utils/validateData';
import rawProjects from './projects.json';

export const projects: Project[] = validateDataSource(
  ProjectsArraySchema,
  rawProjects,
  'ma-portfolio/projects.json'
);
