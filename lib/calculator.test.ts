import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, isMoneyInputText, maximumPurchaseForBalance, parseDailyBalance, parseMoney, formatMoney, MAX_SATANG, DAILY_LIMIT } from "./calculator.ts";

test("government cap, extra payment and satang rounding", () => {
  const cases = [
    [10000, 6000, 6000, 4000, 0, 0],
    [10000, 5000, 5000, 5000, 1000, 0],
    [25000, 10000, 10000, 15000, 5000, 0],
    [10000, 100000, 6000, 4000, 0, 14000],
    [50000, 20000, 20000, 30000, 10000, 0],
    [50000, MAX_SATANG, 20000, 30000, 10000, 0],
    [33333, 20000, 20000, 13333, 0, 0],
    [33334, 20000, 20000, 13334, 0, 0],
    [33335, 20000, 20000, 13335, 1, 0],
    [10000, 0, 0, 10000, 6000, 0],
    [9999, 10000, 5999, 4000, 0, 4001],
    [10001, 10000, 6001, 4000, 0, 3999],
    [1, 100, 1, 0, 0, 99],
  ];
  for (const [purchase, balance, government, user, extra, remaining] of cases) {
    const actual = calculate(purchase, balance);
    assert.deepEqual([actual.government, actual.user, actual.extra, actual.remaining], [government, user, extra, remaining]);
    assert.equal(actual.government + actual.user, purchase);
    assert.equal(actual.baseUser + actual.extra, actual.user);
  }
});

test("validation distinguishes blanks and zero, and accepts valid money text", () => {
  for (const [raw, expected] of [["1,234.56", 123456], ["๙๙.๙๙", 9999], ["0", 0], ["0.01", 1], [" 100.5 ", 10050]] as const) assert.equal(parseMoney(raw).value, expected);
  assert.deepEqual(parseMoney(""), { value: null, error: null });
  assert.ok(parseMoney("0", true).error);
  assert.equal(parseMoney("1.").value, 100);
  for (const invalid of ["-1", "1.234", "abc", "1e3", "1,2", ".", "Infinity", "100000000", "999999999999999999"]) {
    assert.equal(parseMoney(invalid).value, null);
    assert.ok(parseMoney(invalid).error);
  }
  assert.equal(formatMoney(123456), "1,234.56");
});

test("all satang residues conserve total and obey subsidy cap", () => {
  for (let purchase = 1; purchase <= 2000; purchase++) {
    for (const balance of [0, 1, 5, 59, 600, MAX_SATANG]) {
      const result = calculate(purchase, balance);
      assert.equal(result.user + result.government, purchase);
      assert.equal(result.remaining + result.government, Math.min(balance, DAILY_LIMIT));
      assert.equal(result.baseUser + result.extra, result.user);
      assert.ok(result.government <= balance && result.government <= purchase);
      assert.ok(result.government <= DAILY_LIMIT);
    }
  }
  const max = calculate(MAX_SATANG, MAX_SATANG);
  assert.equal(max.user + max.government, MAX_SATANG);
  assert.throws(() => calculate(0, 0), RangeError);
});

test("daily balance permits zero, rejects values above 200 baht, and is not deducted by recalculation", () => {
  assert.equal(parseDailyBalance("0").value, 0);
  assert.equal(parseDailyBalance("๒๐๐.๐๐").value, DAILY_LIMIT);
  assert.equal(parseDailyBalance("200.01").value, null);
  assert.ok(parseDailyBalance("200.01").error);
  assert.equal(parseDailyBalance("").value, null);
  const balance = 20000;
  calculate(50000, balance);
  assert.equal(calculate(10000, balance).government, 6000);
  assert.equal(balance, 20000);
});

test("purchase capacity is the highest satang amount without a subsidy shortfall", () => {
  for (const balance of [0, 1, 2, 50, 100, 5000, 12345, 19999, 20000, MAX_SATANG]) {
    const capacity = maximumPurchaseForBalance(balance);
    if (capacity > 0) assert.equal(calculate(capacity, balance).extra, 0);
    assert.ok(calculate(capacity + 1, balance).extra > 0);
  }
  assert.equal(maximumPurchaseForBalance(20000), 33334);
  assert.equal(maximumPurchaseForBalance(0), 0);
});

test("input filter rejects letters and signs without changing the intended amount", () => {
  for (const value of ["", "200.", "100.50", "๑๒๓.๔๕", "1,000.00", " 100 "]) assert.ok(isMoneyInputText(value));
  for (const value of ["abc", "100บาท", "-100", "+10", "1e3", "100 USD", "฿200", "1/2", "๑ก"]) assert.equal(isMoneyInputText(value), false);
});
