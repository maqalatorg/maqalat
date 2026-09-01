import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {children}
    </div>
  );
}
