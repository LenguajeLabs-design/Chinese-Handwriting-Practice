import { scheduleReview, isDue as isReviewDue } from "./srs";

export interface Character {
  char: string;
  pinyin: string;
  meaning: string;
}

export interface Deck {
  id: string;
  name: string;
  characters: Character[];
}

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
  }
};
