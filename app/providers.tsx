"use client";
import { ThemeProvider } from "next-themes";

export function Providers({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark";
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
