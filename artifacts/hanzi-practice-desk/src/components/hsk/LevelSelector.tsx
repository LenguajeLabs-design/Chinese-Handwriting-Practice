import React from "react";
import { Progress as ProgressBar } from "@/components/ui/progress";

interface LevelSelectorProps {
  levels: readonly number[];
  currentLevel: number;
  onSelect: (level: number) => void;
  getLevelStats: (level: number) => { completed: number; total: number };
}

export function LevelSelector({ levels, currentLevel, onSelect, getLevelStats }: LevelSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {levels.map(level => {
        const { completed, total } = getLevelStats(level);
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const isActive = level === currentLevel;
        return (
          <button
            key={level}
            onClick={() => onSelect(level)}
            className={`
              text-left p-4 rounded-2xl border transition-all
              ${isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}
            `}
          >
            <div className={`font-medium mb-1 ${isActive ? "text-primary" : "text-foreground"}`}>
              HSK {level}
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              {total > 0 ? `${completed} / ${total} chars` : "No data yet"}
            </div>
            <ProgressBar value={pct} className="h-1.5" />
          </button>
        );
      })}
    </div>
  );
}
