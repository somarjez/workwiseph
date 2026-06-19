import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "WorkWise PH",
  description: "Labor Market Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
