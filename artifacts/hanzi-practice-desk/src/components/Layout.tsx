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
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      {/* Desktop / tablet sidebar */}
      <nav className="hidden md:flex w-16 lg:w-64 border-r border-border bg-sidebar flex-col items-center lg:items-start py-6 flex-shrink-0 z-10 transition-all duration-300">
        <div className="lg:px-6 mb-8 flex items-center justify-center lg:justify-start w-full">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif text-lg font-bold">
            字
          </div>
          <span className="ml-3 font-semibold text-lg hidden lg:block">Practice Desk</span>
        </div>

        <div className="flex-1 w-full px-3 lg:px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center w-full p-3 lg:px-4 lg:py-3 rounded-xl cursor-pointer transition-colors
                  ${isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                `}>
                  <item.icon className="w-5 h-5 lg:mr-3" />
                  <span className="hidden lg:block">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto w-full relative pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-sidebar flex items-stretch z-20 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className={`
                flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer transition-colors
                ${isActive ? "text-primary" : "text-muted-foreground"}
              `}>
                <item.icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
