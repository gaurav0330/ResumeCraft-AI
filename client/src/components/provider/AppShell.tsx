"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProviderWrapper";

// Theme toggle removed to enforce light theme

export default function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-base font-semibold heading-font">ResumeCraft AI</Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/resume-tailor" className="hover:text-foreground">Tailor</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/signup"><Button size="sm">Get started</Button></Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground truncate max-w-[12rem]" title={user?.email || user?.username}>
                  {user?.username || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </div>
            )}
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


