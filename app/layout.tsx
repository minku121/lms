import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Library Management System",
  description: "A modern, secure, and responsive Library Management System developed by Minku Singh (23155134013).",
  keywords: ["Library Management System", "LMS", "Book Circulation", "Student Registry", "Next.js"],
  authors: [{ name: "Minku Singh" }],
  openGraph: {
    title: "Library Management System | Minku Singh",
    description: "A modern, secure, and responsive Library Management System. Manage books, students, and circulation seamlessly.",
    url: "https://lms-ia2k.vercel.app/",
    siteName: "LMS by Minku Singh",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Library Management System",
    description: "A modern, secure, and responsive Library Management System. Manage books, students, and circulation seamlessly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
