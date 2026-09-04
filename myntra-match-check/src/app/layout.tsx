import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

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
      <body className={`${plusJakartaSans.className} bg-[#0D0D0F] text-[#F2F2F2] min-h-screen flex justify-center selection:bg-[#FF3E6C]/30 selection:text-white pb-12`}>
        <div className="w-full max-w-[430px] min-h-screen bg-[#0D0D0F] flex flex-col border-x border-[#26262B]/60 shadow-2xl relative">
          {children}
        </div>
      </body>
    </html>
  );
}
