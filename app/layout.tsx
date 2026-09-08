import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blueprint — Turn Big Goals Into Actions",
  description:
    "Blueprint uses AI to break complex projects into tasks, assign them to your team, and keep everyone aligned. Modern task management for high-performing teams.",
  keywords: ["task management", "AI", "project planning", "kanban", "team collaboration"],
  openGraph: {
    title: "Blueprint — Turn Big Goals Into Actions",
    description:
      "AI-powered task management that turns big goals into actionable plans.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
