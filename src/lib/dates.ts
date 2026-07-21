// Local-time date helpers. We key everything by 'YYYY-MM-DD' in the
// user's own timezone so the day rolls over at local midnight.

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

// Monday-based weekday index: Mon=0 ... Sun=6.
export function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

// The seven ISO dates of the week containing `ref`, Monday → Sunday.
export function weekDates(ref: Date = new Date()): string[] {
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - mondayIndex(ref));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toISO(d);
  });
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

// Parse a 'YYYY-MM-DD' string into a local Date (avoids UTC shift).
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function longDate(d: Date = new Date()): string {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function shortDate(iso: string): string {
  const d = fromISO(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// Simple non-crypto id (Math.random is fine here; not security-sensitive).
export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
