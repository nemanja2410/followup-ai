import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Učitavamo moderni Inter font koji koriste vrhunski SaaS proizvodi
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FollowUp AI",
  description: "Automated AI follow-ups for beauty salons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}