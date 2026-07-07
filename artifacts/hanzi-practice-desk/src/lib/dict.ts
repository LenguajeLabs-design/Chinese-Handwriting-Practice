import { pinyin } from "pinyin-pro";
import type { HskVocabItem } from "./hskTypes";
import hsk1 from "@/data/hsk/classic-hsk-1.json";
import hsk2 from "@/data/hsk/classic-hsk-2.json";
import hsk3 from "@/data/hsk/classic-hsk-3.json";
import hsk4 from "@/data/hsk/classic-hsk-4.json";
import hsk5 from "@/data/hsk/classic-hsk-5.json";
import hsk6 from "@/data/hsk/classic-hsk-6.json";

export interface CharInfo {
  pinyin: string;
  meaning: string;
}

// Build a lookup map: Chinese character → { pinyin, meaning }
// For multi-character words (e.g. 中国 → "Zhōngguó"), we use pinyin-pro to
// split the word-level pinyin per character rather than trying to parse the
// concatenated tone string ourselves.
function buildLookup(): Map<string, CharInfo> {
  const map = new Map<string, CharInfo>();
  const allData = [
    ...(hsk1 as HskVocabItem[]),
    ...(hsk2 as HskVocabItem[]),
    ...(hsk3 as HskVocabItem[]),
    ...(hsk4 as HskVocabItem[]),
    ...(hsk5 as HskVocabItem[]),
    ...(hsk6 as HskVocabItem[]),
  ];

  for (const item of allData) {
    const chars = item.characters.length > 0 ? item.characters : [item.word];
    if (chars.length === 1) {
      // Single character — use the item's own pinyin directly
      if (!map.has(chars[0])) {
        map.set(chars[0], {
          pinyin: item.pinyin.toLowerCase(),
          meaning: item.meaning,
        });
      }
    } else {
      // Multi-character word — derive per-char pinyin via pinyin-pro
      const perChar = pinyin(item.word, { toneType: "symbol", type: "array" });
      chars.forEach((ch, i) => {
        if (!map.has(ch)) {
          map.set(ch, {
            pinyin: (perChar[i] ?? "").toLowerCase(),
            meaning: item.meaning,
          });
        }
      });
    }
  }
  return map;
}

const hskLookup = buildLookup();

/**
 * Look up pinyin and meaning for a single Chinese character.
 * Priority: HSK dictionary → pinyin-pro (pinyin only, no meaning).
 */
export function lookupChar(char: string): CharInfo {
  const hskEntry = hskLookup.get(char);
  if (hskEntry) return hskEntry;

  // Fall back to pinyin-pro for characters not in our HSK data
  const autoPin = pinyin(char, { toneType: "symbol", type: "array" })[0] ?? "";
  return {
    pinyin: autoPin.toLowerCase(),
    meaning: "",
  };
}
