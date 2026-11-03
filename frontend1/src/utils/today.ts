const pad = (n: number) => String(n).padStart(2, '0');

/** yyyy-mm-dd in the browser's local timezone. */
export const toISO = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDaysISO = (days: number, from: Date = new Date()): string => {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + days);
  return toISO(d);
};

export const todayISO = (): string => toISO(new Date());
