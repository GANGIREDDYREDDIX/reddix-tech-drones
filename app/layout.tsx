import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "REDDIX TECH ENTERPRISES | Premium FPV Drones & Parts",
  description: "Elevate your flight with India's premier destination for high-performance FPV drones, parts, and accessories.",
  openGraph: {
    title: "REDDIX TECH ENTERPRISES | Premium FPV Drones",
    description: "Elevate your flight with India's premier destination for high-performance FPV drones, parts, and accessories.",
    url: "https://reddix-tech-drones.vercel.app", // Replace with your actual live domain later
    siteName: "REDDIX TECH ENTERPRISES",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REDDIX TECH ENTERPRISES | Premium FPV Drones",
    description: "Elevate your flight with India's premier destination for high-performance FPV drones, parts, and accessories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
