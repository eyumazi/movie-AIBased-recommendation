"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Sparkles, Home, Wand2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function Header() {
  const pathname = usePathname();
  const { watchlist } = useWatchlist();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/mood-search", label: "Mood Search", icon: Wand2 },
    { href: "/watchlist", label: "Watchlist" },
    {
      href: "/recommendations",
      label: "AI Recs",
      icon: Sparkles,
      show: watchlist.length > 0,
    },
  ];

  return (
    <header className="bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-headline font-bold text-primary"
          >
            <Film className="w-6 h-6" />
            <span>MovieBoard</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <nav className="flex items-center gap-4 text-sm font-medium">
              {navItems.map(
                (item) =>
                  item.show !== false && (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground",
                        pathname === item.href && "text-foreground"
                      )}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.label}
                    </Link>
                  )
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
