"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { CATEGORIES_QUERY, FESTIVAL_CARDS_QUERY } from "@/graphql/queries";
import { FestivalCategory, FestivalCard } from "@/types";
import { Navbar } from "@/components/user/Navbar";
import { FestivalCardGrid } from "@/components/user/FestivalCardGrid";
import { CategoryPills } from "@/components/user/CategoryPills";
import { HeroSection } from "@/components/user/HeroSection";

export default function HomePage() {
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const { data: trendingData, loading: trendingLoading } = useQuery(FESTIVAL_CARDS_QUERY, {
    variables: { filter: "trending", limit: 8 },
  });
  const { data: recentData, loading: recentLoading } = useQuery(FESTIVAL_CARDS_QUERY, {
    variables: { limit: 8 },
  });

  const categories: FestivalCategory[] = categoriesData?.categories || [];
  const trendingCards: FestivalCard[] = trendingData?.festivalCards || [];
  const recentCards: FestivalCard[] = recentData?.festivalCards || [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 text-center">
            <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-700">Browse by Festival</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">All Festival Categories</h2>
            <p className="mt-2 text-gray-500">From Diwali to Christmas — find the perfect template for every occasion</p>
          </motion.div>
          <CategoryPills categories={categories} />
        </section>

        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <div><h2 className="text-2xl font-bold text-gray-900">🔥 Trending Cards</h2><p className="text-sm text-gray-500 mt-1">Most downloaded this week</p></div>
            <Link href="/gallery?filter=trending" className="text-sm font-semibold text-violet-600 hover:text-violet-700">View all →</Link>
          </div>
          <FestivalCardGrid cards={trendingCards} loading={trendingLoading} />
        </section>

        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <div><h2 className="text-2xl font-bold text-gray-900">✨ Freshly Added</h2><p className="text-sm text-gray-500 mt-1">New templates, just uploaded</p></div>
            <Link href="/gallery" className="text-sm font-semibold text-violet-600 hover:text-violet-700">View all →</Link>
          </div>
          <FestivalCardGrid cards={recentCards} loading={recentLoading} />
        </section>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-12 text-center text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/10" />
          </div>
          <div className="relative">
            <h2 className="text-4xl font-bold">Ready to create your festival card?</h2>
            <p className="mt-3 text-lg text-violet-200">Add your business logo and details in seconds. Download in HD quality.</p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register" className="rounded-xl bg-white px-8 py-3 font-bold text-violet-700 hover:bg-violet-50 transition-colors">Get Started Free</Link>
              <Link href="/gallery" className="rounded-xl border-2 border-white/50 px-8 py-3 font-bold text-white hover:bg-white/10 transition-colors">Browse Templates</Link>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center"><span className="text-white font-bold text-sm">F</span></div>
            <span className="font-bold text-gray-900">FestCard</span>
          </div>
          <p className="text-sm text-gray-500">© 2025 FestCard. Create beautiful festival cards for your business.</p>
        </div>
      </footer>
    </div>
  );
}
