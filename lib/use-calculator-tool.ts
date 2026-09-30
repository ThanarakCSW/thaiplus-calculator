"use client";

import { useEffect } from "react";
import { flushSync } from "react-dom";
import { calculate, parseDailyBalance, parseMoney } from "./calculator";

type ModelContext = {
  registerTool: (tool: {
    name: string;
    title: string;
    description: string;
    inputSchema: object;
    annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
    execute: (input: unknown) => unknown;
  }, options: { signal: AbortSignal }) => void | Promise<void>;
};

export function useCalculatorTool(setBalance: (value: string) => void, setPurchase: (value: string) => void) {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name: "calculate_thai_plus",
        title: "คำนวณยอดแบ่งจ่าย ไทยช่วยไทย Plus",
        description: "Calculate the 60% government contribution capped by manually entered remaining daily subsidy (0–200 baht). Updates visible inputs and saves the draft to this browser's LocalStorage. Does not make a payment or deduct subsidy. Inputs are decimal strings in baht; output is integer satang.",
        inputSchema: { type: "object", properties: { balance: { type: "string", description: "Remaining subsidy for today, 0 to 200 baht" }, purchase: { type: "string", description: "Total purchase price in baht, greater than zero" } }, required: ["balance", "purchase"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Expected balance and purchase strings");
          const values = input as Record<string, unknown>;
          if (typeof values.balance !== "string" || typeof values.purchase !== "string" || Object.keys(values).some(key => key !== "balance" && key !== "purchase")) throw new Error("Expected only balance and purchase strings");
          const balance = parseDailyBalance(values.balance);
          const purchase = parseMoney(values.purchase, true);
          if (balance.value === null || purchase.value === null) throw new Error(balance.error || purchase.error || "Both amounts are required");
          const result = calculate(purchase.value, balance.value);
          flushSync(() => { setBalance(values.balance as string); setPurchase(values.purchase as string); });
          return { unit: "satang", ...result };
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch { /* The visible calculator also works without browser tool support. */ }
    return () => lifecycle.abort();
  }, [setBalance, setPurchase]);
}
