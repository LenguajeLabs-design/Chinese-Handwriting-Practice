import React from "react";
import { Link, useLocation } from "wouter";
import { BookA, PenLine, BarChart3, Settings2 } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: PenLine, label: "Practice" },
    { href: "/custom", icon: BookA, label: "Custom Lists" },
    { href: "/progress", icon: BarChart3, label: "Progress" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <nav className="w-16 md:w-64 border-r border-border bg-sidebar flex flex-col items-center md:items-start py-6 flex-shrink-0 z-10 transition-all duration-300">
        <div className="md:px-6 mb-8 flex items-center justify-center md:justify-start w-full">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif text-lg font-bold">
            字
          </div>
          <span className="ml-3 font-semibold text-lg hidden md:block">Practice Desk</span>
        </div>

        <div className="flex-1 w-full px-3 md:px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center w-full p-3 md:px-4 md:py-3 rounded-xl cursor-pointer transition-colors
                  ${isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                `}>
                  <item.icon className="w-5 h-5 md:mr-3" />
                  <span className="hidden md:block">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto w-full relative">
        {children}
      </main>
    </div>
  );
}
