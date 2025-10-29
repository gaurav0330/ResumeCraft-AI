import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

import ApolloProviderWrapper from "@/components/provider/ApolloProviderWrapper";
import ReduxProviderWrapper from "@/components/provider/ReduxProviderWrapper";
import { AuthProviderWrapper } from "@/components/provider/AuthProviderWrapper";
import { ThemeProvider } from "@/components/provider/ThemeProvider";
import AppShell from "@/components/provider/AppShell";
import NeonAuthHandler from "@/components/auth/NeonAuthHandler";
import { ToastProvider } from "@/components/provider/ToastProvider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300","400","500","700"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["300","400","500","700"],
  display: "swap",
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
      <body className={`${roboto.variable} ${robotoMono.variable}`}><StackProvider app={stackClientApp}><StackTheme>
        <ThemeProvider>
          <AuthProviderWrapper>
            <ApolloProviderWrapper>
              <ToastProvider>
                <NeonAuthHandler />
                <ReduxProviderWrapper>
                  <AppShell>{children}</AppShell>
                </ReduxProviderWrapper>
              </ToastProvider>
            </ApolloProviderWrapper>
          </AuthProviderWrapper>
        </ThemeProvider>
      </StackTheme></StackProvider></body>
    </html>
  );
}
