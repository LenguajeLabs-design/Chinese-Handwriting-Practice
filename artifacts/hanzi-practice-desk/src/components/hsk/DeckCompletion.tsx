import React from "react";
import { Button } from "@/components/ui/button";
import { PartyPopper, ArrowRight, RotateCcw, Repeat } from "lucide-react";

interface DeckCompletionProps {
  deckName: string;
  hasNextDeck: boolean;
  onContinue: () => void;
  onReviewDifficult: () => void;
  onPracticeFromMemory: () => void;
}

export function DeckCompletion({ deckName, hasNextDeck, onContinue, onReviewDifficult, onPracticeFromMemory }: DeckCompletionProps) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <PartyPopper className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-medium mb-1">Deck complete!</h2>
          <p className="text-muted-foreground text-sm">
            You've finished every character in <span className="font-medium text-foreground">{deckName}</span>.
          </p>
        </div>

        <div className="space-y-3">
          {hasNextDeck && (
            <Button onClick={onContinue} className="w-full h-12 rounded-xl text-base">
              Continue to next deck
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Button onClick={onReviewDifficult} variant="outline" className="w-full h-12 rounded-xl text-base">
            <RotateCcw className="w-4 h-4 mr-2" />
            Review difficult characters
          </Button>
          <Button onClick={onPracticeFromMemory} variant="outline" className="w-full h-12 rounded-xl text-base">
            <Repeat className="w-4 h-4 mr-2" />
            Practice from memory
          </Button>
        </div>
      </div>
    </div>
  );
}
