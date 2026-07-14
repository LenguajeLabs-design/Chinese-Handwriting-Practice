import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BookA,
  PenLine,
  BarChart3,
  GraduationCap,
  Moon,
  SunMedium,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navItems = [
    { href: "/", icon: PenLine, label: "Practice" },
    { href: "/decks", icon: GraduationCap, label: "HSK Decks" },
    { href: "/custom", icon: BookA, label: "Custom Lists" },
    { href: "/progress", icon: BarChart3, label: "Progress" },
  ];

  useEffect(() => {
    const stored = window.localStorage.getItem("hanzi_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDarkMode(shouldUseDark);
  }, []);

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    window.localStorage.setItem("hanzi_theme", checked ? "dark" : "light");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-transparent">
      {/* Desktop / tablet sidebar */}
      <nav className="hidden md:flex md:w-60 lg:w-64 px-4 py-4 flex-col flex-shrink-0 z-10">
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
            <p className="text-sm leading-7 text-muted-foreground">
              Pick a deck, trace a few characters, and return when review is ready.
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

          <div className="w-full rounded-2xl border border-white/70 bg-white/70 p-4 mb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Night mode</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Softer contrast for evening sessions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SunMedium className="w-4 h-4 text-muted-foreground" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleThemeToggle}
                  aria-label="Toggle night mode"
                />
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-white/70 bg-white/70 p-4">
            <p className="text-sm font-medium text-foreground">
              Touch-friendly practice
            </p>
            <p className="mt-1 text-sm text-muted-foreground leading-6">
              The writing grid stays center stage, with everything else kept calm
              and easy to reach.
            </p>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto w-full relative pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed top-3 right-3 z-30">
        <button
          type="button"
          onClick={() => handleThemeToggle(!isDarkMode)}
          className="app-surface-strong h-12 w-12 rounded-full flex items-center justify-center shadow-[0_14px_28px_rgba(16,42,56,0.18)]"
          aria-label="Toggle night mode"
        >
          {isDarkMode ? (
            <SunMedium className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      <nav className="md:hidden fixed bottom-3 left-3 right-3 rounded-[28px] border border-white/80 bg-white/88 shadow-[0_18px_40px_rgba(16,42,56,0.14)] backdrop-blur-xl flex items-stretch z-20 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={`
                flex flex-col items-center justify-center gap-1 py-3 cursor-pointer transition-colors
                ${isActive ? "text-primary" : "text-muted-foreground"}
              `}
              >
                <div
                  className={`rounded-2xl px-3 py-2 ${isActive ? "bg-primary/10" : "bg-transparent"}`}
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
