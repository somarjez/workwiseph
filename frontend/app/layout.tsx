import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin"], variable: "--font-newsreader", display: "swap",
  weight: ["400", "500", "600"], style: ["normal", "italic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WorkWise PH — Labor Market Analytics",
    template: "%s · WorkWise PH",
  },
  description:
    "Interactive analytics on Philippine labor: employment, underemployment, industry, education, pay, working hours, and forecasts, from PSA Labor Force Survey data (2005–2026).",
  applicationName: "WorkWise PH",
  keywords: ["Philippines", "labor", "employment", "underemployment", "PSA", "analytics", "dashboard"],
  openGraph: {
    title: "WorkWise PH — Labor Market Analytics",
    description: "Two decades of Philippine labor data, read closely.",
    type: "website",
    siteName: "WorkWise PH",
  },
  twitter: { card: "summary_large_image", title: "WorkWise PH", description: "Philippine labor market analytics" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#101418" },
  ],
};

// Applied before paint to avoid a light→dark flash on load.
const NO_FLASH = `(function(){try{var t=localStorage.getItem('ww_theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: NO_FLASH }} /></head>
      <body suppressHydrationWarning className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
