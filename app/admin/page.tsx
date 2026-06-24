"use client";

import { useQuery } from "@apollo/client";
import { DASHBOARD_STATS_QUERY } from "@/graphql/queries";
import { motion } from "framer-motion";
import { Users, Image, Download, FolderOpen, TrendingUp, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function StatCard({ label, value, icon: Icon, color, trend }: {
  label: string; value: number; icon: React.ElementType; color: string; trend?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp size={11} /> {trend}
            </p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data, loading } = useQuery(DASHBOARD_STATS_QUERY);
  const stats = data?.dashboardStats;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your FestCard platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-gradient-to-br from-violet-500 to-indigo-500"
          trend="+12% this month"
        />
        <StatCard
          label="Festival Cards"
          value={stats?.totalCards || 0}
          icon={Image}
          color="bg-gradient-to-br from-orange-500 to-amber-500"
          trend="5 new this week"
        />
        <StatCard
          label="Total Downloads"
          value={stats?.totalDownloads || 0}
          icon={Download}
          color="bg-gradient-to-br from-emerald-500 to-teal-500"
          trend="+890 today"
        />
        <StatCard
          label="Categories"
          value={stats?.totalCategories || 0}
          icon={FolderOpen}
          color="bg-gradient-to-br from-pink-500 to-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-violet-600" /> Recent Users
            </h2>
            <a href="/admin/users" className="text-xs text-violet-600 hover:text-violet-700 font-medium">View all →</a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3.5 w-32 rounded" />
                    <div className="skeleton h-3 w-48 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(stats?.recentUsers || []).map((user: { id: string; name: string; email: string; status: string; createdAt: string }) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={user.status === "ACTIVE" ? "success" : "danger"}>
                      {user.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              ))}
              {!stats?.recentUsers?.length && (
                <p className="text-sm text-gray-400 text-center py-4">No users yet</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Cards */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Image size={16} className="text-violet-600" /> Recent Cards
            </h2>
            <a href="/admin/cards" className="text-xs text-violet-600 hover:text-violet-700 font-medium">View all →</a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3.5 w-32 rounded" />
                    <div className="skeleton h-3 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(stats?.recentCards || []).map((card: { id: string; title: string; thumbnail: string; status: string; downloadCount: number; createdAt: string; category: { name: string } | null }) => (
                <div key={card.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 overflow-hidden flex-shrink-0">
                    {card.thumbnail ? (
                      <img src={card.thumbnail} alt={card.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl">🎉</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{card.title}</p>
                    <p className="text-xs text-gray-500">{card.category?.name || "—"} · {card.downloadCount} downloads</p>
                  </div>
                  <Badge variant={card.status === "PUBLISHED" ? "success" : "warning"}>
                    {card.status}
                  </Badge>
                </div>
              ))}
              {!stats?.recentCards?.length && (
                <p className="text-sm text-gray-400 text-center py-4">No cards yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
