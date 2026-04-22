import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "San Andreas Map Interface",
  description: "Dynamic GTA San Andreas map UI for generating location coordinates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${figtree.variable} font-sans antialiased bg-[#050914] min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
