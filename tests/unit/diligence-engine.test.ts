import { describe, it, expect } from 'vitest';
import {
  matchesConditions,
  meetsMinimumBracket,
  sortByPriority,
  balanceAcrossTracks,
  groupByTrack,
  generateScript,
} from '../../src/utils/diligence-engine';
import type { UserInputs } from '../../src/utils/diligence-engine';
import type { DiligenceQuestion, QuestionCondition } from '../../src/data/diligence-machine/questions';

// Helper: create a minimal question for testing
function makeQuestion(
  overrides: Partial<DiligenceQuestion> = {}
): DiligenceQuestion {
  return {
    id: overrides.id ?? 'test-q',
    track: overrides.track ?? 'architecture',
    trackLabel: overrides.trackLabel ?? 'Architecture & Scalability',
    audienceLevel: overrides.audienceLevel ?? 'CTO',
    text: overrides.text ?? 'Test question text that is long enough',
    rationale: overrides.rationale ?? 'Test rationale that is long enough',
    priority: overrides.priority ?? 'standard',
    conditions: overrides.conditions ?? {},
  };
}

// Standard test inputs
const baseInputs: UserInputs = {
  transactionType: 'full-acquisition',
  productType: 'b2b-saas',
  techArchetype: 'modern-cloud-native',
  headcount: '51-200',
  revenueRange: '5-25m',
  growthStage: 'scaling',
  companyAge: '5-10yr',
  geographies: ['us'],
};

describe('meetsMinimumBracket', () => {
  it('should return true when user value equals minimum', () => {
    expect(meetsMinimumBracket('headcount', '51-200', '51-200')).toBe(true);
  });

  it('should return true when user value exceeds minimum', () => {
    expect(meetsMinimumBracket('headcount', '500+', '51-200')).toBe(true);
  });

  it('should return false when user value is below minimum', () => {
    expect(meetsMinimumBracket('headcount', '1-50', '51-200')).toBe(false);
  });

  it('should handle company-age brackets correctly', () => {
    expect(meetsMinimumBracket('company-age', '20yr+', '10-20yr')).toBe(true);
    expect(meetsMinimumBracket('company-age', '2-5yr', '10-20yr')).toBe(false);
  });

  it('should handle revenue-range brackets correctly', () => {
    expect(meetsMinimumBracket('revenue-range', '100m+', '25-100m')).toBe(true);
    expect(meetsMinimumBracket('revenue-range', '0-5m', '25-100m')).toBe(false);
  });

  it('should return true if user value is not in ordering (graceful fallback)', () => {
    expect(meetsMinimumBracket('headcount', 'unknown', '51-200')).toBe(true);
  });
});

describe('matchesConditions', () => {
  it('should match when conditions are empty (wildcard)', () => {
    expect(matchesConditions({}, baseInputs)).toBe(true);
  });

  it('should match when transactionType is in the list', () => {
    const conditions: QuestionCondition = {
      transactionTypes: ['full-acquisition', 'carve-out'],
    };
    expect(matchesConditions(conditions, baseInputs)).toBe(true);
  });

  it('should not match when transactionType is not in the list', () => {
    const conditions: QuestionCondition = {
      transactionTypes: ['carve-out', 'venture-series'],
    };
    expect(matchesConditions(conditions, baseInputs)).toBe(false);
  });

  it('should exclude when transactionType is in excludeTransactionTypes', () => {
    const conditions: QuestionCondition = {
      excludeTransactionTypes: ['full-acquisition'],
    };
    expect(matchesConditions(conditions, baseInputs)).toBe(false);
  });

  it('should match productType correctly', () => {
    const conditions: QuestionCondition = {
      productTypes: ['b2b-saas'],
    };
    expect(matchesConditions(conditions, baseInputs)).toBe(true);
  });

  it('should match techArchetype correctly', () => {
    const conditions: QuestionCondition = {
      techArchetypes: ['hybrid-legacy'],
    };
    expect(matchesConditions(conditions, baseInputs)).toBe(false);
  });

  it('should match growthStage correctly', () => {
    const conditions: QuestionCondition = {
      growthStages: ['scaling', 'mature'],
    };
    expect(matchesConditions(conditions, baseInputs)).toBe(true);
  });

  it('should match geography with OR logic', () => {
    const conditions: QuestionCondition = {
      geographies: ['eu', 'us'],
    };
    expect(matchesConditions(conditions, baseInputs)).toBe(true);
  });

  it('should not match geography when none overlap', () => {
    const conditions: QuestionCondition = {
      geographies: ['eu', 'apac'],
    };
    expect(matchesConditions(conditions, baseInputs)).toBe(false);
  });

  it('should apply AND logic across multiple condition fields', () => {
    const conditions: QuestionCondition = {
      transactionTypes: ['full-acquisition'],
      productTypes: ['on-premise-enterprise'], // doesn't match
    };
    expect(matchesConditions(conditions, baseInputs)).toBe(false);
  });

  it('should handle headcountMin ordinal comparison', () => {
    const conditions: QuestionCondition = {
      headcountMin: '201-500',
    };
    // baseInputs has headcount '51-200' which is below '201-500'
    expect(matchesConditions(conditions, baseInputs)).toBe(false);
  });

  it('should handle revenueMin ordinal comparison', () => {
    const conditions: QuestionCondition = {
      revenueMin: '5-25m',
    };
    // baseInputs has revenueRange '5-25m' which equals the minimum
    expect(matchesConditions(conditions, baseInputs)).toBe(true);
  });

  it('should handle companyAgeMin ordinal comparison', () => {
    const conditions: QuestionCondition = {
      companyAgeMin: '10-20yr',
    };
    // baseInputs has companyAge '5-10yr' which is below '10-20yr'
    expect(matchesConditions(conditions, baseInputs)).toBe(false);
  });
});

describe('sortByPriority', () => {
  it('should sort critical before high before standard', () => {
    const questions = [
      makeQuestion({ id: 'q1', priority: 'standard' }),
      makeQuestion({ id: 'q2', priority: 'critical' }),
      makeQuestion({ id: 'q3', priority: 'high' }),
    ];
    const sorted = sortByPriority(questions);
    expect(sorted.map((q) => q.priority)).toEqual([
      'critical',
      'high',
      'standard',
    ]);
  });

  it('should not mutate the original array', () => {
    const questions = [
      makeQuestion({ id: 'q1', priority: 'standard' }),
      makeQuestion({ id: 'q2', priority: 'critical' }),
    ];
    const original = [...questions];
    sortByPriority(questions);
    expect(questions).toEqual(original);
  });
});

describe('balanceAcrossTracks', () => {
  it('should include questions from all tracks when available', () => {
    const questions = [
      makeQuestion({ id: 'a1', track: 'architecture', priority: 'critical' }),
      makeQuestion({ id: 'a2', track: 'architecture', priority: 'high' }),
      makeQuestion({ id: 'a3', track: 'architecture', priority: 'standard' }),
      makeQuestion({ id: 'o1', track: 'operations', priority: 'critical' }),
      makeQuestion({ id: 'o2', track: 'operations', priority: 'high' }),
      makeQuestion({ id: 'o3', track: 'operations', priority: 'standard' }),
      makeQuestion({ id: 'c1', track: 'carveout-integration', priority: 'critical' }),
      makeQuestion({ id: 'c2', track: 'carveout-integration', priority: 'high' }),
      makeQuestion({ id: 'c3', track: 'carveout-integration', priority: 'standard' }),
      makeQuestion({ id: 's1', track: 'security-risk', priority: 'critical' }),
      makeQuestion({ id: 's2', track: 'security-risk', priority: 'high' }),
      makeQuestion({ id: 's3', track: 'security-risk', priority: 'standard' }),
    ];

    const result = balanceAcrossTracks(questions, 12, 12);
    const tracks = new Set(result.map((q) => q.track));
    expect(tracks.size).toBe(4);
  });

  it('should cap at maxTotal', () => {
    const questions = Array.from({ length: 30 }, (_, i) =>
      makeQuestion({
        id: `q${i}`,
        track: (['architecture', 'operations', 'carveout-integration', 'security-risk'] as const)[i % 4],
        priority: 'high',
      })
    );

    const result = balanceAcrossTracks(questions, 15, 20);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('should ensure minimum 3 per track when enough questions exist', () => {
    const questions = Array.from({ length: 40 }, (_, i) =>
      makeQuestion({
        id: `q${i}`,
        track: (['architecture', 'operations', 'carveout-integration', 'security-risk'] as const)[i % 4],
        priority: i < 8 ? 'critical' : 'standard',
      })
    );

    const result = balanceAcrossTracks(questions, 15, 20);
    const trackCounts: Record<string, number> = {};
    for (const q of result) {
      trackCounts[q.track] = (trackCounts[q.track] || 0) + 1;
    }

    for (const count of Object.values(trackCounts)) {
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('groupByTrack', () => {
  it('should group questions by track in order', () => {
    const questions = [
      makeQuestion({ id: 's1', track: 'security-risk' }),
      makeQuestion({ id: 'a1', track: 'architecture' }),
      makeQuestion({ id: 'o1', track: 'operations' }),
    ];

    const tracks = groupByTrack(questions);
    expect(tracks.map((t) => t.trackId)).toEqual([
      'architecture',
      'operations',
      'security-risk',
    ]);
  });

  it('should omit empty tracks', () => {
    const questions = [
      makeQuestion({ id: 'a1', track: 'architecture' }),
    ];

    const tracks = groupByTrack(questions);
    expect(tracks.length).toBe(1);
    expect(tracks[0].trackId).toBe('architecture');
  });
});

describe('generateScript', () => {
  it('should produce a valid script from standard inputs', () => {
    const result = generateScript(baseInputs);

    expect(result.tracks.length).toBeGreaterThan(0);
    expect(result.metadata.totalQuestions).toBeGreaterThanOrEqual(15);
    expect(result.metadata.totalQuestions).toBeLessThanOrEqual(20);
    expect(result.metadata.generatedAt).toBeTruthy();
    expect(result.metadata.inputSummary.transactionType).toBe('full-acquisition');
  });

  it('should produce risk anchors for legacy infrastructure + old company', () => {
    const inputs: UserInputs = {
      ...baseInputs,
      techArchetype: 'self-managed-infra',
      companyAge: '20yr+',
    };

    const result = generateScript(inputs);
    const anchorIds = result.riskAnchors.map((a) => a.id);
    expect(anchorIds).toContain('risk-hw-eol');
  });

  it('should include carve-out questions for carve-out transactions', () => {
    const inputs: UserInputs = {
      ...baseInputs,
      transactionType: 'carve-out',
    };

    const result = generateScript(inputs);
    const carveoutTrack = result.tracks.find(
      (t) => t.trackId === 'carveout-integration'
    );
    expect(carveoutTrack).toBeDefined();
    expect(carveoutTrack!.questions.length).toBeGreaterThanOrEqual(3);
  });

  it('should include GDPR question for EU geography', () => {
    const inputs: UserInputs = {
      ...baseInputs,
      geographies: ['eu'],
    };

    const result = generateScript(inputs);
    const allQuestions = result.tracks.flatMap((t) => t.questions);
    const gdprQuestion = allQuestions.find((q) => q.id === 'sec-05');
    expect(gdprQuestion).toBeDefined();
  });

  it('should include tech-enabled service questions for that product type', () => {
    const inputs: UserInputs = {
      ...baseInputs,
      productType: 'tech-enabled-service',
    };

    const result = generateScript(inputs);
    const allQuestions = result.tracks.flatMap((t) => t.questions);
    const serviceQuestion = allQuestions.find((q) => q.id === 'ops-06');
    expect(serviceQuestion).toBeDefined();
  });
});
