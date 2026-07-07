import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useDecks } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookA, Plus, Trash2 } from "lucide-react";
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
    const unique = Array.from(new Set(
      inputText.match(/[\u4e00-\u9fa5]/g) ?? []
    ));
    return unique.map(char => {
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
    <div className="h-full p-4 sm:p-6 md:p-12 max-w-4xl mx-auto overflow-y-auto">
      <div className="mb-6 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-1 md:mb-2">Custom Lists</h1>
        <p className="text-muted-foreground text-sm md:text-lg">Create new practice decks by pasting Chinese text.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-12">
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white rounded-2xl border border-border p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-medium mb-4 md:mb-6 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-primary" />
              New Deck
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deckName">Deck Name</Label>
                <Input 
                  id="deckName" 
                  placeholder="e.g. HSK 2 Vocabulary" 
                  value={deckName}
                  onChange={e => setDeckName(e.target.value)}
                  className="bg-muted/50 border-transparent focus-visible:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deckInput">Chinese Text</Label>
                <Textarea 
                  id="deckInput" 
                  placeholder="Paste characters or full sentences here... Punctuation and non-Chinese characters will be ignored."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="min-h-[160px] resize-none bg-muted/50 border-transparent focus-visible:bg-white text-lg"
                />
              </div>

              {/* Live preview of detected characters */}
              {previewChars.length > 0 && (
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5 max-h-52 overflow-y-auto">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    {previewChars.length} characters detected
                  </p>
                  {previewChars.map(({ char, pinyin: py, meaning }) => (
                    <div key={char} className="flex items-center gap-3 py-1 border-b border-border/40 last:border-0">
                      <span className="font-serif text-xl w-7 text-center shrink-0">{char}</span>
                      <span className="text-sm text-primary font-medium w-20 shrink-0">{py}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {meaning || <span className="italic opacity-50">no meaning on file</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleCreateDeck}
                className="w-full h-12 text-base rounded-xl"
                disabled={previewChars.length === 0}
              >
                Create Practice Deck
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-medium flex items-center">
            <BookA className="w-5 h-5 mr-2 text-primary" />
            Your Decks
          </h2>
          
          <div className="space-y-3">
            {decks.map(deck => {
              const isActive = deck.id === activeDeckId;
              return (
                <div 
                  key={deck.id}
                  className={`
                    flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer
                    ${isActive ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/30"}
                  `}
                  onClick={() => {
                    setActive(deck.id);
                    toast("Active deck changed", { description: deck.name });
                  }}
                >
                  <div>
                    <h3 className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                      {deck.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {deck.characters.length} characters
                    </p>
                  </div>
                  {isActive && (
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Active
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
