/**
 * Interview history store.
 *
 * Persists past mock-interview evaluations so the candidate can track
 * improvement over time. Same pub/sub-over-localStorage pattern as
 * tracker.js and profile.js.
 *
 * Record shape:
 *   {
 *     id: string,
 *     field: string,            // the research field interviewed in
 *     lang: 'de' | 'en' | 'ar', // interview language
 *     score: number,            // 0-100
 *     strengths: string[],
 *     improve: string[],
 *     tips: string[],
 *     transcript: [{ role, content }],  // full Q&A, system messages stripped
 *     createdAt: string,        // ISO datetime
 *   }
 */

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'phd-match-interview-history-v1';
const MAX_RECORDS = 50;

const listeners = new Set();

function load() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  listeners.forEach((l) => l(records));
}

function uid() {
  return 'iv_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function useInterviewHistory() {
  const [records, setRecords] = useState(load);

  useEffect(() => {
    const l = (next) => setRecords(next);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);

  const save = useCallback((input) => {
    const records = load();
    const record = {
      id: uid(),
      field: input.field ?? '',
      lang: input.lang ?? 'en',
      score: input.score ?? 0,
      strengths: input.strengths ?? [],
      improve: input.improve ?? [],
      tips: input.tips ?? [],
      transcript: input.transcript ?? [],
      createdAt: new Date().toISOString(),
    };
    persist([record, ...records].slice(0, MAX_RECORDS));
    return record.id;
  }, []);

  const remove = useCallback((id) => {
    persist(load().filter((r) => r.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    persist([]);
  }, []);

  return { records, save, remove, clearAll };
}
