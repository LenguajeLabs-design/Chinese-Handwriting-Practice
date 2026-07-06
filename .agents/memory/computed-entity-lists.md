---
name: Computed-on-the-fly deck/entity lists
description: Merging dynamically-generated entities (e.g. decks built from static JSON) into the same lookup path as persisted/stored entities.
---

When a feature builds entities on the fly from static data (e.g. HSK vocab decks generated from JSON at read-time, not saved to localStorage/DB individually), any other code that looks up entities by id from persisted storage must be updated to merge in the computed set too.

**Why:** In the Hanzi Practice Desk app, HSK decks were generated dynamically via a helper (`getAllHskDecks()`), and a `startDeck()` action correctly set the "active deck id" to the HSK deck's id — but the `useDecks()` hook only read decks from `localStorage` (custom/default decks), so `decks.find(d => d.id === activeDeckId)` failed silently and fell back to the default deck. The bug was invisible in a static screenshot (a plausible-looking character rendered) and was only caught by an end-to-end test that asserted the actual deck *name* shown.

**How to apply:** Whenever introducing a computed/derived collection of entities alongside a persisted one, create one shared "get all entities" accessor that merges both sources, and route every id-based lookup through it. Don't let two different code paths (one for computed, one for persisted) exist for the same id space. Also: prefer e2e assertions on human-visible identifying text (names/titles) over just "did *a* plausible value render" — the latter can pass even when the wrong entity loaded.
