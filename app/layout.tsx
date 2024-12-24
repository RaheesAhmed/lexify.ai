import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "./fonts/TTF/Satoshi-Variable.ttf",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lexify.ai - Legal AI Platform",
  description:
    "Next-generation legal document analysis and management platform powered by AI",
  keywords:
    "legal ai, document analysis, legal tech, artificial intelligence, law",
  authors: [{ name: "Lexify.ai" }],
  creator: "Lexify.ai",
  metadataBase: new URL("https://lexify.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lexify.ai",
    title: "Lexify.ai - Legal AI Platform",
    description:
      "Next-generation legal document analysis and management platform powered by AI",
    siteName: "Lexify.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lexify.ai - Legal AI Platform",
    description:
      "Next-generation legal document analysis and management platform powered by AI",
    creator: "@lexifyai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${satoshi.variable} font-satoshi antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
