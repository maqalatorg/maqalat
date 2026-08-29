"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, BookOpen } from "lucide-react";
import Link from "next/link";
import { SearchBar } from "./SearchBar";

export function SmartHero({
  stats,
  searchIndex,
}: {
  stats: { articles: number; clusters: number; sources: number };
  searchIndex: {
    slug: string;
    title: string;
    description: string;
    cluster: string;
    tags: string[];
    excerpt: string;
  }[];
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Animated emerald orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 -start-16 w-72 h-72 rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-16 -end-16 w-96 h-96 rounded-full bg-emerald-500/15 dark:bg-emerald-600/10 blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-16 sm:pt-24 pb-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-6 backdrop-blur"
        >
          <Sparkles className="w-3.5 h-3.5" />
          محتوى موثّق · مصادر رسمية · بلا فبركة
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight"
        >
          <span className="bg-gradient-to-l from-emerald-600 via-emerald-500 to-emerald-800 dark:from-emerald-400 dark:via-emerald-300 dark:to-emerald-500 bg-clip-text text-transparent">
            مقالات
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 text-xl sm:text-2xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          مرجعك <span className="text-emerald-700 dark:text-emerald-400">الحديث</span> لكل ما تحتاج معرفته
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
        >
          ابحث بكلمة واحدة — يجدها حتى لو الإملاء مختلف.
        </motion.p>

        {/* Central search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <div className="w-full max-w-xl">
            <SearchBar index={searchIndex} />
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400"
        >
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <strong className="text-slate-900 dark:text-slate-200">{stats.articles}</strong> مقال
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <strong className="text-slate-900 dark:text-slate-200">{stats.clusters}</strong> قسم
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            مصادر رسمية موثّقة
          </span>
        </motion.div>
      </div>
    </section>
  );
}
