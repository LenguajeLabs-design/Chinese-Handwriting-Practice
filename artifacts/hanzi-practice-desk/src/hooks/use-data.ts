import { useEffect, useState } from "react";
import { store, Progress, Deck } from "@/lib/store";
import { isDue } from "@/lib/srs";

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
