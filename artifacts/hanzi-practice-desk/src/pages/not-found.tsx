import { Link } from "wouter";
import { Compass, Home, RotateCcw } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="app-surface-strong w-full max-w-xl p-8 md:p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-8 w-8" />
        </div>
        <p className="eyebrow mb-2">You took a wrong turn</p>
        <h1 className="text-3xl font-medium tracking-tight mb-3">
          This page is not available
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground leading-7">
          The link may be out of date, or the page may have moved. Head back to
          practice or return to your progress page and keep going.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <a className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95">
              <Home className="mr-2 h-4 w-4" />
              Go to Practice
            </a>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/70 px-6 text-sm font-medium text-foreground transition hover:bg-background"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
