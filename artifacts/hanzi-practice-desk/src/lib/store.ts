import { scheduleReview, isDue as isReviewDue } from "./srs";

export interface Character {
  char: string;
  pinyin: string;
  meaning: string;
  word?: string;
  charIndex?: number;
  charTotal?: number;
  vocabId?: string;
}

export interface Deck {
  id: string;
  name: string;
  characters: Character[];
  hskLevel?: number;
  hskDeckIndex?: number;
}

export interface HskState {
  currentLevel: number;
  currentDeckByLevel: Record<number, number>;
  completedDecks: string[];
  dailyPracticeHistory: { date: string; count: number }[];
  lastPracticeDate: string | null;
}

export interface StoreMetadata {
  schemaVersion: number;
  lastUpdatedAt: string | null;
  lastCloudSyncAt: string | null;
}

export interface StorageSnapshot {
  version: number;
  exportedAt: string;
  deviceLabel: string;
  progress: Progress;
  decks: Deck[];
  activeDeckId: string;
  hskState: HskState;
  metadata: StoreMetadata;
}

export const DEFAULT_HSK_STATE: HskState = {
  currentLevel: 1,
  currentDeckByLevel: {},
  completedDecks: [],
  dailyPracticeHistory: [],
  lastPracticeDate: null,
};

export interface Progress {
  [char: string]: {
    completed: boolean;
    attempts: number;
    quizScore: number;
    quizTotal: number;
    interval?: number;
    easeFactor?: number;
    repetitions?: number;
    dueDate?: number;
    lastReviewed?: number;
  };
}

export const defaultDeck: Deck = {
  id: "default",
  name: "Today's Practice",
  characters: [
    { char: "我", pinyin: "wǒ", meaning: "I / me" },
    { char: "你", pinyin: "nǐ", meaning: "you" },
    { char: "他", pinyin: "tā", meaning: "he / him" },
    { char: "她", pinyin: "tā", meaning: "she / her" },
    { char: "是", pinyin: "shì", meaning: "to be" },
    { char: "有", pinyin: "yǒu", meaning: "to have" },
    { char: "不", pinyin: "bù", meaning: "not" },
    { char: "文", pinyin: "wén", meaning: "language / writing" },
    { char: "病", pinyin: "bìng", meaning: "illness" },
    { char: "疼", pinyin: "téng", meaning: "ache / pain" },
  ],
};

const PROGRESS_KEY = "hanzi_progress";
const DECKS_KEY = "hanzi_decks";
const HSK_STATE_KEY = "hanzi_hsk_state";
const ACTIVE_DECK_KEY = "hanzi_active_deck";
const METADATA_KEY = "hanzi_store_metadata";

const STORE_SCHEMA_VERSION = 1;

const listeners = new Set<() => void>();

function emitStoreChanged() {
  listeners.forEach((listener) => listener());
}

function nowIso(): string {
  return new Date().toISOString();
}

function detectDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Unknown device";

  const platform = navigator.platform || "Unknown platform";
  const browser = navigator.userAgent.includes("iPad")
    ? "iPad"
    : navigator.userAgent.includes("iPhone")
      ? "iPhone"
      : navigator.userAgent.includes("Mac")
        ? "Mac"
        : navigator.userAgent.includes("Windows")
          ? "Windows"
          : navigator.userAgent.includes("Android")
            ? "Android"
            : "Browser";

  return `${browser} · ${platform}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getDefaultMetadata(): StoreMetadata {
  return {
    schemaVersion: STORE_SCHEMA_VERSION,
    lastUpdatedAt: null,
    lastCloudSyncAt: null,
  };
}

function readMetadata(): StoreMetadata {
  const metadata = readJson<StoreMetadata>(METADATA_KEY, getDefaultMetadata());
  return {
    ...getDefaultMetadata(),
    ...metadata,
  };
}

function saveMetadata(
  partial: Partial<StoreMetadata>,
  options?: { emit?: boolean },
): StoreMetadata {
  const next = { ...readMetadata(), ...partial };
  writeJson(METADATA_KEY, next);
  if (options?.emit !== false) {
    emitStoreChanged();
  }
  return next;
}

function touchMetadata(options?: { emit?: boolean }) {
  return saveMetadata({ lastUpdatedAt: nowIso() }, options);
}

export function subscribeToStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStoreMetadata(): StoreMetadata {
  return readMetadata();
}

export function exportStoreSnapshot(): StorageSnapshot {
  return {
    version: STORE_SCHEMA_VERSION,
    exportedAt: nowIso(),
    deviceLabel: detectDeviceLabel(),
    progress: store.getProgress(),
    decks: store.getDecks(),
    activeDeckId: store.getActiveDeckId(),
    hskState: store.getHskState(),
    metadata: readMetadata(),
  };
}

export function importStoreSnapshot(snapshot: StorageSnapshot) {
  writeJson(PROGRESS_KEY, snapshot.progress ?? {});
  writeJson(DECKS_KEY, snapshot.decks?.length ? snapshot.decks : [defaultDeck]);
  localStorage.setItem(
    ACTIVE_DECK_KEY,
    snapshot.activeDeckId || snapshot.decks?.[0]?.id || "default",
  );
  writeJson(HSK_STATE_KEY, {
    ...DEFAULT_HSK_STATE,
    ...snapshot.hskState,
  });
  saveMetadata(
    {
      schemaVersion: snapshot.version || STORE_SCHEMA_VERSION,
      lastUpdatedAt:
        snapshot.metadata?.lastUpdatedAt ?? snapshot.exportedAt ?? nowIso(),
      lastCloudSyncAt:
        snapshot.metadata?.lastCloudSyncAt ?? snapshot.exportedAt ?? null,
    },
    { emit: false },
  );
  emitStoreChanged();
}

export function markCloudSyncCompleted(at: string = nowIso()) {
  saveMetadata({ lastCloudSyncAt: at }, { emit: false });
}

export const store = {
  getProgress: (): Progress => {
    return readJson<Progress>(PROGRESS_KEY, {});
  },
  saveProgress: (progress: Progress) => {
    writeJson(PROGRESS_KEY, progress);
    touchMetadata({ emit: false });
    emitStoreChanged();
  },
  updateCharacterProgress: (
    char: string,
    update: Partial<Progress[string]>,
  ) => {
    const progress = store.getProgress();
    const current = progress[char] || {
      completed: false,
      attempts: 0,
      quizScore: 0,
      quizTotal: 0,
    };
    progress[char] = { ...current, ...update };
    store.saveProgress(progress);
  },
  recordQuizResult: (char: string, mistakes: number) => {
    const progress = store.getProgress();
    const current = progress[char] || {
      completed: false,
      attempts: 0,
      quizScore: 0,
      quizTotal: 0,
    };
    const isPerfect = mistakes === 0;
    const reviewState = scheduleReview(
      {
        interval: current.interval ?? 0,
        easeFactor: current.easeFactor ?? 2.5,
        repetitions: current.repetitions ?? 0,
        dueDate: current.dueDate ?? 0,
        lastReviewed: current.lastReviewed ?? 0,
      },
      mistakes,
    );
    progress[char] = {
      ...current,
      completed: true,
      attempts: current.attempts + 1,
      quizScore: current.quizScore + (isPerfect ? 1 : 0),
      quizTotal: current.quizTotal + 1,
      ...reviewState,
    };
    store.saveProgress(progress);
    return progress[char];
  },
  isCharacterDue: (char: string): boolean => {
    const progress = store.getProgress();
    return isReviewDue(progress[char]);
  },

  getDecks: (): Deck[] => {
    const decks = readJson<Deck[]>(DECKS_KEY, [defaultDeck]);
    return decks.length > 0 ? decks : [defaultDeck];
  },
  saveDecks: (decks: Deck[]) => {
    writeJson(DECKS_KEY, decks);
    touchMetadata({ emit: false });
    emitStoreChanged();
  },
  addDeck: (deck: Deck) => {
    const decks = store.getDecks();
    decks.push(deck);
    store.saveDecks(decks);
  },

  getActiveDeckId: (): string => {
    return localStorage.getItem(ACTIVE_DECK_KEY) || "default";
  },
  setActiveDeckId: (id: string) => {
    localStorage.setItem(ACTIVE_DECK_KEY, id);
    touchMetadata({ emit: false });
    emitStoreChanged();
  },

  getHskState: (): HskState => {
    return {
      ...DEFAULT_HSK_STATE,
      ...readJson<Partial<HskState>>(HSK_STATE_KEY, {}),
    };
  },
  saveHskState: (state: HskState) => {
    writeJson(HSK_STATE_KEY, state);
    touchMetadata({ emit: false });
    emitStoreChanged();
  },
  setCurrentLevel: (level: number) => {
    const state = store.getHskState();
    state.currentLevel = level;
    store.saveHskState(state);
    return state;
  },
  setCurrentDeckForLevel: (level: number, deckIndex: number) => {
    const state = store.getHskState();
    state.currentDeckByLevel = {
      ...state.currentDeckByLevel,
      [level]: deckIndex,
    };
    store.saveHskState(state);
    return state;
  },
  markDeckCompleted: (deckId: string) => {
    const state = store.getHskState();
    if (!state.completedDecks.includes(deckId)) {
      state.completedDecks = [...state.completedDecks, deckId];
      store.saveHskState(state);
    }
    return state;
  },
  recordDailyPractice: (count: number, now: Date = new Date()) => {
    const state = store.getHskState();
    const dateKey = now.toISOString().slice(0, 10);
    const existing = state.dailyPracticeHistory.find((d) => d.date === dateKey);
    if (existing) {
      existing.count += count;
    } else {
      state.dailyPracticeHistory = [
        ...state.dailyPracticeHistory,
        { date: dateKey, count },
      ];
    }
    state.lastPracticeDate = dateKey;
    store.saveHskState(state);
    return state;
  },
};
