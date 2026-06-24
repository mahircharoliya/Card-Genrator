"use client";

import { useQuery } from "@apollo/client";
import { DASHBOARD_STATS_QUERY } from "@/graphql/queries";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Users, Download, Image } from "lucide-react";

function BarGraph({ data, max }: { data: { label: string; value: number; color: string }[]; max: number }) {
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${(item.value / max) * 100}%`, opacity: 1 }}
          transition={{ delay: i * 0.1, type: "spring" }}
          className="flex flex-col items-center gap-1 flex-1"
        >
          <span className="text-xs font-bold text-gray-700">{item.value}</span>
          <div className="w-full rounded-t-lg" style={{ backgroundColor: item.color, minHeight: 4, flex: 1 }} />
          <span className="text-xs text-gray-500 text-center">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, loading } = useQuery(DASHBOARD_STATS_QUERY);
  const stats = data?.dashboardStats;

  const overviewData = [
    { label: "Users", value: stats?.totalUsers || 0, color: "#7C3AED", icon: Users, bg: "bg-violet-50 text-violet-700" },
    { label: "Cards", value: stats?.totalCards || 0, color: "#F59E0B", icon: Image, bg: "bg-amber-50 text-amber-700" },
    { label: "Downloads", value: stats?.totalDownloads || 0, color: "#10B981", icon: Download, bg: "bg-emerald-50 text-emerald-700" },
    { label: "Categories", value: stats?.totalCategories || 0, color: "#EC4899", icon: BarChart2, bg: "bg-pink-50 text-pink-700" },
  ];

  const barData = overviewData.map(d => ({ label: d.label, value: d.value, color: d.color }));
  const maxVal = Math.max(...barData.map(d => d.value), 1);

  // Simulated monthly trend data
  const monthlyData = [
    { label: "Jan", value: 12 },
    { label: "Feb", value: 28 },
    { label: "Mar", value: 45 },
    { label: "Apr", value: 38 },
    { label: "May", value: 62 },
    { label: "Jun", value: stats?.totalDownloads || 80 },
  ];
  const maxMonthly = Math.max(...monthlyData.map(d => d.value), 1);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Platform performance overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {overviewData.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm"
            >
              <div className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold ${item.bg} mb-3`}>
                <Icon size={12} /> {item.label}
              </div>
              <p className="text-3xl font-bold text-gray-900">{loading ? "—" : item.value.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp size={11} /> Growing
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Platform Overview Bar Chart */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6">Platform Overview</h2>
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
            </div>
          ) : (
            <BarGraph data={barData} max={maxVal} />
          )}
        </div>

        {/* Monthly Downloads Trend */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6">Download Trend (6 months)</h2>
          <BarGraph
            data={monthlyData.map(d => ({ ...d, color: "#7C3AED" }))}
            max={maxMonthly}
          />
        </div>
      </div>

      {/* Top Cards Table */}
      <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-5">Top Downloaded Cards</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton h-3.5 w-48 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(stats?.recentCards || []).slice(0, 5).map((card: { id: string; title: string; thumbnail?: string; downloadCount: number; category?: { name: string } }, idx: number) => (
              <div key={card.id} className="flex items-center gap-3 py-2">
                <span className="text-sm font-bold text-gray-400 w-5">#{idx + 1}</span>
                <div className="h-10 w-10 rounded-xl overflow-hidden bg-violet-100 flex-shrink-0">
                  {card.thumbnail ? (
                    <img src={card.thumbnail} alt={card.title} className="h-full w-full object-cover" />
                  ) : <div className="flex h-full items-center justify-center text-lg">🎉</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{card.title}</p>
                  <p className="text-xs text-gray-400">{card.category?.name}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 font-medium">
                  <Download size={13} className="text-violet-500" />
                  {card.downloadCount}
                </div>
              </div>
            ))}
            {!stats?.recentCards?.length && (
              <p className="text-sm text-center text-gray-400 py-8">No download data yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
