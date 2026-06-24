"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FestivalCategory } from "@/types";

const categoryEmojis: Record<string, string> = {
  diwali: "🪔",
  holi: "🎨",
  "raksha-bandhan": "🎀",
  janmashtami: "🦚",
  "ganesh-chaturthi": "🐘",
  navratri: "💃",
  "republic-day": "🇮🇳",
  "independence-day": "🏳️",
  christmas: "🎄",
  "new-year": "🎉",
  eid: "🌙",
  "guru-purnima": "🙏",
  mahashivratri: "🔱",
  "mothers-day": "👩",
  "fathers-day": "👨",
  "womens-day": "👩‍🦯",
  birthday: "🎂",
  anniversary: "💑",
  default: "🎊",
};

interface CategoryPillsProps {
  categories: FestivalCategory[];
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  if (!categories.length) {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {["Diwali", "Holi", "Christmas", "New Year", "Birthday", "Anniversary"].map((name) => (
          <div key={name} className="skeleton h-12 w-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map((cat, i) => {
        const emoji = categoryEmojis[cat.slug] || categoryEmojis.default;
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link href={`/gallery?category=${cat.id}`}>
              <div className="group flex items-center gap-2 rounded-2xl border-2 border-gray-100 bg-white px-4 py-2.5 hover:border-violet-300 hover:bg-violet-50 transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm">
                <span className="text-xl">{emoji}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-violet-700 whitespace-nowrap">
                  {cat.name}
                </span>
                {cat.cardCount != null && cat.cardCount > 0 && (
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 group-hover:bg-violet-100 group-hover:text-violet-600">
                    {cat.cardCount}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
