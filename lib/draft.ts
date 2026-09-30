export const STORAGE_KEY = "thai-plus:daily-draft:v1";

export type Draft = { version: 1; date: string; balance: string; purchase: string };

export function bangkokDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(value => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function freshDraft(date = bangkokDate()): Draft {
  return { version: 1, date, balance: "200", purchase: "" };
}

export function restoreDraft(raw: string | null, today = bangkokDate()): { draft: Draft; newDay: boolean } {
  const fallback = { draft: freshDraft(today), newDay: false };
  if (!raw) return fallback;
  try {
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== "object") return fallback;
    const item = saved as Partial<Draft>;
    if (item.version !== 1 || typeof item.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || typeof item.balance !== "string" || typeof item.purchase !== "string" || item.balance.length > 32 || item.purchase.length > 32) return fallback;
    if (item.date !== today) return { draft: freshDraft(today), newDay: true };
    return { draft: { version: 1, date: today, balance: item.balance, purchase: item.purchase }, newDay: false };
  } catch { return fallback; }
}
