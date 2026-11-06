import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPB IT Asset Management",
  description: "IT asset management for Selangor Properties",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
