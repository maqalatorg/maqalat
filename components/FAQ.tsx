"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type FAQItem = { q: string; a: string };

export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!items?.length) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
        الأسئلة الشائعة
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-4 text-start"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-emerald-600 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.a}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
