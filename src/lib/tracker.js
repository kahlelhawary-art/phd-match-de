/**
 * Tracker store — manages PhD applications across the Kanban pipeline.
 * Persisted in localStorage. Designed for clean migration to Supabase later
 * (each application has a stable id and timestamps).
 *
 * Application shape:
 *   {
 *     id: string                         // generated
 *     programmeId: string                // joins to programmes table
 *     status: 'interested' | 'contacted' | 'applied' | 'interview' | 'decision'
 *     fit: number | null                 // optional 0-100 score from Match
 *     nextAction: string | null
 *     nextActionDate: string | null      // ISO date YYYY-MM-DD
 *     deadline: string | null            // ISO date
 *     notes: string
 *     source: 'manual' | 'match' | 'discover'
 *     createdAt: string                  // ISO datetime
 *     updatedAt: string                  // ISO datetime
 *   }
 */

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'phd-match-tracker-v1';
export const COLUMNS = ['interested', 'contacted', 'applied', 'interview', 'decision'];

// ─── module-level subscriptions (simple pub/sub) ─────────
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

function persist(apps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  listeners.forEach((l) => l(apps));
}

function uid() {
  return 'app_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// ─── public API ──────────────────────────────────────────
export function useTracker() {
  const [apps, setApps] = useState(load);

  useEffect(() => {
    const l = (next) => setApps(next);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);

  const add = useCallback((input) => {
    const apps = load();
    // Allow multiple PIs from the same programme: deduplicate by (programmeId + piId)
    const piId = input.piId ?? null;
    const exists = apps.find((a) => a.programmeId === input.programmeId && (a.piId ?? null) === piId);
    if (exists) return null;

    const now = new Date().toISOString();
    const newApp = {
      id: uid(),
      programmeId: input.programmeId,
      piId,
      status: input.status ?? 'interested',
      fit: input.fit ?? null,
      nextAction: input.nextAction ?? null,
      nextActionDate: input.nextActionDate ?? null,
      deadline: input.deadline ?? null,
      notes: input.notes ?? '',
      source: input.source ?? 'manual',
      createdAt: now,
      updatedAt: now,
    };
    persist([...apps, newApp]);
    return newApp;
  }, []);

  const update = useCallback((id, patch) => {
    const apps = load();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx < 0) return;
    apps[idx] = { ...apps[idx], ...patch, updatedAt: new Date().toISOString() };
    persist(apps);
  }, []);

  const remove = useCallback((id) => {
    persist(load().filter((a) => a.id !== id));
  }, []);

  const move = useCallback((id, direction) => {
    const apps = load();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx < 0) return;
    const colIdx = COLUMNS.indexOf(apps[idx].status);
    const nextCol = COLUMNS[colIdx + direction];
    if (!nextCol) return;
    apps[idx] = { ...apps[idx], status: nextCol, updatedAt: new Date().toISOString() };
    persist(apps);
  }, []);

  const setStatus = useCallback((id, status) => {
    if (!COLUMNS.includes(status)) return;
    const apps = load();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx < 0) return;
    apps[idx] = { ...apps[idx], status, updatedAt: new Date().toISOString() };
    persist(apps);
  }, []);

  const findByProgramme = useCallback(
    (programmeId) => apps.find((a) => a.programmeId === programmeId) ?? null,
    [apps]
  );

  return { apps, add, update, remove, move, setStatus, findByProgramme };
}

/**
 * Convenience: ensure a programme (optionally with a specific PI) exists in
 * the tracker. Used by Discover, Match, and Labs save buttons.
 * Returns the application id.
 */
export function ensureInTracker({ programmeId, piId = null, source = 'manual', fit = null }) {
  const apps = load();
  const existing = apps.find(
    (a) => a.programmeId === programmeId && (a.piId ?? null) === piId
  );
  if (existing) return existing.id;

  const now = new Date().toISOString();
  const app = {
    id: uid(),
    programmeId,
    piId,
    status: 'interested',
    fit,
    nextAction: null,
    nextActionDate: null,
    deadline: null,
    notes: '',
    source,
    createdAt: now,
    updatedAt: now,
  };
  persist([...apps, app]);
  return app.id;
}

/**
 * Convenience: remove by programmeId + piId combo.
 * If piId is null, removes the programme-level entry.
 */
export function removeFromTrackerByProgramme(programmeId, piId = null) {
  const apps = load();
  persist(apps.filter((a) => !(a.programmeId === programmeId && (a.piId ?? null) === piId)));
}
