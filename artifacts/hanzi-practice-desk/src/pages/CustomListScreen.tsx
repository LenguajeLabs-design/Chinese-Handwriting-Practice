import React, { useState } from "react";
import { useLocation } from "wouter";
import { useDecks } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookA, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Deck, Character } from "@/lib/store";

// Very basic fallback pinyin/meaning if missing (we would ideally have an API for this, 
// but since no backend is allowed, we just provide placeholders)
function generatePlaceholders(chars: string[]): Character[] {
  return chars.map(char => ({
    char,
    pinyin: "???",
    meaning: "Custom character"
  }));
}

export function CustomListScreen() {
  const [, setLocation] = useLocation();
  const { decks, activeDeckId, addDeck, setActive } = useDecks();
  const [inputText, setInputText] = useState("");
  const [deckName, setDeckName] = useState("");

  const handleCreateDeck = () => {
    if (!deckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }

    // Extract unique chinese characters
    const chars = Array.from(new Set(
      inputText.match(/[\u4e00-\u9fa5]/g) || []
    ));

    if (chars.length === 0) {
      toast.error("No valid Chinese characters found in input.");
      return;
    }

    const newDeck: Deck = {
      id: "deck_" + Date.now(),
      name: deckName.trim(),
      characters: generatePlaceholders(chars)
    };

    addDeck(newDeck);
    setActive(newDeck.id);
    toast.success(`Deck created with ${chars.length} characters.`);
    setLocation("/");
  };

  return (
    <div className="h-full p-6 md:p-12 max-w-4xl mx-auto overflow-y-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-medium tracking-tight mb-2">Custom Lists</h1>
        <p className="text-muted-foreground text-lg">Create new practice decks by pasting Chinese text.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-medium mb-6 flex items-center">
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
                  className="min-h-[200px] resize-none bg-muted/50 border-transparent focus-visible:bg-white text-lg"
                />
              </div>

              <Button 
                onClick={handleCreateDeck}
                className="w-full h-12 text-base rounded-xl"
                disabled={!inputText.trim()}
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
