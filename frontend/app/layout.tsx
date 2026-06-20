import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin"], variable: "--font-newsreader", display: "swap",
  weight: ["400", "500", "600"], style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "WorkWise PH — Labor Market Analytics",
  description: "Philippine labor-market & underemployment analytics, 2005–2026.",
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
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 px-6 py-8 md:px-10 md:py-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
