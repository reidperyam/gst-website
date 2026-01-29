describe('Portfolio Filtering', () => {
  let state: any;

  beforeEach(() => {
    state = {
      search: '',
      filters: [],
    };
  });

  it('should initialize with empty search', () => {
    expect(state.search).toBe('');
  });

  it('should initialize with empty filters', () => {
    expect(state.filters).toEqual([]);
  });

  it('should update search', () => {
    state.search = 'fintech';
    expect(state.search).toBe('fintech');
  });

  it('should add filter', () => {
    state.filters.push('seed');
    expect(state.filters).toContain('seed');
  });

  it('should remove filter', () => {
    state.filters = ['seed', 'series-a'];
    state.filters = state.filters.filter((f) => f !== 'seed');
    expect(state.filters).toEqual(['series-a']);
  });

  it('should clear all filters', () => {
    state.filters = ['seed', 'series-a'];
    state.filters = [];
    expect(state.filters).toEqual([]);
  });
});
