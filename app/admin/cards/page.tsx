"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  FESTIVAL_CARDS_QUERY,
  CATEGORIES_QUERY,
  CREATE_FESTIVAL_CARD_MUTATION,
  UPDATE_FESTIVAL_CARD_MUTATION,
  DELETE_FESTIVAL_CARD_MUTATION,
  PUBLISH_CARD_MUTATION,
} from "@/graphql/queries";
import { FestivalCard, FestivalCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, Send, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(2, "Title required"),
  categoryId: z.string().min(1, "Category required"),
  thumbnail: z.string().url("Must be a valid URL").or(z.string().startsWith("data:")),
  highResImage: z.string().url("Must be a valid URL").or(z.string().startsWith("data:")),
  primaryColor: z.string().default("#7C3AED"),
  secondaryColor: z.string().default("#FFFFFF"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  tags: z.string().optional(),
  logoX: z.coerce.number().default(50),
  logoY: z.coerce.number().default(50),
  logoWidth: z.coerce.number().default(150),
  logoHeight: z.coerce.number().default(150),
  businessNameX: z.coerce.number().default(50),
  businessNameY: z.coerce.number().default(220),
  businessNameFontSize: z.coerce.number().default(24),
  businessNameColor: z.string().default("#FFFFFF"),
  phoneX: z.coerce.number().default(50),
  phoneY: z.coerce.number().default(260),
  phoneColor: z.string().default("#FFFFFF"),
  emailX: z.coerce.number().default(50),
  emailY: z.coerce.number().default(290),
  emailColor: z.string().default("#FFFFFF"),
  websiteX: z.coerce.number().default(50),
  websiteY: z.coerce.number().default(320),
  websiteColor: z.string().default("#FFFFFF"),
  addressX: z.coerce.number().default(50),
  addressY: z.coerce.number().default(350),
  addressColor: z.string().default("#FFFFFF"),
  taglineX: z.coerce.number().default(50),
  taglineY: z.coerce.number().default(385),
  taglineColor: z.string().default("#FFFFFFCC"),
  fontFamily: z.string().default("Inter"),
  isTrending: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

export default function AdminCardsPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FestivalCard | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "positions">("basic");

  const { data, loading, refetch } = useQuery(FESTIVAL_CARDS_QUERY, {
    variables: { limit: 50 },
  });
  const { data: catData } = useQuery(CATEGORIES_QUERY, { variables: { includeHidden: true } });

  const cards: FestivalCard[] = data?.festivalCards || [];
  const categories: FestivalCategory[] = catData?.categories || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const refetchAndClose = () => { refetch(); setModalOpen(false); setEditingCard(null); reset(); };

  const [createCard, { loading: creating }] = useMutation(CREATE_FESTIVAL_CARD_MUTATION, {
    onCompleted: () => { toast("Card created!", "success"); refetchAndClose(); },
    onError: (e) => toast(e.message, "error"),
  });

  const [updateCard, { loading: updating }] = useMutation(UPDATE_FESTIVAL_CARD_MUTATION, {
    onCompleted: () => { toast("Card updated!", "success"); refetchAndClose(); },
    onError: (e) => toast(e.message, "error"),
  });

  const [deleteCard] = useMutation(DELETE_FESTIVAL_CARD_MUTATION, {
    onCompleted: () => { toast("Card deleted", "success"); setDeleteConfirm(null); refetch(); },
    onError: (e) => toast(e.message, "error"),
  });

  const [publishCard] = useMutation(PUBLISH_CARD_MUTATION, {
    onCompleted: () => { toast("Card published!", "success"); refetch(); },
    onError: (e) => toast(e.message, "error"),
  });

  const openCreate = () => { setEditingCard(null); reset(); setModalOpen(true); };

  const openEdit = (card: FestivalCard) => {
    setEditingCard(card);
    reset({
      ...card,
      tags: card.tags?.join(", ") || "",
      isTrending: card.isTrending,
      isFeatured: card.isFeatured,
    } as FormData);
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    const tagsArray = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const input = { ...data, tags: tagsArray };
    if (editingCard) {
      updateCard({ variables: { id: editingCard.id, input } });
    } else {
      createCard({ variables: { input } });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Festival Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage festival card templates</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus size={16} /> Add Card
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Cards", value: cards.length },
          { label: "Published", value: cards.filter(c => c.status === "PUBLISHED").length },
          { label: "Drafts", value: cards.filter(c => c.status === "DRAFT").length },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards Table */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Card</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Downloads</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="skeleton h-4 rounded w-20" /></td>
                  ))}
                </tr>
              ))}
              {!loading && cards.map((card, i) => (
                <motion.tr
                  key={card.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 flex-shrink-0">
                        {card.thumbnail ? (
                          <img src={card.thumbnail} alt={card.title} className="h-full w-full object-cover" />
                        ) : <div className="flex h-full items-center justify-center text-lg">🎉</div>}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 max-w-xs truncate">{card.title}</p>
                        <div className="flex gap-1 mt-0.5">
                          {card.isTrending && <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">🔥 Trending</span>}
                          {card.isFeatured && <span className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">✨ Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{card.category?.name || "—"}</td>
                  <td className="px-4 py-4">
                    <Badge variant={card.status === "PUBLISHED" ? "success" : "warning"}>{card.status}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Download size={13} /> {card.downloadCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">{formatDate(card.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/editor/${card.id}`} target="_blank">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors" title="Preview">
                          <Eye size={15} />
                        </button>
                      </Link>
                      {card.status === "DRAFT" && (
                        <button
                          onClick={() => publishCard({ variables: { id: card.id } })}
                          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Publish"
                        >
                          <Send size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(card)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(card.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!loading && !cards.length && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <p className="text-3xl mb-2">🎨</p>
                    <p className="text-sm">No cards yet. Upload your first template!</p>
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
        onClose={() => { setModalOpen(false); reset(); setEditingCard(null); }}
        title={editingCard ? "Edit Card" : "Add Festival Card"}
        size="xl"
      >
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
          {(["basic", "positions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all capitalize ${activeTab === tab ? "bg-white shadow text-violet-700" : "text-gray-500"}`}
            >
              {tab === "basic" ? "Basic Info" : "Element Positions"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {activeTab === "basic" && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <Input label="Card Title" placeholder="e.g. Diwali Special 2025" error={errors.title?.message} {...register("title")} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" {...register("categoryId")}>
                  <option value="">Select category...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
              </div>
              <Input label="Thumbnail URL" placeholder="https://..." error={errors.thumbnail?.message} {...register("thumbnail")} />
              <Input label="High-Res Image URL" placeholder="https://..." error={errors.highResImage?.message} {...register("highResImage")} />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                  <input type="color" className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" {...register("primaryColor")} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                  <input type="color" className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" {...register("secondaryColor")} />
                </div>
              </div>
              <Input label="Tags (comma separated)" placeholder="diwali, festival, lights" {...register("tags")} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" {...register("status")}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-gray-200 p-3">
                  <input type="checkbox" {...register("isTrending")} className="h-4 w-4 rounded text-violet-600" />
                  <span className="text-sm font-medium text-gray-700">Mark as Trending 🔥</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-gray-200 p-3">
                  <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 rounded text-violet-600" />
                  <span className="text-sm font-medium text-gray-700">Mark as Featured ✨</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "positions" && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
                💡 Define where each element appears on the card (in pixels from top-left). These positions overlay on the card template.
              </p>
              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Logo Position</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="X (left)" type="number" {...register("logoX")} />
                  <Input label="Y (top)" type="number" {...register("logoY")} />
                  <Input label="Width" type="number" {...register("logoWidth")} />
                  <Input label="Height" type="number" {...register("logoHeight")} />
                </div>
              </div>
              {[
                { label: "Business Name", xKey: "businessNameX", yKey: "businessNameY", colorKey: "businessNameColor", extra: <Input label="Font Size" type="number" {...register("businessNameFontSize")} /> },
                { label: "Phone", xKey: "phoneX", yKey: "phoneY", colorKey: "phoneColor" },
                { label: "Email", xKey: "emailX", yKey: "emailY", colorKey: "emailColor" },
                { label: "Website", xKey: "websiteX", yKey: "websiteY", colorKey: "websiteColor" },
                { label: "Address", xKey: "addressX", yKey: "addressY", colorKey: "addressColor" },
                { label: "Tagline", xKey: "taglineX", yKey: "taglineY", colorKey: "taglineColor" },
              ].map((field) => (
                <div key={field.label} className="rounded-xl border border-gray-200 p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">{field.label}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="X (left)" type="number" {...register(field.xKey as keyof FormData)} />
                    <Input label="Y (top)" type="number" {...register(field.yKey as keyof FormData)} />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Text Color</label>
                      <input type="color" className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" {...register(field.colorKey as keyof FormData)} />
                    </div>
                    {field.extra}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={creating || updating}>
              {editingCard ? "Save Changes" : "Create Card"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Card?" size="sm">
        <p className="text-sm text-gray-600 mb-6">This will permanently delete the card template. Downloads history will be removed.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={() => deleteCard({ variables: { id: deleteConfirm } })}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
