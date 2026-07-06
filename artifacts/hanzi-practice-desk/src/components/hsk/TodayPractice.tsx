import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface TodayPracticeProps {
  onStart: () => void;
}

export function TodayPractice({ onStart }: TodayPracticeProps) {
  return (
    <div className="bg-primary text-primary-foreground rounded-2xl p-6 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium">Today's Practice</div>
          <div className="text-sm text-primary-foreground/80">A fresh mix of new characters and due reviews.</div>
        </div>
      </div>
      <Button
        onClick={onStart}
        variant="secondary"
        className="rounded-full h-11 px-6 shrink-0 bg-white text-primary hover:bg-white/90"
      >
        Start
      </Button>
    </div>
  );
}
