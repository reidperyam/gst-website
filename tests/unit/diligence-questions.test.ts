import { describe, it, expect } from 'vitest';
import { QUESTIONS, TRACK_META } from '../../src/data/diligence-machine/questions';
import { RISK_ANCHORS } from '../../src/data/diligence-machine/risk-anchors';
import { WIZARD_STEPS, BRACKET_ORDER } from '../../src/data/diligence-machine/wizard-config';

describe('Question Bank Data Integrity', () => {
  it('should have at least 40 questions', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(40);
  });

  it('should have unique question IDs', () => {
    const ids = QUESTIONS.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all questions assigned to valid tracks', () => {
    const validTracks = Object.keys(TRACK_META);
    for (const q of QUESTIONS) {
      expect(validTracks).toContain(q.track);
    }
  });

  it('should have all four tracks represented', () => {
    const tracks = new Set(QUESTIONS.map((q) => q.track));
    expect(tracks.size).toBe(4);
    expect(tracks).toContain('architecture');
    expect(tracks).toContain('operations');
    expect(tracks).toContain('carveout-integration');
    expect(tracks).toContain('security-risk');
  });

  it('should have at least 8 questions per track', () => {
    const trackCounts: Record<string, number> = {};
    for (const q of QUESTIONS) {
      trackCounts[q.track] = (trackCounts[q.track] || 0) + 1;
    }
    for (const track of Object.keys(TRACK_META)) {
      expect(trackCounts[track]).toBeGreaterThanOrEqual(8);
    }
  });

  it('should have valid priority values', () => {
    const validPriorities = ['critical', 'high', 'standard'];
    for (const q of QUESTIONS) {
      expect(validPriorities).toContain(q.priority);
    }
  });

  it('should have non-empty text and rationale for every question', () => {
    for (const q of QUESTIONS) {
      expect(q.text.length).toBeGreaterThan(20);
      expect(q.rationale.length).toBeGreaterThan(20);
    }
  });

  it('should reference valid wizard option IDs in conditions', () => {
    const validTransactionTypes = WIZARD_STEPS[0].options!.map((o) => o.id);
    const validProductTypes = WIZARD_STEPS[1].options!.map((o) => o.id);
    const validArchetypes = WIZARD_STEPS[2].options!.map((o) => o.id);
    const validGrowthStages = WIZARD_STEPS[3].fields![2].options.map((o) => o.id);
    const validGeographies = WIZARD_STEPS[4].options!.map((o) => o.id);
    const validHeadcounts = BRACKET_ORDER.headcount as unknown as string[];
    const validRevenues = BRACKET_ORDER['revenue-range'] as unknown as string[];
    const validAges = BRACKET_ORDER['company-age'] as unknown as string[];

    for (const q of QUESTIONS) {
      const c = q.conditions;
      if (c.transactionTypes) {
        for (const t of c.transactionTypes) {
          expect(validTransactionTypes, `Question ${q.id} has invalid transactionType: ${t}`).toContain(t);
        }
      }
      if (c.productTypes) {
        for (const t of c.productTypes) {
          expect(validProductTypes, `Question ${q.id} has invalid productType: ${t}`).toContain(t);
        }
      }
      if (c.techArchetypes) {
        for (const t of c.techArchetypes) {
          expect(validArchetypes, `Question ${q.id} has invalid techArchetype: ${t}`).toContain(t);
        }
      }
      if (c.growthStages) {
        for (const t of c.growthStages) {
          expect(validGrowthStages, `Question ${q.id} has invalid growthStage: ${t}`).toContain(t);
        }
      }
      if (c.geographies) {
        for (const t of c.geographies) {
          expect(validGeographies, `Question ${q.id} has invalid geography: ${t}`).toContain(t);
        }
      }
      if (c.headcountMin) {
        expect(validHeadcounts, `Question ${q.id} has invalid headcountMin: ${c.headcountMin}`).toContain(c.headcountMin);
      }
      if (c.revenueMin) {
        expect(validRevenues, `Question ${q.id} has invalid revenueMin: ${c.revenueMin}`).toContain(c.revenueMin);
      }
      if (c.companyAgeMin) {
        expect(validAges, `Question ${q.id} has invalid companyAgeMin: ${c.companyAgeMin}`).toContain(c.companyAgeMin);
      }
    }
  });
});

describe('Risk Anchors Data Integrity', () => {
  it('should have at least 8 risk anchors', () => {
    expect(RISK_ANCHORS.length).toBeGreaterThanOrEqual(8);
  });

  it('should have unique risk anchor IDs', () => {
    const ids = RISK_ANCHORS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have valid severity values', () => {
    const validSeverities = ['high', 'medium', 'low'];
    for (const r of RISK_ANCHORS) {
      expect(validSeverities).toContain(r.severity);
    }
  });

  it('should have non-empty title and description', () => {
    for (const r of RISK_ANCHORS) {
      expect(r.title.length).toBeGreaterThan(5);
      expect(r.description.length).toBeGreaterThan(20);
    }
  });
});

describe('Wizard Configuration Integrity', () => {
  it('should have exactly 5 wizard steps', () => {
    expect(WIZARD_STEPS.length).toBe(5);
  });

  it('should have unique step IDs', () => {
    const ids = WIZARD_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have options for single-select and multi-select steps', () => {
    for (const step of WIZARD_STEPS) {
      if (step.inputType === 'single-select' || step.inputType === 'multi-select') {
        expect(step.options, `Step ${step.id} missing options`).toBeDefined();
        expect(step.options!.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have fields for compound steps', () => {
    for (const step of WIZARD_STEPS) {
      if (step.inputType === 'compound') {
        expect(step.fields, `Step ${step.id} missing fields`).toBeDefined();
        expect(step.fields!.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have unique option IDs within each step', () => {
    for (const step of WIZARD_STEPS) {
      if (step.options) {
        const ids = step.options.map((o) => o.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
      if (step.fields) {
        for (const field of step.fields) {
          const ids = field.options.map((o) => o.id);
          expect(new Set(ids).size).toBe(ids.length);
        }
      }
    }
  });
});
