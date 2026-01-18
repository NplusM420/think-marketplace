import type { Metadata } from "next";
import { Inter, Goudy_Bookletter_1911 } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PrivyProvider } from "@/components/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const goudy = Goudy_Bookletter_1911({
  variable: "--font-goudy",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Think Marketplace",
    template: "%s | Think Marketplace",
  },
  description: "Discover apps, tools, and agents built on the Think protocol. A curated showcase of AI you own.",
  keywords: ["Think", "AI agents", "marketplace", "tools", "apps", "decentralized AI"],
  authors: [{ name: "Think Protocol" }],
  openGraph: {
    title: "Think Marketplace",
    description: "Discover apps, tools, and agents built on the Think protocol.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Think Marketplace",
    description: "Discover apps, tools, and agents built on the Think protocol.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${goudy.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyProvider>
            <a href="#main-content" className="skip-to-content">
              Skip to content
            </a>
            {children}
          </PrivyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
