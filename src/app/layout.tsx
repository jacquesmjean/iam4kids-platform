import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "I AM 4 Kids", template: "%s | I AM 4 Kids" },
  description: "Helping kids discover the power of who they are.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
