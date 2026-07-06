import React from "react";
import { useLocation } from "wouter";
import { useProgress, useHsk } from "@/hooks/use-data";
import { LevelSelector } from "@/components/hsk/LevelSelector";
import { DeckBrowser } from "@/components/hsk/DeckBrowser";
import { TodayPractice } from "@/components/hsk/TodayPractice";
import { ProgressPanel } from "@/components/hsk/ProgressPanel";
import { buildDecksForLevel } from "@/lib/hsk";
import { toast } from "sonner";

export function DecksScreen() {
  const [, setLocation] = useLocation();
  const { progress } = useProgress();
  const { hskState, levels, setCurrentLevel, getLevelProgress, startDeck, startTodaysPractice } = useHsk();

  const currentLevel = hskState.currentLevel;
  const decks = buildDecksForLevel(currentLevel);

  const handleSelectDeck = (deckIndex: number) => {
    const deck = startDeck(currentLevel, deckIndex);
    if (deck) {
      toast.success(`Starting ${deck.name}`);
      setLocation("/");
    }
  };

  const handleStartTodaysPractice = () => {
    const deck = startTodaysPractice(progress);
    toast.success("Today's practice is ready", { description: `${deck.characters.length} characters selected for you.` });
    setLocation("/");
  };

  return (
    <div className="h-full p-4 sm:p-6 md:p-12 max-w-4xl mx-auto overflow-y-auto">
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-1 md:mb-2">HSK Decks</h1>
        <p className="text-muted-foreground text-sm md:text-lg">Practice vocabulary organized by Classic HSK level.</p>
      </div>

      <div className="mb-6 md:mb-8">
        <TodayPractice onStart={handleStartTodaysPractice} />
      </div>

      <div className="mb-6 md:mb-8">
        <LevelSelector
          levels={levels}
          currentLevel={currentLevel}
          onSelect={setCurrentLevel}
          getLevelStats={level => getLevelProgress(level, progress)}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2">
          <h2 className="text-lg font-medium mb-4">HSK {currentLevel} Decks</h2>
          <DeckBrowser
            decks={decks}
            progress={progress}
            completedDecks={hskState.completedDecks}
            onSelectDeck={handleSelectDeck}
          />
        </div>
        <div>
          <ProgressPanel levels={levels} getLevelStats={level => getLevelProgress(level, progress)} />
        </div>
      </div>
    </div>
  );
}
