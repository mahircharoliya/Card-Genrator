"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { USERS_QUERY, UPDATE_USER_STATUS_MUTATION, DELETE_USER_MUTATION } from "@/graphql/queries";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { Search, Trash2, ShieldOff, ShieldCheck, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, refetch } = useQuery(USERS_QUERY, {
    variables: { search: debouncedSearch || undefined, limit: 50 },
  });
  const users: User[] = data?.users || [];

  const [updateStatus] = useMutation(UPDATE_USER_STATUS_MUTATION, {
    onCompleted: (d) => {
      toast(`User ${d.updateUserStatus.status === "ACTIVE" ? "activated" : "suspended"}`, "success");
      refetch();
    },
    onError: (e) => toast(e.message, "error"),
  });

  const [deleteUser] = useMutation(DELETE_USER_MUTATION, {
    onCompleted: () => { toast("User deleted", "success"); setDeleteConfirm(null); refetch(); },
    onError: (e) => toast(e.message, "error"),
  });

  const toggleStatus = (user: User) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    updateStatus({ variables: { id: user.id, status: newStatus } });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all registered users</p>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="skeleton h-4 rounded w-24" /></td>
                  ))}
                </tr>
              ))}
              {!loading && users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={user.status === "ACTIVE" ? "success" : "danger"}>{user.status}</Badge>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(user)}
                        title={user.status === "ACTIVE" ? "Suspend" : "Activate"}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === "ACTIVE"
                            ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                            : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {user.status === "ACTIVE" ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!loading && !users.length && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-sm">{search ? "No users match your search" : "No users registered yet"}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && users.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
            Showing {users.length} user{users.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete User?" size="sm">
        <p className="text-sm text-gray-600 mb-6">
          This will permanently delete the user account along with all their data, downloads, and business profile.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => deleteUser({ variables: { id: deleteConfirm } })}
          >
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
}
