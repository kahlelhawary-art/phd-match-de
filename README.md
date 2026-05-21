# PhD Match DE

> Kuratierte Promotionsstellen in Krebs-, Immun- und Neurowissenschaften — Deutschland.

A curated platform for finding PhD positions in cancer research, immunology, and neuroscience across Germany. AI-assisted CV-to-lab matching, Anschreiben generation, application tracker, and direct PI outreach composer.

Built by **Nexus Tech** · Khalel Hawary · 2026

---

## ✦ Stack

- **Vite + React 18** — fast dev, optimised production build
- **Tailwind CSS** — design tokens for the *Editorial Scientific* aesthetic
- **Supabase** (Frankfurt region) — Postgres backend for programmes, PIs, applications
- **Anthropic Claude API** — CV matching, cover letter generation, outreach drafting
- **React Router** — multi-page SPA
- **i18n** — three languages: German, English, Arabic (with RTL)

## ✦ Design language

*Editorial Scientific* — cream paper, ink black, Oxford navy + burnt sienna accents.
- Display: **Fraunces** (variable, optical-sizing, soft variation axis)
- Body: **Geist** (sans) + **Geist Mono** for metadata
- Drop caps for hero paragraphs, Roman numeral section markers, marginalia tags
- Subtle SVG paper grain texture overlay

## ✦ Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ANTHROPIC_KEY

# 3. (Optional) Set up Supabase database
# In your Supabase project's SQL editor, run:
#   1. supabase/schema.sql   — creates tables, types, indexes, RLS
#   2. supabase/seed.sql     — populates ~14 programmes + 12 institutions

# 4. Run dev server
npm run dev          # → http://localhost:5173

# 5. Build for production
npm run build        # → dist/
```

> **Note:** The app works without Supabase configured — it falls back to seed data in `src/data/seed.js`. This means you can demo the Discover page immediately after `npm run dev`.

## ✦ Project structure

```
phd-match-de/
├── index.html
├── vite.config.js
├── tailwind.config.js          ← design tokens (colours, fonts, animations)
├── supabase/
│   ├── schema.sql              ← 8 tables: institutions, programmes, pis, profiles,
│   │                              applications, cover_letters, outreach, saved_items
│   └── seed.sql                ← 12 institutions + 14 real programmes
├── src/
│   ├── main.jsx
│   ├── App.jsx                 ← router shell
│   ├── index.css               ← editorial CSS layer + paper grain
│   ├── data/
│   │   ├── seed.js
│   │   ├── researchTools.js
│   │   ├── library.js
│   │   └── pis.js              ← 45 real, named PIs
│   ├── components/
│   │   ├── …
│   │   └── LabCard.jsx         ← PI / lab card with recent-papers list
│   └── pages/
│       ├── Discover.jsx        ← ✅
│       ├── Compass.jsx         ← ✅
│       ├── Library.jsx         ← ✅
│       ├── Labs.jsx            ← ✅ 45 named PIs with filters
│       ├── Match.jsx           ← ✅
│       ├── Tracker.jsx         ← ✅
│       ├── Letter.jsx          ← ✅
│       ├── Outreach.jsx        ← ✅
│       └── Profile.jsx         ← ✅
```

## ✦ Roadmap

| Phase | Module | Status |
|-------|--------|:------:|
| 1 | Foundations + Discover page | ✅ shipped |
| 2 | **Compass** — PhD literacy guide (6 modules) | ✅ shipped |
| 3 | **Library** — Curated landmark papers, textbooks, courses, funding, conferences, databases, podcasts | ✅ shipped |
| 4 | **CV-Match** — Claude-powered ranking of programmes against CV | ✅ shipped |
| 5 | **Tracker** — Kanban pipeline | ✅ shipped |
| 6 | **Letter** — German Anschreiben generator | ✅ shipped |
| 7 | **Outreach** — Initiative emails to PIs with three strategies | ✅ shipped |
| 8 | **Profile + Auth** — Persistent candidate profile with Supabase sync | ✅ shipped |
| 9 | **Labs** — 45 named PIs across 12 institutions with research focus, recent papers, lab URLs | ✅ shipped |
| Later | Edge Function proxy for Claude API (production hardening) | ⏳ |
| Later | PDF upload in Profile (auto-extract CV text from PDF) | ⏳ |

## ✦ The Labs module

The most actionable expansion of the platform. Until now, users browsed *programmes* — useful, but in Germany every successful PhD eventually lands at a **specific person's** lab. The Labs module is a curated directory of 45 real, named research-group leaders across the 12 institutions in the catalogue.

**Each lab entry includes:**
- Full name with title (Prof. Dr., PD Dr., Dr.)
- Institution and city
- Research focus paragraph (trilingual: DE / EN / AR — all native quality, not machine-translated)
- Field tags
- Lab website URL
- Recent papers with journal + year + DOI URL where verified
- Accepting-students status (with pulsing sage dot)
- Optional notes (joint appointments, ERC grants, founding directorships)

**Page features:**
- Hero with eyebrow + Fraunces display title + drop-cap lead
- Sticky filter sidebar: institution short-names (vertical list), field tags, city tags, "accepting students only" checkbox, plus a full-text search bar
- 2-column responsive card grid with staggered fade-up animation
- Result counter `{filtered} / {total}` in display Fraunces

**Cross-module integration:**
- **Save to Tracker** — each PI is independently trackable. The Tracker schema now supports `piId` so two PIs from the same programme each get their own card. TrackerCard displays the PI name in italic sienna below the programme name when present.
- **Draft Outreach** — clicking ✎ on a LabCard navigates to `/outreach` with the programme, PI name, and lab focus pre-filled via sessionStorage. The Outreach composer picks these up automatically on mount.

**Data integrity rules** (`src/data/pis.js`):
- Every PI is a real, publicly-listed researcher as of 2025-2026
- Information sourced from official institution websites and recent papers
- Email addresses intentionally omitted (set to `null`) unless explicitly published — to protect privacy and avoid sending users to outdated contacts
- No invented papers, no invented DOIs

**Distribution across 12 institutions:**
DKFZ (8) · DZNE (6) · MPI Brain Research (4) · MPI-IE Freiburg (3) · Goethe Frankfurt (3) · RUB Bochum (4) · TU Dortmund (3) · Uni Bonn (6) · Uni Heidelberg (5) · Uni Bielefeld (2) · Charité Berlin (6) · EMBL Heidelberg (3) — **45 total**.

## ✦ The Profile module

The final piece of the core platform — turns *PhD Match DE* from a session-based toolkit into a persistent home for the candidate's job-hunt data.

**Four tabs:**
- **01 Identity** — Name, email, phone, city, LinkedIn, ORCID, GitHub
- **02 Academic** — Highest degree, university, graduation year, master thesis title + supervisor + grade, publications (one per line)
- **03 CV & skills** — Full CV text, methods (chip-tagged), software (chip-tagged), languages with CEFR levels, research interests
- **04 Account** — Supabase Auth (sign in / sign up / sign out) + cloud sync controls

**Two-tier storage:**
- **PRIMARY (always-on):** localStorage. Edits save instantly as the user types. Works offline. No account required.
- **SYNC LAYER (when Supabase + signed in):** Explicit push/pull via two buttons. Avoids the autosave-conflict trap by keeping cloud sync user-initiated.

**Cross-module integration.** When the user has saved a CV in Profile, it now auto-populates:
- **CV-Match** CV textarea (with a small "✦ From your Profile" badge)
- **Letter** "paste CV" mode fallback
- **Outreach** "paste CV" mode fallback
- **CV-Match interests field** is pre-filled from `profile.fields_of_interest`

**Auth flow** (`src/lib/profile.js`):
- `useAuth()` hook subscribes to Supabase auth state changes
- `signIn / signUp / signOut` thin wrappers
- `pushToCloud(userId)` upserts to the `profiles` table by `user_id`
- `pullFromCloud(userId)` reads and overwrites the local profile
- Both update a sync-meta log so the UI can show "last synced" timestamps

**Local-only mode** is fully supported — if `VITE_SUPABASE_URL` is missing, the Account tab shows a clear "Local-only mode" notice and the rest of the profile works unchanged.

**Danger zone** at the bottom of Account: clear-all-profile-data button with native confirm dialogue. Tracker, saved letters, and outreach log are kept separately (each module owns its own storage).

## ✦ The Outreach module

The most consequential feature for German PhD-hunting. ~70% of life-sciences PhD positions in Germany are filled via direct contact with professors **before** the position is advertised. This module gives the candidate a turnkey way to open that door.

**Three strategies** baked into the system prompt:
- **Inquiry** (~120-140 words) — The polite first contact. "Are you accepting doctoral students?" Best when you don't yet know a specific paper.
- **Specific paper** (~150-180 words) — References a concrete publication. Strongest impact, demands homework. Requires a paper reference field.
- **Methods bridge** (~140-170 words) — Connects the candidate's technical strengths to the lab's methodology. Best for candidates with strong technical profiles.

**Recipient setup** — programme picker (Tracker or full catalogue), PI name, optional PI email (enables the `mailto:` button), and a one-line lab focus description.

**Generation** — produces 1, 2, or 3 subtly different variants in one Claude call, with different rhetorical framings (not just word swaps). Each variant is shown side-by-side with a coloured top border (navy / sienna / sage).

**Per-variant actions:**
- Inline editing of subject and body
- Copy (subject + body in one block)
- Open in mail client (uses `mailto:` with PI email pre-filled)
- Save to outreach log

**Outreach log:**
- All saved emails persist in localStorage (capped at 50)
- Each entry shows institution, strategy, language, subject, and date
- "Got a reply" toggle turns the card sage and tracks responses
- Load brings any past email back into the editor for follow-ups

**System prompt highlights** (`src/lib/outreach.js`):
- Sie-Form throughout German variants
- Subject lines must reference research topic, never "PhD application"
- Hard 200-word ceiling per variant body
- Never invents papers, methods, or experiences not in the candidate profile
- Method names used verbatim from the candidate's profile

## ✦ The Letter module

A three-step Anschreiben generator that drafts native-quality German cover letters (or English equivalents) tailored to a specific programme.

**Step 1 — Pick programme.** Choose from your Tracker (default) or the full programme catalogue, with instant search.

**Step 2 — Settings.** Three controls:
- **Tone**: formal (academic), warm (personal), research (methods-led)
- **Language**: German or English
- **Profile source**: pull from your most recent CV-Match (preferred — Claude already parsed your methods, topics, languages) or paste a fresh CV
- **Extra notes**: free text for "I read their 2024 paper on X" or "I met Dr. Y at a conference"

**Step 3 — Letter.** Claude returns `{ subject, body }`. Both are editable inline. The body sits in a monospaced editor styled to look like a real Anschreiben, with proper 1.7 line-height and a 24-row default. Actions:
- **Copy** — copies subject + body to clipboard in one block
- **Regenerate** — re-runs with same settings (useful if you tweak the tone)
- **Save revision** — persists the version with timestamp, tone, language, and programme

**Revisions.** Below Step 3, all saved revisions appear as cards (capped at 30). Click "Load" to bring any back into the editor.

**System prompt highlights** (`src/lib/letter.js`):
- Strict German Anschreiben conventions: header → date → recipient → Betreff → Salutation → 3-4 paragraphs → Mit freundlichen Grüßen
- Sie-Form throughout
- Never invents publications, experiences, or language levels not in the CV
- Uses the candidate's specific method names in the bridge paragraph
- Hard length target: 280-380 words for the body

## ✦ The Tracker module

A five-column Kanban pipeline for managing PhD applications end-to-end. Built with a clean store layer in `src/lib/tracker.js` that uses a pub/sub pattern over localStorage — every page using `useTracker()` stays in sync automatically.

**Columns:** Interested → Contacted → Applied → Interview → Decision

**Card features:**
- Programme title, institution, city (mono-spaced metadata)
- Optional fit score from CV-Match (colour-coded: sage / navy / ochre / muted)
- Next-action editor with date picker
- Persistent notes textarea
- Forward/back arrow buttons (RTL-aware)
- "From CV-Match" badge for matches added via the matching workflow

**Pipeline-wide:**
- Stats bar: total applications, active applications, next upcoming deadline
- "Add programme" modal with full-catalogue search and column picker
- Empty state with smart CTAs (run a Match, browse Discover)

**Integration:** Saving from Discover (`onSave`) or Match (the bookmark button on each MatchCard) now writes directly to the tracker store via `ensureInTracker({ programmeId, source, fit })`. Re-clicking removes via `removeFromTrackerByProgramme(programmeId)`. State is shared across pages without a context provider — the pub/sub layer handles updates.

## ✦ The CV-Match module

The signature feature of the platform. A three-step workflow that ranks every programme against the candidate's CV using Claude in two stages:

**Stage 1 — Profile extraction.** Claude parses the CV into a structured JSON profile: degree, current status, methods, software, topics, publications, languages, interests, experience strengths, and potential gaps.

**Stage 2 — Programme ranking.** Claude receives the profile and the compact programme catalogue, then returns a ranked list with `score` (0-100), `strengths`, `gaps`, `reasoning` paragraph, and concrete `tips` for the application — for every programme.

The two-stage architecture has three benefits: (a) the profile is reusable downstream (Anschreiben generator, Outreach composer), (b) each call stays within reasonable token budgets, and (c) the profile JSON makes it easy to debug what Claude saw in the CV.

Results are persisted in localStorage and the top 2 matches auto-expand. Each match card shows a circular score dial that colour-codes the fit (sage 85+, navy 70+, ochre 55+, muted 40+). The Profile Summary panel sits at the top of the results as a sanity check.

## ✦ The Library module

A curated knowledge hub built directly into the app. **Every entry is real, with verified citations, DOIs, and URLs.** Eight sub-sections:

1. **Key papers** — 20+ landmark papers across cancer, immunology, neuroscience, methods, and career — each with full citation, DOI, and a "why read this" note. Includes Hanahan's *Hallmarks of Cancer* (2000, 2011, 2022), Schreiber's immunoediting, Wherry's T-cell exhaustion, Bliss & Collingridge's LTP, Iadecola's neurovascular unit, Stuart's Seurat single-cell integration, and more.
2. **5-week starter reading path** — A structured 5-paper sequence per field, with notes on why each comes in that order. Filterable by cancer / immunology / neuroscience.
3. **Textbooks** — 9 reference works including Janeway's *Immunobiology* (10th ed, 2022), Kandel's *Principles of Neural Science* (6th ed, 2021), Weinberg's *Biology of Cancer*, Alberts' *Molecular Biology of the Cell* (7th ed, 2022), and more.
4. **Online courses** — 11 free/audit-free courses including MIT OpenCourseWare (7.23 Immunology, 9.13 The Human Brain, 7.016 Biology), HHMI BioInteractive, Coursera specializations, EMBL-EBI training, Rosalind, Neuromatch Academy, and CSHL.
5. **Funding** — 8 scholarship and stipend pathways: DAAD Doctoral Programmes, DAAD GSSP, Helmholtz International Graduate Schools, IMPRS, DFG Graduiertenkollegs, EMBL EIPP, Humboldt Foundation, Studienstiftung — with eligibility, amount, duration, deadline, and direct URLs.
6. **Conferences** — 8 key German and European meetings: DGfI, Deutscher Krebskongress, NWG Göttingen, FENS Forum, EACR Congress, ECI, Lindau Nobel Laureate Meeting, EMBO Courses & Workshops.
7. **Databases** — 13 data repositories: TCGA, cBioPortal, CCLE, DepMap, ImmPort, Human Protein Atlas, Allen Brain Atlas, Human Connectome Project, UK Biobank, UniProt, GO, GTEx, Ensembl, STRING.
8. **Podcasts & newsletters** — 5 podcasts + 4 newsletters to stay current.

## ✦ The Compass module

The Compass section is a full PhD-literacy guide built directly into the app — designed so users don't disappear into months of unfocused research before they apply. Six sub-modules:

1. **Basics** — Side-by-side comparison of Structured vs. Individual PhD paths, the 5 phases of a German doctorate
2. **Research & Literature** — 16 curated research tools (PubMed, bioRxiv, Connected Papers, Zotero, Obsidian, TCGA, UniProt…) grouped by category, plus a recommended workflow
3. **Research Fields** — Deep overviews of cancer, immunology, neuroscience: sub-areas, key journals, leading German institutions, recommended PubMed search terms
4. **Writing & Proposal** — Anatomy of a German Exposé, motivation letter structure, monograph vs cumulative dissertation
5. **Timeline** — Realistic 36-month visual timeline with month-by-month milestones
6. **AI Research Assistant** — A Claude-powered chat tuned with a system prompt that grounds the model in German life-sciences PhD context (institutions, funding, methods, timelines). Persists conversation in localStorage.

## ✦ Disclaimer

Programme information is curated but provided without guarantee. Application deadlines and funding conditions change yearly — **always verify on the official programme website** before applying.

---

## ✦ بالعربية

منصة مُنتقاة لإيجاد فرص الدكتوراه في أبحاث السرطان وعلم المناعة وعلم الأعصاب في ألمانيا. تطبيق React + Vite + Tailwind + Supabase + Claude API، ثلاثي اللغة (ألماني/إنجليزي/عربي مع RTL).

**التشغيل السريع:**
1. `npm install`
2. انسخ `.env.example` إلى `.env` واملأ المفاتيح
3. (اختياري) شغّل ملفات `supabase/schema.sql` و `supabase/seed.sql` في Supabase SQL editor
4. `npm run dev`

يعمل التطبيق بدون Supabase — يستخدم بيانات seed محلية كـ fallback.
