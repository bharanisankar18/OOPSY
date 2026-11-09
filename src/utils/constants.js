export const DEFAULT_CAUSES = [
  'Procrastination',
  'Overconfidence',
  'Rushed',
  "Didn't ask for help",
  'Emotional decision',
  'Lack of knowledge',
  'Distraction',
  'Poor planning',
  'Peer pressure',
];

export const DEFAULT_CATEGORIES = [
  'Studies',
  'Coding',
  'Money',
  'Relationships',
  'Health',
  'Work',
  'Personal',
];

export const CATEGORY_ICONS = {
  Studies: 'book-outline',
  Coding: 'code-slash-outline',
  Money: 'wallet-outline',
  Relationships: 'people-outline',
  Health: 'fitness-outline',
  Work: 'briefcase-outline',
  Personal: 'person-outline',
};

export const categoryIcon = (c) => CATEGORY_ICONS[c] || 'pricetag-outline';

export const SEVERITIES = [
  { key: 'small', label: 'Small', hint: 'A tiny slip' },
  { key: 'medium', label: 'Medium', hint: 'Stung a bit' },
  { key: 'big', label: 'Big', hint: 'That one hurt' },
];

// Ordered from rough to calm so the mood slider reads left to right.
export const MOODS = [
  { emoji: '😖', key: 'frustrated', label: 'Frustrated', face: 'upset' },
  { emoji: '😔', key: 'down', label: 'Down', face: 'sad' },
  { emoji: '😬', key: 'awkward', label: 'Awkward', face: 'oops' },
  { emoji: '😐', key: 'meh', label: 'Meh', face: 'meh' },
  { emoji: '🙂', key: 'okay', label: 'Okay', face: 'calm' },
  { emoji: '😌', key: 'atpeace', label: 'At peace', face: 'happy' },
];

export const moodByEmoji = (e) => MOODS.find((m) => m.emoji === e);

export const REVIEW_INTERVALS = [1, 7, 30, 90];
export const MASTERED_STAGE = 4;
export const REPEAT_WINDOW_DAYS = 30;
