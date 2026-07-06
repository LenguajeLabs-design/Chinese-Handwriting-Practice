import { useEffect, useState } from "react";
import { store, Progress, Deck, HskState } from "@/lib/store";
import { isDue } from "@/lib/srs";
import {
  HSK_LEVELS,
  buildDecksForLevel,
  getHskDeck,
  isDeckCompleted,
  levelProgress,
  generateTodaysPractice,
} from "@/lib/hsk";

export function useProgress() {
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    setProgress(store.getProgress());
  }, []);

  const updateProgress = (char: string, update: Partial<Progress[string]>) => {
    store.updateCharacterProgress(char, update);
    setProgress(store.getProgress());
  };

  const recordQuizResult = (char: string, mistakes: number) => {
    const updated = store.recordQuizResult(char, mistakes);
    setProgress(store.getProgress());
    return updated;
  };

  const isCharacterDue = (char: string): boolean => isDue(progress[char]);

  return { progress, updateProgress, recordQuizResult, isCharacterDue };
}

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string>("");

  useEffect(() => {
    setDecks(store.getDecks());
    setActiveDeckId(store.getActiveDeckId());
  }, []);

  const addDeck = (deck: Deck) => {
    store.addDeck(deck);
    setDecks(store.getDecks());
  };

  const setActive = (id: string) => {
    store.setActiveDeckId(id);
    setActiveDeckId(id);
  };

  const activeDeck = decks.find(d => d.id === activeDeckId) || decks[0];

  return { decks, activeDeckId, activeDeck, addDeck, setActive };
}

const TODAY_DECK_ID = "today";

export function useHsk() {
  const [hskState, setHskState] = useState<HskState>(store.getHskState());

  useEffect(() => {
    setHskState(store.getHskState());
  }, []);

  const setCurrentLevel = (level: number) => {
    setHskState(store.setCurrentLevel(level));
  };

  const setCurrentDeckForLevel = (level: number, deckIndex: number) => {
    setHskState(store.setCurrentDeckForLevel(level, deckIndex));
  };

  const markDeckCompleted = (deckId: string) => {
    setHskState(store.markDeckCompleted(deckId));
  };

  const recordDailyPractice = (count: number) => {
    setHskState(store.recordDailyPractice(count));
  };

  const getDecksForLevel = (level: number) => buildDecksForLevel(level);

  const getLevelProgress = (level: number, progress: Progress) => levelProgress(level, progress);

  const startDeck = (level: number, deckIndex: number): Deck | undefined => {
    const deck = getHskDeck(level, deckIndex);
    if (!deck) return undefined;
    store.setActiveDeckId(deck.id);
    setCurrentLevel(level);
    setCurrentDeckForLevel(level, deckIndex);
    return deck;
  };

  const startTodaysPractice = (progress: Progress): Deck => {
    const level = hskState.currentLevel;
    const deckIndex = hskState.currentDeckByLevel[level] ?? 0;
    const characters = generateTodaysPractice(level, deckIndex, progress);
    const deck: Deck = {
      id: TODAY_DECK_ID,
      name: "Today's Practice",
      characters,
    };
    const decks = store.getDecks().filter(d => d.id !== TODAY_DECK_ID);
    store.saveDecks([...decks, deck]);
    store.setActiveDeckId(TODAY_DECK_ID);
    return deck;
  };

  const checkDeckCompletion = (deck: Deck, progress: Progress): boolean => isDeckCompleted(deck, progress);

  const nextDeckIndex = (level: number): number => {
    const deckIndex = hskState.currentDeckByLevel[level] ?? 0;
    const decks = buildDecksForLevel(level);
    return Math.min(deckIndex + 1, Math.max(decks.length - 1, 0));
  };

  return {
    hskState,
    levels: HSK_LEVELS,
    setCurrentLevel,
    setCurrentDeckForLevel,
    markDeckCompleted,
    recordDailyPractice,
    getDecksForLevel,
    getLevelProgress,
    startDeck,
    startTodaysPractice,
    checkDeckCompletion,
    nextDeckIndex,
  };
}
