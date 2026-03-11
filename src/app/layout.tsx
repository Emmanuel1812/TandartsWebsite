import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Tandartspraktijk Stralend | Hoogwaardige Mondzorg",
  description: "Premium tandartsenzorg voor het hele gezin. Maak eenvoudig online een afspraak.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${outfit.variable} antialiased`}>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
