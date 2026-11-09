import { REVIEW_INTERVALS, MASTERED_STAGE } from './constants';
import { addDays, endOfDay, startOfDay, dayKey, daysBetween } from './dates';

// nextReviewDate is anchored to the start of the target day so a lesson
// becomes due as soon as that day begins.
const dueOn = (from, days) => startOfDay(addDays(from, days)).toISOString();

export const newReview = (createdAt = new Date()) => ({
  stage: 0,
  nextReviewDate: dueOn(createdAt, REVIEW_INTERVALS[0]),
  slips: 0,
  history: [],
});

export const isMastered = (m) => m.review.stage >= MASTERED_STAGE;

export const isDue = (m, now = new Date()) =>
  !isMastered(m) && new Date(m.review.nextReviewDate) <= endOfDay(now);

export const dueLessons = (mistakes, now = new Date()) =>
  mistakes
    .filter((m) => isDue(m, now))
    .sort((a, b) => new Date(a.review.nextReviewDate) - new Date(b.review.nextReviewDate));

/**
 * Yes  -> advance one stage (1d -> 7d -> 30d -> 90d -> mastered)
 * No   -> back to stage 0 (review tomorrow) and count a slip
 */
export const applyReview = (mistake, followed, now = new Date()) => {
  const r = mistake.review;
  const history = [...r.history, { date: now.toISOString(), followed }];
  if (followed) {
    const stage = Math.min(r.stage + 1, MASTERED_STAGE);
    const nextReviewDate =
      stage >= MASTERED_STAGE ? r.nextReviewDate : dueOn(now, REVIEW_INTERVALS[stage]);
    return { ...mistake, review: { ...r, stage, nextReviewDate, history }, updatedAt: now.toISOString() };
  }
  return {
    ...mistake,
    review: { ...r, stage: 0, nextReviewDate: dueOn(now, REVIEW_INTERVALS[0]), slips: r.slips + 1, history },
    updatedAt: now.toISOString(),
  };
};

export const stageLabel = (stage) =>
  stage >= MASTERED_STAGE ? 'Mastered' : `${REVIEW_INTERVALS[stage]}-day check`;

/** Consecutive days (ending today, or yesterday if today isn't done yet) with at least one review. */
export const reviewStreak = (mistakes, now = new Date()) => {
  const days = new Set();
  mistakes.forEach((m) => m.review.history.forEach((h) => days.add(dayKey(h.date))));
  if (days.size === 0) return 0;
  let cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
};

export const reviewedToday = (mistakes, now = new Date()) =>
  mistakes.some((m) => m.review.history.some((h) => daysBetween(h.date, now) === 0));

/** How many lessons will be due on each of the next `days` days, assuming no reviews happen. */
export const dueForecast = (mistakes, days = 7, now = new Date()) =>
  Array.from({ length: days }, (_, i) => {
    const day = addDays(now, i);
    return { date: day, count: mistakes.filter((m) => isDue(m, day)).length };
  });
