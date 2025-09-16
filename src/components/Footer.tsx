"use client";

import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 mt-12">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="text-center md:text-left">
          <p className="font-medium">
            &copy; {year} MovieBoard. All rights reserved.
          </p>
          <p className="text-muted-foreground mt-1">
            Built by <span className="font-semibold">Eyuel M, Gedlie</span>.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/eyumazi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub profile of eyumazi"
          >
            <Github className="w-5 h-5" />
            <span className="hidden sm:inline">github.com/eyumazi</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
