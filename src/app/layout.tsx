import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import BottomNav from "@/components/BottomNav";
import OnboardingModal from "@/components/OnboardingModal";

export const metadata: Metadata = {
  title: "OWeek 2026",
  description: "Western University Orientation Week — Campus Discovery",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col overflow-hidden">
        <AppProvider>
          <OnboardingModal />
          {/* Main content — fills above fixed bottom nav */}
          <main className="relative flex-1 overflow-hidden pb-16">
            {children}
          </main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
