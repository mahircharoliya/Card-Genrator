"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  CATEGORIES_QUERY,
  CREATE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  TOGGLE_CATEGORY_VISIBILITY_MUTATION,
} from "@/graphql/queries";
import { FestivalCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.coerce.number().default(0),
  isVisible: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const FESTIVAL_ICONS = ["🪔","🎨","🎀","🦚","🐘","💃","🇮🇳","🎄","🎉","🌙","🙏","🔱","👩","👨","🎂","💑","🎊","🏳️","⭐","🌟"];

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FestivalCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(CATEGORIES_QUERY, {
    variables: { includeHidden: true },
  });
  const categories: FestivalCategory[] = data?.categories || [];

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isVisible: true, order: 0 },
  });

  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY_MUTATION, {
    onCompleted: () => { toast("Category created!", "success"); setModalOpen(false); reset(); refetch(); },
    onError: (e) => toast(e.message, "error"),
  });

  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY_MUTATION, {
    onCompleted: () => { toast("Category updated!", "success"); setModalOpen(false); reset(); setEditingCategory(null); refetch(); },
    onError: (e) => toast(e.message, "error"),
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY_MUTATION, {
    onCompleted: () => { toast("Category deleted", "success"); setDeleteConfirm(null); refetch(); },
    onError: (e) => toast(e.message, "error"),
  });

  const [toggleVisibility] = useMutation(TOGGLE_CATEGORY_VISIBILITY_MUTATION, {
    onCompleted: () => { refetch(); },
    onError: (e) => toast(e.message, "error"),
  });

  const openCreate = () => {
    setEditingCategory(null);
    reset({ name: "", description: "", icon: "🎊", order: categories.length, isVisible: true });
    setModalOpen(true);
  };

  const openEdit = (cat: FestivalCategory) => {
    setEditingCategory(cat);
    reset({ name: cat.name, description: cat.description || "", icon: cat.icon || "🎊", order: cat.order, isVisible: cat.isVisible });
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editingCategory) {
      updateCategory({ variables: { id: editingCategory.id, input: data } });
    } else {
      createCategory({ variables: { input: data } });
    }
  };

  const selectedIcon = watch("icon");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage festival categories shown to users</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: categories.length, color: "bg-violet-50 text-violet-700" },
          { label: "Visible", value: categories.filter(c => c.isVisible).length, color: "bg-emerald-50 text-emerald-700" },
          { label: "Hidden", value: categories.filter(c => !c.isVisible).length, color: "bg-gray-50 text-gray-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl ${s.color} p-4 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Cards</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="skeleton h-4 rounded w-20" /></td>
                  ))}
                </tr>
              ))}
              {!loading && categories.map((cat, i) => (
                <motion.tr
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <GripVertical size={14} className="text-gray-300 cursor-grab" />
                      <span className="text-xl">{cat.icon || "🎊"}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                        {cat.description && <p className="text-xs text-gray-400 truncate max-w-xs">{cat.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{cat.cardCount ?? 0}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{cat.order}</td>
                  <td className="px-4 py-4">
                    <Badge variant={cat.isVisible ? "success" : "secondary"}>
                      {cat.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">{formatDate(cat.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleVisibility({ variables: { id: cat.id } })}
                        title={cat.isVisible ? "Hide" : "Show"}
                        className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                      >
                        {cat.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(cat.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!loading && !categories.length && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <p className="text-3xl mb-2">📂</p>
                    <p className="text-sm">No categories yet. Add your first one!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCategory(null); reset(); }}
        title={editingCategory ? "Edit Category" : "New Category"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Category Name" placeholder="e.g. Diwali" error={errors.name?.message} {...register("name")} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              rows={2}
              placeholder="Brief description..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <div className="flex flex-wrap gap-2">
              {FESTIVAL_ICONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setValue("icon", emoji)}
                  className={`text-xl p-1.5 rounded-lg transition-all ${selectedIcon === emoji ? "bg-violet-100 ring-2 ring-violet-500 scale-110" : "hover:bg-gray-100"}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Display Order" type="number" {...register("order")} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Visibility</label>
              <select
                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                {...register("isVisible")}
              >
                <option value="true">Visible</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setModalOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={creating || updating}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Category?" size="sm">
        <p className="text-sm text-gray-600 mb-6">This will permanently delete the category and may affect associated cards.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => deleteCategory({ variables: { id: deleteConfirm } })}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
