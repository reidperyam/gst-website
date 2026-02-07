/**
 * The Diligence Engine
 *
 * Pure-function module that maps user inputs to a prescriptive
 * "Inquisitor's Script" of due diligence questions and risk anchors.
 * Zero DOM dependencies — fully testable with Vitest.
 */

import { QUESTIONS, TOPIC_META } from '../data/diligence-machine/questions';
import { RISK_ANCHORS } from '../data/diligence-machine/risk-anchors';
import { BRACKET_ORDER } from '../data/diligence-machine/wizard-config';
import type { DiligenceQuestion, QuestionCondition } from '../data/diligence-machine/questions';
import type { RiskAnchor } from '../data/diligence-machine/risk-anchors';

export interface UserInputs {
  transactionType: string;
  productType: string;
  techArchetype: string;
  headcount: string;
  revenueRange: string;
  growthStage: string;
  companyAge: string;
  geographies: string[];
}

export interface TopicOutput {
  topicId: string;
  topicLabel: string;
  audienceLevel: string;
  questions: DiligenceQuestion[];
}

export interface GeneratedScript {
  topics: TopicOutput[];
  riskAnchors: RiskAnchor[];
  metadata: {
    totalQuestions: number;
    generatedAt: string;
    inputSummary: Record<string, string | string[]>;
  };
}

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  standard: 2,
};

/**
 * Compare an ordinal bracket value against a minimum threshold.
 * Returns true if the user's selection is at or above the minimum.
 */
export function meetsMinimumBracket(
  bracketType: keyof typeof BRACKET_ORDER,
  userValue: string,
  minimumValue: string
): boolean {
  const order = BRACKET_ORDER[bracketType];
  const userIndex = order.indexOf(userValue as typeof order[number]);
  const minIndex = order.indexOf(minimumValue as typeof order[number]);

  // If either value is not found in the ordering, don't filter it out
  if (userIndex === -1 || minIndex === -1) return true;

  return userIndex >= minIndex;
}

/**
 * Check if a set of conditions matches the user's inputs.
 * Undefined condition fields are wildcards (match everything).
 * Specified arrays use OR logic within, AND logic across fields.
 */
export function matchesConditions(
  conditions: QuestionCondition,
  inputs: UserInputs
): boolean {
  if (
    conditions.transactionTypes &&
    !conditions.transactionTypes.includes(inputs.transactionType)
  ) {
    return false;
  }

  if (
    conditions.excludeTransactionTypes &&
    conditions.excludeTransactionTypes.includes(inputs.transactionType)
  ) {
    return false;
  }

  if (
    conditions.productTypes &&
    !conditions.productTypes.includes(inputs.productType)
  ) {
    return false;
  }

  if (
    conditions.techArchetypes &&
    !conditions.techArchetypes.includes(inputs.techArchetype)
  ) {
    return false;
  }

  if (
    conditions.growthStages &&
    !conditions.growthStages.includes(inputs.growthStage)
  ) {
    return false;
  }

  if (
    conditions.geographies &&
    !conditions.geographies.some((g) => inputs.geographies.includes(g))
  ) {
    return false;
  }

  if (
    conditions.headcountMin &&
    !meetsMinimumBracket('headcount', inputs.headcount, conditions.headcountMin)
  ) {
    return false;
  }

  if (
    conditions.revenueMin &&
    !meetsMinimumBracket('revenue-range', inputs.revenueRange, conditions.revenueMin)
  ) {
    return false;
  }

  if (
    conditions.companyAgeMin &&
    !meetsMinimumBracket('company-age', inputs.companyAge, conditions.companyAgeMin)
  ) {
    return false;
  }

  return true;
}

/**
 * Sort questions by priority (critical first, then high, then standard).
 */
export function sortByPriority(questions: DiligenceQuestion[]): DiligenceQuestion[] {
  return [...questions].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
  );
}

/**
 * Balance question selection across topics while respecting a total cap.
 * Ensures minimum representation per topic (3 if available), then fills
 * remaining slots by priority across all topics.
 */
export function balanceAcrossTopics(
  questions: DiligenceQuestion[],
  minTotal: number,
  maxTotal: number
): DiligenceQuestion[] {
  const topicIds = Object.keys(TOPIC_META) as Array<keyof typeof TOPIC_META>;
  const byTopic: Record<string, DiligenceQuestion[]> = {};

  for (const id of topicIds) {
    byTopic[id] = [];
  }

  for (const q of questions) {
    if (byTopic[q.topic]) {
      byTopic[q.topic].push(q);
    }
  }

  // Sort each topic's questions by priority
  for (const id of topicIds) {
    byTopic[id] = sortByPriority(byTopic[id]);
  }

  const selected = new Set<string>();
  const result: DiligenceQuestion[] = [];
  const minPerTopic = 3;

  // Phase 1: Reserve minimum per topic
  for (const id of topicIds) {
    const topicQuestions = byTopic[id];
    const take = Math.min(minPerTopic, topicQuestions.length);
    for (let i = 0; i < take; i++) {
      selected.add(topicQuestions[i].id);
      result.push(topicQuestions[i]);
    }
  }

  // Phase 2: Fill remaining slots from all topics by priority
  if (result.length < maxTotal) {
    const remaining = questions
      .filter((q) => !selected.has(q.id));
    const sorted = sortByPriority(remaining);

    for (const q of sorted) {
      if (result.length >= maxTotal) break;
      selected.add(q.id);
      result.push(q);
    }
  }

  return result;
}

/**
 * Group selected questions into topic-ordered output sections.
 */
export function groupByTopic(questions: DiligenceQuestion[]): TopicOutput[] {
  const topicIds = Object.keys(TOPIC_META) as Array<keyof typeof TOPIC_META>;
  const topics: TopicOutput[] = [];

  for (const id of topicIds) {
    const meta = TOPIC_META[id];
    const topicQuestions = sortByPriority(
      questions.filter((q) => q.topic === id)
    );

    if (topicQuestions.length > 0) {
      topics.push({
        topicId: id,
        topicLabel: meta.label,
        audienceLevel: meta.audience,
        questions: topicQuestions,
      });
    }
  }

  return topics;
}

/**
 * Main engine function: takes user inputs, returns the generated script.
 * Pure function, no side effects, fully testable.
 */
export function generateScript(inputs: UserInputs): GeneratedScript {
  const matchedQuestions = QUESTIONS.filter((q) =>
    matchesConditions(q.conditions, inputs)
  );

  const matchedAnchors = RISK_ANCHORS.filter((a) =>
    matchesConditions(a.conditions, inputs)
  );

  const selected = balanceAcrossTopics(matchedQuestions, 15, 20);
  const topics = groupByTopic(selected);

  return {
    topics,
    riskAnchors: matchedAnchors,
    metadata: {
      totalQuestions: selected.length,
      generatedAt: new Date().toISOString(),
      inputSummary: {
        transactionType: inputs.transactionType,
        productType: inputs.productType,
        techArchetype: inputs.techArchetype,
        headcount: inputs.headcount,
        revenueRange: inputs.revenueRange,
        growthStage: inputs.growthStage,
        companyAge: inputs.companyAge,
        geographies: inputs.geographies,
      },
    },
  };
}
