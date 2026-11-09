import { REPEAT_WINDOW_DAYS } from './constants';
import { addDays, ordinal } from './dates';

/**
 * Looks at mistakes in the last 30 days (relative to `target.createdAt`) that share
 * a cause or the category with `target`. Returns null when there's no pattern.
 */
export const detectRepeat = (target, allMistakes) => {
  const ref = new Date(target.createdAt);
  const since = addDays(ref, -REPEAT_WINDOW_DAYS);
  const recent = allMistakes.filter((m) => {
    if (m.id === target.id) return false;
    const d = new Date(m.createdAt);
    return d >= since && d <= ref;
  });

  const causeCounts = target.causes
    .map((cause) => ({
      cause,
      matches: recent.filter((m) => m.causes.includes(cause)),
    }))
    .filter((c) => c.matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length);

  const categoryMatches = recent.filter((m) => m.category === target.category);

  if (causeCounts.length === 0 && categoryMatches.length === 0) return null;

  const related = new Map();
  causeCounts.forEach((c) => c.matches.forEach((m) => related.set(m.id, m)));
  categoryMatches.forEach((m) => related.set(m.id, m));
  const relatedList = [...related.values()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  let message;
  if (causeCounts.length > 0) {
    const top = causeCounts[0];
    const n = top.matches.length + 1;
    message = `This is your ${ordinal(n)} ${top.cause.toLowerCase()} mistake this month.`;
  } else {
    const n = categoryMatches.length + 1;
    message = `This is your ${ordinal(n)} ${target.category.toLowerCase()} mistake this month.`;
  }

  return {
    message,
    cause: causeCounts[0]?.cause ?? null,
    category: categoryMatches.length > 0 ? target.category : null,
    count: (causeCounts[0]?.matches.length ?? categoryMatches.length) + 1,
    related: relatedList,
    sourceId: target.id,
  };
};

/** The newest mistake that forms a pattern within the last 30 days, for the Home card. */
export const latestRepeat = (mistakes, now = new Date()) => {
  const since = addDays(now, -REPEAT_WINDOW_DAYS);
  const sorted = [...mistakes]
    .filter((m) => new Date(m.createdAt) >= since)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  for (const m of sorted) {
    const hit = detectRepeat(m, mistakes);
    if (hit) return hit;
  }
  return null;
};
