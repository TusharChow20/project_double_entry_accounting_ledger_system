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

export const metadata = {
  title: "Accounting Ledger System | Double-Entry Bookkeeping",
  description:
    "Professional double-entry accounting ledger system for managing transactions, generating financial reports including journal entries, balance sheets, and income statements.",
  keywords:
    "accounting, ledger, double-entry bookkeeping, financial reports, balance sheet, income statement, journal entries",
  authors: [{ name: "Tushar Chowdhury" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Accounting Ledger System",
    description: "Professional double-entry bookkeeping made simple",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
