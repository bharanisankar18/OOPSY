import { isMastered, reviewStreak } from './scheduler';
import { monthShort } from './dates';

const tally = (items) => {
  const map = {};
  items.forEach((k) => {
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
};

export const computeInsights = (mistakes, now = new Date()) => {
  const causes = tally(mistakes.flatMap((m) => m.causes));
  const categories = tally(mistakes.map((m) => m.category));

  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = mistakes.filter((m) => {
      const c = new Date(m.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    months.push({ label: monthShort(d.getMonth()), count, current: i === 0 });
  }

  const thisMonth = months[5].count;
  const lastMonth = months[4].count;
  let trend = 'flat';
  if (thisMonth < lastMonth) trend = 'down';
  else if (thisMonth > lastMonth) trend = 'up';

  const totalSlips = mistakes.reduce((s, m) => s + m.review.slips, 0);
  const reviews = mistakes.reduce((s, m) => s + m.review.history.length, 0);
  const followed = mistakes.reduce(
    (s, m) => s + m.review.history.filter((h) => h.followed).length,
    0,
  );

  return {
    total: mistakes.length,
    topCause: causes[0] || null,
    causes,
    topCategory: categories[0] || null,
    categories,
    months,
    thisMonth,
    lastMonth,
    trend,
    mastered: mistakes.filter(isMastered).length,
    streak: reviewStreak(mistakes, now),
    totalSlips,
    reviews,
    followRate: reviews ? Math.round((followed / reviews) * 100) : null,
  };
};
