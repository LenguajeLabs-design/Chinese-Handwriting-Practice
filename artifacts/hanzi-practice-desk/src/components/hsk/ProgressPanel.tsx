import React from "react";
import { Progress as ProgressBar } from "@/components/ui/progress";

interface ProgressPanelProps {
  levels: readonly number[];
  getLevelStats: (level: number) => { completed: number; total: number };
}

export function ProgressPanel({ levels, getLevelStats }: ProgressPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
      <h3 className="font-medium">HSK Level Progress</h3>
      <div className="space-y-4">
        {levels.map(level => {
          const { completed, total } = getLevelStats(level);
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <div key={level}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium">HSK {level}</span>
                <span className="text-muted-foreground">{total > 0 ? `${completed} / ${total}` : "No data"}</span>
              </div>
              <ProgressBar value={pct} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
