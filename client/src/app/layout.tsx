import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ApolloProviderWrapper from "@/components/provider/ApolloProviderWrapper";
import ReduxProviderWrapper from "@/components/provider/ReduxProviderWrapper";
import { AuthProviderWrapper } from "@/components/provider/AuthProviderWrapper";
import { ThemeProvider } from "@/components/provider/ThemeProvider";
import AppShell from "@/components/provider/AppShell";
import NeonAuthHandler from "@/components/auth/NeonAuthHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Resume Tailor",
  description: "Personalized resume tailoring using AI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}><StackProvider app={stackClientApp}><StackTheme>
        <ThemeProvider>
          <AuthProviderWrapper>
            <NeonAuthHandler />
            <ApolloProviderWrapper>
              <ReduxProviderWrapper>
                <AppShell>{children}</AppShell>
              </ReduxProviderWrapper>
            </ApolloProviderWrapper>
          </AuthProviderWrapper>
        </ThemeProvider>
      </StackTheme></StackProvider></body>
    </html>
  );
}
