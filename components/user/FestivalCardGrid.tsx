"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FestivalCard } from "@/types";
import { Download, Eye, TrendingUp } from "lucide-react";

interface FestivalCardGridProps {
  cards: FestivalCard[];
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
      <div className="skeleton h-52 w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function FestivalCardGrid({ cards, loading }: FestivalCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🎨</div>
        <h3 className="text-lg font-semibold text-gray-700">No cards yet</h3>
        <p className="text-sm text-gray-400 mt-1">Templates will appear here once added</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="festival-card-hover"
        >
          <Link href={`/editor/${card.id}`}>
            <div className="group overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm cursor-pointer">
              {/* Card Image */}
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100">
                {card.thumbnail ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={card.thumbnail}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.parentElement?.classList.add("hidden");
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-5xl">🎉</span>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-sm font-bold">Customize Now →</span>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {card.isTrending && (
                    <span className="flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                      <TrendingUp size={10} /> Hot
                    </span>
                  )}
                  {card.isFeatured && (
                    <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Card Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{card.title}</h3>
                {card.category && (
                  <p className="text-xs text-gray-400 mt-0.5">{card.category.name}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Download size={11} /> {card.downloadCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={11} /> {card.viewCount}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
