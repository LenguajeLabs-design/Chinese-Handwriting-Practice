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
  const {
    hskState,
    levels,
    setCurrentLevel,
    getLevelProgress,
    startDeck,
    startTodaysPractice,
  } = useHsk();

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
    toast.success("Today's practice is ready", {
      description: `${deck.characters.length} characters selected for you.`,
    });
    setLocation("/");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="app-page">
        <div className="app-hero mb-6 md:mb-8">
          <p className="eyebrow mb-2">Structured Study</p>
          <h1 className="section-title mb-2">HSK Decks</h1>
          <p className="section-copy max-w-2xl">
            Work through Classic HSK vocabulary in calm, touch-friendly decks.
            Start with today&apos;s suggested practice or jump to a level and
            continue where you left off.
          </p>
        </div>

        <div className="mb-6 md:mb-8">
          <TodayPractice onStart={handleStartTodaysPractice} />
        </div>

        <div className="mb-6 md:mb-8">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="eyebrow mb-2">Choose A Level</p>
              <h2 className="text-xl font-medium">Your deck path</h2>
            </div>
            <div className="hidden md:block text-sm text-muted-foreground">
              Current level: HSK {currentLevel}
            </div>
          </div>
          <LevelSelector
            levels={levels}
            currentLevel={currentLevel}
            onSelect={setCurrentLevel}
            getLevelStats={(level) => getLevelProgress(level, progress)}
          />
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-8 items-start">
          <div className="app-surface-strong p-4 md:p-6">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="eyebrow mb-2">Active Track</p>
                <h2 className="text-xl font-medium">
                  HSK {currentLevel} Decks
                </h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {decks.length} deck{decks.length === 1 ? "" : "s"}
              </div>
            </div>
            <DeckBrowser
              decks={decks}
              progress={progress}
              completedDecks={hskState.completedDecks}
              onSelectDeck={handleSelectDeck}
            />
          </div>

          <div>
            <ProgressPanel
              levels={levels}
              getLevelStats={(level) => getLevelProgress(level, progress)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
