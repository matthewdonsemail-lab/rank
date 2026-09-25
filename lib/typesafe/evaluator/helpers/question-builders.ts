import type {
  ChoiceCriteria,
  ChoiceQuestion,
  NoulCriteria,
  NoulQuestion,
  ScoreCriteria,
  ScoreQuestion,
  TypeSafeEntry,
} from '../types.js';

export function noul(instructions: TypeSafeEntry = null, criteria?: NoulCriteria | null): NoulQuestion {
  return {
    type: 'noul',
    instructions,
    ...(criteria === undefined ? {} : { criteria }),
  };
}

export function choice(instructions: TypeSafeEntry, criteria: ChoiceCriteria): ChoiceQuestion {
  const optionCount = Object.keys(criteria).length;
  if (optionCount === 0) throw new TypeError('Choice questions require at least one criterion');
  if (optionCount > 255) throw new TypeError('Choice questions support at most 255 criteria');
  return { type: 'choice', instructions, criteria };
}

export function score(instructions: TypeSafeEntry, criteria: ScoreCriteria): ScoreQuestion {
  if (criteria.length < 2) throw new TypeError('Score questions require at least two criteria');
  if (criteria.length > 10) throw new TypeError('Score questions support at most ten criteria');
  return { type: 'score', instructions, criteria };
}
