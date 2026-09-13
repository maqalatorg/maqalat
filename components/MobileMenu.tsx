"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";

type NavItem = { label: string; href: string };

export function MobileMenu({ items, ariaLabel }: { items: NavItem[]; ariaLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="w-9 h-9 rounded-full grid place-items-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
      >
        {open ? (
          <X className="w-5 h-5 text-emerald-700 dark:text-emerald-300" strokeWidth={2.2} />
        ) : (
          <Menu className="w-5 h-5 text-emerald-700 dark:text-emerald-300" strokeWidth={2.2} />
        )}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-16 z-40 border-b border-slate-200/60 dark:border-slate-800/60 bg-[color-mix(in_srgb,var(--bg)_96%,transparent)] backdrop-blur-md shadow-lg"
        >
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
