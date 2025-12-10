import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WYLDCARD STATS PRIVATE LIMITED",
  description: "The ultimate platform for global sports events.",
  icons: {
    icon: 'https://res.cloudinary.com/dxgx75kwb/image/upload/v1765407837/logo_lxeacy.png',
    shortcut: 'https://res.cloudinary.com/dxgx75kwb/image/upload/v1765407837/logo_lxeacy.png',
    apple: 'https://res.cloudinary.com/dxgx75kwb/image/upload/v1765407837/logo_lxeacy.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

