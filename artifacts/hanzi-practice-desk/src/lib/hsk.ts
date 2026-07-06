import { HskVocabItem } from "./hskTypes";
import { Character, Deck, Progress } from "./store";
import { isDue } from "./srs";

import hsk1 from "@/data/hsk/classic-hsk-1.json";
import hsk2 from "@/data/hsk/classic-hsk-2.json";
import hsk3 from "@/data/hsk/classic-hsk-3.json";
import hsk4 from "@/data/hsk/classic-hsk-4.json";
import hsk5 from "@/data/hsk/classic-hsk-5.json";
import hsk6 from "@/data/hsk/classic-hsk-6.json";

export const HSK_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export const DECK_SIZE = 10;

const HSK_DATA: Record<number, HskVocabItem[]> = {
  1: hsk1 as HskVocabItem[],
  2: hsk2 as HskVocabItem[],
  3: hsk3 as HskVocabItem[],
  4: hsk4 as HskVocabItem[],
  5: hsk5 as HskVocabItem[],
  6: hsk6 as HskVocabItem[],
};

export function getHskItems(level: number): HskVocabItem[] {
  return HSK_DATA[level] ?? [];
}

export interface HskDeckMeta {
  id: string;
  level: number;
  deckIndex: number;
  name: string;
  items: HskVocabItem[];
}

export function buildDecksForLevel(level: number, deckSize: number = DECK_SIZE): HskDeckMeta[] {
  const items = getHskItems(level);
  const decks: HskDeckMeta[] = [];
  for (let i = 0; i < items.length; i += deckSize) {
    const deckIndex = decks.length;
    decks.push({
      id: `hsk-${level}-deck-${deckIndex + 1}`,
      level,
      deckIndex,
      name: `HSK ${level} Deck ${deckIndex + 1}`,
      items: items.slice(i, i + deckSize),
    });
  }
  return decks;
}

// Expand vocab words into individual character-practice steps, carrying word
// context (word text, index within word, total chars in word) so multi-char
// words are practiced one character at a time.
export function expandItemsToCharacters(items: HskVocabItem[]): Character[] {
  const chars: Character[] = [];
  for (const item of items) {
    const charList = item.characters.length > 0 ? item.characters : [item.word];
    charList.forEach((char, idx) => {
      chars.push({
        char,
        pinyin: item.pinyin,
        meaning: item.meaning,
        word: item.word,
        charIndex: idx,
        charTotal: charList.length,
        vocabId: item.id,
      });
    });
  }
  return chars;
}

export function hskDeckToDeck(deckMeta: HskDeckMeta): Deck {
  return {
    id: deckMeta.id,
    name: deckMeta.name,
    characters: expandItemsToCharacters(deckMeta.items),
    hskLevel: deckMeta.level,
    hskDeckIndex: deckMeta.deckIndex,
  };
}

export function getAllHskDecks(): Deck[] {
  const decks: Deck[] = [];
  for (const level of HSK_LEVELS) {
    for (const deckMeta of buildDecksForLevel(level)) {
      decks.push(hskDeckToDeck(deckMeta));
    }
  }
  return decks;
}

export function getHskDeck(level: number, deckIndex: number): Deck | undefined {
  const decks = buildDecksForLevel(level);
  const deckMeta = decks[deckIndex];
  return deckMeta ? hskDeckToDeck(deckMeta) : undefined;
}

export function isDeckCompleted(deck: Deck, progress: Progress): boolean {
  if (deck.characters.length === 0) return false;
  return deck.characters.every(c => progress[c.char]?.completed);
}

export function levelProgress(level: number, progress: Progress): { completed: number; total: number } {
  const items = getHskItems(level);
  const chars = expandItemsToCharacters(items);
  const uniqueChars = Array.from(new Set(chars.map(c => c.char)));
  const completed = uniqueChars.filter(c => progress[c]?.completed).length;
  return { completed, total: uniqueChars.length };
}

// Generate Today's Practice: 7 new items from current deck + 3 review items
// (difficult / due characters, drawn from anywhere in the level), filling with
// new items if there aren't enough review items available.
export function generateTodaysPractice(
  level: number,
  deckIndex: number,
  progress: Progress,
  newCount: number = 7,
  reviewCount: number = 3
): Character[] {
  const deckMeta = buildDecksForLevel(level)[deckIndex];
  const currentDeckItems = deckMeta ? deckMeta.items : [];
  const currentDeckChars = expandItemsToCharacters(currentDeckItems);

  const newChars = currentDeckChars.filter(c => !progress[c.char]?.completed);

  const allLevelChars = expandItemsToCharacters(getHskItems(level));
  const seen = new Set<string>();
  const reviewCandidates = allLevelChars.filter(c => {
    if (seen.has(c.char)) return false;
    const p = progress[c.char];
    if (!p || !p.completed) return false;
    const isDifficult = p.quizTotal > 0 && p.quizScore / p.quizTotal < 0.7;
    const due = isDue(p);
    if (isDifficult || due) {
      seen.add(c.char);
      return true;
    }
    return false;
  });

  const selectedNew = newChars.slice(0, newCount);
  const selectedReview = reviewCandidates.slice(0, reviewCount);

  const total = selectedNew.length + selectedReview.length;
  const target = newCount + reviewCount;
  if (total < target) {
    const usedChars = new Set([...selectedNew, ...selectedReview].map(c => c.char));
    const fillers = currentDeckChars
      .filter(c => !usedChars.has(c.char))
      .slice(0, target - total);
    return [...selectedNew, ...selectedReview, ...fillers];
  }

  return [...selectedNew, ...selectedReview];
}
