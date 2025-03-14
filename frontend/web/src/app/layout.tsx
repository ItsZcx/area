import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar/Navbar";
import { Web3Provider } from "../components/auth/payment/Web3Provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AREA",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background `}>
        <Web3Provider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Navbar />
            <div className="pt-20 h-screen container mx-auto">{children}</div>
            <Toaster />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
