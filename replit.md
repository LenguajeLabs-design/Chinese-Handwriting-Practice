# Hanzi Practice Desk

An iPad-first Chinese handwriting practice app: trace and quiz Chinese characters with stroke-order guidance, spaced repetition, and HSK-level vocabulary decks.

## Run & Operate

- `pnpm --filter @workspace/hanzi-practice-desk run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- Frontend-only app — no backend/DB required. All state (progress, decks, HSK state) lives in `localStorage`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React + Vite, wouter (routing), Tailwind + shadcn/ui
- `hanzi-writer` for stroke-order rendering/quizzing
- Custom SM-2-style spaced repetition (`src/lib/srs.ts`)

## Where things live

- `artifacts/hanzi-practice-desk/src/lib/store.ts` — localStorage-backed data layer: `Character`/`Deck`/`Progress`/`HskState` types and CRUD helpers.
- `artifacts/hanzi-practice-desk/src/lib/hsk.ts` — HSK deck/queue building: splits vocab into 10-item decks, expands multi-character words into per-character practice steps, builds "Today's Practice" (7 new + 3 review).
- `artifacts/hanzi-practice-desk/src/lib/srs.ts` — spaced repetition scheduling.
- `artifacts/hanzi-practice-desk/src/data/hsk/classic-hsk-{1..6}.json` — Classic HSK vocab data (placeholder data for levels 3-6 until real PDFs are transcribed).
- `artifacts/hanzi-practice-desk/src/components/hsk/` — LevelSelector, DeckBrowser, TodayPractice, DeckCompletion, ProgressPanel.
- `artifacts/hanzi-practice-desk/src/pages/DecksScreen.tsx` — HSK level/deck browsing page (route `/decks`).
- `artifacts/hanzi-practice-desk/src/pages/PracticeScreen.tsx` — main trace/quiz screen (route `/`); shows word context for multi-char words and the deck-completion flow for HSK decks.

## Architecture decisions

- HSK decks are computed on-the-fly from JSON vocab data (not persisted individually) and merged into the deck list at read-time (`getAllDecks()` in `use-data.ts`) alongside user-created custom decks — avoids duplicating deck storage.
- Multi-character HSK words are flattened into a sequence of single-character `Character` entries (each carrying `word`/`charIndex`/`charTotal`/`vocabId`), so the existing single-character `PracticeGrid`/`PracticeScreen` UI works unmodified for both single chars and multi-char words.
- Per-character `Progress` map is the single source of truth; deck/level completion and "today's practice" selection are derived from it rather than duplicated into separate state.

## Product

- Trace & quiz individual Chinese characters with stroke-order guidance (`hanzi-writer`), pencil-sound feedback, and spaced-repetition review scheduling.
- Browse Classic HSK levels 1–6, each split into 10-item decks; decks unlock sequentially as the previous one is completed.
- "Today's Practice" auto-builds a mixed queue of new + due/difficult review characters for the user's current level/deck.
- Deck completion flow offers: continue to next deck, review difficult characters, or practice the deck again from memory.
- Custom character lists and a progress dashboard, in addition to the HSK deck system.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- HSK vocab data for levels 3–6 (and most of levels beyond the first ~30 HSK1 items / 10 HSK2 items) is placeholder — the user is transcribing real Classic HSK 1-6 vocab from PDFs and will paste it into `src/data/hsk/classic-hsk-*.json` later. Keep the `HskVocabItem` shape (`id/level/word/characters/pinyin/meaning/tags/source`) stable when that data lands.
- Always verify with `pnpm --filter @workspace/hanzi-practice-desk run typecheck`, not `build` (build needs workflow-provided env vars).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
