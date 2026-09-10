import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "../globals.css";

// Root layout returns { children } with no <html> so that [locale]/layout
// can own <html lang> for i18n while ISR still works. Non-locale routes
// (this admin area) must now provide their own <html> shell.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cairo.variable}>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
          {children}
        </div>
      </body>
    </html>
  );
}
