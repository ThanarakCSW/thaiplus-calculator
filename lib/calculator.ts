export const MAX_SATANG = 9_999_999_999;
export const DAILY_LIMIT = 20_000;

export function isMoneyInputText(value: string): boolean {
  return /^[0-9๐-๙.,\s]*$/.test(value);
}

export function maximumPurchaseForBalance(balance: number): number {
  if (!Number.isSafeInteger(balance) || balance < 0 || balance > MAX_SATANG) throw new RangeError("Invalid satang balance");
  // Exact upper bound for the same nearest-satang subsidy rounding used below.
  return Math.floor((Math.min(balance, DAILY_LIMIT) * 5 + 2) / 3);
}

export function parseMoney(raw: string, positive = false): { value: number | null; error: string | null } {
  const text = raw.trim().replace(/[๐-๙]/g, character => String(character.charCodeAt(0) - 0x0e50));
  if (!text) return { value: null, error: null };
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{0,2})?$/.test(text)) {
    return { value: null, error: "กรอกจำนวนเงินตั้งแต่ 0 ขึ้นไป ทศนิยมไม่เกิน 2 ตำแหน่ง" };
  }
  const [whole, fraction = ""] = text.replaceAll(",", "").split(".");
  const value = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(value) || value > MAX_SATANG) return { value: null, error: "กรอกจำนวนเงินไม่เกิน 99,999,999.99 บาท" };
  if (positive && value === 0) return { value: null, error: "ยอดซื้อรวมต้องมากกว่า 0 บาท" };
  return { value, error: null };
}

export function parseDailyBalance(raw: string) {
  const parsed = parseMoney(raw);
  if (parsed.value !== null && parsed.value > DAILY_LIMIT) return { value: null, error: "สิทธิ์วันนี้ต้องไม่เกิน 200 บาท" };
  return parsed;
}

export function calculate(purchase: number, balance: number) {
  if (![purchase, balance].every(value => Number.isSafeInteger(value) && value >= 0 && value <= MAX_SATANG) || purchase === 0) throw new RangeError("Invalid satang amounts");
  const normalSubsidy = Math.floor((purchase * 3 + 2) / 5);
  const available = Math.min(balance, DAILY_LIMIT);
  const government = Math.min(normalSubsidy, available);
  return { purchase, government, user: purchase - government, extra: normalSubsidy - government, baseUser: purchase - normalSubsidy, remaining: available - government, available };
}

export function formatMoney(satang: number): string {
  return `${Math.floor(satang / 100).toLocaleString("th-TH")}.${String(satang % 100).padStart(2, "0")}`;
}
