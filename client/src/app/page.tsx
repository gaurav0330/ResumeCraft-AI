"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/components/provider/AuthProviderWrapper";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">AI-powered tailoring</div>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight heading-font">
                Tailor your resume to any job in seconds
              </h1>
              <p className="mt-4 text-muted-foreground text-lg max-w-prose">
                Upload your LaTeX resume and the job description. Our AI analyzes, optimizes, and aligns your experience with the role.
              </p>
              <div className="mt-8 flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Link href="/resume-tailor"><Button size="lg">Open Tailor</Button></Link>
                  </>
                ) : (
                  <>
                    <Link href="/resume-tailor"><Button size="lg">Get started</Button></Link>
                    <Link href="/signup"><Button size="lg" variant="outline">Create account</Button></Link>
                  </>
                )}
              </div>
            </div>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Clean, focused resume preview</CardTitle>
                <CardDescription>See changes instantly while you tailor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full rounded-lg bg-muted" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart matching</CardTitle>
              <CardDescription>Aligns your skills with the JD</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>LaTeX friendly</CardTitle>
              <CardDescription>Paste code or upload .tex</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>One-click export</CardTitle>
              <CardDescription>Preview and print to PDF</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </main>
  );
}
