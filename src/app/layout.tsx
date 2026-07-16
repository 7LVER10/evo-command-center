import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVO — Command Center",
  description: "EVO B2B Intelligence Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
