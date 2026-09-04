import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Myntra Match Check",
  description: "Resolving purchase hesitation inside Myntra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${inter.className} bg-background min-h-screen sm:flex sm:items-center sm:justify-center sm:py-8`}>
        <div className="w-full h-[100dvh] sm:h-[844px] sm:max-w-[390px] bg-surface relative overflow-x-hidden overflow-y-auto sm:rounded-[40px] sm:shadow-[0_0_0_12px_#1e1e24,0_20px_40px_rgba(0,0,0,0.4)] transform sm:transform-gpu">
          {children}
        </div>
      </body>
    </html>
  );
}
