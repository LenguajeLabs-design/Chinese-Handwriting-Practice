import React from "react";
import { HskDeckMeta } from "@/lib/hsk";
import { Progress } from "@/lib/store";
import { Lock, CheckCircle2, ChevronRight } from "lucide-react";

interface DeckBrowserProps {
  decks: HskDeckMeta[];
  progress: Progress;
  completedDecks: string[];
  onSelectDeck: (deckIndex: number) => void;
}

export function DeckBrowser({ decks, progress, completedDecks, onSelectDeck }: DeckBrowserProps) {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No vocabulary data yet for this level.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decks.map((deck, idx) => {
        const isCompleted = completedDecks.includes(deck.id);
        const isLocked = idx > 0 && !completedDecks.includes(decks[idx - 1].id);
        const uniqueChars = Array.from(new Set(deck.items.flatMap(i => i.characters.length ? i.characters : [i.word])));
        const completedCount = uniqueChars.filter(c => progress[c]?.completed).length;

        return (
          <button
            key={deck.id}
            onClick={() => !isLocked && onSelectDeck(idx)}
            disabled={isLocked}
            className={`
              w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all
              ${isLocked ? "opacity-50 cursor-not-allowed border-border bg-muted/30" : "border-border bg-white hover:border-primary/30"}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                ${isCompleted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
              `}>
                {isLocked ? <Lock className="w-4 h-4" /> : isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-medium">{idx + 1}</span>}
              </div>
              <div>
                <div className="font-medium">{deck.name}</div>
                <div className="text-xs text-muted-foreground">
                  {completedCount} / {uniqueChars.length} characters &middot; {deck.items.length} words
                </div>
              </div>
            </div>
            {!isLocked && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
