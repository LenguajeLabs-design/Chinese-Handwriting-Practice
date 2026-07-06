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
  ]
};

const PROGRESS_KEY = "hanzi_progress";
const DECKS_KEY = "hanzi_decks";
const HSK_STATE_KEY = "hanzi_hsk_state";
const ACTIVE_DECK_KEY = "hanzi_active_deck";

export const store = {
  getProgress: (): Progress => {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },
  saveProgress: (progress: Progress) => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  },
  updateCharacterProgress: (char: string, update: Partial<Progress[string]>) => {
    const progress = store.getProgress();
    const current = progress[char] || { completed: false, attempts: 0, quizScore: 0, quizTotal: 0 };
    progress[char] = { ...current, ...update };
    store.saveProgress(progress);
  },
  recordQuizResult: (char: string, mistakes: number) => {
    const progress = store.getProgress();
    const current = progress[char] || { completed: false, attempts: 0, quizScore: 0, quizTotal: 0 };
    const isPerfect = mistakes === 0;
    const reviewState = scheduleReview(
      {
        interval: current.interval ?? 0,
        easeFactor: current.easeFactor ?? 2.5,
        repetitions: current.repetitions ?? 0,
        dueDate: current.dueDate ?? 0,
        lastReviewed: current.lastReviewed ?? 0,
      },
      mistakes
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
    try {
      const data = localStorage.getItem(DECKS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return [defaultDeck];
  },
  saveDecks: (decks: Deck[]) => {
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
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
  },

  getHskState: (): HskState => {
    try {
      const data = localStorage.getItem(HSK_STATE_KEY);
      if (data) {
        return { ...DEFAULT_HSK_STATE, ...JSON.parse(data) };
      }
    } catch {}
    return { ...DEFAULT_HSK_STATE };
  },
  saveHskState: (state: HskState) => {
    localStorage.setItem(HSK_STATE_KEY, JSON.stringify(state));
  },
  setCurrentLevel: (level: number) => {
    const state = store.getHskState();
    state.currentLevel = level;
    store.saveHskState(state);
    return state;
  },
  setCurrentDeckForLevel: (level: number, deckIndex: number) => {
    const state = store.getHskState();
    state.currentDeckByLevel = { ...state.currentDeckByLevel, [level]: deckIndex };
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
    const existing = state.dailyPracticeHistory.find(d => d.date === dateKey);
    if (existing) {
      existing.count += count;
    } else {
      state.dailyPracticeHistory = [...state.dailyPracticeHistory, { date: dateKey, count }];
    }
    state.lastPracticeDate = dateKey;
    store.saveHskState(state);
    return state;
  },
};
