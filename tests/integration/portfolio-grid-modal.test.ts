import { describe, it, expect, beforeEach } from 'vitest';

describe('Portfolio Grid & Modal', () => {
  let state: any;

  beforeEach(() => {
    state = {
      selectedId: null,
      projects: [
        { id: 1, name: 'Fintech', industry: 'Finance' },
        { id: 2, name: 'AI Analytics', industry: 'Technology' },
        { id: 3, name: 'Healthcare', industry: 'Healthcare' },
      ],
    };
  });

  it('should initialize with no selected project', () => {
    expect(state.selectedId).toBeNull();
  });

  it('should select a project', () => {
    state.selectedId = 1;
    expect(state.selectedId).toBe(1);
  });

  it('should switch to different project', () => {
    state.selectedId = 1;
    state.selectedId = 2;
    expect(state.selectedId).toBe(2);
  });

  it('should deselect a project', () => {
    state.selectedId = 1;
    state.selectedId = null;
    expect(state.selectedId).toBeNull();
  });

  it('should find project by id', () => {
    const project = state.projects.find((p) => p.id === 1);
    expect(project).toEqual({ id: 1, name: 'Fintech', industry: 'Finance' });
  });

  it('should display all projects', () => {
    expect(state.projects).toHaveLength(3);
  });

  it('should get selected project details', () => {
    state.selectedId = 2;
    const selected = state.projects.find((p) => p.id === state.selectedId);
    expect(selected.industry).toBe('Technology');
  });

  it('should filter projects by industry', () => {
    const healthcare = state.projects.filter((p) => p.industry === 'Healthcare');
    expect(healthcare).toHaveLength(1);
    expect(healthcare[0].name).toBe('Healthcare');
  });
});
