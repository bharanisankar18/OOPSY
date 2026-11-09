import { Platform } from 'react-native';
import { newReview } from './scheduler';
import { addDays } from './dates';

// Web-only preview helpers so screens can be screenshotted with sample data,
// e.g. http://localhost:8081/?demo=1&tab=Review. Never active on a phone.
const params = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search);
};

export const previewTab = () => params()?.get('tab') || undefined;
export const previewStack = () => params()?.get('screen') || undefined;
export const previewStep = () => {
  const v = params()?.get('step');
  return v ? Number(v) : undefined;
};
export const isDemo =() => params()?.get('demo') === '1';

const sample = [
  ['Started the assignment the night before', ['Procrastination', 'Poor planning'], 'Start the first 20 minutes the day it is assigned.', 'Studies', 'big', '😖', 2],
  ['Pushed to main without running tests', ['Rushed', 'Overconfidence'], 'Run the tests before every push, even tiny ones.', 'Coding', 'medium', '😬', 5],
  ['Bought headphones I did not need', ['Emotional decision'], 'Wait 48 hours before any purchase over 2,000.', 'Money', 'medium', '😔', 9],
  ['Scrolled reels instead of revising', ['Distraction', 'Procrastination'], 'Phone goes in another room during study blocks.', 'Studies', 'small', '😐', 14],
  ['Did not ask my senior about the API', ["Didn't ask for help"], 'Stuck for 30 minutes? Ask someone.', 'Work', 'small', '🙂', 21],
  ['Skipped breakfast before the exam', ['Poor planning'], 'Pack breakfast the night before exams.', 'Health', 'small', '😌', 40],
  ['Agreed to a trip I could not afford', ['Peer pressure'], 'It is fine to say "not this time".', 'Money', 'big', '😔', 70],
];

export const demoMistakes = () => {
  const now = new Date();
  return sample.map(([title, causes, lesson, category, severity, mood, ago], i) => {
    const createdAt = addDays(now, -ago).toISOString();
    const review = newReview(addDays(now, -ago));
    if (i === 1) Object.assign(review, { stage: 1, history: [{ date: addDays(now, -1).toISOString(), followed: true }] });
    if (i === 3) Object.assign(review, { stage: 2, slips: 1, nextReviewDate: addDays(now, 16).toISOString(), history: [{ date: now.toISOString(), followed: true }] });
    if (i >= 5) Object.assign(review, { stage: 4, history: [1, 7, 30, 90].map((d) => ({ date: addDays(now, -d).toISOString(), followed: true })) });
    return { id: `demo-${i}`, title, description: '', causes, lesson, category, severity, mood, createdAt, updatedAt: createdAt, review };
  });
};
