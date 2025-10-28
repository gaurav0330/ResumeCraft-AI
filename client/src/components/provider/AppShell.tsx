"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
          <path d="M21.752 15.002A9.718 9.718 0 0 1 12 21.75a9.75 9.75 0 0 1 0-19.5.75.75 0 0 1 .673 1.06 8.25 8.25 0 0 0 9.08 11.69.75.75 0 0 1 0 1.002z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
          <path d="M12 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 12 2.25zm9 9.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5H20.25A.75.75 0 0 1 21 12zM6 12a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1 0-1.5H5.25A.75.75 0 0 1 6 12zm9.53 6.47a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 1 1 1.06-1.06l1.06 1.06zM10.59 5.53a.75.75 0 1 1-1.06-1.06L10.59 3.41a.75.75 0 0 1 1.06 1.06L10.59 5.53zM7.53 16.47 6.47 17.53a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06zM18.59 7.53a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06L18.59 7.53zM12 6.75A5.25 5.25 0 1 1 6.75 12 5.256 5.256 0 0 1 12 6.75z" />
        </svg>
      )}
    </Button>
  );
}

export default function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-base font-semibold">ResumeCraft AI</Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/resume-tailor" className="hover:text-foreground">Tailor</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link href="/signup"><Button size="sm">Get started</Button></Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 h-12 flex items-center justify-between">
          <span>© {new Date().getFullYear()} ResumeCraft AI</span>
          <div className="hidden md:flex items-center gap-4">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


