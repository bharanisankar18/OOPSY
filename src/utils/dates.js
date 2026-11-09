const DAY = 24 * 60 * 60 * 1000;

export const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const endOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const dayKey = (d) => {
  const x = new Date(d);
  const m = `${x.getMonth() + 1}`.padStart(2, '0');
  const day = `${x.getDate()}`.padStart(2, '0');
  return `${x.getFullYear()}-${m}-${day}`;
};

export const daysBetween = (a, b) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const monthShort = (i) => MONTHS[i];

export const formatDate = (iso) => {
  const d = new Date(iso);
  const diff = daysBetween(d, new Date());
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${sameYear ? '' : ` ${d.getFullYear()}`}`;
};

/** formatDate for use mid-sentence: "today", "yesterday", "26 Oct". */
export const formatDateInline = (iso) => {
  const s = formatDate(iso);
  return s === 'Today' || s === 'Yesterday' ? s.toLowerCase() : s;
};

export const formatLongDate = (d = new Date()) =>
  `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;

/** "10:42 am" */
export const formatTime = (d = new Date()) => {
  const x = new Date(d);
  const h = x.getHours();
  const m = `${x.getMinutes()}`.padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'am' : 'pm'}`;
};

/** "Today, 10:42 am" / "26 Oct, 4:05 pm" */
export const formatDateTime = (iso) => `${formatDate(iso)}, ${formatTime(iso)}`;

export const formatInDays = (iso) => {
  const diff = daysBetween(new Date(), iso);
  if (diff <= 0) return 'due today';
  if (diff === 1) return 'tomorrow';
  if (diff < 30) return `in ${diff} days`;
  const months = Math.round(diff / 30);
  return months === 1 ? 'in a month' : `in ${months} months`;
};

export const greeting = (d = new Date()) => {
  const h = d.getHours();
  if (h < 5) return 'Up late?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
