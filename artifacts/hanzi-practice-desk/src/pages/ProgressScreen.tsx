import React from "react";
import { useProgress } from "@/hooks/use-data";
import type { Progress } from "@/lib/store";
import { isDue, daysUntilDue } from "@/lib/srs";
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Target,
  Clock,
} from "lucide-react";
import { BackupPanel } from "@/components/backup-panel";

export function ProgressScreen() {
  const { progress } = useProgress();

  const charStats = (
    Object.entries(progress) as [string, Progress[string]][]
  ).map(([char, data]) => ({
    char,
    ...data,
    accuracy:
      data.quizTotal > 0
        ? Math.round((data.quizScore / data.quizTotal) * 100)
        : 0,
    due: isDue(data),
    daysUntilDue: daysUntilDue(data),
  }));

  const totalCompleted = charStats.filter((s) => s.completed).length;
  const totalAttempts = charStats.reduce((sum, s) => sum + s.attempts, 0);
  const averageAccuracy =
    charStats.length > 0
      ? Math.round(
          charStats.reduce((sum, s) => sum + s.accuracy, 0) / charStats.length,
        )
      : 0;
  const dueForReview = charStats.filter((s) => s.completed && s.due);

  // Find difficult characters: low accuracy or high attempts without completion
  const difficultChars = charStats
    .filter((s) => s.attempts >= 3 && s.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  if (charStats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 app-surface-strong px-6 py-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium">No practice history yet</h2>
          <p className="text-muted-foreground">
            Start tracing characters on the Practice screen to see your stats
            here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="app-page">
        <div className="app-hero mb-6 md:mb-8">
          <p className="eyebrow mb-2">Momentum</p>
          <h1 className="section-title mb-2">Practice Progress</h1>
          <p className="section-copy max-w-2xl">
            Track consistency, spot reviews that are ready now, and quickly see
            which characters need another pass.
          </p>
        </div>

        <div className="mb-6 md:mb-8">
          <BackupPanel />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
          <div className="app-surface-strong p-4 md:p-6 flex flex-col justify-between">
            <div className="flex items-center text-muted-foreground mb-2 md:mb-4 text-xs md:text-base">
              <Target className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-primary shrink-0" />
              <span>Characters Mastered</span>
            </div>
            <div className="text-2xl md:text-4xl font-light tracking-tight">
              {totalCompleted}
            </div>
          </div>

          <div className="app-surface-strong p-4 md:p-6 flex flex-col justify-between">
            <div className="flex items-center text-muted-foreground mb-2 md:mb-4 text-xs md:text-base">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-primary shrink-0" />
              <span>Total Traces</span>
            </div>
            <div className="text-2xl md:text-4xl font-light tracking-tight">
              {totalAttempts}
            </div>
          </div>

          <div className="app-surface-strong p-4 md:p-6 flex flex-col justify-between">
            <div className="flex items-center text-muted-foreground mb-2 md:mb-4 text-xs md:text-base">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-primary shrink-0" />
              <span>Avg. Quiz Accuracy</span>
            </div>
            <div className="text-2xl md:text-4xl font-light tracking-tight">
              {averageAccuracy}%
            </div>
          </div>

          <div className="app-surface-strong p-4 md:p-6 flex flex-col justify-between">
            <div className="flex items-center text-muted-foreground mb-2 md:mb-4 text-xs md:text-base">
              <Clock className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-rose-400 shrink-0" />
              <span>Due for Review</span>
            </div>
            <div className="text-2xl md:text-4xl font-light tracking-tight">
              {dueForReview.length}
            </div>
          </div>
        </div>

        {dueForReview.length > 0 && (
          <div className="mb-6 md:mb-10">
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-rose-400" />
              Due for Review
            </h2>
            <div className="flex flex-wrap gap-3">
              {dueForReview.map((stat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3"
                >
                  <div className="font-serif text-2xl text-foreground">
                    {stat.char}
                  </div>
                  <div className="text-xs text-rose-600 font-medium">
                    Ready now
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {difficultChars.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-medium mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-destructive" />
              Needs Review
            </h2>
            <div className="app-surface-strong overflow-hidden">
              <div className="grid grid-cols-[1fr_2fr_2fr] p-4 bg-muted/30 border-b border-border text-sm font-medium text-muted-foreground">
                <div>Character</div>
                <div>Accuracy</div>
                <div>Attempts</div>
              </div>
              {difficultChars.map((stat, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_2fr_2fr] p-4 border-b border-border last:border-0 items-center"
                >
                  <div className="font-serif text-2xl text-foreground">
                    {stat.char}
                  </div>
                  <div className="text-destructive font-medium">
                    {stat.accuracy}%
                  </div>
                  <div className="text-muted-foreground">
                    {stat.attempts} times
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-medium mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Recent Practice
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {charStats
              .slice(-20)
              .reverse()
              .map((stat, idx) => (
                <div
                  key={idx}
                  className="app-surface-strong rounded-[20px] p-4 text-center hover:border-primary/30 transition-colors"
                >
                  <div className="font-serif text-3xl mb-3 text-foreground">
                    {stat.char}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Accuracy
                  </div>
                  <div
                    className={`font-medium ${stat.accuracy > 80 ? "text-primary" : "text-foreground"}`}
                  >
                    {stat.quizTotal > 0 ? `${stat.accuracy}%` : "N/A"}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
