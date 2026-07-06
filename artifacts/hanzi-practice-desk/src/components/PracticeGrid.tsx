import React, { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { Button } from "@/components/ui/button";
import { Play, PenTool, CheckCircle2, Eraser, Loader2 } from "lucide-react";

interface PracticeGridProps {
  character: string;
  onQuizComplete?: (summary: { totalMistakes: number }) => void;
  size?: number;
}

export function PracticeGrid({ character, onQuizComplete, size = 300 }: PracticeGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState<"view" | "quiz">("view");

  useEffect(() => {
    if (!gridRef.current) return;
    
    setIsReady(false);
    
    // Clear previous
    gridRef.current.innerHTML = "";
    
    const writer = HanziWriter.create(gridRef.current, character, {
      width: size,
      height: size,
      padding: 16,
      strokeAnimationSpeed: 1.5,
      delayBetweenStrokes: 150,
      strokeColor: '#1c1917', // dark ink
      radicalColor: '#d97706', // gold
      outlineColor: '#e7e5e4', // very light gray outline
      drawingColor: '#1c1917',
      drawingWidth: 16,
      showOutline: true,
      onLoadCharDataSuccess: () => {
        setIsReady(true);
      }
    });

    writerRef.current = writer;

    return () => {
      // no explicit destroy needed for hanzi-writer, just clearing HTML works
    };
  }, [character, size]);

  // Touch prevention for iPad
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const preventTouch = (e: TouchEvent) => {
      e.preventDefault();
    };

    el.addEventListener("touchmove", preventTouch, { passive: false });
    return () => {
      el.removeEventListener("touchmove", preventTouch);
    };
  }, []);

  const handleAnimate = () => {
    if (!writerRef.current) return;
    writerRef.current.cancelQuiz();
    setMode("view");
    writerRef.current.showOutline();
    writerRef.current.animateCharacter();
  };

  const handleQuiz = () => {
    if (!writerRef.current) return;
    setMode("quiz");
    writerRef.current.quiz({
      onComplete: (summaryData) => {
        if (onQuizComplete) {
          onQuizComplete(summaryData);
        }
        setMode("view");
      }
    });
  };

  const handleClear = () => {
    if (!writerRef.current) return;
    writerRef.current.cancelQuiz();
    setMode("view");
    writerRef.current.showOutline();
    writerRef.current.showCharacter();
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      <div 
        className="relative bg-white rounded-2xl shadow-sm border border-border overflow-hidden touch-none-all group"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 hanzi-grid opacity-50 pointer-events-none" />
        <div ref={gridRef} className="absolute inset-0 cursor-crosshair touch-none-all" />
        
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleAnimate}
          className="rounded-full px-6 h-12"
          disabled={!isReady}
        >
          <Play className="w-4 h-4 mr-2" />
          Animate
        </Button>
        <Button 
          variant="default" 
          size="lg" 
          onClick={handleQuiz}
          className="rounded-full px-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          disabled={!isReady || mode === "quiz"}
        >
          <PenTool className="w-4 h-4 mr-2" />
          {mode === "quiz" ? "Tracing..." : "Practice"}
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleClear}
          className="rounded-full w-12 h-12 p-0"
          title="Clear"
          disabled={!isReady}
        >
          <Eraser className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
