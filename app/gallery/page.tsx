"use client";

import { useState, useCallback, Suspense } from "react";
import { useQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { FESTIVAL_CARDS_QUERY, CATEGORIES_QUERY } from "@/graphql/queries";
import { FestivalCard, FestivalCategory } from "@/types";
import { Navbar } from "@/components/user/Navbar";
import { FestivalCardGrid } from "@/components/user/FestivalCardGrid";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "", label: "All" },
  { value: "trending", label: "🔥 Trending" },
  { value: "popular", label: "⭐ Popular" },
  { value: "featured", label: "✨ Featured" },
];

function GalleryContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get("filter") || "");
  const debouncedSearch = useDebounce(search, 400);

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const { data, loading } = useQuery(FESTIVAL_CARDS_QUERY, {
    variables: {
      categoryId: selectedCategory || undefined,
      search: debouncedSearch || undefined,
      filter: selectedFilter || undefined,
      limit: 24,
    },
  });

  const cards: FestivalCard[] = data?.festivalCards || [];
  const categories: FestivalCategory[] = categoriesData?.categories || [];

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedCategory("");
    setSelectedFilter("");
  }, []);

  const hasFilters = search || selectedCategory || selectedFilter;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900"
          >
            Festival Card Gallery
          </motion.h1>
          <p className="mt-1 text-gray-500">Choose a template and make it yours</p>

          {/* Search */}
          <div className="mt-6 relative max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <SlidersHorizontal size={15} /> Filters
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                    Clear all
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Sort</p>
                <div className="space-y-1">
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setSelectedFilter(f.value)}
                      className={`w-full rounded-xl px-3 py-2 text-sm text-left transition-colors ${selectedFilter === f.value
                          ? "bg-violet-100 text-violet-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Category</p>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full rounded-xl px-3 py-2 text-sm text-left transition-colors ${!selectedCategory ? "bg-violet-100 text-violet-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full rounded-xl px-3 py-2 text-sm text-left transition-colors ${selectedCategory === cat.id ? "bg-violet-100 text-violet-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Cards Grid */}
          <main className="flex-1 min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {loading ? "Loading..." : `${cards.length} template${cards.length !== 1 ? "s" : ""} found`}
              </p>
            </div>
            <FestivalCardGrid cards={cards} loading={loading} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
