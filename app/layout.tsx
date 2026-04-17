import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Final Whistle Wealth — Admin",
  description: "School admin dashboard for Final Whistle Wealth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
