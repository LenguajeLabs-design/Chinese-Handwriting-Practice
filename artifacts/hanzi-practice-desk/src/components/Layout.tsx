import React from "react";
import { Link, useLocation } from "wouter";
import { BookA, PenLine, BarChart3, GraduationCap } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: PenLine, label: "Practice" },
    { href: "/decks", icon: GraduationCap, label: "HSK Decks" },
    { href: "/custom", icon: BookA, label: "Custom Lists" },
    { href: "/progress", icon: BarChart3, label: "Progress" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-transparent">
      {/* Desktop / tablet sidebar */}
      <nav className="hidden md:flex md:w-72 lg:w-80 px-4 py-4 flex-col flex-shrink-0 z-10">
        <div className="app-surface h-full flex flex-col items-start px-4 py-5 lg:px-5 lg:py-6">
          <div className="mb-8 flex items-center justify-start w-full">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-serif text-xl font-bold shadow-sm">
              字
            </div>
            <div className="ml-3">
              <div className="font-semibold text-lg">Practice Desk</div>
              <div className="text-sm text-muted-foreground">
                Trace with calm, daily repetition.
              </div>
            </div>
          </div>

          <div className="mb-6 px-1">
            <p className="eyebrow mb-2">Daily Flow</p>
            <p className="section-copy">
              Pick a deck, trace each character, and return when reviews are
              due.
            </p>
          </div>

          <div className="flex-1 w-full space-y-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`
                    flex items-center w-full p-3 lg:px-4 lg:py-3 rounded-2xl cursor-pointer transition-all
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                    }
                  `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="w-full rounded-2xl border border-white/70 bg-white/70 p-4">
            <p className="text-sm font-medium text-foreground">
              Touch-friendly practice
            </p>
            <p className="mt-1 text-sm text-muted-foreground leading-6">
              The writing grid stays center stage, with the rest of the
              interface kept intentionally quiet.
            </p>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto w-full relative pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 rounded-[28px] border border-white/80 bg-white/88 shadow-[0_18px_40px_rgba(16,42,56,0.14)] backdrop-blur-xl flex items-stretch z-20 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={`
                flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer transition-colors
                ${isActive ? "text-primary" : "text-muted-foreground"}
              `}
              >
                <div
                  className={`rounded-2xl px-3 py-1.5 ${isActive ? "bg-primary/10" : "bg-transparent"}`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
