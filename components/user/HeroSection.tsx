"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Download, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 pt-20 pb-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full border-2 border-violet-200/50"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full border-2 border-indigo-200/50"
        />
        <div className="absolute top-20 left-1/4 h-3 w-3 rounded-full bg-violet-400/40" />
        <div className="absolute top-40 right-1/3 h-2 w-2 rounded-full bg-indigo-400/40" />
        <div className="absolute bottom-20 right-1/4 h-4 w-4 rounded-full bg-purple-400/40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 shadow-sm"
          >
            <Sparkles size={14} className="text-violet-600" />
            <span className="text-sm font-semibold text-violet-700">
              Create stunning festival cards in minutes
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl"
          >
            Festival Cards for
            <span className="block mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Your Business
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 max-w-2xl text-xl text-gray-500 leading-relaxed"
          >
            Add your company logo, name, and contact details to professionally designed
            festival greeting card templates. Download in HD. Share instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/gallery"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:shadow-violet-300 transition-all hover:-translate-y-0.5"
            >
              Browse Templates
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/register"
              className="rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-bold text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-all hover:-translate-y-0.5"
            >
              Create Free Account
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Users size={16} className="text-violet-500" />
              <span><strong className="text-gray-900">5,000+</strong> businesses trust FestCard</span>
            </div>
            <div className="flex items-center gap-2">
              <Download size={16} className="text-violet-500" />
              <span><strong className="text-gray-900">50,000+</strong> cards downloaded</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-violet-500" />
              <span><strong className="text-gray-900">200+</strong> festival templates</span>
            </div>
          </motion.div>
        </div>

        {/* Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center gap-4 overflow-hidden"
        >
          {[
            { bg: "from-orange-400 to-red-500", emoji: "🪔", label: "Diwali", tag: "TRENDING" },
            { bg: "from-green-400 to-emerald-500", emoji: "🎄", label: "Christmas", tag: "POPULAR" },
            { bg: "from-blue-400 to-violet-500", emoji: "🎉", label: "New Year", tag: "NEW" },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`relative hidden sm:flex flex-col items-center justify-center h-40 w-32 rounded-2xl bg-gradient-to-br ${card.bg} shadow-lg text-white cursor-pointer hover:scale-105 transition-transform`}
            >
              <div className="absolute top-2 right-2 text-xs font-bold bg-white/30 rounded-full px-2 py-0.5">
                {card.tag}
              </div>
              <span className="text-4xl">{card.emoji}</span>
              <span className="mt-2 text-sm font-bold">{card.label}</span>
              <div className="mt-1 h-6 w-14 rounded bg-white/30" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
