/**
 * Profile store — manages the candidate's saved profile.
 *
 * Storage strategy:
 *   - PRIMARY: localStorage (always-on, works offline, anonymous mode)
 *   - SYNC LAYER: Supabase (when configured AND user is authenticated)
 *
 * The two layers are kept independent:
 *   - Edits go to localStorage instantly (no network round-trips while typing)
 *   - Sync is explicit: user clicks "push to cloud" or "pull from cloud"
 *   - This avoids race conditions and the dreaded autosave-conflict scenario
 *
 * Profile shape (matches the `profiles` table in Supabase):
 *   {
 *     full_name, email, phone, city, linkedin, orcid, github,
 *     degree, university, graduation_year, thesis_title, thesis_supervisor, thesis_grade,
 *     publications: [string],
 *     cv_text,
 *     methods: [string], software: [string],
 *     languages: [{code, level}],
 *     fields_of_interest: [string],
 *     updated_at
 *   }
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase, hasSupabase } from './supabase.js';

const STORAGE_KEY = 'phd-match-profile-v1';
const SYNC_META_KEY = 'phd-match-profile-sync-meta';

const EMPTY_PROFILE = {
  full_name: '',
  email: '',
  phone: '',
  city: '',
  linkedin: '',
  orcid: '',
  github: '',
  degree: '',
  university: '',
  graduation_year: '',
  thesis_title: '',
  thesis_supervisor: '',
  thesis_grade: '',
  publications: [],
  cv_text: '',
  methods: [],
  software: [],
  languages: [],
  fields_of_interest: [],
  updated_at: null,
};

// ─── module-level pub/sub ─────────────────────────────────
const listeners = new Set();

function load() {
  if (typeof window === 'undefined') return { ...EMPTY_PROFILE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    return { ...EMPTY_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

function persist(profile) {
  const next = { ...profile, updated_at: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((l) => l(next));
  return next;
}

function loadSyncMeta() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_META_KEY)) ?? null;
  } catch {
    return null;
  }
}

function saveSyncMeta(meta) {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}

// ─── React hook ───────────────────────────────────────────
export function useProfile() {
  const [profile, setProfile] = useState(load);

  useEffect(() => {
    const l = (next) => setProfile(next);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);

  const update = useCallback((patch) => {
    persist({ ...load(), ...patch });
  }, []);

  const updateField = useCallback((key, value) => {
    persist({ ...load(), [key]: value });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SYNC_META_KEY);
    listeners.forEach((l) => l({ ...EMPTY_PROFILE }));
  }, []);

  return { profile, update, updateField, reset };
}

// ─── Auth helpers ─────────────────────────────────────────
export async function signIn(email, password) {
  if (!hasSupabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUp(email, password) {
  if (!hasSupabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  if (!hasSupabase) return;
  await supabase.auth.signOut();
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasSupabase) { setReady(true); return; }

    let alive = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (alive) {
        setUser(session?.user ?? null);
        setReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      alive = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, ready, hasSupabase };
}

// ─── Sync ─────────────────────────────────────────────────
/**
 * Push local profile to Supabase. Upserts on user_id.
 */
export async function pushToCloud(userId) {
  if (!hasSupabase) throw new Error('Supabase not configured');
  if (!userId) throw new Error('Not signed in');

  const local = load();
  const row = {
    user_id: userId,
    full_name: local.full_name || null,
    email: local.email || null,
    phone: local.phone || null,
    city: local.city || null,
    linkedin: local.linkedin || null,
    orcid: local.orcid || null,
    master_degree: local.degree || null,
    master_university: local.university || null,
    master_thesis_topic: local.thesis_title || null,
    cv_text: local.cv_text || null,
    fields_of_interest: local.fields_of_interest ?? [],
    languages: local.languages ?? [],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  saveSyncMeta({ last_pushed_at: new Date().toISOString(), userId });
  return data;
}

/**
 * Pull cloud profile into local storage (overwrites).
 */
export async function pullFromCloud(userId) {
  if (!hasSupabase) throw new Error('Supabase not configured');
  if (!userId) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;  // nothing in cloud yet

  // Map back to local shape
  const merged = {
    ...load(),
    full_name: data.full_name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    city: data.city ?? '',
    linkedin: data.linkedin ?? '',
    orcid: data.orcid ?? '',
    degree: data.master_degree ?? '',
    university: data.master_university ?? '',
    thesis_title: data.master_thesis_topic ?? '',
    cv_text: data.cv_text ?? '',
    fields_of_interest: data.fields_of_interest ?? [],
    languages: data.languages ?? [],
  };
  persist(merged);
  saveSyncMeta({ last_pulled_at: new Date().toISOString(), userId });
  return merged;
}

export function getSyncMeta() {
  return loadSyncMeta();
}

// ─── Cross-module helper: read profile synchronously ──────
/**
 * Used by CV-Match / Letter / Outreach to fetch the saved CV
 * without needing the React hook.
 */
export function readProfileSync() {
  return load();
}
