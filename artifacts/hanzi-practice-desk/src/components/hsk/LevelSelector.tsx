import React from "react";
import { Progress as ProgressBar } from "@/components/ui/progress";

interface LevelSelectorProps {
  levels: readonly number[];
  currentLevel: number;
  onSelect: (level: number) => void;
  getLevelStats: (level: number) => { completed: number; total: number };
}

export function LevelSelector({
  levels,
  currentLevel,
  onSelect,
  getLevelStats,
}: LevelSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {levels.map((level) => {
        const { completed, total } = getLevelStats(level);
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const isActive = level === currentLevel;
        return (
          <button
            key={level}
            onClick={() => onSelect(level)}
            className={`
              text-left p-4 rounded-[24px] border transition-all
              ${isActive ? "border-primary bg-primary text-primary-foreground shadow-[0_18px_35px_rgba(30,107,131,0.18)]" : "border-white/80 bg-white/76 hover:border-primary/25 hover:bg-white/88"}
            `}
          >
            <div
              className={`font-medium mb-1 ${isActive ? "text-primary-foreground" : "text-foreground"}`}
            >
              HSK {level}
            </div>
            <div
              className={`text-xs mb-3 ${isActive ? "text-primary-foreground/75" : "text-muted-foreground"}`}
            >
              {total > 0 ? `${completed} / ${total} chars` : "No data yet"}
            </div>
            <ProgressBar
              value={pct}
              className={`h-1.5 ${isActive ? "bg-white/20" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}
