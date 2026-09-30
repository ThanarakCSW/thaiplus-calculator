"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bangkokDate, freshDraft, restoreDraft, STORAGE_KEY, type Draft } from "./draft";

export function useDailyDraft() {
  const [draft, setDraft] = useState<Draft>(() => freshDraft());
  const [ready, setReady] = useState(false);
  const [storageStatus, setStorageStatus] = useState<"loading" | "saving" | "saved" | "unavailable">("loading");
  const [newDay, setNewDay] = useState(false);
  const current = useRef(draft);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((next: Draft) => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageStatus("saving");
      savedTimer.current = setTimeout(() => setStorageStatus("saved"), 450);
    } catch { setStorageStatus("unavailable"); }
  }, []);

  const update = useCallback((values: Partial<Pick<Draft, "balance" | "purchase">>) => {
    const today = bangkokDate();
    const changedDay = current.current.date !== today;
    const next = { ...(changedDay ? freshDraft(today) : current.current), ...values };
    if (changedDay) setNewDay(true);
    current.current = next;
    setDraft(next);
    persist(next);
  }, [persist]);

  useEffect(() => {
    try {
      const restored = restoreDraft(localStorage.getItem(STORAGE_KEY));
      current.current = restored.draft;
      setDraft(restored.draft);
      setNewDay(restored.newDay);
      persist(restored.draft);
    } catch { setStorageStatus("unavailable"); }
    setReady(true);
    const checkDate = () => {
      const today = bangkokDate();
      if (current.current.date === today) return;
      const next = freshDraft(today);
      current.current = next;
      setDraft(next);
      setNewDay(true);
      persist(next);
    };
    const timer = setInterval(checkDate, 30_000);
    window.addEventListener("focus", checkDate);
    window.addEventListener("pageshow", checkDate);
    document.addEventListener("visibilitychange", checkDate);
    return () => {
      clearInterval(timer);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      window.removeEventListener("focus", checkDate);
      window.removeEventListener("pageshow", checkDate);
      document.removeEventListener("visibilitychange", checkDate);
    };
  }, [persist]);

  const setBalance = useCallback((balance: string) => update({ balance }), [update]);
  const setPurchase = useCallback((purchase: string) => update({ purchase }), [update]);
  const clearData = useCallback(() => {
    const next = freshDraft();
    current.current = next;
    setDraft(next);
    setNewDay(false);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    try { localStorage.removeItem(STORAGE_KEY); setStorageStatus("saved"); }
    catch { setStorageStatus("unavailable"); }
  }, []);

  return { ...draft, ready, newDay, storageStatus, setBalance, setPurchase, clearData };
}
