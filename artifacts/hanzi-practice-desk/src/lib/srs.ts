export interface ReviewState {
  interval: number;
  easeFactor: number;
  repetitions: number;
  dueDate: number;
  lastReviewed: number;
}

export const DEFAULT_REVIEW_STATE: ReviewState = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  dueDate: 0,
  lastReviewed: 0,
};

function qualityFromMistakes(mistakes: number): number {
  if (mistakes === 0) return 5;
  if (mistakes === 1) return 4;
  if (mistakes === 2) return 3;
  if (mistakes === 3) return 2;
  return 1;
}

export function scheduleReview(prev: ReviewState | undefined, mistakes: number, now: number = Date.now()): ReviewState {
  const state = prev ?? { ...DEFAULT_REVIEW_STATE };
  const quality = qualityFromMistakes(mistakes);

  let { interval, easeFactor, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const dueDate = now + interval * 24 * 60 * 60 * 1000;

  return { interval, easeFactor, repetitions, dueDate, lastReviewed: now };
}

type PartialReviewState = Partial<ReviewState> | undefined;

export function isDue(state: PartialReviewState, now: number = Date.now()): boolean {
  if (!state || !state.lastReviewed) return true;
  return (state.dueDate ?? 0) <= now;
}

export function daysUntilDue(state: PartialReviewState, now: number = Date.now()): number {
  if (!state || !state.lastReviewed) return 0;
  return Math.ceil(((state.dueDate ?? 0) - now) / (24 * 60 * 60 * 1000));
}
