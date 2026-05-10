import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "MapSync",
  description: "Dynamic GTA San Andreas map & GTA V Zone Selector Tool",
  icons: {
    icon: "/icon.png",
  },
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
        <Analytics />
      </body>
    </html>
  );
}
