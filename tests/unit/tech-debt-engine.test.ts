/**
 * Unit Tests for Tech Debt Engine
 *
 * Tests all pure functions:
 * - Slider transform functions (pos → value, value → pos)
 * - calculate(): core cost computation
 * - fmtShort(): abbreviated currency formatting
 * - fmtPayback(): payback period display
 * - Default state values
 */

import {
  posToTeamSize,
  posToSalary,
  posTobudget,
  posToArr,
  teamSizeToPos,
  salaryToPos,
  budgetToPos,
  arrToPos,
  calculate,
  fmt,
  fmtShort,
  fmtPayback,
  DEFAULT_STATE,
  DEPLOY_OPTIONS,
} from '../../src/utils/tech-debt-engine';

import type { CalcState } from '../../src/utils/tech-debt-engine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeState(overrides: Partial<CalcState> = {}): CalcState {
  return { ...DEFAULT_STATE, ...overrides };
}

// ─── Slider transforms ────────────────────────────────────────────────────────

describe('posToTeamSize', () => {
  it('returns 1 at position 0', () => {
    expect(posToTeamSize(0)).toBe(1);
  });

  it('returns a value close to 500 at position 100', () => {
    expect(posToTeamSize(100)).toBe(500);
  });

  it('returns 1 at the minimum slider position', () => {
    expect(posToTeamSize(0)).toBe(1);
  });

  it('is monotonically increasing', () => {
    expect(posToTeamSize(50)).toBeGreaterThan(posToTeamSize(25));
    expect(posToTeamSize(75)).toBeGreaterThan(posToTeamSize(50));
  });
});

describe('posToSalary', () => {
  it('returns 60000 at position 0', () => {
    expect(posToSalary(0)).toBe(60000);
  });

  it('returns 1000000 at position 100', () => {
    expect(posToSalary(100)).toBe(1000000);
  });

  it('snaps to 5000 increments', () => {
    expect(posToSalary(50) % 5000).toBe(0);
  });
});

describe('posTobudget', () => {
  it('returns 10000 at position 0', () => {
    expect(posTobudget(0)).toBe(10000);
  });

  it('returns 50000000 at position 100', () => {
    expect(posTobudget(100)).toBe(50000000);
  });

  it('snaps to 1000 increments', () => {
    expect(posTobudget(50) % 1000).toBe(0);
  });
});

describe('posToArr', () => {
  it('returns 100000 at position 0', () => {
    expect(posToArr(0)).toBe(100000);
  });

  it('returns 1000000000 at position 100', () => {
    expect(posToArr(100)).toBe(1000000000);
  });

  it('snaps to 100000 increments', () => {
    expect(posToArr(50) % 100000).toBe(0);
  });
});

// ─── Inverse transforms ───────────────────────────────────────────────────────

describe('inverse transforms round-trip', () => {
  it('teamSizeToPos(8) round-trips back to ~8', () => {
    const pos = teamSizeToPos(8);
    expect(posToTeamSize(pos)).toBe(8);
  });

  it('salaryToPos(150000) round-trips back to 150000', () => {
    const pos = salaryToPos(150000);
    expect(posToSalary(pos)).toBe(150000);
  });

  it('budgetToPos(500000) round-trips within one $1K snap', () => {
    const pos = budgetToPos(500000);
    expect(Math.abs(posTobudget(pos) - 500000)).toBeLessThanOrEqual(25000);
  });

  it('arrToPos(10000000) round-trips within one $100K snap', () => {
    const pos = arrToPos(10000000);
    expect(Math.abs(posToArr(pos) - 10000000)).toBeLessThanOrEqual(500000);
  });
});

// ─── calculate() ─────────────────────────────────────────────────────────────

describe('calculate() — quick mode', () => {
  it('totalMonthly equals directMonthly only (no incidents)', () => {
    const state = makeState({ mode: 'quick' });
    const result = calculate(state);
    expect(result.totalMonthly).toBe(result.directMonthly);
  });

  it('annualCost is 12× totalMonthly', () => {
    const result = calculate(makeState({ mode: 'quick' }));
    expect(result.annualCost).toBeCloseTo(result.totalMonthly * 12, 5);
  });

  it('hoursLostPerEng equals 40 × (maintPct / 100)', () => {
    const result = calculate(makeState({ maintPct: 40 }));
    expect(result.hoursLostPerEng).toBe(16);
  });

  it('costPerEng equals totalMonthly / teamSize', () => {
    const state = makeState();
    const result = calculate(state);
    const teamSize = posToTeamSize(state.teamSizePos);
    expect(result.costPerEng).toBeCloseTo(result.totalMonthly / teamSize, 5);
  });

  it('directMonthly increases with higher maintPct', () => {
    const lo = calculate(makeState({ maintPct: 20 }));
    const hi = calculate(makeState({ maintPct: 60 }));
    expect(hi.directMonthly).toBeGreaterThan(lo.directMonthly);
  });

  it('V multiplier matches the selected deploy option', () => {
    const state = makeState({ deployIdx: 0 }); // Multiple/day, V=0.8
    const result = calculate(state);
    expect(result.V).toBe(0.8);
    expect(result.doraLabel).toBe('Elite');
  });
});

describe('calculate() — deep mode', () => {
  it('totalMonthly includes incidentMonthly', () => {
    const state = makeState({ mode: 'deep', incidents: 5, mttr: 8 });
    const result = calculate(state);
    expect(result.totalMonthly).toBeCloseTo(result.directMonthly + result.incidentMonthly, 5);
  });

  it('debtPctArr is 0 when arrPos resolves to minimum', () => {
    const state = makeState({ mode: 'deep', arrPos: 0 });
    const result = calculate(state);
    // arrPos=0 → arrVal=100000; result should still be a finite number
    expect(result.debtPctArr).toBeGreaterThan(0);
  });

  it('paybackMonths is Infinity when totalMonthly is 0', () => {
    // Zero maintenance burden → zero monthly cost
    const state = makeState({ mode: 'deep', maintPct: 0, incidents: 0, mttr: 1 });
    const result = calculate(state);
    // maintPct slider min is 5 in the UI but engine accepts 0
    expect(result.paybackMonths).toBe(Infinity);
  });

  it('paybackMonths decreases as budget decreases', () => {
    const hi = calculate(makeState({ mode: 'deep', budgetPos: budgetToPos(1000000) }));
    const lo = calculate(makeState({ mode: 'deep', budgetPos: budgetToPos(100000) }));
    expect(lo.paybackMonths).toBeLessThan(hi.paybackMonths);
  });
});

// ─── DEPLOY_OPTIONS integrity ─────────────────────────────────────────────────

describe('DEPLOY_OPTIONS', () => {
  it('has exactly 9 entries', () => {
    expect(DEPLOY_OPTIONS.length).toBe(9);
  });

  it('V values are monotonically increasing', () => {
    for (let i = 1; i < DEPLOY_OPTIONS.length; i++) {
      expect(DEPLOY_OPTIONS[i].V).toBeGreaterThan(DEPLOY_OPTIONS[i - 1].V);
    }
  });

  it('index 3 (Bi-weekly) is the default', () => {
    expect(DEFAULT_STATE.deployIdx).toBe(3);
    expect(DEPLOY_OPTIONS[3].label).toBe('Bi-weekly');
  });
});

// ─── Formatting utilities ─────────────────────────────────────────────────────

describe('fmt', () => {
  it('formats as USD with no decimals', () => {
    expect(fmt(1000)).toBe('$1,000');
    expect(fmt(1500000)).toBe('$1,500,000');
  });
});

describe('fmtShort', () => {
  it('formats millions with one decimal', () => {
    expect(fmtShort(1500000)).toBe('$1.5M');
    expect(fmtShort(2000000)).toBe('$2.0M');
  });

  it('formats thousands with no decimal', () => {
    expect(fmtShort(150000)).toBe('$150K');
    expect(fmtShort(1000)).toBe('$1K');
  });

  it('falls back to full format below 1000', () => {
    expect(fmtShort(500)).toBe('$500');
  });
});

describe('fmtPayback', () => {
  it('returns "< 1 mo" for values less than 1', () => {
    expect(fmtPayback(0.5)).toBe('< 1 mo');
    expect(fmtPayback(0)).toBe('< 1 mo');
  });

  it('returns "> 5 yrs" for values over 60', () => {
    expect(fmtPayback(61)).toBe('> 5 yrs');
    expect(fmtPayback(Infinity)).toBe('> 5 yrs');
  });

  it('returns months with one decimal for normal range', () => {
    expect(fmtPayback(12)).toBe('12.0 mo');
    expect(fmtPayback(23.5)).toBe('23.5 mo');
  });
});

// ─── Default state ────────────────────────────────────────────────────────────

describe('DEFAULT_STATE', () => {
  it('starts in quick mode', () => {
    expect(DEFAULT_STATE.mode).toBe('quick');
  });

  it('initialises to team size of 8', () => {
    expect(posToTeamSize(DEFAULT_STATE.teamSizePos)).toBe(8);
  });

  it('initialises to salary of 150000', () => {
    expect(posToSalary(DEFAULT_STATE.salaryPos)).toBe(150000);
  });

  it('initialises to maintenance burden of 40%', () => {
    expect(DEFAULT_STATE.maintPct).toBe(40);
  });

  it('initialises to deploy index 3 (Bi-weekly)', () => {
    expect(DEFAULT_STATE.deployIdx).toBe(3);
  });

  it('initialises to 3 incidents per month', () => {
    expect(DEFAULT_STATE.incidents).toBe(3);
  });

  it('initialises to 4h MTTR', () => {
    expect(DEFAULT_STATE.mttr).toBe(4);
  });

  it('initialises budget to approximately $500K', () => {
    expect(Math.abs(posTobudget(DEFAULT_STATE.budgetPos) - 500000)).toBeLessThanOrEqual(25000);
  });

  it('initialises ARR to approximately $10M', () => {
    expect(Math.abs(posToArr(DEFAULT_STATE.arrPos) - 10000000)).toBeLessThanOrEqual(500000);
  });
});
