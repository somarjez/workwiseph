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
    default: "WorkWise PH — Philippine Labor Market Outlook",
    template: "%s · WorkWise PH",
  },
  description:
    "Build a short-term Philippine labor market outlook with forecast direction, uncertainty, anomalies, and supporting PSA analysis.",
  applicationName: "WorkWise PH",
  authors: [{ name: "Jezreel Ramos", url: "https://github.com/somarjez" }],
  creator: "Jezreel Ramos",
  keywords: ["Philippines", "labor", "employment", "underemployment", "PSA", "forecasting", "analytics"],
  openGraph: {
    title: "WorkWise PH — Philippine Labor Market Outlook",
    description: "Read the Philippine labor market forward, with uncertainty kept visible.",
    type: "website",
    siteName: "WorkWise PH",
  },
  twitter: { card: "summary_large_image", title: "WorkWise PH", description: "Philippine labor market outlook" },
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
