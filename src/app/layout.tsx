import type { Metadata, Viewport } from "next";
import { Merriweather, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import InstallPrompt from "@/components/InstallPrompt";

const merriweather = Merriweather({
  weight: ['400', '700', '900'],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Car Flip Intelligence",
  description: "Plataforma Premium de Due-Diligence Automotiva",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Car Flip",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d6efd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${merriweather.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <Header />
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}

