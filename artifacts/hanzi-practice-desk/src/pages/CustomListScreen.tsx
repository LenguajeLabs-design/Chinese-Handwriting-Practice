import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useDecks } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookA, Plus } from "lucide-react";
import { toast } from "sonner";
import { Deck, Character } from "@/lib/store";
import { lookupChar } from "@/lib/dict";

export function CustomListScreen() {
  const [, setLocation] = useLocation();
  const { decks, activeDeckId, addDeck, setActive } = useDecks();
  const [inputText, setInputText] = useState("");
  const [deckName, setDeckName] = useState("");

  // Extract unique Chinese characters from the pasted text and look each one up
  const previewChars = useMemo<Character[]>(() => {
    const unique = Array.from(
      new Set(inputText.match(/[\u4e00-\u9fa5]/g) ?? []),
    );
    return unique.map((char) => {
      const info = lookupChar(char);
      return {
        char,
        pinyin: info.pinyin || "—",
        meaning: info.meaning || "",
      };
    });
  }, [inputText]);

  const handleCreateDeck = () => {
    if (!deckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }
    if (previewChars.length === 0) {
      toast.error("No valid Chinese characters found in input.");
      return;
    }

    const newDeck: Deck = {
      id: "deck_" + Date.now(),
      name: deckName.trim(),
      characters: previewChars,
    };

    addDeck(newDeck);
    setActive(newDeck.id);
    toast.success(`Deck created with ${previewChars.length} characters.`);
    setLocation("/");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="app-page">
        <div className="app-hero mb-6 md:mb-8">
          <p className="eyebrow mb-2">Bring Your Own Text</p>
          <h1 className="section-title mb-2">Custom Lists</h1>
          <p className="section-copy max-w-2xl">
            Paste a sentence, short passage, or study list and the app will pull
            out the unique Chinese characters so you can practice them as a
            focused deck.
          </p>
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-8 items-start">
          <div className="app-surface-strong p-4 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
              <div>
                <p className="eyebrow mb-2">Create A Deck</p>
                <h2 className="text-lg md:text-xl font-medium">New Deck</h2>
              </div>
              <div className="hidden sm:flex text-xs text-muted-foreground rounded-full bg-muted px-3 py-1.5">
                Step 1 of 1
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 mb-5 text-sm text-muted-foreground">
              Name your deck, paste the source text, and create a clean practice
              list from the detected characters.
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deckName">Deck Name</Label>
                <Input
                  id="deckName"
                  placeholder="Weekend reading, textbook unit 3, travel phrases..."
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="h-12 rounded-2xl bg-white/78 border-white/80 focus-visible:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deckInput">Chinese Text</Label>
                <Textarea
                  id="deckInput"
                  placeholder="Paste characters or short sentences here. Punctuation and non-Chinese characters will be ignored."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[180px] md:min-h-[220px] resize-y rounded-2xl bg-white/78 border-white/80 focus-visible:bg-white text-base leading-7"
                />
              </div>

              {previewChars.length > 0 ? (
                <div className="rounded-[22px] border border-white/80 bg-white/72 p-4 space-y-3 max-h-72 overflow-y-auto">
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">Detected Characters</p>
                    <p className="text-xs text-muted-foreground">
                      {previewChars.length} found
                    </p>
                  </div>
                  {previewChars.map(({ char, pinyin: py, meaning }) => (
                    <div
                      key={char}
                      className="flex items-center gap-3 py-2 border-b border-border/35 last:border-0"
                    >
                      <span className="font-serif text-2xl w-8 text-center shrink-0">
                        {char}
                      </span>
                      <span className="text-sm text-primary font-medium w-20 shrink-0">
                        {py || "trace"}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {meaning || (
                          <span className="italic opacity-70">
                            No meaning saved yet
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-border bg-white/50 px-4 py-5 text-sm text-muted-foreground">
                  Paste Chinese text to preview the characters that will be
                  included in your deck.
                </div>
              )}

              <Button
                onClick={handleCreateDeck}
                className="w-full h-12 text-base rounded-full"
                disabled={previewChars.length === 0}
              >
                Create Practice Deck
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="eyebrow mb-2">Saved Decks</p>
              <h2 className="text-xl font-medium flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary" />
                Your Decks
              </h2>
            </div>

            <div className="space-y-3">
              {decks.map((deck) => {
                const isActive = deck.id === activeDeckId;
                return (
                  <div
                    key={deck.id}
                    className={`
                      flex items-center justify-between p-4 rounded-[22px] border transition-all cursor-pointer
                      ${isActive ? "border-primary bg-primary/7 shadow-sm" : "border-white/80 bg-white/78 hover:border-primary/25 hover:bg-white"}
                    `}
                    onClick={() => {
                      setActive(deck.id);
                      toast("Active deck changed", { description: deck.name });
                    }}
                  >
                    <div className="min-w-0">
                      <h3
                        className={`font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}
                      >
                        {deck.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {deck.characters.length} characters
                      </p>
                    </div>
                    {isActive ? (
                      <div className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                        Active
                      </div>
                    ) : (
                      <BookA className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
