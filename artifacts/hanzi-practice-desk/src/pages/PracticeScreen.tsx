import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProgress, useDecks, useHsk } from "@/hooks/use-data";
import { useOfflinePrecache } from "@/hooks/use-offline-precache";
import type { Character } from "@/lib/store";
import { isDue } from "@/lib/srs";
import { PracticeGrid } from "@/components/PracticeGrid";
import { DeckCompletion } from "@/components/hsk/DeckCompletion";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function PracticeScreen() {
  const [, setLocation] = useLocation();
  const { activeDeck } = useDecks();
  const { progress, recordQuizResult } = useProgress();
  const { hskState, markDeckCompleted, nextDeckIndex, setCurrentDeckForLevel, startDeck, checkDeckCompletion } = useHsk();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGridKey, setIsGridKey] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setShowCompletion(false);
  }, [activeDeck?.id]);

  const isHskDeck = activeDeck?.hskLevel !== undefined;

  // Pre-warm the service worker cache with all character stroke data for this deck
  useOfflinePrecache(activeDeck?.characters ?? []);

  useEffect(() => {
    if (!activeDeck || !isHskDeck) return;
    if (checkDeckCompletion(activeDeck, progress)) {
      if (!hskState.completedDecks.includes(activeDeck.id)) {
        markDeckCompleted(activeDeck.id);
      }
      setShowCompletion(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, activeDeck?.id]);

  if (activeDeck && isHskDeck && showCompletion) {
    const level = activeDeck.hskLevel!;
    const deckIndex = activeDeck.hskDeckIndex!;
    const upcomingIndex = nextDeckIndex(level);
    const hasNextDeck = upcomingIndex > deckIndex;

    return (
      <DeckCompletion
        deckName={activeDeck.name}
        hasNextDeck={hasNextDeck}
        onContinue={() => {
          setCurrentDeckForLevel(level, upcomingIndex);
          startDeck(level, upcomingIndex);
          setShowCompletion(false);
        }}
        onReviewDifficult={() => {
          setLocation("/decks");
        }}
        onPracticeFromMemory={() => {
          startDeck(level, deckIndex);
          setShowCompletion(false);
        }}
      />
    );
  }

  if (!activeDeck || !activeDeck.characters.length) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <span className="font-serif text-2xl text-muted-foreground">空</span>
          </div>
          <h2 className="text-xl font-medium">This deck is empty</h2>
          <p className="text-muted-foreground">Go to Custom Lists to create a new practice deck.</p>
        </div>
      </div>
    );
  }

  const currentItem = activeDeck.characters[currentIndex];
  const charProgress = progress[currentItem.char] || { completed: false, attempts: 0, quizScore: 0, quizTotal: 0 };

  const handleNext = () => {
    if (currentIndex < activeDeck.characters.length - 1) {
      setCurrentIndex(i => i + 1);
      setIsGridKey(k => k + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setIsGridKey(k => k + 1);
    }
  };

  const handleQuizComplete = (summary: { totalMistakes: number }) => {
    const isPerfect = summary.totalMistakes === 0;
    const updated = recordQuizResult(currentItem.char, summary.totalMistakes);

    if (isPerfect) {
      toast.success("Perfect trace!", {
        icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
        description: updated?.interval
          ? `Next review in ${updated.interval} day${updated.interval === 1 ? "" : "s"}.`
          : undefined,
        className: "bg-primary/5 border-primary/20",
      });
    } else {
      toast("Practice makes perfect.", {
        description: `${summary.totalMistakes} mistakes made. You'll see this one again soon.`
      });
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row relative">
      
      {/* Mobile header + deck progress indicator */}
      <div className="md:hidden border-b border-border bg-white">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h1 className="text-base font-medium leading-tight">{activeDeck.name}</h1>
            <p className="text-xs text-muted-foreground">{currentIndex + 1} of {activeDeck.characters.length}</p>
          </div>
          {isDue(progress[currentItem.char]) && charProgress.completed && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-1">
              <Clock className="w-3 h-3" />
              Due
            </div>
          )}
        </div>
        <div className="flex overflow-x-auto px-4 py-3 gap-2 hide-scrollbar">
          {activeDeck.characters.map((item: Character, idx: number) => {
            const isDone = progress[item.char]?.completed;
            const due = isDue(progress[item.char]);
            return (
              <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); setIsGridKey(k => k + 1); }}
                className={`
                  relative flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-serif text-base transition-colors
                  ${idx === currentIndex ? "bg-primary text-primary-foreground shadow-sm" : 
                    isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
                `}
              >
                {item.char}
                {due && isDone && idx !== currentIndex && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 relative">
        <div className="absolute top-6 left-6 right-6 hidden md:flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium">{activeDeck.name}</h1>
            <p className="text-sm text-muted-foreground">{currentIndex + 1} of {activeDeck.characters.length}</p>
          </div>
          {isDue(progress[currentItem.char]) && charProgress.completed && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-3 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              Due for review
            </div>
          )}
        </div>

        <div className="w-full max-w-xl mx-auto flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.char + isGridKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-4 md:mb-8 h-16 md:h-20 flex flex-col justify-end">
                {currentItem.word && currentItem.charTotal && currentItem.charTotal > 1 && (
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">
                    Word: {currentItem.word} &middot; Character {(currentItem.charIndex ?? 0) + 1} of {currentItem.charTotal}
                  </div>
                )}
                <div className="text-xl md:text-2xl text-primary font-medium tracking-wide mb-1">
                  {currentItem.pinyin}
                </div>
                <div className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">
                  {currentItem.meaning}
                </div>
              </div>

              <div
                className="flex items-center justify-center gap-4 w-full mb-2"
                style={{ maxWidth: Math.min(window.innerWidth - 48, 400) }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-14 h-14 disabled:opacity-30 shrink-0"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-9 h-9" />
                </Button>

                <div className="flex-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-14 h-14 disabled:opacity-30 shrink-0"
                  onClick={handleNext}
                  disabled={currentIndex === activeDeck.characters.length - 1}
                >
                  <ChevronRight className="w-9 h-9" />
                </Button>
              </div>

              <PracticeGrid 
                character={currentItem.char} 
                onQuizComplete={handleQuizComplete}
                size={Math.min(window.innerWidth - 48, 400)}
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center w-full max-w-sm mt-6 md:mt-12 px-4">
            <div className="text-sm font-medium text-muted-foreground tabular-nums">
              {currentIndex + 1} / {activeDeck.characters.length}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar List */}
      <div className="hidden md:block w-72 border-l border-border bg-white h-full overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-border/50">
          <h3 className="font-medium">Character List</h3>
        </div>
        <div className="p-4 space-y-2">
          {activeDeck.characters.map((item: Character, idx: number) => {
            const isDone = progress[item.char]?.completed;
            const isActive = idx === currentIndex;
            const due = isDue(progress[item.char]);
            return (
              <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); setIsGridKey(k => k + 1); }}
                className={`
                  w-full flex items-center p-3 rounded-xl transition-all text-left group
                  ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted bg-transparent"}
                `}
              >
                <div className={`
                  relative w-10 h-10 rounded-lg flex items-center justify-center font-serif text-xl mr-4
                  ${isActive ? "bg-white/20" : isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-background"}
                `}>
                  {item.char}
                  {due && isDone && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                    {item.pinyin}
                  </div>
                  <div className={`text-xs truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {item.meaning}
                  </div>
                </div>
                {isDone && !isActive && (
                  due
                    ? <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                    : <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
