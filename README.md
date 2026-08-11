# SYJ PropertySync

**Property Listing Synchronization & Automation** — an interactive proof-of-concept prepared for **Turun Seudun Vuokravälitys Oy (TSVV)**, Turku, Finland.

A SAYANJALI NEXUS demonstration.

> ⚠️ **This is a demo environment.** It is not connected to TSVV's production CRM, website, property portals, or internal systems. All connectors are simulated ("Demo / Simulated Integration"). All property records are fictional demo data.

---

## What this demonstrates

The core business proposition: **update a property once → automatically validate, normalize, and synchronize the information across connected destinations.**

- A live, animated **automation pipeline** (change detection → validation → normalization → duplicate detection → central update → CRM/website/portal sync → verification → audit log)
- A real **validation engine** (required fields, formats, missing data)
- A real **normalization engine** (city names, currency, units, phone/postal formats)
- A real **duplicate detection** heuristic with confidence scoring
- A **controlled failure + retry** demonstration (Sync Center → `DEMO-PAIMIO-5019`)
- Full **6-language UI** (Suomi default, English, Deutsch, Polski, Español, Português) with a proper i18n architecture — no hardcoded strings
- Dashboard, Properties, Sync Center, Validation Center, Connectors, Audit Log, Analytics, Settings
- A "Reset Demo" control that restores all seeded data

Everything runs **entirely in the browser** against an in-memory mock data/service layer — there is nothing to deploy or configure to record a demo video.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- react-router-dom (HashRouter — works from a plain static file server too)
- recharts (analytics charts)
- lucide-react (icons)

No backend, no database, no environment variables required.

## Running locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

To build a static production bundle:

```bash
npm run build
npm run preview   # serves the built dist/ folder locally
```

## Pushing this to GitHub

From inside this project folder:

```bash
git init
git add .
git commit -m "SYJ PropertySync — interactive demo for TSVV"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Anyone who clones the repo can then run `npm install && npm run dev` to get the exact same working demo — nothing else to configure.

## Suggested demo script (for recording)

1. Open the app → **Welcome** screen → "Start interactive demo".
2. Go to **Properties**, open `DEMO-TURKU-1042` (Linnankatu 14 A 3, Turku).
3. Click **Edit & Sync Property** — change the rent from €1,250 to €1,295, update availability, tick "Sauna", edit the description.
4. Click **Save & Synchronize** and watch the pipeline run stage by stage.
5. Scroll down to see validation results, normalization changes, and duplicate detection.
6. Go to **Sync Center** → find the pre-seeded failed job on `DEMO-PAIMIO-5019` → click **Retry** to show error recovery.
7. Visit **Connectors**, **Audit Log**, and **Analytics** to show the rest of the platform.
8. Switch the language selector (top right) to show the multilingual UI, then open the property's **Multilingual listing preview**.
9. Visit **Settings** to show the "Potential operational benefits" summary and the "Reset Demo" control.

## Project structure

```
src/
  data/            seed demo data (properties, connectors, audit log)
  i18n/            i18n provider + one file per language under locales/
  services/        validation/normalization/duplicate-detection engine,
                    the pipeline runner, and the in-memory demo store
  components/      shared UI (pipeline visualizer, nav, badges, etc.)
  pages/           one file per route
```

## Notes on scope

This proof-of-concept models the REST API surface described in the original brief (`/api/properties`, `/api/properties/{id}/sync`, `/api/connectors`, `/api/audit`, etc.) as an in-memory mock service layer rather than a live FastAPI + SQLite backend, so the demo can be cloned and run anywhere with zero setup. The architecture keeps validation, normalization, duplicate detection, and the connector layer in separate modules (`src/services/engine.ts`, `src/services/usePipelineRunner.ts`) specifically so a real backend could later replace the mock layer without rewriting the UI.
