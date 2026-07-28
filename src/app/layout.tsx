import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GreenLight | Preliminary Credit Decision",
  description:
    "A transparent prototype for instant preliminary lending decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
