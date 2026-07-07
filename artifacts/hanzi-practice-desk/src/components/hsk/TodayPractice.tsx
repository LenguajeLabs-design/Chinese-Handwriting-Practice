import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface TodayPracticeProps {
  onStart: () => void;
}

export function TodayPractice({ onStart }: TodayPracticeProps) {
  return (
    <div className="rounded-[28px] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_18px_45px_rgba(18,71,88,0.16)] text-primary-foreground bg-[linear-gradient(135deg,#1e6b83_0%,#245a72_58%,#152233_100%)]">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-white/14 flex items-center justify-center shrink-0 border border-white/10">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="eyebrow text-white/70 mb-2">Suggested Session</div>
          <div className="font-medium text-lg">Today&apos;s Practice</div>
          <div className="text-sm text-primary-foreground/80 max-w-md mt-1">
            A fresh mix of new characters and due reviews, ready to start
            without sorting through decks first.
          </div>
        </div>
      </div>
      <Button
        onClick={onStart}
        variant="secondary"
        className="rounded-full h-11 px-6 shrink-0 bg-white text-primary hover:bg-white/92 font-medium"
      >
        Start Practice
      </Button>
    </div>
  );
}
